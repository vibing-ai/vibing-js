/**
 * Plugin creation utilities
 */
import { PluginConfig, PluginInstance, PluginOptions } from './types';
import { createPlugin } from './createPlugin';
import { logger } from '../core/utils/logger';

/**
 * Creates a new Vibing Plugin with the specified configuration
 */
export function create(pluginConfig: PluginConfig, _options: PluginOptions = {}): PluginInstance {
  // TODO: Implement more robust configuration validation
  try {
    // Validate and process the plugin configuration
    logger.log('Creating plugin with config:', pluginConfig);
    return createPlugin(pluginConfig);
  } catch (error) {
    logger.error('Error creating plugin:', error);
    throw error;
  }
}
