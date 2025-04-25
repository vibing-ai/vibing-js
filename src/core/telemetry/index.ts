/**
 * Telemetry module for the Vibing AI SDK.
 *
 * This module provides optional, privacy-preserving analytics collection to help
 * improve the SDK. All telemetry is strictly opt-in, anonymous, and focused
 * on feature usage and error patterns rather than user data.
 */

import { SDK_VERSION } from '../version';
import { logger } from '../utils/logger';

/**
 * Types of events that can be tracked
 */
export enum TelemetryEventType {
  INITIALIZATION = 'initialization',
  FEATURE_USAGE = 'feature_usage',
  ERROR = 'error',
  PERFORMANCE = 'performance',
}

/**
 * Configuration options for telemetry
 */
export interface TelemetryConfig {
  /** Whether telemetry is enabled (default: false) */
  enabled: boolean;
  /** Custom URL for telemetry endpoint (optional) */
  endpoint?: string;
  /** Whether to collect feature usage statistics (default: true if enabled) */
  featureUsage?: boolean;
  /** Whether to collect error reports (default: true if enabled) */
  errorReporting?: boolean;
  /** Whether to collect performance metrics (default: true if enabled) */
  performanceMetrics?: boolean;
  /** Whether to collect environment information (default: true if enabled) */
  environmentInfo?: boolean;
  /** User ID or installation ID (random UUID generated on first run) */
  installationId?: string;
}

/**
 * Telemetry event data structure
 */
interface TelemetryEvent {
  /** Type of telemetry event */
  type: TelemetryEventType;
  /** Name of the specific event */
  name: string;
  /** Additional properties for the event */
  properties?: Record<string, unknown>;
  /** Timestamp of when the event occurred */
  timestamp: number;
  /** SDK version */
  sdkVersion: string;
  /** Installation ID (anonymous) */
  installationId: string;
}

/**
 * Default configuration for telemetry
 */
const DEFAULT_CONFIG: TelemetryConfig = {
  enabled: false,
  endpoint: 'https://telemetry.vibing.ai/collect',
  featureUsage: true,
  errorReporting: true,
  performanceMetrics: true,
  environmentInfo: true,
  installationId: generateInstallationId(),
};

let currentConfig: TelemetryConfig = { ...DEFAULT_CONFIG };
let isInitialized = false;
let eventQueue: TelemetryEvent[] = [];
let flushInterval: NodeJS.Timeout | null = null;

/**
 * Generate a random installation ID
 */
