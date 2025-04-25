# Vibing AI JavaScript SDK

Official JavaScript SDK for building Vibing AI apps, plugins, and agents.

## Installation

You can install the Vibing AI SDK using npm, yarn, or pnpm:

```bash
# Using npm
npm install @vibing-ai/sdk

# Using yarn
yarn add @vibing-ai/sdk

# Using pnpm
pnpm add @vibing-ai/sdk
```

### Requirements

- Node.js 14.x or higher
- React 16.8+ (for React-based applications)

### Optional Dependencies

For enhanced functionality, consider installing these complementary packages:

```bash
# UI components for Vibing AI apps
npm install @vibing-ai/block-kit

# CLI tools for development
npm install -g @vibing-ai/cli
```

## Quick Start

### Creating Your First App

```typescript
import { createApp } from '@vibing-ai/sdk';
import { useMemory } from '@vibing-ai/sdk/common/memory';
import { createConversationCard } from '@vibing-ai/sdk/surfaces/cards';

// Create the app
const app = createApp({
  name: 'My Vibing App',
  description: 'A simple Vibing AI app',
  permissions: ['memory:read', 'memory:write'],
  version: '1.0.0'
});

// Handle initialization
app.onInitialize(async () => {
  // Set up initial data in memory
  const { set } = useMemory('app:state', { 
    scope: 'conversation', 
    fallback: { counter: 0 } 
  });
  
  // Display welcome card
  createConversationCard({
    content: <h1>Welcome to My Vibing App!</h1>,
    actions: <button>Get Started</button>
  });
});

// Render your UI
app.onRender((container) => {
  // In a real app, you would use React or another framework
  container.innerHTML = '<h1>Hello Vibing!</h1>';
});

export default app;
```

### Setting Up with React

```tsx
import React, { useState, useEffect } from 'react';
import { createApp } from '@vibing-ai/sdk';
import { useMemory } from '@vibing-ai/sdk/common/memory';

const app = createApp({
  name: 'React Vibing App',
  description: 'Using React with Vibing AI',
  permissions: ['memory:read', 'memory:write'],
  version: '1.0.0'
});

app.onRender((container) => {
  // In a real application, you would use ReactDOM.render or createRoot().render()
  // This is just for illustration
  const App: React.FC = () => {
    const { data, set } = useMemory('app:counter', {
      scope: 'conversation',
      fallback: { value: 0 }
    });
    
    const incrementCounter = () => {
      set({ value: data.value + 1 });
    };
    
    return (
      <div className="app">
        <h1>Counter: {data.value}</h1>
        <button onClick={incrementCounter}>Increment</button>
      </div>
    );
  };
  
  // Mount your React app
  // ReactDOM.render(<App />, container);
});

export default app;
```

## Core Concepts

### Apps

Apps are the main entry point for Vibing AI integrations. They provide the framework for creating experiences within the Vibing AI platform.

Key features:
- Lifecycle management (`onInitialize`, `onRender`, `onCleanup`)
- UI rendering
- Permission management
- Integration with Vibing AI surfaces

Example:
```typescript
const app = createApp({
  name: 'My App',
  description: 'Description of your app',
  permissions: ['memory:read', 'memory:write'],
  version: '1.0.0'
});

// Handle app lifecycle events
app.onInitialize(async () => {/* ... */});
app.onRender((container) => {/* ... */});
app.onCleanup(() => {/* ... */});
```

### Memory System

The memory system provides persistent storage across different scopes:

- **Global**: Accessible across all conversations and projects
- **Project**: Limited to the current project
- **Conversation**: Limited to the current conversation

```typescript
import { useMemory } from '@vibing-ai/sdk/common/memory';

function MemoryExample() {
  // Basic usage
  const { data, loading, error, set } = useMemory('unique-key', {
    scope: 'conversation',
    fallback: { defaultValue: 'Initial data' }
  });
  
  // Advanced usage with typed data
  interface UserPreferences {
    theme: 'light' | 'dark';
    fontSize: number;
    notifications: boolean;
  }
  
  const { data: preferences, set: setPreferences } = useMemory<UserPreferences>('user:preferences', {
    scope: 'global',
    fallback: {
      theme: 'light',
      fontSize: 14,
      notifications: true
    }
  });
  
  // Update a specific field
  const updateTheme = (theme: 'light' | 'dark') => {
    setPreferences({...preferences, theme});
  };
  
  // Clear memory
  const { clear } = useMemory('temp:data', { scope: 'conversation' });
  const handleReset = () => clear();
}
```

### Permissions

The permissions system manages what capabilities your app can access, with explicit user consent.

