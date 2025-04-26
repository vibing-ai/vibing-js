# Pre-Release Checklist

This document provides a comprehensive checklist for preparing a new release of the Vibing AI SDK. All items should be completed before proceeding with the release execution.

## 1. Documentation Review

- [ ] **README.md**
  - Verify all information is accurate and up-to-date
  - Confirm installation instructions are correct
  - Ensure quick start example works as expected
  - Check that all links are valid and point to correct locations
  - Confirm badges are displaying correctly

- [ ] **API Reference**
  - Run `npm run docs:generate` to ensure API reference is up-to-date
  - Verify all exported functions, classes, and interfaces are documented
  - Check that examples in API documentation are functional
  - Ensure deprecated APIs are properly marked
  - Verify parameter and return type documentation is accurate

- [ ] **Guides and Tutorials**
  - Review all guides for accuracy with current version
  - Test all code examples to ensure they work as documented
  - Check for any missing or outdated information
  - Verify cross-references between guides are accurate
  - Ensure migration guides are updated if applicable

- [ ] **Examples**
  - Run all example projects to verify they work with the current version
  - Check that example code matches documentation
  - Verify example projects have up-to-date dependencies
  - Ensure examples cover key SDK features

- [ ] **CHANGELOG.md**
  - Verify all significant changes are documented
  - Ensure proper categorization (Added, Changed, Fixed, Removed)
  - Check that contributor attributions are included where appropriate
  - Confirm version number and date are correct
  - Verify links to issues or PRs are valid

## 2. Code Quality Review

- [ ] **Linting**
  - Run `npm run lint` to verify no linting errors
  - Command: `npm run lint`
  - Address any warnings that should be fixed before release

- [ ] **Type Checking**
  - Run `npm run typecheck` to verify no TypeScript errors
  - Command: `npm run typecheck`
  - Ensure public API types are correctly exported

- [ ] **Code Coverage**
  - Run `npm run test:coverage` to verify test coverage meets thresholds
  - Command: `npm run test:coverage`
  - Current thresholds: Lines (85%), Functions (80%), Branches (75%)
  - Address any significant gaps in test coverage

- [ ] **Security Checks**
  - Run `npm audit` to check for dependency vulnerabilities
  - Command: `npm audit`
  - Update dependencies or add mitigations as needed
  - Verify no sensitive information is exposed in the codebase

- [ ] **Performance Benchmarks**
  - Run performance benchmarks to ensure no regressions
  - Command: `npm run benchmark`
  - Compare results with previous release
  - Investigate any significant performance degradations

## 3. Testing Verification

- [ ] **Unit Tests**
  - Run all unit tests to ensure they pass
  - Command: `npm run test:unit`
  - Verify tests cover edge cases and error scenarios

- [ ] **Integration Tests**
  - Run all integration tests to ensure they pass
  - Command: `npm run test:integration`
  - Verify interactions between components work as expected

- [ ] **E2E Tests**
  - Run all end-to-end tests to ensure they pass
  - Command: `npm run test:e2e`
  - Verify real-world usage scenarios are covered

- [ ] **Browser Compatibility Tests**
  - Run browser compatibility tests
  - Command: `npm run test:browsers`
  - Verify SDK works correctly in all supported browsers:
    - Chrome (latest 2 versions)
    - Firefox (latest 2 versions)
    - Safari (latest 2 versions)
    - Edge (latest 2 versions)
    - Mobile Safari and Chrome (latest versions)

- [ ] **Manual Testing Scenarios**
  - Complete all manual testing scenarios
  - Verify SDK works with @vibing-ai/block-kit integration
  - Test CLI integration with @vibing-ai/cli
  - Verify SDK works in both Node.js and browser environments
  - Test with various configuration options

## 4. Package Verification

- [ ] **package.json Configuration**
  - Verify version number is correct and follows semver
  - Check main, module, and types fields point to correct files
  - Ensure exports field is correctly configured
  - Verify dependencies and peerDependencies are accurate
  - Check that files array includes all necessary files

- [ ] **Dependencies**
  - Update all dependencies to latest compatible versions
  - Command: `npm outdated`
  - Ensure all dependencies are properly declared
  - Check for any deprecated dependencies

- [ ] **Bundle Size**
  - Verify bundle size is within acceptable limits
  - Command: `npm run analyze:bundle`
  - Size targets: Main bundle (120KB), Core bundle (60KB)
  - Investigate and optimize if targets are exceeded

- [ ] **Tree-Shaking**
  - Verify tree-shaking works as expected
  - Test importing individual components to ensure unused code is not included
  - Check bundle size in a test project with various import patterns

- [ ] **Package Exports**
  - Verify all package entry points work correctly
  - Test importing from:
    - `@vibing-ai/sdk`
    - `@vibing-ai/sdk/app`
    - `@vibing-ai/sdk/plugin`
    - `@vibing-ai/sdk/agent`
    - `@vibing-ai/sdk/core`

## 5. Release Preparation

- [ ] **Version Number**
  - Update version in package.json
  - Update version in src/version.ts if applicable
  - Ensure version adheres to semver based on changes

- [ ] **CHANGELOG Update**
  - Move items from "Unreleased" to new version section
  - Add release date
  - Ensure all significant changes are documented
  - Add migration notes if necessary

- [ ] **Git Tag Preparation**
  - Prepare tag message
  - Format: `v1.2.3 - Brief description`

- [ ] **Release Notes**
  - Draft release notes based on CHANGELOG
  - Highlight key features, improvements, and fixes
  - Include upgrade instructions if applicable
  - Add credits to contributors

- [ ] **Announcement Content**
  - Prepare social media announcements
  - Draft blog post content if applicable
  - Update website content if applicable
  - Prepare email newsletter content if applicable

## Final Approval

- [ ] All checklist items completed
- [ ] Release approved by team lead
- [ ] Documentation approved by technical writer (if applicable)
- [ ] Legal approval received (if applicable)

Once all items are checked, proceed to release execution using the [Release Execution Guide](./release-execution.md). 