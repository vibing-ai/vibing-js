# Comprehensive Test Fix Plan

## Root Cause Analysis

After investigating the failing tests, we've identified several key issues:

1. **Structural Mismatch**: The tests reference a `src/common` directory and other paths that don't exist in the current codebase
2. **React Compatibility Issues**: Version mismatches between React, React DOM, and testing libraries
3. **JSX Configuration Issues**: Tests with JSX syntax aren't being properly processed
4. **Missing Mock Files**: Some test mocks don't match the expected format or location
5. **TypeScript Configuration**: The TypeScript configuration doesn't properly support JSX in test files

## Step 1: Fix Dependencies and Configuration

### 1.1 Update React Dependencies
```bash
# Install compatible versions of React and React DOM
npm install react@18.2.0 react-dom@18.2.0 --save-dev --legacy-peer-deps

# Install react testing library dependencies consistently
npm install @testing-library/react@13.4.0 @testing-library/user-event@14.4.3 --save-dev --legacy-peer-deps
```

### 1.2 Update TypeScript Configuration
Update `tsconfig.test.json`:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "allowJs": true,
    "isolatedModules": true,
    "types": ["jest", "node", "@testing-library/jest-dom"]
  },
  "include": ["src", "tests"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3 Update Jest Configuration
Update `jest.config.cjs`:
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.types.ts',
    '!src/**/types.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 75,
      statements: 75,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react$': 'react',
    '^react-dom$': 'react-dom'
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
```

## Step 2: Create Missing Directories and Files

### 2.1 Create Common Directory Structure
```bash
# Create common directory structure
mkdir -p src/common/events
mkdir -p src/common/memory
mkdir -p src/common/permissions
mkdir -p src/common/app
mkdir -p src/common/memory/memoryStorage
mkdir -p src/common/permissions/permissionManager
mkdir -p src/common/super-agent
```

### 2.2 Create Stub Implementation Files

#### Create `src/common/types.ts`:
```typescript
export enum PermissionType {
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  GEOLOCATION = 'geolocation',
  NOTIFICATIONS = 'notifications'
}

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
}

export interface AppConfig {
  apiKey?: string;
  debug?: boolean;
}
```

#### Create `src/common/events/index.ts`:
```typescript
export const events = {
  on: (eventName: string, callback: (...args: any[]) => void) => {},
  off: (eventName: string, callback: (...args: any[]) => void) => {},
  emit: (eventName: string, data?: any) => {},
  publish: (eventName: string, data?: any) => {},
};
```

#### Create `src/common/memory/index.ts`:
```typescript
export interface MemoryOptions {
  scope: string;
}

export const useMemory = () => {
  return {
    getItem: (key: string, options?: Partial<MemoryOptions>) => null,
    setItem: (key: string, value: any, options?: Partial<MemoryOptions>) => {},
    removeItem: (key: string, options?: Partial<MemoryOptions>) => {},
  };
};
```

#### Create `src/common/memory/memoryStorage.ts`:
```typescript
export interface MemoryOptions {
  scope: string;
}

export const getMemoryItem = (key: string, options: MemoryOptions) => null;
export const setMemoryItem = (key: string, value: any, options: MemoryOptions) => {};
export const removeMemoryItem = (key: string, options: MemoryOptions) => {};
```

#### Create `src/common/permissions/index.ts`:
```typescript
import { PermissionType } from '../types';

export interface PermissionOptions {
  prompt?: boolean;
}

export const usePermissions = () => {
  return {
    check: (permission: PermissionType) => Promise.resolve(false),
    request: (permission: PermissionType, options?: PermissionOptions) => Promise.resolve(false),
  };
};
```

#### Create `src/common/permissions/permissionManager.ts`:
```typescript
import { PermissionType } from '../types';

export const checkPermission = (permission: PermissionType) => Promise.resolve(false);
export const requestPermission = (permission: PermissionType) => Promise.resolve(false);
```

#### Create `src/common/app/index.ts`:
```typescript
import { AppConfig, AppManifest } from '../types';

export interface AppInitializeCallback {
  (context: any): void | Promise<void>;
}

export const useAppCreation = () => {
  return {
    registerApp: (manifest: AppManifest, config?: AppConfig) => {},
    getApp: (appId: string) => null,
    getAllApps: () => [],
    unregisterApp: (appId: string) => {},
    onInitialize: (callback: AppInitializeCallback) => {},
  };
};
```

#### Create `src/common/app/appManager.ts`:
```typescript
import { AppManifest } from '../types';

export const registerApp = (manifest: AppManifest) => {};
export const getApp = (appId: string) => null;
export const getAllApps = () => [];
export const unregisterApp = (appId: string) => {};
```

#### Create `src/common/super-agent/index.ts`:
```typescript
export interface ActionSuggestion {
  id: string;
  title: string;
  description?: string;
}

