# Vibing AI SDK - Stage 1 Implementation Plan

This document outlines the Stage 1 implementation plan for the Vibing AI JavaScript SDK. Each section includes Cursor Agent prompts that you can copy and paste to help automate or guide specific implementation tasks.

## Overview

- **npm Package**: `@vibing-ai/sdk`
- **GitHub Repository**: `https://github.com/vibing-ai/vibing-js`
- **Goal**: Establish the foundation of the Vibing AI JavaScript SDK

## 1. Repository Setup

### Create Repository Structure

**Cursor Agent Prompt:**
```
Create the following directory structure for the Vibing AI JavaScript SDK:

/vibing-js
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── src/
│   ├── app/
│   ├── plugin/
│   ├── agent/
│   ├── common/
│   │   ├── memory/
│   │   ├── permissions/
│   │   ├── events/
│   │   └── super-agent/
│   ├── surfaces/
│   │   ├── canvas/
│   │   ├── cards/
│   │   ├── panels/
│   │   └── modals/
│   └── index.ts
├── examples/
├── tests/
├── docs/
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
└── CONTRIBUTING.md
```

### Initialize Git and GitHub

**Cursor Agent Prompt:**
```
Help me initialize a Git repository and prepare for pushing to GitHub with the following commands:

1. git init
2. Generate a proper .gitignore file for a TypeScript npm package
3. git add .
4. git commit -m "Initial repository structure"
5. Instructions for connecting to GitHub:
   git remote add origin https://github.com/vibing-ai/vibing-js.git
   git branch -M main
   git push -u origin main
```

### Create GitHub CI Workflow

**Cursor Agent Prompt:**
```
Create a GitHub Actions CI workflow file at .github/workflows/ci.yml that:

1. Runs on push to main and pull requests
2. Sets up Node.js (latest LTS version)
3. Installs dependencies
4. Runs linting
5. Runs tests
6. Builds the package
7. Optionally, add a step to publish to npm when a release tag is created
```

## 2. Package Configuration

### Create package.json

**Cursor Agent Prompt:**
```
Create a package.json file for '@vibing-ai/sdk' with the following:

1. Name: "@vibing-ai/sdk"
2. Version: "0.1.0"
3. Description: "Official JavaScript SDK for building Vibing AI apps, plugins, and agents"
4. Main: "dist/index.js"
5. Types: "dist/index.d.ts"
6. Files to include in the package: ["dist", "LICENSE", "README.md"]
7. Scripts:
   - build: Use TypeScript compiler
   - test: Use Jest
   - lint: Use ESLint
   - format: Use Prettier
   - prepare: Run build
8. Dependencies:
   - Consider including @vibing-ai/block-kit as a peer dependency
9. Development dependencies:
   - TypeScript
   - Jest and ts-jest
   - ESLint and related plugins
   - Prettier
   - @types/node
10. License: MIT
11. Repository, bugs, and homepage fields pointing to the GitHub repo
```

### Configure TypeScript

**Cursor Agent Prompt:**
```
Create a tsconfig.json file that:

1. Targets ES2020
2. Generates declaration files
3. Uses strict type checking
4. Outputs to the dist directory
5. Includes the src directory
6. Configures module resolution for Node.js
7. Enables esModuleInterop
8. Preserves JSX (for React components)
9. Includes appropriate lib options (DOM, ES2020, etc.)
```

### ESLint and Prettier Setup

**Cursor Agent Prompt:**
```
Create ESLint and Prettier configuration files:

1. .eslintrc.js with:
   - TypeScript parser
   - Airbnb or similar style guide base
   - React plugin if needed
   - Rules for consistent code style

2. .prettierrc with:
   - Single quotes
   - No semi-colons (or include them if preferred)
   - 2 space indentation
   - 80-100 character print width
   - Arrow parenthesis as needed

3. Also create a .eslintignore file for:
   - dist/
   - node_modules/
   - coverage/
```

## 3. Core Module Framework

### Create Index Files

**Cursor Agent Prompt:**
```
Create the following index files with basic exports:

1. src/index.ts - Main entry point exporting all modules
2. src/app/index.ts - Exports for app module
3. src/plugin/index.ts - Exports for plugin module
4. src/agent/index.ts - Exports for agent module
5. src/common/index.ts - Exports for common utilities
6. src/surfaces/index.ts - Exports for UI surfaces

Each file should have appropriate comments and type exports.
```

