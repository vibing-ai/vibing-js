# SDK Integration with Vibing AI CLI

This guide explains how to integrate the Vibing AI JavaScript SDK with the Vibing AI CLI tool for a streamlined development workflow.

## Overview

The Vibing AI CLI provides tools for initializing, developing, testing, and deploying applications built with the Vibing AI SDK. This integration simplifies the entire development lifecycle for Vibing AI applications.

## Installation

First, ensure both the SDK and CLI are installed:

```bash
# Install the SDK
npm install @vibing-ai/sdk

# Install the CLI globally
npm install -g @vibing-ai/cli
```

## Project Initialization

Create a new Vibing AI project using the CLI:

```bash
# Initialize a new project
vibe init my-project

# Initialize with a specific template
vibe init my-project --template basic-app

# Create a specific project type
vibe init my-project --type plugin
```

The initialization process will:
1. Create the project directory structure
2. Install necessary dependencies including the compatible version of the SDK
3. Set up configuration files
4. Initialize a Git repository (optional)

## Project Structure

The CLI expects the following folder structure for SDK-based projects:

```
my-project/
├── src/                  # Source code
│   ├── index.ts          # Main entry point
│   ├── components/       # UI components
│   ├── plugins/          # Custom plugins
│   └── agents/           # Custom agents
├── public/               # Static assets
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── vibing.json           # Project manifest
├── package.json          # NPM package configuration
└── README.md             # Project documentation
```

## The Manifest File (vibing.json)

The `vibing.json` manifest is crucial for CLI integration. It defines your application's metadata, permissions, surfaces, and other configuration details:

```json
{
  "name": "My Vibing App",
  "version": "1.0.0",
  "id": "com.example.my-vibing-app",
  "description": "A description of my app",
  "author": "Your Name",
  "permissions": [
    "memory.read",
    "memory.write"
  ],
  "surfaces": ["cards", "panels", "canvas", "modals"],
  "entryPoint": "src/index.ts",
  "development": {
    "port": 3000,
    "host": "localhost"
  },
  "sdkVersion": "^1.0.0"
}
```

Note the new `sdkVersion` field which specifies the SDK version compatibility requirements.

## Development Workflow

The CLI enhances the development workflow with several commands:

### Development Server

Start a development server for real-time testing:

```bash
cd my-project
vibe dev
```

This command:
- Starts a local development server
- Watches for file changes
- Provides hot reloading
- Exposes a local testing environment
- Emulates required permissions
- Forwards webhooks to your local environment

### Advanced Development Options

```bash
# Run on a specific port
vibe dev --port 8080

# Open in browser automatically
vibe dev --open

# Enable verbose logging
vibe dev --verbose

# Run with specific environment variables
vibe dev --env production
```

### Code Validation

Validate your code to ensure it meets the requirements:

```bash
vibe validate
```

This checks:
- Code structure
- Permission declarations
- Manifest correctness
- Package dependencies
- SDK compatibility

```bash
# Automatically fix issues when possible
vibe validate --fix

# Output validation results as JSON
vibe validate --json
```

### Testing

Run tests to ensure your app functions correctly:

```bash
# Run all tests
vibe test

# Run specific tests
vibe test --unit
vibe test --integration
```

#### Advanced Testing Options

```bash
# Run with coverage report
vibe test --coverage

# Watch for changes and re-run tests
vibe test --watch

# Run accessibility tests
vibe test --a11y
```

## Version Compatibility

The CLI checks for SDK compatibility automatically when running commands. It uses the `sdkVersion` field in your `vibing.json` to determine if your project is compatible with the installed SDK.

### Checking SDK Compatibility

To manually check SDK compatibility:

```bash
vibe check-compatibility
```

### Updating SDK Version

To update the SDK version in your project:

```bash
vibe update-sdk
```

This will:
1. Check your current SDK version
2. Find the latest compatible version
3. Update your package.json
4. Update your vibing.json
5. Install the new version

### Version Compatibility Matrix

| CLI Version | Compatible SDK Versions |
|-------------|-------------------------|
| 1.x.x       | 1.x.x                   |
| 2.x.x       | 2.x.x                   |

