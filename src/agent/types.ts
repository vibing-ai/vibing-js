/**
 * Type definitions for agent creation and management
 */
import { ReactNode } from 'react';
import { PermissionRequest } from '../common/permissions/types';

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
  data?: any;
  
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
  memory: any;
  
  /**
   * Access to permissions
   */
  permissions: any;
  
  /**
   * Current app context (state, etc.)
   */
  appContext?: any;
  
  /**
   * Current user context
   */
  userContext?: {
    preferences?: any;
    location?: string;
    timezone?: string;
    [key: string]: any;
  };
}

/**
 * Context provided to agent during initialization and execution
 */
export interface AgentContext {
  /**
   * Access to memory system
   */
  memory: any;
  
  /**
   * Access to permissions system
   */
  permissions: any;
  
  /**
   * Access to event system
   */
  events: any;
  
  /**
   * Access to surface interfaces
   */
  surfaces: Record<string, any>;
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
  surfaces?: Record<string, any>;
  
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
export type AgentMessageHandler = (message: string, context: QueryContext) => Promise<AgentResponse>;

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