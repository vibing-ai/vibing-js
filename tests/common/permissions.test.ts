import { renderHook, act } from '@testing-library/react-hooks';
import { usePermissions, PermissionOptions } from '../../src/common/permissions';
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
    _setMockPermissionStatus: (permission: PermissionType, status: boolean) => {
      mockPermissionStatus.set(permission, status);
    },
    _clearMockPermissions: () => {
      mockPermissionStatus.clear();
    }
  };
});

describe('usePermissions', () => {
  // Get the mocked module
  const permissionManager = require('../../src/common/permissions/permissionManager');
  
  beforeEach(() => {
    permissionManager._clearMockPermissions();
    jest.clearAllMocks();
  });

  test('should check permission status correctly', async () => {
    // Setup initial permission
    permissionManager._setMockPermissionStatus(PermissionType.CAMERA, true);
    permissionManager._setMockPermissionStatus(PermissionType.MICROPHONE, false);
    
    const { result } = renderHook(() => usePermissions());
    
    // Check permission status
    let cameraStatus;
    await act(async () => {
      cameraStatus = await result.current.check(PermissionType.CAMERA);
    });
    expect(cameraStatus).toBe(true);
    expect(permissionManager.checkPermission).toHaveBeenCalledWith(PermissionType.CAMERA);
    
    let microphoneStatus;
    await act(async () => {
      microphoneStatus = await result.current.check(PermissionType.MICROPHONE);
    });
    expect(microphoneStatus).toBe(false);
    expect(permissionManager.checkPermission).toHaveBeenCalledWith(PermissionType.MICROPHONE);
  });

  test('should request permission correctly', async () => {
    const { result } = renderHook(() => usePermissions());
    
    // Request permission
    let requestResult;
    await act(async () => {
      requestResult = await result.current.request(PermissionType.GEOLOCATION);
    });
    
    expect(requestResult).toBe(true);
    expect(permissionManager.requestPermission).toHaveBeenCalledWith(PermissionType.GEOLOCATION);
    
    // Verify permission was granted
    let checkResult;
    await act(async () => {
      checkResult = await result.current.check(PermissionType.GEOLOCATION);
    });
    expect(checkResult).toBe(true);
  });

  test('should request permission with options', async () => {
    const { result } = renderHook(() => usePermissions());
    
    const options: PermissionOptions = { prompt: true };
    
    // Request permission with options
    let requestResult;
    await act(async () => {
      requestResult = await result.current.request(PermissionType.NOTIFICATIONS, options);
    });
    
    expect(requestResult).toBe(true);
    expect(permissionManager.requestPermission).toHaveBeenCalledWith(PermissionType.NOTIFICATIONS);
  });

  test('should handle permission request rejection', async () => {
    // Mock rejection
    permissionManager.requestPermission.mockImplementationOnce(() => {
      return Promise.resolve(false);
    });
    
    const { result } = renderHook(() => usePermissions());
    
    // Request permission that will be rejected
    let requestResult;
    await act(async () => {
      requestResult = await result.current.request(PermissionType.CAMERA);
    });
    
    expect(requestResult).toBe(false);
    
    // Verify permission was not granted
    let checkResult;
    await act(async () => {
      checkResult = await result.current.check(PermissionType.CAMERA);
    });
    expect(checkResult).toBe(false);
  });

  test('should handle errors during permission operations', async () => {
    // Mock error
    permissionManager.requestPermission.mockImplementationOnce(() => {
      return Promise.reject(new Error('Permission request failed'));
    });
    
    const { result } = renderHook(() => usePermissions());
    
    // Request permission that will throw an error
    let error: Error | undefined;
    await act(async () => {
      try {
        await result.current.request(PermissionType.GEOLOCATION);
      } catch (e) {
        error = e as Error;
      }
    });
    
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('Permission request failed');
  });
}); 