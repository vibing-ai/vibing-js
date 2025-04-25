import { renderHook, act } from '@testing-library/react-hooks';
import { useAppCreation } from '../../src/common/app';
import { AppManifest, AppConfig } from '../../src/common/types';

// Mock the app manager
jest.mock('../../src/common/app/appManager', () => {
  const mockApps = new Map<string, AppManifest>();
  
  return {
    createApp: jest.fn((manifest: AppManifest) => {
      const id = manifest.id || `app-${Date.now()}`;
      const newManifest = { ...manifest, id };
      mockApps.set(id, newManifest);
      return Promise.resolve(newManifest);
    }),
    updateApp: jest.fn((id: string, manifest: Partial<AppManifest>) => {
      const existingApp = mockApps.get(id);
      if (!existingApp) return Promise.reject(new Error('App not found'));
      
      const updatedManifest = { ...existingApp, ...manifest };
      mockApps.set(id, updatedManifest);
      return Promise.resolve(updatedManifest);
    }),
    deleteApp: jest.fn((id: string) => {
      const deleted = mockApps.delete(id);
      return Promise.resolve(deleted);
    }),
    getApp: jest.fn((id: string) => {
      const app = mockApps.get(id);
      if (!app) return Promise.reject(new Error('App not found'));
      return Promise.resolve(app);
    }),
    listApps: jest.fn(() => {
      return Promise.resolve(Array.from(mockApps.values()));
    }),
    registerApp: jest.fn((config: AppConfig) => {
      const id = `app-${Date.now()}`;
      const manifest: AppManifest = {
        id,
        name: config.name,
        version: config.version || '1.0.0',
        description: config.description || '',
        entryPoint: config.entryPoint,
        permissions: config.permissions || [],
        capabilities: config.capabilities || []
      };
      mockApps.set(id, manifest);
      return Promise.resolve(manifest);
    }),
    _clearMockApps: () => {
      mockApps.clear();
    }
  };
});

