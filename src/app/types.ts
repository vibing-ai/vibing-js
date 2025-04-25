/**
 * Type definitions for app creation and management
 */

/**
 * Configuration options for creating a Vibing AI app
 */
export interface AppConfig {
  /**
   * Unique name for the app
   */
  name: string;
  
  /**
   * Optional app description
   */
  description?: string;
  
  /**
   * Optional version string
   */
  version?: string;
  
  /**
   * Required permissions for the app to function
   */
  permissions?: string[];
  
  /**
   * Optional app icon URL
   */
  iconUrl?: string;
}

/**
 * Lifecycle callback for app initialization
 */
export type AppInitializeCallback = () => void | Promise<void>;

/**
 * Lifecycle callback for app rendering
 */
export type AppRenderCallback = (container: HTMLElement) => void | Promise<void>;

/**
 * Instance of a created Vibing AI app
 */
export interface AppInstance {
  /**
   * The app configuration
   */
  config: AppConfig;
  
  /**
   * Register initialization callback
   */
  onInitialize: (callback: AppInitializeCallback) => void;
  
  /**
   * Register render callback
   */
  onRender: (callback: AppRenderCallback) => void;
} 