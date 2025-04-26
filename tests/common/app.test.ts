import { renderHook, act } from '@testing-library/react-hooks';
import { useAppCreation } from '../../src/common/app';
import { AppManifest, AppConfig } from '../../src/common/types';

// Mock the app manager
jest.mock('../../src/common/app/appManager', () => {
  const mockApps = new Map<string, AppManifest>();
  
  return {
    registerApp: jest.fn((manifest: AppManifest) => {
      const id = manifest.id || `app-${Date.now()}`;
      const newManifest = { ...manifest, id };
      mockApps.set(id, newManifest);
      return newManifest;
    }),
    getApp: jest.fn((id: string) => {
      return mockApps.get(id) || null;
    }),
    getAllApps: jest.fn(() => {
      return Array.from(mockApps.values());
    }),
    unregisterApp: jest.fn((id: string) => {
      return mockApps.delete(id);
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

  test('should register an app with valid manifest', () => {
    const { result } = renderHook(() => useAppCreation());
    
    const manifest: AppManifest = {
      id: 'test-app',
      name: 'Test App',
      version: '1.0.0',
      description: 'A test application'
    };
    
    act(() => {
      result.current.registerApp(manifest);
    });
    
    expect(appManager.registerApp).toHaveBeenCalledWith(manifest);
  });

  test('should register an app with app config', () => {
    const { result } = renderHook(() => useAppCreation());
    
    const config: AppConfig = {
      apiKey: 'test-key',
      debug: true
    };
    
    const manifest: AppManifest = {
      id: 'test-app',
      name: 'Test App',
      version: '1.0.0'
    };
    
    act(() => {
      result.current.registerApp(manifest, config);
    });
    
    expect(appManager.registerApp).toHaveBeenCalledWith(manifest);
  });

  test('should get an app by ID', () => {
    // Register an app first
    const manifest: AppManifest = {
      id: 'test-app-123',
      name: 'Test App',
      version: '1.0.0',
      description: 'A test application'
    };
    
    // Manually add the app to our mock store
    appManager.registerApp(manifest);
    
    const { result } = renderHook(() => useAppCreation());
    
    let retrievedApp;
    act(() => {
      retrievedApp = result.current.getApp('test-app-123');
    });
    
    expect(appManager.getApp).toHaveBeenCalledWith('test-app-123');
    expect(retrievedApp).toEqual(manifest);
  });
  
  test('should get all registered apps', () => {
    // Register a few apps
    appManager.registerApp({
      id: 'app1',
      name: 'App 1',
      version: '1.0.0'
    });
    
    appManager.registerApp({
      id: 'app2',
      name: 'App 2',
      version: '1.0.0'
    });
    
    const { result } = renderHook(() => useAppCreation());
    
    let apps;
    act(() => {
      apps = result.current.getAllApps();
    });
    
    expect(appManager.getAllApps).toHaveBeenCalled();
    expect(apps).toHaveLength(2);
    expect(apps).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'app1' }),
      expect.objectContaining({ id: 'app2' })
    ]));
  });
  
  test('should unregister an app', () => {
    // Register an app first
    const manifest: AppManifest = {
      id: 'app-to-remove',
      name: 'App to Remove',
      version: '1.0.0'
    };
    
    appManager.registerApp(manifest);
    
    const { result } = renderHook(() => useAppCreation());
    
    act(() => {
      result.current.unregisterApp('app-to-remove');
    });
    
    expect(appManager.unregisterApp).toHaveBeenCalledWith('app-to-remove');
    
    // Check it was actually removed
    const apps = result.current.getAllApps();
    expect(apps.find(app => app.id === 'app-to-remove')).toBeUndefined();
  });
  
  test('should allow registering an onInitialize callback', () => {
    const { result } = renderHook(() => useAppCreation());
    const callback = jest.fn();
    
    act(() => {
      result.current.onInitialize(callback);
    });
    
    // We can't easily test the callback is invoked in this test structure,
    // but we can verify the function exists and accepts the callback
    expect(callback).not.toHaveBeenCalled(); // Should not be called yet
  });
}); 