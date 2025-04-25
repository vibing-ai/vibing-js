# Versioning Strategy

This document outlines the versioning strategy for the Vibing AI SDK, providing guidance on compatibility, breaking changes, and version management.

## Semantic Versioning

The Vibing AI SDK follows [Semantic Versioning](https://semver.org/) (SemVer) with version numbers in the format of `MAJOR.MINOR.PATCH`.

- **MAJOR version** increments indicate incompatible API changes
- **MINOR version** increments indicate new functionality added in a backward-compatible manner
- **PATCH version** increments indicate backward-compatible bug fixes

### When to Increment Each Version Component

| Component | When to Increment |
|-----------|------------------|
| **MAJOR** | When making incompatible API changes that require modifications to existing code |
| **MINOR** | When adding new functionality that doesn't break existing API behavior |
| **PATCH** | When implementing bug fixes that don't change the API behavior |

### Breaking vs. Non-Breaking Changes

**Breaking Changes** (require MAJOR version increment):
- Removing a public API method or property
- Changing method signatures (parameters, return types)
- Renaming public APIs without backward compatibility
- Changing the behavior of existing methods significantly
- Changing the minimum required dependencies (e.g., Node.js version)

**Non-Breaking Changes** (require MINOR or PATCH version increment):
- Adding new APIs, methods, or properties
- Extending existing interfaces with optional properties
- Deprecating APIs (but not removing them)
- Performance improvements
- Internal refactoring that maintains the same API

### Deprecation Policy

- Features will be marked as deprecated at least one MINOR version before removal
- Deprecated features will continue to work for at least one MAJOR version
- Deprecation warnings will be shown in development mode
- Documentation will clearly indicate deprecated features and their replacements
- When possible, backward compatibility wrappers will be provided

## Version Compatibility Matrix

| SDK Version | @vibing-ai/block-kit | @vibing-ai/cli | Node.js | Browser Support |
|-------------|----------------------|----------------|---------|-----------------|
| 1.x.x       | 1.x.x                | 1.x.x          | >=16.x  | Modern browsers* |
| 0.9.x       | 0.9.x                | 0.9.x          | >=14.x  | Modern browsers* |
| 0.8.x       | 0.8.x                | 0.8.x          | >=14.x  | Modern browsers* |

\* Modern browsers include the latest versions of Chrome, Firefox, Safari, and Edge.

### Node.js Version Requirements

- **Minimum required version**: Node.js 16.x
- **Recommended version**: Node.js 18.x or higher
- Certain features may require newer Node.js versions, which will be documented

### Browser Compatibility

The SDK supports the following browsers:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

## Backward Compatibility Policy

### Support Timeline

- **MAJOR versions**: Supported for a minimum of 18 months after release
- **MINOR versions**: Latest MINOR version of each MAJOR version is supported
- **PATCH versions**: Only the latest PATCH version is officially supported

### Migration Paths

- Migration guides will be provided for each MAJOR version update
- Codemods will be provided when possible to automate upgrades
- The CLI will include version upgrade commands to assist with migrations

### API Stability Guarantees

- All published APIs are considered stable unless marked as experimental
- Experimental features are prefixed with `experimental` in the API
- Internal APIs (prefixed with `_` or marked as `@internal`) may change at any time
- TypeScript interfaces marked as `@public` are part of the stable API contract

## Release Cadence

- **MAJOR versions**: Released approximately once per year
- **MINOR versions**: Released approximately every 1-2 months
- **PATCH versions**: Released as needed for bug fixes

### Long-term Support (LTS)

- LTS versions will be designated for specific MAJOR releases
- LTS releases will receive security updates for a minimum of 24 months
- LTS releases will focus on stability rather than new features

### Security Patches

- Security patches will be provided for all supported versions
- Critical security issues may receive patches for unsupported versions
- Security bulletins will be published for all security-related updates

### Beta/Alpha Release Guidelines

- **Alpha releases** (`1.0.0-alpha.1`): Experimental, may have breaking changes between releases
- **Beta releases** (`1.0.0-beta.1`): Feature complete, API stable, but may contain bugs
- **Release candidates** (`1.0.0-rc.1`): Preparation for final release, only critical bug fixes

## Versioning for Projects Built with the SDK

### Recommendations for Developers

- Pin to a specific version in `package.json` (e.g., `"@vibing-ai/sdk": "1.2.3"`)
- For libraries, use a compatible range (e.g., `"@vibing-ai/sdk": "^1.2.3"`)
- Test thoroughly when upgrading to a new MAJOR version
- Review the changelog before upgrading

### Version Checking Mechanisms

The SDK provides utilities to check version compatibility:

```javascript
import { checkCompatibility } from '@vibing-ai/sdk';

// Check if current environment is compatible
const { compatible, issues } = checkCompatibility();

if (!compatible) {
  console.warn('Compatibility issues detected:', issues);
}
```

### Handling SDK Version Dependencies

When building plugins, apps, or agents with the SDK:

1. Document which SDK versions your project is compatible with
2. Use the SDK's version checking utilities to verify compatibility at runtime
3. Consider supporting multiple SDK versions for widely used plugins
4. Follow a similar versioning strategy for your own projects

## Example Versioning Scenarios

### Adding a New Feature

```javascript
// SDK 1.1.0 - Added new optional parameter
function createApp(config, options = {}) {
  // Implementation
}
```

### Deprecating a Feature

```javascript
// SDK 1.2.0 - Deprecating a method
/**
 * @deprecated Since version 1.2.0. Use createPanelV2() instead.
 */
function createPanel(config) {
  console.warn('Warning: createPanel() is deprecated. Use createPanelV2() instead.');
  return createPanelV2(config);
}

function createPanelV2(config) {
  // New implementation
}
```

### Breaking Change

```javascript
// SDK 1.x.x
function createAgent(config) {
  // Old implementation
}

// SDK 2.0.0 - Breaking change with different parameters
function createAgent(config, context) {
  // New implementation requiring context
}
``` 