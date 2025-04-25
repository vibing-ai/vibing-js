import { useEffect, useState, useRef } from 'react';

/**
 * Performance monitoring utilities
 * 
 * This module provides tools for monitoring and optimizing the performance
 * of applications built with the Vibing AI SDK.
 */

// Default thresholds for performance warnings
const DEFAULT_THRESHOLDS = {
  memory: {
    warning: 50 * 1024 * 1024, // 50MB
    critical: 100 * 1024 * 1024, // 100MB
  },
  renderTime: {
    warning: 16, // 16ms (60fps)
    critical: 50, // 50ms (20fps)
  },
  operationCount: {
    warning: 1000,
    critical: 5000,
  },
  executionTime: {
    warning: 300, // 300ms
    critical: 1000, // 1s
  }
};

/**
 * Interface for performance metric values
 */
export interface PerformanceMetrics {
  memory: {
    used: number;
    limit: number;
    percentUsed: number;
  };
  rendering: {
    lastRenderTime: number;
    averageRenderTime: number;
    renderCount: number;
  };
  operations: {
    count: number;
    lastOperationTime: number;
    averageOperationTime: number;
  };
}

/**
 * Interface for threshold configuration
 */
export interface PerformanceThresholds {
  memory?: {
    warning?: number;
    critical?: number;
  };
  renderTime?: {
    warning?: number;
    critical?: number;
  };
  operationCount?: {
    warning?: number;
    critical?: number;
  };
  executionTime?: {
    warning?: number;
    critical?: number;
  };
}

/**
 * Resource monitor options
 */
export interface ResourceMonitorOptions {
  /** Performance thresholds for triggering warnings */
  thresholds?: PerformanceThresholds;
  /** Enable debug mode with detailed logging */
  debug?: boolean;
  /** Automatic collection interval in ms (default: 5000) */
  collectionInterval?: number;
}

