export interface AppManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
}

export interface AppConfig {
  apiKey?: string;
  debug?: boolean;
}

export interface AppInitializeCallback {
  (context: any): void | Promise<void>;
}

export const useAppCreation = jest.fn(() => {
  return {
    registerApp: jest.fn(),
    getApp: jest.fn(() => null),
    getAllApps: jest.fn(() => []),
    unregisterApp: jest.fn(),
    onInitialize: jest.fn(),
  };
});

export const registerApp = jest.fn();
export const getApp = jest.fn(() => null);
export const getAllApps = jest.fn(() => []);
export const unregisterApp = jest.fn(); 