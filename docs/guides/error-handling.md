# Error Handling Guide for Vibing AI SDK

This guide provides a comprehensive overview of error handling in the Vibing AI SDK, including error types, best practices, and examples for common error scenarios.

## Table of Contents

- [Error Class Hierarchy](#error-class-hierarchy)
- [Error Types](#error-types)
- [Best Practices](#best-practices)
- [Creating Custom Errors](#creating-custom-errors)
- [Error Handling Patterns](#error-handling-patterns)
- [Debugging Common Errors](#debugging-common-errors)
- [Error Logging and Reporting](#error-logging-and-reporting)
- [Troubleshooting](#troubleshooting)

## Error Class Hierarchy

The Vibing AI SDK uses a consistent error hierarchy to make error handling predictable and easy to manage:

```
Error (JavaScript built-in)
└── SDKError (Base class for all SDK errors)
    ├── ValidationError
    ├── PermissionError
    ├── NetworkError
    ├── TimeoutError
    ├── NotFoundError
    └── ConfigurationError
```

All SDK-specific errors inherit from the base `SDKError` class, making it easy to catch and handle all SDK errors with a single catch block when needed.

## Error Types

### SDKError

The base class for all SDK-specific errors.

**Properties:**
- `code`: Unique error code string
- `statusCode`: HTTP status code equivalent (if applicable)
- `context`: Additional contextual data
- `retryable`: Whether the operation can be retried

**Example of how it's thrown:**
```typescript
throw new SDKError("An unexpected error occurred in the SDK", {
  code: "UNEXPECTED_ERROR",
  statusCode: 500,
  context: { operationId: "123" }
});
```

**Example of handling:**
```typescript
try {
  // SDK operation
} catch (error) {
  if (error instanceof SDKError) {
    console.error(`SDK Error [${error.code}]: ${error.message}`);
    // Handle SDK-specific error
  } else {
    console.error("Unexpected error:", error);
    // Handle unexpected error
  }
}
```

**Common causes:**
- Generic errors that don't fit other categories
- Internal SDK errors

### ValidationError

Used when input validation fails.

**Properties:**
- All SDKError properties
- `validationErrors`: Record of field-specific validation errors

**Example of how it's thrown:**
```typescript
throw new ValidationError("Invalid plugin configuration", {
  name: ["Name is required", "Name must be at least 3 characters"],
  version: ["Version must follow semver format"]
});
```

**Example of handling:**
```typescript
try {
  await createPlugin(config);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation failed:");
    for (const [field, messages] of Object.entries(error.validationErrors)) {
      console.error(`- ${field}: ${messages.join(", ")}`);
    }
    // Update form with validation errors
  }
}
```

**Common causes:**
- Missing required fields
- Incorrect data formats
- Value constraints violations

### PermissionError

Thrown when an operation lacks necessary permissions.

**Properties:**
- All SDKError properties
- `requiredPermission`: The permission that was required

**Example of how it's thrown:**
```typescript
throw new PermissionError("Cannot access user data", "user.data.read", {
  statusCode: 403
});
```

**Example of handling:**
```typescript
try {
  await agent.readUserData();
} catch (error) {
  if (error instanceof PermissionError) {
    console.error(`Missing permission: ${error.requiredPermission}`);
    // Request permission or show permission explanation
    await requestPermission(error.requiredPermission);
  }
}
```

**Common causes:**
- Missing permissions in manifest
- User denied permission
- Attempting to access restricted resources

### NetworkError

Used for communication and network-related issues.

**Properties:**
- All SDKError properties (typically with `retryable: true`)

**Example of how it's thrown:**
```typescript
throw new NetworkError("Failed to connect to API", {
  code: "API_CONNECTION_FAILED",
  context: { endpoint: "/api/v1/data" }
});
```

**Example of handling:**
```typescript
try {
  await api.fetchData();
} catch (error) {
  if (error instanceof NetworkError) {
    console.error("Network error:", error.message);
    // Show offline mode or retry option
    if (error.retryable) {
      await retry(() => api.fetchData(), { maxRetries: 3 });
    }
  }
}
```

**Common causes:**
- API server down
- Network connectivity issues
- CORS errors
- Rate limiting

### TimeoutError

Thrown when operations take too long to complete.

**Properties:**
- All SDKError properties
- `timeoutMs`: The timeout duration in milliseconds

**Example of how it's thrown:**
```typescript
throw new TimeoutError("Operation timed out", 5000, {
  context: { operationId: "fetch-data-123" }
});
```

**Example of handling:**
```typescript
try {
  await api.longRunningOperation();
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error(`Operation timed out after ${error.timeoutMs}ms`);
    // Offer to retry with longer timeout
    if (confirm("Operation timed out. Try again with longer timeout?")) {
      await api.longRunningOperation({ timeout: error.timeoutMs * 2 });
    }
  }
}
```

**Common causes:**
- Slow network connections
- Complex operations taking too long
- Server overload
- Large data transfers

### NotFoundError

Used when requested resources cannot be found.

**Properties:**
- All SDKError properties
- `resource`: The type of resource that was not found
- `identifier`: The identifier that was used for the search

**Example of how it's thrown:**
```typescript
throw new NotFoundError("Plugin not found", "plugin", "cool-plugin-123");
```

**Example of handling:**
```typescript
try {
  const plugin = await getPlugin(pluginId);
} catch (error) {
  if (error instanceof NotFoundError && error.resource === "plugin") {
    console.error(`Plugin ${error.identifier} not found`);
    // Show plugin installation option or fallback
    await showPluginInstallPrompt(error.identifier);
  }
}
```

**Common causes:**
- Invalid IDs or references
- Deleted resources
- Access to non-existent paths
- Typos in resource identifiers

### ConfigurationError

Thrown for SDK configuration issues.

**Properties:**
- All SDKError properties

**Example of how it's thrown:**
```typescript
throw new ConfigurationError("Invalid SDK configuration", {
  context: { invalidSetting: "theme" }
});
```

**Example of handling:**
```typescript
try {
  await initializeSDK(config);
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error("Configuration error:", error.message);
    // Show configuration guide or wizard
    showConfigurationHelp(error.context);
  }
}
```

**Common causes:**
- Missing required configuration
- Incompatible settings
- Invalid API keys
- Environment setup issues

## Best Practices

### General Error Handling Principles

1. **Be specific with catches**: Catch specific error types when possible rather than catching all errors.

   ```typescript
   // Good
   try {
     await operation();
   } catch (error) {
     if (error instanceof ValidationError) {
       // Handle validation errors
     } else if (error instanceof NetworkError) {
       // Handle network errors
     } else {
       // Handle other errors
     }
   }
   ```

2. **Preserve context**: When re-throwing errors, use the `cause` option to maintain the error chain.

   ```typescript
   try {
     await operation();
   } catch (error) {
     throw new SDKError("Higher-level operation failed", { 
       cause: error,
       context: { additionalInfo: "context" }
     });
   }
   ```

3. **Handle errors at the appropriate level**: Handle errors where you have enough context to make a proper recovery decision.

4. **Use the utility functions**: The SDK provides helper functions for common patterns.

   ```typescript
   // Retry on failure
   const result = await retry(
     () => fetchData(),
     { maxRetries: 3, retryDelay: 500 }
   );
   
   // Provide fallback on error
   const data = await fallback(
     () => fetchData(),
     defaultData
   );
   ```

### Context-Specific Best Practices

#### For Plugin Developers

- Always validate inputs before processing to prevent unexpected errors
- Handle permissions proactively by checking before operations that require them
- Provide clear error messages that guide users toward solutions

#### For App Developers

- Implement global error handlers to catch unhandled errors
- Group related operations in try/catch blocks with appropriate granularity
- Use error boundaries for component-level error handling

#### For Agent Developers

- Implement fallback behaviors when primary operations fail
- Add retry logic for network operations with appropriate backoff
- Design for graceful degradation when services are unavailable

## Creating Custom Errors

You can extend the SDK's error system with your own custom error types:

```typescript
import { SDKError } from '@vibing-ai/sdk';

export class CustomPluginError extends SDKError {
  constructor(
    message: string,
    public readonly pluginId: string,
    options = {}
  ) {
    super(message, {
      code: 'CUSTOM_PLUGIN_ERROR',
      ...options
    });
    this.pluginId = pluginId;
    
    // Set the prototype explicitly
    Object.setPrototypeOf(this, CustomPluginError.prototype);
  }
}

// Using the custom error
throw new CustomPluginError("Plugin encountered a specific error", "my-plugin-id");
```

## Error Handling Patterns

### Handling Async Operations

Use async/await with try/catch blocks for cleaner error handling:

```typescript
async function fetchAndProcessData() {
  try {
    const data = await api.fetchData();
    return processData(data);
  } catch (error) {
    if (error instanceof NetworkError) {
      // Try fallback data source
      const fallbackData = await api.fetchFromBackup();
      return processData(fallbackData);
    }
    throw error; // Re-throw other errors
  }
}
```

### Component Error Boundaries

For React components, use error boundaries to prevent the whole app from crashing:

```tsx
import { errorBoundary } from '@vibing-ai/sdk';

// Basic component
function DataDisplay({ dataId }) {
  const data = useData(dataId);
  return <div>{data.name}</div>;
}

// Wrapped with error boundary
const SafeDataDisplay = errorBoundary(
  DataDisplay,
  (error, reset) => (
    <div className="error-container">
      <p>Failed to load data: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )
);
```

> Note: errorBoundary requires React integration which must be setup separately.

### Form Validation Errors

Handle validation errors gracefully in forms:

```tsx
function SubmitForm() {
  const [errors, setErrors] = useState({});
  
  const handleSubmit = async (data) => {
    try {
      setErrors({});
      await submitData(data);
      showSuccess("Form submitted successfully!");
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.validationErrors);
        // Focus first input with error
        const firstField = Object.keys(error.validationErrors)[0];
        document.querySelector(`[name="${firstField}"]`)?.focus();
      } else {
        showError("Failed to submit form: " + error.message);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
    </form>
  );
}
```

### Permission Denial Handling

Gracefully handle and recover from permission denials:

```typescript
async function accessProtectedFeature() {
  try {
    return await api.protectedOperation();
  } catch (error) {
    if (error instanceof PermissionError) {
      const granted = await requestPermission(error.requiredPermission);
      if (granted) {
        // Retry with permission
        return await api.protectedOperation();
      } else {
        // Show alternative UI or fallback
        return getFallbackData();
      }
    }
    throw error;
  }
}
```

### Network Failure Recovery

Implement resilient network operations:

```typescript
async function fetchWithResilience() {
  return retry(
    async () => {
      try {
        return await api.fetchData();
      } catch (error) {
        if (error instanceof NetworkError) {
          // If offline, use cached data
          if (!navigator.onLine) {
            const cachedData = await cache.getData();
            if (cachedData) return cachedData;
          }
          // Otherwise let retry handle it
          throw error;
        }
        throw error;
      }
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      backoffFactor: 1.5,
      onRetry: (error, attempt) => {
        console.log(`Attempt ${attempt} failed, retrying...`);
      }
    }
  );
}
```

## Debugging Common Errors

### Common Error Codes and Their Meaning

| Error Code | Meaning | Common Causes |
|------------|---------|--------------|
| `VALIDATION_ERROR` | Input validation failed | Invalid input data, missing required fields |
| `PERMISSION_DENIED` | Insufficient permissions | Missing permissions in manifest, user denial |
| `NETWORK_ERROR` | Communication failure | Connectivity issues, server unavailable |
| `TIMEOUT_ERROR` | Operation took too long | Slow connections, server overload |
| `NOT_FOUND` | Resource doesn't exist | Invalid IDs, deleted resources |
| `CONFIGURATION_ERROR` | SDK setup issues | Invalid config, missing dependencies |
| `INITIALIZATION_ERROR` | SDK failed to initialize | Called methods before init, invalid environment |
| `INCOMPATIBLE_VERSION` | Version compatibility issue | SDK/block-kit version mismatch |

### Diagnostic Steps by Error Type

#### For ValidationError

1. Check the `validationErrors` object for field-specific errors
2. Validate your inputs against the schema before submitting
3. Verify you're using the correct data types for all fields

#### For PermissionError

1. Check your manifest.json for required permissions
2. Verify the permission was requested before the operation
3. Test with a restricted permission scope to narrow down the issue

#### For NetworkError

1. Check network connectivity
2. Verify the API endpoint is correct and accessible
3. Check for CORS issues if in a browser context
4. Look for rate limiting or throttling

#### For TimeoutError

1. Check if the operation typically takes longer than the timeout
2. Verify server health and response times
3. Consider breaking the operation into smaller chunks
4. Increase timeout settings if appropriate

#### For NotFoundError

1. Verify the resource ID is correct
2. Check if the resource still exists
3. Ensure you have proper access to the resource
4. Check for typos in resource identifiers

#### For ConfigurationError

1. Validate your configuration against the schema
2. Check for required fields in your configuration
3. Verify environment variables and API keys
4. Ensure dependencies are correctly installed

### Using Error Utilities for Debugging

The SDK provides utilities to help with debugging:

```typescript
import { formatError, getErrorCode } from '@vibing-ai/sdk';

try {
  // Perform operation
} catch (error) {
  // Format error with stack trace and context
  console.error(formatError(error, { 
    includeStack: true,
    includeContext: true
  }));
  
  // Get the error code for logging
  const errorCode = getErrorCode(error);
  analyticsService.logError(errorCode);
}
```

## Error Logging and Reporting

### Best Practices for Logging

1. **Log both error code and message**: Error codes are great for analytics, messages for debugging.

   ```typescript
   logger.error(`[${error.code}] ${error.message}`);
   ```

2. **Include context but sanitize sensitive data**: Error context helps debugging but be careful with PII.

   ```typescript
   // Remove sensitive data before logging
   const safeContext = { ...error.context };
   delete safeContext.password;
   delete safeContext.token;
   logger.error("Error context:", safeContext);
   ```

3. **Use different log levels appropriately**: Not all errors are critical.

   ```typescript
   if (error instanceof ValidationError) {
     logger.warn(`Validation failed: ${error.message}`);
   } else if (error instanceof NetworkError && error.retryable) {
     logger.info(`Retryable network error: ${error.message}`);
   } else {
     logger.error(`Critical error: ${error.message}`);
   }
   ```

4. **Add correlation IDs**: Makes it easier to trace errors across systems.

   ```typescript
   const requestId = generateRequestId();
   try {
     await performOperation(data, { requestId });
   } catch (error) {
     logger.error(`Error in request ${requestId}:`, error);
   }
   ```

### Integrating with Analytics

Track errors to improve your application:

```typescript
function trackError(error: unknown) {
  if (error instanceof SDKError) {
    analytics.track('Error', {
      errorCode: error.code,
      errorType: error.constructor.name,
      message: error.message,
      // Include non-sensitive context
      ...getSafeContext(error.context)
    });
  } else {
    analytics.track('UnknownError', {
      message: String(error)
    });
  }
}
```

### User-Facing Error Messages

Convert technical errors to user-friendly messages:

```typescript
function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return "Please check your input and try again.";
  } else if (error instanceof PermissionError) {
    return `Additional permission "${error.requiredPermission}" is needed for this action.`;
  } else if (error instanceof NetworkError) {
    return "Connection issue detected. Please check your internet connection.";
  } else if (error instanceof TimeoutError) {
    return "The operation is taking longer than expected. Please try again.";
  } else if (error instanceof NotFoundError) {
    return `The requested ${error.resource} could not be found.`;
  } else if (error instanceof ConfigurationError) {
    return "There's a configuration issue. Please contact support.";
  } else {
    return "An unexpected error occurred. Please try again later.";
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### "ValidationError: Invalid configuration"

**Problem**: The SDK configuration doesn't match the expected schema.

**Solution**: 
- Check the configuration against the documentation
- Verify required fields are present and correctly formatted
- Look for typos in property names

#### "PermissionError: Missing required permission"

**Problem**: Operation requires a permission that hasn't been granted.

**Solution**:
- Add the required permission to your manifest.json
- Request the permission before performing the operation
- Check if the user has denied the permission

#### "NetworkError: Unable to connect to API"

**Problem**: Network communication failed.

**Solution**:
- Check internet connectivity
- Verify the API endpoint is correct
- Look for CORS issues in browser environments
- Check if the service is functioning correctly

#### "TimeoutError: Operation timed out after 30000ms"

**Problem**: Operation took longer than the configured timeout.

**Solution**:
- Consider increasing the timeout for long-running operations
- Check if the operation can be optimized
- Verify the server is not overloaded

#### "NotFoundError: Plugin 'xyz' not found"

**Problem**: Attempting to access a resource that doesn't exist.

**Solution**:
- Verify the resource ID is correct
- Check if the resource still exists
- Ensure you have access to the resource

#### "ConfigurationError: SDK not initialized"

**Problem**: Attempting to use SDK features before proper initialization.

**Solution**:
- Ensure you call the initialization method first
- Verify initialization completed successfully
- Check for proper async/await usage

### Reporting Bugs

When reporting bugs related to SDK errors:

1. **Include error details**: Code, message, and stack trace if available
2. **Provide reproduction steps**: Clear steps to reproduce the issue
3. **Share SDK version**: The version you're using may be relevant
4. **Include context**: What you were trying to do when the error occurred

Report issues at: [GitHub Issues](https://github.com/vibing-ai/sdk/issues/new?template=bug_report.md)

---

## Further Reading

- [API Reference](../api-reference.md) - Detailed API documentation
- [Quick Start Guide](./quick-start.md) - Get started with the SDK
- [Best Practices](./best-practices.md) - General SDK best practices
- [Security Guide](./security.md) - Security considerations 