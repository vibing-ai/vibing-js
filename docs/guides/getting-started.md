# Getting Started with Vibing AI SDK

This guide will walk you through the process of creating your first Vibing AI application from scratch.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js 14.x or later
- npm, yarn, or pnpm
- A code editor (VS Code recommended)

## Installation

First, create a new project directory and initialize it:

```bash
mkdir my-vibing-app
cd my-vibing-app
npm init -y
```

Next, install the Vibing AI SDK:

```bash
npm install @vibing-ai/sdk
```

Optionally, install the Block Kit package for enhanced UI components:

```bash
npm install @vibing-ai/block-kit
```

## Project Setup

Create a basic file structure for your project:

```bash
mkdir -p src/components
touch src/index.ts
touch src/App.tsx
```

### TypeScript Configuration

Create a `tsconfig.json` file in the root of your project:

```json
{
  "compilerOptions": {
    "target": "es2019",
    "module": "esnext",
    "moduleResolution": "node",
    "jsx": "react",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

## Creating Your First App

Open `src/App.tsx` and create your first Vibing AI app:

```tsx
import React, { useState, useEffect } from 'react';
import { createApp } from '@vibing-ai/sdk';
import { useMemory } from '@vibing-ai/sdk/common/memory';
import { createConversationCard } from '@vibing-ai/sdk/surfaces/cards';

