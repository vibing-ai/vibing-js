/**
 * Type definitions for the events system
 */

/**
 * Event callback function
 */
export type EventCallback<T = any> = (data: T) => void;

/**
 * Options for event subscription
 */
export interface EventOptions {
  /**
   * Whether to receive events from the past
   */
  includePast?: boolean;
  
  /**
   * Maximum number of past events to receive
   */
  maxPastEvents?: number;
}

/**
 * Hook for managing events
 */
export interface EventsHook {
  /**
   * Subscribe to events
   */
  subscribe: <T = any>(
    eventName: string,
    callback: EventCallback<T>,
    options?: EventOptions
  ) => () => void;
  
  /**
   * Publish an event
   */
  publish: <T = any>(eventName: string, data: T) => void;
  
  /**
   * Subscribe to a single occurrence of an event
   */
  once: <T = any>(
    eventName: string,
    callback: EventCallback<T>,
    options?: EventOptions
  ) => () => void;
}

/**
 * Events API interface
 */
export interface EventsAPI {
  /**
   * Subscribe to events
   */
  subscribe: <T = any>(
    eventName: string,
    callback: EventCallback<T>,
    options?: EventOptions
  ) => () => void;
  
  /**
   * Publish an event
   */
  publish: <T = any>(eventName: string, data: T) => void;
  
  /**
   * Subscribe to a single occurrence of an event
   */
  once: <T = any>(
    eventName: string,
    callback: EventCallback<T>,
    options?: EventOptions
  ) => () => void;
} 