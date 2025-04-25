# Deployment Guide

This guide provides best practices and strategies for deploying applications, plugins, and agents built with the Vibing AI SDK to production environments.

## Table of Contents

- [Deployment Overview](#deployment-overview)
- [Environment Preparation](#environment-preparation)
- [Build Process](#build-process)
- [Deployment Strategies](#deployment-strategies)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Logging](#monitoring-and-logging)
- [Common Deployment Platforms](#common-deployment-platforms)
- [Continuous Deployment](#continuous-deployment)

## Deployment Overview

Deploying Vibing AI SDK projects requires careful planning to ensure security, performance, and reliability. This guide covers the key aspects of a successful deployment strategy.

### Deployment Workflow

A typical deployment workflow consists of:

1. **Pre-deployment preparation**: Environment setup, configuration management
2. **Build process**: Creating optimized production builds
3. **Deployment**: Publishing to target environments
4. **Post-deployment verification**: Testing and monitoring

### Production Checklist

Before deploying to production, ensure you've completed these steps:

- [ ] Run all tests (unit, integration, e2e)
- [ ] Optimize bundle size
- [ ] Configure proper error handling
- [ ] Set up monitoring and logging
- [ ] Review security settings
- [ ] Check browser compatibility
- [ ] Verify performance benchmarks
- [ ] Document deployment process

## Environment Preparation

Proper environment setup is crucial for successful deployment.

### Environment Variables

Create environment-specific configuration files:

```typescript
// config/environment.ts
export const getEnvironmentConfig = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return {
        apiUrl: 'https://api.example.com',
        logLevel: 'error',
        featureFlags: {
          experimentalFeatures: false,
          analytics: true
        }
      };
    
    case 'staging':
      return {
        apiUrl: 'https://staging-api.example.com',
        logLevel: 'warn',
        featureFlags: {
          experimentalFeatures: true,
          analytics: true
        }
      };
      
    default: // development
      return {
        apiUrl: 'https://dev-api.example.com',
        logLevel: 'debug',
        featureFlags: {
          experimentalFeatures: true,
          analytics: false
        }
      };
  }
};

// Usage in app
import { createApp } from '@vibing-ai/sdk';
import { getEnvironmentConfig } from './config/environment';

const config = getEnvironmentConfig();
const app = createApp({
  // Basic config...
  apiUrl: config.apiUrl,
  logLevel: config.logLevel,
  features: config.featureFlags
});
```

### Secrets Management

Never hardcode sensitive information. Use environment variables and secrets management:

```bash
# .env.production (DO NOT commit this file to version control)
VIBING_API_KEY=your_api_key_here
AUTH_SECRET=your_auth_secret_here
```

```typescript
// src/config/secrets.ts
export const getSecrets = () => ({
  apiKey: process.env.VIBING_API_KEY || '',
  authSecret: process.env.AUTH_SECRET || '',
});

// Validate that all required secrets are present
export const validateSecrets = () => {
  const secrets = getSecrets();
  const missingSecrets = [];
  
  if (!secrets.apiKey) missingSecrets.push('VIBING_API_KEY');
  if (!secrets.authSecret) missingSecrets.push('AUTH_SECRET');
  
  if (missingSecrets.length > 0) {
    throw new Error(`Missing required secrets: ${missingSecrets.join(', ')}`);
  }
};
```

## Build Process

Creating optimized production builds is essential for performance and user experience.

### Build Configuration

Configure your build system for production:

```javascript
// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: '/',
  },
  optimization: {
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
        },
      },
    })],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the package name
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
  plugins: [
    ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : []),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
};
```

### Build Scripts

Add these scripts to your package.json:

```json
{
  "scripts": {
    "build": "NODE_ENV=production webpack",
    "build:analyze": "NODE_ENV=production ANALYZE=true webpack",
    "build:staging": "NODE_ENV=staging webpack"
  }
}
```

### SDK-Specific Optimizations

Optimize SDK imports to reduce bundle size:

```typescript
// AVOID: Importing the entire SDK
import * as VibingSDK from '@vibing-ai/sdk';

// BETTER: Import only what you need
import { createApp } from '@vibing-ai/sdk';
import { useMemory } from '@vibing-ai/sdk/common/memory';
```

Use the specialized entry points:

```typescript
// For app-only usage
import { createApp } from '@vibing-ai/sdk/app';

// For plugin-only usage
import { createPlugin } from '@vibing-ai/sdk/plugin';

// For agent-only usage
import { createAgent } from '@vibing-ai/sdk/agent';
```

## Deployment Strategies

Choose an appropriate deployment strategy based on your application needs.

### Static Deployment

For standalone apps without server components:

1. Build your application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` directory to a static hosting service.

3. Configure proper caching headers:
   ```
   # Example Netlify _headers file
   /assets/*
     Cache-Control: public, max-age=31536000, immutable
   /*.js
     Cache-Control: public, max-age=31536000, immutable
   /*.css
     Cache-Control: public, max-age=31536000, immutable
   /*
     Cache-Control: public, max-age=0, must-revalidate
   ```

### Server-Side Rendering

For applications requiring server rendering:

1. Set up a Node.js server:

```typescript
// server.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { renderToString } from 'react-dom/server';
import App from './src/App';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets
app.use('/static', express.static(path.resolve(__dirname, 'dist')));

// Server-side rendering
app.get('*', (req, res) => {
  const appHtml = renderToString(<App />);
  
  fs.readFile(path.resolve('./dist/index.html'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred');
    }
    
    return res.send(
      data.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
```

2. Deploy to a Node.js hosting service.

### Progressive Deployment

For safer production releases:

1. **Canary Releases**: Deploy to a small percentage of users first
2. **Feature Flags**: Control feature availability in production
3. **Blue-Green Deployment**: Maintain two identical environments

Example feature flag implementation:

```typescript
// src/features/index.ts
import { useMemory } from '@vibing-ai/sdk/common/memory';

export const useFeatureFlag = (featureName: string) => {
  const { data: flags } = useMemory<Record<string, boolean>>('feature-flags', {
    scope: 'global',
    fallback: {
      // Default flags
      newUi: false,
      betaFeatures: false,
      analytics: true
    }
  });
  
  return flags[featureName] || false;
};

// Usage in components
const MyComponent = () => {
  const showNewUi = useFeatureFlag('newUi');
  
  return showNewUi ? <NewUI /> : <LegacyUI />;
};
```

## Security Considerations

Security is critical for production deployment.

### Content Security Policy

Set up a Content Security Policy to prevent XSS attacks:

```html
<!-- In your HTML head -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; connect-src https://api.vibing.ai; img-src 'self' https://assets.vibing.ai; style-src 'self' 'unsafe-inline';">
```

Or via HTTP headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src https://api.vibing.ai; img-src 'self' https://assets.vibing.ai; style-src 'self' 'unsafe-inline';
```

### SDK Permission Hardening

Restrict permissions in production:

```typescript
// In development
const app = createApp({
  name: 'My App',
  version: '1.0.0',
  permissions: [
    'memory:read', 
    'memory:write', 
    'network:*', 
    'surface:*'
  ]
});

// In production
const app = createApp({
  name: 'My App',
  version: '1.0.0',
  permissions: [
    'memory:read', 
    'memory:write',
    'network:api.vibing.ai',  // Restrict network access
    'surface:conversation-card', // Only necessary surfaces
    'surface:context-panel'
  ]
});
```

### Secure Memory Usage

Encrypt sensitive data in memory:

```typescript
// src/user/profile.ts
import { useMemory } from '@vibing-ai/sdk/common/memory';

export const useUserProfile = () => {
  return useMemory('user-profile', {
    scope: 'global',
    encryption: true,  // Enable encryption for sensitive data
    persistance: 'session' // Don't persist beyond session
  });
};
```

## Performance Optimization

Optimize your application for the best user experience.

### Lazy Loading

Implement lazy loading for components and features:

```typescript
// src/app.tsx
import React, { lazy, Suspense } from 'react';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));

const App = () => {
  return (
    <div className="app">
      <Suspense fallback={<div>Loading...</div>}>
        {/* Conditionally render components */}
        {currentRoute === 'dashboard' && <Dashboard />}
        {currentRoute === 'settings' && <Settings />}
      </Suspense>
    </div>
  );
};
```

### Performance Monitoring

Implement Real User Monitoring (RUM):

```typescript
// src/monitoring/performance.ts
export const initPerformanceMonitoring = () => {
  if (process.env.NODE_ENV !== 'production') return;
  
  // Track page load performance
  window.addEventListener('load', () => {
    // Get performance metrics
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domReadyTime = perfData.domComplete - perfData.domLoading;
    
    // Report metrics
    reportMetric('page_load_time', pageLoadTime);
    reportMetric('dom_ready_time', domReadyTime);
  });
  
  // Track SDK performance
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('@vibing-ai/sdk')) {
          reportMetric('sdk_operation_time', entry.duration, {
            operation: entry.name
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
};

const reportMetric = (name, value, tags = {}) => {
  // Send to your monitoring service
  fetch('https://metrics.example.com/report', {
    method: 'POST',
    body: JSON.stringify({
      name,
      value,
      timestamp: Date.now(),
      tags
    }),
  });
};
```

## Monitoring and Logging

Set up comprehensive monitoring for production applications.

### Structured Logging

Implement structured logging:

```typescript
// src/common/logging.ts
import { createLogger } from '@vibing-ai/sdk/common/logging';

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  structured: true,
  transport: process.env.NODE_ENV === 'production' 
    ? 'remote' // Send to remote logging service
    : 'console', // Log to console in development
  remoteConfig: {
    endpoint: 'https://logs.example.com/ingest',
    apiKey: process.env.LOGGING_API_KEY
  }
});

// Usage
import { logger } from './common/logging';

try {
  // Some operation
} catch (error) {
  logger.error('Operation failed', {
    operation: 'processData',
    userId: currentUser.id,
    error: error.message
  });
}
```

### Error Tracking

Implement error tracking:

```typescript
// src/common/errors.ts
import { initErrorTracking } from '@vibing-ai/sdk/common/errors';

export const setupErrorTracking = () => {
  if (process.env.NODE_ENV !== 'production') return;
  
  initErrorTracking({
    dsn: 'https://your-project@sentry.io/123456',
    environment: process.env.DEPLOYMENT_ENV || 'production',
    tracesSampleRate: 0.2,
    beforeSend(event) {
      // Scrub sensitive data
      if (event.request && event.request.headers) {
        delete event.request.headers.Authorization;
      }
      return event;
    }
  });
};
```

### Health Checks

Implement health checks for your application:

```typescript
// src/health/index.ts
export const registerHealthChecks = (app) => {
  app.registerHealthCheck('api', async () => {
    try {
      const response = await fetch('https://api.example.com/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  });
  
  app.registerHealthCheck('memory', () => {
    try {
      const test = { test: true };
      localStorage.setItem('health_check', JSON.stringify(test));
      const result = localStorage.getItem('health_check');
      localStorage.removeItem('health_check');
      return result === JSON.stringify(test);
    } catch (error) {
      return false;
    }
  });
};
```

## Common Deployment Platforms

Deployment instructions for popular platforms.

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[context.production]
  environment = { NODE_ENV = "production" }
  
[context.staging]
  environment = { NODE_ENV = "staging" }

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Vercel

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### AWS Amplify

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Docker

```dockerfile
# Dockerfile
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Continuous Deployment

Set up continuous deployment for streamlined releases.

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      env:
        NODE_ENV: production
        
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      with:
        args: deploy --dir=dist --prod
```

### CircleCI

```yaml
# .circleci/config.yml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/node:16.13
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package.json" }}
      - run: npm ci
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
      - run: npm test
      - run: npm run build
      - persist_to_workspace:
          root: .
          paths:
            - dist
  
  deploy:
    docker:
      - image: cimg/node:16.13
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Deploy to Production
          command: |
            npm install -g firebase-tools
            firebase deploy --token=$FIREBASE_TOKEN

workflows:
  version: 2
  build-and-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: main
```

This deployment guide provides a comprehensive framework for deploying Vibing AI SDK projects to production environments. For platform-specific details or advanced deployment scenarios, consult the relevant platform documentation or reach out to our support team. 