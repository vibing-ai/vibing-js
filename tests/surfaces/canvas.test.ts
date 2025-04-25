import { renderHook, act } from '@testing-library/react-hooks';
import { useCanvas, createBlock, BlockConfig } from '../../src/surfaces/canvas';

describe('Canvas Surface', () => {
  describe('useCanvas hook', () => {
    it('should initialize with empty blocks and selection', () => {
      const { result } = renderHook(() => useCanvas());
      
      expect(result.current.blocks).toEqual([]);
      expect(result.current.selection).toEqual([]);
    });
    
    it('should create a block correctly', () => {
      const { result } = renderHook(() => useCanvas());
      
      let blockId: string;
      act(() => {
        blockId = result.current.createBlock('test', 'Test content');
      });
      
      expect(result.current.blocks.length).toBe(1);
      expect(result.current.blocks[0].type).toBe('test');
      expect(result.current.blocks[0].content).toBe('Test content');
      expect(result.current.blocks[0].id).toBe(blockId);
    });
    
    it('should update a block correctly', () => {
      const { result } = renderHook(() => useCanvas());
      
      let blockId: string;
      act(() => {
        blockId = result.current.createBlock('test', 'Initial content');
      });
      
      act(() => {
        result.current.updateBlock(blockId, 'Updated content');
      });
      
      expect(result.current.blocks[0].content).toBe('Updated content');
    });
    
    it('should delete a block correctly', () => {
      const { result } = renderHook(() => useCanvas());
      
      let blockId: string;
      act(() => {
        blockId = result.current.createBlock('test', 'Test content');
      });
      
      expect(result.current.blocks.length).toBe(1);
      
      act(() => {
        result.current.deleteBlock(blockId);
      });
      
      expect(result.current.blocks.length).toBe(0);
    });
    
    it('should get a block by id', () => {
      const { result } = renderHook(() => useCanvas());
      
      let blockId: string;
      act(() => {
        blockId = result.current.createBlock('test', 'Test content');
      });
      
      const block = result.current.getBlock(blockId);
      expect(block).toBeDefined();
      expect(block?.id).toBe(blockId);
      expect(block?.content).toBe('Test content');
    });
    
    it('should manage selection correctly', () => {
      const { result } = renderHook(() => useCanvas());
      
      let blockId1: string, blockId2: string;
      act(() => {
        blockId1 = result.current.createBlock('test', 'Block 1');
        blockId2 = result.current.createBlock('test', 'Block 2');
      });
      
      act(() => {
        result.current.setSelection([blockId1, blockId2]);
      });
      
      expect(result.current.selection).toEqual([blockId1, blockId2]);
      
      act(() => {
        result.current.setSelection([blockId1]);
      });
      
      expect(result.current.selection).toEqual([blockId1]);
    });
    
    it('should remove block from selection when deleted', () => {
      const { result } = renderHook(() => useCanvas());
      
      let blockId1: string, blockId2: string;
      act(() => {
        blockId1 = result.current.createBlock('test', 'Block 1');
        blockId2 = result.current.createBlock('test', 'Block 2');
        result.current.setSelection([blockId1, blockId2]);
      });
      
      act(() => {
        result.current.deleteBlock(blockId1);
      });
      
      expect(result.current.selection).toEqual([blockId2]);
    });
    
    it('should notify selection listeners when selection changes', () => {
      const { result } = renderHook(() => useCanvas());
      const mockListener = jest.fn();
      
      let unsubscribe: () => void;
      act(() => {
        unsubscribe = result.current.onSelectionChange(mockListener);
      });
      
      act(() => {
        result.current.setSelection(['block-1']);
      });
      
      expect(mockListener).toHaveBeenCalledWith(['block-1']);
      
      act(() => {
        unsubscribe();
        result.current.setSelection(['block-2']);
      });
      
      // Should not be called again after unsubscribe
      expect(mockListener).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('createBlock function', () => {
    it('should create a block definition with valid config', () => {
      const config: BlockConfig = {
        type: 'test',
        title: 'Test Block',
        icon: 'test-icon',
        defaultContent: 'Default content',
        validate: jest.fn().mockReturnValue(true),
        render: jest.fn(),
        edit: jest.fn()
      };
      
      const blockDefinition = createBlock(config);
      expect(blockDefinition).toEqual(config);
    });
    
    it('should throw error if type is missing', () => {
      const config = {
        title: 'Test Block',
        render: jest.fn(),
        edit: jest.fn()
      } as BlockConfig;
      
      expect(() => createBlock(config)).toThrow('Block type is required');
    });
    
    it('should throw error if title is missing', () => {
      const config = {
        type: 'test',
        render: jest.fn(),
        edit: jest.fn()
      } as BlockConfig;
      
      expect(() => createBlock(config)).toThrow('Block title is required');
    });
    
    it('should throw error if render function is missing', () => {
      const config = {
        type: 'test',
        title: 'Test Block',
        edit: jest.fn()
      } as BlockConfig;
      
      expect(() => createBlock(config)).toThrow('Block render function is required');
    });
    
    it('should throw error if edit function is missing', () => {
      const config = {
        type: 'test',
        title: 'Test Block',
        render: jest.fn()
      } as BlockConfig;
      
      expect(() => createBlock(config)).toThrow('Block edit function is required');
    });
  });
}); 