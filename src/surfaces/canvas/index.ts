import { ReactNode, useState, useEffect, useCallback, useRef } from 'react';

/**
 * Types of blocks supported by Canvas
 */
export enum BlockType {
  TEXT = 'text',
  MEDIA = 'media',
  DATA = 'data',
  CODE = 'code',
  INTERACTIVE = 'interactive',
  AI_GENERATED = 'ai-generated'
}

/**
 * View modes for Canvas
 */
export enum ViewMode {
  DOCUMENT = 'document',
  BOARD = 'board',
  MIND_MAP = 'mind-map',
  TIMELINE = 'timeline'
}

/**
 * Configuration for a Canvas block
 */
export interface BlockConfig {
  /**
   * Unique type identifier for the block
   */
  type: string;
  
  /**
   * Display title for the block
   */
  title: string;
  
  /**
   * Icon to display with the block
   */
  icon?: string;
  
  /**
   * Default content for a new block
   */
  defaultContent?: any;
  
  /**
   * Validation function for block content
   */
  validate?: (content: any) => boolean | string;
  
  /**
   * Render component for view mode
   */
  render: (props: BlockRenderProps) => ReactNode;
  
  /**
   * Edit component for edit mode
   */
  edit: (props: BlockEditProps) => ReactNode;
  
  /**
   * Custom connectors for MindMap view
   */
  connectors?: BlockConnectorConfig;
  
  /**
   * Custom actions for the block
   */
  actions?: BlockActionConfig[];
  
  /**
   * Optional categorization for block types
   */
  category?: string;
}

/**
 * Configuration for block connectors in MindMap view
 */
export interface BlockConnectorConfig {
  /**
   * Available connector points
   */
  points: {
    id: string;
    position: 'top' | 'right' | 'bottom' | 'left' | { x: number, y: number };
    label?: string;
  }[];
  
  /**
   * Custom rendering for connectors
   */
  render?: (from: string, to: string, points: any) => ReactNode;
}

/**
 * Configuration for custom block actions
 */
export interface BlockActionConfig {
  /**
   * Action identifier
   */
  id: string;
  
  /**
   * Display label
   */
  label: string;
  
  /**
   * Action icon
   */
  icon?: string;
  
  /**
   * Handler function
   */
  handler: (block: Block) => void;
}

/**
 * Props passed to a block's render component
 */
export interface BlockRenderProps {
  /**
   * Block content to render
   */
  content: any;
  
  /**
   * Block ID
   */
  id: string;
  
  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Props passed to a block's edit component
 */
export interface BlockEditProps extends BlockRenderProps {
  /**
   * Function to update block content
   */
  onChange: (newContent: any) => void;
  
  /**
   * Function to save changes and exit edit mode
   */
  onSave: () => void;
  
  /**
   * Function to cancel editing without saving
   */
  onCancel: () => void;
}

/**
 * A block instance in the Canvas
 */
export interface Block {
  /**
   * Unique ID of the block
   */
  id: string;
  
  /**
   * Block type
   */
  type: string;
  
  /**
   * Block content
   */
  content: any;
  
  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
  
  /**
   * Position in board view
   */
  position?: { x: number; y: number };
  
  /**
   * Connected blocks (for mind map view)
   */
  connections?: { from: string; to: string }[];
  
  /**
   * Timeline date (for timeline view)
   */
  date?: Date;
}

/**
 * Extended Canvas hook return type
 */
export interface CanvasHookResult {
  blocks: Block[];
  selection: string[];
  viewMode: ViewMode;
  createBlock: (blockType: string, content?: any, metadata?: Record<string, any>, position?: { x: number; y: number }) => string;
  updateBlock: (id: string, content: any, metadata?: Record<string, any>) => void;
  deleteBlock: (id: string) => void;
  getBlock: (id: string) => Block | undefined;
  setSelection: (ids: string[]) => void;
  onSelectionChange: (callback: (ids: string[]) => void) => () => void;
  setViewMode: (mode: ViewMode) => void;
  connectBlocks: (fromId: string, toId: string) => void;
  disconnectBlocks: (fromId: string, toId: string) => void;
  moveBlock: (id: string, position: { x: number; y: number }) => void;
  setBlockDate: (id: string, date: Date) => void;
  duplicateBlock: (id: string) => string | undefined;
  focusBlock: (id: string) => void;
}

/**
 * Hook for interacting with the Canvas
 * 
 * @returns Canvas management functions
 * 
 * @example
 * ```tsx
 * const { 
 *   blocks,
 *   createBlock,
 *   updateBlock,
 *   deleteBlock,
 *   selection,
 *   setSelection,
 *   viewMode,
 *   setViewMode
 * } = useCanvas();
 * 
 * // Create a new text block
 * const newBlockId = createBlock('text', 'Hello world');
 * 
 * // Update the block content
 * updateBlock(newBlockId, 'Updated content');
 * 
 * // Select the block
 * setSelection([newBlockId]);
 * 
 * // Switch to board view
 * setViewMode(ViewMode.BOARD);
 * ```
 */
export function useCanvas(): CanvasHookResult {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selection, setSelection] = useState<string[]>([]);
  const [selectionListeners, setSelectionListeners] = useState<((ids: string[]) => void)[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DOCUMENT);
  const focusRef = useRef<HTMLElement | null>(null);
  
