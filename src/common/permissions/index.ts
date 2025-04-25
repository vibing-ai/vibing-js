import { PermissionType } from '../types';
import * as permissionManager from './permissionManager';

export interface PermissionOptions {
  prompt?: boolean;
}

export const usePermissions = () => {
  return {
    check: async (permission: PermissionType) => {
      return await permissionManager.checkPermission(permission);
    },
    request: async (permission: PermissionType, _options?: PermissionOptions) => {
      return await permissionManager.requestPermission(permission);
    },
  };
};
