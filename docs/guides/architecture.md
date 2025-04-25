# Architecture Guide

This guide provides an architectural overview of the Vibing AI SDK, explaining its core components, principles, and how they work together.

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [Core Components](#core-components)
- [Design Patterns](#design-patterns)
- [Data Flow](#data-flow)
- [Extension Points](#extension-points)
- [Framework Integration](#framework-integration)
- [Security Architecture](#security-architecture)
- [Performance Architecture](#performance-architecture)

## Architectural Overview

### High-Level Architecture

The Vibing AI SDK is designed with a modular, layered architecture that provides:

1. **Core Infrastructure**: Fundamental services like memory management, permissions, and error handling
2. **Application Layer**: App, Plugin, and Agent creation and lifecycle management
3. **Surface Layer**: UI rendering and component infrastructure
4. **Integration Layer**: Connectivity with host applications and external services

![Architecture Diagram](../assets/architecture-overview.png)

### Key Architectural Principles

The SDK is built on these key principles:

- **Modularity**: Components are decoupled and independently usable
- **Progressive Disclosure**: Simple APIs for common cases, powerful APIs for advanced needs
- **Safety**: Type-safe interfaces with runtime validation
- **Extensibility**: Clear extension points for customization
- **Performance**: Optimized for both developer experience and runtime performance

## Core Components

### Memory System

The memory system provides persistent, scoped storage for data with a simple API.

```
┌───────────────────────────┐
│       Memory System       │
├───────────────────────────┤
│  ┌─────────────────────┐  │
│  │ In-Memory Storage   │  │
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Persistent Storage  │  │
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Encryption Layer    │  │
│  └─────────────────────┘  │
└───────────────────────────┘
```

Key features:
- Multiple storage scopes (global, project, conversation)
- Optional persistence and encryption
- Change notification system
- Automatic synchronization
- Type-safe access patterns

### Permission System

The permission system enforces security boundaries between SDK components.

```
┌───────────────────────────┐
│     Permission System     │
├───────────────────────────┤
│  ┌─────────────────────┐  │
│  │ Permission Registry │  │
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Request Handling    │  │
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Enforcement Layer   │  │
│  └─────────────────────┘  │
└───────────────────────────┘
```

Key features:
- Declarative permission specification
- Runtime permission checking
- User-friendly permission request UI
- Permission persistence
- Granular permission control

### Event System

The event system enables communication between SDK components.

```
┌───────────────────────────┐
│       Event System        │
├───────────────────────────┤
│  ┌─────────────────────┐  │
│  │ Event Bus           │  │
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Subscription Mgmt   │  │
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Event Filtering     │  │
│  └─────────────────────┘  │
└───────────────────────────┘
```

Key features:
- Type-safe event definitions
- Scoped event distribution
- Subscription management
- Priority-based handling
- Event filtering

### Surface System

The surface system manages UI rendering across different integration points.

```
┌───────────────────────────┐
│      Surface System       │
├───────────────────────────┤
│  ┌─────────────────────┐  │
│  │ Cards               │  │
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Panels              │  │
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Modals              │  │
│  └─────────────────────┘  │
└───────────────────────────┘
```

Key features:
- Multiple surface types (cards, panels, modals)
- Framework-agnostic rendering
- Shadow DOM isolation
- Style encapsulation
- Responsive layout support

## Design Patterns

The SDK employs several key design patterns to ensure maintainability and usability.

### Factory Pattern

The SDK uses factory functions to create core objects with proper encapsulation:

```typescript
// Factory pattern for creating apps
const app = createApp({
  name: 'My App',
  version: '1.0.0'
});

// Factory pattern for plugins
const plugin = createPlugin({
  name: 'My Plugin',
  version: '1.0.0'
});
```

This pattern:
- Centralizes validation logic
- Provides better error messages
- Enables future extension without breaking changes
- Ensures proper initialization

### Observer Pattern

The memory and event systems use the observer pattern:

```typescript
// Subscribe to memory changes
const { subscribe } = useMemory('user-preferences');
const unsubscribe = subscribe((newValue) => {
  console.log('Preferences changed:', newValue);
});

// Later
unsubscribe();
```

This pattern:
- Enables reactive programming
- Reduces coupling between components
- Provides a clear lifecycle for subscriptions
- Scales to complex notification requirements

### Hooks Pattern

The SDK provides hooks for accessing core services:

```typescript
// Memory hook
const { data, set } = useMemory('user-preferences');

// Permissions hook
const { request, check } = usePermissions();

// Events hook
const { subscribe, publish } = useEvents();
```

This pattern:
- Creates a consistent access pattern
- Integrates with React and other frameworks
- Handles lifecycle management automatically
- Simplifies consuming code

### Middleware Pattern

The SDK uses middleware chains for extensible processing:

```typescript
// Adding middleware to a plugin
plugin.use(async (context, next) => {
  // Pre-processing
  const start = Date.now();
  
  // Call next middleware
  await next();
  
  // Post-processing
  const duration = Date.now() - start;
  console.log(`Operation took ${duration}ms`);
});
```

This pattern:
- Enables extensibility without core changes
- Allows for cross-cutting concerns
- Provides a clear sequence of operations
- Supports both synchronous and asynchronous processing

## Data Flow

Understanding how data flows through the SDK helps in building effective applications.

### App Initialization Flow

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Create App   │→ │ Register     │→ │ Initialize   │→ │ Render       │
│ Configuration│  │ Capabilities │  │ Resources    │  │ UI           │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

1. App created with configuration
2. App registers capabilities with host
3. App initializes required resources
4. App renders UI in provided container

### Plugin Integration Flow

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Create       │→ │ Register     │→ │ Register     │→ │ Respond to   │
│ Plugin       │  │ with Host    │  │ Handlers     │  │ Events       │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

1. Plugin created with configuration
2. Plugin registered with host app
3. Plugin registers event handlers
4. Plugin responds to events from host

### Memory Data Flow

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Read Request │→ │ Permission   │→ │ Storage      │→ │ Return       │
│              │  │ Check        │  │ Access       │  │ Data         │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

1. Component requests data via `useMemory`
2. Permission check ensures access is allowed
3. Storage system retrieves data
4. Data returned to component

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Write        │→ │ Permission   │→ │ Storage      │→ │ Notify       │
│ Request      │  │ Check        │  │ Update       │  │ Subscribers  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

1. Component updates data via `set`
2. Permission check ensures write access
3. Storage system updates data
4. Subscribers notified of changes

## Extension Points

The SDK provides several extension points for customization.

### Plugins

Plugins are the primary extension mechanism:

```typescript
// Create a plugin
const plugin = createPlugin({
  name: 'My Plugin',
  version: '1.0.0'
});

// Register with host app
app.registerPlugin(plugin);
```

Plugins can:
- Provide additional UI surfaces
- Add new capabilities
- Integrate with external services
- Modify or enhance existing functionality

### Middleware

Middleware can be added to processing chains:

```typescript
// Add logging middleware
app.use(async (context, next) => {
  console.log('Before operation:', context.operation);
  await next();
  console.log('After operation:', context.operation);
});
```

Middleware can:
- Add logging or metrics
- Modify requests or responses
- Implement caching
- Apply validation or transformation

### Custom Storage Providers

The memory system can be extended with custom storage providers:

```typescript
// Register a custom storage provider
registerStorageProvider('custom', {
  async get(key) {
    // Custom retrieval logic
    return customStorage.get(key);
  },
  async set(key, value) {
    // Custom storage logic
    return customStorage.set(key, value);
  },
  async delete(key) {
    // Custom deletion logic
    return customStorage.delete(key);
  }
});

// Use custom storage
const { data } = useMemory('user-preferences', {
  storageProvider: 'custom'
});
```

This allows for:
- Integration with specialized storage systems
- Encrypted storage implementations
- Network-based storage
- Database integrations

### Custom Surface Renderers

Surface rendering can be customized:

```typescript
// Register a custom renderer for cards
registerSurfaceRenderer('conversation-card', {
  render(container, content) {
    // Custom rendering logic
    const card = document.createElement('div');
    card.className = 'custom-card';
    card.innerHTML = customRender(content);
    container.appendChild(card);
  },
  update(container, content) {
    // Custom update logic
    const card = container.querySelector('.custom-card');
    card.innerHTML = customRender(content);
  }
});
```

This allows for:
- Framework-specific rendering
- Custom styling or theming
- Specialized component libraries
- Animation or transition effects

## Framework Integration

The SDK is designed to work with various frameworks and environments.

### React Integration

```typescript
// React component using SDK hooks
import React from 'react';
import { useMemory, usePermissions } from '@vibing-ai/sdk';

function UserPreferences() {
  const { data, set } = useMemory('user-preferences', {
    fallback: { theme: 'light' }
  });
  
  const { request } = usePermissions();
  
  const handleThemeChange = async (theme) => {
    // Request permission if needed
    if (!check({ type: 'memory', access: 'write' })) {
      const result = await request({
        type: 'memory',
        access: 'write',
        purpose: 'Save your theme preference'
      });
      
      if (!result.granted) return;
    }
    
    // Update theme
    set({ ...data, theme });
  };
  
  return (
    <div>
      <h2>Theme</h2>
      <button onClick={() => handleThemeChange('light')}>
        Light
      </button>
      <button onClick={() => handleThemeChange('dark')}>
        Dark
      </button>
    </div>
  );
}
```

### Vue Integration

```typescript
// Vue component using SDK
import { defineComponent } from 'vue';
import { useMemory, usePermissions } from '@vibing-ai/sdk';

export default defineComponent({
  setup() {
    const { data, set } = useMemory('user-preferences', {
      fallback: { theme: 'light' }
    });
    
    const { request, check } = usePermissions();
    
    const handleThemeChange = async (theme) => {
      // Request permission if needed
      if (!check({ type: 'memory', access: 'write' })) {
        const result = await request({
          type: 'memory',
          access: 'write',
          purpose: 'Save your theme preference'
        });
        
        if (!result.granted) return;
      }
      
      // Update theme
      set({ ...data.value, theme });
    };
    
    return {
      data,
      handleThemeChange
    };
  },
  template: `
    <div>
      <h2>Theme</h2>
      <button @click="handleThemeChange('light')">Light</button>
      <button @click="handleThemeChange('dark')">Dark</button>
    </div>
  `
});
```

### Vanilla JS Integration

```typescript
// Vanilla JS using SDK
import { createApp, useMemory } from '@vibing-ai/sdk';

// Create the app
const app = createApp({
  name: 'My App',
  version: '1.0.0'
});

// Initialize with vanilla JS
app.onInitialize(() => {
  const { data, set } = useMemory('user-preferences', {
    fallback: { theme: 'light' }
  });
  
  // Set up UI
  app.onRender(container => {
    const lightBtn = document.createElement('button');
    lightBtn.textContent = 'Light Theme';
    lightBtn.addEventListener('click', () => {
      set({ ...data, theme: 'light' });
    });
    
    const darkBtn = document.createElement('button');
    darkBtn.textContent = 'Dark Theme';
    darkBtn.addEventListener('click', () => {
      set({ ...data, theme: 'dark' });
    });
    
    container.appendChild(lightBtn);
    container.appendChild(darkBtn);
  });
});
```

## Security Architecture

Security is a core concern in the SDK architecture.

### Permission Model

The permission system is based on a capability model:

```
┌───────────────────────────┐
│     Permission Model      │
├───────────────────────────┤
│  memory:read              │
│  memory:write             │
│  network:example.com      │
│  surface:conversation-card│
│  surface:context-panel    │
└───────────────────────────┘
```

Permissions are:
- Specific to capability types
- Granular in scope
- Explicitly requested
- User-approved
- Enforceable at runtime

### Isolation Mechanisms

The SDK employs several isolation mechanisms:

1. **Memory Scoping**: Data is isolated by scope
2. **Surface Containment**: UI is contained in defined boundaries
3. **Permission Boundaries**: Capabilities are limited by permissions
4. **Error Containment**: Errors are isolated to prevent cascading failures

### Secure Defaults

The SDK employs secure defaults:

- All permissions are denied by default
- Minimal access is granted initially
- Explicit opt-in for sensitive features
- Validation of all inputs
- Sanitization of rendered content

## Performance Architecture

The SDK is designed for optimal performance.

### Lazy Loading

Components and resources are loaded on demand:

```typescript
// Dynamic import for plugins
const loadPlugin = async (pluginId) => {
  // Only load when needed
  const pluginModule = await import(`./plugins/${pluginId}`);
  return pluginModule.default;
};
```

### Efficient State Management

State changes are batched and optimized:

```typescript
// Memory system batches updates
const { data, set } = useMemory('complex-state');

// These are batched into a single update
set({ ...data, prop1: 'value1' });
set({ ...data, prop2: 'value2' });
```

### Render Optimization

UI rendering is optimized:

- Virtual DOM diffing for framework integrations
- DOM reuse where possible
- Throttling of rapid updates
- Priority-based rendering queue

### Memory Efficiency

Memory usage is carefully managed:

- Resource cleanup on component unmount
- WeakRef and finalization registry for large resources
- Stream processing for large datasets
- Cleanup of unused subscriptions

This architecture guide provides an overview of how the Vibing AI SDK is designed and how its components work together. Understanding this architecture will help you build more effective applications and extend the SDK in powerful ways.

For more details on specific components, refer to the API documentation or the appropriate guide for that feature. 