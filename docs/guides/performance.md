# Performance Optimization Guide

This guide provides practical approaches to optimize applications built with the Vibing AI SDK. Following these best practices will help you create responsive, efficient applications that provide a better user experience.

## Table of Contents

1. [Memory Management](#memory-management)
2. [Efficient Rendering Patterns](#efficient-rendering-patterns)
3. [Memoization Strategies](#memoization-strategies)
4. [Batching Updates](#batching-updates)
5. [Lazy Loading and Code Splitting](#lazy-loading-and-code-splitting)
6. [Resource Cleanup](#resource-cleanup)
7. [Using the Performance Monitoring Utilities](#using-the-performance-monitoring-utilities)
8. [Measuring Performance](#measuring-performance)
9. [Troubleshooting Common Issues](#troubleshooting-common-issues)
10. [Performance Review Checklist](#performance-review-checklist)
11. [Bundle Size Optimization](#bundle-size-optimization)

## Memory Management

Managing memory efficiently is crucial for maintaining responsive applications, especially when dealing with large datasets or long-running sessions.

### Best Practices

1. **Clean up unused resources** when they're no longer needed:

```javascript
import { useEffect } from 'react';
import { useMemory } from '@vibing-ai/sdk';

function DataComponent({ dataId }) {
  const memory = useMemory();
  
  useEffect(() => {
    // Load data when component mounts
    const loadData = async () => {
      const data = await fetchLargeDataSet();
      await memory.set(`data:${dataId}`, data);
    };
    
    loadData();
    
    // Clean up when component unmounts
    return async () => {
      // Remove data from memory when no longer needed
      await memory.remove(`data:${dataId}`);
    };
  }, [dataId]);
  
  // Component implementation
}
```

2. **Avoid memory leaks** by proper cleanup of event listeners, subscriptions, and intervals:

```javascript
import { useEffect } from 'react';

function EventComponent() {
  useEffect(() => {
    const handler = (event) => {
      // Handle event
    };
    
    window.addEventListener('resize', handler);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
  
  // Component implementation
}
```

3. **Use pagination or virtualization** for large datasets:

```javascript
import { useState } from 'react';
import { useMemory } from '@vibing-ai/sdk';

function DataList() {
  const memory = useMemory();
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const pageSize = 20;
  
  const loadPage = async (pageNum) => {
    // Load just the data needed for this page
    const items = await memory.get(`data:page:${pageNum}`);
    setData(items);
    setPage(pageNum);
  };
  
  // Pagination controls and data rendering
}
```

4. **Implement data expiration** for cached items:

```javascript
import { useMemory } from '@vibing-ai/sdk';

// Helper for setting data with expiration
async function setWithExpiry(memory, key, data, ttlMs) {
  await memory.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
}

// Helper for getting data with expiration check
async function getWithExpiry(memory, key) {
  const item = await memory.get(key);
  
  if (!item) return null;
  
  // Check if the item is expired
  if (item.expiry && Date.now() > item.expiry) {
    await memory.remove(key);
    return null;
  }
  
  return item.data;
}
```

5. **Monitor memory usage** with the Performance Monitoring utilities:

```javascript
import { useResourceMonitor } from '@vibing-ai/sdk/common/performance';

function MemoryAwareComponent() {
  const { metrics, isApproachingLimit } = useResourceMonitor();
  
  // Conditionally render heavy content
  if (isApproachingLimit('memory')) {
    // Render lightweight alternative
    return <LightweightView />;
  }
  
  // Render full content
  return <FullFeaturedView />;
}
```

## Efficient Rendering Patterns

Optimizing how components render can significantly improve application performance.

### Best Practices

1. **Keep component responsibilities focused** to minimize unnecessary re-renders:

```javascript
// Instead of one large component
function LargeComponent({ data, config, user }) {
  // Lots of logic that depends on different props
}

// Split into smaller, focused components
function DataDisplay({ data }) {
  // Only re-renders when data changes
}

function ConfigPanel({ config }) {
  // Only re-renders when config changes
}

function UserPanel({ user }) {
  // Only re-renders when user changes
}
```

2. **Use React.memo for pure components** that render often but don't change frequently:

```javascript
import React from 'react';

// Prevent re-renders unless props change
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // Complex rendering logic
  return <div>{/* Rendered content */}</div>;
});

// With custom comparison function
const OptimizedComponent = React.memo(
  function OptimizedComponent({ items }) {
    // Component logic
    return <div>{/* Rendered content */}</div>;
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if length changes
    return prevProps.items.length === nextProps.items.length;
  }
);
```

3. **Consider component architecture** to prevent unnecessary re-renders:

```javascript
// Bad: Child re-renders when unrelated parent state changes
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveList data={data} />
    </div>
  );
}

// Better: Isolate state to prevent unnecessary re-renders
function ParentComponent() {
  return (
    <div>
      <CounterComponent />
      <DataListContainer />
    </div>
  );
}

function CounterComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}

function DataListContainer() {
  const [data, setData] = useState([]);
  return <ExpensiveList data={data} />;
}
```

4. **Monitor render performance** with the provided utilities:

```javascript
import { createRenderTracker } from '@vibing-ai/sdk/common/performance';

function TrackedComponent() {
  const tracker = createRenderTracker('TrackedComponent', { debug: true });
  
  // Start timing
  tracker.start();
  
  // Component logic...
  
  // End timing before return
  const renderTime = tracker.end();
  
  return (
    <div>
      {/* Rendered content */}
    </div>
  );
}
```

## Memoization Strategies

Using memoization effectively can prevent expensive recalculations.

### Best Practices

1. **Use useMemo for expensive calculations**:

```javascript
import { useMemo } from 'react';

function DataProcessor({ data, filter }) {
  // Memoize expensive calculation
  const processedData = useMemo(() => {
    // Only recalculate when data or filter changes
    return data
      .filter(item => filter.test(item))
      .map(item => transformItem(item))
      .sort((a, b) => a.value - b.value);
  }, [data, filter]);
  
  return (
    <div>
      {processedData.map(item => (
        <DataItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

2. **Use useCallback for event handlers** passed to child components:

```javascript
import { useCallback } from 'react';

function ParentComponent() {
  const [items, setItems] = useState([]);
  
  // Memoize handler so it doesn't change on every render
  const handleItemClick = useCallback((id) => {
    // Handle item click
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, selected: !item.selected }
        : item
    ));
  }, [items]);
  
  return (
    <div>
      {items.map(item => (
        <Item 
          key={item.id} 
          item={item} 
          onClick={handleItemClick} 
        />
      ))}
    </div>
  );
}

// Using React.memo to prevent unnecessary renders
const Item = React.memo(function Item({ item, onClick }) {
  return (
    <div onClick={() => onClick(item.id)}>
      {item.name}
    </div>
  );
});
```

3. **Balance memoization overhead** — don't memoize everything:

```javascript
// Not worth memoizing (simple calculation):
const total = items.length;

// Worth memoizing (expensive calculation):
const processedData = useMemo(() => {
  return expensiveTransformation(largeDataset);
}, [largeDataset]);
```

## Batching Updates

Grouping state updates can improve performance by reducing the number of renders.

### Best Practices

1. **Batch related state updates**:

```javascript
import { useState } from 'react';

function FormComponent() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    preference: 'default'
  });
  
  // Bad: Multiple state updates cause multiple renders
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  
  // Good: Single state update with object spread
  const handleFieldChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <form>
      <input
        value={formState.name}
        onChange={(e) => handleFieldChange('name', e.target.value)}
      />
      {/* Other form fields */}
    </form>
  );
}
```

2. **Use useReducer for complex state logic**:

```javascript
import { useReducer } from 'react';

// Define reducer
function formReducer(state, action) {
  switch (action.type) {
    case 'field_change':
      return { ...state, [action.field]: action.value };
    case 'reset':
      return initialState;
    case 'submit':
      return { ...state, submitted: true, loading: true };
    case 'submit_success':
      return { ...state, loading: false, success: true };
    case 'submit_error':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}

function FormComponent() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  
  // Single dispatch for related changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    dispatch({ type: 'submit' });
    
    try {
      await submitForm(state);
      dispatch({ type: 'submit_success' });
    } catch (error) {
      dispatch({ type: 'submit_error', error });
    }
  };
  
  // ...form rendering
}
```

3. **Use the Vibing SDK events system** for coordinated updates across components:

```javascript
import { useEvents } from '@vibing-ai/sdk';

// In a component that publishes events
function PublisherComponent() {
  const events = useEvents();
  
  const updateMultipleThings = () => {
    // Single event that multiple components can react to
    events.publish('data:batch_update', {
      userId: 123,
      preferences: { theme: 'dark' },
      notifications: { enabled: true }
    });
  };
  
  return <button onClick={updateMultipleThings}>Update All</button>;
}

// In components that subscribe to events
function SubscriberComponent() {
  const events = useEvents();
  const [state, setState] = useState({});
  
  useEffect(() => {
    // Subscribe to batch updates
    const unsubscribe = events.subscribe('data:batch_update', (payload) => {
      // Apply all changes at once
      setState(prev => ({
        ...prev,
        ...payload
      }));
    });
    
    return unsubscribe;
  }, []);
  
  // Component rendering
}
```

## Lazy Loading and Code Splitting

Loading code only when needed can significantly improve initial load times.

### Best Practices

1. **Use dynamic imports** to load components on demand:

```javascript
import { lazy, Suspense } from 'react';

// Import component only when needed
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  const [showHeavy, setShowHeavy] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowHeavy(true)}>
        Load Heavy Component
      </button>
      
      {showHeavy && (
        <Suspense fallback={<div>Loading...</div>}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
}
```

2. **Implement route-based code splitting**:

```javascript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Split code by routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

3. **Defer loading non-critical resources**:

```javascript
import { useEffect, useState } from 'react';

function App() {
  const [chartsLoaded, setChartsLoaded] = useState(false);
  
  // Load chart library after initial render
  useEffect(() => {
    // Use a setTimeout to defer loading until after critical content is displayed
    const timer = setTimeout(() => {
      import('./chartLibrary').then(() => {
        setChartsLoaded(true);
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Critical content loads immediately</p>
      
      {chartsLoaded ? (
        <ChartComponent />
      ) : (
        <div>Charts loading...</div>
      )}
    </div>
  );
}
```

## Resource Cleanup

Proper cleanup prevents memory leaks and ensures efficient resource usage.

### Best Practices

1. **Clean up on component unmount**:

```javascript
import { useEffect } from 'react';
import { useEvents } from '@vibing-ai/sdk';

function SubscribedComponent() {
  const events = useEvents();
  
  useEffect(() => {
    // Subscribe to events
    const unsubscribe = events.subscribe('important:event', handleEvent);
    
    // Clean up subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Component implementation
}
```

2. **Cancel pending requests when no longer needed**:

```javascript
import { useEffect, useState } from 'react';

function DataFetcher({ id }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Create an AbortController for this request
    const controller = new AbortController();
    const { signal } = controller;
    
    // Fetch data with the signal
    fetch(`/api/data/${id}`, { signal })
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => {
        // Don't handle errors caused by intentional aborts
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      });
    
    // Abort the fetch if component unmounts or id changes
    return () => {
      controller.abort();
    };
  }, [id]);
  
  // Component rendering
}
```

3. **Dispose of large objects explicitly**:

```javascript
import { useEffect, useRef } from 'react';
import { useMemory } from '@vibing-ai/sdk';

function LargeDataComponent() {
  const memory = useMemory();
  const hasCleanedUp = useRef(false);
  
  useEffect(() => {
    // Load large data
    const loadData = async () => {
      const largeData = await fetchLargeDataset();
      await memory.set('large:dataset', largeData);
    };
    
    loadData();
    
    // Clean up
    return async () => {
      if (!hasCleanedUp.current) {
        await memory.remove('large:dataset');
        hasCleanedUp.current = true;
      }
    };
  }, []);
  
  // Component implementation
}
```

## Using the Performance Monitoring Utilities

The Vibing SDK includes utilities to help monitor and improve performance.

### Basic Usage

1. **Use the resource monitor hook** to track performance metrics:

```javascript
import { useResourceMonitor } from '@vibing-ai/sdk/common/performance';

function OptimizedComponent() {
  // Initialize the resource monitor
  const { 
    metrics, 
    measureExecution, 
    isApproachingLimit,
    suggestOptimizations 
  } = useResourceMonitor({
    debug: process.env.NODE_ENV === 'development',
    collectionInterval: 2000,
    thresholds: {
      memory: {
        warning: 30 * 1024 * 1024,  // 30MB
        critical: 60 * 1024 * 1024  // 60MB
      }
    }
  });
  
  // Measure expensive operations
  const handleDataProcessing = async () => {
    await measureExecution(async () => {
      // Expensive operation
      await processLargeDataset();
    }, 'dataProcessing');
  };
  
  // Check if approaching resource limits
  const renderContent = () => {
    if (isApproachingLimit('memory', 'critical')) {
      return <div>Memory usage critical! Please save your work.</div>;
    }
    
    if (isApproachingLimit('memory', 'warning')) {
      return (
        <div>
          <p>Memory usage is high. Consider closing unused items.</p>
          <NormalContent />
        </div>
      );
    }
    
    return <NormalContent />;
  };
  
  // Render optimization suggestions in development
  const renderOptimizationTips = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    const tips = suggestOptimizations();
    if (tips.length === 0) return null;
    
    return (
      <div className="dev-optimization-tips">
        <h4>Optimization Suggestions:</h4>
        <ul>
          {tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </div>
    );
  };
  
  return (
    <div>
      <div className="performance-metrics">
        <p>Memory: {(metrics.memory.used / 1024 / 1024).toFixed(2)}MB</p>
        <p>Average render time: {metrics.rendering.averageRenderTime.toFixed(2)}ms</p>
        <p>Operation count: {metrics.operations.count}</p>
      </div>
      
      {renderContent()}
      {renderOptimizationTips()}
      
      <button onClick={handleDataProcessing}>Process Data</button>
    </div>
  );
}
```

2. **Use utility functions for specific measurements**:

```javascript
import { 
  measureFunction, 
  createRenderTracker, 
  recordMemoryUsage,
  debounce,
  throttle
} from '@vibing-ai/sdk/common/performance';

// Measure synchronous function execution time
function calculateTotal(items) {
  const { result, time } = measureFunction(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, 'calculateTotal');
  
  console.log(`Calculation took ${time}ms`);
  return result;
}

// Track component render time
function ExpensiveComponent() {
  const tracker = createRenderTracker('ExpensiveComponent', { 
    debug: true,
    warnThreshold: 10 // ms
  });
  
  tracker.start();
  
  // Component logic here
  
  tracker.end();
  
  return (
    <div>{/* Component content */}</div>
  );
}

// Track memory changes
function MemoryIntensiveOperation() {
  const before = recordMemoryUsage();
  
  // Do memory-intensive work
  const result = processLargeDataset();
  
  const after = recordMemoryUsage();
  console.log(`Memory usage increased by ${(after.used - before.used) / 1024 / 1024}MB`);
  
  return result;
}

// Use debounce for expensive handlers
const debouncedSearch = debounce((query) => {
  // Expensive search operation
  performSearch(query);
}, 300);

// Use throttle for frequently triggered events
const throttledScroll = throttle(() => {
  // Update UI based on scroll position
  updateScrollPosition();
}, 100);
```

## Measuring Performance

Objective measurements help identify bottlenecks and validate optimizations.

### Tools and Techniques

1. **Use the built-in performance monitoring**:

```javascript
import { useResourceMonitor } from '@vibing-ai/sdk/common/performance';

function PerformanceMonitoring() {
  const { metrics } = useResourceMonitor({ debug: true });
  
  // Log metrics to console in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metrics:', metrics);
    }
  }, [metrics]);
  
  // Component implementation
}
```

2. **Implement custom benchmarking**:

```javascript
function runBenchmark(operation, iterations = 100) {
  const times = [];
  
  // Warm-up
  operation();
  
  // Timed iterations
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    operation();
    times.push(performance.now() - start);
  }
  
  // Calculate statistics
  const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  return { avg, min, max, times };
}

// Example usage
const result = runBenchmark(() => {
  // Operation to benchmark
  sortLargeArray(data);
});

console.log(`Average: ${result.avg.toFixed(2)}ms, Min: ${result.min.toFixed(2)}ms, Max: ${result.max.toFixed(2)}ms`);
```

3. **Use React DevTools Profiler** for component performance:

```javascript
// In development, wrap key sections with Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id, // the "id" prop of the Profiler tree
  phase, // "mount" or "update"
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) {
  console.log(`${id} render time (${phase}): ${actualDuration.toFixed(2)}ms`);
}

function App() {
  return (
    <div>
      <Profiler id="Navigation" onRender={onRenderCallback}>
        <Navigation />
      </Profiler>
      
      <Profiler id="MainContent" onRender={onRenderCallback}>
        <MainContent />
      </Profiler>
      
      <Profiler id="Sidebar" onRender={onRenderCallback}>
        <Sidebar />
      </Profiler>
    </div>
  );
}
```

## Troubleshooting Common Issues

Solutions to common performance problems encountered in Vibing AI SDK applications.

### Memory Leaks

**Symptoms:** Increasing memory usage over time, degraded performance, eventual crashes.

**Solutions:**

1. Check for unremoved event listeners:

```javascript
// Incorrect - missing cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // Missing cleanup!
}, []);

// Correct - with cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

2. Verify memory cleanup with subscriptions:

```javascript
// Incorrect - missing unsubscribe
useEffect(() => {
  const subscription = events.subscribe('event', handler);
  // Missing unsubscribe!
}, []);

// Correct - with unsubscribe
useEffect(() => {
  const unsubscribe = events.subscribe('event', handler);
  return () => {
    unsubscribe();
  };
}, []);
```

3. Check for uncleaned memory items:

```javascript
// Incorrect - missing cleanup
useEffect(() => {
  async function loadData() {
    const data = await fetchLargeData();
    await memory.set('large:data', data);
  }
  loadData();
  // Missing cleanup!
}, []);

// Correct - with cleanup
useEffect(() => {
  async function loadData() {
    const data = await fetchLargeData();
    await memory.set('large:data', data);
  }
  loadData();
  
  return async () => {
    await memory.remove('large:data');
  };
}, []);
```

### Slow Initial Load

**Symptoms:** Application takes a long time to become interactive.

**Solutions:**

1. Implement code splitting:

```javascript
// Before - all imported synchronously
import HeavyComponentA from './HeavyComponentA';
import HeavyComponentB from './HeavyComponentB';
import HeavyComponentC from './HeavyComponentC';

// After - lazy loading
const HeavyComponentA = lazy(() => import('./HeavyComponentA'));
const HeavyComponentB = lazy(() => import('./HeavyComponentB'));
const HeavyComponentC = lazy(() => import('./HeavyComponentC'));
```

2. Implement progressive loading:

```javascript
function App() {
  const [coreLoaded, setCoreLoaded] = useState(false);
  const [extrasLoaded, setExtrasLoaded] = useState(false);
  
  useEffect(() => {
    // Load core functionality immediately
    setCoreLoaded(true);
    
    // Defer loading of extra features
    const timer = setTimeout(() => {
      setExtrasLoaded(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div>
      {coreLoaded ? <CoreFunctionality /> : <CoreLoader />}
      {extrasLoaded ? <ExtraFeatures /> : <div>Loading additional features...</div>}
    </div>
  );
}
```

### Render Performance

**Symptoms:** UI feels sluggish, especially during interactions or with large datasets.

**Solutions:**

1. Implement virtualization for long lists:

```javascript
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <div>Item {index}: {items[index].name}</div>
    </div>
  );
  
  return (
    <List
      height={500}
      width="100%"
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </List>
  );
}
```

2. Avoid expensive re-renders with React.memo and useCallback:

```javascript
import React, { useCallback } from 'react';

const ExpensiveItem = React.memo(function ExpensiveItem({ item, onSelect }) {
  return (
    <div onClick={() => onSelect(item.id)}>
      {/* Complex rendering */}
    </div>
  );
});

function ItemList({ items }) {
  const handleSelect = useCallback((id) => {
    // Handle selection
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <ExpensiveItem
          key={item.id}
          item={item}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
```

3. Optimize conditional rendering:

```javascript
// Inefficient - constantly recalculates the filtered list
function FilteredList({ items, filter }) {
  const filteredItems = items.filter(item => item.name.includes(filter));
  
  return (
    <div>
      {filteredItems.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}

// Optimized - memoizes the filtered list
function FilteredList({ items, filter }) {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.includes(filter));
  }, [items, filter]);
  
  return (
    <div>
      {filteredItems.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## Performance Review Checklist

Use this checklist before deploying your application to ensure optimal performance:

### Memory
- [ ] Event listeners are properly cleaned up
- [ ] Large data objects are removed when no longer needed
- [ ] No memory leaks detected with the resource monitor
- [ ] Subscriptions to events/observables are unsubscribed

### Rendering
- [ ] Components use React.memo where appropriate
- [ ] Lists implement pagination or virtualization for large datasets
- [ ] Expensive calculations are memoized
- [ ] Event handlers use useCallback when passed to child components

### Code Loading
- [ ] Large components are lazy-loaded
- [ ] Route-based code splitting is implemented
- [ ] Non-critical resources are loaded after initial render

### State Management
- [ ] Related state updates are batched
- [ ] Complex state logic uses useReducer
- [ ] Global state is minimized and structured efficiently 

### Miscellaneous
- [ ] Network requests are cached appropriately
- [ ] Expensive operations are debounced or throttled
- [ ] Critical user paths are optimized for speed
- [ ] Performance monitoring is implemented

### Measurement
- [ ] Initial load time is within acceptable limits
- [ ] Time to interactive is within acceptable limits
- [ ] Render times for key components are monitored
- [ ] Memory usage stays within acceptable limits 

## Bundle Size Optimization

Keeping your bundle size small is critical for faster application load times and better overall performance, especially for web applications.

### Using SDK Entry Points

The Vibing AI SDK provides specialized entry points to import only what you need:

```javascript
// Full SDK (largest bundle)
import { createApp, createPlugin } from '@vibing-ai/sdk';

// App-only functionality (smaller bundle)
import { createApp } from '@vibing-ai/sdk/app';

// Plugin-only functionality (smaller bundle)
import { createPlugin } from '@vibing-ai/sdk/plugin';

// Agent-only functionality (smaller bundle)
import { createAgent } from '@vibing-ai/sdk/agent';

// Just core utilities (smallest bundle)
import { createPermissions } from '@vibing-ai/sdk/core';
```

Using these specialized entry points can significantly reduce your application's bundle size by including only the code you need.

### Import Optimization

When importing from the SDK, import only the specific components and functions you need:

```javascript
// Bad: Imports everything, increases bundle size
import * as VibingSDK from '@vibing-ai/sdk';
const app = VibingSDK.createApp(options);

// Good: Imports only what's needed, reduces bundle size
import { createApp } from '@vibing-ai/sdk';
const app = createApp(options);
```

### Dynamic Imports

For features that aren't needed immediately, consider using dynamic imports:

```javascript
// Import heavy components only when needed
const loadModalSurface = async () => {
  const { createModalSurface } = await import('@vibing-ai/sdk/surfaces/modal');
  return createModalSurface(options);
};

// When user clicks button
button.addEventListener('click', async () => {
  const modalSurface = await loadModalSurface();
  modalSurface.show();
});
```

### Measuring Bundle Size

To analyze your application's bundle size:

1. Run the SDK bundle analyzer:
   ```bash
   npm run analyze
   ```

2. This will generate a `bundle-analysis.html` file with a visual breakdown of your bundle.

3. Look for large dependencies or unused modules that could be optimized.

### Bundle Size Budgets

Consider setting bundle size budgets for your application:

```javascript
// webpack.config.js example
module.exports = {
  // ... other config
  performance: {
    hints: 'warning',
    maxAssetSize: 250000, // 250kb
    maxEntrypointSize: 400000, // 400kb
  }
};
```

This warns you when bundles exceed the specified size limits, helping maintain performance discipline. 