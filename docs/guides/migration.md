# Migration Guide

This guide provides detailed instructions for migrating between different versions of the Vibing AI SDK. It covers breaking changes, deprecated features, and recommended migration paths.

## Table of Contents

- [Migrating to v1.0.0](#migrating-to-v100)
- [Migrating to v0.9.0](#migrating-to-v090)
- [Migrating to v0.8.0](#migrating-to-v080)
- [General Migration Strategy](#general-migration-strategy)
- [Automated Migration Tools](#automated-migration-tools)

## Migrating to v1.0.0

Version 1.0.0 represents the first stable release of the Vibing AI SDK. This section covers the changes required when upgrading from the latest beta version (v0.9.x) to v1.0.0.

### Breaking Changes

| Feature | Change | Migration Path |
|---------|--------|----------------|
| `createApp` return type | Now returns chainable API | Replace `.onInitialize(fn)` with `app.onInitialize(fn).onRender(...)` |
| Error handling | New error class hierarchy | Update catch blocks to use new error types |
| Memory API | Expanded return object | Check for new properties in destructuring |
| Event system | New event priorities | Review event handlers for priority settings |

### Deprecated Features

The following features are deprecated in v1.0.0 and will be removed in a future version:

- `legacyMode` config option - Use standard mode with compatibility options
- `useSimpleMemory` hook - Use `useMemory` with appropriate options
- `createLegacyPlugin` - Use `createPlugin` with legacy compatibility flag

### API Changes

#### App Creation

**Before (v0.9.x):**

```typescript
import { createApp } from '@vibing-ai/sdk';

const app = createApp({
  name: 'My App',
  version: '0.1.0'
});

app.onInitialize(() => {
  console.log('App initialized');
});
```

**After (v1.0.0):**

```typescript
import { createApp } from '@vibing-ai/sdk';

const app = createApp({
  name: 'My App',
  version: '0.1.0'
}).onInitialize(() => {
  console.log('App initialized');
});
```

#### Error Handling

**Before (v0.9.x):**

```typescript
try {
  // Some operation
} catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    // Handle permission error
  } else if (error.code === 'NETWORK_ERROR') {
    // Handle network error
  }
}
```

**After (v1.0.0):**

```typescript
import { PermissionError, NetworkError, isSDKError } from '@vibing-ai/sdk/common/errors';

try {
  // Some operation
} catch (error) {
  if (error instanceof PermissionError) {
    // Handle permission error
    console.error(`Permission denied: ${error.permission.type}`);
  } else if (error instanceof NetworkError) {
    // Handle network error
    console.error(`Network error (${error.statusCode}): ${error.message}`);
  } else if (isSDKError(error)) {
    // Handle other SDK errors
    console.error(`SDK error: ${error.code} - ${error.message}`);
  } else {
    // Handle generic errors
    console.error('Unknown error:', error);
  }
}
```

#### Memory API

**Before (v0.9.x):**

```typescript
const { data, loading, error, set, clear } = useMemory('user-preferences');
```

**After (v1.0.0):**

```typescript
const { 
  data, 
  loading, 
  error, 
  set, 
  clear, 
  refresh,  // New method
  metadata  // New property
} = useMemory('user-preferences');

// You can now refresh data on demand
refresh();

// Access metadata about the memory item
console.log(`Last updated: ${metadata.lastUpdated}`);
```

### Version Compatibility

| Package | Compatible Versions |
|---------|---------------------|
| @vibing-ai/sdk | 1.0.0+ |
| @vibing-ai/block-kit | 1.0.0+ |
| @vibing-ai/cli | 1.0.0+ |

## Migrating to v0.9.0

Version 0.9.0 was the final beta release before the stable 1.0.0 release. This section covers changes needed when upgrading from v0.8.x to v0.9.0.

### Breaking Changes

| Feature | Change | Migration Path |
|---------|--------|----------------|
| Plugin API | Restructured plugin creation | Update import paths and configuration |
| Surface rendering | New rendering approach | Modify render callbacks |
| Memory scopes | Enhanced scope system | Update memory scope configuration |

### Deprecated Features

- `createBasicPlugin` - Use `createPlugin` instead
- `useGlobalState` - Use `useMemory` with `scope: 'global'`
- Legacy event system - Use new `useEvents` hook

### API Changes

#### Plugin Creation

**Before (v0.8.x):**

```typescript
import { createBasicPlugin } from '@vibing-ai/sdk/plugins';

const plugin = createBasicPlugin({
  name: 'My Plugin',
  version: '0.1.0'
});
```

**After (v0.9.0):**

```typescript
import { createPlugin } from '@vibing-ai/sdk/plugins';

const plugin = createPlugin({
  name: 'My Plugin',
  version: '0.1.0'
});
```

## Migrating to v0.8.0

[Details for migrating to v0.8.0...]

## General Migration Strategy

When migrating between versions of the Vibing AI SDK, follow these general steps:

1. **Review the changelog** for the target version to understand all changes
2. **Update dependencies** to compatible versions
3. **Address breaking changes** first, focusing on compilation errors
4. **Update deprecated features** to use recommended alternatives
5. **Test thoroughly** after migration, especially error handling paths
6. **Leverage new features** once the basic migration is complete

### Step-by-Step Approach

1. **Install new version**:
   ```bash
   npm install @vibing-ai/sdk@latest
   ```

2. **Run type checking**:
   ```bash
   npm run typecheck
   ```

3. **Address errors** starting with imports and major API changes

4. **Test incrementally** after addressing each category of changes

5. **Update dependencies** to compatible versions:
   ```bash
   npm install @vibing-ai/block-kit@latest @vibing-ai/cli@latest
   ```

## Automated Migration Tools

For larger codebases, we provide automated migration tools to help with the transition:

### Migration CLI

Install the migration CLI:

```bash
npm install -g @vibing-ai/migration-cli
```

Run the migration tool:

```bash
vibing-migrate --from 0.9.0 --to 1.0.0
```

### Codemod Scripts

For targeted transformations, we provide codemod scripts:

```bash
npx @vibing-ai/codemods run --transform update-error-handling
```

Available transformations:
- `update-error-handling`: Updates error handling to use new error classes
- `update-app-chaining`: Updates app initialization to use chaining API
- `update-memory-hooks`: Updates memory hook usage for v1.0.0

For more information about our migration tools, see the [Migration Tools Documentation](../migration-tools.md). 