# Vibing AI SDK API Reference

This document provides detailed documentation for all modules, functions, classes, and types available in the Vibing AI JavaScript SDK.

> **Note:** This comprehensive reference includes the core API documentation previously available in `API.md`, now merged into this single file for easier reference.

## Table of Contents

- [App](#app)
  - [createApp](#createapp)
  - [App Interface](#app-interface)
- [Common](#common)
  - [Memory](#memory)
  - [Permissions](#permissions)
  - [Events](#events)
  - [Super-Agent](#super-agent)
  - [Errors](#errors)
  - [Version](#version)
- [Surfaces](#surfaces)
  - [Canvas](#canvas)
  - [Conversation Cards](#conversation-cards)
  - [Context Panels](#context-panels)
  - [Modal Dialogs](#modal-dialogs)
- [Plugins](#plugins)
  - [createPlugin](#createplugin) 
  - [Plugin Lifecycle](#plugin-lifecycle)
- [Agents](#agents)
  - [createAgent](#createagent)
  - [Agent Interface](#agent-interface)
- [Types](#types)
  - [Utility Types](#utility-types)
  - [Common Types](#common-types)

## App

### createApp

Creates a new Vibing AI app with the specified configuration.

```typescript
/**
 * Creates a new Vibing AI app with the specified configuration.
 * 
 * @param config - Configuration for the app
 * @returns An App instance with lifecycle methods
 * 
 * @example
 * // Basic app creation
 * const app = createApp({
 *   name: 'My App',
 *   description: 'A simple example app',
 *   permissions: ['memory:read', 'memory:write'],
 *   version: '1.0.0'
 * });
 * 
 * @example
 * // App with initialization
 * const app = createApp({
 *   name: 'Advanced App',
 *   description: 'An app with initialization',
 *   permissions: ['memory:read', 'memory:write', 'network:fetch'],
 *   version: '1.0.0'
 * });
 * 
 * app.onInitialize(async () => {
 *   // Perform initialization tasks
 *   await loadUserData();
 * });
 */
function createApp(config: AppConfig): App
```

#### Parameters

- `config` - Configuration for the app
  - `name` (string): Name of the app
  - `description` (string): Description of the app
  - `permissions` (string[]): Permissions required by the app
  - `version` (string): Version of the app
  - `theme` (ThemeConfig, optional): Custom theming options
  - `debug` (boolean, optional): Enable debug mode

#### Returns

- `App` object with lifecycle methods

#### Example

```typescript
import { createApp } from '@vibing-ai/sdk';

// Basic app with minimal configuration
const app = createApp({
  name: 'My App',
  description: 'A simple example app',
  permissions: ['memory:read', 'memory:write'],
  version: '1.0.0'
});

// App with custom theme
const themedApp = createApp({
  name: 'Themed App',
  description: 'An app with custom theming',
  permissions: ['memory:read', 'memory:write'],
  version: '1.0.0',
  theme: {
    primaryColor: '#4A7DFF',
    secondaryColor: '#34D399',
    fontFamily: 'Poppins, sans-serif'
  }
});

// Debug mode app for development
const debugApp = createApp({
  name: 'Debug App',
  description: 'An app with debug mode enabled',
  permissions: ['memory:read', 'memory:write'],
  version: '1.0.0',
  debug: true
});
```

### App Interface

The core interface for a Vibing AI app, providing lifecycle methods and configuration options.

```typescript
/**
 * Core interface for a Vibing AI app, providing lifecycle methods 
 * and configuration options.
 */
interface App {
  /**
   * Registers initialization logic to run when the app starts.
   * Use this for setup tasks, data loading, and other initialization needs.
   * 
   * @param callback - Function to execute during initialization
   * @returns The app instance for chaining
   * 
   * @example
   * app.onInitialize(async () => {
   *   await loadUserPreferences();
   *   setupEventListeners();
   * });
   */
  onInitialize(callback: () => void | Promise<void>): App;
  
  /**
   * Registers cleanup logic to run when the app is closed.
   * Use this for resource cleanup, saving state, and other teardown tasks.
   * 
   * @param callback - Function to execute during cleanup
   * @returns The app instance for chaining
   * 
   * @example
   * app.onCleanup(() => {
   *   saveUserState();
   *   removeEventListeners();
   * });
   */
  onCleanup(callback: () => void | Promise<void>): App;
  
  /**
   * Registers render logic to display the app's UI.
   * The container element is provided by the hosting environment.
   * 
   * @param callback - Function to render the app's UI
   * @returns The app instance for chaining
   * 
   * @example
   * app.onRender((container) => {
   *   const appRoot = document.createElement('div');
   *   appRoot.innerHTML = '<h1>Hello World</h1>';
   *   container.appendChild(appRoot);
   * });
   */
  onRender(callback: (container: HTMLElement) => void): App;
  
  /**
   * Access the app's configuration properties.
   * 
   * @returns The app's configuration object
   */
  getConfig(): AppConfig;
  
  /**
   * Updates specific configuration properties.
   * 
   * @param updates - Partial configuration updates
   * @returns The app instance for chaining
   */
  updateConfig(updates: Partial<AppConfig>): App;
}
```

## Common

### Memory

#### useMemory

Hook for accessing and manipulating the memory system with optional type safety.

```typescript
/**
 * Hook for accessing and manipulating the memory system with optional type safety.
 * 
 * @template T - Type of the stored data
 * @param key - Unique identifier for the memory item
 * @param options - Configuration options for memory storage
 * @returns MemoryResult with data and operations
 * 
 * @example
 * // Basic untyped usage
 * const { data, set } = useMemory('user-preferences');
 * 
 * @example
 * // With type safety and options
 * interface UserPrefs {
 *   theme: 'light' | 'dark';
 *   fontSize: number;
 * }
 * 
 * const { data, set } = useMemory<UserPrefs>('user-preferences', {
 *   scope: 'global',
 *   fallback: { theme: 'light', fontSize: 16 },
 *   sync: true
 * });
 * 
 * // Type-safe operations
 * if (data.theme === 'dark') {
 *   set({ ...data, fontSize: data.fontSize + 1 });
 * }
 */
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
  - `persistance` ('session' | 'persistent'): Storage duration
  - `encryption` (boolean): Whether to encrypt the data

#### Returns

`MemoryResult<T>` with:
- `data` (T): The current value
- `loading` (boolean): Whether the data is still loading
- `error` (Error | null): Error if one occurred
- `set` (function): Updates the value
- `clear` (function): Clears the value
- `refresh` (function): Refreshes the data from storage
- `metadata` (object): Information about the memory item

#### Example

```typescript
import { useMemory } from '@vibing-ai/sdk/common/memory';

// Basic usage
const { data, loading, error, set, clear } = useMemory('user-preferences', {
  scope: 'global',
  fallback: { theme: 'light' }
});

// Update value
set({ theme: 'dark' });

// Clear value
clear();

// Typed usage
interface UserData {
  name: string;
  preferences: {
    darkMode: boolean;
    fontSize: number;
  };
}

const { 
  data: userData, 
  set: setUserData,
  refresh,
  metadata
} = useMemory<UserData>('user:data', {
  scope: 'project',
  fallback: {
    name: 'Anonymous',
    preferences: {
      darkMode: false,
      fontSize: 14
    }
  },
  sync: true,
  persistance: 'persistent',
  encryption: true
});

// Using with async operations
const loadUserData = async () => {
  try {
    const response = await fetch('/api/user');
    const userData = await response.json();
    setUserData(userData);
  } catch (err) {
    console.error('Failed to load user data', err);
    // Default fallback will be used
  }
};
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

### Errors

#### Error Classes

Standardized error classes for consistent error handling throughout the SDK.

```typescript
/**
 * Base error class for all SDK-related errors
 * @extends Error
 */
class SDKError extends Error {
  /** Unique error code */
  code: string;
  /** Additional context for the error */
  context: Record<string, any>;
  
  /**
   * Creates a new SDK error
   * 
   * @param message - Human-readable error message
   * @param code - Error code for programmatic handling
   * @param context - Additional error context
   */
  constructor(message: string, code: string, context?: Record<string, any>);
}

/**
 * Error thrown when input validation fails
 * @extends SDKError
 */
class ValidationError extends SDKError {
  /** The validation issues encountered */
  validationIssues: ValidationIssue[];
  
  /**
   * Creates a new validation error
   * 
   * @param message - Human-readable error message
   * @param validationIssues - Details on validation failures
   */
  constructor(message: string, validationIssues: ValidationIssue[]);
}

/**
 * Error thrown when a permission is denied
 * @extends SDKError
 */
class PermissionError extends SDKError {
  /** The permission that was denied */
  permission: Permission;
  
  /**
   * Creates a new permission error
   * 
   * @param message - Human-readable error message
   * @param permission - The permission that was denied
   */
  constructor(message: string, permission: Permission);
}

/**
 * Error thrown for network-related issues
 * @extends SDKError 
 */
class NetworkError extends SDKError {
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Response body if available */
  response?: any;
  
  /**
   * Creates a new network error
   * 
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code if applicable
   * @param response - Response body if available
   */
  constructor(message: string, statusCode?: number, response?: any);
}
```

#### Error Utilities

Helper functions for working with errors.

```typescript
/**
 * Creates an appropriate error instance based on the error type
 * 
 * @param errorType - Type of error to create
 * @param message - Error message
 * @param options - Additional options for the error
 * @returns An instance of the appropriate error class
 * 
 * @example
 * // Create a validation error
 * const error = createError('validation', 'Invalid input', {
 *   validationIssues: [
 *     { field: 'email', message: 'Invalid email format' }
 *   ]
 * });
 * 
 * @example
 * // Create a permission error
 * const error = createError('permission', 'Cannot access memory', {
 *   permission: { type: 'memory', access: 'write', scope: 'global' }
 * });
 */
function createError(
  errorType: ErrorType,
  message: string,
  options?: ErrorOptions
): SDKError;

/**
 * Type guard to check if an error is an SDK error
 * 
 * @param error - Error to check
 * @returns Whether the error is an SDK error
 * 
 * @example
 * try {
 *   // Some operation that might throw
 * } catch (error) {
 *   if (isSDKError(error)) {
 *     // Handle SDK error with access to error code, etc.
 *     console.error(`SDK Error ${error.code}: ${error.message}`);
 *   } else {
 *     // Handle generic error
 *     console.error('Unknown error:', error);
 *   }
 * }
 */
function isSDKError(error: unknown): error is SDKError;

/**
 * Formats an error for display or logging
 * 
 * @param error - Error to format
 * @param options - Formatting options
 * @returns Formatted error string
 * 
 * @example
 * try {
 *   // Some operation that might throw
 * } catch (error) {
 *   console.error(formatError(error, { includeStack: true }));
 * }
 */
function formatError(
  error: unknown, 
  options?: { includeStack?: boolean; includeContext?: boolean }
): string;
```

#### Error Recovery

Utilities for error recovery strategies.

```typescript
/**
 * Executes a function with retry logic for transient errors
 * 
 * @param fn - Function to execute
 * @param options - Retry options
 * @returns Result of the function
 * 
 * @example
 * const result = await retry(
 *   async () => await fetchData(),
 *   {
 *     maxAttempts: 3,
 *     retryDelay: 1000,
 *     retryableErrors: [NetworkError]
 *   }
 * );
 */
async function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T>;

/**
 * Provides a fallback value if an operation fails
 * 
 * @param fn - Function to execute
 * @param fallbackValue - Value to return if the function fails
 * @returns Result of the function or fallback value
 * 
 * @example
 * const userData = await fallback(
 *   async () => await fetchUserData(),
 *   { name: 'Guest', role: 'visitor' }
 * );
 */
async function fallback<T>(
  fn: () => Promise<T>,
  fallbackValue: T
): Promise<T>;
```

### Version

Utilities for version checking and compatibility.

```typescript
/**
 * Checks compatibility between current SDK version and a dependency
 * 
 * @param dependencyName - Name of the dependency
 * @param dependencyVersion - Version of the dependency
 * @returns Compatibility result
 * 
 * @example
 * const compatibility = checkCompatibility('@vibing-ai/block-kit', '1.2.3');
 * 
 * if (!compatibility.isCompatible) {
 *   console.warn(compatibility.message);
 * }
 */
function checkCompatibility(
  dependencyName: string,
  dependencyVersion: string
): CompatibilityResult;

/**
 * Determines if two semantic version ranges are compatible
 * 
 * @param versionA - First version
 * @param versionB - Second version
 * @param options - Compatibility options
 * @returns Whether the versions are compatible
 * 
 * @example
 * // Check if versions are compatible
 * const compatible = isCompatible('1.2.3', '1.x.x');
 * 
 * // Check with strict option
 * const strictlyCompatible = isCompatible('1.2.3', '1.2.x', { strict: true });
 */
function isCompatible(
  versionA: string,
  versionB: string,
  options?: { strict?: boolean }
): boolean;

/**
 * Class for handling version comparisons and manipulations
 */
class Version {
  /**
   * Creates a new Version instance
   * 
   * @param version - Version string
   */
  constructor(version: string);
  
  /**
   * Compares this version to another version
   * 
   * @param other - Version to compare to
   * @returns Comparison result (-1, 0, 1)
   */
  compareTo(other: Version | string): number;
  
  /**
   * Checks if this version satisfies a version range
   * 
   * @param range - Version range
   * @returns Whether this version satisfies the range
   */
  satisfies(range: string): boolean;
  
  /**
   * Gets the major version number
   */
  getMajor(): number;
  
  /**
   * Gets the minor version number
   */
  getMinor(): number;
  
  /**
   * Gets the patch version number
   */
  getPatch(): number;
  
  /**
   * Converts to string representation
   */
  toString(): string;
}
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

## Plugins

### createPlugin

Creates a new plugin with the specified configuration.

```typescript
function createPlugin(config: PluginConfig): Plugin
```

#### Parameters

- `config` (PluginConfig):
  - `name` (string): Name of the plugin
  - `description` (string): Description of the plugin
  - `version` (string): Version of the plugin
  - `theme` (ThemeConfig, optional): Custom theming options
  - `debug` (boolean, optional): Enable debug mode

#### Returns

- `Plugin` object with lifecycle methods

#### Example

```typescript
import { createPlugin } from '@vibing-ai/sdk/plugins';

const plugin = createPlugin({
  name: 'My Plugin',
  description: 'A simple example plugin',
  version: '1.0.0'
});
```

### Plugin Lifecycle

```typescript
interface Plugin {
  /**
   * Registers initialization logic to run when the plugin starts
   */
  onInitialize(callback: () => void | Promise<void>): void;
  
  /**
   * Registers cleanup logic to run when the plugin is closed
   */
  onCleanup(callback: () => void | Promise<void>): void;
  
  /**
   * Registers render logic to display the plugin's UI
   */
  onRender(callback: (container: HTMLElement) => void): void;
}
```

## Agents

### createAgent

Creates a new agent with the specified configuration.

```typescript
function createAgent(config: AgentConfig): Agent
```

#### Parameters

- `config` (AgentConfig):
  - `name` (string): Name of the agent
  - `description` (string): Description of the agent
  - `version` (string): Version of the agent
  - `theme` (ThemeConfig, optional): Custom theming options
  - `debug` (boolean, optional): Enable debug mode

#### Returns

- `Agent` object with lifecycle methods

#### Example

```typescript
import { createAgent } from '@vibing-ai/sdk/agents';

const agent = createAgent({
  name: 'My Agent',
  description: 'A simple example agent',
  version: '1.0.0'
});
```

### Agent Interface

```typescript
interface Agent {
  /**
   * Registers initialization logic to run when the agent starts
   */
  onInitialize(callback: () => void | Promise<void>): void;
  
  /**
   * Registers cleanup logic to run when the agent is closed
   */
  onCleanup(callback: () => void | Promise<void>): void;
  
  /**
   * Registers render logic to display the agent's UI
   */
  onRender(callback: (container: HTMLElement) => void): void;
}
```

## Types

### Utility Types

```typescript
// ... existing utility types ...
```

### Common Types

```typescript
// ... existing common types ...
``` 