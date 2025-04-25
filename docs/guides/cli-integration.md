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
vibing init my-project

# Initialize with a specific template
vibing init my-project --template basic-app
```

The initialization process will:
1. Create the project directory structure
2. Install necessary dependencies
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
  }
}
```

## Development Workflow

The CLI enhances the development workflow with several commands:

### Development Server

Start a development server for real-time testing:

```bash
cd my-project
vibing dev
```

This command:
- Starts a local development server
- Watches for file changes
- Provides hot reloading
- Exposes a local testing environment

### Code Validation

Validate your code to ensure it meets the requirements:

```bash
vibing validate
```

This checks:
- Code structure
- Permission declarations
- Manifest correctness
- Package dependencies

### Testing

Run tests to ensure your app functions correctly:

```bash
# Run all tests
vibing test

# Run specific tests
vibing test --unit
vibing test --integration
```

## Deployment Process

When ready to deploy your app:

```bash
# Build for production
vibing build

# Deploy to Vibing AI platform
vibing deploy
```

The deployment process:
1. Builds optimized production assets
2. Validates the build
3. Packages the application
4. Uploads to the Vibing AI platform
5. Provides deployment status and URL

## Version Management

Manage your app's version with:

```bash
# Bump version
vibing version bump patch

# View current version
vibing version show
```

## Troubleshooting Common Issues

### Missing Dependencies

If you encounter errors about missing dependencies:

```bash
vibing doctor
```

This command analyzes your project and suggests fixes for common issues.

### Manifest Validation Errors

For manifest validation errors:

```bash
vibing validate --fix
```

This attempts to fix common manifest issues automatically.

### Permission Issues

If your app lacks necessary permissions:

```bash
vibing permissions check
```

This command analyzes your code and suggests permissions that should be added to your manifest.

## CLI and SDK Version Compatibility

Ensure your CLI and SDK versions are compatible:

```bash
vibing info
```

This displays version information for both the CLI and detected SDK.

## Advanced Configuration

The CLI supports advanced configuration through:

- Environment variables
- Configuration profiles
- CI/CD integration

See the [Advanced CLI Configuration](../advanced/cli-config.md) guide for more details.

## Conclusion

The integration between the Vibing AI SDK and CLI provides a powerful development environment for building, testing, and deploying Vibing AI applications. Following this structured approach ensures your applications are well-organized, properly validated, and efficiently deployed. 