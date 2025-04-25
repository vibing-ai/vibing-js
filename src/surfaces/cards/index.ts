import { ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import { adaptCardToBlockKit, isBlockKitAvailable } from './block-kit-adapter';

/**
 * Configuration for a conversation card
 */
export interface CardConfig {
  /**
   * Main content of the card
   */
  content: ReactNode;
  
  /**
   * Action buttons or links to display in the card
   */
  actions?: ReactNode;
  
  /**
   * Additional metadata for the card
   */
  metadata?: Record<string, any>;
  
  /**
   * Custom styling for the card
   */
  style?: React.CSSProperties;
  
  /**
   * Data visualization configuration
   */
  visualization?: CardVisualization;
  
  /**
   * Form inputs configuration
   */
  form?: CardForm;
  
  /**
   * Media preview configuration
   */
  media?: CardMedia;
  
  /**
   * Expandable sections configuration
   */
  expandableSections?: CardExpandableSection[];
  
  /**
   * Accessibility options
   */
  accessibility?: {
    ariaLabel?: string;
    ariaDescribedBy?: string;
    role?: string;
    tabIndex?: number;
  };
  
  /**
   * Theme override for this specific card
   */
  theme?: 'light' | 'dark' | 'system' | Record<string, any>;
}

/**
 * Card visualization configuration
 */
export interface CardVisualization {
  /**
   * Type of visualization
   */
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'custom';
  
  /**
   * Data for the visualization
   */
  data: any;
  
  /**
   * Configuration options specific to visualization type
   */
  options?: Record<string, any>;
  
  /**
   * Custom renderer for 'custom' type
   */
  renderer?: (data: any, options?: any) => ReactNode;
}

/**
 * Card form configuration
 */
export interface CardForm {
  /**
   * Form fields
   */
  fields: CardFormField[];
  
  /**
   * Form submission handler
   */
  onSubmit: (values: Record<string, any>) => void;
  
  /**
   * Form validation handler
   */
  validate?: (values: Record<string, any>) => Record<string, string>;
  
  /**
   * Initial values
   */
  initialValues?: Record<string, any>;
  
  /**
   * Submit button text
   */
  submitText?: string;
}

/**
 * Card form field configuration
 */
export interface CardFormField {
  /**
   * Field type
   */
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'custom';
  
  /**
   * Field name (used as key in data)
   */
  name: string;
  
  /**
   * Field label
   */
  label?: string;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Whether field is required
   */
  required?: boolean;
  
  /**
   * Field-specific options
   */
  options?: any;
  
  /**
   * Custom renderer for 'custom' type
   */
  renderer?: (props: any) => ReactNode;
}

/**
 * Card media configuration
 */
export interface CardMedia {
  /**
   * Type of media
   */
  type: 'image' | 'video' | 'audio' | 'custom';
  
  /**
   * URL or source for the media
   */
  source: string;
  
  /**
   * Alt text for images
   */
  alt?: string;
  
  /**
   * Media options
   */
  options?: {
    autoPlay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
    width?: number | string;
    height?: number | string;
  };
  
  /**
   * Custom renderer for 'custom' type
   */
  renderer?: (source: string, options?: any) => ReactNode;
}

/**
 * Card expandable section configuration
 */
export interface CardExpandableSection {
  /**
   * Section title
   */
  title: string;
  
  /**
   * Section content
   */
  content: ReactNode;
  
  /**
   * Whether section is initially expanded
   */
  initiallyExpanded?: boolean;
  
  /**
   * Icon to display with the title
   */
  icon?: string;
}

/**
 * Result of creating a conversation card
 */
export interface ConversationCard {
  /**
   * Unique ID for the card
   */
  id: string;
  
  /**
   * Configuration used to create the card
   */
  config: CardConfig;
  
  /**
   * Function to update the card content
   */
  update: (newConfig: Partial<CardConfig>) => void;
  
  /**
   * Function to remove the card
   */
  remove: () => void;
  
  /**
   * Function to add event handlers to the card
   */
  addEventListener: <K extends keyof HTMLElementEventMap>(
    type: K, 
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
  ) => void;
  
  /**
   * Function to remove event handlers from the card
   */
  removeEventListener: <K extends keyof HTMLElementEventMap>(
    type: K, 
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
  ) => void;
  
  /**
   * Reference to the DOM element containing the card
   */
  domRef: React.RefObject<HTMLElement>;
  
  /**
   * Function to focus the card
   */
  focus: () => void;
}

/**
 * Creates a conversation card to be displayed in the conversation
 * 
 * @param config Card configuration or content as ReactNode
 * @returns Card object with management functions
 * 
 * @example
 * ```tsx
 * // Simple content
 * const card = createConversationCard(<div>Hello World</div>);
 * 
 * // With configuration
 * const card = createConversationCard({
 *   content: <div>Card with actions</div>,
 *   actions: (
 *     <button onClick={() => console.log('Clicked!')}>
 *       Click me
 *     </button>
 *   )
 * });
 * 
 * // With data visualization
 * const card = createConversationCard({
 *   content: <h3>Monthly Sales</h3>,
 *   visualization: {
 *     type: 'bar',
 *     data: {
 *       labels: ['Jan', 'Feb', 'Mar'],
 *       datasets: [{
 *         label: 'Sales',
 *         data: [12, 19, 3]
 *       }]
 *     }
 *   }
 * });
 * 
 * // With form inputs
 * const card = createConversationCard({
 *   content: <h3>Contact Form</h3>,
 *   form: {
 *     fields: [
 *       { type: 'text', name: 'name', label: 'Name', required: true },
 *       { type: 'text', name: 'email', label: 'Email', required: true }
 *     ],
 *     onSubmit: (values) => console.log('Form submitted:', values)
 *   }
 * });
 * 
 * // Update the card later
 * card.update({
 *   content: <div>Updated content</div>
 * });
 * 
 * // Add event listeners
 * card.addEventListener('click', () => console.log('Card clicked'));
 * 
 * // Focus the card
 * card.focus();
 * 
 * // Remove the card
 * card.remove();
 * ```
 */
export function createConversationCard(
  config: CardConfig | ReactNode
): ConversationCard {
  // Normalize the config
  const normalizedConfig: CardConfig = 
    typeof config === 'object' && 'content' in config
      ? config
      : { content: config };
  
  // Generate a unique ID for the card
  const id = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Try to use Block Kit if available
  const useBlockKit = isBlockKitAvailable();
  const domRef = useRef<HTMLElement>(null);
  const eventListeners = useRef<Array<{ type: string; listener: EventListener }>>([]);
  
  if (useBlockKit) {
    // Adapt the card config to Block Kit format
    const blockKitCard = adaptCardToBlockKit(normalizedConfig);
    console.log(`[Conversation Card ${id}] Created with Block Kit:`, blockKitCard);
  } else {
    // Fallback to simplified implementation
    console.log(`[Conversation Card ${id}] Created (Block Kit not available):`, normalizedConfig);
  }
  
  // Update function with Block Kit support
  const update = useCallback((newConfig: Partial<CardConfig>) => {
    const updatedConfig = { ...normalizedConfig, ...newConfig };
    
    if (useBlockKit) {
      const blockKitCard = adaptCardToBlockKit(updatedConfig);
      console.log(`[Conversation Card ${id}] Updated with Block Kit:`, blockKitCard);
    } else {
      console.log(`[Conversation Card ${id}] Updated:`, newConfig);
    }
    // In production: Update the card in the UI
  }, [normalizedConfig, useBlockKit, id]);
  
  const remove = useCallback(() => {
    console.log(`[Conversation Card ${id}] Removed`);
    // In production: Remove the card from the UI
    
    // Clean up event listeners
    if (domRef.current) {
      eventListeners.current.forEach(({ type, listener }) => {
        domRef.current?.removeEventListener(type, listener);
      });
    }
  }, [id]);
  
  // Add event listener
  const addEventListener = useCallback(<K extends keyof HTMLElementEventMap>(
    type: K, 
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
  ) => {
    if (domRef.current) {
      domRef.current.addEventListener(type, listener as EventListener);
      eventListeners.current.push({ type: type as string, listener: listener as EventListener });
    }
  }, []);
  
  // Remove event listener
  const removeEventListener = useCallback(<K extends keyof HTMLElementEventMap>(
    type: K, 
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
  ) => {
    if (domRef.current) {
      domRef.current.removeEventListener(type, listener as EventListener);
      eventListeners.current = eventListeners.current.filter(
        el => !(el.type === type && el.listener === listener)
      );
    }
  }, []);
  
  // Focus the card
  const focus = useCallback(() => {
    if (domRef.current) {
      domRef.current.focus();
    }
  }, []);
  
  return {
    id,
    config: normalizedConfig,
    update,
    remove,
    addEventListener,
    removeEventListener,
    domRef,
    focus
  };
}

// Future enhancements for Stage 2:
// - Full integration with @vibing-ai/block-kit
// - Rich interactive elements support
// - Theming and styling customization
// - Accessibility improvements 