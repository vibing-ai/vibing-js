/**
 * Type definitions for the permissions system
 */
import { Scope } from '../types';

/**
 * Permission access levels
 */
export type AccessLevel = 'read' | 'write' | 'execute';

/**
 * Types for the Vibing AI permissions system
 */

/**
 * Permission request interface
 */
export interface PermissionRequest {
  /**
   * Type of permission (e.g., 'memory', 'network', 'file')
   */
  type: string;
  
  /**
   * Level of access requested (e.g., 'read', 'write')
   */
  access: string[];
  
  /**
   * Scope of the permission
   */
  scope: 'global' | 'project' | 'conversation';
  
  /**
   * Optional duration in milliseconds for how long the permission is valid
   */
  duration?: number;
  
  /**
   * Optional description of why the permission is needed
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
 * Result of a permission operation
 */
export interface PermissionResult {
  /**
   * Whether the permission was granted
   */
  granted: boolean;
  
  /**
   * The permission request that was processed
   */
  request: PermissionRequest;
  
  /**
   * Timestamp when the permission was granted
   */
  grantedAt?: number;
  
  /**
   * Timestamp when the permission expires (if applicable)
   */
  expiresAt?: number;
}

/**
 * Permission hook interface
 */
export interface PermissionHook {
  /**
   * Request a single permission
   */
  request: (request: PermissionRequest) => Promise<PermissionResult>;
  
  /**
   * Check if a permission exists
   */
  check: (type: string, access: string[], scope?: string) => Promise<boolean>;
  
  /**
   * Request multiple permissions at once
   */
  requestAll: (requests: PermissionRequest[]) => Promise<PermissionResult[]>;
  
  /**
   * Revoke a previously granted permission
   */
  revoke: (type: string, access?: string[], scope?: string) => Promise<void>;
}

/**
 * Permission API interface
 */
export interface PermissionAPI {
  /**
   * Request a permission
   */
  request: (request: PermissionRequest) => Promise<PermissionResult>;
  
  /**
   * Check if a permission exists
   */
  check: (type: string, access: string[], scope?: string) => Promise<boolean>;
  
  /**
   * Revoke a permission
   */
  revoke: (type: string, access?: string[], scope?: string) => Promise<void>;
  
  /**
   * Get all granted permissions
   */
  getAll: () => Promise<Record<string, PermissionResult>>;
} 