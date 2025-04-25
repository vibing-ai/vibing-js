/**
 * Global type declarations
 */

declare module 'whatwg-fetch';
declare module 'intersection-observer';

/**
 * Chrome-specific Performance interface extensions
 */
interface Performance {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
} 