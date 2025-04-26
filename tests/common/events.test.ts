import { EventBus, Events } from '../../src/common/events';

describe('Events Module', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('EventBus', () => {
    it('should initialize correctly', () => {
      expect(eventBus).toBeDefined();
      expect(eventBus.on).toBeInstanceOf(Function);
      expect(eventBus.off).toBeInstanceOf(Function);
      expect(eventBus.emit).toBeInstanceOf(Function);
    });

    it('should register and trigger event handlers', () => {
      const mockHandler = jest.fn();
      eventBus.on(Events.APP_READY, mockHandler);

      eventBus.emit(Events.APP_READY);
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should pass event data to handlers', () => {
      const mockHandler = jest.fn();
      const testData = { test: 'data' };
      
      eventBus.on(Events.DATA_UPDATED, mockHandler);
      eventBus.emit(Events.DATA_UPDATED, testData);
      
      expect(mockHandler).toHaveBeenCalledWith(testData);
    });

    it('should unregister event handlers', () => {
      const mockHandler = jest.fn();
      
      eventBus.on(Events.APP_READY, mockHandler);
      eventBus.off(Events.APP_READY, mockHandler);
      eventBus.emit(Events.APP_READY);
      
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should support multiple handlers for the same event', () => {
      const mockHandler1 = jest.fn();
      const mockHandler2 = jest.fn();
      
      eventBus.on(Events.APP_READY, mockHandler1);
      eventBus.on(Events.APP_READY, mockHandler2);
      
      eventBus.emit(Events.APP_READY);
      
      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(mockHandler2).toHaveBeenCalledTimes(1);
    });

    it('should not trigger handlers for different events', () => {
      const mockHandler = jest.fn();
      
      eventBus.on(Events.APP_READY, mockHandler);
      eventBus.emit(Events.DATA_UPDATED);
      
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should not throw when emitting an event with no handlers', () => {
      expect(() => {
        eventBus.emit(Events.APP_READY);
      }).not.toThrow();
    });
  });
}); 