/**
 * App type definitions
 */
import React from 'react';

export interface AppOptions {
  name?: string;
}

export interface AppConfig {
  name: string;
  description?: string;
  permissions?: string[];
  data?: Record<string, unknown>;
}

export interface App {
  id: string;
  mount: () => Promise<void>;
  unmount: () => Promise<void>;
}

export interface AppState {
  mounted: boolean;
}

export type AppInitializeCallback = () => Promise<void> | void;
export type AppRenderCallback = (container: HTMLElement) => Promise<void> | void;

export interface AppInstance {
  config: AppConfig;
  onInitialize: (callback: AppInitializeCallback) => void;
  onRender: (callback: AppRenderCallback) => void;
  registerPlugin?: (plugin: AppPlugin) => void;
  unregisterPlugin?: (pluginId: string) => void;
  getPlugins?: () => AppPlugin[];
  initialize?: () => Promise<boolean>;
  AppProvider?: (props: { children: React.ReactNode }) => React.ReactElement;
}

export interface AppPlugin {
  config?: {
    id?: string;
    name?: string;
  };
  onInitialize?: (context: {
    app: {
      name: string;
      data: Record<string, unknown>;
    };
    events: {
      publish: (eventName: string, payload?: unknown) => void;
      subscribe: (eventName: string, callback: (payload: unknown) => void) => () => void;
    };
  }) => Promise<void> | void;
}

export enum AppEvents {
  MOUNT = 'mount',
  UNMOUNT = 'unmount',
}
