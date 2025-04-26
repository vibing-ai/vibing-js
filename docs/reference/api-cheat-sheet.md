# Vibing AI SDK API Cheat Sheet

This cheat sheet provides a quick reference for the most commonly used APIs in the Vibing AI SDK. Use it to quickly find the functions, interfaces, and patterns you need for your development.

## App Creation

```typescript
import { createApp } from '@vibing-ai/sdk';

// Create a simple app
const app = createApp({
  name: 'my-app',
  description: 'My first Vibing app',
  version: '1.0.0'
});

// Start the app
app.start();

// Register a surface
app.registerSurface(mySurface);

// Listen for events
app.addEventListener('start', () => console.log('App started'));

// Update app settings
app.updateSettings({ theme: 'dark' });
```

## Plugin Creation

```typescript
import { createPlugin } from '@vibing-ai/sdk';

// Create a plugin
const plugin = createPlugin({
  name: 'my-plugin',
  description: 'My first Vibing plugin',
  version: '1.0.0',
  permissions: ['conversation:read'],
  surfaces: ['card', 'panel']
});

// Install the plugin
plugin.install();

// Register a surface
plugin.registerSurface(mySurface);

// Define callable functions
plugin.defineFunctions([
  {
    name: 'myFunction',
    description: 'Does something useful',
    parameters: {
      type: 'object',
      properties: {
        input: { type: 'string' }
      },
      required: ['input']
    },
    handler: async (params) => {
      return { result: `Processed: ${params.input}` };
    }
  }
]);
```

## Agent Creation

```typescript
import { createAgent, createMemory } from '@vibing-ai/sdk';

// Create an agent
const agent = createAgent({
  name: 'my-agent',
  description: 'My first Vibing agent',
  version: '1.0.0',
  domains: ['general'],
  capabilities: ['query']
});

// Create memory for the agent
const memory = createMemory({
  namespace: 'agent-memory',
  ttl: 60 * 60 // 1 hour in seconds
});

// Attach memory to agent
agent.attachMemory(memory);

// Handle queries
agent.addEventListener('query', async (query) => {
  return `Response to: ${query.text}`;
});

// Start the agent
agent.start();
```

## Surface Creation

### Card Surface

```typescript
import { createCardSurface } from '@vibing-ai/sdk';

const cardSurface = createCardSurface({
  title: 'My Card',
  description: 'A simple card',
  content: '<div>Card content goes here</div>',
  actions: [
    {
      type: 'button',
      text: 'Click Me',
      style: 'primary',
      onClick: () => console.log('Button clicked')
    }
  ]
});

// Update card content
cardSurface.update({
  content: '<div>Updated content</div>'
});
```

### Panel Surface

```typescript
import { createPanelSurface } from '@vibing-ai/sdk';

const panelSurface = createPanelSurface({
  title: 'My Panel',
  position: 'right', // 'left', 'right', 'top', 'bottom'
  width: 'medium', // 'narrow', 'medium', 'wide', or a specific value
  content: '<div>Panel content</div>',
  actions: [
    {
      type: 'button',
      text: 'Close',
      onClick: () => panelSurface.close()
    }
  ],
  onClose: () => console.log('Panel closed')
});

// Show the panel
panelSurface.show();

// Check if panel is visible
const isVisible = panelSurface.isVisible();
```

### Modal Surface

```typescript
import { createModalSurface } from '@vibing-ai/sdk';

const modalSurface = createModalSurface({
  title: 'My Modal',
  size: 'medium', // 'small', 'medium', 'large'
  content: '<div>Modal content</div>',
  actions: [
    {
      type: 'button',
      text: 'Confirm',
      style: 'primary',
      onClick: () => handleConfirm()
    },
    {
      type: 'button',
      text: 'Cancel',
      onClick: () => modalSurface.close()
    }
  ],
  onClose: () => console.log('Modal closed')
});

// Show the modal
modalSurface.show();
```

## Memory Management

```typescript
import { createMemory } from '@vibing-ai/sdk';

// Create memory
const memory = createMemory({
  namespace: 'my-memory',
  ttl: 60 * 60 * 24, // 24 hours in seconds
  maxItems: 100
});

// Store data
await memory.set('key', { value: 'data' });

// Retrieve data
const data = await memory.get('key');

// Check if key exists
const exists = await memory.has('key');

// Delete data
await memory.delete('key');

// Clear all data
await memory.clear();
```

## Permission Management

```typescript
import { checkPermission, requestPermission } from '@vibing-ai/sdk';

// Check if a permission is granted
const hasPermission = await checkPermission('conversation:read');

// Request a permission
const granted = await requestPermission('conversation:write', {
  reason: 'To save conversation data'
});

// Check multiple permissions
const permissions = await checkPermissions([
  'conversation:read',
  'conversation:write'
]);
```

## Event Handling

```typescript
// Add event listener
element.addEventListener('eventName', (data) => {
  console.log('Event triggered:', data);
});

// Remove event listener
element.removeEventListener('eventName', handlerFunction);

// Dispatch an event
element.dispatchEvent('eventName', { key: 'value' });

// One-time event listener
element.once('eventName', (data) => {
  console.log('This handler will only run once');
});
```

## Common Patterns

### Async/Await with SDK

```typescript
async function initializeApp() {
  const app = createApp({
    name: 'my-app',
    version: '1.0.0'
  });
  
  // Wait for app to be ready
  await app.ready();
  
  // Register surfaces
  app.registerSurface(cardSurface);
  
  // Start the app
  await app.start();
  
  console.log('App initialized and started');
}
```

### Error Handling

```typescript
try {
  const result = await riskyOperation();
  handleSuccess(result);
} catch (error) {
  if (error instanceof ValidationError) {
    handleValidationError(error);
  } else if (error instanceof NetworkError) {
    retryOperation();
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Configuration Options

```typescript
// Common configuration options
const config = {
  debug: true, // Enable debug mode
  theme: 'light', // UI theme
  locale: 'en-US', // Localization
  timeoutMS: 5000, // Timeout in milliseconds
  retryCount: 3, // Number of retries
  persistState: true // Save state between sessions
};
```

## TypeScript Utilities

```typescript
import { DeepPartial, Brand, MaybePromise } from '@vibing-ai/sdk';

// Using DeepPartial for partial updates
type UserProfile = {
  name: string;
  settings: {
    theme: string;
    notifications: boolean;
  }
};

function updateProfile(profile: DeepPartial<UserProfile>) {
  // Update only provided fields
}

// Using branded types for type safety
type UserId = Brand<string, 'UserId'>;
type SessionId = Brand<string, 'SessionId'>;

function getUser(id: UserId) { /* ... */ }

// Using MaybePromise for flexible return types
function getData(): MaybePromise<string> {
  return Math.random() > 0.5 
    ? 'immediate data' 
    : Promise.resolve('async data');
}
```

## Version Information

```typescript
import { VERSION } from '@vibing-ai/sdk';

console.log(`Using Vibing SDK v${VERSION}`);
```

## Legend

🚫 Deprecated API - Will be removed in a future version  
⚠️ Experimental - May change in future versions  
⚡ Performance concern - Use with caution in performance-critical code  
🔒 Security-sensitive - Requires proper security handling 