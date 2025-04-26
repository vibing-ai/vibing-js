# Publishing Guide for Maintainers

This document outlines the process for publishing new versions of the Vibing AI SDK to npm.

## Pre-publish Checklist

Before publishing a new version, ensure the following steps are completed:

### 1. Version Number Verification

- [ ] Update the version in `package.json` according to [Semantic Versioning](https://semver.org/)
  - MAJOR version for incompatible API changes
  - MINOR version for backwards-compatible functionality
  - PATCH version for backwards-compatible bug fixes
- [ ] Ensure all package dependencies have appropriate version ranges

### 2. Documentation Update

- [ ] Update `CHANGELOG.md` with all changes since the last release
- [ ] Verify that the README.md is up-to-date
- [ ] Ensure API documentation is current
- [ ] Check that examples work with the new version

### 3. Code Quality

- [ ] Run linting: `npm run lint`
- [ ] Verify all tests pass: `npm run test`
- [ ] Check for outdated dependencies: `npm outdated`
- [ ] Perform manual testing of key functionality

### 4. Build Verification

- [ ] Clean the build directory: `npm run build`
- [ ] Verify the build completes without errors
- [ ] Check bundle size: `npm run analyze` (if available)
- [ ] Test the built package locally: `npm pack` and install in a test project

### 5. Git Preparation

- [ ] Ensure all changes are committed to the appropriate branch
- [ ] Create a release branch if necessary (e.g., `release/1.0.0`)
- [ ] Merge all necessary PRs

## Publishing Process

Once the pre-publish checklist is complete, follow these steps to publish:

1. **Final version update**:
   ```bash
   # Update version in package.json (if not already done)
   npm version [major|minor|patch]
   ```

2. **Publish to npm**:
   ```bash
   # Log in to npm (if not already logged in)
   npm login
   
   # Publish the package
   npm publish
   ```
   
   The `prepublishOnly` script will automatically run linting, tests, and build before publishing.
   The `postpublish` script will create a git tag and push it to the repository.

3. **Create GitHub Release**:
   - Go to the GitHub repository
   - Navigate to "Releases"
   - Click "Draft a new release"
   - Choose the newly created tag
   - Use the version number as the title
   - Copy relevant content from CHANGELOG.md
   - Publish release

## Post-publish Verification

After publishing, verify the following:

- [ ] The package is available on npm: `npm view @vibing-ai/sdk`
- [ ] Install the package in a new project to verify it works: `npm install @vibing-ai/sdk`
- [ ] Check the GitHub release was created successfully
- [ ] Verify the documentation site reflects the new version (if applicable)

## Handling Failed Publishes

If the publish process fails:

1. Fix the issue that caused the failure
2. If a version was already published but is broken:
   ```bash
   # Deprecate the broken version
   npm deprecate @vibing-ai/sdk@x.y.z "This version contains critical issues, please use version x.y.(z+1)"
   
   # Fix issues and publish a patch version
   ```

## Publishing Beta/Alpha Versions

For pre-releases:

```bash
# Update version with pre-release tag
npm version [major|minor|patch] --preid=beta

# Publish with tag
npm publish --tag beta
```

Users can then install with:
```bash
npm install @vibing-ai/sdk@beta
``` 