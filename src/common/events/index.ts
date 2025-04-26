/**
 * Standard events used throughout the application
 */
export enum Events {
  APP_READY = 'app:ready',
  DATA_UPDATED = 'data:updated',
  AGENT_STARTED = 'agent:started',
  AGENT_STOPPED = 'agent:stopped',
  AGENT_ERROR = 'agent:error',
  AGENT_MESSAGE = 'agent:message',
  USER_MESSAGE = 'user:message',
}

/**
 * Type definition for event handlers
 */
export type EventHandler = (data?: unknown) => void;

/**
 * EventBus class for implementing the pub/sub pattern
 * Allows components to communicate without direct dependencies
 */
export class EventBus {
  private handlers: Map<string, EventHandler[]>;

  constructor() {
    this.handlers = new Map();
  }

  /**
   * Subscribe to an event
   * @param event The event to subscribe to
   * @param handler The handler function to call when the event is emitted
   */
  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }

    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.push(handler);
    }
  }

  /**
   * Unsubscribe from an event
   * @param event The event to unsubscribe from
   * @param handler The handler function to remove
   */
  off(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      return;
    }

    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event with optional data
   * @param event The event to emit
   * @param data Optional data to pass to handlers
   */
  emit(event: string, data?: unknown): void {
    if (!this.handlers.has(event)) {
      return;
    }

    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        handler(data);
      });
    }
  }
}
