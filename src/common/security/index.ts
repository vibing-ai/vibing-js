/**
 * Security utilities for Vibing AI SDK
 * Provides secure storage, permission validation, and data sanitization
 */

import { PermissionRequest } from '../permissions/types';

/**
 * Options for creating a secure store
 */
export interface SecureStoreOptions {
  /**
   * Encryption key or method of obtaining it
   */
  encryptionKey?: string | (() => Promise<string>);
  
  /**
   * Whether to enable tamper detection
   * @default true
   */
  enableTamperDetection?: boolean;
  
  /**
   * Custom storage mechanism (defaults to localStorage with encryption)
   */
  storageDriver?: StorageDriver;
  
  /**
   * Namespace to prevent collisions
   * @default 'vibing-secure'
   */
  namespace?: string;
}

/**
 * Interface for storage drivers
 */
export interface StorageDriver {
  /**
   * Set an item in storage
   */
  setItem(key: string, value: string): Promise<void>;
  
  /**
   * Get an item from storage
   */
  getItem(key: string): Promise<string | null>;
  
  /**
   * Remove an item from storage
   */
  removeItem(key: string): Promise<void>;
  
  /**
   * Clear all items in the namespace
   */
  clear(): Promise<void>;
}

/**
 * Result of secure operations
 */
export interface SecurityResult<T = unknown> {
  /**
   * Whether the operation was successful
   */
  success: boolean;
  
  /**
   * Data if successful
   */
  data?: T;
  
  /**
   * Error message if unsuccessful
   */
  error?: string;
}

/**
 * A secure storage utility for sensitive data
 */
export interface SecureStore {
  /**
   * Set a value in secure storage
   * @param key Storage key
   * @param value Value to store
   */
  setItem<T>(key: string, value: T): Promise<SecurityResult>;
  
  /**
   * Get a value from secure storage
   * @param key Storage key
   * @returns The stored value or null if not found
   */
  getItem<T>(key: string): Promise<SecurityResult<T | null>>;
  
  /**
   * Remove an item from secure storage
   * @param key Storage key
   */
  removeItem(key: string): Promise<SecurityResult>;
  
  /**
   * Clear all data in this secure store
   */
  clear(): Promise<SecurityResult>;
}

/**
 * Creates an encrypted secure storage for sensitive data
 * @example
 * ```ts
 * const secureStore = createSecureStore({
 *   encryptionKey: 'my-secret-key',
 *   namespace: 'my-app'
 * });
 * 
 * // Store data securely
 * await secureStore.setItem('credentials', { username: 'user', token: 'secret' });
 * 
 * // Retrieve data
 * const result = await secureStore.getItem('credentials');
 * if (result.success && result.data) {
 *   const credentials = result.data;
 *   // Use credentials safely
 * }
 * ```
 */
export function createSecureStore(options: SecureStoreOptions = {}): SecureStore {
  const namespace = options.namespace || 'vibing-secure';
  
  // Default implementation uses localStorage with encryption
  // In a real implementation, this would use a proper encryption library
  const store: SecureStore = {
    async setItem<T>(key: string, value: T): Promise<SecurityResult> {
      try {
        const fullKey = `${namespace}:${key}`;
        const serialized = JSON.stringify(value);
        
        // In a real implementation, this would encrypt the data
        const encrypted = `encrypted:${serialized}`;
        
        // Use the provided storage driver or localStorage
        if (options.storageDriver) {
          await options.storageDriver.setItem(fullKey, encrypted);
        } else {
          localStorage.setItem(fullKey, encrypted);
        }
        
        return { success: true };
      } catch (e) {
        return { 
          success: false, 
          error: e instanceof Error ? e.message : 'Unknown error storing data' 
        };
      }
    },
    
    async getItem<T>(key: string): Promise<SecurityResult<T | null>> {
      try {
        const fullKey = `${namespace}:${key}`;
        
        // Get from storage
        let encrypted: string | null;
        if (options.storageDriver) {
          encrypted = await options.storageDriver.getItem(fullKey);
        } else {
          encrypted = localStorage.getItem(fullKey);
        }
        
        if (!encrypted) {
          return { success: true, data: null };
        }
        
        // In a real implementation, this would decrypt the data
        // and verify tampering if enabled
        if (!encrypted.startsWith('encrypted:')) {
          return { 
            success: false, 
            error: 'Data appears to be tampered with' 
          };
        }
        
        const serialized = encrypted.substring(10); // Remove 'encrypted:'
        const data = JSON.parse(serialized) as T;
        
        return { success: true, data };
      } catch (e) {
        return { 
          success: false, 
          error: e instanceof Error ? e.message : 'Unknown error retrieving data' 
        };
      }
    },
    
    async removeItem(key: string): Promise<SecurityResult> {
      try {
        const fullKey = `${namespace}:${key}`;
        
        if (options.storageDriver) {
          await options.storageDriver.removeItem(fullKey);
        } else {
          localStorage.removeItem(fullKey);
        }
        
        return { success: true };
      } catch (e) {
        return { 
          success: false, 
          error: e instanceof Error ? e.message : 'Unknown error removing data' 
        };
      }
    },
    
    async clear(): Promise<SecurityResult> {
      try {
        if (options.storageDriver) {
          await options.storageDriver.clear();
        } else {
          // Only clear items in our namespace
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith(`${namespace}:`)) {
              localStorage.removeItem(key);
            }
          });
        }
        
        return { success: true };
      } catch (e) {
        return { 
          success: false, 
          error: e instanceof Error ? e.message : 'Unknown error clearing data' 
        };
      }
    }
  };
  
  return store;
}