/**
 * Resource monitoring hook that provides performance metrics and utilities
 * 
 * @param options Configuration options for the resource monitor
 * @returns Object containing performance metrics and utility functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { metrics, measureExecution, trackOperation, isApproachingLimit } = useResourceMonitor({ 
 *     debug: true 
 *   });
 *   
 *   const handleExpensiveOperation = async () => {
 *     const result = await measureExecution(async () => {
 *       // Expensive operation
 *       return complexCalculation();
 *     });
 *     
 *     if (isApproachingLimit('memory')) {
 *       // Take action to reduce memory usage
 *     }
 *     
 *     return result;
 *   };
 *   
 *   return (
 *     <div>
 *       <p>Memory used: {(metrics.memory.used / 1024 / 1024).toFixed(2)}MB</p>
 *       <p>Average render time: {metrics.rendering.averageRenderTime.toFixed(2)}ms</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useResourceMonitor(options: ResourceMonitorOptions = {}) {
  const {
    thresholds = {},
    debug = false,
    collectionInterval = 5000,
  } = options;
  
  // Combine default thresholds with user-provided thresholds
  const effectiveThresholds = {
    memory: { ...DEFAULT_THRESHOLDS.memory, ...thresholds.memory },
    renderTime: { ...DEFAULT_THRESHOLDS.renderTime, ...thresholds.renderTime },
    operationCount: { ...DEFAULT_THRESHOLDS.operationCount, ...thresholds.operationCount },
    executionTime: { ...DEFAULT_THRESHOLDS.executionTime, ...thresholds.executionTime },
  };
  
  // Performance metrics state
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: {
      used: 0,
      limit: window.performance?.memory?.jsHeapSizeLimit || 2147483648, // Default to 2GB if not available
      percentUsed: 0,
    },
    rendering: {
      lastRenderTime: 0,
      averageRenderTime: 0,
      renderCount: 0,
    },
    operations: {
      count: 0,
      lastOperationTime: 0,
      averageOperationTime: 0,
    },
  });
  
  // Refs for tracking
  const renderTimeRef = useRef<number>(performance.now());
  const renderTimesRef = useRef<number[]>([]);
  const operationTimesRef = useRef<number[]>([]);
  const operationCountRef = useRef<number>(0);
  
  // Debug logging function
  const logDebug = (message: string, data?: any) => {
    if (!debug) return;
    
    console.log(`%c[Vibing Performance Monitor] %c${message}`, 
      'color: #7c4dff; font-weight: bold', 
      'color: inherit', 
      data || '');
  };
  
  /**
   * Collects current performance metrics
   */
  const collectMetrics = () => {
    // Get memory usage if available
    const memoryInfo = window.performance?.memory;
    const memoryUsed = memoryInfo?.usedJSHeapSize || 0;
    const memoryLimit = memoryInfo?.jsHeapSizeLimit || 2147483648;
    const memoryPercentUsed = (memoryUsed / memoryLimit) * 100;
    
    // Calculate average render time
    const renderTimes = renderTimesRef.current;
    const averageRenderTime = renderTimes.length 
      ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
      : 0;
    
    // Calculate average operation time
    const operationTimes = operationTimesRef.current;
    const averageOperationTime = operationTimes.length
      ? operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length
      : 0;
    
    // Update metrics state
    setMetrics({
      memory: {
        used: memoryUsed,
        limit: memoryLimit,
        percentUsed: memoryPercentUsed,
      },
      rendering: {
        lastRenderTime: renderTimes.length ? renderTimes[renderTimes.length - 1] : 0,
        averageRenderTime,
        renderCount: renderTimes.length,
      },
      operations: {
        count: operationCountRef.current,
        lastOperationTime: operationTimes.length ? operationTimes[operationTimes.length - 1] : 0,
        averageOperationTime,
      },
    });
    
    // Performance warnings
    if (memoryUsed > effectiveThresholds.memory.critical) {
      console.warn(`Critical memory usage: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
    } else if (memoryUsed > effectiveThresholds.memory.warning) {
      console.warn(`High memory usage: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
    }
    
    if (averageRenderTime > effectiveThresholds.renderTime.critical) {
      console.warn(`Critical render time: ${averageRenderTime.toFixed(2)}ms`);
    } else if (averageRenderTime > effectiveThresholds.renderTime.warning) {
      console.warn(`Slow render time: ${averageRenderTime.toFixed(2)}ms`);
    }
    
    if (operationCountRef.current > effectiveThresholds.operationCount.critical) {
      console.warn(`Critical operation count: ${operationCountRef.current}`);
    } else if (operationCountRef.current > effectiveThresholds.operationCount.warning) {
      console.warn(`High operation count: ${operationCountRef.current}`);
    }
    
    // Log debug information
    if (debug) {
      logDebug('Performance metrics collected', {
        memory: `${(memoryUsed / 1024 / 1024).toFixed(2)}MB / ${(memoryLimit / 1024 / 1024).toFixed(0)}MB (${memoryPercentUsed.toFixed(1)}%)`,
        render: `${averageRenderTime.toFixed(2)}ms avg (${renderTimes.length} renders)`,
        operations: `${operationCountRef.current} ops, ${averageOperationTime.toFixed(2)}ms avg`
      });
    }
  };
  
  /**
   * Checks if a performance metric is approaching its threshold limit
   * 
   * @param metric The metric to check ('memory', 'renderTime', 'operationCount')
   * @param level The threshold level to check ('warning' or 'critical')
   * @returns Boolean indicating if the metric is approaching the limit
   */
  const isApproachingLimit = (
    metric: 'memory' | 'renderTime' | 'operationCount' | 'executionTime',
    level: 'warning' | 'critical' = 'warning'
  ): boolean => {
    switch (metric) {
      case 'memory':
        return metrics.memory.used > effectiveThresholds.memory[level];
      case 'renderTime':
        return metrics.rendering.averageRenderTime > effectiveThresholds.renderTime[level];
      case 'operationCount':
        return metrics.operations.count > effectiveThresholds.operationCount[level];
      case 'executionTime':
        return metrics.operations.averageOperationTime > effectiveThresholds.executionTime[level];
      default:
        return false;
    }
  };
  
  /**
   * Measures the execution time of a function
   * 
   * @param fn The function to measure
   * @param label Optional label for logging
   * @returns The result of the function
   */
  const measureExecution = async <T>(fn: () => Promise<T> | T, label?: string): Promise<T> => {
    const start = performance.now();
    
    try {
      // Track operation
      operationCountRef.current += 1;
      
      // Execute function
      const result = await fn();
      
      // Measure time
      const executionTime = performance.now() - start;
      operationTimesRef.current.push(executionTime);
      
      // Trim operation times array if it gets too large
      if (operationTimesRef.current.length > 100) {
        operationTimesRef.current = operationTimesRef.current.slice(-100);
      }
      
      // Log execution time if in debug mode
      logDebug(
        `Execution ${label ? `"${label}" ` : ''}completed in ${executionTime.toFixed(2)}ms`
      );
      
      // Warning if execution time exceeds thresholds
      if (executionTime > effectiveThresholds.executionTime.critical) {
        console.warn(`Critical execution time${label ? ` for "${label}"` : ''}: ${executionTime.toFixed(2)}ms`);
      } else if (executionTime > effectiveThresholds.executionTime.warning) {
        console.warn(`Slow execution time${label ? ` for "${label}"` : ''}: ${executionTime.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const executionTime = performance.now() - start;
      logDebug(`Execution ${label ? `"${label}" ` : ''}failed after ${executionTime.toFixed(2)}ms`, error);
      throw error;
    }
  };
  
  /**
   * Tracks a single operation (useful for manually tracking operations not using measureExecution)
   * 
   * @param executionTime Execution time in milliseconds
   * @param label Optional label for logging
   */
  const trackOperation = (executionTime: number, label?: string) => {
    operationCountRef.current += 1;
    operationTimesRef.current.push(executionTime);
    
    // Trim operation times array if it gets too large
    if (operationTimesRef.current.length > 100) {
      operationTimesRef.current = operationTimesRef.current.slice(-100);
    }
    
    logDebug(`Operation ${label ? `"${label}" ` : ''}tracked: ${executionTime.toFixed(2)}ms`);
  };
  
  /**
   * Reset collected performance data
   */
  const resetMetrics = () => {
    renderTimesRef.current = [];
    operationTimesRef.current = [];
    operationCountRef.current = 0;
    
    setMetrics({
      memory: {
        used: 0,
        limit: window.performance?.memory?.jsHeapSizeLimit || 2147483648,
        percentUsed: 0,
      },
      rendering: {
        lastRenderTime: 0,
        averageRenderTime: 0,
        renderCount: 0,
      },
      operations: {
        count: 0,
        lastOperationTime: 0,
        averageOperationTime: 0,
      },
    });
    
    logDebug('Performance metrics reset');
  };
  
  /**
   * Suggest optimizations based on current performance metrics
   * 
   * @returns Array of optimization suggestions
   */
  const suggestOptimizations = (): string[] => {
    const suggestions: string[] = [];
    
    // Memory optimizations
    if (isApproachingLimit('memory', 'warning')) {
      suggestions.push('Consider cleaning up unused objects to reduce memory usage');
      suggestions.push('Check for memory leaks or large data structures');
    }
    
    // Render optimizations
    if (isApproachingLimit('renderTime', 'warning')) {
      suggestions.push('Use React.memo for components that render often but rarely change');
      suggestions.push('Consider useMemo and useCallback to prevent unnecessary re-renders');
      suggestions.push('Split large components into smaller, focused components');
    }
    
    // Operation optimizations
    if (isApproachingLimit('operationCount', 'warning')) {
      suggestions.push('Batch similar operations where possible');
      suggestions.push('Consider implementing pagination for large data sets');
      suggestions.push('Use debouncing or throttling for frequent events');
    }
    
    // Execution time optimizations
    if (isApproachingLimit('executionTime', 'warning')) {
      suggestions.push('Move expensive operations to web workers if possible');
      suggestions.push('Consider caching results of expensive calculations');
      suggestions.push('Break long-running tasks into smaller chunks');
    }
    
    return suggestions;
  };
  
  // Effect to measure render time
  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - renderTimeRef.current;
    
    renderTimesRef.current.push(renderTime);
    
    // Keep only the last 100 render times to avoid memory growth
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current = renderTimesRef.current.slice(-100);
    }
    
    // Reset for next render
    renderTimeRef.current = performance.now();
    
    logDebug(`Component rendered in ${renderTime.toFixed(2)}ms`);
    
    // Warning if render time exceeds thresholds
    if (renderTime > effectiveThresholds.renderTime.critical) {
      console.warn(`Critical render time: ${renderTime.toFixed(2)}ms`);
    } else if (renderTime > effectiveThresholds.renderTime.warning) {
      console.warn(`Slow render time: ${renderTime.toFixed(2)}ms`);
    }
  });
  
  // Effect to periodically collect metrics
  useEffect(() => {
    // Initial collection
    collectMetrics();
    
    // Set up interval for ongoing collection
    const intervalId = setInterval(collectMetrics, collectionInterval);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [collectionInterval]);
  
  return {
    metrics,
    isApproachingLimit,
    measureExecution,
    trackOperation,
    resetMetrics,
    suggestOptimizations,
  };
}

/**
 * Measures the execution time of a synchronous function
 * 
 * @param fn The function to measure
 * @param label Optional label for console output
 * @returns The result of the function and execution time
 * 
 * @example
 * ```js
 * const { result, time } = measureFunction(() => {
 *   // Some expensive calculation
 *   return calculateValue();
 * }, "calculateValue");
 * 
 * console.log(`Result: ${result}, Time: ${time}ms`);
 * ```
 */
export function measureFunction<T>(fn: () => T, label?: string): { result: T, time: number } {
  const start = performance.now();
  
  try {
    const result = fn();
    const time = performance.now() - start;
    
    if (label) {
      console.log(`[Vibing Performance] ${label}: ${time.toFixed(2)}ms`);
    }
    
    return { result, time };
  } catch (error) {
    const time = performance.now() - start;
    
    if (label) {
      console.error(`[Vibing Performance] ${label} failed after ${time.toFixed(2)}ms`, error);
    }
    
    throw error;
  }
}

/**
 * Creates a component render time tracker to monitor rendering performance
 * 
 * @param componentName Name of the component to be tracked
 * @param options Tracking options
 * @returns Object with start and end methods
 * 
 * @example
 * ```jsx
 * function MyComponent() {
 *   const tracker = createRenderTracker('MyComponent');
 *   
 *   // Start timing at the beginning of render
 *   tracker.start();
 *   
 *   // Do rendering work...
 *   
 *   // End timing before returning
 *   tracker.end();
 *   
 *   return <div>My Component</div>;
 * }
 * ```
 */
export function createRenderTracker(
  componentName: string,
  options: { 
    debug?: boolean;
    warnThreshold?: number;
  } = {}
) {
  const { debug = false, warnThreshold = DEFAULT_THRESHOLDS.renderTime.warning } = options;
  
  let startTime = 0;
  
  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (debug) {
        console.log(`[Vibing Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }
      
      if (renderTime > warnThreshold) {
        console.warn(`[Vibing Performance] Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
      
      return renderTime;
    }
  };
}

/**
 * Records memory usage at a specific point in time
 * 
 * @returns Object containing memory usage information
 * 
 * @example
 * ```js
 * const memoryBefore = recordMemoryUsage();
 * // Do something memory-intensive
 * const memoryAfter = recordMemoryUsage();
 * 
 * console.log(`Memory increased by ${(memoryAfter.used - memoryBefore.used) / 1024 / 1024}MB`);
 * ```
 */
export function recordMemoryUsage() {
  const memory = window.performance?.memory;
  
  if (!memory) {
    console.warn('[Vibing Performance] Performance.memory API not available in this browser');
    return {
      used: 0,
      total: 0,
      limit: 0,
      available: true,
    };
  }
  
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
    available: true,
  };
}

/**
 * Debounces a function to improve performance for frequently called operations
 * 
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns Debounced function
 * 
 * @example
 * ```js
 * // Instead of calling this on every keystroke
 * const handleSearch = (query) => {
 *   // Expensive search operation
 * };
 * 
 * // Debounce it to only run after typing stops
 * const debouncedSearch = debounce(handleSearch, 300);
 * 
 * // Use in an event handler
 * const handleInputChange = (e) => {
 *   debouncedSearch(e.target.value);
 * };
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Throttles a function to limit how often it can be called
 * 
 * @param fn The function to throttle
 * @param limit The minimum time between function calls in milliseconds
 * @returns Throttled function
 * 
 * @example
 * ```js
 * // Instead of calling this on every mouse move
 * const handleMouseMove = (e) => {
 *   // Update UI based on mouse position
 * };
 * 
 * // Throttle it to run at most every 100ms
 * const throttledMouseMove = throttle(handleMouseMove, 100);
 * 
 * // Use in an event handler
 * element.addEventListener('mousemove', throttledMouseMove);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastRun = 0;
  
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    
    if (lastRun + limit <= now) {
      lastRun = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        lastRun = Date.now();
        fn(...args);
      }, limit - (now - lastRun));
    }
  };
} 