# Troubleshooting Guide

This guide provides solutions for common issues you might encounter when working with the Vibing AI SDK.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Initialization Problems](#initialization-problems)
- [Permission Issues](#permission-issues)
- [Memory System Problems](#memory-system-problems)
- [Surface Rendering Issues](#surface-rendering-issues)
- [Network Errors](#network-errors)
- [Performance Problems](#performance-problems)
- [TypeScript Errors](#typescript-errors)
- [Build and Bundling Issues](#build-and-bundling-issues)
- [Common Error Codes](#common-error-codes)
- [Debugging Tools](#debugging-tools)

## Installation Issues

### Package Not Found

**Problem**: npm or yarn can't find the Vibing AI SDK package.

**Solution**:
1. Check that you're using the correct package name: `@vibing-ai/sdk`
2. Ensure you have access to the package registry:
   ```bash
   npm config get registry
   # Should be https://registry.npmjs.org/ or your private registry
   ```
3. If using a private registry, ensure you're authenticated:
   ```bash
   npm login
   ```

### Version Conflicts

**Problem**: Dependencies have conflicting version requirements.

**Solution**:
1. Check for peer dependency conflicts:
   ```bash
   npm ls @vibing-ai/sdk
   ```
2. Resolve using resolutions in package.json (yarn) or overrides (npm):
   ```json
   {
     "resolutions": {
       "@vibing-ai/sdk": "1.0.0"
     }
   }
   ```
3. Update related packages together:
   ```bash
   npm install @vibing-ai/sdk@latest @vibing-ai/block-kit@latest
   ```

### Failed Installation

**Problem**: Installation fails with errors.

**Solution**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Try installing with the `--verbose` flag to see detailed errors:
   ```bash
   npm install @vibing-ai/sdk --verbose
   ```
3. Check for Node.js version compatibility:
   ```bash
   node -v
   # Should be >=14.0.0
   ```

## Initialization Problems

### App Fails to Initialize

**Problem**: The app doesn't initialize properly, with or without errors.

**Solution**:
1. Check your initialization code:
   ```typescript
   // Ensure it follows this pattern
   const app = createApp({
     name: 'My App',
     version: '1.0.0',
     // other required fields
   });
   
   app.onInitialize(() => {
     // Initialization logic
   });
   ```
2. Look for initialization errors in the console.
3. Verify you're calling the appropriate methods in the right order.
4. Add detailed error handling:
   ```typescript
   app.onInitialize(async () => {
     try {
       // Initialization logic
     } catch (error) {
       console.error('Initialization failed:', error);
       // Handle or report the error
     }
   });
   ```

### Plugin Registration Issues

**Problem**: Plugins aren't registering correctly with the host application.

**Solution**:
1. Verify plugin configuration:
   ```typescript
   const plugin = createPlugin({
     name: 'My Plugin',
     version: '1.0.0',
     // other required fields
   });
   ```
2. Check plugin compatibility with the host app (version compatibility).
3. Verify the plugin registration process:
   ```typescript
   // In host app
   app.registerPlugin(plugin);
   
   // Verify registration
   console.log(app.getRegisteredPlugins());
   ```
4. Enable debug mode for more detailed logs:
   ```typescript
   const plugin = createPlugin({
     name: 'My Plugin',
     version: '1.0.0',
     debug: true
   });
   ```

## Permission Issues

### Permission Denied

**Problem**: Operations fail with permission denied errors.

**Solution**:
1. Check that your app requests the necessary permissions:
   ```typescript
   const app = createApp({
     name: 'My App',
     version: '1.0.0',
     permissions: [
       'memory:read',
       'memory:write',
       'network:api.example.com'
     ]
   });
   ```
2. Implement proper permission requesting for runtime permissions:
   ```typescript
   import { usePermissions } from '@vibing-ai/sdk/common/permissions';
   
   function MyComponent() {
     const { request, check } = usePermissions();
     
     const requestAccess = async () => {
       const result = await request({
         type: 'memory',
         access: 'write',
         purpose: 'Save your preferences'
       });
       
       if (result.granted) {
         // Proceed with operation
       } else {
         // Handle denial
       }
     };
     
     // Check before operations
     if (!check({ type: 'memory', access: 'write' })) {
       return <button onClick={requestAccess}>Request Access</button>;
     }
     
     return <div>Authorized content</div>;
   }
   ```
3. Handle permission denials gracefully:
   ```typescript
   try {
     // Operation that might fail due to permissions
   } catch (error) {
     if (error instanceof PermissionError) {
       // Show permission request UI
     } else {
       // Handle other errors
     }
   }
   ```

### Permission Request Not Showing

**Problem**: Permission request dialogs aren't appearing.

**Solution**:
1. Check that you're requesting permissions using the correct API:
   ```typescript
   const { request } = usePermissions();
   await request({ type: 'memory', access: 'write' });
   ```
2. Verify the permission request is triggered by user interaction (some browsers require this).
3. Check for errors in the console related to permission requests.
4. Add error handling to permission requests:
   ```typescript
   try {
     const result = await request({ type: 'memory', access: 'write' });
     // Handle result
   } catch (error) {
     console.error('Permission request failed:', error);
   }
   ```

## Memory System Problems

### Data Not Persisting

**Problem**: Data saved with the memory system doesn't persist between sessions.

**Solution**:
1. Check that you're using the correct persistence option:
   ```typescript
   const { data, set } = useMemory('user-preferences', {
     scope: 'global',
     persistence: 'persistent' // Not 'session'
   });
   ```
2. Verify the data is being set correctly:
   ```typescript
   set({ theme: 'dark' });
   console.log('Data after set:', data);
   ```
3. Check for storage quota issues (browser storage limits).
4. Implement error handling for storage operations:
   ```typescript
   try {
     set(newData);
   } catch (error) {
     console.error('Failed to save data:', error);
     // Check for QuotaExceededError
     if (error.name === 'QuotaExceededError') {
       // Handle storage quota exceeded
     }
   }
   ```

### Memory Data Not Syncing

**Problem**: Memory data isn't syncing between components or instances.

**Solution**:
1. Ensure you're using the same memory key across components:
   ```typescript
   // Component A
   const { data: prefsA } = useMemory('user-preferences');
   
   // Component B
   const { data: prefsB } = useMemory('user-preferences');
   ```
2. Check that synchronization is enabled:
   ```typescript
   const { data } = useMemory('user-preferences', {
     sync: true
   });
   ```
3. Verify that components are subscribed to changes:
   ```typescript
   const { data, subscribe } = useMemory('user-preferences');
   
   useEffect(() => {
     const unsubscribe = subscribe((newData) => {
       console.log('Memory updated:', newData);
     });
     
     return unsubscribe;
   }, [subscribe]);
   ```
4. Use the refresh method to manually sync if needed:
   ```typescript
   const { data, refresh } = useMemory('user-preferences');
   
   // Force refresh from storage
   const handleRefresh = () => {
     refresh();
   };
   ```

## Surface Rendering Issues

### Components Not Rendering

**Problem**: UI components aren't rendering properly in surfaces.

**Solution**:
1. Check that you're using the correct surface API:
   ```typescript
   // For conversation cards
   plugin.onConversationCard(({ container }) => {
     // Render into container
     container.innerHTML = '<div>Card content</div>';
     // Or with a framework
     render(<CardComponent />, container);
   });
   ```
2. Verify the surface is available and supported in the current context.
3. Check for errors during rendering:
   ```typescript
   plugin.onConversationCard(({ container }) => {
     try {
       render(<CardComponent />, container);
     } catch (error) {
       console.error('Rendering failed:', error);
       // Fallback rendering
       container.innerHTML = '<div>Unable to render card</div>';
     }
   });
   ```
4. Add a fallback surface if the preferred one isn't available:
   ```typescript
   if (surfaces.hasSupport('conversation-card')) {
     plugin.onConversationCard(/* ... */);
   } else if (surfaces.hasSupport('context-panel')) {
     plugin.onContextPanel(/* ... */);
   }
   ```

### Styling Issues

**Problem**: Styles aren't applying correctly to surfaces.

**Solution**:
1. Use scoped styles to prevent conflicts:
   ```typescript
   plugin.onConversationCard(({ container }) => {
     // Create a style element
     const style = document.createElement('style');
     style.textContent = `
       .my-plugin-card {
         font-family: sans-serif;
         color: #333;
       }
     `;
     container.appendChild(style);
     
     // Apply the scoped class
     const content = document.createElement('div');
     content.className = 'my-plugin-card';
     content.textContent = 'Card content';
     container.appendChild(content);
   });
   ```
2. Use CSS-in-JS solutions with unique identifiers:
   ```typescript
   import { css } from '@emotion/css';
   
   plugin.onConversationCard(({ container }) => {
     const cardClass = css`
       font-family: sans-serif;
       color: #333;
     `;
     
     const content = document.createElement('div');
     content.className = cardClass;
     content.textContent = 'Card content';
     container.appendChild(content);
   });
   ```
3. Check for style inheritance and overrides from the host application.
4. Use the theming API if available:
   ```typescript
   import { useTheme } from '@vibing-ai/sdk/common/theme';
   
   function MyComponent() {
     const theme = useTheme();
     
     return (
       <div style={{ 
         color: theme.textColor,
         background: theme.backgroundColor 
       }}>
         Themed content
       </div>
     );
   }
   ```

## Network Errors

### API Request Failures

**Problem**: Requests to external APIs are failing.

**Solution**:
1. Check that your app has the correct network permissions:
   ```typescript
   const app = createApp({
     // ...
     permissions: [
       'network:api.example.com'
     ]
   });
   ```
2. Verify API endpoint URLs and credentials:
   ```typescript
   const fetchData = async () => {
     try {
       const response = await fetch('https://api.example.com/data', {
         headers: {
           'Authorization': `Bearer ${apiKey}`
         }
       });
       
       if (!response.ok) {
         throw new Error(`API error: ${response.status}`);
       }
       
       return await response.json();
     } catch (error) {
       console.error('API request failed:', error);
       // Handle or report the error
     }
   };
   ```
3. Implement proper error handling and retries:
   ```typescript
   import { retry } from '@vibing-ai/sdk/common/errors';
   
   const fetchWithRetry = async () => {
     return retry(
       async () => {
         const response = await fetch('https://api.example.com/data');
         if (!response.ok) throw new Error(`API error: ${response.status}`);
         return await response.json();
       },
       {
         maxAttempts: 3,
         retryDelay: 1000,
         shouldRetry: (error) => {
           // Retry on network errors or 5xx status codes
           return error instanceof NetworkError || 
                  (error.status && error.status >= 500);
         }
       }
     );
   };
   ```
4. Check for CORS issues if applicable:
   ```typescript
   const fetchData = async () => {
     try {
       const response = await fetch('https://api.example.com/data', {
         mode: 'cors',
         credentials: 'include'
       });
       // Process response
     } catch (error) {
       if (error.message.includes('CORS')) {
         console.error('CORS error detected:', error);
         // Handle CORS specifically
       } else {
         console.error('Other API error:', error);
       }
     }
   };
   ```

### WebSocket Connection Issues

**Problem**: WebSocket connections are failing or disconnecting.

**Solution**:
1. Implement proper connection handling:
   ```typescript
   const connectWebSocket = () => {
     const ws = new WebSocket('wss://api.example.com/ws');
     
     ws.onopen = () => {
       console.log('WebSocket connected');
     };
     
     ws.onclose = (event) => {
       console.log(`WebSocket closed: ${event.code} ${event.reason}`);
       // Reconnect if needed
       if (event.code !== 1000) { // Normal closure
         setTimeout(connectWebSocket, 5000);
       }
     };
     
     ws.onerror = (error) => {
       console.error('WebSocket error:', error);
     };
     
     return ws;
   };
   ```
2. Check for network restrictions or proxies that might block WebSocket connections.
3. Implement a fallback mechanism for environments that don't support WebSockets:
   ```typescript
   const createConnection = () => {
     if ('WebSocket' in window) {
       return connectWebSocket();
     } else {
       console.log('WebSockets not supported, using polling fallback');
       return createPollingConnection();
     }
   };
   ```

## Performance Problems

### Slow Rendering

**Problem**: UI components render slowly or cause jank.

**Solution**:
1. Implement virtualization for large lists:
   ```typescript
   import { VirtualList } from '@vibing-ai/sdk/components';
   
   function MyListComponent({ items }) {
     return (
       <VirtualList
         items={items}
         height={400}
         itemHeight={40}
         renderItem={(item) => (
           <div className="list-item">{item.name}</div>
         )}
       />
     );
   }
   ```
2. Memoize expensive computations and components:
   ```typescript
   import { useMemo, memo } from 'react';
   
   // Memoize expensive computation
   const processedData = useMemo(() => {
     return expensiveProcess(data);
   }, [data]);
   
   // Memoize component
   const ListItem = memo(function ListItem({ item }) {
     return <div>{item.name}</div>;
   });
   ```
3. Implement proper loading states and progressive rendering:
   ```typescript
   function MyComponent() {
     const [isLoading, setIsLoading] = useState(true);
     const [data, setData] = useState([]);
     
     useEffect(() => {
       fetchData()
         .then(result => {
           setData(result);
           setIsLoading(false);
         })
         .catch(error => {
           console.error(error);
           setIsLoading(false);
         });
     }, []);
     
     if (isLoading) {
       return <LoadingIndicator />;
     }
     
     return <DataDisplay data={data} />;
   }
   ```
4. Profile and optimize render performance:
   ```javascript
   // In development
   import { createProfiler } from '@vibing-ai/sdk/development';
   
   const profiler = createProfiler();
   profiler.startTracking();
   
   // Later
   const metrics = profiler.getMetrics();
   console.log('Render metrics:', metrics);
   ```

### Memory Leaks

**Problem**: The application uses increasing amounts of memory over time.

**Solution**:
1. Clean up event listeners and subscriptions:
   ```typescript
   useEffect(() => {
     const subscription = subscribe(handleEvent);
     
     return () => {
       subscription.unsubscribe();
     };
   }, [subscribe, handleEvent]);
   ```
2. Dispose of resources in cleanup handlers:
   ```typescript
   app.onCleanup(() => {
     // Dispose resources
     destroyWorkers();
     closeConnections();
     clearCaches();
   });
   ```
3. Avoid creating closures that capture large objects:
   ```typescript
   // Bad
   const handleClick = () => {
     // This captures the entire largeData object in the closure
     console.log(largeData.someProperty);
   };
   
   // Better
   const handleClick = () => {
     // Only capture the needed property
     const property = largeData.someProperty;
     console.log(property);
   };
   ```
4. Use the browser's memory profiling tools to identify leaks.

## TypeScript Errors

### Type Inference Issues

**Problem**: TypeScript isn't correctly inferring types from SDK functions.

**Solution**:
1. Explicitly provide generic types:
   ```typescript
   // Issue: Type inference not working
   const { data } = useMemory('user-preferences');
   
   // Solution: Provide explicit type
   interface UserPreferences {
     theme: 'light' | 'dark';
     fontSize: number;
   }
   
   const { data } = useMemory<UserPreferences>('user-preferences', {
     fallback: { theme: 'light', fontSize: 16 }
   });
   ```
2. Use type assertions when necessary:
   ```typescript
   // When TypeScript can't infer correctly
   const result = someSDKFunction() as ExpectedType;
   ```
3. Check for proper imports of type definitions:
   ```typescript
   // Import types explicitly if needed
   import { App, AppConfig } from '@vibing-ai/sdk';
   ```
4. Update to the latest TypeScript version and SDK types.

### Incompatible Types

**Problem**: TypeScript reports incompatible types between your code and the SDK.

**Solution**:
1. Check for version mismatches between your code and the SDK types.
2. Use utility types to make types compatible:
   ```typescript
   import { DeepPartial } from '@vibing-ai/sdk/types';
   
   // When you need to provide a partial config
   const partialConfig: DeepPartial<AppConfig> = {
     name: 'My App'
     // Other fields can be omitted
   };
   ```
3. Create adapter functions for incompatible types:
   ```typescript
   // Your existing data format
   interface YourDataFormat {
     userName: string;
     userPreferences: {
       isDarkMode: boolean;
     };
   }
   
   // SDK expected format
   interface SDKFormat {
     name: string;
     preferences: {
       theme: 'light' | 'dark';
     };
   }
   
   // Adapter function
   function adaptToSDKFormat(data: YourDataFormat): SDKFormat {
     return {
       name: data.userName,
       preferences: {
         theme: data.userPreferences.isDarkMode ? 'dark' : 'light'
       }
     };
   }
   ```
4. Check for strict null checks issues:
   ```typescript
   // Issue with null/undefined
   function processData(data?: DataType) {
     // This might cause an error if data is undefined
     return data.property;
   }
   
   // Fix with null check
   function processData(data?: DataType) {
     if (!data) return defaultValue;
     return data.property;
   }
   ```

## Build and Bundling Issues

### Large Bundle Size

**Problem**: The bundle size is too large due to SDK inclusion.

**Solution**:
1. Use tree-shaking by importing only what you need:
   ```typescript
   // Don't import the entire SDK
   import * as SDK from '@vibing-ai/sdk'; // ❌
   
   // Import only what you need
   import { createApp } from '@vibing-ai/sdk'; // ✅
   import { useMemory } from '@vibing-ai/sdk/common/memory'; // ✅
   ```
2. Use specialized entry points:
   ```typescript
   // For app-only usage
   import { createApp } from '@vibing-ai/sdk/app';
   
   // For plugin-only usage
   import { createPlugin } from '@vibing-ai/sdk/plugin';
   ```
3. Configure your bundler for optimal tree-shaking:
   ```javascript
   // webpack.config.js
   module.exports = {
     mode: 'production',
     optimization: {
       usedExports: true,
       sideEffects: true
     }
   };
   ```
4. Analyze your bundle to identify large dependencies:
   ```bash
   npm run build -- --analyze
   ```

### Build Errors

**Problem**: The build process fails with errors.

**Solution**:
1. Check for compatibility issues between the SDK and your build tools:
   ```bash
   # Check installed versions
   npm list @vibing-ai/sdk webpack
   ```
2. Ensure proper build configuration:
   ```javascript
   // webpack.config.js
   module.exports = {
     resolve: {
       extensions: ['.ts', '.tsx', '.js', '.json'],
       alias: {
         // Sometimes needed for resolving SDK dependencies
         '@vibing-ai/sdk': path.resolve('./node_modules/@vibing-ai/sdk')
       }
     }
   };
   ```
3. Update to compatible versions of tools and dependencies:
   ```bash
   npm update webpack webpack-cli babel-loader
   ```
4. Clear cache and node_modules if needed:
   ```bash
   rm -rf node_modules
   npm cache clean --force
   npm install
   ```

## Common Error Codes

### VIB-001: Initialization Failed

**Problem**: The SDK failed to initialize.

**Solution**:
1. Check for missing required configuration:
   ```typescript
   const app = createApp({
     name: 'My App', // Required
     version: '1.0.0', // Required
     // Add other required fields
   });
   ```
2. Verify that initialization is being called in the correct context.
3. Check console for additional error details.

### VIB-002: Permission Denied

**Problem**: An operation was attempted without the required permissions.

**Solution**:
1. Add the required permission to your app config:
   ```typescript
   const app = createApp({
     // ...
     permissions: [
       'memory:read',
       'memory:write',
       'network:api.example.com'
     ]
   });
   ```
2. Implement proper permission requests for runtime permissions.
3. Check for permission scope issues (global vs. conversation).

### VIB-003: Invalid Configuration

**Problem**: The configuration provided to an SDK function is invalid.

**Solution**:
1. Check the configuration against the API documentation.
2. Validate configuration before providing it to SDK functions:
   ```typescript
   import { validateConfig } from '@vibing-ai/sdk/utils';
   
   const config = {
     // your config
   };
   
   const validationResult = validateConfig(config, 'AppConfig');
   if (!validationResult.valid) {
     console.error('Invalid config:', validationResult.errors);
     // Fix the issues before proceeding
   } else {
     const app = createApp(config);
   }
   ```
3. Check for proper casing and property names.

### VIB-004: Network Error

**Problem**: A network request failed.

**Solution**:
1. Check your internet connection.
2. Verify API endpoint URLs and credentials.
3. Implement proper error handling and retries.
4. Check for CORS issues if applicable.

### VIB-005: Storage Error

**Problem**: Failed to read from or write to storage.

**Solution**:
1. Check for storage quota issues.
2. Verify the browser's storage permissions.
3. Implement fallback storage mechanisms:
   ```typescript
   const { data, set } = useMemory('user-preferences', {
     fallbackStorage: 'memory' // Use in-memory if persistent storage fails
   });
   ```
4. Handle storage errors gracefully:
   ```typescript
   try {
     set(largeData);
   } catch (error) {
     if (error.code === 'VIB-005') {
       // Storage error
       console.error('Storage error:', error);
       // Implement fallback strategy
       storeInSmallerChunks(largeData);
     }
   }
   ```

## Debugging Tools

### SDK Debug Mode

Enable debug mode to get detailed logs:

```typescript
const app = createApp({
  name: 'My App',
  version: '1.0.0',
  debug: true // Enable debug mode
});

// Or enable debug logging globally
import { setLogLevel } from '@vibing-ai/sdk/common/logging';
setLogLevel('debug');
```

### DevTools Integration

Use the SDK DevTools extension:

1. Install the browser extension.
2. Enable DevTools integration in your app:
   ```typescript
   import { enableDevTools } from '@vibing-ai/sdk/development';
   
   if (process.env.NODE_ENV !== 'production') {
     enableDevTools();
   }
   ```
3. Open your browser's DevTools and navigate to the Vibing AI panel.

### Logging Utilities

Use structured logging for better debugging:

```typescript
import { createLogger } from '@vibing-ai/sdk/common/logging';

const logger = createLogger({
  component: 'MyComponent',
  level: 'debug'
});

// Log with context
logger.debug('Operation started', { 
  userId: user.id,
  timestamp: Date.now()
});

// Log errors
try {
  // Operation
} catch (error) {
  logger.error('Operation failed', { 
    error,
    operation: 'fetchUserData'
  });
}
```

### State Inspection

Monitor state changes:

```typescript
import { createStateMonitor } from '@vibing-ai/sdk/development';

// Create a monitor for memory
const memoryMonitor = createStateMonitor('memory');

// Start monitoring a specific key
memoryMonitor.watch('user-preferences', (newValue, oldValue) => {
  console.log('Memory changed:', { 
    from: oldValue,
    to: newValue,
    diff: getObjectDiff(oldValue, newValue)
  });
});

// Helper to show what changed
function getObjectDiff(oldObj, newObj) {
  // Return changed properties
  return Object.keys(newObj).reduce((diff, key) => {
    if (oldObj[key] !== newObj[key]) {
      diff[key] = {
        from: oldObj[key],
        to: newObj[key]
      };
    }
    return diff;
  }, {});
}
```

Still having issues after trying these solutions? Reach out to our support team at support@vibing.ai or join our Discord community for real-time help. 