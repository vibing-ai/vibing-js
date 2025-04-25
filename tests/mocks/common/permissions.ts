export enum PermissionType {
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  GEOLOCATION = 'geolocation',
  NOTIFICATIONS = 'notifications'
}

export interface PermissionOptions {
  prompt?: boolean;
}

export const usePermissions = jest.fn(() => {
  return {
    check: jest.fn(() => Promise.resolve(false)),
    request: jest.fn(() => Promise.resolve(false)),
  };
});

export const checkPermission = jest.fn(() => Promise.resolve(false));
export const requestPermission = jest.fn(() => Promise.resolve(false)); 