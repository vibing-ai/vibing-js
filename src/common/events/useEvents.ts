import { useCallback, useEffect, useRef } from 'react';
import { EventsHook, EventCallback, EventOptions } from './types';
import { events } from './events';

/**
 * Hook for interacting with the Vibing AI events system
 * 
 * @returns An EventsHook object with functions to publish and subscribe to events
 * 
 * @example
 * ```tsx
 * const { publish, subscribe, once } = useEvents();
 * 
 * // Subscribe to an event
 * useEffect(() => {
 *   const unsubscribe = subscribe('user:message', (data) => {
 *     console.log('Received message:', data);
 *   });
 *   
 *   // Clean up subscription when component unmounts
 *   return unsubscribe;
 * }, [subscribe]);
 * 
 * // Publish an event
 * const sendMessage = () => {
 *   publish('user:message', { text: 'Hello, world!' });
 * };
 * ```
 */
export function useEvents(): EventsHook {
  // Track active subscriptions to clean them up when the component unmounts
  const subscriptionsRef = useRef<Array<() => void>>([]);

  // Clean up all subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, []);

  /**
   * Subscribe to an event
   */
  const subscribe = useCallback(<T = any>(
    eventName: string,
    callback: EventCallback<T>,
    options?: EventOptions
  ): (() => void) => {
    const unsubscribe = events.subscribe(eventName, callback, options);
    
    // Add this subscription to our tracking array
    subscriptionsRef.current.push(unsubscribe);
    
    // Return a function that both unsubscribes and removes from our tracking array
    return () => {
      unsubscribe();
      subscriptionsRef.current = subscriptionsRef.current.filter(fn => fn !== unsubscribe);
    };
  }, []);

  /**
   * Subscribe to an event once
   */
  const once = useCallback(<T = any>(
    eventName: string,
    callback: EventCallback<T>,
    options?: EventOptions
  ): (() => void) => {
    const unsubscribe = events.once(eventName, callback, options);
    
    // Add this subscription to our tracking array
    subscriptionsRef.current.push(unsubscribe);
    
    // Return a function that both unsubscribes and removes from our tracking array
    return () => {
      unsubscribe();
      subscriptionsRef.current = subscriptionsRef.current.filter(fn => fn !== unsubscribe);
    };
  }, []);

  /**
   * Publish an event
   */
  const publish = useCallback(<T = any>(
    eventName: string,
    data: T
  ): void => {
    events.publish(eventName, data);
  }, []);

  return {
    subscribe,
    once,
    publish
  };
} 