import { useState, useEffect, useCallback } from 'react';
import { MemoryOptions, MemoryResult } from './types';
import { memory } from './memory';

/**
 * Hook for interacting with the Vibing AI memory system
 * 
 * @param key - Unique identifier for the memory item
 * @param options - Configuration options for the memory operation
 * @returns A MemoryResult object with data and functions to interact with memory
 * 
 * @example
 * ```tsx
 * const { data, loading, error, set } = useMemory<string>('greeting', {
 *   scope: 'conversation',
 *   fallback: 'Hello, world!'
 * });
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return (
 *   <div>
 *     <p>Current greeting: {data}</p>
 *     <button onClick={() => set('Hello, Vibing!')}>Update Greeting</button>
 *   </div>
 * );
 * ```
 */
export function useMemory<T>(
  key: string,
  options: MemoryOptions = { scope: 'conversation' }
): MemoryResult<T> {
  const [data, setData] = useState<T | undefined>(options.fallback as T);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await memory.get<T>(key, options);
        
        if (isMounted) {
          setData(result !== undefined ? result : options.fallback as T);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setData(options.fallback as T);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Set up subscription to memory changes
    const unsubscribe = memory.subscribe(key, (newValue: T) => {
      if (isMounted) {
        setData(newValue);
      }
    });

    // Cleanup function
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [key, options.scope, options.fallback]);

  // Set function
  const set = useCallback(
    async (value: T) => {
      try {
        setLoading(true);
        await memory.set(key, value, options);
        setData(value);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [key, options]
  );

  // Update function
  const update = useCallback(
    async (updater: (currentValue: T | undefined) => T) => {
      try {
        setLoading(true);
        const newValue = updater(data);
        await memory.set(key, newValue, options);
        setData(newValue);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [key, data, options]
  );

  // Delete function
  const deleteData = useCallback(async () => {
    try {
      setLoading(true);
      await memory.delete(key);
      setData(undefined);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [key]);

  return {
    data,
    loading,
    error,
    set,
    update,
    delete: deleteData
  };
} 