export interface QueryOptions {
  contextId?: string;
}

export const useSuperAgent = () => {
  return {
    query: (question: string, options?: QueryOptions) => Promise.resolve(''),
    getSuggestions: () => Promise.resolve<ActionSuggestion[]>([]),
    registerActionHandler: (actionId: string, handler: (data: any) => void) => () => {},
  };
};
```

## Step 3: Update Surface Components

### 3.1 Update Cards Implementation

#### Create `src/surfaces/cards/index.ts`:
```typescript
export interface CardConfig {
  content: React.ReactNode;
  actions?: React.ReactNode;
  metadata?: Record<string, any>;
}

export const createConversationCard = (contentOrConfig: React.ReactNode | CardConfig) => {
  const isConfig = typeof contentOrConfig !== 'string' && 
    contentOrConfig !== null && 
    typeof contentOrConfig === 'object' && 
    !React.isValidElement(contentOrConfig);
  
  const config = isConfig 
    ? contentOrConfig as CardConfig 
    : { content: contentOrConfig as React.ReactNode };
  
  return {
    id: Math.random().toString(36).substring(2, 9),
    config,
    update: (newConfig: Partial<CardConfig>) => {},
    remove: () => {},
  };
};
```

### 3.2 Update Panels Implementation

#### Create `src/surfaces/panels/index.ts`:
```typescript
export interface PanelConfig {
  content: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  metadata?: Record<string, any>;
}

export const createContextPanel = (contentOrConfig: React.ReactNode | PanelConfig) => {
  const isConfig = typeof contentOrConfig !== 'string' && 
    contentOrConfig !== null && 
    typeof contentOrConfig === 'object' && 
    !React.isValidElement(contentOrConfig);
  
  const config = isConfig 
    ? contentOrConfig as PanelConfig 
    : { content: contentOrConfig as React.ReactNode };
  
  return {
    id: Math.random().toString(36).substring(2, 9),
    config,
    update: (newConfig: Partial<PanelConfig>) => {},
    remove: () => {},
  };
};
```

## Step 4: Create Missing Mock Files

### 4.1 Update Mock Files
Replace the content of `tests/mocks/react.ts` and `tests/mocks/react-dom.ts` with proper implementations that export the expected functionality.

### 4.2 Create Additional Missing Mocks
Create any additional mock files needed for tests, especially for the surfaces modules.

## Step 5: Update Tests

### 5.1 Surface Tests
- Update `tests/surfaces/cards.test.ts` to use new imports and fix JSX syntax
- Update `tests/surfaces/panels.test.ts` to use new imports and fix JSX syntax
- Update `tests/surfaces/modals.test.tsx` to use new imports and fix JSX syntax
- Update `tests/surfaces/canvas.test.tsx` to use new imports and fix JSX syntax

### 5.2 Common Tests
- Update `tests/common/app.test.ts` to use new imports
- Update `tests/common/memory.test.ts` to use new imports
- Update `tests/common/permissions.test.ts` to use new imports
- Update `tests/common/super-agent.test.ts` to use new imports

### 5.3 Integration Tests
- Update `tests/integration/app-plugin-communication.test.ts` to use new imports
- Update `tests/integration/memory-permissions.test.ts` to use new imports
- Update `tests/integration/surface-coordination.test.ts` to use new imports

### 5.4 E2E Tests
- Update `tests/e2e/note-app.test.tsx` to use new imports

## Step 6: Incremental Testing

Test one module at a time to ensure fixes are working correctly:

1. Run tests for a single file to verify fixes:
   ```bash
   npx jest tests/surfaces/cards.test.ts
   ```

2. Fix any remaining issues in that file
3. Move to the next file
4. After all individual files pass, run the full test suite:
   ```bash
   npm test
   ```

## Step 7: Update Documentation

1. Update README.md with new testing instructions
2. Document any API changes that resulted from the fixes

## Troubleshooting Common Issues

### React Version Issues
If you encounter "Cannot read properties of undefined (reading 'S')" or similar errors, ensure React and React DOM versions are compatible.

### JSX Parsing Issues
If JSX syntax is not being properly parsed, check:
- `tsconfig.test.json` has the correct JSX configuration
- `jest.config.cjs` has the correct transformers
- Files with JSX use the `.tsx` extension

### Mock Issues
If tests are failing due to missing mock implementations:
- Check the mock file imports match the actual implementation
- Ensure mock functions return expected values
- Check Jest's moduleNameMapper configuration

### Import Path Issues
If tests can't find modules:
- Create the missing modules
- Update import paths in tests
- Use `moduleNameMapper` in Jest config to redirect imports if needed 