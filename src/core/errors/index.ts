/**
 * @file Error handling system for Vibing AI SDK
 * @description Provides standardized error classes and utilities for consistent error handling
 */

/**
 * Base class for all SDK errors
 * @class SDKError
 * @extends Error
 */
export class SDKError extends Error {
  /** Unique error code */
  public readonly code: string;
  /** HTTP status code equivalent (if applicable) */
  public readonly statusCode?: number;
  /** Additional contextual data */
  public readonly context?: Record<string, unknown>;
  /** Whether the operation can be retried */
  public readonly retryable: boolean;

  /**
   * Creates a new SDK error
   * @param message Error message
   * @param options Error options
   */
  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      context?: Record<string, unknown>;
      retryable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || 'SDK_ERROR';
    this.statusCode = options.statusCode;
    this.context = options.context;
    this.retryable = options.retryable ?? false;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly for better instanceof behavior
    Object.setPrototypeOf(this, SDKError.prototype);
  }
}

/**
 * Error thrown when input validation fails
 * @class ValidationError
 * @extends SDKError
 */
export class ValidationError extends SDKError {
  /** Validation errors details */
  public readonly validationErrors: Record<string, string[]>;

  /**
   * Creates a new validation error
   * @param message Error message
   * @param validationErrors Validation errors by field
   * @param options Error options
   */
  constructor(
    message: string,
    validationErrors: Record<string, string[]> = {},
    options: {
      code?: string;
      statusCode?: number;
      context?: Record<string, unknown>;
      retryable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'VALIDATION_ERROR',
      statusCode: options.statusCode || 400,
      context: options.context,
      retryable: options.retryable || false,
      cause: options.cause,
    });
    this.validationErrors = validationErrors;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when permissions are insufficient
 * @class PermissionError
 * @extends SDKError
 */
export class PermissionError extends SDKError {
  /** The permission that was required */
  public readonly requiredPermission: string;

  /**
   * Creates a new permission error
   * @param message Error message
   * @param requiredPermission The permission that was required
   * @param options Error options
   */
  constructor(
    message: string,
    requiredPermission: string,
    options: {
      code?: string;
      statusCode?: number;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'PERMISSION_DENIED',
      statusCode: options.statusCode || 403,
      context: options.context,
      retryable: false,
      cause: options.cause,
    });
    this.requiredPermission = requiredPermission;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Error thrown for network-related issues
 * @class NetworkError
 * @extends SDKError
 */
export class NetworkError extends SDKError {
  /**
   * Creates a new network error
   * @param message Error message
   * @param options Error options
   */
  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      context?: Record<string, unknown>;
      retryable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'NETWORK_ERROR',
      statusCode: options.statusCode || 500,
      context: options.context,
      retryable: options.retryable ?? true, // Network errors are often retryable
      cause: options.cause,
    });

    // Set the prototype explicitly
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error thrown when an operation times out
 * @class TimeoutError
 * @extends SDKError
 */
export class TimeoutError extends SDKError {
  /** Operation timeout in milliseconds */
  public readonly timeoutMs: number;

  /**
   * Creates a new timeout error
   * @param message Error message
   * @param timeoutMs Timeout in milliseconds
   * @param options Error options
   */
  constructor(
    message: string,
    timeoutMs: number,
    options: {
      code?: string;
      statusCode?: number;
      context?: Record<string, unknown>;
      retryable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'TIMEOUT_ERROR',
      statusCode: options.statusCode || 408,
      context: options.context,
      retryable: options.retryable ?? true, // Timeouts are often retryable
      cause: options.cause,
    });
    this.timeoutMs = timeoutMs;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Error thrown when a requested resource is not found
 * @class NotFoundError
 * @extends SDKError
 */
export class NotFoundError extends SDKError {
  /** The resource that was not found */
  public readonly resource: string;
  /** The identifier that was used to search for the resource */
  public readonly identifier: string;