### Define Core Types

**Cursor Agent Prompt:**
```
Create type definition files for the core modules:

1. src/app/types.ts - Types for app creation and management
   - AppConfig interface
   - AppInstance interface
   - Lifecycle hooks types

2. src/plugin/types.ts - Types for plugin creation
   - PluginConfig interface
   - PluginInstance interface
   - Plugin function types

3. src/agent/types.ts - Types for agent creation
   - AgentConfig interface
   - AgentInstance interface
   - Agent function types

4. src/common/types.ts - Shared type definitions
   - Common configuration types
   - Utility types used across modules

Include JSDoc comments for all type definitions.
```

## 4. Memory System Implementation

### Memory Interface Definition

**Cursor Agent Prompt:**
```
Create the memory system interface in src/common/memory/types.ts with:

1. MemoryOptions interface with:
   - scope: 'global' | 'project' | 'conversation'
   - fallback: optional default value
   - expiration: optional time in milliseconds

2. MemoryResult interface for hook returns with:
   - data: generic type T
   - loading: boolean
   - error: Error | null
   - set: function to update value
   - update: function to update based on current value
   - delete: function to remove value

3. Memory API interface with:
   - get: function to retrieve data
   - set: function to store data
   - delete: function to remove data
   - query: function to find matching data
   - subscribe: function to watch for changes
```

### Memory Hook Implementation

**Cursor Agent Prompt:**
```
Create the memory hook implementation in src/common/memory/useMemory.ts:

1. Import necessary types
2. Create a useMemory<T> hook that:
   - Takes a key string and options object
   - Returns a MemoryResult<T> object
   - Implements loading state handling
   - Manages errors appropriately
   - Provides functions to set, update, and delete data
   - Implements proper cleanup on unmount

3. For Stage 1, this can use localStorage or a simple in-memory store for demonstration, with comments indicating where actual API calls would be made in production
```

### Memory API Implementation

**Cursor Agent Prompt:**
```
Create the non-hook memory API in src/common/memory/memory.ts:

1. Implement a memory object with:
   - get<T>: function to retrieve data by key
   - set<T>: function to store data by key
   - delete: function to remove data by key
   - query: function to find data by pattern
   - subscribe: function to watch for changes

2. For Stage 1, implement a simple in-memory or localStorage-based version with appropriate comments about future API integration

3. Add proper error handling and type safety
```

## 5. Permissions System Implementation

### Permissions Interface

**Cursor Agent Prompt:**
```
Create the permissions system interface in src/common/permissions/types.ts:

1. PermissionRequest interface with:
   - type: string (e.g., 'memory', 'network')
   - access: string[] (e.g., ['read', 'write'])
   - scope: string (e.g., 'project', 'global')
   - duration: optional number in milliseconds
   - purpose: optional string explaining the request

2. PermissionHook interface with:
   - request: function to request permission
   - check: function to check if permission exists
   - requestAll: function to request multiple permissions
   - revoke: function to remove permissions

3. Include JSDoc comments explaining each field and function
```

### Permissions Hook Implementation

**Cursor Agent Prompt:**
```
Create the permissions hook implementation in src/common/permissions/usePermissions.ts:

1. Import necessary types
2. Create a usePermissions hook that:
   - Returns a PermissionHook object
   - Implements request function to show permission dialog
   - Implements check function to verify permissions
   - Implements requestAll for batch permission requests
   - Implements revoke to remove permissions

3. For Stage 1, this can use localStorage or a simple in-memory store, with comments indicating where actual API calls would be made in production
```

### Permissions API Implementation

**Cursor Agent Prompt:**
```
Create the non-hook permissions API in src/common/permissions/permissions.ts:

1. Implement a permissions object with:
   - request: function to request permission
   - check: function to check permission status
   - revoke: function to remove permission
   - getAll: function to list all permissions

2. For Stage 1, implement a simple version with appropriate comments about future API integration
3. Add proper error handling and type safety
```

## 6. Event System Implementation

### Events Interface

**Cursor Agent Prompt:**
```
Create the events system interface in src/common/events/types.ts:

1. EventsHook interface with:
   - subscribe<T>: function to listen for events
   - publish<T>: function to send events
   - once<T>: function to listen for a single occurrence of an event

2. EventCallback<T> type for event handlers
3. Include JSDoc comments explaining each field and function
```