Major versions must match between the CLI and SDK for proper functionality.

## Deployment Process

When ready to deploy your app:

```bash
# Build for production
vibe build

# Deploy to Vibing AI platform
vibe publish
```

The deployment process:
1. Builds optimized production assets
2. Validates the build
3. Packages the application
4. Uploads to the Vibing AI platform
5. Provides deployment status and URL

### Advanced Deployment Options

```bash
# Deploy with a specific version
vibe publish --version 1.2.0

# Deploy as a draft (not publicly visible)
vibe publish --draft

# Deploy to a specific environment
vibe publish --env staging

# Skip pre-publish validation
vibe publish --skip-validation

# Simulate publishing without actually deploying
vibe publish --dry-run
```

## Integration Testing with the SDK

The CLI provides tools to test the integration between your application and the SDK:

```bash
# Run integration tests with the SDK
vibe test --sdk-integration

# Test specific SDK features
vibe test --sdk-features memory,permissions

# Test with a specific SDK version
vibe test --sdk-version 1.2.0
```

### Creating SDK Integration Tests

Create integration tests in the `tests/integration` directory:

```typescript
// tests/integration/sdk-memory.test.ts
import { test, expect } from '@vibing-ai/cli/testing';

test('app can read and write to memory', async ({ app }) => {
  // The `app` object is a running instance of your application
  // with full SDK capabilities
  
  await app.memory.write('test-key', 'test-value');
  const value = await app.memory.read('test-key');
  
  expect(value).toBe('test-value');
});
```

## Troubleshooting Common Issues

### Missing Dependencies

If you encounter errors about missing dependencies:

```bash
vibe doctor
```

This command analyzes your project and suggests fixes for common issues.

### Manifest Validation Errors

For manifest validation errors:

```bash
vibe validate --fix
```

This attempts to fix common manifest issues automatically.

### Permission Issues

If your app lacks necessary permissions:

```bash
vibe permissions check
```

This command analyzes your code and suggests permissions that should be added to your manifest.

### SDK Version Mismatch

If you encounter SDK version compatibility issues:

```bash
vibe doctor --sdk
```

This will:
1. Check your SDK version
2. Compare with CLI requirements
3. Suggest updates if needed
4. Offer to fix automatically

## CLI and SDK Version Compatibility

Ensure your CLI and SDK versions are compatible:

```bash
vibe info
```

This displays version information for both the CLI and detected SDK.

## Example: Complete Development Workflow

Here's an example of a complete development workflow using the CLI:

```bash
# Create a new project
vibe init my-awesome-app

# Navigate to the project
cd my-awesome-app

# Start development server
vibe dev

# Validate the project
vibe validate

# Run tests
vibe test

# Build for production
vibe build

# Deploy to production
vibe publish
```

## Advanced Configuration

The CLI supports advanced configuration through:

### Environment Variables

```
VIBING_CLI_PORT=8080 vibe dev
VIBING_CLI_REGISTRY=https://custom-registry.com vibe publish
```

### Configuration Profiles

Create a `.vibingrc` file in your project:

```json
{
  "profiles": {
    "development": {
      "port": 3000,
      "host": "localhost",
      "verbose": true
    },
    "production": {
      "minify": true,
      "sourceMaps": false
    }
  }
}
```

Use a profile:

```bash
vibe dev --profile development
vibe build --profile production
```

### CI/CD Integration

For CI/CD pipelines, the CLI provides non-interactive modes:

```bash
# Run in CI mode (non-interactive)
vibe build --ci

# Publish with an authentication token
vibe publish --token YOUR_API_TOKEN
```

## Extending the CLI

The CLI can be extended with custom commands or plugins:

```bash
# Install a CLI plugin
npm install @vibing-ai/cli-plugin-custom

# Use a custom command provided by the plugin
vibe custom-command
```

## Conclusion

The integration between the Vibing AI SDK and CLI provides a powerful development environment for building, testing, and deploying Vibing AI applications. Following this structured approach ensures your applications are well-organized, properly validated, and efficiently deployed.

For more information about specific CLI commands, run:

```bash
vibe help
```

Or for help with a specific command:

```bash
vibe help [command]
``` 