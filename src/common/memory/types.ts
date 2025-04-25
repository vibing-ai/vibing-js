/**
 * Type definitions for the memory system
 */
import { Scope, Result } from '../types';

/**
 * Options for memory operations
 */
export interface MemoryOptions {
  /**
   * Scope of the memory item
   */
  scope?: Scope;
  
  /**
   * Fallback value if item doesn't exist
   */
  fallback?: any;
  
  /**
   * Expiration time in milliseconds
   */
  expiration?: number;
}

/**
 * Result of a memory operation with additional methods
 */
export interface MemoryResult<T> extends Result<T> {
  /**
   * Set a new value for the memory item
   */
  set: (value: T) => Promise<void>;
  
  /**
   * Update the memory item based on current value
   */
  update: (updater: (current: T) => T) => Promise<void>;
  
  /**
   * Delete the memory item
   */
  delete: () => Promise<void>;
}

/**
 * Query parameters for finding memory items
 */
export interface MemoryQuery {
  /**
   * Optional scope to filter by
   */
  scope?: Scope;
  
  /**
   * Optional prefix to filter by
   */
  prefix?: string;
  
  /**
   * Optional pattern to match against
   */
  pattern?: string | RegExp;
}

/**
 * Memory API interface
 */
export interface MemoryAPI {
  /**
   * Get a value from memory
   */
  get: <T>(key: string, options?: MemoryOptions) => Promise<T | undefined>;
  
  /**
   * Set a value in memory
   */
  set: <T>(key: string, value: T, options?: MemoryOptions) => Promise<void>;
  
  /**
   * Delete a value from memory
   */
  delete: (key: string) => Promise<void>;
  
  /**
   * Query memory items
   */
  query: <T>(query: MemoryQuery) => Promise<Record<string, T>>;
  
  /**
   * Subscribe to memory changes
   */
  subscribe: <T>(key: string, callback: (value: T | undefined) => void) => () => void;
} 