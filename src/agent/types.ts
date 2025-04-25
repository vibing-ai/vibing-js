/**
 * Type definitions for agent creation and management
 */
import { ReactNode } from 'react';
import { PermissionRequest } from '../core/permissions/types';

/**
 * Agent response interface representing the response from an agent to a user query
 */
export interface AgentResponse {
  /**
   * Text response from the agent
   */
  text: string;

  /**
   * Optional structured data returned by the agent
   */
  data?: Record<string, unknown>;

  /**
   * Optional list of follow-up questions suggested by the agent
   */
  followupQuestions?: string[];

  /**
   * Optional UI components to render
   */
  ui?: {
    card?: ReactNode;
    panel?: ReactNode;
  };

  /**
   * Optional suggested actions for the user
   */
  suggestedActions?: Array<{
    label: string;
    action: () => void;
  }>;
}

/**
 * Context provided during agent query processing
 */
export interface QueryContext {
  /**
   * The conversational history
   */
  history?: Array<{
    role: 'user' | 'agent' | 'system';
    content: string;
  }>;

  /**
   * Current memory state
   */
  memory: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };

  /**
   * Access to permissions
   */
  permissions: {
    check: (permission: string) => Promise<boolean>;
  };

  /**
   * Current app context (state, etc.)
   */
  appContext?: Record<string, unknown>;

  /**
   * Current user context
   */
  userContext?: {
    preferences?: Record<string, unknown>;
    location?: string;
    timezone?: string;
    [key: string]: unknown;
  };
}

/**
 * Context provided to agent during initialization and execution
 */
export interface AgentContext {
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
 * Configuration options for creating a Vibing AI agent
 */
export interface AgentConfig {
  /**
   * Unique identifier for the agent
   */
  id: string;

  /**
   * Display name for the agent
   */
  name: string;

  /**
   * Version of the agent (semver)
   */
  version: string;

  /**
   * Optional agent description
   */
  description?: string;

  /**
   * Required permissions for the agent to function
   */
  permissions: PermissionRequest[];

  /**
   * Specialized domain of the agent
   */
  domain: string;

  /**
   * List of capabilities that this agent has
   */
  capabilities: string[];

  /**
   * Function to process user queries
   */
  processQuery: (query: string, context: QueryContext) => Promise<AgentResponse>;

  /**
   * Initialization callback that runs when the agent is loaded
   */
  onInitialize?: (context: AgentContext) => Promise<void> | void;

  /**
   * Surface configurations used by this agent
   */
  surfaces?: Record<string, {
    type: string;
    config: Record<string, unknown>;
  }>;

  /**
   * Optional agent icon URL
   */
  iconUrl?: string;
}

/**
 * Lifecycle callback for agent initialization
 */
export type AgentInitializeCallback = (context: AgentContext) => void | Promise<void>;

/**
 * Agent message handler
 */
export type AgentMessageHandler = (
  message: string,
  context: QueryContext
) => Promise<AgentResponse>;

/**
 * Instance of a created Vibing AI agent
 */
export interface AgentInstance {
  /**
   * The agent configuration
   */
  config: AgentConfig;

  /**
   * Register initialization callback
   */
  onInitialize: (callback: AgentInitializeCallback) => void;

  /**
   * Register message handler
   */
  onMessage: (handler: AgentMessageHandler) => void;

  /**
   * Process a user query
   */
  processQuery: (query: string, context?: Partial<QueryContext>) => Promise<AgentResponse>;

  /**
   * Get agent context
   */
  getContext: () => AgentContext;
}

/**
 * Agent type definitions
 */

export interface AgentOptions {
  name?: string;
}

export interface Agent {
  id: string;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export interface AgentState {
  running: boolean;
}

export enum AgentEvents {
  START = 'start',
  STOP = 'stop',
}
