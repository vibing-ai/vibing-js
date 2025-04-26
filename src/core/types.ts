/**
 * Common type definitions shared across modules
 */

/**
 * Scope for memory and permissions
 */
export type Scope = 'global' | 'project' | 'conversation';

/**
 * Common error structure
 */
export interface VibingError {
  /**
   * Error code
   */
  code: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Optional additional details
   */
  details?: Record<string, unknown> | string | number | null;
}

/**
 * Result wrapper with loading and error states
 */
export interface Result<T> {
  /**
   * The data payload
   */
  data?: T;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Error information, if any
   */
  error: VibingError | null;
}