Available permission types:
- `memory:read` - Read from memory
- `memory:write` - Write to memory
- `events:publish` - Publish events
- `events:subscribe` - Subscribe to events
- `ui:render` - Render user interface elements
- `network:fetch` - Make network requests

```typescript
import { usePermissions } from '@vibing-ai/sdk/common/permissions';

function PermissionsExample() {
  const { request, check, revoke } = usePermissions();
  
  // Request permission
  const requestMemoryAccess = async () => {
    const result = await request({
      type: 'memory',
      access: ['read', 'write'],
      scope: 'conversation',
      purpose: 'Store your preferences for a better experience',
      explanation: 'This allows us to remember your settings'
    });
    
    if (result.granted) {
      // Permission granted, proceed
    } else {
      // Handle rejection
    }
  };
  
  // Check if permission is granted
  const canAccessMemory = check({
    type: 'memory',
    access: 'read',
    scope: 'conversation'
  });
  
  // Revoke a permission
  const handleRevoke = () => {
    revoke({
      type: 'memory',
      access: 'write',
      scope: 'conversation'
    });
  };
}
```

### Events

The events system enables communication between components of your app and with the Vibing AI platform.

```typescript
import { useEvents } from '@vibing-ai/sdk/common/events';

function EventsExample() {
  const { subscribe, publish, unsubscribe } = useEvents();
  
  // Subscribe to an event
  useEffect(() => {
    const unsubscribeFunc = subscribe('data:updated', (data) => {
      console.log('Data was updated:', data);
    });
    
    // Cleanup subscription
    return unsubscribeFunc;
  }, []);
  
  // Publish an event with data
  const triggerUpdate = () => {
    publish('data:updated', { 
      timestamp: Date.now(),
      source: 'user-action'
    });
  };
  
  // Advanced: Subscribe with options
  useEffect(() => {
    const unsubscribeFunc = subscribe('user:action', handleUserAction, {
      maxCalls: 5,       // Auto-unsubscribe after 5 calls
      timeout: 60000,    // Auto-unsubscribe after 1 minute
      priority: 'high'   // Higher priority handling
    });
    
    return unsubscribeFunc;
  }, []);
}
```

### Super Agent

The Super Agent provides natural language capabilities, intent detection, and action suggestions for your app.

```typescript
import { useSuperAgent } from '@vibing-ai/sdk/common/super-agent';

function SuperAgentExample() {
  const { 
    askSuperAgent, 
    suggestAction, 
    getConversationContext, 
    onIntent 
  } = useSuperAgent();
  
  // Ask the Super Agent a question
  const handleQuery = async (query: string) => {
    const response = await askSuperAgent(query, {
      includeHistory: true,
      contextItems: [
        { 
          content: 'User is working with financial data',
          relevance: 0.9
        }
      ]
    });
    
    console.log(response.text);
    console.log(response.followupQuestions);
  };
  
  // Register an intent handler
  useEffect(() => {
    const unregister = onIntent('createChart', (intent, params) => {
      const { chartType, data } = params;
      // Create chart based on parameters
    });
    
    return unregister;
  }, []);
  
  // Suggest an action to the user
  const suggestChartCreation = () => {
    suggestAction({
      type: 'visualization',
      title: 'Create Bar Chart',
      description: 'Visualize your data as a bar chart',
      icon: 'chart-bar',
      action: () => createBarChart()
    });
  };
}
```

## Surfaces

The SDK provides several UI surfaces for building rich interactive experiences:

### Canvas Surface

For creating custom visualizations and interactive workspaces.

```typescript
import { useCanvas, createBlock } from '@vibing-ai/sdk/surfaces/canvas';

// Define a custom block type
const TextBlock = createBlock({
  type: 'text',
  title: 'Text Block',
  icon: 'text',
  defaultContent: '',
  validate: (content) => typeof content === 'string',
  render: ({ content, id }) => <div>{content}</div>,
  edit: ({ content, onChange, onSave }) => (
    <>
      <textarea value={content} onChange={e => onChange(e.target.value)} />
      <button onClick={onSave}>Save</button>
    </>
  )
});

function CanvasExample() {
  const { 
    blocks, 
    createBlock, 
    updateBlock, 
    deleteBlock,
    selection,
    setSelection
  } = useCanvas();
  
  // Create a new text block
  const handleAddTextBlock = () => {
    const blockId = createBlock('text', 'Hello world');
    setSelection([blockId]);
  };
  
  return (
    <div>
      <button onClick={handleAddTextBlock}>Add Text Block</button>
      <div className="canvas">
        {blocks.map(block => (
          <div 
            key={block.id}
            className={selection.includes(block.id) ? 'selected' : ''}
          >
            {/* Render the block based on its type */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Conversation Cards

For displaying rich content in the conversation flow.

```typescript
import { createConversationCard } from '@vibing-ai/sdk/surfaces/cards';

