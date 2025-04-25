# Vibing AI SDK Best Practices

This guide outlines recommended patterns, performance considerations, security best practices, and common pitfalls to avoid when developing with the Vibing AI SDK.

## Table of Contents

- [Code Organization](#code-organization)
- [Performance Optimization](#performance-optimization)
- [Memory Management](#memory-management)
- [Security Considerations](#security-considerations)
- [Permissions](#permissions)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [User Experience](#user-experience)
- [Common Pitfalls](#common-pitfalls)

## Code Organization

### Project Structure

Organize your Vibing AI app with a clear structure:

```
my-vibing-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utility functions
│   ├── surfaces/         # Surface-specific components
│   │   ├── cards/
│   │   ├── panels/
│   │   └── modals/
│   ├── App.tsx           # Main app definition
│   └── index.ts          # Entry point
├── tests/                # Test files
├── package.json
└── tsconfig.json
```

### Component Organization

Follow these patterns for component organization:

- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Group related state and functionality together
- Use declarative component names that reflect their purpose

Example of well-organized components:

```tsx
// ProfileCard.tsx
import React from 'react';
import { createConversationCard } from '@vibing-ai/sdk/surfaces/cards';
import { useUserData } from '../hooks/useUserData';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileActions } from './ProfileActions';

export const ProfileCard: React.FC<{ userId: string }> = ({ userId }) => {
  const { userData, isLoading, error } = useUserData(userId);
  
  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorDisplay error={error} />;
  
  return createConversationCard({
    content: (
      <div className="profile-card">
        <ProfileAvatar src={userData.avatarUrl} />
        <div className="profile-info">
          <h2>{userData.name}</h2>
          <p>{userData.bio}</p>
        </div>
      </div>
    ),
    actions: <ProfileActions userId={userId} />,
    metadata: { userId, timestamp: Date.now() }
  });
};
```

### Custom Hooks

Extract reusable logic into custom hooks:

```tsx
// useUserPreferences.ts
import { useMemory } from '@vibing-ai/sdk/common/memory';
import { usePermissions } from '@vibing-ai/sdk/common/permissions';

export interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  notifications: boolean;
}

export function useUserPreferences() {
  const { request, check } = usePermissions();
  
  // Check for required permissions
  const hasPermission = check({
    type: 'memory',
    access: ['read', 'write'],
    scope: 'global'
  });
  
  // Request permissions if needed
  const ensurePermissions = async () => {
    if (!hasPermission) {
      const result = await request({
        type: 'memory',
        access: ['read', 'write'],
        scope: 'global',
        purpose: 'Store your preferences for a better experience'
      });
      
      return result.granted;
    }
    
    return true;
  };
  
  // Get preferences from memory
  const { data, set, clear } = useMemory<UserPreferences>('user:preferences', {
    scope: 'global',
    fallback: {
      theme: 'light',
      fontSize: 16,
      notifications: true
    }
  });
  
  // Update a specific preference
  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const hasAccess = await ensurePermissions();
    
    if (hasAccess) {
      set({
        ...data,
        [key]: value
      });
      return true;
    }
    
    return false;
  };
  
  return {
    preferences: data,
    updatePreference,
    resetPreferences: clear,
    hasPermission
  };
}
```

## Performance Optimization

### Memoization

Use React's memoization features to prevent unnecessary rerenders:

```tsx
import React, { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const ExpensiveComponent: React.FC<{ data: any[] }> = ({ data }) => {
  // Only recalculate when data changes
  const processedData = useMemo(() => {
    return data.map(item => expensiveTransformation(item));
  }, [data]);
  
  // Memoize event handlers
  const handleClick = useCallback(() => {
    console.log('Clicked!');
  }, []);
  
  return (
    <div onClick={handleClick}>
      {processedData.map(item => (
        <div key={item.id}>{item.value}</div>
      ))}
    </div>
  );
};

// Use React.memo for component memoization
const MemoizedComponent = React.memo(ExpensiveComponent);
```

### Batch Updates

Batch related state updates to minimize rerenders:

```tsx
// Instead of multiple separate updates:
setLoading(true);
setData(newData);
setError(null);
setLoading(false);

// Use a single state object:
setState({
  loading: false, 
  data: newData, 
  error: null
});
```

### Lazy Loading

Implement lazy loading for components not immediately needed:

```tsx
import React, { lazy, Suspense } from 'react';

// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

const LazyLoadExample: React.FC = () => {
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
};
```

## Memory Management

### Cleanup Resources

Always clean up resources to prevent memory leaks:

```tsx
import { useEvents } from '@vibing-ai/sdk/common/events';
import { useEffect } from 'react';

function EventComponent() {
  const { subscribe } = useEvents();
  
  useEffect(() => {
    // Subscribe to events
    const unsubscribeA = subscribe('event:a', handleEventA);
    const unsubscribeB = subscribe('event:b', handleEventB);
    
    // Clean up subscriptions when component unmounts
    return () => {
      unsubscribeA();
      unsubscribeB();
    };
  }, []);
}
```

### Memory Scope Selection

Choose the appropriate scope for your memory items:

- **Conversation** scope for data relevant only to the current conversation
- **Project** scope for data shared across conversations in the same project
- **Global** scope only for truly user-wide settings

```tsx
// User preferences - appropriate for global scope
const { data: preferences } = useMemory('user:preferences', {
  scope: 'global',
  fallback: defaultPreferences
});

// Project-specific data
const { data: projectData } = useMemory('project:data', {
  scope: 'project',
  fallback: {}
});

// Conversation-specific data
const { data: conversationContext } = useMemory('conversation:context', {
  scope: 'conversation',
  fallback: {}
});
```

### Memory Cleanup

Clean up memory items when they're no longer needed:

```tsx
const { clear } = useMemory('temporary:data', {
  scope: 'conversation'
});

// Clean up when done
useEffect(() => {
  return () => {
    clear();
  };
}, []);
```

## Security Considerations

### Input Validation

Always validate user input:

```tsx
const handleSubmit = (data) => {
  // Validate input before processing
  if (!data.name || data.name.length > 100) {
    throw new Error('Invalid name');
  }
  
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
    throw new Error('Invalid email');
  }
  
  // Process validated data
  processUserData(data);
};
```

### Sanitize HTML Content

When rendering user-generated content:

```tsx
import DOMPurify from 'dompurify';

const UserContent: React.FC<{ content: string }> = ({ content }) => {
  // Sanitize HTML to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content);
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};
```

### Secure Memory Storage

Don't store sensitive information in memory without encryption:

```tsx
import { encryptData, decryptData } from '../utils/encryption';

// Store encrypted data
const storeSecureData = (data) => {
  const encrypted = encryptData(data);
  
  // Store encrypted value
  const { set } = useMemory('secure:data', {
    scope: 'conversation'
  });
  
  set({ value: encrypted });
};

// Retrieve and decrypt
const getSecureData = () => {
  const { data } = useMemory('secure:data', {
    scope: 'conversation'
  });
  
  if (!data?.value) return null;
  
  return decryptData(data.value);
};
```

## Permissions

### Request Only What You Need

Follow the principle of least privilege:

```tsx
// BAD: Requesting overly broad permissions
const { request } = usePermissions();
request({
  type: 'memory',
  access: ['read', 'write'],
  scope: 'global', // Too broad
  purpose: 'App functionality'  // Too vague
});

// GOOD: Request only what you need with specific purpose
request({
  type: 'memory',
  access: ['read'],  // Only read if that's all you need
  scope: 'conversation',  // Limit to conversation if possible
  purpose: 'Store your task list for this session',
  explanation: 'This allows us to remember your tasks until you close the conversation'
});
```

### Check Before Using

Always check permissions before attempting to use a feature:

```tsx
const { check } = usePermissions();

const performAction = async () => {
  const hasPermission = check({
    type: 'memory',
    access: 'write',
    scope: 'conversation'
  });
  
  if (hasPermission) {
    // Proceed with action
    await writeData();
  } else {
    // Handle lack of permission
    showPermissionRequired();
  }
};
```

### Provide Clear Explanation

Always explain why your app needs each permission:

```tsx
const requestNotificationPermission = async () => {
  const result = await request({
    type: 'notifications',
    access: ['show'],
    purpose: 'Send you task reminders',
    explanation: 'We only send notifications for tasks with deadlines you\'ve set'
  });
  
  return result.granted;
};
```

## Error Handling

### Graceful Degradation

Handle errors gracefully and provide fallbacks:

```tsx
const DataComponent: React.FC = () => {
  const { data, loading, error } = useApiData();
  
  if (loading) return <LoadingSpinner />;
  
  if (error) {
    // Log the error
    console.error('API Error:', error);
    
    // Show user-friendly error message
    return (
      <ErrorDisplay 
        message="We couldn't load your data right now." 
        retryAction={refetchData}
      />
    );
  }
  
  if (!data || data.length === 0) {
    return <EmptyState message="No data found" />;
  }
  
  return <DataTable data={data} />;
};
```

### Try/Catch Blocks

Use try/catch blocks for error handling:

```tsx
const handleImportData = async (file) => {
  try {
    setLoading(true);
    const data = await parseFile(file);
    await saveData(data);
    showSuccessNotification('Data imported successfully');
  } catch (error) {
    if (error.code === 'INVALID_FORMAT') {
      showErrorNotification('Invalid file format. Please use CSV or JSON.');
    } else if (error.code === 'TOO_LARGE') {
      showErrorNotification('File too large. Maximum size is 5MB.');
    } else {
      showErrorNotification('An error occurred while importing the data.');
      console.error('Import error:', error);
    }
  } finally {
    setLoading(false);
  }
};
```

### Boundary Components

Use error boundaries to catch rendering errors:

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Component error:', error, info);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h3>Something went wrong</h3>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary
  fallback={<FallbackComponent />}
  onError={(error, info) => logErrorToService(error, info)}
>
  <YourComponent />
</ErrorBoundary>
```

## Testing

### Test Critical Paths

Focus testing on critical user paths:

```jsx
// Example test with Jest and React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryProvider } from '@vibing-ai/sdk/testing';
import { Counter } from './Counter';

describe('Counter', () => {
  test('should increment count when button is clicked', () => {
    // Mock memory provider
    render(
      <MemoryProvider initialState={{
        'counter:state': { count: 0 }
      }}>
        <Counter />
      </MemoryProvider>
    );
    
    // Initial state
    expect(screen.getByText('Counter: 0')).toBeInTheDocument();
    
    // Click increment button
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    
    // Check updated state
    expect(screen.getByText('Counter: 1')).toBeInTheDocument();
  });
});
```

### Mock Vibing AI SDK Components

Use mocks for SDK components in tests:

```jsx
// Create a mock for the Vibing AI SDK
jest.mock('@vibing-ai/sdk/common/memory', () => ({
  useMemory: jest.fn().mockImplementation((key, options) => ({
    data: { count: 0 },
    set: jest.fn(),
    loading: false,
    error: null
  }))
}));

// Test with mocked SDK
test('component renders with mocked memory', () => {
  render(<YourComponent />);
  // Write your assertions
});
```

### Integration Testing

Test integration between components:

```jsx
test('activity log updates when counter changes', async () => {
  // Render components that communicate via events
  render(
    <VibingTestProvider>
      <Counter />
      <ActivityLog />
    </VibingTestProvider>
  );
  
  // Trigger action
  fireEvent.click(screen.getByRole('button', { name: '+' }));
  
  // Verify the effect
  await screen.findByText(/Counter changed to 1/);
  expect(screen.getByText(/Counter changed to 1/)).toBeInTheDocument();
});
```

## User Experience

### Loading States

Always show loading states:

```tsx
const DataView: React.FC = () => {
  const { data, loading, error } = useData();
  
  return (
    <div className="data-view">
      {loading && <LoadingIndicator />}
      
      {error && <ErrorMessage error={error} />}
      
      {!loading && !error && data && (
        <div className="data-content">
          {/* Render data here */}
        </div>
      )}
    </div>
  );
};
```

### Progressive Enhancement

Implement features with progressive enhancement:

```tsx
const EnhancedComponent: React.FC = () => {
  const { data: capabilities } = useCapabilities();
  
  return (
    <div>
      {/* Base functionality always available */}
      <BasicFeature />
      
      {/* Enhanced feature only if available */}
      {capabilities.advancedVisualizations && (
        <AdvancedVisualization />
      )}
      
      {/* Fallback if feature not available */}
      {!capabilities.advancedVisualizations && (
        <SimpleFallbackVisualization />
      )}
    </div>
  );
};
```

### Responsive Design

Ensure your UI works across different screen sizes:

```tsx
const ResponsivePanel: React.FC = () => {
  const { width } = useWindowSize();
  
  return createContextPanel({
    title: 'Information',
    content: <PanelContent />,
    // Adjust width based on screen size
    width: width < 768 ? '100%' : 320
  });
};
```

## Common Pitfalls

### Memory Scope Confusion

Problem: Using the wrong memory scope, leading to unexpected data loss or leakage.

```tsx
// INCORRECT: Using global scope for temporary data
const { data, set } = useMemory('temporary:data', {
  scope: 'global' // Wrong scope!
});

// CORRECT: Using appropriate scope
const { data, set } = useMemory('temporary:data', {
  scope: 'conversation' // Correct for temporary data
});
```

### Permission Over-requesting

Problem: Requesting too many permissions at once, leading to user rejection.

```tsx
// INCORRECT: Requesting too much at once
const requestAllPermissions = async () => {
  await request({
    type: 'memory',
    access: ['read', 'write'],
    scope: 'global'
  });
  
  await request({
    type: 'notifications',
    access: ['show']
  });
  
  await request({
    type: 'location',
    access: ['read']
  });
};

// CORRECT: Request permissions when needed
const requestMemoryPermission = async () => {
  const result = await request({
    type: 'memory',
    access: ['read', 'write'],
    scope: 'conversation',
    purpose: 'Store your settings for this session'
  });
  
  return result.granted;
};

// Request location only when actually needed
const handleLocationFeature = async () => {
  const result = await request({
    type: 'location',
    access: ['read'],
    purpose: 'Show nearby services'
  });
  
  if (result.granted) {
    // Use location
  } else {
    // Provide alternative
  }
};
```

### Forgetting to Unsubscribe

Problem: Not unsubscribing from events, leading to memory leaks or stale data.

```tsx
// INCORRECT: No cleanup
useEffect(() => {
  const { subscribe } = useEvents();
  subscribe('event:name', handleEvent);
  // Missing cleanup!
}, []);

// CORRECT: Proper cleanup
useEffect(() => {
  const { subscribe } = useEvents();
  const unsubscribe = subscribe('event:name', handleEvent);
  
  return () => {
    unsubscribe();
  };
}, []);
```

### Not Handling Errors

Problem: Failing to handle errors, leading to broken UI or silent failures.

```tsx
// INCORRECT: No error handling
const fetchData = async () => {
  const response = await fetch('/api/data');
  const data = await response.json();
  setData(data);
};

// CORRECT: Proper error handling
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    setData(data);
    setError(null);
  } catch (err) {
    setError(err.message || 'Failed to fetch data');
    setData(null);
  } finally {
    setLoading(false);
  }
};
```

### Not Following the Component Lifecycle

Problem: Performing operations outside the appropriate lifecycle phase.

```tsx
// INCORRECT: Direct DOM manipulation in render
const BadComponent: React.FC = () => {
  // Direct manipulation during render - BAD!
  document.title = 'New Page Title';
  
  return <div>Content</div>;
};

// CORRECT: Using appropriate lifecycle hooks
const GoodComponent: React.FC = () => {
  useEffect(() => {
    // Side effect in the appropriate lifecycle phase
    document.title = 'New Page Title';
    
    return () => {
      // Cleanup when component unmounts
      document.title = 'Default Title';
    };
  }, []);
  
  return <div>Content</div>;
};
```

## Conclusion

Following these best practices will help you build high-quality, performant, and secure applications with the Vibing AI SDK. Remember that well-structured code, appropriate permission handling, and good error management are key to creating a great user experience.

For more specific guidance, refer to the [API Reference](../api-reference.md) or join our [developer community](https://community.vibing.ai) to connect with other developers. 