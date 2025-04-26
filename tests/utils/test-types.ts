import React from 'react';

// Helper type for mocking hooks
export interface RenderHookResult<T> {
  result: {
    current: T;
    error?: Error;
  };
  rerender: () => void;
  unmount: () => void;
}

// Common interface for modal components
export interface ModalInstance {
  id: string;
  hide: (result?: any) => void;
  update: (config: Partial<any>) => void;
  result: Promise<any>;
}

// Common interface for canvas components
export interface CanvasHookResult {
  isActive: boolean;
  activeContent: React.ReactNode | null;
  config: any;
  showCanvas: (config: any) => void;
  hideCanvas: () => void;
  updateCanvas: (config: Partial<any>) => void;
}

// Common interface for panel components
export interface PanelInstance {
  id: string;
  config: any;
  update: (config: Partial<any>) => void;
  hide: () => void;
}

// Common interface for app instance
export interface AppInstance {
  config: any;
  onInitialize: (callback: (context: any) => Promise<boolean> | boolean) => void;
  onRender: (callback: (container: HTMLElement) => Promise<boolean> | boolean) => void;
  _initialize: () => Promise<boolean>;
  _render: (container: HTMLElement) => Promise<boolean>;
}

// Common interface for plugin instance
export interface PluginInstance {
  id: string;
  name: string;
  version: string;
  initialize: () => Promise<boolean>;
  onInitialize: (callback: (context: any) => Promise<boolean> | boolean) => void;
}

// Permissions types
export interface PermissionRequest {
  permission: string;
  reason?: string;
}

export interface PermissionsHookResult {
  checkPermission: (permission: string) => Promise<boolean>;
  requestPermission: (request: PermissionRequest) => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  getPermissions: () => string[];
}

// Memory types
export interface MemoryHookResult {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T) => Promise<boolean>;
  remove: (key: string) => Promise<boolean>;
  clear: () => Promise<boolean>;
  keys: () => Promise<string[]>;
} 