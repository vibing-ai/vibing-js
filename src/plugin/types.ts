/**
 * Type definitions for plugin creation and management
 */

/**
 * Configuration options for creating a Vibing AI plugin
 */
export interface PluginConfig {
  /**
   * Unique name for the plugin
   */
  name: string;
  
  /**
   * Optional plugin description
   */
  description?: string;
  
  /**
   * Optional version string
   */
  version?: string;
  
  /**
   * Required permissions for the plugin to function
   */
  permissions?: string[];
  
  /**
   * Optional plugin icon URL
   */
  iconUrl?: string;
}

/**
 * Lifecycle callback for plugin initialization
 */
export type PluginInitializeCallback = () => void | Promise<void>;

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
  registerAction: (name: string, handler: (payload: any) => any) => void;
} 