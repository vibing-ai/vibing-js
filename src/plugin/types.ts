/**
 * Type definitions for plugin creation and management
 */
import { ReactNode } from 'react';
import { PermissionRequest } from '../core/permissions/types';

/**
 * JSON Schema definition for function parameters
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
}

/**
 * JSON Schema property type
 */
export interface JSONSchemaProperty {
  type: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  format?: string;
  [key: string]: unknown;
}

/**
 * Function definition for plugin functions that can be called by the Super Agent
 */
export interface FunctionDefinition {
  /**
   * Unique name for the function
   */
  name: string;

  /**
   * Description of what the function does
   */
  description: string;

  /**
   * JSON Schema defining the function parameters
   */
  parameters: JSONSchema;

  /**
   * Function handler that will be called when the function is invoked
   */
  handler: (params: Record<string, unknown>) => Promise<unknown> | unknown;
}

/**
 * Configuration for conversation cards surface
 */
export interface ConversationCardConfig {
  /**
   * Default content to display in the card
   */
  defaultContent?: ReactNode | string;

  /**
   * Styling options for the card
   */
  styles?: Record<string, string | number>;

  /**
   * Handlers for card events
   */
  handlers?: Record<string, (event: unknown) => void>;
}

/**
 * Configuration for context panels surface
 */
export interface ContextPanelConfig {
  /**
   * Default title for the panel
   */
  defaultTitle?: string;

  /**
   * Default content to display in the panel
   */
  defaultContent?: ReactNode | string;

  /**
   * Default width of the panel
   */
  defaultWidth?: number | string;

  /**
   * Default footer content
   */
  defaultFooter?: ReactNode | string;

  /**
   * Styling options for the panel
   */
  styles?: Record<string, string | number>;

  /**
   * Handlers for panel events
   */
  handlers?: Record<string, (event: unknown) => void>;
}

/**
 * Configuration for command interface surface
 */
export interface CommandInterfaceConfig {
  /**
   * List of available commands
   */
  commands: Array<{
    name: string;
    description: string;
    handler: (args: string[]) => void | Promise<void>;
  }>;
}

/**
 * Context provided to plugin during initialization and execution
 */
export interface PluginContext {
  /**
   * Access to memory system
   */
  memory: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };

  /**
   * Access to permissions system
   */
  permissions: {
    request: (permission: PermissionRequest) => Promise<boolean>;
    check: (permission: string) => Promise<boolean>;
  };

  /**
   * Access to event system
   */
  events: {
    publish: (eventName: string, payload?: unknown) => void;
    subscribe: (eventName: string, callback: (payload: unknown) => void) => () => void;
  };

  /**
   * Access to surface interfaces
   */
  surfaces: Record<string, unknown>;
}

/**
 * Configuration options for creating a Vibing AI plugin
 */
export interface PluginConfig {
  /**
   * Unique identifier for the plugin
   */
  id: string;

  /**
   * Display name for the plugin
   */
  name: string;

  /**
   * Version of the plugin (semver)
   */
  version: string;

  /**
   * Optional plugin description
   */
  description?: string;

  /**
   * Required permissions for the plugin to function
   */
  permissions: PermissionRequest[];

  /**
   * Surface configurations used by this plugin
   */
  surfaces: Record<string, ConversationCardConfig | ContextPanelConfig | CommandInterfaceConfig>;

  /**
   * Function definitions that can be called by the Super Agent
   */
  functions?: FunctionDefinition[];

  /**
   * Initialization callback that runs when the plugin is loaded
   */
  onInitialize?: (context: PluginContext) => Promise<void> | void;

  /**
   * Optional plugin icon URL
   */
  iconUrl?: string;
}

/**
 * Lifecycle callback for plugin initialization
 */
export type PluginInitializeCallback = (context: PluginContext) => void | Promise<void>;

/**
 * Action handler type for plugin actions
 */
export type ActionHandler<T = unknown, R = unknown> = (payload: T) => R | Promise<R>;

/**
 * Instance of a created Vibing AI plugin
 */
export interface PluginInstance {
  /**
   * The plugin configuration
   */
  config: PluginConfig;

  /**
   * Register initialization callback
   */
  onInitialize: (callback: PluginInitializeCallback) => void;

  /**
   * Register action handlers
   */
  registerAction: (name: string, handler: (payload: unknown) => unknown) => void;

  /**
   * Register a function with the Super Agent
   */
  registerFunction: (functionDef: FunctionDefinition) => void;

  /**
   * Get plugin context
   */
  getContext: () => PluginContext;
}

/**
 * Plugin type definitions
 */

export interface PluginOptions {
  name?: string;
}

export interface Plugin {
  id: string;
  register: () => Promise<void>;
  unregister: () => Promise<void>;
}

export interface PluginState {
  registered: boolean;
}

export enum PluginEvents {
  REGISTER = 'register',
  UNREGISTER = 'unregister',
}
