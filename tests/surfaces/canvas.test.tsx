import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useCanvas, CanvasConfig } from '../../src/surfaces/canvas';
import { logger } from '../../src/core/utils/logger';

// Ensure logger methods are mocked
beforeEach(() => {
  jest.clearAllMocks();
});

// Helper function for tests
const createMockFn = () => jest.fn();

describe('Canvas Surface', () => {
  describe('useCanvas hook', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCanvas());
      
      expect(result.current.isActive).toBe(false);
      expect(result.current.activeContent).toBeNull();
      expect(typeof result.current.showCanvas).toBe('function');
      expect(typeof result.current.hideCanvas).toBe('function');
      expect(typeof result.current.updateCanvas).toBe('function');
    });
    
    it('should show canvas with correct configuration', () => {
      const { result } = renderHook(() => useCanvas());
      
      const content = <div>Canvas content</div>;
      const config: CanvasConfig = {
        content,
        fullScreen: true,
        overlay: true,
        onClose: createMockFn(),
      };
      
      act(() => {
        result.current.showCanvas(config);
      });
      
      expect(result.current.isActive).toBe(true);
      expect(result.current.activeContent).toBe(content);
      expect(result.current.config).toEqual(config);
      
      // Check that logger.log was called
      expect(logger.log).toHaveBeenCalledWith('[Canvas] Opened:', config);
    });
    
    it('should update canvas correctly', () => {
      const { result } = renderHook(() => useCanvas());
      
      // First show the canvas
      const initialContent = <div>Initial content</div>;
      act(() => {
        result.current.showCanvas({ content: initialContent });
      });
      
      expect(result.current.isActive).toBe(true);
      expect(result.current.activeContent).toBe(initialContent);
      
      // Then update it
      jest.clearAllMocks();
      const newContent = <div>Updated content</div>;
      const newConfig = { content: newContent, fullScreen: false };
      
      act(() => {
        result.current.updateCanvas(newConfig);
      });
      
      expect(result.current.activeContent).toBe(newContent);
      expect(result.current.config.fullScreen).toBe(false);
      
      // Check that logger.log was called with updated config
      expect(logger.log).toHaveBeenCalledWith('[Canvas] Updated:', expect.objectContaining({
        content: newContent,
        fullScreen: false
      }));
    });
    
    it('should hide canvas correctly', () => {
      const { result } = renderHook(() => useCanvas());
      const onCloseMock = createMockFn();
      
      // First show the canvas
      act(() => {
        result.current.showCanvas({ 
          content: <div>Canvas content</div>,
          onClose: onCloseMock,
        });
      });
      
      expect(result.current.isActive).toBe(true);
      
      // Then hide it
      jest.clearAllMocks();
      
      act(() => {
        result.current.hideCanvas();
      });
      
      expect(result.current.isActive).toBe(false);
      expect(result.current.activeContent).toBeNull();
      expect(onCloseMock).toHaveBeenCalled();
      
      // Check that logger.log was called
      expect(logger.log).toHaveBeenCalledWith('[Canvas] Closed');
    });
    
    it('should handle multiple show calls correctly', () => {
      const { result } = renderHook(() => useCanvas());
      const firstOnCloseMock = createMockFn();
      const secondOnCloseMock = createMockFn();
      
      // Show first canvas
      const firstContent = <div>First content</div>;
      act(() => {
        result.current.showCanvas({ 
          content: firstContent,
          onClose: firstOnCloseMock,
        });
      });
      
      expect(result.current.isActive).toBe(true);
      expect(result.current.activeContent).toBe(firstContent);
      
      // Show second canvas (should replace the first)
      const secondContent = <div>Second content</div>;
      act(() => {
        result.current.showCanvas({ 
          content: secondContent,
          onClose: secondOnCloseMock,
        });
      });
      
      // First onClose should be called when replaced
      expect(firstOnCloseMock).toHaveBeenCalled();
      
      // Second canvas should be active
      expect(result.current.isActive).toBe(true);
      expect(result.current.activeContent).toBe(secondContent);
      
      // Hide canvas
      act(() => {
        result.current.hideCanvas();
      });
      
      // Second onClose should be called
      expect(secondOnCloseMock).toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
    });
    
    it('should do nothing when hideCanvas is called with no active canvas', () => {
      const { result } = renderHook(() => useCanvas());
      
      // Should not throw
      act(() => {
        result.current.hideCanvas();
      });
      
      expect(result.current.isActive).toBe(false);
    });
    
    it('should do nothing when updateCanvas is called with no active canvas', () => {
      const { result } = renderHook(() => useCanvas());
      
      // Should not throw
      act(() => {
        result.current.updateCanvas({ content: <div>New content</div> });
      });
      
      expect(result.current.isActive).toBe(false);
    });
  });
}); 