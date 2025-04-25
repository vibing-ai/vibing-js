import { PermissionType } from '../../types';
import { Permission, PermissionStatus } from '../types';

export class PermissionManager {
  public hasPermission = (_permission: Permission): PermissionStatus => {
    // TODO: Implement permission checking
    return PermissionStatus.GRANTED;
  };

  public requestPermission = (_permission: Permission): Promise<PermissionStatus> => {
    // TODO: Implement permission requesting
    return Promise.resolve(PermissionStatus.GRANTED);
  };
}

export const checkPermission = (_permission: PermissionType) => Promise.resolve(false);
export const requestPermission = (_permission: PermissionType) => Promise.resolve(false);