// Simple counter component
const Counter: React.FC = () => {
  const { data, set } = useMemory<{ count: number }>('counter:state', {
    scope: 'conversation',
    fallback: { count: 0 }
  });
  
  const increment = () => set({ count: data.count + 1 });
  const decrement = () => set({ count: Math.max(0, data.count - 1) });
  
  return (
    <div className="counter">
      <h2>Counter: {data.count}</h2>
      <div className="counter-controls">
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
};

// Create the app
const app = createApp({
  name: 'My First Vibing App',
  description: 'A simple counter app using Vibing AI SDK',
  permissions: ['memory:read', 'memory:write'],
  version: '1.0.0'
});

// Handle initialization
app.onInitialize(async () => {
  console.log('App initializing...');
  
  // Display a welcome card
  createConversationCard({
    content: (
      <div>
        <h1>Welcome to My First Vibing App!</h1>
        <p>This is a simple counter application.</p>
      </div>
    )
  });
});

// Render the app
app.onRender((container) => {
  console.log('Rendering app...');
  
  // In a real implementation, you would use ReactDOM here
  // ReactDOM.render(<Counter />, container);
  
  // For demonstration purposes
  container.innerHTML = `
    <div class="counter">
      <h2>Counter: 0</h2>
      <div class="counter-controls">
        <button>-</button>
        <button>+</button>
      </div>
    </div>
  `;
});

// Handle cleanup
app.onCleanup(() => {
  console.log('Cleaning up...');
});

export default app;
```

Now edit `src/index.ts` to export your app:

```typescript
import app from './App';
export default app;
```

## Using the Memory System

Let's enhance our app by adding the ability to save user preferences:

```tsx
// In App.tsx
const Settings: React.FC = () => {
  // Define settings interface
  interface UserSettings {
    theme: 'light' | 'dark';
    notifications: boolean;
  }
  
  // Use the memory system for settings
  const { data: settings, set: setSettings } = useMemory<UserSettings>('user:settings', {
    scope: 'global',
    fallback: {
      theme: 'light',
      notifications: true
    }
  });
  
  // Toggle theme
  const toggleTheme = () => {
    setSettings({
      ...settings,
      theme: settings.theme === 'light' ? 'dark' : 'light'
    });
  };
  
  // Toggle notifications
  const toggleNotifications = () => {
    setSettings({
      ...settings,
      notifications: !settings.notifications
    });
  };
  
  return (
    <div className={`settings ${settings.theme}`}>
      <h2>User Settings</h2>
      
      <div className="setting-row">
        <label>Theme: {settings.theme}</label>
        <button onClick={toggleTheme}>
          Switch to {settings.theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
      
      <div className="setting-row">
        <label>
          Notifications: {settings.notifications ? 'Enabled' : 'Disabled'}
        </label>
        <button onClick={toggleNotifications}>
          {settings.notifications ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  );
};
```

## Working with Events

Now let's add event handling to allow components to communicate:

```tsx
// In App.tsx
import { useEvents } from '@vibing-ai/sdk/common/events';

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const { subscribe } = useEvents();
  
  useEffect(() => {
    // Subscribe to counter change events
    const unsubscribe = subscribe('counter:changed', (data) => {
      const message = `Counter changed to ${data.newValue} (${new Date().toLocaleTimeString()})`;
      setLogs(prev => [message, ...prev].slice(0, 5));
    });
    
    // Cleanup subscription
    return unsubscribe;
  }, []);
  
  return (
    <div className="activity-log">
      <h3>Recent Activity</h3>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

// Update Counter component to publish events
const Counter: React.FC = () => {
  const { data, set } = useMemory<{ count: number }>('counter:state', {
    scope: 'conversation',
    fallback: { count: 0 }
  });
  
  const { publish } = useEvents();
  
  const increment = () => {
    const newValue = data.count + 1;
    set({ count: newValue });
    publish('counter:changed', { oldValue: data.count, newValue });
  };
  
  const decrement = () => {
    const newValue = Math.max(0, data.count - 1);
    set({ count: newValue });
    publish('counter:changed', { oldValue: data.count, newValue });
  };
  
  // Rest of component remains the same
};
```

## Adding Context Panels

Let's add a context panel to show additional information:

```tsx
// In App.tsx
import { createContextPanel } from '@vibing-ai/sdk/surfaces/panels';

// In your initialization
app.onInitialize(async () => {
  console.log('App initializing...');
  
  // Display a welcome card
  createConversationCard({
    content: (
      <div>
        <h1>Welcome to My First Vibing App!</h1>
        <p>This is a simple counter application.</p>
      </div>
    )
  });
  
  // Create an info panel
  createContextPanel({
    title: 'App Information',
    content: (
      <div className="app-info">
        <p>This is a simple demonstration of the Vibing AI SDK.</p>
        <p>Try the following features:</p>
        <ul>
          <li>Increment and decrement the counter</li>
          <li>Change theme settings</li>
          <li>View the activity log</li>
        </ul>
      </div>
    ),
    width: 300
  });
});
```

## Using Modal Dialogs

Finally, let's add a confirmation dialog when resetting the counter:

```tsx
// In App.tsx
import { useModal } from '@vibing-ai/sdk/surfaces/modals';

const ResetButton: React.FC = () => {
  const { data, set } = useMemory<{ count: number }>('counter:state', {
    scope: 'conversation'
  });
  
  const { showModal } = useModal();
  const { publish } = useEvents();
  
  const handleResetClick = async () => {
    if (data.count === 0) return;
    
    const modal = showModal({
      title: 'Reset Counter',
      content: (
        <div>
          <p>Are you sure you want to reset the counter to zero?</p>
          <p>Current value: {data.count}</p>
        </div>
      ),
      actions: (
        <div className="modal-actions">
          <button onClick={() => modal.hide(false)}>Cancel</button>
          <button 
            onClick={() => modal.hide(true)}
            style={{ marginLeft: '8px', backgroundColor: '#f44336', color: 'white' }}
          >
            Reset
          </button>
        </div>
      )
    });
    
    // Wait for user response
    const confirmed = await modal.result;
    
    if (confirmed) {
      const oldValue = data.count;
      set({ count: 0 });
      publish('counter:changed', { oldValue, newValue: 0, action: 'reset' });
    }
  };
  
  return (
    <button onClick={handleResetClick} disabled={data.count === 0}>
      Reset Counter
    </button>
  );
};
```

## Putting It All Together

Now let's update our app to include all these components:

```tsx
// In App.tsx, update the onRender function:
app.onRender((container) => {
  console.log('Rendering app...');
  
  const App: React.FC = () => {
    return (
      <div className="vibing-app">
        <Counter />
        <ResetButton />
        <ActivityLog />
        <Settings />
      </div>
    );
  };
  
  // In a real implementation, you would use ReactDOM here
  // ReactDOM.render(<App />, container);
  
  // For demonstration purposes
  container.innerHTML = `
    <div class="vibing-app">
      <div class="counter">
        <h2>Counter: 0</h2>
        <div class="counter-controls">
          <button>-</button>
          <button>+</button>
          <button disabled>Reset Counter</button>
        </div>
      </div>
      
      <div class="activity-log">
        <h3>Recent Activity</h3>
        <ul>
          <li>App initialized (12:00:00 PM)</li>
        </ul>
      </div>
      
      <div class="settings light">
        <h2>User Settings</h2>
        <div class="setting-row">
          <label>Theme: light</label>
          <button>Switch to Dark</button>
        </div>
        <div class="setting-row">
          <label>Notifications: Enabled</label>
          <button>Disable</button>
        </div>
      </div>
    </div>
  `;
});
```

## Testing Your App

To test your app with the Vibing AI CLI:

1. Install the CLI tool:

```bash
npm install -g @vibing-ai/cli
```

2. Run your app in development mode:

```bash
vibing dev
```

This will start a development server and allow you to test your app in the Vibing AI environment.

## Next Steps

Now that you've created your first Vibing AI application, here are some next steps to explore:

- Learn more about the [Memory System](./memory.md)
- Explore available [Surface Components](./surfaces.md)
- Check out [Best Practices](./best-practices.md) for Vibing AI apps
- Try integrating with the [Super Agent](./super-agent.md) for AI capabilities

## Troubleshooting

If you encounter issues while developing your Vibing AI app:

- Check the console for error messages
- Verify your permission requests match your app's needs
- Ensure you're cleaning up resources (event listeners, subscriptions) properly
- Check the [API Reference](../api-reference.md) for correct function signatures

## Conclusion

Congratulations! You've built your first Vibing AI application. This is just the beginning of what you can create with the Vibing AI SDK. As you continue to develop, you'll discover more powerful features and integration possibilities. 