describe('useAppCreation', () => {
  // Get the mocked module
  const appManager = require('../../src/common/app/appManager');
  
  beforeEach(() => {
    appManager._clearMockApps();
    jest.clearAllMocks();
  });

  test('should create an app with valid manifest', async () => {
    const { result } = renderHook(() => useAppCreation());
    
    const manifest: AppManifest = {
      name: 'Test App',
      description: 'A test application',
      version: '1.0.0',
      entryPoint: './index.js',
      permissions: ['MEMORY_READ', 'MEMORY_WRITE'],
      capabilities: ['conversation']
    };
    
    let createdApp;
    await act(async () => {
      createdApp = await result.current.createApp(manifest);
    });
    
    expect(appManager.createApp).toHaveBeenCalledWith(manifest);
    expect(createdApp).toEqual(expect.objectContaining({
      id: expect.any(String),
      name: 'Test App',
      description: 'A test application',
      version: '1.0.0',
      entryPoint: './index.js',
      permissions: ['MEMORY_READ', 'MEMORY_WRITE'],
      capabilities: ['conversation']
    }));
  });

  test('should register an app with app config', async () => {
    const { result } = renderHook(() => useAppCreation());
    
    const config: AppConfig = {
      name: 'Registered App',
      description: 'An app registered from config',
      entryPoint: './app.js',
      permissions: ['NOTIFICATION'],
      capabilities: ['canvas']
    };
    
    let registeredApp;
    await act(async () => {
      registeredApp = await result.current.registerApp(config);
    });
    
    expect(appManager.registerApp).toHaveBeenCalledWith(config);
    expect(registeredApp).toEqual(expect.objectContaining({
      id: expect.any(String),
      name: 'Registered App',
      description: 'An app registered from config',
      entryPoint: './app.js',
      permissions: ['NOTIFICATION'],
      capabilities: ['canvas']
    }));
  });

  test('should get an app by ID', async () => {
    // Create an app first
    const manifest: AppManifest = {
      id: 'test-app-123',
      name: 'Test App',
      description: 'A test application',
      version: '1.0.0',
      entryPoint: './index.js',
      permissions: [],
      capabilities: []
    };
    
    // Manually add the app to our mock store
    await appManager.createApp(manifest);
    
    const { result } = renderHook(() => useAppCreation());
    
    let retrievedApp;
    await act(async () => {
      retrievedApp = await result.current.getApp('test-app-123');
    });
    
    expect(appManager.getApp).toHaveBeenCalledWith('test-app-123');
    expect(retrievedApp).toEqual(manifest);
  });

  test('should handle app not found error', async () => {
    const { result } = renderHook(() => useAppCreation());
    
    let error;
    await act(async () => {
      try {
        await result.current.getApp('non-existent-app');
      } catch (e) {
        error = e;
      }
    });
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('App not found');
  });

  test('should update an existing app', async () => {
    // Create an app first
    const manifest: AppManifest = {
      id: 'update-test-app',
      name: 'Original Name',
      description: 'Original description',
      version: '1.0.0',
      entryPoint: './index.js',
      permissions: [],
      capabilities: []
    };
    
    // Manually add the app to our mock store
    await appManager.createApp(manifest);
    
    const { result } = renderHook(() => useAppCreation());
    
    const updates = {
      name: 'Updated Name',
      description: 'Updated description',
      version: '1.1.0'
    };
    
    let updatedApp;
    await act(async () => {
      updatedApp = await result.current.updateApp('update-test-app', updates);
    });
    
    expect(appManager.updateApp).toHaveBeenCalledWith('update-test-app', updates);
    expect(updatedApp).toEqual(expect.objectContaining({
      id: 'update-test-app',
      name: 'Updated Name',
      description: 'Updated description',
      version: '1.1.0',
      entryPoint: './index.js'
    }));
  });

  test('should delete an app', async () => {
    // Create an app first
    const manifest: AppManifest = {
      id: 'delete-test-app',
      name: 'App to Delete',
      description: 'This app will be deleted',
      version: '1.0.0',
      entryPoint: './index.js',
      permissions: [],
      capabilities: []
    };
    
    // Manually add the app to our mock store
    await appManager.createApp(manifest);
    
    const { result } = renderHook(() => useAppCreation());
    
    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteApp('delete-test-app');
    });
    
    expect(appManager.deleteApp).toHaveBeenCalledWith('delete-test-app');
    expect(deleteResult).toBe(true);
    
    // Verify the app is deleted
    let error;
    await act(async () => {
      try {
        await result.current.getApp('delete-test-app');
      } catch (e) {
        error = e;
      }
    });
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('App not found');
  });

  test('should list all registered apps', async () => {
    // Create multiple apps
    const manifest1: AppManifest = {
      id: 'app-1',
      name: 'App One',
      description: 'First test app',
      version: '1.0.0',
      entryPoint: './app1.js',
      permissions: [],
      capabilities: []
    };
    
    const manifest2: AppManifest = {
      id: 'app-2',
      name: 'App Two',
      description: 'Second test app',
      version: '1.0.0',
      entryPoint: './app2.js',
      permissions: [],
      capabilities: []
    };
    
    // Manually add the apps to our mock store
    await appManager.createApp(manifest1);
    await appManager.createApp(manifest2);
    
    const { result } = renderHook(() => useAppCreation());
    
    let apps;
    await act(async () => {
      apps = await result.current.listApps();
    });
    
    expect(appManager.listApps).toHaveBeenCalled();
    expect(apps).toHaveLength(2);
    expect(apps).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'app-1', name: 'App One' }),
      expect.objectContaining({ id: 'app-2', name: 'App Two' })
    ]));
  });

  test('should validate required fields when creating app', async () => {
    const { result } = renderHook(() => useAppCreation());
    
    // Missing required fields
    const invalidManifest = {
      description: 'Missing name and entryPoint',
      version: '1.0.0'
    };
    
    let error;
    await act(async () => {
      try {
        // @ts-ignore - intentionally passing invalid manifest for testing
        await result.current.createApp(invalidManifest);
      } catch (e) {
        error = e;
      }
    });
    
    expect(error).toBeDefined();
  });

  test('should validate app versioning on update', async () => {
    // Create an app first
    const manifest: AppManifest = {
      id: 'version-test-app',
      name: 'Version Test App',
      description: 'App for version testing',
      version: '1.0.0',
      entryPoint: './index.js',
      permissions: [],
      capabilities: []
    };
    
    // Manually add the app to our mock store
    await appManager.createApp(manifest);
    
    // Mock validation error
    appManager.updateApp.mockImplementationOnce(() => {
      return Promise.reject(new Error('Invalid version downgrade'));
    });
    
    const { result } = renderHook(() => useAppCreation());
    
    const updates = {
      version: '0.9.0' // Attempting to downgrade version
    };
    
    let error;
    await act(async () => {
      try {
        await result.current.updateApp('version-test-app', updates);
      } catch (e) {
        error = e;
      }
    });
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Invalid version downgrade');
  });

  test('should handle batch operations for multiple apps', async () => {
    const { result } = renderHook(() => useAppCreation());
    
    const app1Config: AppConfig = {
      name: 'Batch App 1',
      entryPoint: './app1.js'
    };
    
    const app2Config: AppConfig = {
      name: 'Batch App 2',
      entryPoint: './app2.js'
    };
    
    let registeredApps;
    await act(async () => {
      registeredApps = await result.current.registerApps([app1Config, app2Config]);
    });
    
    expect(appManager.registerApp).toHaveBeenCalledTimes(2);
    expect(registeredApps).toHaveLength(2);
    expect(registeredApps[0].name).toBe('Batch App 1');
    expect(registeredApps[1].name).toBe('Batch App 2');
  });
}); 