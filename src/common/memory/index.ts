import * as memoryStorage from './memoryStorage';

export interface MemoryOptions {
  scope: string;
}

export const useMemory = () => {
  return {
    getItem: (key: string, options?: Partial<MemoryOptions>) => {
      const scope = options?.scope || 'default';
      return memoryStorage.getMemoryItem(key, { scope });
    },
    setItem: (key: string, value: any, options?: Partial<MemoryOptions>) => {
      const scope = options?.scope || 'default';
      memoryStorage.setMemoryItem(key, value, { scope });
    },
    removeItem: (key: string, options?: Partial<MemoryOptions>) => {
      const scope = options?.scope || 'default';
      memoryStorage.removeMemoryItem(key, { scope });
    },
  };
};