### Events Hook Implementation

**Cursor Agent Prompt:**
```
Create the events hook implementation in src/common/events/useEvents.ts:

1. Import necessary types
2. Create a useEvents hook that:
   - Returns an EventsHook object
   - Implements subscribe function for event listening
   - Implements publish function for event sending
   - Implements once for single-event listening
   - Handles cleanup on component unmount

3. For Stage 1, implement an in-memory event bus with appropriate comments about future enhancements
```

### Events API Implementation

**Cursor Agent Prompt:**
```
Create the non-hook events API in src/common/events/events.ts:

1. Implement an events object with:
   - subscribe<T>: function to listen for events
   - publish<T>: function to send events
   - once<T>: function to listen for a single event

2. Create a simple event bus implementation
3. Add proper error handling and type safety
```

## 7. App Creation API

### App Creation Implementation

**Cursor Agent Prompt:**
```
Create the app creation implementation in src/app/createApp.ts:

1. Import types from app/types.ts
2. Create a createApp function that:
   - Takes an AppConfig object
   - Returns an AppInstance
   - Validates the config object
   - Sets up lifecycle methods (onInitialize, render)
   - Handles permissions requested in the config

3. For Stage 1, implement a basic version that logs lifecycle events and returns a minimal AppInstance
4. Add appropriate JSDoc comments
```

### App Example

**Cursor Agent Prompt:**
```
Create an example app implementation in examples/note-app.ts:

1. Import createApp and necessary utilities
2. Create a simple note-taking app that:
   - Uses memory to store notes
   - Requests appropriate permissions
   - Implements a simple UI (can be commented pseudo-code for Stage 1)
   - Shows proper lifecycle handling

3. Add detailed comments explaining each step
```

## 8. Documentation Setup

### README Creation

**Cursor Agent Prompt:**
```
Create a comprehensive README.md for the Vibing AI SDK with:

1. Project title and description
2. Installation instructions
3. Quick start example
4. Core concepts explanation
5. API overview with links to detailed docs
6. Contributing guidelines reference
7. License information
8. Links to related projects (@vibing-ai/cli, @vibing-ai/block-kit)
```

### Contributing Guidelines

**Cursor Agent Prompt:**
```
Create CONTRIBUTING.md with guidelines for:

1. Setting up the development environment
2. Code style and conventions
3. Commit message format
4. Pull request process
5. Testing requirements
6. Documentation requirements
7. Issue reporting guidelines
```

### JSDoc Comments Setup

**Cursor Agent Prompt:**
```
Add comprehensive JSDoc comments to these key files:

1. src/index.ts - Main module documentation
2. src/app/createApp.ts - App creation API docs
3. src/common/memory/useMemory.ts - Memory hook docs
4. src/common/permissions/usePermissions.ts - Permissions hook docs

Include:
- Function descriptions
- Parameter descriptions
- Return value descriptions
- Example usage where appropriate
- Type information
```

## 9. Testing Setup

### Jest Configuration

**Cursor Agent Prompt:**
```
Set up Jest for testing:

1. Create jest.config.js with:
   - TypeScript support via ts-jest
   - Test environment configuration
   - Coverage reporting
   - Test file patterns

2. Create a setup file if needed for any global test setup
3. Update package.json scripts for running tests
```

### Basic Tests

**Cursor Agent Prompt:**
```
Create basic test files for:

1. tests/common/memory.test.ts - Test memory system
   - Test useMemory hook with React Testing Library
   - Test memory API directly

2. tests/common/permissions.test.ts - Test permissions system
   - Test permission requests
   - Test permission checks

3. tests/app/createApp.test.ts - Test app creation
   - Test basic app configuration
   - Test lifecycle methods

Use appropriate mocking for any browser APIs.
```

## Next Steps After Stage 1

After completing Stage 1 implementation, review the codebase and prepare for Stage 2, which will include:

1. Implementation of the Plugin and Agent creation APIs
2. Integration with Block Kit
3. Surface implementations (Canvas, Cards, Panels, Modals)
4. Super Agent integration
5. More comprehensive examples and documentation
6. Performance optimization
7. Integration testing with the CLI and Block Kit
