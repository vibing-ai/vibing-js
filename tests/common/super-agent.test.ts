import { renderHook, act } from '@testing-library/react-hooks';
import { useSuperAgent, ActionSuggestion, QueryOptions } from '../../src/common/super-agent';
import { logger } from '../../src/core/utils/logger';

// Ensure logger methods are mocked
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Super Agent Integration', () => {
  describe('useSuperAgent hook', () => {
    beforeEach(() => {
      // Clear mock calls before each test
      jest.clearAllMocks();
    });
    
    it('should initialize correctly', () => {
      const { result } = renderHook(() => useSuperAgent());
      
      expect(result.current.query).toBeInstanceOf(Function);
      expect(result.current.getSuggestions).toBeInstanceOf(Function);
      expect(result.current.registerActionHandler).toBeInstanceOf(Function);
    });
    
    it('should handle basic queries', async () => {
      const { result } = renderHook(() => useSuperAgent());
      
      const question = 'What can I do with this data?';
      
      let response;
      await act(async () => {
        response = await result.current.query(question);
      });
      
      expect(response).toBeDefined();
      
      // Verify log output
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/\[Super Agent\]/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toMatch(/Query/);
      expect((logger.log as jest.Mock).mock.calls[0][2]).toBe(question);
    });
    
    it('should handle queries with options', async () => {
      const { result } = renderHook(() => useSuperAgent());
      
      const question = 'Analyze this data';
      const options: QueryOptions = {
        contextId: 'test-context'
      };
      
      let response;
      await act(async () => {
        response = await result.current.query(question, options);
      });
      
      expect(response).toBeDefined();
      
      // Verify log output
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/\[Super Agent\]/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toMatch(/Query/);
      expect((logger.log as jest.Mock).mock.calls[0][2]).toBe(question);
    });
    
    it('should get action suggestions', async () => {
      const { result } = renderHook(() => useSuperAgent());
      
      let suggestions;
      await act(async () => {
        suggestions = await result.current.getSuggestions();
      });
      
      expect(suggestions).toBeInstanceOf(Array);
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/\[Super Agent\]/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toMatch(/Getting suggestions/);
    });
    
    it('should register action handlers', () => {
      const { result } = renderHook(() => useSuperAgent());
      
      const actionHandler = jest.fn();
      let unregisterFn: (() => void) | undefined;
      
      act(() => {
        unregisterFn = result.current.registerActionHandler('test-action', actionHandler);
      });
      
      expect(unregisterFn).toBeInstanceOf(Function);
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/\[Super Agent\]/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toMatch(/Registered action handler/);
      expect((logger.log as jest.Mock).mock.calls[0][2]).toBe('test-action');
    });
    
    it('should unregister action handlers', () => {
      const { result } = renderHook(() => useSuperAgent());
      
      const actionHandler = jest.fn();
      let unregisterFn: (() => void) | undefined;
      
      act(() => {
        unregisterFn = result.current.registerActionHandler('test-action', actionHandler);
      });
      
      jest.clearAllMocks();
      
      // Unregister the handler
      act(() => {
        if (unregisterFn) unregisterFn();
      });
      
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/\[Super Agent\]/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toMatch(/Unregistered action handler/);
      expect((logger.log as jest.Mock).mock.calls[0][2]).toBe('test-action');
    });
  });
}); 