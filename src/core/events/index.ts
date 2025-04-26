/**
 * Simple event system for the Vibing AI SDK
 */

// Event listener type
type EventListener<T = unknown> = (data: T) => void;

/**
 * EventEmitter class for backward compatibility
 */
export class EventEmitter {
  private listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

  on(event: string, callback: (...args: unknown[]) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);

    return () => this.off(event, callback);
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter(listener => listener !== callback);
  }

  emit(event: string, ...args: unknown[]): void {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach(listener => {
      listener(...args);
    });
  }
}

// Event system
class EventSystem {
  private listeners: Record<string, EventListener<unknown>[]> = {};

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  subscribe<T = unknown>(event: string, callback: EventListener<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback as EventListener<unknown>);

    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Publish an event
   * @param event Event name
   * @param data Event data
   */
  publish<T = unknown>(event: string, data: T): void {
    const eventListeners = this.listeners[event];

    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (err) {
          console.error(`Error in event listener for '${event}':`, err);
        }
      });
    }
  }

  /**
   * Subscribe to an event (alias for subscribe)
   * @param event Event name
   * @param callback Callback function
   */
  on<T = unknown>(event: string, callback: EventListener<T>): void {
    this.subscribe(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param event Event name
   * @param callback Callback function
   */
  off<T = unknown>(event: string, callback: EventListener<T>): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(
      cb => cb !== (callback as EventListener<unknown>)
    );
  }

  /**
   * Emit an event (alias for publish)
   * @param event Event name
   * @param data Event data
   */
  emit<T = unknown>(event: string, data: T): void {
    this.publish(event, data);
  }

  /**
   * Clear all listeners for an event
   * @param event Event name
   */
  clear(event: string): void {
    delete this.listeners[event];
  }

  /**
   * Clear all event listeners
   */
  clearAll(): void {
    this.listeners = {};
  }
}

// Export a singleton instance
export const events = new EventSystem();

/**
 * Publish an event to all subscribers
 * Similar to emit but typically used for system-level events
 * @param eventName The name of the event
 * @param data The data to send with the event
 */
export const publish = function <T = unknown>(eventName: string, data?: T) {
  events.publish(eventName, data);
};
