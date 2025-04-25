import { renderHook, act } from '@testing-library/react-hooks';
import { useMemory } from '../../src/common/memory';

// Mock the internal memory storage
const mockMemoryStorage = new Map<string, any>();

// Mock the actual memory implementation
jest.mock('../../src/common/memory/memoryStorage', () => ({
  getMemoryItem: jest.fn((key, options) => {
    const fullKey = `${options.scope}:${key}`;
    if (mockMemoryStorage.has(fullKey)) {
      return Promise.resolve(mockMemoryStorage.get(fullKey));
    }
    return Promise.resolve(undefined);
  }),
  setMemoryItem: jest.fn((key, value, options) => {
    const fullKey = `${options.scope}:${key}`;
    mockMemoryStorage.set(fullKey, value);
    return Promise.resolve();
  }),
  clearMemoryItem: jest.fn((key, options) => {
    const fullKey = `${options.scope}:${key}`;
    mockMemoryStorage.delete(fullKey);
    return Promise.resolve();
  })
}));

describe('useMemory', () => {
  beforeEach(() => {
    mockMemoryStorage.clear();
    jest.clearAllMocks();
  });

  test('should return fallback data when no data exists', async () => {
    const fallbackData = { test: 'value' };
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useMemory('test-key', {
        scope: 'conversation',
        fallback: fallbackData
      })
    );
    
    // Initially, it should be in loading state
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    // After loading, it should have the fallback data
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toEqual(fallbackData);
  });

  test('should retrieve existing data from memory', async () => {
    const existingData = { name: 'John', age: 30 };
    mockMemoryStorage.set('conversation:existing-data', existingData);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useMemory('existing-data', {
        scope: 'conversation'
      })
    );
    
    // Initially, it should be in loading state
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    // After loading, it should have the existing data
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toEqual(existingData);
  });

  test('should set data correctly', async () => {
    const newData = { updated: true, count: 42 };
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useMemory('test-data', {
        scope: 'project',
        fallback: { updated: false, count: 0 }
      })
    );
    
    await waitForNextUpdate();
    
    // Update the data
    act(() => {
      result.current.set(newData);
    });
    
    // Wait for the update to complete
    await waitForNextUpdate();
    
    // Verify the data was updated
    expect(result.current.data).toEqual(newData);
    expect(mockMemoryStorage.get('project:test-data')).toEqual(newData);
  });

  test('should clear data correctly', async () => {
    const initialData = { value: 'initial' };
    mockMemoryStorage.set('global:clearable-data', initialData);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useMemory('clearable-data', {
        scope: 'global'
      })
    );
    
    await waitForNextUpdate();
    
    // Verify we have the initial data
    expect(result.current.data).toEqual(initialData);
    
    // Clear the data
    act(() => {
      result.current.clear();
    });
    
    // Wait for the update to complete
    await waitForNextUpdate();
    
    // After clearing, it should be undefined
    expect(result.current.data).toBeUndefined();
    expect(mockMemoryStorage.has('global:clearable-data')).toBe(false);
  });

  test('should handle different scopes correctly', async () => {
    // Set up data in different scopes
    mockMemoryStorage.set('conversation:scoped-data', { scope: 'conversation' });
    mockMemoryStorage.set('project:scoped-data', { scope: 'project' });
    mockMemoryStorage.set('global:scoped-data', { scope: 'global' });
    
    // Test conversation scope
    const { result: conversationResult, waitForNextUpdate: waitForConversation } = renderHook(() => 
      useMemory('scoped-data', { scope: 'conversation' })
    );
    
    await waitForConversation();
    
    expect(conversationResult.current.data).toEqual({ scope: 'conversation' });
    
    // Test project scope
    const { result: projectResult, waitForNextUpdate: waitForProject } = renderHook(() => 
      useMemory('scoped-data', { scope: 'project' })
    );
    
    await waitForProject();
    
    expect(projectResult.current.data).toEqual({ scope: 'project' });
    
    // Test global scope
    const { result: globalResult, waitForNextUpdate: waitForGlobal } = renderHook(() => 
      useMemory('scoped-data', { scope: 'global' })
    );
    
    await waitForGlobal();
    
    expect(globalResult.current.data).toEqual({ scope: 'global' });
  });

  test('should handle arrays correctly', async () => {
    const arrayData = [1, 2, 3, 4, 5];
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useMemory<number[]>('array-data', {
        scope: 'conversation',
        fallback: []
      })
    );
    
    await waitForNextUpdate();
    
    // Update with array data
    act(() => {
      result.current.set(arrayData);
    });
    
    await waitForNextUpdate();
    
    // Verify array data
    expect(result.current.data).toEqual(arrayData);
    expect(Array.isArray(result.current.data)).toBe(true);
    
    // Update array by pushing (immutably)
    act(() => {
      result.current.set([...result.current.data, 6]);
    });
    
    await waitForNextUpdate();
    
    // Verify updated array
    expect(result.current.data).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.current.data.length).toBe(6);
  });

  test('should handle errors gracefully', async () => {
    // Mock an error in getMemoryItem
    const memoryStorage = require('../../src/common/memory/memoryStorage');
    memoryStorage.getMemoryItem.mockImplementationOnce(() => {
      return Promise.reject(new Error('Test error'));
    });
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useMemory('error-data', {
        scope: 'conversation',
        fallback: { safe: true }
      })
    );
    
    await waitForNextUpdate();
    
    // Should have the fallback data despite the error
    expect(result.current.loading).toBe(false);
    expect(result.current.error).not.toBe(null);
    expect(result.current.error?.message).toBe('Test error');
    expect(result.current.data).toEqual({ safe: true });
  });

  test('should handle partial updates correctly', async () => {
    const initialData = {
      name: 'Test User',
      preferences: {
        theme: 'light',
        fontSize: 12
      },
      settings: {
        notifications: true
      }
    };
    
    mockMemoryStorage.set('conversation:partial-data', initialData);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useMemory('partial-data', { scope: 'conversation' })
    );
    
    await waitForNextUpdate();
    
    // Partial update
    act(() => {
      result.current.set({
        ...result.current.data,
        preferences: {
          ...result.current.data.preferences,
          theme: 'dark'
        }
      });
    });
    
    await waitForNextUpdate();
    
    // Verify partial update
    expect(result.current.data).toEqual({
      name: 'Test User',
      preferences: {
        theme: 'dark', // Updated
        fontSize: 12
      },
      settings: {
        notifications: true
      }
    });
  });
}); 