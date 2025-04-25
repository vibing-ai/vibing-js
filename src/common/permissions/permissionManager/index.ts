import { PermissionType } from '../../types';

export const checkPermission = (permission: PermissionType) => Promise.resolve(false);
export const requestPermission = (permission: PermissionType) => Promise.resolve(false);
