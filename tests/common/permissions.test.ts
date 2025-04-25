import { renderHook, act } from '@testing-library/react-hooks';
import { usePermissions } from '../../src/common/permissions';
import { PermissionType } from '../../src/common/types';

// Mock the permission manager
jest.mock('../../src/common/permissions/permissionManager', () => {
  const mockPermissionStatus = new Map<PermissionType, boolean>();
  
  return {
    checkPermission: jest.fn((permission: PermissionType) => {
      return Promise.resolve(mockPermissionStatus.get(permission) || false);
    }),
    requestPermission: jest.fn((permission: PermissionType) => {
      mockPermissionStatus.set(permission, true);
      return Promise.resolve(true);
    }),
    revokePermission: jest.fn((permission: PermissionType) => {
      mockPermissionStatus.set(permission, false);
      return Promise.resolve(true);
    }),
    getPermissionStatus: jest.fn((permission: PermissionType) => {
      return Promise.resolve(mockPermissionStatus.get(permission) || false);
    }),
    setMockPermissionStatus: (permission: PermissionType, status: boolean) => {
      mockPermissionStatus.set(permission, status);
    },
    clearMockPermissions: () => {
      mockPermissionStatus.clear();
    }
  };
});

describe('usePermissions', () => {
  // Get the mocked module
  const permissionManager = require('../../src/common/permissions/permissionManager');
  
  beforeEach(() => {
    permissionManager.clearMockPermissions();
    jest.clearAllMocks();
  });

  test('should check permission status correctly', async () => {
    // Setup initial permission
    permissionManager.setMockPermissionStatus('MEMORY_READ', true);
    permissionManager.setMockPermissionStatus('NOTIFICATION', false);
    
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    await waitForNextUpdate();
    
    // Check permission status
    const memoryReadStatus = await result.current.check('MEMORY_READ');
    expect(memoryReadStatus).toBe(true);
    expect(permissionManager.checkPermission).toHaveBeenCalledWith('MEMORY_READ');
    
    const notificationStatus = await result.current.check('NOTIFICATION');
    expect(notificationStatus).toBe(false);
    expect(permissionManager.checkPermission).toHaveBeenCalledWith('NOTIFICATION');
  });

  test('should request permission correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    await waitForNextUpdate();
    
    // Request permission
    let requestResult;
    await act(async () => {
      requestResult = await result.current.request('MEMORY_WRITE');
    });
    
    expect(requestResult).toBe(true);
    expect(permissionManager.requestPermission).toHaveBeenCalledWith('MEMORY_WRITE');
    
    // Verify permission was granted
    const checkResult = await result.current.check('MEMORY_WRITE');
    expect(checkResult).toBe(true);
  });

  test('should revoke permission correctly', async () => {
    // Setup initial permission
    permissionManager.setMockPermissionStatus('LOCATION', true);
    
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    await waitForNextUpdate();
    
    // Verify permission is initially granted
    let initialCheck = await result.current.check('LOCATION');
    expect(initialCheck).toBe(true);
    
    // Revoke permission
    let revokeResult;
    await act(async () => {
      revokeResult = await result.current.revoke('LOCATION');
    });
    
    expect(revokeResult).toBe(true);
    expect(permissionManager.revokePermission).toHaveBeenCalledWith('LOCATION');
    
    // Verify permission was revoked
    const checkResult = await result.current.check('LOCATION');
    expect(checkResult).toBe(false);
  });

  test('should handle requesting multiple permissions', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    await waitForNextUpdate();
    
    // Request multiple permissions
    let requestResult;
    await act(async () => {
      requestResult = await result.current.requestAll(['MEMORY_READ', 'MEMORY_WRITE', 'NOTIFICATION']);
    });
    
    expect(requestResult).toBe(true);
    expect(permissionManager.requestPermission).toHaveBeenCalledWith('MEMORY_READ');
    expect(permissionManager.requestPermission).toHaveBeenCalledWith('MEMORY_WRITE');
    expect(permissionManager.requestPermission).toHaveBeenCalledWith('NOTIFICATION');
    
    // Verify all permissions were granted
    const memoryReadStatus = await result.current.check('MEMORY_READ');
    const memoryWriteStatus = await result.current.check('MEMORY_WRITE');
    const notificationStatus = await result.current.check('NOTIFICATION');
    
    expect(memoryReadStatus).toBe(true);
    expect(memoryWriteStatus).toBe(true);
    expect(notificationStatus).toBe(true);
  });

  test('should handle checking multiple permissions', async () => {
    // Setup initial permissions
    permissionManager.setMockPermissionStatus('MEMORY_READ', true);
    permissionManager.setMockPermissionStatus('MEMORY_WRITE', true);
    permissionManager.setMockPermissionStatus('NOTIFICATION', false);
    
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    await waitForNextUpdate();
    
    // Check all permissions
    const checkResults = await result.current.checkAll(['MEMORY_READ', 'MEMORY_WRITE', 'NOTIFICATION']);
    
    expect(checkResults).toEqual({
      'MEMORY_READ': true,
      'MEMORY_WRITE': true,
      'NOTIFICATION': false
    });
  });

  test('should handle non-existent permissions', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    await waitForNextUpdate();
    
    // Check a non-existent permission (TypeScript would catch this in real code,
    // but we're testing runtime behavior for unexpected values)
    // @ts-ignore
    const checkResult = await result.current.check('NON_EXISTENT_PERMISSION');
    
    expect(checkResult).toBe(false);
  });

  test('should handle permission request rejection', async () => {
    // Mock rejection
    permissionManager.requestPermission.mockImplementationOnce(() => {
      return Promise.resolve(false);
    });
    
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    await waitForNextUpdate();
    
    // Request permission that will be rejected
    let requestResult;
    await act(async () => {
      requestResult = await result.current.request('LOCATION');
    });
    
    expect(requestResult).toBe(false);
    
    // Verify permission was not granted
    const checkResult = await result.current.check('LOCATION');
    expect(checkResult).toBe(false);
  });

  test('should handle errors during permission operations', async () => {
    // Mock error
    permissionManager.requestPermission.mockImplementationOnce(() => {
      return Promise.reject(new Error('Permission request failed'));
    });
    
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    await waitForNextUpdate();
    
    // Request permission that will throw an error
    let error;
    await act(async () => {
      try {
        await result.current.request('LOCATION');
      } catch (e) {
        error = e;
      }
    });
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Permission request failed');
  });

  test('should get all permissions status', async () => {
    // Setup initial permissions
    permissionManager.setMockPermissionStatus('MEMORY_READ', true);
    permissionManager.setMockPermissionStatus('MEMORY_WRITE', true);
    permissionManager.setMockPermissionStatus('NOTIFICATION', false);
    permissionManager.setMockPermissionStatus('LOCATION', false);
    
    const { result, waitForNextUpdate } = renderHook(() => usePermissions());
    
    await waitForNextUpdate();
    
    // Get all permission statuses
    let allPermissions;
    await act(async () => {
      allPermissions = await result.current.getAll();
    });
    
    // This assumes the implementation will check all possible permission types
    // defined in the PermissionType enum
    expect(allPermissions).toMatchObject({
      'MEMORY_READ': true,
      'MEMORY_WRITE': true,
      'NOTIFICATION': false,
      'LOCATION': false
    });
  });
}); 