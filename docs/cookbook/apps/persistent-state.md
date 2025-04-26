# Persistent State Management

## Problem

You need to save and restore application state between sessions, ensuring that user preferences, data, and application state persist even when the user closes and reopens your app.

## Solution

Use the SDK's memory system with persistent storage to save and load application state. The memory system provides a simple API for storing and retrieving data with different scopes and persistence options.

## Implementation

### Step 1: Define your state structure

First, define a TypeScript interface for your application state to ensure type safety:

```typescript
interface AppState {
  theme: 'light' | 'dark';
  fontSize: number;
  recentItems: string[];
  userProfile?: {
    name: string;
    email: string;
  };
  lastVisited: number;
}
```

### Step 2: Create a state hook

Create a custom hook that wraps the SDK's memory system for easier use:

```typescript
import { useMemory } from '@vibing-ai/sdk/common/memory';

export function useAppState() {
  const defaultState: AppState = {
    theme: 'light',
    fontSize: 16,
    recentItems: [],
    lastVisited: Date.now()
  };
  
  return useMemory<AppState>('app-state', {
    scope: 'global',        // Available across the entire app
    persistence: 'persistent', // Persists between sessions
    fallback: defaultState  // Default values if no state exists
  });
}
```

### Step 3: Use state in components

Use the custom hook in your components to access and update the state:

```typescript
import { useAppState } from './hooks/useAppState';

function SettingsComponent() {
  const { data: state, set: setState } = useAppState();
  
  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setState({
      ...state,
      theme: newTheme
    });
  };
  
  const changeFontSize = (size: number) => {
    setState({
      ...state,
      fontSize: size
    });
  };
  
  return (
    <div>
      <h2>Settings</h2>
      <div>
        <label>Theme: {state.theme}</label>
        <button onClick={toggleTheme}>Toggle Theme</button>
      </div>
      <div>
        <label>Font Size: {state.fontSize}px</label>
        <button onClick={() => changeFontSize(state.fontSize - 1)}>-</button>
        <button onClick={() => changeFontSize(state.fontSize + 1)}>+</button>
      </div>
    </div>
  );
}
```

### Step 4: Update state on app lifecycle events

Update the state on app lifecycle events, such as when the app is initialized or closed:

```typescript
import { createApp } from '@vibing-ai/sdk';
import { useAppState } from './hooks/useAppState';

const app = createApp({
  name: 'My App',
  version: '1.0.0',
  permissions: ['memory:read', 'memory:write']
});

app.onInitialize(async () => {
  const { data: state, set: setState } = useAppState();
  
  // Update the last visited timestamp
  setState({
    ...state,
    lastVisited: Date.now()
  });
  
  console.log('App initialized with state:', state);
});

app.onCleanup(async () => {
  const { data: state, set: setState } = useAppState();
  
  // Save any final state updates
  setState({
    ...state,
    // Any cleanup updates
  });
  
  console.log('App state saved before cleanup');
});
```

### Step 5: Handle multiple state slices (optional)

For more complex apps, you might want to split your state into multiple slices:

```typescript
// hooks/useUserState.ts
export function useUserState() {
  return useMemory('user-state', {
    scope: 'global',
    persistence: 'persistent',
    fallback: {
      name: '',
      preferences: {},
      savedItems: []
    }
  });
}

// hooks/useViewState.ts
export function useViewState() {
  return useMemory('view-state', {
    scope: 'project', // Only persists within the current project
    persistence: 'session', // Only persists within the current session
    fallback: {
      currentPage: 'home',
      scrollPosition: 0,
      filters: {}
    }
  });
}
```

## Usage Example

Here's a complete example showing how to use persistent state in a simple app:

```typescript
import { createApp } from '@vibing-ai/sdk';
import { useMemory } from '@vibing-ai/sdk/common/memory';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// Define state type
interface AppState {
  theme: 'light' | 'dark';
  notes: string[];
  lastSaved: number;
}

// Create app
const app = createApp({
  name: 'Note Taking App',
  version: '1.0.0',
  permissions: ['memory:read', 'memory:write']
});

// App component
function NoteApp() {
  const { data: state, set: setState } = useMemory<AppState>('app-state', {
    scope: 'global',
    persistence: 'persistent',
    fallback: {
      theme: 'light',
      notes: [],
      lastSaved: Date.now()
    }
  });
  
  const [newNote, setNewNote] = useState('');
  
  const addNote = () => {
    if (newNote.trim()) {
      setState({
        ...state,
        notes: [...state.notes, newNote],
        lastSaved: Date.now()
      });
      setNewNote('');
    }
  };
  
  const removeNote = (index: number) => {
    const updatedNotes = [...state.notes];
    updatedNotes.splice(index, 1);
    setState({
      ...state,
      notes: updatedNotes,
      lastSaved: Date.now()
    });
  };
  
  const toggleTheme = () => {
    setState({
      ...state,
      theme: state.theme === 'light' ? 'dark' : 'light'
    });
  };
  
  // Apply theme
  useEffect(() => {
    document.body.className = state.theme;
  }, [state.theme]);
  
  return (
    <div className="note-app">
      <header>
        <h1>Note Taking App</h1>
        <button onClick={toggleTheme}>
          Switch to {state.theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </header>
      
      <div className="add-note">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter a new note"
        />
        <button onClick={addNote}>Add Note</button>
      </div>
      
      <div className="notes-list">
        {state.notes.length === 0 ? (
          <p>No notes yet. Add one above!</p>
        ) : (
          <ul>
            {state.notes.map((note, index) => (
              <li key={index}>
                {note}
                <button onClick={() => removeNote(index)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <footer>
        <p>Last saved: {new Date(state.lastSaved).toLocaleString()}</p>
      </footer>
    </div>
  );
}

// Initialize and render app
app.onInitialize(() => {
  console.log('Note app initialized');
});

app.onRender((container) => {
  ReactDOM.render(<NoteApp />, container);
});
```

## Variations

### Using Session Storage Only

For temporary state that should not persist between sessions:

```typescript
const { data, set } = useMemory('temporary-state', {
  scope: 'global',
  persistence: 'session', // Only persists within the current session
  fallback: { /* default values */ }
});
```

### Using Encryption for Sensitive Data

For sensitive user data that requires additional protection:

```typescript
const { data, set } = useMemory('sensitive-user-data', {
  scope: 'global',
  persistence: 'persistent',
  encryption: true, // Enable encryption for this data
  fallback: { /* default values */ }
});
```

### Using Multiple Scopes

Different scopes for different state slices:

```typescript
// Global settings
const { data: globalSettings } = useMemory('global-settings', {
  scope: 'global',
  persistence: 'persistent'
});

// Project-specific settings
const { data: projectSettings } = useMemory('project-settings', {
  scope: 'project',
  persistence: 'persistent'
});

// Conversation-specific state
const { data: conversationState } = useMemory('conversation-state', {
  scope: 'conversation',
  persistence: 'persistent'
});
```

## Related Recipes

- [Error Handling](./error-handling.md) - Add error handling to state operations
- [Event Communication](../general/event-communication.md) - Communicate state changes across components
- [Performance Optimization](./performance-optimization.md) - Optimize state management for performance 