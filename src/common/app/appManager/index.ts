import { AppManifest } from '../../types';
import { logger } from '../../../core/utils';

/**
 * Storage for registered apps
 * In a real implementation, this would be a more robust storage system
 */
const apps: Map<string, AppManifest> = new Map();

/**
 * Register an app with the app manager
 * @param manifest - The app manifest containing app metadata
 */
export const registerApp = (manifest: AppManifest): void => {
  if (!manifest.id) {
    logger.error('Cannot register app without id');
    return;
  }

  apps.set(manifest.id, manifest);
  logger.log(`App registered: ${manifest.name} (${manifest.id})`);
};

/**
 * Retrieve an app by its ID
 * @param appId - The unique identifier of the app
 * @returns The app manifest or null if not found
 */
export const getApp = (appId: string): AppManifest | null => {
  return apps.get(appId) || null;
};

/**
 * Get all registered apps
 * @returns Array of all registered app manifests
 */
export const getAllApps = (): AppManifest[] => {
  return Array.from(apps.values());
};

/**
 * Unregister an app from the app manager
 * @param appId - The unique identifier of the app to unregister
 */
export const unregisterApp = (appId: string): void => {
  if (apps.has(appId)) {
    const app = apps.get(appId);
    apps.delete(appId);
    logger.log(`App unregistered: ${app?.name || appId}`);
  }
};
