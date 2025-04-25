/**
 * Browser compatibility utilities for the Vibing AI SDK.
 * Provides feature detection, polyfill management, and graceful degradation helpers.
 */

/**
 * Detects if running in a browser environment
 * @returns {boolean} True if in browser, false otherwise
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Browser detection utility - use sparingly and prefer feature detection
 */
export const browserInfo = (): {
  name: string;
  version: string;
  mobile: boolean;
} => {
  if (!isBrowser()) {
    return { name: 'node', version: process.version, mobile: false };
  }

  const ua = navigator.userAgent;
  let browserName = 'unknown';
  let browserVersion = 'unknown';
  let isMobile = false;

  // Mobile detection
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      ua
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
      ua.substr(0, 4)
    )
  ) {
    isMobile = true;
  }

  // Browser detection
  if (ua.indexOf('Edge') !== -1) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edge\/(\d+(\.\d+)?)/)?.[1] || 'unknown';
  } else if (ua.indexOf('Firefox') !== -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+(\.\d+)?)/)?.[1] || 'unknown';
  } else if (ua.indexOf('Chrome') !== -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+(\.\d+)?)/)?.[1] || 'unknown';
  } else if (ua.indexOf('Safari') !== -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+(\.\d+)?)/)?.[1] || 'unknown';
  } else if (ua.indexOf('MSIE') !== -1 || ua.indexOf('Trident/') !== -1) {
    browserName = 'Internet Explorer';
    browserVersion = ua.match(/(?:MSIE |rv:)(\d+(\.\d+)?)/)?.[1] || 'unknown';
  }

  return { name: browserName, version: browserVersion, mobile: isMobile };
};

/**
 * Feature detection for storage APIs
 */
export const storageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  if (!isBrowser()) return false;

  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (_e) {
    return false;
  }
};

/**
 * Storage fallbacks when localStorage/sessionStorage aren't available
 */
class MemoryStorage implements Storage {
  private items: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.items).length;
  }

  clear(): void {
    this.items = {};
  }

  getItem(key: string): string | null {
    return key in this.items ? this.items[key] : null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.items);
    return index >= 0 && index < keys.length ? keys[index] : null;
  }

  removeItem(key: string): void {
    delete this.items[key];
  }

  setItem(key: string, value: string): void {
    this.items[key] = value;
  }
}

/**
 * Get appropriate storage with fallback to memory storage if needed
 */
export const getStorage = (type: 'localStorage' | 'sessionStorage'): Storage => {
  if (storageAvailable(type)) {
    return window[type];
  }

  return new MemoryStorage();
};

/**
 * Feature detection for modern APIs
 */
export const features = {
  /**
   * Detects Intersection Observer API
   */
  intersectionObserver: (): boolean => {
    return isBrowser() && 'IntersectionObserver' in window;
  },

  /**
   * Detects ResizeObserver API
   */
  resizeObserver: (): boolean => {
    return isBrowser() && 'ResizeObserver' in window;
  },

  /**
   * Detects WebSocket support
   */
  webSockets: (): boolean => {
    return isBrowser() && 'WebSocket' in window;
  },

  /**
   * Detects if custom elements are supported
   */
  customElements: (): boolean => {
    return isBrowser() && 'customElements' in window;
  },

  /**
   * Detects if the browser supports Shadow DOM
   */
  shadowDOM: (): boolean => {
    return isBrowser() && !!HTMLElement.prototype.attachShadow;
  },

  /**
   * Detects if the Fetch API is available
   */
  fetch: (): boolean => {
    return isBrowser() && 'fetch' in window;
  },
};

/**
 * Polyfill loading utility - loads polyfills only when needed
 */
export const loadPolyfill = async (featureName: string): Promise<void> => {
  switch (featureName) {
    case 'fetch':
      if (!features.fetch()) {
        // Use dynamic import for better browser and bundler compatibility
        await import('whatwg-fetch');
      }
      break;
    case 'intersectionObserver':
      if (!features.intersectionObserver()) {
        await import('intersection-observer');
      }
      break;
    // Add more polyfills as needed
    default:
      console.warn(`No polyfill available for "${featureName}"`);
  }
};

/**
 * Utility to safely call a function that might not be supported in all browsers
 * @param fn The function to call
 * @param fallback A fallback value or function to use if the feature is not supported
 */
export function safeCall<T>(fn: () => T, fallback: T | (() => T)): T {
  try {
    return fn();
  } catch (_e) {
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
}

/**
 * Compatibility check result with usage recommendations
 */
export type CompatResult = {
  compatible: boolean;
  reason?: string;
  recommendation?: string;
};

/**
 * Check browser compatibility with the SDK
 */
export const checkCompatibility = (): CompatResult => {
  if (!isBrowser()) {
    return {
      compatible: true, // Node.js is supported
    };
  }

  const { name, version } = browserInfo();

  // Check for unsupported browsers
  if (name === 'Internet Explorer') {
    return {
      compatible: false,
      reason: 'Internet Explorer is not supported',
      recommendation: 'Please use a modern browser like Chrome, Firefox, Safari, or Edge',
    };
  }

  // Check for minimum versions
  if (name === 'Chrome' && parseInt(version, 10) < 60) {
    return {
      compatible: false,
      reason: `Chrome version ${version} is not supported`,
      recommendation: 'Please update to Chrome 60 or higher',
    };
  }

  if (name === 'Firefox' && parseInt(version, 10) < 60) {
    return {
      compatible: false,
      reason: `Firefox version ${version} is not supported`,
      recommendation: 'Please update to Firefox 60 or higher',
    };
  }

  if (name === 'Safari' && parseInt(version, 10) < 12) {
    return {
      compatible: false,
      reason: `Safari version ${version} is not supported`,
      recommendation: 'Please update to Safari 12 or higher',
    };
  }

  if (name === 'Edge' && parseInt(version, 10) < 79) {
    return {
      compatible: false,
      reason: `Edge version ${version} is not supported (EdgeHTML)`,
      recommendation: 'Please update to Chromium-based Edge 79 or higher',
    };
  }

  // If we've made it here, the browser is compatible
  return { compatible: true };
};

// Run compatibility check on init
export const initCompat = (): void => {
  if (process.env.NODE_ENV !== 'production') {
    const compatResult = checkCompatibility();
    if (!compatResult.compatible) {
      console.warn(
        `[Vibing SDK] Browser compatibility issue: ${compatResult.reason}. ${compatResult.recommendation}`
      );
    }
  }
};