function generateInstallationId(): string {
  // Simple UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Initialize the telemetry system with configuration
 */
export function initTelemetry(config: Partial<TelemetryConfig> = {}): void {
  currentConfig = { ...DEFAULT_CONFIG, ...config };

  // Store installation ID if needed
  if (!currentConfig.installationId) {
    currentConfig.installationId = generateInstallationId();
    // In a real implementation, this would be persisted to local storage
  }

  if (currentConfig.enabled) {
    isInitialized = true;

    // Set up periodic flushing of events
    if (flushInterval === null) {
      flushInterval = setInterval(flushEvents, 60000); // Flush every minute
    }

    // Show notice in development environments
    if (process.env.NODE_ENV === 'development') {
      logger.log(
        '[Vibing SDK] Telemetry is enabled. To learn more or opt out, visit https://docs.vibing.ai/telemetry'
      );
    }

    // Track initialization
    trackEvent(TelemetryEventType.INITIALIZATION, 'sdk_initialized', {
      version: SDK_VERSION,
      environment: process.env.NODE_ENV,
      features: {
        featureUsage: currentConfig.featureUsage,
        errorReporting: currentConfig.errorReporting,
        performanceMetrics: currentConfig.performanceMetrics,
        environmentInfo: currentConfig.environmentInfo,
      },
    });
  }
}

/**
 * Track a telemetry event
 */
export function trackEvent(
  type: TelemetryEventType,
  name: string,
  properties: Record<string, unknown> = {}
): void {
  if (!currentConfig.enabled || !isInitialized) {
    return;
  }

  // Skip certain event types based on configuration
  if (
    (type === TelemetryEventType.FEATURE_USAGE && !currentConfig.featureUsage) ||
    (type === TelemetryEventType.ERROR && !currentConfig.errorReporting) ||
    (type === TelemetryEventType.PERFORMANCE && !currentConfig.performanceMetrics)
  ) {
    return;
  }

  // Remove any potentially sensitive data from properties
  const sanitizedProperties = sanitizeProperties(properties);

  // Create the event
  const event: TelemetryEvent = {
    type,
    name,
    properties: sanitizedProperties,
    timestamp: Date.now(),
    sdkVersion: SDK_VERSION,
    installationId: currentConfig.installationId || 'unknown',
  };

  // Queue the event
  eventQueue.push(event);

  // Auto-flush if queue gets too large
  if (eventQueue.length >= 20) {
    flushEvents();
  }
}

/**
 * Remove potentially sensitive data from properties
 */
function sanitizeProperties(properties: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // List of fields that might contain sensitive data
  const sensitiveFields = [
    'password',
    'apiKey',
    'token',
    'secret',
    'credential',
    'auth',
    'email',
    'phone',
    'address',
    'name',
    'user',
    'account',
  ];

  // Simple sanitization - in a real implementation this would be more robust
  for (const [key, value] of Object.entries(properties)) {
    // Skip any properties with sensitive names
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      continue;
    }

    // Handle different value types
    if (typeof value === 'string') {
      // Skip long strings that might contain sensitive data
      if (value.length > 100) {
        result[key] = '[REDACTED:TOO_LONG]';
      } else {
        result[key] = value;
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      // Numbers and booleans are safe
      result[key] = value;
    } else if (value === null) {
      result[key] = null;
    } else if (Array.isArray(value)) {
      // Just track array length
      result[key] = `[Array:${value.length}]`;
    } else if (typeof value === 'object') {
      // Just note it's an object
      result[key] = '[Object]';
    }
  }

  return result;
}

/**
 * Flush queued events to the telemetry endpoint
 */
export function flushEvents(): Promise<void> {
  if (!currentConfig.enabled || !isInitialized || eventQueue.length === 0) {
    return Promise.resolve();
  }

  const events = [...eventQueue];
  eventQueue = [];

  // Get the endpoint with a fallback to the default
  const endpoint = currentConfig.endpoint || DEFAULT_CONFIG.endpoint || '';

  // In a browser environment, check for navigator.sendBeacon support
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const _sendBeaconResult = navigator.sendBeacon(endpoint, JSON.stringify({ events }));
    // We don't use the result but we need to acknowledge it to avoid the unused variable warning
    
    return Promise.resolve();
  }

  // Fall back to fetch API
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ events }),
  })
    .then(() => {
      // Success case - we don't need to do anything
    })
    .catch(error => {
      // Log errors but don't crash the application
      logger.error('[Vibing SDK] Failed to send telemetry', error);
      
      // Put events back in the queue for retry next time
      eventQueue = [...events, ...eventQueue];
    });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(
  featureName: string,
  properties: Record<string, unknown> = {}
): void {
  trackEvent(TelemetryEventType.FEATURE_USAGE, featureName, properties);
}

/**
 * Track an error
 */
export function trackError(errorName: string, properties: Record<string, unknown> = {}): void {
  trackEvent(TelemetryEventType.ERROR, errorName, properties);
}

/**
 * Track a performance metric
 */
export function trackPerformance(
  metricName: string,
  durationMs: number,
  properties: Record<string, unknown> = {}
): void {
  trackEvent(TelemetryEventType.PERFORMANCE, metricName, { ...properties, durationMs });
}

/**
 * Disable telemetry collection
 */
export function disableTelemetry(): void {
  currentConfig.enabled = false;

  if (flushInterval !== null) {
    clearInterval(flushInterval);
    flushInterval = null;
  }

  // Clear any pending events
  eventQueue = [];

  if (process.env.NODE_ENV === 'development') {
    logger.log('[Vibing SDK] Telemetry disabled');
  }
}

/**
 * Get current telemetry configuration
 */
export function getTelemetryConfig(): TelemetryConfig {
  return { ...currentConfig };
}

// Clean up on module unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (isInitialized && currentConfig.enabled && eventQueue.length > 0) {
      flushEvents();
    }
  });
}

// Export default config for easy importing
export { DEFAULT_CONFIG };
