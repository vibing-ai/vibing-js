/**
 * @fileoverview Types for Block Kit integration with the Vibing AI SDK
 *
 * This file contains types that facilitate integration between the SDK and the
 * @vibing-ai/block-kit package.
 */

import { ReactNode } from 'react';

/**
 * Generic interface for Block Kit components
 */
export interface BlockKitComponent {
  /**
   * Unique identifier for the component
   */
  id?: string;

  /**
   * CSS class names to apply
   */
  className?: string;

  /**
   * Content to render inside the component
   */
  children?: ReactNode;

  /**
   * Custom inline styles
   */
  style?: React.CSSProperties;

  /**
   * Data attributes to apply to the component
   */
  data?: Record<string, string | number | boolean>;

  /**
   * Accessibility attributes
   */
  aria?: Record<string, string>;

  /**
   * Custom event handlers
   */
  events?: Record<string, (event: React.SyntheticEvent) => void>;

  /**
   * Component type
   */
  type?: string;
}

/**
 * Theme options for Block Kit
 */
export interface BlockKitTheme {
  /**
   * Theme mode
   */
  mode?: 'light' | 'dark' | 'system';

  /**
   * Primary color
   */
  primaryColor?: string;

  /**
   * Secondary color
   */
  secondaryColor?: string;

  /**
   * Background color
   */
  backgroundColor?: string;

  /**
   * Text color
   */
  textColor?: string;

  /**
   * Custom theme values
   */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Options for Block Kit integration
 */
export interface BlockKitOptions {
  /**
   * Theme to use for Block Kit components
   */
  theme?: BlockKitTheme;

  /**
   * Whether to use system theme preference
   */
  useSystemTheme?: boolean;

  /**
   * Custom theme tokens
   */
  tokens?: Record<string, string | number>;

  /**
   * Callback when theme changes
   */
  onThemeChange?: (theme: string) => void;

  /**
   * Whether to disable animations
   */
  disableAnimations?: boolean;

  /**
   * Global component overrides
   */
  componentOverrides?: Record<string, unknown>;
}

/**
 * Adapter interface for converting SDK surfaces to Block Kit
 */
export interface BlockKitAdapter {
  /**
   * Adapts an SDK surface configuration to Block Kit components
   */
  adapt?: <T, R>(config: T) => R;

  /**
   * Checks if Block Kit is available for use
   */
  isAvailable?: () => {
    available: boolean;
    reason?: string;
    version?: string;
  };

  /**
   * Gets compatible version requirements
   */
  getCompatibleVersions?: () => {
    current: string;
    required: string;
    compatible: boolean;
  };
}

/**
 * Block Kit card component props
 */
export interface BlockKitCardProps extends BlockKitComponent {
  /**
   * Title of the card
   */
  title?: ReactNode;

  /**
   * Main content of the card
   */
  content: ReactNode;

  /**
   * Action buttons or controls
   */
  actions?: ReactNode;

  /**
   * Metadata to display
   */
  metadata?: Record<string, string | number | boolean>;

  /**
   * Whether the card is interactive
   */
  interactive?: boolean;

  /**
   * Callback when card is clicked
   */
  onClick?: () => void;
}

/**
 * Block Kit panel component props
 */
export interface BlockKitPanelProps extends BlockKitComponent {
  /**
   * Title of the panel
   */
  title?: ReactNode;

  /**
   * Main content of the panel
   */
  content: ReactNode;

  /**
   * Footer content
   */
  footer?: ReactNode;

  /**
   * Width of the panel
   */
  width?: string | number;

  /**
   * Whether the panel can be collapsed
   */
  collapsible?: boolean;

  /**
   * Whether the panel is initially expanded
   */
  defaultExpanded?: boolean;

  /**
   * Callback when panel expansion state changes
   */
  onExpandChange?: (expanded: boolean) => void;
}

/**
 * Block Kit modal component props
 */
export interface BlockKitModalProps extends BlockKitComponent {
  /**
   * Title of the modal
   */
  title?: ReactNode;

  /**
   * Main content of the modal
   */
  content: ReactNode;

  /**
   * Footer actions
   */
  actions?: ReactNode;

  /**
   * Size of the modal
   */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';

  /**
   * Whether to close when clicking outside
   */
  closeOnOverlayClick?: boolean;

  /**
   * Callback when modal is closed
   */
  onClose?: () => void;

  /**
   * Whether modal can be dismissed with escape key
   */
  closeOnEsc?: boolean;

  /**
   * Initial focus element selector
   */
  initialFocus?: string;
}
