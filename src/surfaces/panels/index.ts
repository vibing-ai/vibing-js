import { ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import { adaptPanelToBlockKit, isBlockKitAvailable } from './block-kit-adapter';

/**
 * Panel state types
 */
export enum PanelState {
  LOADING = 'loading',
  ERROR = 'error',
  EMPTY = 'empty',
  DATA = 'data'
}

/**
 * Configuration for a context panel
 */
export interface PanelConfig {
  /**
   * Main content of the panel
   */
  content: ReactNode;
  
  /**
   * Panel title
   */
  title?: string;
  
  /**
   * Action buttons or links to display in the panel header
   */
  actions?: ReactNode;
  
  /**
   * Footer content
   */
  footer?: ReactNode;
  
  /**
   * Panel width (number in pixels or CSS width value)
   */
  width?: number | string;
  
  /**
   * Additional metadata for the panel
   */
  metadata?: Record<string, any>;
  
  /**
   * Current panel state
   */
  state?: PanelState;
  
  /**
   * Loading state content
   */
  loadingContent?: ReactNode;
  
  /**
   * Error state content
   */
  errorContent?: ReactNode;
  
  /**
   * Empty state content
   */
  emptyContent?: ReactNode;
  
  /**
   * Panel tabs configuration
   */
  tabs?: PanelTab[];
  
  /**
   * Collapsible sections configuration
   */
  sections?: PanelSection[];
  
  /**
   * Scrollable areas configuration
   */
  scrollableAreas?: PanelScrollableArea[];
  
  /**
   * Custom CSS classes to apply
   */
  className?: string;
  
  /**
   * Accessibility properties
   */
  accessibility?: {
    ariaLabel?: string;
    ariaDescribedBy?: string;
    role?: string;
  };
}

/**
 * Panel tab configuration
 */
export interface PanelTab {
  /**
   * Tab ID
   */
  id: string;
  
  /**
   * Tab label
   */
  label: string;
  
  /**
   * Tab content
   */
  content: ReactNode;
  
  /**
   * Tab icon
   */
  icon?: string;
  
  /**
   * Is tab disabled
   */
  disabled?: boolean;
}

/**
 * Panel section configuration
 */
export interface PanelSection {
  /**
   * Section ID
   */
  id: string;
  
  /**
   * Section title
   */
  title: string;
  
  /**
   * Section content
   */
  content: ReactNode;
  
  /**
   * Initially collapsed
   */
  initiallyCollapsed?: boolean;
  
  /**
   * Section icon
   */
  icon?: string;
}

/**
 * Panel scrollable area configuration
 */
export interface PanelScrollableArea {
  /**
   * Area ID
   */
  id: string;
  
  /**
   * Area content
   */
  content: ReactNode;
  
  /**
   * Fixed header content
   */
  header?: ReactNode;
  
  /**
   * Fixed footer content
   */
  footer?: ReactNode;
  
  /**
   * Maximum height
   */
  maxHeight?: number | string;
  
  /**
   * Custom styles
   */
  style?: React.CSSProperties;
}

/**
 * Result of creating a context panel
 */
export interface ContextPanel {
  /**
   * Unique ID for the panel
   */
  id: string;
  
  /**
   * Configuration used to create the panel
   */
  config: PanelConfig;
  
  /**
   * Function to update the panel content
   */
  update: (newConfig: Partial<PanelConfig>) => void;
  
  /**
   * Function to remove the panel
   */
  remove: () => void;
  
  /**
   * Function to show the panel (if previously hidden)
   */
  show: () => void;
  
  /**
   * Function to hide the panel without removing it
   */
  hide: () => void;
  
  /**
   * Function to set the panel state
   */
  setState: (state: PanelState, stateContent?: ReactNode) => void;
  
  /**
   * Function to set the active tab
   */
  setActiveTab: (tabId: string) => void;
  
  /**
   * Function to add panel listeners
   */
  addListener: (event: PanelEvent, callback: PanelEventCallback) => () => void;
  
  /**
   * Reference to the DOM element
   */
  domRef: React.RefObject<HTMLElement>;
  
  /**
   * Function to resize the panel
   */
  resize: (width: number | string) => void;
}

/**
 * Panel event types
 */
export type PanelEvent = 'mount' | 'update' | 'close' | 'resize' | 'tabChange' | 'stateChange';

/**
 * Panel event callback type
 */
export type PanelEventCallback = (data?: any) => void;

/**
 * Creates a context panel to display additional information
 * 
 * @param config Panel configuration or content as ReactNode
 * @returns Panel object with management functions
 * 
 * @example
 * ```tsx
 * // Simple content
 * const panel = createContextPanel(<div>Additional context</div>);
 * 
 * // With full configuration
 * const panel = createContextPanel({
 *   title: 'User Profile',
 *   content: <UserProfileContent userId="123" />,
 *   actions: <button onClick={editProfile}>Edit</button>,
 *   footer: <small>Last updated: Today</small>,
 *   width: 320
 * });
 * 
 * // With tabs
 * const panel = createContextPanel({
 *   title: 'User Information',
 *   tabs: [
 *     { id: 'profile', label: 'Profile', content: <ProfileTab /> },
 *     { id: 'activity', label: 'Activity', content: <ActivityTab /> },
 *     { id: 'settings', label: 'Settings', content: <SettingsTab /> }
 *   ]
 * });
 * 
 * // With different states
 * const panel = createContextPanel({
 *   title: 'Data Analysis',
 *   state: PanelState.LOADING,
 *   loadingContent: <LoadingSpinner />,
 *   content: <AnalysisResults />
 * });
 * panel.addListener('mount', () => {
 *   fetchData().then(data => {
 *     panel.setState(PanelState.DATA);
 *     panel.update({ content: <AnalysisResults data={data} /> });
 *   }).catch(err => {
 *     panel.setState(PanelState.ERROR, <ErrorMessage error={err} />);
 *   });
 * });
 * 
 * // Update the panel later
 * panel.update({
 *   content: <div>Updated content</div>
 * });
 * 
 * // Hide/show the panel
 * panel.hide();
 * panel.show();
 * 
 * // Remove the panel
 * panel.remove();
 * ```
 */
export function createContextPanel(
  config: PanelConfig | ReactNode
): ContextPanel {
  // Normalize the config
  const normalizedConfig: PanelConfig = 
    typeof config === 'object' && 'content' in config
      ? config
      : { content: config };
  
  // Default width if not provided
  if (!normalizedConfig.width) {
    normalizedConfig.width = 300; // Default width in pixels
  }
  
  // Generate a unique ID for the panel
  const id = `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Try to use Block Kit if available
  const useBlockKit = isBlockKitAvailable();
  const domRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTabState] = useState<string | null>(
    normalizedConfig.tabs && normalizedConfig.tabs.length > 0 
      ? normalizedConfig.tabs[0].id 
      : null
  );
  const [currentState, setCurrentState] = useState<PanelState>(
    normalizedConfig.state || PanelState.DATA
  );
  const listeners = useRef<Record<PanelEvent, PanelEventCallback[]>>({
    mount: [],
    update: [],
    close: [],
    resize: [],
    tabChange: [],
    stateChange: []
  });
  
  // Emit an event to listeners
  const emitEvent = useCallback((event: PanelEvent, data?: any) => {
    listeners.current[event]?.forEach(callback => callback(data));
  }, []);
  
  if (useBlockKit) {
    // Adapt the panel config to Block Kit format
    const blockKitPanel = adaptPanelToBlockKit(normalizedConfig);
    console.log(`[Context Panel ${id}] Created with Block Kit:`, blockKitPanel);
  } else {
    // Fallback to simplified implementation
    console.log(`[Context Panel ${id}] Created (Block Kit not available):`, normalizedConfig);
  }
  
  // Fire mount event when component is created
  useEffect(() => {
    emitEvent('mount');
    return () => {
      emitEvent('close');
    };
  }, [emitEvent]);
  
  // Update function with Block Kit support
  const update = useCallback((newConfig: Partial<PanelConfig>) => {
    const updatedConfig = { ...normalizedConfig, ...newConfig };
    
    if (useBlockKit) {
      const blockKitPanel = adaptPanelToBlockKit(updatedConfig);
      console.log(`[Context Panel ${id}] Updated with Block Kit:`, blockKitPanel);
    } else {
      console.log(`[Context Panel ${id}] Updated:`, newConfig);
    }
    
    // In production: Update the panel in the UI
    emitEvent('update', updatedConfig);
  }, [normalizedConfig, useBlockKit, id, emitEvent]);
  
  const remove = useCallback(() => {
    console.log(`[Context Panel ${id}] Removed`);
    // In production: Remove the panel from the UI
    emitEvent('close');
  }, [id, emitEvent]);
  
  const show = useCallback(() => {
    console.log(`[Context Panel ${id}] Shown`);
    // In production: Show the panel in the UI
  }, [id]);
  
  const hide = useCallback(() => {
    console.log(`[Context Panel ${id}] Hidden`);
    // In production: Hide the panel in the UI
  }, [id]);
  
  // Set the panel state
  const setState = useCallback((state: PanelState, stateContent?: ReactNode) => {
    setCurrentState(state);
    
    // Update content based on state if provided
    if (stateContent !== undefined) {
      if (state === PanelState.LOADING) {
        update({ loadingContent: stateContent });
      } else if (state === PanelState.ERROR) {
        update({ errorContent: stateContent });
      } else if (state === PanelState.EMPTY) {
        update({ emptyContent: stateContent });
      } else {
        update({ content: stateContent });
      }
    }
    
    emitEvent('stateChange', { state, previousState: currentState });
  }, [currentState, update, emitEvent]);
  
  // Set the active tab
  const setActiveTab = useCallback((tabId: string) => {
    const tabs = normalizedConfig.tabs || [];
    const tab = tabs.find(t => t.id === tabId);
    
    if (tab && !tab.disabled) {
      setActiveTabState(tabId);
      emitEvent('tabChange', { tabId, previousTabId: activeTab });
    }
  }, [normalizedConfig.tabs, activeTab, emitEvent]);
  
  // Add event listener
  const addListener = useCallback((event: PanelEvent, callback: PanelEventCallback) => {
    listeners.current[event] = [...(listeners.current[event] || []), callback];
    
    // Return function to remove the listener
    return () => {
      listeners.current[event] = listeners.current[event].filter(cb => cb !== callback);
    };
  }, []);
  
  // Resize the panel
  const resize = useCallback((width: number | string) => {
    update({ width });
    emitEvent('resize', { width });
  }, [update, emitEvent]);
  
  return {
    id,
    config: normalizedConfig,
    update,
    remove,
    show,
    hide,
    setState,
    setActiveTab,
    addListener,
    domRef,
    resize
  };
}

// Future enhancements for Stage 2:
// - Full integration with @vibing-ai/block-kit
// - Panel state management (loading, error, empty, data)
// - Panel lifecycle hooks
// - Content organization features (tabs, collapsible sections)
// - Responsive layout support 