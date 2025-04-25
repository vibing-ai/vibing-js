import React, { useState, useCallback, /* useEffect, */ useRef, ReactNode } from 'react';
import { logger } from '../../core/utils/logger';

/**
 * Types of blocks supported by Canvas
 */
export enum BlockType {
  TEXT = 'text',
  MEDIA = 'media',
  DATA = 'data',
  CODE = 'code',
  INTERACTIVE = 'interactive',
  AI_GENERATED = 'ai-generated',
}

/**
 * View modes for Canvas
 */
export enum ViewMode {
  DOCUMENT = 'document',
  BOARD = 'board',
  MIND_MAP = 'mind-map',
  TIMELINE = 'timeline',
}

/**
 * Configuration for Canvas surface
 */
export interface CanvasConfig {
  content: React.ReactNode;
  fullScreen?: boolean;
  overlay?: boolean;
  width?: number;
  height?: number;
  background?: string;
  metadata?: Record<string, unknown>;
  onClose?: () => void;
}

/**
 * Canvas hook return type for the surface
 */
export interface CanvasSurfaceHookResult {
  isActive: boolean;
  activeContent: React.ReactNode | null;
  config: CanvasConfig | null;
  showCanvas: (config: CanvasConfig) => void;
  hideCanvas: () => void;
  updateCanvas: (config: Partial<CanvasConfig>) => void;
}

/**
 * Hook for managing canvas surface
 *
 * @returns Canvas surface management functions
 */
export const useCanvas = (): CanvasSurfaceHookResult => {
  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<CanvasConfig | null>(null);

  const showCanvas = useCallback(
    (newConfig: CanvasConfig) => {
      // If there's an existing canvas with onClose handler, call it
      if (isActive && config?.onClose) {
        config.onClose();
      }

      logger.log('[Canvas] Opened:', newConfig);
      setConfig(newConfig);
      setIsActive(true);
    },
    [isActive, config]
  );

  const hideCanvas = useCallback(() => {
    if (!isActive) return;

    logger.log('[Canvas] Closed');

    if (config?.onClose) {
      config.onClose();
    }

    setIsActive(false);
    setConfig(null);
  }, [isActive, config]);

  const updateCanvas = useCallback(
    (newConfig: Partial<CanvasConfig>) => {
      if (!isActive || !config) return;

      const updatedConfig = { ...config, ...newConfig };
      logger.log('[Canvas] Updated:', updatedConfig);

      setConfig(updatedConfig);
    },
    [isActive, config]
  );

  return {
    isActive,
    activeContent: config?.content || null,
    config: config,
    showCanvas,
    hideCanvas,
    updateCanvas,
  };
};

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
  defaultContent?: unknown;

  /**
   * Validation function for block content
   */
  validate?: (content: unknown) => boolean | string;

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
    position: 'top' | 'right' | 'bottom' | 'left' | { x: number; y: number };
    label?: string;
  }[];

  /**
   * Custom rendering for connectors
   */
  render?: (from: string, to: string, points: unknown) => ReactNode;
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
  content: unknown;

  /**
   * Block ID
   */
  id: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Props passed to a block's edit component
 */
export interface BlockEditProps extends BlockRenderProps {
  /**
   * Function to update block content
   */
  onChange: (newContent: unknown) => void;

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
  content: unknown;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;

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
 * Canvas hook result for managing blocks
 */
export interface CanvasHookResult {
  blocks: Block[];
  selection: string[];
  viewMode: ViewMode;
  createBlock: (
    blockType: string,
    content?: unknown,
    metadata?: Record<string, unknown>,
    position?: { x: number; y: number }
  ) => string;
  updateBlock: (id: string, content: unknown, metadata?: Record<string, unknown>) => void;
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
export function useExtendedCanvas(): CanvasHookResult {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selection, setSelectionState] = useState<string[]>([]);
  const [viewMode, setViewModeState] = useState<ViewMode>(ViewMode.DOCUMENT);
  const selectionCallbacks = useRef<((ids: string[]) => void)[]>([]);

  const createBlock = useCallback(
    (
      blockType: string,
      content?: unknown,
      metadata?: Record<string, unknown>,
      position?: { x: number; y: number }
    ): string => {
      const id = `block-${Math.random().toString(36).substring(2, 9)}`;
      const newBlock: Block = {
        id,
        type: blockType,
        content: content || null,
        metadata: metadata || {},
        position,
      };

      setBlocks(prevBlocks => [...prevBlocks, newBlock]);
      return id;
    },
    []
  );

