import { AppConfig, AppManifest } from '../types';
import * as appManager from './appManager';

export interface AppInitializeCallback {
  (context: unknown): void | Promise<void>;
}

export const useAppCreation = () => {
  return {
    registerApp: (manifest: AppManifest, _config?: AppConfig) => {
      return appManager.registerApp(manifest);
    },
    getApp: (appId: string) => {
      return appManager.getApp(appId);
    },
    getAllApps: () => {
      return appManager.getAllApps();
    },
    unregisterApp: (appId: string) => {
      return appManager.unregisterApp(appId);
    },
    onInitialize: (_callback: AppInitializeCallback) => {
      // Store callback for when app is initialized
    },
  };
};
