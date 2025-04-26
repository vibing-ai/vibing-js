/**
 * App creation utilities
 */
import { AppConfig, AppInstance, AppOptions } from './types';
import { createApp } from './createApp';
import { logger } from '../core/utils/logger';

/**
 * Creates a new Vibing App with the specified configuration
 */
export function create(appConfig: AppConfig, _options: AppOptions = {}): AppInstance {
  // TODO: Implement more robust configuration validation
  try {
    // Validate and process the app configuration
    logger.log('Creating app with config:', appConfig);
    return createApp(appConfig);
  } catch (error) {
    logger.error('Error creating app:', error);
    throw error;
  }
}