// Simple card
const simpleCard = createConversationCard(<div>Hello World</div>);

// Card with full configuration
const card = createConversationCard({
  content: (
    <div className="card-content">
      <h2>Important Information</h2>
      <p>This is an example of a rich conversation card.</p>
      <img src="example.jpg" alt="Example" />
    </div>
  ),
  actions: (
    <div className="card-actions">
      <button onClick={() => console.log('Clicked!')}>Action 1</button>
      <button onClick={() => console.log('Clicked!')}>Action 2</button>
    </div>
  ),
  metadata: {
    timestamp: Date.now(),
    source: 'user-action'
  },
  style: {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
  }
});

// Update card later
card.update({
  content: <div>Updated content</div>
});

// Remove the card
card.remove();
```

### Context Panels

For displaying detailed information or controls in a sidebar.

```typescript
import { createContextPanel } from '@vibing-ai/sdk/surfaces/panels';

const panel = createContextPanel({
  title: 'User Profile',
  content: (
    <div className="user-profile">
      <img src="avatar.jpg" alt="User Avatar" />
      <h2>Jane Doe</h2>
      <p>Member since 2022</p>
      <div className="stats">
        <div>Posts: 42</div>
        <div>Comments: 128</div>
      </div>
    </div>
  ),
  actions: (
    <button onClick={editProfile}>Edit Profile</button>
  ),
  footer: (
    <div className="panel-footer">
      <small>Last active: Today at 2:30 PM</small>
    </div>
  ),
  width: 320
});

// Control panel visibility
panel.hide();
panel.show();

// Update panel content
panel.update({
  content: <div>Updated profile</div>
});

// Remove panel
panel.remove();
```

### Modal Dialogs

For focused interactions requiring user attention.

```typescript
import { useModal } from '@vibing-ai/sdk/surfaces/modals';

function ModalExample() {
  const { showModal, hideModal, updateModal } = useModal();
  
  const handleShowModal = async () => {
    // Show a confirmation modal
    const modal = showModal({
      title: 'Confirm Action',
      content: (
        <div>
          <p>Are you sure you want to proceed with this action?</p>
          <p>This cannot be undone.</p>
        </div>
      ),
      actions: (
        <div className="modal-actions">
          <button onClick={() => modal.hide(false)}>Cancel</button>
          <button onClick={() => modal.hide(true)}>Confirm</button>
        </div>
      ),
      size: 'medium',
      closeOnOverlayClick: true
    });
    
    // Wait for the result
    const confirmed = await modal.result;
    
    if (confirmed) {
      // User confirmed the action
      performAction();
    }
  };
  
  // Update a modal (if you have the ID)
  const updateModalContent = (id) => {
    updateModal(id, {
      content: <p>Updated content</p>
    });
  };
  
  return (
    <button onClick={handleShowModal}>Show Confirmation</button>
  );
}
```

## API Reference

See our [detailed API Reference documentation](https://github.com/vibing-ai/vibing-js/blob/main/docs/api-reference.md) for comprehensive information on all modules, functions, and interfaces.

## Examples

Check out the [examples directory](https://github.com/vibing-ai/vibing-js/tree/main/examples) for complete usage examples, including:

- [Note Taking App](https://github.com/vibing-ai/vibing-js/tree/main/examples/note-app.ts) - Basic note-taking application
- [Task Manager](https://github.com/vibing-ai/vibing-js/tree/main/examples/task-manager) - Task management with persistence
- [Data Visualization](https://github.com/vibing-ai/vibing-js/tree/main/examples/data-visualization) - Creating charts and graphs
- [Multi-surface Integration](https://github.com/vibing-ai/vibing-js/tree/main/examples/multi-surface) - Working with multiple surfaces

## Getting Started Guides

- [Creating Your First App](https://github.com/vibing-ai/vibing-js/blob/main/docs/guides/getting-started.md)
- [Working with Memory](https://github.com/vibing-ai/vibing-js/blob/main/docs/guides/memory.md)
- [Using Surfaces](https://github.com/vibing-ai/vibing-js/blob/main/docs/guides/surfaces.md)
- [Best Practices](https://github.com/vibing-ai/vibing-js/blob/main/docs/guides/best-practices.md)

## Related Projects

- [@vibing-ai/block-kit](https://github.com/vibing-ai/block-kit) - UI components for Vibing AI apps
- [@vibing-ai/cli](https://github.com/vibing-ai/cli) - Command-line interface for Vibing AI development

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](https://github.com/vibing-ai/vibing-js/blob/main/CONTRIBUTING.md) for details.

## License

MIT 