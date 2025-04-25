/**
 * Memory module for state management
 */

// Export types
export * from './types';

// Hook will be implemented in Stage 1
// export { useMemory } from './useMemory';

// API will be implemented in Stage 1
// export { memory } from './memory';

// Export core functionality
export { MemoryManager } from './memory';
export { useMemory } from './useMemory';

/**
 * Memory management utilities for persisting and retrieving application state
 */

import { MemoryManager } from './memory';
import { MemoryConfig } from './types';

/**
 * Create a memory manager instance
 */
export function createMemory(config: MemoryConfig = {}) {
  return new MemoryManager(config);
}

/**
 * Memory manager interface for plugin/application development
 */
export const memory = {
  /**
   * Get a value from memory
   */
  get: (_key: string) => {
    // Stub implementation - to be completed
    return null;
  },

  /**
   * Set a value in memory
   */
  set: (_key: string, _value: unknown) => {
    // Stub implementation - to be completed
  },

  /**
   * Remove a value from memory
   */
  remove: (_key: string) => {
    // Stub implementation - to be completed
  },
};
