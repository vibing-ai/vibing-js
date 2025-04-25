export interface MemoryOptions {
  scope: string;
}

export const useMemory = jest.fn(() => {
  return {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
});

export const getMemoryItem = jest.fn(() => null);
export const setMemoryItem = jest.fn();
export const removeMemoryItem = jest.fn(); 