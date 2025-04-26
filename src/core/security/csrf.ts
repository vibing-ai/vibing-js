/**
 * CSRF (Cross-Site Request Forgery) Protection Utilities
 *
 * These utilities help protect applications from CSRF attacks
 * by implementing token-based protection mechanisms.
 */

/**
 * Configuration options for CSRF protection
 */
export interface CSRFProtectionOptions {
  /**
   * Token name to use in headers, forms, and cookies
   * @default 'vibing-csrf-token'
   */
  tokenName?: string;

  /**
   * How long tokens remain valid in milliseconds
   * @default 3600000 (1 hour)
   */
  tokenLifetime?: number;

  /**
   * Whether to bind tokens to specific actions
   * @default false
   */
  actionSpecificTokens?: boolean;

  /**
   * Whether to automatically generate and add tokens to forms
   * @default true
   */
  autoProtectForms?: boolean;

  /**
   * Cookie options for CSRF token storage
   */
  cookieOptions?: {
    /**
     * Cookie path
     * @default '/'
     */
    path?: string;

    /**
     * Whether cookie should only be sent over HTTPS
     * @default true
     */
    secure?: boolean;

    /**
     * Whether cookie is inaccessible to JavaScript
     * @default true
     */
    httpOnly?: boolean;

    /**
     * Same-site cookie attribute
     * @default 'lax'
     */
    sameSite?: 'strict' | 'lax' | 'none';
  };
}

/**
 * CSRF Protection Service interface
 */
export interface CSRFProtection {
  /**
   * Generate a new CSRF token
   * @param action Optional action to bind the token to
   * @returns The generated token
   */
  generateToken(action?: string): string;

  /**
   * Validate a CSRF token
   * @param token The token to validate
   * @param action Optional action to validate against
   * @returns Whether the token is valid
   */
  validateToken(token: string, action?: string): boolean;

  /**
   * Get the current active token
   * @param action Optional action to get token for
   * @returns The current token or generates a new one
   */
  getToken(action?: string): string;

  /**
   * Automatically protects a form by adding a CSRF token
   * @param form The form element to protect
   * @param action Optional action to bind the token to
   */
  protectForm(form: HTMLFormElement, action?: string): void;

  /**
   * Gets HTTP headers containing the CSRF token
   * @param action Optional action to get headers for
   * @returns Headers object with CSRF token
   */
  getHeaders(action?: string): Record<string, string>;

  /**
   * Check if a request is safe (immune to CSRF)
   * @param method HTTP method
   * @returns Whether the method is safe
   */
  isSafeMethod(method: string): boolean;
}

/**
 * Creates a CSRF protection service
 * @param options Configuration options
 * @returns CSRF protection service
 * @example
 * ```typescript
 * const csrfProtection = createCSRFProtection({
 *   tokenName: 'my-app-csrf-token',
 *   tokenLifetime: 7200000 // 2 hours
 * });
 *
 * // Get headers with CSRF token for a fetch request
 * fetch('/api/data', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     ...csrfProtection.getHeaders()
 *   },
 *   body: JSON.stringify({ data: 'example' })
 * });
 *
 * // Protect a form
 * const form = document.querySelector('form');
 * if (form) {
 *   csrfProtection.protectForm(form);
 * }
 * ```
 */
export function createCSRFProtection(options: CSRFProtectionOptions = {}): CSRFProtection {
  const {
    tokenName = 'vibing-csrf-token',
    tokenLifetime = 3600000, // 1 hour
    actionSpecificTokens = false,
    autoProtectForms = true,
    cookieOptions = {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    },
  } = options;

  // Storage for tokens
  const tokens: Record<string, { value: string; expires: number }> = {};

  // Generate a cryptographically secure random string
  const generateRandomString = (): string => {
    let random = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // In a browser environment, use crypto API
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const values = new Uint32Array(16);
      window.crypto.getRandomValues(values);
      for (let i = 0; i < values.length; i++) {
        random += possible.charAt(values[i] % possible.length);
      }
    } else {
      // Fallback for non-browser or older browsers
      for (let i = 0; i < 32; i++) {
        random += possible.charAt(Math.floor(Math.random() * possible.length));
      }
    }

    return random;
  };

  // Set a cookie with the token
  const setCookie = (token: string): void => {
    if (typeof document === 'undefined') return;

    const { path, secure, httpOnly, sameSite } = cookieOptions;
    let cookieStr = `${tokenName}=${token}; path=${path}`;

    if (secure) cookieStr += '; Secure';
    if (httpOnly) cookieStr += '; HttpOnly';
    if (sameSite) cookieStr += `; SameSite=${sameSite}`;

    document.cookie = cookieStr;
  };

  // Get token from cookie
  const getTokenFromCookie = (): string | null => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === tokenName) {
        return value;
      }
    }

    return null;
  };

  // Initialize automatic form protection if enabled
  if (autoProtectForms && typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('form').forEach(form => {
        // Skip forms with the data-no-csrf attribute
        if (!form.hasAttribute('data-no-csrf')) {
          const action = form.getAttribute('data-csrf-action') || undefined;
          protectForm(form, action);
        }
      });
    });
  }

  // Implement the protectForm function
  function protectForm(form: HTMLFormElement, action?: string): void {
    // Check if form already has a token
    let tokenInput = form.querySelector(`input[name="${tokenName}"]`);

    // If no token input exists, create one
    if (!tokenInput) {
      tokenInput = document.createElement('input');
      tokenInput.setAttribute('type', 'hidden');
      tokenInput.setAttribute('name', tokenName);
      form.appendChild(tokenInput);
    }

    // Set the token value
    tokenInput.setAttribute('value', generateToken(action));
  }

  // Generate a new token
  function generateToken(action?: string): string {
    const token = generateRandomString();
    const expires = Date.now() + tokenLifetime;
    const key = actionSpecificTokens && action ? action : 'default';

    tokens[key] = { value: token, expires };
    setCookie(token);

    return token;
  }

  // Validate a token
  function validateToken(token: string, action?: string): boolean {
    const key = actionSpecificTokens && action ? action : 'default';
    const storedToken = tokens[key];

    // Check if token exists and hasn't expired
    if (storedToken && storedToken.value === token && storedToken.expires > Date.now()) {
      return true;
    }

    // Also check the cookie as a fallback
    const cookieToken = getTokenFromCookie();
    return cookieToken === token;
  }

  // Get the current token or generate a new one
  function getToken(action?: string): string {
    const key = actionSpecificTokens && action ? action : 'default';
    const storedToken = tokens[key];

    // If token exists and is still valid, return it
    if (storedToken && storedToken.expires > Date.now()) {
      return storedToken.value;
    }

    // Otherwise generate a new token
    return generateToken(action);
  }

  // Get headers with CSRF token
  function getHeaders(action?: string): Record<string, string> {
    const token = getToken(action);
    return {
      [tokenName]: token,
      'X-CSRF-Token': token,
    };
  }

  // Check if a method is safe (immune to CSRF)
  function isSafeMethod(method: string): boolean {
    return /^(GET|HEAD|OPTIONS)$/i.test(method);
  }

  return {
    generateToken,
    validateToken,
    getToken,
    protectForm,
    getHeaders,
    isSafeMethod,
  };
}
