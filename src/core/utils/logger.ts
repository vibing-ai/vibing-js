/**
 * Logger utility to standardize logging across the codebase
 * Helps reduce direct console usage and enables conditional logging
 */

interface LoggerOptions {
  /** Whether to display timestamps with logs */
  showTimestamp?: boolean;
  /** Prefix to add to all log messages */
  prefix?: string;
}

/** Default logger configuration */
const defaultOptions: LoggerOptions = {
  showTimestamp: true,
  prefix: '[Vibing SDK]',
};

/**
 * Determines if the code is running in a development environment
 */
const isDevelopment = (): boolean => {
  try {
    // Check for Node.js environment variable
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
      return process.env.NODE_ENV === 'development';
    }

    // For browser environments without explicit NODE_ENV
    return process.env.NODE_ENV !== 'production';
  } catch (error) {
    // If we can't determine the environment, default to false for safety
    return false;
  }
};

/** Formats a log message with optional timestamp and prefix */
const formatMessage = (message: string, options: LoggerOptions = defaultOptions): string => {
  const parts: string[] = [];

  if (options.prefix) {
    parts.push(options.prefix);
  }

  if (options.showTimestamp) {
    parts.push(`[${new Date().toISOString()}]`);
  }

  parts.push(message);

  return parts.join(' ');
};

/** Logger utility for consistent logging across the codebase */
export const logger = {
  /**
   * Log an informational message
   * Only displays in development environments
   */
  log: (message: string, ...args: unknown[]): void => {
    if (isDevelopment()) {
      console.log(formatMessage(message, defaultOptions), ...args);
    }
  },

  /**
   * Log a warning message
   * Displays in all environments
   */
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(formatMessage(message, defaultOptions), ...args);
  },

  /**
   * Log an error message
   * Displays in all environments
   */
  error: (message: string, ...args: unknown[]): void => {
    console.error(formatMessage(message, defaultOptions), ...args);
  },

  /**
   * Log debug information
   * Only displays in development environments
   */
  debug: (message: string, ...args: unknown[]): void => {
    if (isDevelopment()) {
      console.debug(formatMessage(message, defaultOptions), ...args);
    }
  },

  /**
   * Create a custom logger instance with specific options
   */
  createLogger: (customOptions: LoggerOptions = {}) => {
    const options = { ...defaultOptions, ...customOptions };

    return {
      log: (message: string, ...args: unknown[]): void => {
        if (isDevelopment()) {
          console.log(formatMessage(message, options), ...args);
        }
      },

      warn: (message: string, ...args: unknown[]): void => {
        console.warn(formatMessage(message, options), ...args);
      },

      error: (message: string, ...args: unknown[]): void => {
        console.error(formatMessage(message, options), ...args);
      },

      debug: (message: string, ...args: unknown[]): void => {
        if (isDevelopment()) {
          console.debug(formatMessage(message, options), ...args);
        }
      },
    };
  },
};
