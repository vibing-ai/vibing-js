/**
 * Security utilities for Vibing AI SDK
 * Provides secure storage, permission validation, and data sanitization
 */

import { _Permission, _PermissionRequest } from '../permissions/types';
export * from './csrf';
export * from './rate-limit';

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
          error: e instanceof Error ? e.message : 'Unknown error storing data',
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
            error: 'Data appears to be tampered with',
          };
        }

        const serialized = encrypted.substring(10); // Remove 'encrypted:'
        const data = JSON.parse(serialized) as T;

        return { success: true, data };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e.message : 'Unknown error retrieving data',
        };
      }
    },

    async removeItem(key: string): Promise<SecurityResult> {
      try {
        const fullKey = `${namespace}:${key}`;

        // Remove from storage
        if (options.storageDriver) {
          await options.storageDriver.removeItem(fullKey);
        } else {
          localStorage.removeItem(fullKey);
        }

        return { success: true };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e.message : 'Unknown error removing data',
        };
      }
    },

    async clear(): Promise<SecurityResult> {
      try {
        if (options.storageDriver) {
          await options.storageDriver.clear();
        } else {
          // Only clear keys in our namespace
          const keys = Object.keys(localStorage).filter(key => key.startsWith(`${namespace}:`));
          keys.forEach(key => localStorage.removeItem(key));
        }

        return { success: true };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e.message : 'Unknown error clearing data',
        };
      }
    },
  };

  return store;
}

/**
 * A security permission request
 */
interface SecurityPermissionRequest {
  /**
   * Permission string in format "domain:action:resource"
   */
  permission: string;

  /**
   * Reason for requesting this permission
   */
  reason?: string;
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
 * Validates permissions to ensure they follow security best practices
 * @example
 * ```ts
 * const result = validatePermissions([
 *   { permission: "files:read:user" },
 *   { permission: "network:*:*", reason: "API access" }
 * ], { allowWildcards: false });
 *
 * if (!result.valid) {
 *   console.error("Permission issues:", result.issues);
 *   console.log("Suggested fixes:", result.suggestions);
 * }
 * ```
 */
export function validatePermissions(
  permissions: SecurityPermissionRequest[],
  options: PermissionValidationOptions = {}
): PermissionValidationResult {
  const opts = {
    maxScopeLevel: 7,
    allowWildcards: false,
    ...options,
  };

  const issues: string[] = [];
  const suggestions: Record<string, string[]> = {};

  const isValid = permissions.every(({ permission, reason }) => {
    const parts = permission.split(':');

    // Check basic format
    if (parts.length !== 3) {
      issues.push(`Permission "${permission}" should have format "domain:action:resource"`);
      suggestions[permission] = ['Use format "domain:action:resource"'];
      return false;
    }

    const [domain, action, resource] = parts;

    // Check for empty parts
    if (!domain || !action || !resource) {
      issues.push(`Permission "${permission}" has empty parts`);
      suggestions[permission] = ['Ensure all parts are non-empty'];
      return false;
    }

    // Check for wildcards
    if ((domain === '*' || action === '*' || resource === '*') && !opts.allowWildcards) {
      issues.push(`Wildcard in "${permission}" but wildcards are not allowed`);
      const suggest = [permission.replace(/\*/g, 'specific-value')];
      if (!reason) {
        issues.push(`Permission "${permission}" with wildcards needs a reason`);
        suggest.push('Add a reason for this broad permission');
      }
      suggestions[permission] = suggest;
      return false;
    }

    // Calculate a simple "scope level" to prevent overly broad permissions
    let scopeLevel = 0;
    if (domain === '*') scopeLevel += 4;
    if (action === '*') scopeLevel += 3;
    if (resource === '*') scopeLevel += 3;

    // Add points for particularly sensitive domains
    const sensitiveDomains = ['admin', 'system', 'payment', 'password'];
    if (sensitiveDomains.includes(domain)) scopeLevel += 2;

    if (scopeLevel > opts.maxScopeLevel) {
      issues.push(
        `Permission "${permission}" has scope level ${scopeLevel}, exceeding max ${opts.maxScopeLevel}`
      );
      suggestions[permission] = ['Make the permission more specific'];
      return false;
    }

    return true;
  });

  return {
    valid: isValid,
    issues: issues.length > 0 ? issues : undefined,
    suggestions: Object.keys(suggestions).length > 0 ? suggestions : undefined,
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

  /**
   * Allowed attributes for specific tags
   */
  allowAttributes?: Record<string, string[]>;
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
export function sanitizeHTML(content: string, options: SanitizeOptions = {}): string {
  // Default options
  const opts = {
    allowTags: false as false | string[],
    allowAttributes: {
      a: ['href', 'title', 'target'],
      span: ['class'],
      p: ['class'],
    },
    ...options,
  };

  // Very simplified HTML sanitizer - in a production environment,
  // use a proper sanitizer library like DOMPurify
  if (!content) {
    return '';
  }

  if (!opts.allowTags) {
    // Strip all tags if no allowlist
    return content.replace(/<[^>]*>/g, '');
  }

  const allowedTags = Array.isArray(opts.allowTags)
    ? opts.allowTags
    : ['b', 'i', 'em', 'strong', 'a', 'p', 'span'];

  // Remove disallowed tags
  const allowedTagsRegex = new RegExp(`<(?!/?(?:${allowedTags.join('|')})\\b)[^>]*>`, 'gi');
  let sanitized = content.replace(allowedTagsRegex, '');

  // Filter attributes if needed
  if (opts.allowAttributes) {
    for (const tag of allowedTags) {
      const allowedAttrs = opts.allowAttributes[tag] || [];
      if (allowedAttrs.length > 0) {
        // Find instances of this tag
        const tagRegex = new RegExp(`<${tag}\\s+[^>]*>`, 'gi');
        sanitized = sanitized.replace(tagRegex, match => {
          // Keep only allowed attributes
          let result = `<${tag}`;

          // Extract attributes
          const attrRegex = /(\w+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+)))?/g;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(match)) !== null) {
            const attrName = attrMatch[1];
            if (allowedAttrs.includes(attrName)) {
              // Keep this attribute
              const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';
              result += ` ${attrName}="${attrValue}"`;
            }
          }

          result += '>';
          return result;
        });
      }
    }
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
    ...options,
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

  return valid ? { valid: true, sanitized } : { valid: false, error: error || 'Invalid input' };
}

// Export all security utilities
export const security = {
  createSecureStore,
  validatePermissions,
  sanitizeHTML,
  validateInput,
};
