/**
 * Type definitions for agent creation and management
 */

/**
 * Configuration options for creating a Vibing AI agent
 */
export interface AgentConfig {
  /**
   * Unique name for the agent
   */
  name: string;
  
  /**
   * Optional agent description
   */
  description?: string;
  
  /**
   * Optional version string
   */
  version?: string;
  
  /**
   * Required permissions for the agent to function
   */
  permissions?: string[];
  
  /**
   * Optional agent icon URL
   */
  iconUrl?: string;
  
  /**
   * Optional agent capabilities
   */
  capabilities?: string[];
}

/**
 * Lifecycle callback for agent initialization
 */
export type AgentInitializeCallback = () => void | Promise<void>;

/**
 * Agent message handler
 */
export type AgentMessageHandler = (message: any) => any | Promise<any>;

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
} 