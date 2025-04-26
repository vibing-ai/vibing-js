import { events, EventEmitter, publish } from '../../src/core/events';

describe('Core Event System', () => {
  afterEach(() => {
    events.clearAll();
  });

  describe('events singleton', () => {
    it('should allow subscribing to events', () => {
      const callback = jest.fn();
      const eventName = 'test-event';
      const unsubscribe = events.subscribe(eventName, callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Test publishing
      const testData = { value: 42 };
      events.publish(eventName, testData);
      expect(callback).toHaveBeenCalledWith(testData);
      
      // Test unsubscribe
      unsubscribe();
      events.publish(eventName, { value: 43 });
      expect(callback).toHaveBeenCalledTimes(1);
    });
    
    it('should handle multiple subscribers to the same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const eventName = 'multi-event';
      
      events.subscribe(eventName, callback1);
      events.subscribe(eventName, callback2);
      
      const testData = { test: true };
      events.publish(eventName, testData);
      
      expect(callback1).toHaveBeenCalledWith(testData);
      expect(callback2).toHaveBeenCalledWith(testData);
    });
    
    it('should handle errors in event listeners without breaking other listeners', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const goodCallback = jest.fn();
      const eventName = 'error-event';
      
      // Mock console.error to prevent test output noise
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      events.subscribe(eventName, errorCallback);
      events.subscribe(eventName, goodCallback);
      
      events.publish(eventName, {});
      
      expect(errorCallback).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();
      
      // Restore console.error
      console.error = originalConsoleError;
    });
    
    it('should do nothing when publishing to an event with no subscribers', () => {
      // This is just a smoke test to ensure no errors occur
      expect(() => {
        events.publish('nonexistent-event', {});
      }).not.toThrow();
    });
    
    it('should support on/off style subscription', () => {
      const callback = jest.fn();
      const eventName = 'on-off-event';
      
      events.on(eventName, callback);
      events.emit(eventName, 'test-data');
      
      expect(callback).toHaveBeenCalledWith('test-data');
      
      events.off(eventName, callback);
      events.emit(eventName, 'more-data');
      
      expect(callback).toHaveBeenCalledTimes(1);
    });
    
    it('should clear all listeners for a specific event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const eventName = 'clear-event';
      
      events.subscribe(eventName, callback1);
      events.subscribe(eventName, callback2);
      
      // Verify callbacks are working
      events.publish(eventName, {});
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      
      // Clear all listeners for this event
      events.clear(eventName);
      
      // Publish again, no callbacks should be called again
      callback1.mockClear();
      callback2.mockClear();
      events.publish(eventName, {});
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
    
    it('should clear all events with clearAll', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      events.subscribe('event1', callback1);
      events.subscribe('event2', callback2);
      
      // Verify subscriptions work
      events.publish('event1', {});
      events.publish('event2', {});
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      
      // Clear all events
      events.clearAll();
      
      // Check that no callbacks are called
      callback1.mockClear();
      callback2.mockClear();
      events.publish('event1', {});
      events.publish('event2', {});
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });
  
  describe('EventEmitter class', () => {
    it('should allow subscribing and emitting events', () => {
      const emitter = new EventEmitter();
      const callback = jest.fn();
      
      emitter.on('test', callback);
      emitter.emit('test', 'event-data');
      
      expect(callback).toHaveBeenCalledWith('event-data');
    });
    
    it('should handle multiple listeners for the same event', () => {
      const emitter = new EventEmitter();
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      emitter.on('multi', callback1);
      emitter.on('multi', callback2);
      
      emitter.emit('multi', 'data');
      
      expect(callback1).toHaveBeenCalledWith('data');
      expect(callback2).toHaveBeenCalledWith('data');
    });
    
    it('should return an unsubscribe function when adding a listener', () => {
      const emitter = new EventEmitter();
      const callback = jest.fn();
      
      const unsubscribe = emitter.on('test', callback);
      emitter.emit('test', 'first');
      expect(callback).toHaveBeenCalledWith('first');
      
      unsubscribe();
      emitter.emit('test', 'second');
      expect(callback).toHaveBeenCalledTimes(1);
    });
    
    it('should do nothing when emitting an event with no listeners', () => {
      const emitter = new EventEmitter();
      
      expect(() => {
        emitter.emit('nonexistent', 'data');
      }).not.toThrow();
    });
    
    it('should do nothing when removing a listener from a nonexistent event', () => {
      const emitter = new EventEmitter();
      const callback = jest.fn();
      
      expect(() => {
        emitter.off('nonexistent', callback);
      }).not.toThrow();
    });
  });
  
  describe('publish function', () => {
    it('should forward calls to events.publish', () => {
      const callback = jest.fn();
      const eventName = 'global-event';
      
      events.subscribe(eventName, callback);
      
      publish(eventName, 'test-data');
      
      expect(callback).toHaveBeenCalledWith('test-data');
    });
    
    it('should handle undefined data', () => {
      const callback = jest.fn();
      const eventName = 'undefined-data';
      
      events.subscribe(eventName, callback);
      publish(eventName);
      
      expect(callback).toHaveBeenCalledWith(undefined);
    });
  });
}); 