  // Create a new block
  const createBlock = useCallback((
    blockType: string, 
    content?: any, 
    metadata?: Record<string, any>,
    position?: { x: number; y: number }
  ): string => {
    const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBlock: Block = {
      id,
      type: blockType,
      content: content || {},
      metadata,
      position
    };
    
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    return id;
  }, []);
  
  // Update an existing block
  const updateBlock = useCallback((id: string, content: any, metadata?: Record<string, any>) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id 
          ? { ...block, content, ...(metadata ? { metadata } : {}) } 
          : block
      )
    );
  }, []);
  
  // Delete a block
  const deleteBlock = useCallback((id: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
    
    // Update selection if deleted block was selected
    setSelection(prev => prev.filter(selectedId => selectedId !== id));
  }, []);
  
  // Get a block by ID
  const getBlock = useCallback((id: string) => {
    return blocks.find(block => block.id === id);
  }, [blocks]);
  
  // Subscribe to selection changes
  const onSelectionChange = useCallback((callback: (ids: string[]) => void) => {
    setSelectionListeners(prev => [...prev, callback]);
    
    // Return unsubscribe function
    return () => {
      setSelectionListeners(prev => prev.filter(listener => listener !== callback));
    };
  }, []);
  
  // Connect two blocks (for mind map view)
  const connectBlocks = useCallback((fromId: string, toId: string) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => {
        if (block.id === fromId) {
          const connections = block.connections || [];
          if (!connections.some(conn => conn.from === fromId && conn.to === toId)) {
            return {
              ...block,
              connections: [...connections, { from: fromId, to: toId }]
            };
          }
        }
        return block;
      })
    );
  }, []);
  
  // Disconnect two blocks
  const disconnectBlocks = useCallback((fromId: string, toId: string) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => {
        if (block.id === fromId && block.connections) {
          return {
            ...block,
            connections: block.connections.filter(
              conn => !(conn.from === fromId && conn.to === toId)
            )
          };
        }
        return block;
      })
    );
  }, []);
  
  // Move a block (for board view)
  const moveBlock = useCallback((id: string, position: { x: number; y: number }) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id ? { ...block, position } : block
      )
    );
  }, []);
  
  // Set block date (for timeline view)
  const setBlockDate = useCallback((id: string, date: Date) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id ? { ...block, date } : block
      )
    );
  }, []);
  
  // Duplicate a block
  const duplicateBlock = useCallback((id: string) => {
    const block = getBlock(id);
    if (!block) return undefined;
    
    return createBlock(
      block.type, 
      JSON.parse(JSON.stringify(block.content)), 
      block.metadata ? JSON.parse(JSON.stringify(block.metadata)) : undefined,
      block.position ? { ...block.position, x: block.position.x + 20, y: block.position.y + 20 } : undefined
    );
  }, [getBlock, createBlock]);
  
  // Focus a block
  const focusBlock = useCallback((id: string) => {
    // In production, this would scroll to and focus the block
    setSelection([id]);
    console.log(`Focusing block ${id}`);
  }, []);
  
  // Notify selection listeners when selection changes
  useEffect(() => {
    selectionListeners.forEach(listener => listener(selection));
  }, [selection, selectionListeners]);
  
  return {
    blocks,
    selection,
    viewMode,
    createBlock,
    updateBlock,
    deleteBlock,
    getBlock,
    setSelection,
    onSelectionChange,
    setViewMode,
    connectBlocks,
    disconnectBlocks,
    moveBlock,
    setBlockDate,
    duplicateBlock,
    focusBlock
  };
}

/**
 * Creates a block definition for use with Canvas
 * 
 * @param config Block configuration
 * @returns Block definition
 * 
 * @example
 * ```tsx
 * const TextBlock = createBlock({
 *   type: 'text',
 *   title: 'Text Block',
 *   icon: 'text',
 *   defaultContent: '',
 *   render: ({ content }) => <div>{content}</div>,
 *   edit: ({ content, onChange, onSave }) => (
 *     <>
 *       <textarea 
 *         value={content} 
 *         onChange={e => onChange(e.target.value)} 
 *       />
 *       <button onClick={onSave}>Save</button>
 *     </>
 *   )
 * });
 * ```
 */
export function createBlock(config: BlockConfig): BlockConfig {
  // Validate the config
  if (!config.type) {
    throw new Error('Block type is required');
  }
  
  if (!config.title) {
    throw new Error('Block title is required');
  }
  
  if (!config.render || typeof config.render !== 'function') {
    throw new Error('Block render function is required');
  }
  
  if (!config.edit || typeof config.edit !== 'function') {
    throw new Error('Block edit function is required');
  }
  
  return config;
}

// Future enhancements for Stage 2:
// - Integration with actual Canvas framework
// - Support for block relationships
// - Block grouping and nesting
// - Undo/redo capabilities
// - Real-time collaboration
// - Advanced selection and focus management 