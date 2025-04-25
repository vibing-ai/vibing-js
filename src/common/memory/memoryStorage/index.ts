/**
 * Options for memory storage operations
 */
export interface MemoryOptions {
  /** Scope for the memory item, used for namespacing */
  scope: string;
}

/**
 * In-memory storage implementation
 * For development or testing environments
 */
const memoryStore: Record<string, Record<string, unknown>> = {};

/**
 * Generate a scoped key for the memory store
 */
const getScopedKey = (key: string, options: MemoryOptions): string => {
  return `${options.scope}:${key}`;
};

/**
 * Retrieve an item from memory storage
 * @param key - The key to retrieve
 * @param options - Memory options including scope
 * @returns The stored value or null if not found
 */
export const getMemoryItem = <T>(key: string, options: MemoryOptions): T | null => {
  const scope = options.scope;

  if (!memoryStore[scope]) {
    return null;
  }

  return (memoryStore[scope][key] as T) || null;
};

/**
 * Store an item in memory storage
 * @param key - The key to store the value under
 * @param value - The value to store
 * @param options - Memory options including scope
 */
export const setMemoryItem = <T>(key: string, value: T, options: MemoryOptions): void => {
  const scope = options.scope;

  if (!memoryStore[scope]) {
    memoryStore[scope] = {};
  }

  memoryStore[scope][key] = value;
};

/**
 * Remove an item from memory storage
 * @param key - The key to remove
 * @param options - Memory options including scope
 */
export const removeMemoryItem = (key: string, options: MemoryOptions): void => {
  const scope = options.scope;

  if (!memoryStore[scope]) {
    return;
  }

  delete memoryStore[scope][key];
};
