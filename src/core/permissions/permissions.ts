import { PermissionAPI, PermissionRequest, PermissionResult } from './types';

/**
 * Storage key for permissions in localStorage
 */
const PERMISSIONS_STORAGE_KEY = 'vibing_permissions';

/**
 * Gets a unique identifier for a permission based on its properties
 */
const getPermissionKey = (type: string, access?: string[], scope?: string): string => {
  const accessStr = access ? access.sort().join(',') : '*';
  const scopeStr = scope || '*';
  return `${type}:${accessStr}:${scopeStr}`;
};

/**
 * Default permission duration (30 days in milliseconds)
 */
const DEFAULT_PERMISSION_DURATION = 30 * 24 * 60 * 60 * 1000;

/**
 * Storage for permissions (localStorage-based for Stage 1)
 */
const permissionStorage = {
  getAll: (): Record<string, PermissionResult> => {
    try {
      const storedData = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : {};
    } catch (e) {
      console.warn('Failed to read permissions from storage:', e);
      return {};
    }
  },

  save: (permissions: Record<string, PermissionResult>): void => {
    try {
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    } catch (e) {
      console.warn('Failed to save permissions to storage:', e);
    }
  },
};

/**
 * Simple UI for permission dialogs (would be replaced with proper UI in production)
 */
const permissionDialogs = {
  /**
   * Show a permission request dialog and return the user's decision
   */
  showRequestDialog: (request: PermissionRequest): Promise<boolean> => {
    // In a real implementation, this would show a proper UI component
    // For Stage 1, using a simple confirm dialog
    const { type, access, scope, purpose } = request;
    const accessStr = access.join(', ');
    const purposeText = purpose ? `\nPurpose: ${purpose}` : '';

    const message =
      `An app is requesting permission:\n` +
      `Type: ${type}\n` +
      `Access: ${accessStr}\n` +
      `Scope: ${scope}${purposeText}\n\n` +
      `Do you want to grant this permission?`;

    return Promise.resolve(window.confirm(message));
  },
};

/**
 * Permissions API implementation
 *
 * In Stage 1, this uses localStorage for storage and simple confirm dialogs.
 * In production, this would make actual API calls and use proper UI components.
 */
export const permissions: PermissionAPI = {
  /**
   * Request a permission
   */
  request: async (request: PermissionRequest): Promise<PermissionResult> => {
    const { type, access, scope, duration } = request;

    // Check if permission already exists
    const existingPermission = await permissions.check(type, access, scope);

    if (existingPermission) {
      const allPermissions = permissionStorage.getAll();
      const key = getPermissionKey(type, access, scope);
      return allPermissions[key];
    }

    // Show permission request dialog
    const granted = await permissionDialogs.showRequestDialog(request);

    if (granted) {
      const now = Date.now();
      const permissionDuration = duration || DEFAULT_PERMISSION_DURATION;
      const expiresAt = now + permissionDuration;

      const result: PermissionResult = {
        granted: true,
        request,
        grantedAt: now,
        expiresAt,
      };

      // Store the granted permission
      const allPermissions = permissionStorage.getAll();
      const key = getPermissionKey(type, access, scope);
      allPermissions[key] = result;
      permissionStorage.save(allPermissions);

      return result;
    } else {
      return {
        granted: false,
        request,
      };
    }
  },

  /**
   * Check if a permission exists and is valid
   */
  check: async (type: string, access: string[], scope?: string): Promise<boolean> => {
    const allPermissions = permissionStorage.getAll();
    const key = getPermissionKey(type, access, scope);

    // Check for exact match first
    if (allPermissions[key] && allPermissions[key].granted) {
      // Check if permission has expired
      if (allPermissions[key].expiresAt && allPermissions[key].expiresAt < Date.now()) {
        // Permission expired, remove it
        delete allPermissions[key];
        permissionStorage.save(allPermissions);
        return false;
      }
      return true;
    }

    // Check for wildcard permissions (if no exact match)
    const wildcardKey = getPermissionKey(type, undefined, scope);
    if (allPermissions[wildcardKey] && allPermissions[wildcardKey].granted) {
      // Check if permission has expired
      if (
        allPermissions[wildcardKey].expiresAt &&
        allPermissions[wildcardKey].expiresAt < Date.now()
      ) {
        // Permission expired, remove it
        delete allPermissions[wildcardKey];
        permissionStorage.save(allPermissions);
        return false;
      }
      return true;
    }

    // No matching permission found
    return false;
  },

  /**
   * Revoke a permission
   */
  revoke: async (type: string, access?: string[], scope?: string): Promise<void> => {
    const allPermissions = permissionStorage.getAll();
    const key = getPermissionKey(type, access, scope);

    if (allPermissions[key]) {
      delete allPermissions[key];
      permissionStorage.save(allPermissions);
    }

    return Promise.resolve();
  },

  /**
   * Get all granted permissions
   */
  getAll: async (): Promise<Record<string, PermissionResult>> => {
    const allPermissions = permissionStorage.getAll();
    const validPermissions: Record<string, PermissionResult> = {};

    // Filter out expired permissions
    Object.entries(allPermissions).forEach(([key, permission]) => {
      if (permission.granted) {
        if (permission.expiresAt && permission.expiresAt < Date.now()) {
          // Permission expired, skip it
        } else {
          validPermissions[key] = permission;
        }
      }
    });

    // If we removed any expired permissions, update storage
    if (Object.keys(validPermissions).length !== Object.keys(allPermissions).length) {
      permissionStorage.save(validPermissions);
    }

    return validPermissions;
  },
};

/**
 * PermissionsManager class provides an object-oriented interface
 * to the permissions system. It's a wrapper around the permissions API.
 */
export class PermissionsManager implements PermissionAPI {
  async request(request: PermissionRequest): Promise<PermissionResult> {
    return permissions.request(request);
  }

  async check(type: string, access: string[], scope?: string): Promise<boolean> {
    return permissions.check(type, access, scope);
  }

  async revoke(type: string, access?: string[], scope?: string): Promise<void> {
    return permissions.revoke(type, access, scope);
  }

  async getAll(): Promise<Record<string, PermissionResult>> {
    return permissions.getAll();
  }
}
