import { EventsAPI, EventCallback, EventOptions } from './types';

interface EventRecord<T = any> {
  timestamp: number;
  data: T;
}

/**
 * Events API implementation
 * 
 * In Stage 1, this uses a simple in-memory event system.
 * In production, this would integrate with the Vibing API for cross-client event handling.
 */
class EventsManager implements EventsAPI {
  private listeners: Record<string, Array<{ callback: EventCallback; once: boolean }>> = {};
  private eventHistory: Record<string, EventRecord[]> = {};
  private maxHistorySize = 100; // Maximum events to keep in history per event type

  /**
   * Subscribe to an event
   */
  subscribe<T = any>(
    eventName: string,
    callback: EventCallback<T>,
    options: EventOptions = {}
  ): () => void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    // Add the listener
    this.listeners[eventName].push({
      callback: callback as EventCallback,
      once: !!options.once
    });

    // Handle past events if requested
    if (options.includePast && this.eventHistory[eventName]) {
      const pastEvents = this.eventHistory[eventName];
      const maxPastEvents = options.maxPastEvents || pastEvents.length;
      
      // Send past events (newest to oldest)
      pastEvents
        .slice(-maxPastEvents)
        .forEach(record => {
          callback(record.data as T);
          
          // If it's a once listener, remove it after the first past event
          if (options.once) {
            this.removeListener(eventName, callback);
            return; // Exit after first event for once listeners
          }
        });
    }

    // Return unsubscribe function
    return () => this.removeListener(eventName, callback);
  }

  /**
   * Subscribe to an event once
   */
  once<T = any>(
    eventName: string,
    callback: EventCallback<T>,
    options: EventOptions = {}
  ): () => void {
    return this.subscribe(eventName, callback, { ...options, once: true });
  }

  /**
   * Publish an event
   */
  publish<T = any>(eventName: string, data: T): void {
    // Record the event in history
    if (!this.eventHistory[eventName]) {
      this.eventHistory[eventName] = [];
    }
    
    const event: EventRecord<T> = {
      timestamp: Date.now(),
      data
    };
    
    this.eventHistory[eventName].push(event);
    
    // Trim history if needed
    if (this.eventHistory[eventName].length > this.maxHistorySize) {
      this.eventHistory[eventName] = this.eventHistory[eventName].slice(-this.maxHistorySize);
    }

    // Notify listeners
    if (this.listeners[eventName]) {
      // Create a copy of the listeners array to avoid issues if listeners are removed during iteration
      const currentListeners = [...this.listeners[eventName]];
      
      currentListeners.forEach(({ callback, once }) => {
        callback(data);
        
        // If this is a one-time listener, remove it after execution
        if (once) {
          this.removeListener(eventName, callback);
        }
      });
    }
  }

  /**
   * Remove a listener
   */
  private removeListener(eventName: string, callback: EventCallback): void {
    if (!this.listeners[eventName]) {
      return;
    }

    this.listeners[eventName] = this.listeners[eventName].filter(
      listener => listener.callback !== callback
    );

    // Clean up empty listener arrays
    if (this.listeners[eventName].length === 0) {
      delete this.listeners[eventName];
    }
  }

  /**
   * Clear all event histories and listeners
   */
  clear(): void {
    this.listeners = {};
    this.eventHistory = {};
  }
}

export const events = new EventsManager(); 