  const updateBlock = useCallback((id: string, content: unknown, metadata?: Record<string, unknown>) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === id) {
          return {
            ...block,
            content,
            metadata: metadata ? { ...block.metadata, ...metadata } : block.metadata,
          };
        }
        return block;
      })
    );
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
    setSelectionState(prevSelection => prevSelection.filter(selectedId => selectedId !== id));
  }, []);

  const getBlock = useCallback(
    (id: string) => {
      return blocks.find(block => block.id === id);
    },
    [blocks]
  );

  const setSelection = useCallback((ids: string[]) => {
    setSelectionState(ids);
    // Notify all registered callbacks
    selectionCallbacks.current.forEach(callback => callback(ids));
  }, []);

  const onSelectionChange = useCallback((callback: (ids: string[]) => void) => {
    selectionCallbacks.current.push(callback);
    return () => {
      selectionCallbacks.current = selectionCallbacks.current.filter(cb => cb !== callback);
    };
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
  }, []);

  const connectBlocks = useCallback((fromId: string, toId: string) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === fromId) {
          const connections = block.connections || [];
          // Check if connection already exists
          if (!connections.some(conn => conn.from === fromId && conn.to === toId)) {
            return {
              ...block,
              connections: [...connections, { from: fromId, to: toId }],
            };
          }
        }
        return block;
      })
    );
  }, []);

  const disconnectBlocks = useCallback((fromId: string, toId: string) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === fromId && block.connections) {
          return {
            ...block,
            connections: block.connections.filter(
              conn => !(conn.from === fromId && conn.to === toId)
            ),
          };
        }
        return block;
      })
    );
  }, []);

  const moveBlock = useCallback((id: string, position: { x: number; y: number }) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === id) {
          return { ...block, position };
        }
        return block;
      })
    );
  }, []);

  const setBlockDate = useCallback((id: string, date: Date) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === id) {
          return { ...block, date };
        }
        return block;
      })
    );
  }, []);

  const duplicateBlock = useCallback(
    (id: string) => {
      const block = getBlock(id);
      if (!block) return undefined;

      // Create a shallow copy with a new ID
      const newPosition = block.position
        ? { x: block.position.x + 20, y: block.position.y + 20 }
        : undefined;

      return createBlock(block.type, block.content, block.metadata, newPosition);
    },
    [getBlock, createBlock]
  );

  const focusBlock = useCallback((id: string) => {
    // This is a stub - the actual implementation would depend on the UI
    logger.log(`Focusing block ${id}`);
  }, []);

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
    focusBlock,
  };
}

/**
 * Create a block configuration
 */
export function createBlock(config: BlockConfig): BlockConfig {
  return {
    ...config,
    validate:
      config.validate ||
      (() => {
        return true;
      }),
  };
}

/**
 * Create a canvas instance
 */
export const createCanvas = (config?: CanvasConfig) => {
  const canvasId = Math.random().toString(36).substring(2, 9);

  return {
    id: canvasId,
    config: config || {},

    /**
     * Open the canvas
     * This is a placeholder for future implementation
     */
    open: () => {
      // TODO: Implement canvas opening logic in the future
      logger.log(`Opening canvas ${canvasId}`);
    },

    /**
     * Close the canvas
     * This is a placeholder for future implementation
     */
    close: () => {
      // TODO: Implement canvas closing logic in the future
      logger.log(`Closing canvas ${canvasId}`);
    },

    /**
     * Update canvas configuration
     * @param newConfig - New partial configuration to apply
     */
    update: (newConfig: Partial<CanvasConfig>) => {
      // TODO: Implement canvas update logic in the future
      logger.log(`Updating canvas ${canvasId} with new config`);
    },
  };
};

/**
 * Factory function to create a Canvas UI instance
 */
export function createCanvasSurface(_options = {}) {
  // Configuration and state
  const canvases: Record<string, ReturnType<typeof createCanvas>> = {};

  /**
   * Render the canvas UI to a container
   * @param container - DOM element to render the canvas into
   */
  function render(container: HTMLElement) {
    // TODO: Implement rendering logic
    logger.log('Rendering canvas surface to container', container);
  }

  // Public API
  return {
    render,
    canvases,

    /**
     * Open a canvas
     * This is a placeholder for future implementation
     */
    open: () => {
      // TODO: Implement canvas open functionality
      logger.log('Opening a canvas surface');
    },

    /**
     * Close a canvas
     * This is a placeholder for future implementation
     */
    close: () => {
      // TODO: Implement canvas close functionality
      logger.log('Closing a canvas surface');
    },

    /**
     * Update a canvas
     * This is a placeholder for future implementation
     */
    update: () => {
      // TODO: Implement canvas update functionality
      logger.log('Updating a canvas surface');
    },
  };
}

// Future enhancements for Stage 2:
// - Integration with actual Canvas framework
// - Support for block relationships
// - Block grouping and nesting
// - Undo/redo capabilities
// - Real-time collaboration
// - Advanced selection and focus management
