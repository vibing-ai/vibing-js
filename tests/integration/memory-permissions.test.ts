/**
 * Integration tests for memory and permissions interaction
 */
import { createMockMemoryStore } from './utils/test-utils';

// Mock the memory system
jest.mock('../../src/common/memory', () => {
  const mockStore = createMockMemoryStore();
  return {
    useMemory: () => ({
      get: mockStore.get,
      set: mockStore.set,
      remove: mockStore.remove,
      clear: mockStore.clear,
      getAll: mockStore.getAll
    }),
    memory: mockStore
  };
});

// Mock for permissions system
const mockCheckPermission = jest.fn();
const mockRequestPermission = jest.fn();

jest.mock('../../src/common/permissions', () => {
  return {
    usePermissions: () => ({
      checkPermission: mockCheckPermission,
      requestPermission: mockRequestPermission
    }),
    permissions: {
      check: mockCheckPermission,
      request: mockRequestPermission
    }
  };
});

describe('Memory-Permissions Integration', () => {
  const { memory } = require('../../src/common/memory');
  const { usePermissions } = require('../../src/common/permissions');
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock memory store
    memory.clear();
    
    // Default permission behavior - deny
    mockCheckPermission.mockImplementation(() => Promise.resolve(false));
    mockRequestPermission.mockImplementation(() => Promise.resolve(false));
  });
  
  test('Memory operations require appropriate permissions', async () => {
    // Setup permissions to deny read but allow write
    mockCheckPermission.mockImplementation((permission) => {
      if (permission === 'memory:write:test-key') {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    });
    
    // Write should succeed
    await memory.set('test-key', 'test-value');
    expect(memory.set).toHaveBeenCalledWith('test-key', 'test-value');
    expect(mockCheckPermission).toHaveBeenCalledWith('memory:write:test-key');
    
    // But read should be blocked
    const result = await memory.get('test-key');
    expect(result).toBeUndefined(); // Permission denied should return undefined
    expect(mockCheckPermission).toHaveBeenCalledWith('memory:read:test-key');
  });
  
  test('Memory operations succeed with appropriate permissions', async () => {
    // Setup permissions to allow everything
    mockCheckPermission.mockImplementation(() => Promise.resolve(true));
    
    // Write data
    await memory.set('user-prefs', { theme: 'dark' });
    
    // Read should succeed
    const result = await memory.get('user-prefs');
    expect(result).toEqual({ theme: 'dark' });
    
    // Delete should succeed
    await memory.remove('user-prefs');
    const afterDelete = await memory.get('user-prefs');
    expect(afterDelete).toBeNull();
  });
  
  test('Memory operations can request permissions when needed', async () => {
    // Setup permissions to initially deny but grant on request
    mockCheckPermission.mockImplementation(() => Promise.resolve(false));
    mockRequestPermission.mockImplementation(() => Promise.resolve(true));
    
    // Simulate memory system that requests permissions
    const enhancedMemory = {
      async set(key: string, value: any) {
        const { checkPermission, requestPermission } = usePermissions();
        
        const hasPermission = await checkPermission(`memory:write:${key}`);
        if (hasPermission) {
          return memory.set(key, value);
        }
        
        // Request permission
        const granted = await requestPermission({
          permission: `memory:write:${key}`,
          reason: `Store ${key} in memory`
        });
        
        if (granted) {
          return memory.set(key, value);
        }
        
        throw new Error('Permission denied');
      }
    };
    
    // Should request permission and then succeed
    await enhancedMemory.set('important-data', { value: 42 });
    
    // Verify permission was requested
    expect(mockRequestPermission).toHaveBeenCalledWith({
      permission: 'memory:write:important-data',
      reason: 'Store important-data in memory'
    });
    
    // Verify data was stored
    expect(memory.set).toHaveBeenCalledWith('important-data', { value: 42 });
  });
  
  test('Memory operations fail gracefully when permissions are denied', async () => {
    // Setup permissions to deny everything
    mockCheckPermission.mockImplementation(() => Promise.resolve(false));
    mockRequestPermission.mockImplementation(() => Promise.resolve(false));
    
    // Write attempt
    await memory.set('secret-data', 'sensitive-info');
    
    // Verify it wasn't actually stored
    const result = await memory.get('secret-data');
    expect(result).toBeUndefined();
    
    // Storage should be empty
    const allData = await memory.getAll();
    expect(allData).toEqual({});
  });
  
  test('Memory operations with wildcard permissions', async () => {
    // Setup permissions to allow all operations on user-prefs
    mockCheckPermission.mockImplementation((permission) => {
      return Promise.resolve(permission.startsWith('memory:') && permission.includes('user-prefs'));
    });
    
    // Should allow all operations on user-prefs
    await memory.set('user-prefs.theme', 'light');
    await memory.set('user-prefs.sidebar', 'expanded');
    
    // These should succeed
    const theme = await memory.get('user-prefs.theme');
    expect(theme).toBe('light');
    
    // But operations on other keys should fail
    await memory.set('system-settings', { debug: true });
    const settings = await memory.get('system-settings');
    expect(settings).toBeUndefined(); // Permission denied
  });
}); 