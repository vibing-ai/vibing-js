import { MemoryAPI, MemoryOptions } from './types';

/**
 * Storage key prefix for memory items
 */
const MEMORY_PREFIX = 'vibing_memory_';

/**
 * Format storage key based on provided key and scope
 */
const formatStorageKey = (key: string, scope: string): string => {
  return `${MEMORY_PREFIX}${scope}_${key}`;
};

/**
 * Parse storage key to extract the original key
 */
const parseStorageKey = (storageKey: string): { key: string; scope: string } | null => {
  if (!storageKey.startsWith(MEMORY_PREFIX)) {
    return null;
  }

  const withoutPrefix = storageKey.substring(MEMORY_PREFIX.length);
  const firstUnderscore = withoutPrefix.indexOf('_');
  
  if (firstUnderscore === -1) {
    return null;
  }

  const scope = withoutPrefix.substring(0, firstUnderscore);
  const key = withoutPrefix.substring(firstUnderscore + 1);

  return { key, scope };
};

/**
 * Storage wrapper for browser localStorage
 * In production, this would be replaced with actual API calls
 */
const storage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage access failed:', e);
      return null;
    }
  },

  setItem: (key: string, value: string, expirationMs?: number): void => {
    try {
      // If expiration is set, store with expiration metadata
      if (expirationMs) {
        const expiresAt = Date.now() + expirationMs;
        const valueWithExpiration = JSON.stringify({
          value: JSON.parse(value),
          expiresAt
        });
        localStorage.setItem(key, valueWithExpiration);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage remove failed:', e);
    }
  },

  getAllKeys: (): string[] => {
    try {
      return Object.keys(localStorage).filter(key => key.startsWith(MEMORY_PREFIX));
    } catch (e) {
      console.warn('localStorage getAllKeys failed:', e);
      return [];
    }
  }
};

/**
 * Event emitter for memory changes
 */
class MemoryEventEmitter {
  private listeners: Record<string, Array<(value: any) => void>> = {};

  emit(key: string, value: any): void {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(value));
    }
  }

  subscribe(key: string, callback: (value: any) => void): () => void {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);

    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
      if (this.listeners[key].length === 0) {
        delete this.listeners[key];
      }
    };
  }
}

const memoryEvents = new MemoryEventEmitter();

/**
 * Memory API implementation
 * 
 * In Stage 1, this uses localStorage for storage.
 * In production, this would make actual API calls to the Vibing API.
 */
export const memory: MemoryAPI = {
  get: async <T>(key: string, options: MemoryOptions = { scope: 'conversation' }): Promise<T | undefined> => {
    const storageKey = formatStorageKey(key, options.scope);
    const rawData = storage.getItem(storageKey);

    if (!rawData) {
      return options.fallback as T;
    }

    try {
      const parsed = JSON.parse(rawData);
      
      // Check if this is an item with expiration
      if (parsed && typeof parsed === 'object' && 'expiresAt' in parsed) {
        if (parsed.expiresAt < Date.now()) {
          // Item has expired, remove it and return fallback
          storage.removeItem(storageKey);
          return options.fallback as T;
        }
        return parsed.value as T;
      }
      
      return parsed as T;
    } catch (e) {
      console.error('Failed to parse memory item:', e);
      return options.fallback as T;
    }
  },

  set: async <T>(key: string, value: T, options: MemoryOptions = { scope: 'conversation' }): Promise<void> => {
    const storageKey = formatStorageKey(key, options.scope);
    
    try {
      const serialized = JSON.stringify(value);
      storage.setItem(storageKey, serialized, options.expiration);
      
      // Emit change event
      memoryEvents.emit(key, value);
      
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(new Error(`Failed to store memory: ${e}`));
    }
  },

  delete: async (key: string): Promise<void> => {
    // Delete from all scopes
    const scopes = ['global', 'project', 'conversation'];
    
    scopes.forEach(scope => {
      const storageKey = formatStorageKey(key, scope);
      storage.removeItem(storageKey);
    });
    
    // Emit change event with undefined to indicate deletion
    memoryEvents.emit(key, undefined);
    
    return Promise.resolve();
  },

  query: async (pattern: string | RegExp): Promise<Record<string, any>> => {
    const allKeys = storage.getAllKeys();
    const results: Record<string, any> = {};
    
    for (const storageKey of allKeys) {
      const parsedKey = parseStorageKey(storageKey);
      
      if (!parsedKey) {
        continue;
      }
      
      const { key } = parsedKey;
      
      // Check if key matches the pattern
      const matches = typeof pattern === 'string' 
        ? key.includes(pattern)
        : pattern.test(key);
      
      if (matches) {
        const rawData = storage.getItem(storageKey);
        
        if (rawData) {
          try {
            const parsed = JSON.parse(rawData);
            
            // Check if this is an item with expiration
            if (parsed && typeof parsed === 'object' && 'expiresAt' in parsed) {
              if (parsed.expiresAt >= Date.now()) {
                results[key] = parsed.value;
              }
            } else {
              results[key] = parsed;
            }
          } catch (e) {
            console.error(`Failed to parse memory item ${key}:`, e);
          }
        }
      }
    }
    
    return results;
  },

  subscribe: (key: string, callback: (newValue: any) => void): () => void => {
    return memoryEvents.subscribe(key, callback);
  }
}; 