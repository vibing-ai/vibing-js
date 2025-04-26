# NPM Package Information

This document provides information about the `@vibing-ai/sdk` npm package, including how to install, publish, and manage versioning.

## Package Status

The `@vibing-ai/sdk` package is configured to be published to npm under the `@vibing-ai` organization scope. Current version information:

- **Package Name**: `@vibing-ai/sdk`
- **Current Version**: Check [package.json](../../package.json) for the latest version
- **License**: MIT

## Installation Options

### From npm (Once Published)

```bash
# Using npm
npm install @vibing-ai/sdk

# Using yarn
yarn add @vibing-ai/sdk

# Using pnpm
pnpm add @vibing-ai/sdk
```

### From GitHub Repository (Pre-Publication)

Until the package is officially published on npm, you can install it directly from the GitHub repository:

```bash
# Using npm
npm install vibing-ai/js-sdk

# Using yarn
yarn add vibing-ai/js-sdk

# Using pnpm
pnpm add vibing-ai/js-sdk
```

## Publishing Process

To publish a new version of the package:

1. Update the version in `package.json` following [Semantic Versioning](https://semver.org/) principles
2. Update the changelog in `docs/project/changelog.md`
3. Run tests and linting to ensure quality
   ```bash
   npm run lint
   npm test
   ```
4. Build the package
   ```bash
   npm run build
   ```
5. Publish to npm
   ```bash
   npm publish
   ```

Note that you need appropriate npm organization permissions to publish under the `@vibing-ai` scope.

## Version Management

We follow Semantic Versioning (SemVer) for this package:

- **Major version** (1.0.0): Breaking changes
- **Minor version** (0.1.0): New features without breaking existing functionality
- **Patch version** (0.0.1): Bug fixes and minor improvements

## Package Dependencies

### Production Dependencies

The SDK has minimal production dependencies to keep bundle sizes small. Main dependencies include:

- `intersection-observer`: For surface visibility detection
- `semver`: For version compatibility checks
- `tslib`: TypeScript runtime helpers

### Peer Dependencies

The SDK has the following peer dependencies which should be installed by the consuming application:

- `@vibing-ai/block-kit`: UI component library for Vibing AI (optional)
- `react`: React library
- `react-dom`: React DOM integration

## Related Documentation

- [Release Guide](../maintainers/release-guide.md)
- [Contributing Guide](./contributing.md)
- [Changelog](./changelog.md) 