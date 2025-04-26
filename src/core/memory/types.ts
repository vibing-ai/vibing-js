/**
 * Memory system types for the Vibing AI SDK
 */

/**
 * Configuration for memory system
 */
export interface MemoryConfig {
  /**
   * Default scope for memory operations
   */
  scope?: 'global' | 'project' | 'conversation';

  /**
   * Default expiration time in milliseconds
   */
  expiration?: number;
}

/**
 * Options for memory operations
 */
export interface MemoryOptions {
  /**
   * Scope of the memory
   * - global: Accessible across all projects and conversations
   * - project: Accessible within the current project
   * - conversation: Accessible only within the current conversation
   */
  scope: 'global' | 'project' | 'conversation';

  /**
   * Optional default value if memory doesn't exist
   */
  fallback?: any;

  /**
   * Optional expiration time in milliseconds
   */
  expiration?: number;
}

/**
 * Result interface for memory hook
 */
export interface MemoryResult<T> {
  /**
   * The data stored in memory
   */
  data: T | undefined;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Error if any occurred during memory operations
   */
  error: Error | null;

  /**
   * Function to update the stored value
   */
  set: (value: T) => Promise<void>;

  /**
   * Function to update based on current value
   */
  update: (updater: (currentValue: T | undefined) => T) => Promise<void>;

  /**
   * Function to remove the stored value
   */
  delete: () => Promise<void>;
}

/**
 * Function to query memory based on pattern
 */
export type MemoryQueryFn = (pattern: string | RegExp) => Promise<Record<string, any>>;

/**
 * Function for subscribing to memory changes
 */
export type MemorySubscribeFn = (key: string, callback: (newValue: any) => void) => () => void;

/**
 * Memory API interface
 */
export interface MemoryAPI {
  /**
   * Get value from memory
   */
  get: <T>(key: string, options?: MemoryOptions) => Promise<T | undefined>;

  /**
   * Set value in memory
   */
  set: <T>(key: string, value: T, options?: MemoryOptions) => Promise<void>;

  /**
   * Delete value from memory
   */
  delete: (key: string) => Promise<void>;

  /**
   * Query memory for keys matching pattern
   */
  query: MemoryQueryFn;

  /**
   * Subscribe to changes in memory
   */
  subscribe: MemorySubscribeFn;
}
