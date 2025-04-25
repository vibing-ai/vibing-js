import { renderHook, act } from '@testing-library/react-hooks';
import { useSuperAgent, ActionSuggestion, QueryOptions } from '../../src/common/super-agent';

// Mock console.log to prevent test output noise
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Super Agent Integration', () => {
  describe('useSuperAgent hook', () => {
    it('should initialize correctly', () => {
      const { result } = renderHook(() => useSuperAgent());
      
      expect(result.current.askSuperAgent).toBeInstanceOf(Function);
      expect(result.current.suggestAction).toBeInstanceOf(Function);
      expect(result.current.getConversationContext).toBeInstanceOf(Function);
      expect(result.current.onIntent).toBeInstanceOf(Function);
    });
    
    it('should handle basic queries', async () => {
      const { result } = renderHook(() => useSuperAgent());
      
      const query = 'What can I do with this data?';
      const response = await result.current.askSuperAgent(query);
      
      expect(response).toBeDefined();
      expect(response.text).toContain(query);
      expect(response.followupQuestions).toBeInstanceOf(Array);
      expect(response.suggestedActions).toBeInstanceOf(Array);
      
      // Verify log output
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toBe('[Super Agent] Query:');
      expect((console.log as jest.Mock).mock.calls[0][1]).toBe(query);
    });
    
    it('should handle queries with options', async () => {
      const { result } = renderHook(() => useSuperAgent());
      
      const query = 'Analyze this data';
      const options: QueryOptions = {
        includeHistory: true,
        contextItems: [
          { content: 'Sample data', title: 'Data', source: 'CSV file' }
        ],
        stream: false
      };
      
      const response = await result.current.askSuperAgent(query, options);
      
      expect(response).toBeDefined();
      
      // Verify log output
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toBe('[Super Agent] Query:');
      expect((console.log as jest.Mock).mock.calls[0][1]).toBe(query);
      expect((console.log as jest.Mock).mock.calls[0][2]).toBe('Options:');
      expect((console.log as jest.Mock).mock.calls[0][3]).toEqual(options);
    });
    
    it('should handle action suggestions', () => {
      const { result } = renderHook(() => useSuperAgent());
      (console.log as jest.Mock).mockClear();
      
      const suggestion: ActionSuggestion = {
        type: 'visualization',
        title: 'Create chart',
        description: 'Visualize the data as a bar chart',
        icon: 'chart-bar',
        action: jest.fn()
      };
      
      result.current.suggestAction(suggestion);
      
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toBe('[Super Agent] Action suggestion:');
      expect((console.log as jest.Mock).mock.calls[0][1]).toEqual(suggestion);
    });
    
    it('should provide conversation context', () => {
      const { result } = renderHook(() => useSuperAgent());
      
      const context = result.current.getConversationContext();
      
      expect(context).toBeDefined();
      expect(context.messages).toBeInstanceOf(Array);
      expect(context.activeComponents).toBeDefined();
      expect(context.appState).toBeDefined();
    });
    
    it('should register and handle intents', async () => {
      const { result } = renderHook(() => useSuperAgent());
      
      const intentHandler = jest.fn();
      
      // Register an intent handler
      act(() => {
        result.current.onIntent('testIntent', intentHandler);
      });
      
      // Trigger the intent
      await result.current.handleIntent('testIntent', { param: 'value' });
      
      expect(intentHandler).toHaveBeenCalledWith('testIntent', { param: 'value' });
    });
    
    it('should unregister intent handlers', async () => {
      const { result } = renderHook(() => useSuperAgent());
      
      const intentHandler = jest.fn();
      
      // Register an intent handler
      let unregisterHandler;
      act(() => {
        unregisterHandler = result.current.onIntent('testIntent', intentHandler);
      });
      
      // Unregister the handler
      act(() => {
        unregisterHandler();
      });
      
      // Trigger the intent
      await result.current.handleIntent('testIntent', { param: 'value' });
      
      // Handler should not have been called
      expect(intentHandler).not.toHaveBeenCalled();
    });
    
    it('should handle multiple intent handlers', async () => {
      const { result } = renderHook(() => useSuperAgent());
      
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      // Register multiple handlers for the same intent
      act(() => {
        result.current.onIntent('sharedIntent', handler1);
        result.current.onIntent('sharedIntent', handler2);
      });
      
      // Trigger the intent
      await result.current.handleIntent('sharedIntent', { param: 'value' });
      
      // Both handlers should have been called
      expect(handler1).toHaveBeenCalledWith('sharedIntent', { param: 'value' });
      expect(handler2).toHaveBeenCalledWith('sharedIntent', { param: 'value' });
    });
  });
}); 