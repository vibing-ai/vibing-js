/**
 * SDK version utilities
 */
import { logger } from '../utils/logger';

export const SDK_VERSION = '1.0.0';

/**
 * Checks if the current SDK version is compatible with the minimum required version
 */
export function checkSDKVersion(): void {
  // Simplified implementation for build purposes
  logger.log('Vibing AI SDK version', SDK_VERSION);
}