  /**
   * Creates a new not found error
   * @param message Error message
   * @param resource The resource type that was not found
   * @param identifier The identifier that was used
   * @param options Error options
   */
  constructor(
    message: string,
    resource: string,
    identifier: string,
    options: {
      code?: string;
      statusCode?: number;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'NOT_FOUND',
      statusCode: options.statusCode || 404,
      context: options.context,
      retryable: false, // Not found errors are rarely retryable
      cause: options.cause,
    });
    this.resource = resource;
    this.identifier = identifier;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown for SDK configuration issues
 * @class ConfigurationError
 * @extends SDKError
 */
export class ConfigurationError extends SDKError {
  /**
   * Creates a new configuration error
   * @param message Error message
   * @param options Error options
   */
  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'CONFIGURATION_ERROR',
      statusCode: options.statusCode || 500,
      context: options.context,
      retryable: false, // Configuration errors require fixing, not retrying
      cause: options.cause,
    });

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

// Utility Functions

/**
 * Check if an error is an SDK error
 * @param error The error to check
 * @returns true if the error is an SDK error
 */
export function isSDKError(error: unknown): error is SDKError {
  return error instanceof SDKError;
}

/**
 * Create an error of a specific type
 * @param options Error creation options
 * @returns A new SDK error instance
 */
export function createError(options: {
  type:
    | 'validation'
    | 'permission'
    | 'network'
    | 'timeout'
    | 'notFound'
    | 'configuration'
    | 'generic';
  message: string;
  code?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
  retryable?: boolean;
  cause?: Error;
  validationErrors?: Record<string, string[]>;
  requiredPermission?: string;
  resource?: string;
  identifier?: string;
  timeoutMs?: number;
}): SDKError {
  switch (options.type) {
    case 'validation':
      return new ValidationError(options.message, options.validationErrors || {}, {
        code: options.code,
        statusCode: options.statusCode,
        context: options.context,
        retryable: options.retryable,
        cause: options.cause,
      });
    case 'permission':
      if (!options.requiredPermission) {
        throw new Error('Required permission must be specified for permission errors');
      }
      return new PermissionError(options.message, options.requiredPermission, {
        code: options.code,
        statusCode: options.statusCode,
        context: options.context,
        cause: options.cause,
      });
    case 'network':
      return new NetworkError(options.message, {
        code: options.code,
        statusCode: options.statusCode,
        context: options.context,
        retryable: options.retryable,
        cause: options.cause,
      });
    case 'timeout':
      if (options.timeoutMs === undefined) {
        throw new Error('Timeout value must be specified for timeout errors');
      }
      return new TimeoutError(options.message, options.timeoutMs, {
        code: options.code,
        statusCode: options.statusCode,
        context: options.context,
        retryable: options.retryable,
        cause: options.cause,
      });
    case 'notFound':
      if (!options.resource || !options.identifier) {
        throw new Error('Resource and identifier must be specified for not found errors');
      }
      return new NotFoundError(options.message, options.resource, options.identifier, {
        code: options.code,
        statusCode: options.statusCode,
        context: options.context,
        cause: options.cause,
      });
    case 'configuration':
      return new ConfigurationError(options.message, {
        code: options.code,
        statusCode: options.statusCode,
        context: options.context,
        cause: options.cause,
      });
    case 'generic':
    default:
      return new SDKError(options.message, {
        code: options.code,
        statusCode: options.statusCode,
        context: options.context,
        retryable: options.retryable ?? false,
        cause: options.cause,
      });
  }
}

/**
 * Format an error for logging or display
 * @param error The error to format
 * @param options Formatting options
 * @returns A formatted error string
 */
export function formatError(
  error: unknown,
  options: {
    includeStack?: boolean;
    includeContext?: boolean;
  } = {}
): string {
  const { includeStack = false, includeContext = false } = options;

  if (isSDKError(error)) {
    let formatted = `[${error.code}] ${error.message}`;

    if (includeContext && error.context) {
      formatted += `\nContext: ${JSON.stringify(error.context, null, 2)}`;
    }

    if (includeStack && error.stack) {
      formatted += `\nStack: ${error.stack}`;
    }

    return formatted;
  }

  // Handle non-SDK errors
  if (error instanceof Error) {
    let formatted = error.message;

    if (includeStack && error.stack) {
      formatted += `\nStack: ${error.stack}`;
    }

    return formatted;
  }

  // For non-Error objects
  return String(error);
}

/**
 * Get the error code from an error
 * @param error The error to get the code from
 * @returns The error code or a default code
 */
export function getErrorCode(error: unknown): string {
  if (isSDKError(error)) {
    return error.code;
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Retry an operation with exponential backoff
 * @param operation The operation to retry
 * @param options Retry options
 * @returns The result of the operation
 */
export function retry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    backoffFactor?: number;
    retryableErrors?: Array<string | ((error: unknown) => boolean)>;
    onRetry?: (error: unknown, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 300,
    backoffFactor = 2,
    retryableErrors = [],
    onRetry = () => {
      /* This callback is intentionally empty; it's the default no-op implementation */
    },
  } = options;

  let attempt = 0;

  const shouldRetry = (error: unknown): boolean => {
    // Check if it's a retryable SDK error
    if (isSDKError(error) && error.retryable) {
      return true;
    }

    // Check against custom retryable errors
    for (const retryableError of retryableErrors) {
      if (typeof retryableError === 'string') {
        if (isSDKError(error) && error.code === retryableError) {
          return true;
        }
      } else if (typeof retryableError === 'function') {
        if (retryableError(error)) {
          return true;
        }
      }
    }

    return false;
  };

  const executeWithRetry = async (): Promise<T> => {
    try {
      attempt++;
      return await operation();
    } catch (error) {
      if (attempt <= maxRetries && shouldRetry(error)) {
        const delay = retryDelay * Math.pow(backoffFactor, attempt - 1);
        onRetry(error, attempt);

        // Return a new promise that resolves after delay
        return new Promise<T>(resolve => {
          setTimeout(() => {
            resolve(executeWithRetry());
          }, delay);
        });
      }

      // No more retries or not retryable, rethrow
      throw error;
    }
  };

  return executeWithRetry();
}

/**
 * Fall back to a value if an operation fails
 * @param operation The operation that might fail
 * @param fallbackValue The value to fall back to
 * @returns The result of the operation or the fallback value
 */
export function fallback<T>(
  operation: () => Promise<T>,
  fallbackValue: T | (() => Promise<T> | T)
): Promise<T> {
  return operation().catch(async _error => {
    if (typeof fallbackValue === 'function') {
      return (fallbackValue as () => Promise<T> | T)();
    }
    return fallbackValue;
  });
}

/**
 * Create an error boundary component
 * @param Component The component to wrap
 * @param fallback The fallback UI to show on error
 * @returns A new component with error handling
 */
export function errorBoundary<P = Record<string, unknown>>(
  _Component: React.ComponentType<P>,
  _fallback: React.ReactNode | ((_error: Error, reset: () => void) => React.ReactNode)
): React.ComponentType<P> {
  // Implementation would depend on React integration,
  // but this is the function signature for the pattern
  throw new Error('errorBoundary requires React integration - not implemented in core SDK');
}
