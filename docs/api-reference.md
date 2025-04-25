# Vibing AI SDK API Reference

This document provides detailed documentation for all modules, functions, classes, and types available in the Vibing AI JavaScript SDK.

## Table of Contents

- [App](#app)
  - [createApp](#createapp)
  - [App Interface](#app-interface)
- [Common](#common)
  - [Memory](#memory)
  - [Permissions](#permissions)
  - [Events](#events)
  - [Super-Agent](#super-agent)
- [Surfaces](#surfaces)
  - [Canvas](#canvas)
  - [Conversation Cards](#conversation-cards)
  - [Context Panels](#context-panels)
  - [Modal Dialogs](#modal-dialogs)

## App

### createApp

Creates a new Vibing AI app.

```typescript
function createApp(config: AppConfig): App
```

#### Parameters

- `config` - Configuration for the app
  - `name` (string): Name of the app
  - `description` (string): Description of the app
  - `permissions` (string[]): Permissions required by the app
  - `version` (string): Version of the app

#### Returns

- `App` object with lifecycle methods

#### Example

```typescript
import { createApp } from '@vibing-ai/sdk';

const app = createApp({
  name: 'My App',
  description: 'A simple example app',
  permissions: ['memory:read', 'memory:write'],
  version: '1.0.0'
});
```

### App Interface

```typescript
interface App {
  /**
   * Registers initialization logic to run when the app starts
   */
  onInitialize(callback: () => void | Promise<void>): void;
  
  /**
   * Registers cleanup logic to run when the app is closed
   */
  onCleanup(callback: () => void | Promise<void>): void;
  
  /**
   * Registers render logic to display the app's UI
   */
  onRender(callback: (container: HTMLElement) => void): void;
}
```

## Common

### Memory

#### useMemory

Hook for accessing and manipulating the memory system.

```typescript
function useMemory<T = any>(
  key: string, 
  options?: MemoryOptions
): MemoryResult<T>
```

#### Parameters

- `key` (string): Unique identifier for the memory item
- `options` (MemoryOptions, optional):
  - `scope` ('global' | 'project' | 'conversation'): Scope of visibility
  - `fallback` (T): Default value if no data exists
  - `sync` (boolean): Whether to sync across clients

#### Returns

`MemoryResult<T>` with:
- `data` (T): The current value
- `loading` (boolean): Whether the data is still loading
- `error` (Error | null): Error if one occurred
- `set` (function): Updates the value
- `clear` (function): Clears the value

#### Example

```typescript
import { useMemory } from '@vibing-ai/sdk/common/memory';

// Basic usage
const { data, loading, error, set, clear } = useMemory('user-preferences', {
  scope: 'global',
  fallback: { theme: 'light' }
});

// Typed usage
interface UserData {
  name: string;
  preferences: {
    darkMode: boolean;
    fontSize: number;
  };
}

const { data: userData, set: setUserData } = useMemory<UserData>('user:data', {
  scope: 'project',
  fallback: {
    name: 'Anonymous',
    preferences: {
      darkMode: false,
      fontSize: 14
    }
  }
});
```

### Permissions

#### usePermissions

Hook for managing permission requests and checks.

```typescript
function usePermissions(): PermissionsResult
```

#### Returns

`PermissionsResult` with:
- `request`: Function to request permissions
- `check`: Function to check if a permission is granted
- `revoke`: Function to revoke a permission

#### Example

```typescript
import { usePermissions } from '@vibing-ai/sdk/common/permissions';

const { request, check, revoke } = usePermissions();

// Request permission
const requestAccess = async () => {
  const result = await request({
    type: 'memory',
    access: ['read', 'write'],
    scope: 'conversation',
    purpose: 'Store your preferences'
  });
  
  if (result.granted) {
    // Permission was granted
  }
};

// Check if permission exists
const canReadMemory = check({
  type: 'memory',
  access: 'read',
  scope: 'conversation'
});

// Revoke permission
const removeAccess = () => {
  revoke({
    type: 'memory',
    access: 'write',
    scope: 'conversation'
  });
};
```

### Events

#### useEvents

Hook for subscribing to and publishing events.

```typescript
function useEvents(): EventsResult
```

#### Returns

`EventsResult` with:
- `subscribe`: Function to subscribe to an event
- `publish`: Function to publish an event
- `unsubscribe`: Function to unsubscribe from an event

#### Example

```typescript
import { useEvents } from '@vibing-ai/sdk/common/events';

const { subscribe, publish, unsubscribe } = useEvents();

// Subscribe to an event
const handleUserAction = (data) => {
  console.log('User action occurred:', data);
};

// Subscribe with options
const unsubscribeFunc = subscribe('user:action', handleUserAction, {
  maxCalls: 5,       // Auto-unsubscribe after 5 calls
  timeout: 60000,    // Auto-unsubscribe after 1 minute
  priority: 'high'   // Higher priority handling
});

// Publish an event
publish('user:action', {
  action: 'click',
  element: 'button',
  timestamp: Date.now()
});

// Unsubscribe when no longer needed
unsubscribeFunc();
// or
unsubscribe('user:action', handleUserAction);
```

### Super-Agent

#### useSuperAgent

Hook for interacting with the Super Agent.

```typescript
function useSuperAgent(): SuperAgentResult
```

#### Returns

`SuperAgentResult` with:
- `askSuperAgent`: Function to ask the Super Agent a question
- `suggestAction`: Function to suggest an action to the user
- `getConversationContext`: Function to get the current conversation context
- `onIntent`: Function to register an intent handler
- `handleIntent`: Function to manually handle an intent

#### Example

```typescript
import { useSuperAgent } from '@vibing-ai/sdk/common/super-agent';

const { 
  askSuperAgent, 
  suggestAction, 
  getConversationContext,
  onIntent 
} = useSuperAgent();

// Ask the Super Agent a question
const handleUserQuery = async (userQuery) => {
  const response = await askSuperAgent(userQuery, {
    includeHistory: true,
    contextItems: [
      { content: 'User is analyzing financial data' }
    ]
  });
  
  console.log(response.text);
  
  // Handle suggested actions
  if (response.suggestedActions?.length) {
    displayActions(response.suggestedActions);
  }
};

// Suggest an action programmatically
const suggestAnalysis = () => {
  suggestAction({
    type: 'analysis',
    title: 'Analyze Data',
    description: 'Run an analysis on the current dataset',
    icon: 'chart-line',
    action: () => runDataAnalysis()
  });
};

// Handle a specific intent
const unregister = onIntent('createChart', (intent, params) => {
  const { chartType, dataSource } = params;
  createChart(chartType, dataSource);
});
```

## Surfaces

### Canvas

#### useCanvas

Hook for interacting with the Canvas surface.

```typescript
function useCanvas(): CanvasResult
```

#### Returns

`CanvasResult` with:
- `blocks`: Array of current blocks
- `selection`: Array of currently selected block IDs
- `createBlock`: Function to create a new block
- `updateBlock`: Function to update a block
- `deleteBlock`: Function to delete a block
- `getBlock`: Function to get a block by ID
- `setSelection`: Function to set the selection
- `onSelectionChange`: Function to subscribe to selection changes

#### Example

```typescript
import { useCanvas } from '@vibing-ai/sdk/surfaces/canvas';

const { 
  blocks, 
  selection, 
  createBlock, 
  updateBlock, 
  deleteBlock,
  setSelection,
  onSelectionChange
} = useCanvas();

// Create a new block
const newBlockId = createBlock('text', 'Hello world');

// Update the block
updateBlock(newBlockId, 'Updated content');

// Select the block
setSelection([newBlockId]);

// Listen for selection changes
const unsubscribe = onSelectionChange((selectedIds) => {
  console.log('Selection changed:', selectedIds);
});

// Clean up when done
unsubscribe();
```

#### createBlock

Creates a block definition for use with Canvas.

```typescript
function createBlock(config: BlockConfig): BlockConfig
```

#### Parameters

- `config` (BlockConfig):
  - `type` (string): Unique type identifier
  - `title` (string): Display title
  - `icon` (string, optional): Icon to display
  - `defaultContent` (any, optional): Default content for new blocks
  - `validate` (function, optional): Content validation function
  - `render` (function): Function to render the block in view mode
  - `edit` (function): Function to render the block in edit mode

#### Returns

The validated block configuration

#### Example

```typescript
import { createBlock } from '@vibing-ai/sdk/surfaces/canvas';

const TextBlock = createBlock({
  type: 'text',
  title: 'Text Block',
  icon: 'text',
  defaultContent: '',
  validate: (content) => {
    if (typeof content !== 'string') {
      return 'Content must be a string';
    }
    return true;
  },
  render: ({ content, id }) => (
    <div className="text-block">{content}</div>
  ),
  edit: ({ content, onChange, onSave, onCancel }) => (
    <div className="text-block-editor">
      <textarea 
        value={content} 
        onChange={(e) => onChange(e.target.value)} 
      />
      <button onClick={onSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
});
```

### Conversation Cards

#### createConversationCard

Creates a conversation card to be displayed in the conversation.

```typescript
function createConversationCard(config: CardConfig | ReactNode): ConversationCard
```

#### Parameters

- `config` (CardConfig | ReactNode):
  - If ReactNode: Direct content to display
  - If CardConfig:
    - `content` (ReactNode): Main content of the card
    - `actions` (ReactNode, optional): Action buttons or links
    - `metadata` (object, optional): Additional metadata
    - `style` (object, optional): Custom styling

#### Returns

`ConversationCard` with:
- `id`: Unique ID for the card
- `config`: Configuration used to create the card
- `update`: Function to update the card
- `remove`: Function to remove the card

#### Example

```typescript
import { createConversationCard } from '@vibing-ai/sdk/surfaces/cards';

// Simple card with just content
const simpleCard = createConversationCard(
  <div>This is a simple card</div>
);

// Full configuration
const card = createConversationCard({
  content: (
    <div>
      <h2>Important Information</h2>
      <p>Here's some important information for you.</p>
    </div>
  ),
  actions: (
    <div className="card-actions">
      <button onClick={handleAction}>Take Action</button>
      <a href="#more">Learn More</a>
    </div>
  ),
  metadata: {
    source: 'system',
    timestamp: Date.now()
  },
  style: {
    backgroundColor: '#f8f9fa'
  }
});

// Update card later
card.update({
  content: <div>Updated content</div>
});

// Remove card when no longer needed
card.remove();
```

### Context Panels

#### createContextPanel

Creates a context panel to display additional information.

```typescript
function createContextPanel(config: PanelConfig | ReactNode): ContextPanel
```

#### Parameters

- `config` (PanelConfig | ReactNode):
  - If ReactNode: Direct content to display
  - If PanelConfig:
    - `content` (ReactNode): Main content of the panel
    - `title` (string, optional): Panel title
    - `actions` (ReactNode, optional): Action buttons or links for the header
    - `footer` (ReactNode, optional): Footer content
    - `width` (number | string, optional): Panel width
    - `metadata` (object, optional): Additional metadata

#### Returns

`ContextPanel` with:
- `id`: Unique ID for the panel
- `config`: Configuration used to create the panel
- `update`: Function to update the panel
- `remove`: Function to remove the panel
- `show`: Function to show the panel
- `hide`: Function to hide the panel

#### Example

```typescript
import { createContextPanel } from '@vibing-ai/sdk/surfaces/panels';

// Simple panel with just content
const simplePanel = createContextPanel(
  <div>This is a simple panel</div>
);

// Full configuration
const panel = createContextPanel({
  title: 'User Profile',
  content: (
    <div className="user-profile">
      <img src="avatar.jpg" alt="User" />
      <h2>John Doe</h2>
      <p>Developer</p>
    </div>
  ),
  actions: (
    <button onClick={editProfile}>Edit</button>
  ),
  footer: (
    <small>Last updated: Today</small>
  ),
  width: 320,
  metadata: {
    userId: '123'
  }
});

// Update panel later
panel.update({
  content: <div>Updated profile</div>
});

// Show/hide panel
panel.hide();
panel.show();

// Remove panel when no longer needed
panel.remove();
```

### Modal Dialogs

#### useModal

Hook for creating and managing modal dialogs.

```typescript
function useModal(): ModalResult
```

#### Returns

`ModalResult` with:
- `showModal`: Function to show a modal dialog
- `hideModal`: Function to hide a modal by ID
- `updateModal`: Function to update a modal by ID

#### Example

```typescript
import { useModal } from '@vibing-ai/sdk/surfaces/modals';

const { showModal, hideModal, updateModal } = useModal();

// Show a modal
const handleShowConfirmation = async () => {
  const modal = showModal({
    title: 'Confirm Action',
    content: (
      <div>
        <p>Are you sure you want to proceed?</p>
        <p>This action cannot be undone.</p>
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
    // User confirmed, proceed with the action
    performAction();
  }
};

// Update an existing modal
const updateModalContent = (modalId, newContent) => {
  updateModal(modalId, {
    content: newContent
  });
};

// Hide a modal programmatically
const closeModal = (modalId) => {
  hideModal(modalId);
};
```

#### ModalInstance

```typescript
interface ModalInstance<T = any> {
  /**
   * Unique ID for the modal
   */
  id: string;
  
  /**
   * Function to hide the modal with an optional result
   */
  hide: (result?: T) => void;
  
  /**
   * Function to update the modal content
   */
  update: (newConfig: Partial<ModalConfig>) => void;
  
  /**
   * Promise that resolves when the modal is closed
   */
  result: Promise<T | undefined>;
}
``` 