/**
 * Rate limiting utilities to help prevent abuse and ensure
 * fair resource usage in applications built with the SDK.
 */

/**
 * Rate limiter options
 */
export interface RateLimiterOptions {
  /**
   * Maximum number of operations in the time window
   * @default 60
   */
  limit: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs: number;

  /**
   * Error message when rate limit is exceeded
   * @default 'Too many requests, please try again later.'
   */
  message?: string;

  /**
   * Whether to skip rate limiting in development
   * @default true
   */
  skipInDevelopment?: boolean;
}

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  /**
   * Whether the operation is allowed
   */
  allowed: boolean;

  /**
   * Current usage count
   */
  current: number;

  /**
   * Maximum allowed operations
   */
  limit: number;

  /**
   * Time remaining in current window (ms)
   */
  remaining: number;

  /**
   * Error message if not allowed
   */
  message?: string;
}

/**
 * Rate limiter interface
 */
export interface RateLimiter {
  /**
   * Check if an operation is allowed
   * @param key Identifier for the operation
   * @returns Whether the operation is allowed
   */
  check(key: string): RateLimitResult;

  /**
   * Reset the rate limit for a specific key
   * @param key Identifier to reset
   */
  reset(key: string): void;

  /**
   * Reset all rate limits
   */
  resetAll(): void;

  /**
   * Get current rate limit status
   * @param key Identifier to check
   */
  getStatus(key: string): Omit<RateLimitResult, 'allowed' | 'message'>;
}

/**
 * In-memory storage for rate limiting
 */
interface RateLimitStorage {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Creates a rate limiter for controlling how frequently operations can occur
 *
 * @param options Configuration options
 * @returns Rate limiter instance
 *
 * @example
 * ```typescript
 * // Create a rate limiter that allows 5 operations per minute
 * const rateLimiter = createRateLimiter({
 *   limit: 5,
 *   windowMs: 60000, // 1 minute
 *   message: 'Too many attempts, please wait a minute and try again.'
 * });
 *
 * // Check if an operation is allowed
 * function handleUserAction(userId: string) {
 *   const result = rateLimiter.check(`user-action:${userId}`);
 *
 *   if (result.allowed) {
 *     // Proceed with the operation
 *     performOperation();
 *   } else {
 *     // Handle rate limit exceeded
 *     showError(result.message);
 *     console.log(`Try again in ${Math.ceil(result.remaining / 1000)} seconds`);
 *   }
 * }
 * ```
 */
export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const {
    limit = 60,
    windowMs = 60000, // 1 minute
    message = 'Too many requests, please try again later.',
    skipInDevelopment = true,
  } = options;

  // Skip in development mode if configured
  const isDevelopment = process.env.NODE_ENV === 'development';
  const shouldSkip = isDevelopment && skipInDevelopment;

  // Storage for rate limits
  const storage: RateLimitStorage = {};

  /**
   * Clean up expired entries periodically
   */
  const cleanup = (): void => {
    const now = Date.now();
    Object.keys(storage).forEach(key => {
      if (storage[key].resetTime <= now) {
        delete storage[key];
      }
    });
  };

  // Schedule cleanup every minute
  if (typeof window !== 'undefined') {
    setInterval(cleanup, 60000);
  }

  return {
    check(key: string): RateLimitResult {
      // Skip rate limiting in development if configured
      if (shouldSkip) {
        return {
          allowed: true,
          current: 0,
          limit,
          remaining: windowMs,
        };
      }

      const now = Date.now();

      // Initialize or reset expired entry
      if (!storage[key] || storage[key].resetTime <= now) {
        storage[key] = {
          count: 0,
          resetTime: now + windowMs,
        };
      }

      // Increment count
      storage[key].count += 1;

      // Calculate result
      const current = storage[key].count;
      const allowed = current <= limit;
      const remaining = Math.max(0, storage[key].resetTime - now);

      return {
        allowed,
        current,
        limit,
        remaining,
        message: allowed ? undefined : message,
      };
    },

    reset(key: string): void {
      delete storage[key];
    },

    resetAll(): void {
      Object.keys(storage).forEach(key => {
        delete storage[key];
      });
    },

    getStatus(key: string): Omit<RateLimitResult, 'allowed' | 'message'> {
      const now = Date.now();

      if (!storage[key] || storage[key].resetTime <= now) {
        return {
          current: 0,
          limit,
          remaining: windowMs,
        };
      }

      return {
        current: storage[key].count,
        limit,
        remaining: Math.max(0, storage[key].resetTime - now),
      };
    },
  };
}
