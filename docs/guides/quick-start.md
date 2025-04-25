# Quick Start in 5 Minutes

Get up and running with the Vibing AI SDK in just 5 minutes. This guide provides the essential steps to create a functioning app with minimal configuration.

## Installation

```bash
# Using npm
npm install @vibing-ai/sdk

# Using yarn
yarn add @vibing-ai/sdk
```

## Basic Setup

Create a new file called `app.js` with the following:

```javascript
import { createApp } from '@vibing-ai/sdk';

// Initialize your app with minimal configuration
const app = createApp({
  name: 'my-first-app',
  description: 'My first Vibing AI app',
  version: '1.0.0',
});

// Start the app
app.start();

console.log('App started successfully!');
```

## Creating a Simple App

Let's enhance our app with a simple card surface:

```javascript
import { createApp, createCardSurface } from '@vibing-ai/sdk';

// Initialize the app
const app = createApp({
  name: 'greeting-app',
  description: 'A simple greeting app',
  version: '1.0.0',
});

// Create a card surface
const cardSurface = createCardSurface({
  title: 'Hello World',
  content: 'Welcome to your first Vibing AI app!',
  actions: [
    {
      type: 'button',
      text: 'Click Me',
      onClick: () => {
        console.log('Button clicked!');
        cardSurface.update({
          content: 'You clicked the button! 🎉',
        });
      },
    },
  ],
});

// Register the card surface
app.registerSurface(cardSurface);

// Start the app
app.start();
```

## Running and Testing

Save your file and run it:

```bash
# For Node.js environments
node app.js

# For browser environments, import your script into an HTML file or use a bundler
```

That's it! You've created your first Vibing AI app.

## Troubleshooting

Here are quick fixes for common issues:

1. **Module not found errors**: Make sure all dependencies are installed and paths are correct.
   ```bash
   npm install @vibing-ai/sdk @vibing-ai/block-kit
   ```

2. **Surface not showing**: Verify that you've registered your surface with the app.
   ```javascript
   app.registerSurface(yourSurface);
   ```

3. **Events not firing**: Check your event handlers and make sure event names match exactly.
   ```javascript
   surface.addEventListener('eventName', handler);
   ```

4. **Type errors**: If using TypeScript, ensure you've imported the types correctly.
   ```typescript
   import { createApp, AppOptions } from '@vibing-ai/sdk';
   ```

5. **Version compatibility**: Ensure your SDK is compatible with your Block Kit version.
   ```bash
   npm list @vibing-ai/sdk @vibing-ai/block-kit
   ```

## Next Steps

- Explore the [API Reference](../api-reference.md) for detailed documentation
- Learn about [Best Practices](./best-practices.md) for building robust apps
- Understand [Performance Optimization](./performance.md) for your app
- Check out [Interactive Examples](../../examples/interactive/README.md) for more advanced patterns 