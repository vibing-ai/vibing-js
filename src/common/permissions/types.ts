/**
 * Type definitions for the permissions system
 */
import { Scope } from '../types';

/**
 * Permission access levels
 */
export type AccessLevel = 'read' | 'write' | 'execute';

/**
 * Permission request parameters
 */
export interface PermissionRequest {
  /**
   * Type of permission (e.g., 'memory', 'network')
   */
  type: string;
  
  /**
   * Requested access levels
   */
  access: AccessLevel[];
  
  /**
   * Scope of the permission
   */
  scope: Scope;
  
  /**
   * Optional duration in milliseconds
   */
  duration?: number;
  
  /**
   * Optional explanation of why this permission is needed
   */
  purpose?: string;
}

/**
 * Permission status
 */
export interface Permission {
  /**
   * Type of permission
   */
  type: string;
  
  /**
   * Granted access levels
   */
  access: AccessLevel[];
  
  /**
   * Scope of the permission
   */
  scope: Scope;
  
  /**
   * When the permission was granted
   */
  grantedAt: number;
  
  /**
   * When the permission expires (if temporary)
   */
  expiresAt?: number;
}

/**
 * Result of a permission request
 */
export interface PermissionResult {
  /**
   * Whether the permission was granted
   */
  granted: boolean;
  
  /**
   * The permission details (if granted)
   */
  permission?: Permission;
  
  /**
   * Reason for denial (if not granted)
   */
  reason?: string;
}

/**
 * Hook for managing permissions
 */
export interface PermissionHook {
  /**
   * Request a permission
   */
  request: (req: PermissionRequest) => Promise<PermissionResult>;
  
  /**
   * Check if a permission exists
   */
  check: (type: string, access: AccessLevel, scope?: Scope) => Promise<boolean>;
  
  /**
   * Request multiple permissions at once
   */
  requestAll: (requests: PermissionRequest[]) => Promise<PermissionResult[]>;
  
  /**
   * Revoke a permission
   */
  revoke: (type: string, scope?: Scope) => Promise<void>;
} 