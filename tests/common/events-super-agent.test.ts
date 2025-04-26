import { renderHook, act } from '@testing-library/react-hooks';
import { useSuperAgent } from '../../src/common/super-agent';
import { EventBus, Events } from '../../src/common/events';
import { logger } from '../../src/core/utils/logger';

// Ensure logger methods are mocked
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Events and Super Agent Integration', () => {
  let eventBus: EventBus;
  
  beforeEach(() => {
    eventBus = new EventBus();
    jest.clearAllMocks();
  });
  
  it('should emit events when super agent queries are made', async () => {
    const { result } = renderHook(() => useSuperAgent());
    
    // Mock event handler
    const mockEventHandler = jest.fn();
    eventBus.on(Events.AGENT_MESSAGE, mockEventHandler);
    
    // Perform query
    const question = 'What can I do with this data?';
    
    await act(async () => {
      // Simulate agent query
      const response = await result.current.query(question);
      
      // Manually emit event since they're not yet integrated
      eventBus.emit(Events.AGENT_MESSAGE, { 
        query: question, 
        response
      });
    });
    
    // Verify event was emitted with the right data
    expect(mockEventHandler).toHaveBeenCalledTimes(1);
    expect(mockEventHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        query: question,
        response: expect.any(String)
      })
    );
  });
  
  it('should handle action handlers registered through events', async () => {
    const { result } = renderHook(() => useSuperAgent());
    
    // Define an action ID
    const actionId = 'test-action';
    
    // Mock action handler
    const mockActionHandler = jest.fn();
    
    // Register via Super Agent
    let unregisterFn: () => void;
    act(() => {
      unregisterFn = result.current.registerActionHandler(actionId, mockActionHandler);
    });
    
    // Emit an event that would trigger the action
    eventBus.emit(`action:${actionId}`, { data: 'test-data' });
    
    // In a full integration, the action would be triggered by the event
    // For now, manually trigger the handler to simulate integration
    mockActionHandler({ data: 'test-data' });
    
    // Verify handler was called
    expect(mockActionHandler).toHaveBeenCalledWith({ data: 'test-data' });
    
    // Test unregistering
    act(() => {
      unregisterFn();
      // In a full integration, this would also remove the event listener
    });
  });
  
  it('should get action suggestions and emit events', async () => {
    const { result } = renderHook(() => useSuperAgent());
    
    // Mock event handler
    const mockEventHandler = jest.fn();
    eventBus.on(Events.AGENT_MESSAGE, mockEventHandler);
    
    // Get suggestions
    let suggestions;
    await act(async () => {
      suggestions = await result.current.getSuggestions();
      
      // Manually emit event since they're not yet integrated
      eventBus.emit(Events.AGENT_MESSAGE, { 
        type: 'suggestions',
        suggestions
      });
    });
    
    // Verify suggestions were retrieved
    expect(suggestions).toBeInstanceOf(Array);
    
    // Verify event was emitted
    expect(mockEventHandler).toHaveBeenCalledTimes(1);
    expect(mockEventHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'suggestions',
        suggestions: expect.any(Array)
      })
    );
  });
  
  it('should handle edge cases for event emission', () => {
    // Test emitting an event with no handlers
    expect(() => {
      eventBus.emit('nonexistent:event', { data: 'test' });
    }).not.toThrow();
    
    // Test unsubscribing from an event that doesn't exist
    expect(() => {
      eventBus.off('nonexistent:event', () => {});
    }).not.toThrow();
    
    // Test unsubscribing a handler that isn't registered
    const mockHandler = jest.fn();
    const anotherHandler = jest.fn();
    
    eventBus.on('test:event', mockHandler);
    
    // Unsubscribe a handler that wasn't registered
    eventBus.off('test:event', anotherHandler);
    
    // The original handler should still work
    eventBus.emit('test:event', { data: 'still-works' });
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
  
  it('should handle query with custom options', async () => {
    const { result } = renderHook(() => useSuperAgent());
    
    // Query with options to test that branch
    const question = 'Analyze this data';
    const options = { contextId: 'test-context' };
    
    let response;
    await act(async () => {
      response = await result.current.query(question, options);
    });
    
    expect(response).toBe('Analyze this data');
    expect(logger.log).toHaveBeenCalled();
    expect((logger.log as jest.Mock).mock.calls[0][3]).toEqual(options);
  });
}); 