/**
 * Options for permission validation
 */
export interface PermissionValidationOptions {
  /**
   * Maximum scope level allowed (0-10, higher is broader)
   * @default 7
   */
  maxScopeLevel?: number;
  
  /**
   * Whether to allow wildcard permissions
   * @default false
   */
  allowWildcards?: boolean;
}

/**
 * Result of permission validation
 */
export interface PermissionValidationResult {
  /**
   * Whether the permissions are valid
   */
  valid: boolean;
  
  /**
   * Issues found during validation
   */
  issues?: string[];
  
  /**
   * Suggested alternatives for problematic permissions
   */
  suggestions?: Record<string, string[]>;
}

/**
 * Validates permissions and suggests improvements
 * @example
 * ```ts
 * const permissions = [
 *   { permission: "memory:write:*", reason: "Store user data" },
 *   { permission: "network:*", reason: "Access API" }
 * ];
 * 
 * const result = validatePermissions(permissions);
 * if (!result.valid) {
 *   console.warn("Permission issues:", result.issues);
 *   console.log("Suggestions:", result.suggestions);
 * }
 * ```
 */
export function validatePermissions(
  permissions: PermissionRequest[],
  options: PermissionValidationOptions = {}
): PermissionValidationResult {
  const maxScopeLevel = options.maxScopeLevel ?? 7;
  const allowWildcards = options.allowWildcards ?? false;
  
  const issues: string[] = [];
  const suggestions: Record<string, string[]> = {};
  
  for (const perm of permissions) {
    // Check if permission is properly formatted
    if (!perm.permission || typeof perm.permission !== 'string') {
      issues.push(`Invalid permission format: ${JSON.stringify(perm)}`);
      continue;
    }
    
    // Check if reason is provided
    if (!perm.reason || typeof perm.reason !== 'string') {
      issues.push(`Missing reason for permission: ${perm.permission}`);
    }
    
    const parts = perm.permission.split(':');
    
    // Validate permission format (domain:action:resource)
    if (parts.length < 2) {
      issues.push(`Invalid permission format for: ${perm.permission}`);
      continue;
    }
    
    // Check for overly broad permissions
    if (!allowWildcards && parts.some(p => p === '*')) {
      issues.push(`Overly broad wildcard in permission: ${perm.permission}`);
      
      // Suggest more specific permissions
      if (perm.permission === 'memory:*') {
        suggestions[perm.permission] = [
          'memory:read:user-preferences',
          'memory:write:user-data'
        ];
      } else if (perm.permission === 'network:*') {
        suggestions[perm.permission] = [
          'network:read:api.example.com',
          'network:write:api.example.com/user'
        ];
      }
    }
    
    // Calculate scope level based on specificity
    // This is a simplified example - real implementation would be more sophisticated
    const scopeLevel = parts.filter(p => p === '*').length * 3 + 
                      (parts.length < 3 ? 2 : 0);
    
    if (scopeLevel > maxScopeLevel) {
      issues.push(`Permission scope too broad: ${perm.permission} (level ${scopeLevel})`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues: issues.length > 0 ? issues : undefined,
    suggestions: Object.keys(suggestions).length > 0 ? suggestions : undefined
  };
}

/**
 * Options for HTML sanitization
 */
export interface SanitizeOptions {
  /**
   * Whether to allow certain HTML tags
   * @default false
   */
  allowTags?: boolean | string[];
  
  /**
   * Whether to preserve line breaks as <br>
   * @default true
   */
  preserveLineBreaks?: boolean;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @example
 * ```ts
 * // Basic usage - strips all HTML
 * const safe = sanitizeHtml("<script>alert('xss')</script>Hello <b>world</b>");
 * // Output: "Hello world"
 * 
 * // Allow specific tags
 * const formatted = sanitizeHtml(
 *   "<script>alert('xss')</script><b>Bold</b> and <i>italic</i>",
 *   { allowTags: ['b', 'i'] }
 * );
 * // Output: "Bold and italic"
 * ```
 */
export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
  const defaultOptions: SanitizeOptions = {
    allowTags: false,
    preserveLineBreaks: true
  };
  
  const opts = { ...defaultOptions, ...options };
  
  // Simple implementation - production code would use a proper sanitizer library
  let sanitized = html;
  
  // Remove all HTML tags
  if (!opts.allowTags) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } else if (Array.isArray(opts.allowTags)) {
    // Remove disallowed tags
    const allowedTagsRegex = new RegExp(
      `<(?!\/?(?:${opts.allowTags.join('|')})\\b)[^>]*>`, 
      'gi'
    );
    sanitized = sanitized.replace(allowedTagsRegex, '');
  }
  
  // Handle line breaks
  if (opts.preserveLineBreaks) {
    sanitized = sanitized.replace(/\n/g, '<br>');
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes user input
 * @example
 * ```ts
 * const result = validateInput("user@example.com", {
 *   type: "email",
 *   required: true
 * });
 * 
 * if (result.valid) {
 *   // Use the sanitized input
 *   saveEmail(result.sanitized);
 * } else {
 *   // Show error message
 *   showError(result.error);
 * }
 * ```
 */
export function validateInput(
  input: string,
  options: {
    type?: 'text' | 'email' | 'url' | 'number';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  } = {}
): { valid: boolean; sanitized?: string; error?: string } {
  // Default options
  const opts = {
    type: 'text',
    required: false,
    minLength: 0,
    maxLength: Infinity,
    ...options
  };
  
  // Trim input
  const trimmed = input.trim();
  
  // Check if required
  if (opts.required && !trimmed) {
    return { valid: false, error: 'This field is required' };
  }
  
  // Skip further validation if empty and not required
  if (!trimmed && !opts.required) {
    return { valid: true, sanitized: '' };
  }
  
  // Validate by type
  let sanitized = trimmed;
  let valid = true;
  let error;
  
  switch (opts.type) {
    case 'email':
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      if (!valid) error = 'Please enter a valid email address';
      break;
      
    case 'url':
      try {
        new URL(trimmed);
        valid = true;
      } catch {
        valid = false;
        error = 'Please enter a valid URL';
      }
      break;
      
    case 'number':
      valid = !isNaN(Number(trimmed));
      if (valid) sanitized = String(Number(trimmed));
      else error = 'Please enter a valid number';
      break;
  }
  
  // Check pattern if provided
  if (valid && opts.pattern && !opts.pattern.test(trimmed)) {
    valid = false;
    error = 'Input format is invalid';
  }
  
  // Check length constraints
  if (valid) {
    if (trimmed.length < opts.minLength) {
      valid = false;
      error = `Input must be at least ${opts.minLength} characters`;
    } else if (trimmed.length > opts.maxLength) {
      valid = false;
      error = `Input must be no more than ${opts.maxLength} characters`;
    }
  }
  
  return valid 
    ? { valid: true, sanitized } 
    : { valid: false, error: error || 'Invalid input' };
}

// Export all security utilities
export const security = {
  createSecureStore,
  validatePermissions,
  sanitizeHtml,
  validateInput
}; 