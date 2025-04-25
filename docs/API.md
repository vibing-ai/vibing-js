# Vibing AI SDK API Reference

This document provides detailed information on the API of the Vibing AI JavaScript SDK.

## Table of Contents

- [App API](#app-api)
- [Memory API](#memory-api)
- [Permissions API](#permissions-api)
- [Events API](#events-api)

## App API

### `createApp(config: AppConfig): AppInstance`

Creates a new Vibing AI app instance.

**Parameters:**

- `config`: An object containing app configuration
  - `name` (required): String name of the app
  - `description`: Optional string description of the app
  - `permissions`: Optional array of permission strings (e.g., `['memory:read', 'memory:write']`)

**Returns:**

An `AppInstance` object with the following methods:

- `onInitialize(callback: () => Promise<void> | void): void` - Register initialization logic
- `onRender(callback: (container: HTMLElement) => Promise<void> | void): void` - Register rendering logic

**Example:**

```typescript
import { createApp } from '@vibing-ai/sdk';

const app = createApp({
  name: 'My App',
  description: 'A simple app',
  permissions: ['memory:read']
});

app.onInitialize(async () => {
  // Initialize state
});

app.onRender((container) => {
  container.innerHTML = '<div>App content</div>';
});
```

## Memory API

### `useMemory<T>(key: string, options?: MemoryOptions): MemoryResult<T>`

React hook for interacting with the memory system.

**Parameters:**

- `key`: String identifier for the memory item
- `options`: Optional configuration object
  - `scope`: Scope of the memory ('global', 'project', or 'conversation', default: 'conversation')
  - `fallback`: Default value if no data is found
  - `expiration`: Optional expiration time in milliseconds

**Returns:**

A `MemoryResult<T>` object with:

- `data`: The current value (or fallback if not loaded)
- `loading`: Boolean indicating if data is being loaded
- `error`: Error object if an error occurred, null otherwise
- `set(value: T): Promise<void>`: Function to update the value
- `update(updater: (currentValue: T | undefined) => T): Promise<void>`: Function to update based on current value
- `delete(): Promise<void>`: Function to delete the stored value

**Example:**

```typescript
import { useMemory } from '@vibing-ai/sdk';

function Counter() {
  const { data, loading, set } = useMemory<number>('counter', { 
    fallback: 0 
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Count: {data}</p>
      <button onClick={() => set(data + 1)}>Increment</button>
    </div>
  );
}
```

### `memory.get<T>(key: string, options?: MemoryOptions): Promise<T | undefined>`

Directly retrieve a value from memory (non-hook version).

### `memory.set<T>(key: string, value: T, options?: MemoryOptions): Promise<void>`

Directly set a value in memory (non-hook version).

### `memory.delete(key: string): Promise<void>`

Directly delete a value from memory (non-hook version).

### `memory.query(pattern: string | RegExp, scope?: string): Promise<Record<string, any>>`

Find memory items matching a pattern.

### `memory.subscribe<T>(key: string, callback: (value: T) => void): () => void`

Watch for changes to a memory item.

## Permissions API

### `usePermissions(): PermissionHook`

React hook for managing permissions.

**Returns:**

A `PermissionHook` object with:

- `request(request: PermissionRequest): Promise<PermissionResult>`: Request a permission
- `check(type: string, access: string[], scope?: string): Promise<boolean>`: Check if a permission exists
- `requestAll(requests: PermissionRequest[]): Promise<PermissionResult[]>`: Request multiple permissions
- `revoke(type: string, access?: string[], scope?: string): Promise<void>`: Revoke a permission

**PermissionRequest Interface:**

```typescript
interface PermissionRequest {
  type: string;         // e.g., 'memory', 'network'
  access: string[];     // e.g., ['read', 'write']
  scope?: string;       // e.g., 'conversation', 'project', 'global'
  duration?: number;    // Time in milliseconds
  purpose?: string;     // Explanation for the user
}
```

**Example:**

```typescript
import { usePermissions } from '@vibing-ai/sdk';

function PermissionDemo() {
  const { request } = usePermissions();
  
  const handleClick = async () => {
    const result = await request({
      type: 'memory',
      access: ['read', 'write'],
      scope: 'conversation',
      purpose: 'Save your preferences'
    });
    
    if (result.granted) {
      // Permission granted
    }
  };
  
  return <button onClick={handleClick}>Request Permission</button>;
}
```

### Non-Hook Permission Methods

- `permissions.request(request: PermissionRequest): Promise<PermissionResult>`
- `permissions.check(type: string, access: string[], scope?: string): Promise<boolean>`
- `permissions.revoke(type: string, access?: string[], scope?: string): Promise<void>`
- `permissions.getAll(): Promise<PermissionRecord[]>`

## Events API

### `useEvents(): EventsHook`

React hook for working with the events system.

**Returns:**

An `EventsHook` object with:

- `subscribe<T>(eventName: string, callback: (data: T) => void): () => void`: Listen for events
- `publish<T>(eventName: string, data: T): void`: Send an event
- `once<T>(eventName: string, callback: (data: T) => void): () => void`: Listen for a single occurrence

**Example:**

```typescript
import { useEvents } from '@vibing-ai/sdk';

function EventDemo() {
  const { subscribe, publish } = useEvents();
  
  useEffect(() => {
    const unsubscribe = subscribe('user:action', (data) => {
      console.log('User action:', data);
    });
    
    return unsubscribe;
  }, []);
  
  const triggerEvent = () => {
    publish('user:action', { type: 'button_click', timestamp: Date.now() });
  };
  
  return <button onClick={triggerEvent}>Trigger Event</button>;
}
```

### Non-Hook Event Methods

- `events.subscribe<T>(eventName: string, callback: (data: T) => void): () => void`
- `events.publish<T>(eventName: string, data: T): void`
- `events.once<T>(eventName: string, callback: (data: T) => void): () => void` 