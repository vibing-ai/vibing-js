import { renderHook, act } from '@testing-library/react-hooks';
import { useMemory, MemoryOptions } from '../../src/common/memory';

// Mock the internal memory storage
jest.mock('../../src/common/memory/memoryStorage', () => {
  const mockStorage = new Map<string, any>();
  
  return {
    getMemoryItem: jest.fn((key, options) => {
      const fullKey = `${options.scope}:${key}`;
      return mockStorage.get(fullKey);
    }),
    setMemoryItem: jest.fn((key, value, options) => {
      const fullKey = `${options.scope}:${key}`;
      mockStorage.set(fullKey, value);
    }),
    removeMemoryItem: jest.fn((key, options) => {
      const fullKey = `${options.scope}:${key}`;
      mockStorage.delete(fullKey);
    }),
    _clearMockStorage: () => mockStorage.clear(),
    _getMockStorage: () => mockStorage
  };
});

describe('useMemory', () => {
  const memoryStorage = require('../../src/common/memory/memoryStorage');
  
  beforeEach(() => {
    memoryStorage._clearMockStorage();
    jest.clearAllMocks();
  });

  test('should get item with default scope', () => {
    const { result } = renderHook(() => useMemory());
    
    // Setup mock return value
    memoryStorage.getMemoryItem.mockReturnValueOnce('test-value');
    
    let value;
    act(() => {
      value = result.current.getItem('test-key');
    });
    
    expect(memoryStorage.getMemoryItem).toHaveBeenCalledWith('test-key', { scope: 'default' });
    expect(value).toBe('test-value');
  });

  test('should get item with custom scope', () => {
    const { result } = renderHook(() => useMemory());
    
    memoryStorage.getMemoryItem.mockReturnValueOnce('scoped-value');
    
    let value;
    act(() => {
      value = result.current.getItem('test-key', { scope: 'custom' });
    });
    
    expect(memoryStorage.getMemoryItem).toHaveBeenCalledWith('test-key', { scope: 'custom' });
    expect(value).toBe('scoped-value');
  });

  test('should set item with default scope', () => {
    const { result } = renderHook(() => useMemory());
    
    act(() => {
      result.current.setItem('test-key', 'test-value');
    });
    
    expect(memoryStorage.setMemoryItem).toHaveBeenCalledWith('test-key', 'test-value', { scope: 'default' });
    expect(memoryStorage._getMockStorage().get('default:test-key')).toBe('test-value');
  });

  test('should set item with custom scope', () => {
    const { result } = renderHook(() => useMemory());
    
    act(() => {
      result.current.setItem('test-key', 'custom-value', { scope: 'custom' });
    });
    
    expect(memoryStorage.setMemoryItem).toHaveBeenCalledWith('test-key', 'custom-value', { scope: 'custom' });
    expect(memoryStorage._getMockStorage().get('custom:test-key')).toBe('custom-value');
  });

  test('should remove item with default scope', () => {
    const { result } = renderHook(() => useMemory());
    
    // First set an item
    memoryStorage._getMockStorage().set('default:test-key', 'test-value');
    
    act(() => {
      result.current.removeItem('test-key');
    });
    
    expect(memoryStorage.removeMemoryItem).toHaveBeenCalledWith('test-key', { scope: 'default' });
    expect(memoryStorage._getMockStorage().has('default:test-key')).toBe(false);
  });

  test('should remove item with custom scope', () => {
    const { result } = renderHook(() => useMemory());
    
    // First set an item
    memoryStorage._getMockStorage().set('custom:test-key', 'custom-value');
    
    act(() => {
      result.current.removeItem('test-key', { scope: 'custom' });
    });
    
    expect(memoryStorage.removeMemoryItem).toHaveBeenCalledWith('test-key', { scope: 'custom' });
    expect(memoryStorage._getMockStorage().has('custom:test-key')).toBe(false);
  });
  
  test('should handle complex values', () => {
    const { result } = renderHook(() => useMemory());
    
    const complexValue = {
      name: 'Test Object',
      nested: {
        value: 42,
        array: [1, 2, 3]
      }
    };
    
    act(() => {
      result.current.setItem('complex-key', complexValue);
    });
    
    memoryStorage.getMemoryItem.mockReturnValueOnce(complexValue);
    
    let retrievedValue;
    act(() => {
      retrievedValue = result.current.getItem('complex-key');
    });
    
    expect(retrievedValue).toEqual(complexValue);
  });
  
  test('should return null for non-existent keys', () => {
    const { result } = renderHook(() => useMemory());
    
    memoryStorage.getMemoryItem.mockReturnValueOnce(null);
    
    let value;
    act(() => {
      value = result.current.getItem('non-existent-key');
    });
    
    expect(value).toBeNull();
  });
}); 