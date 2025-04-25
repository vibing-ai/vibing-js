# Dependency Resolution Strategy

This document outlines the approach for resolving dependency conflicts and keeping dependencies up-to-date in the Vibing AI SDK.

## Current Conflicts

### 1. Missing Peer Dependency: `@vibing-ai/block-kit`

The project requires `@vibing-ai/block-kit@^1.0.0` as a peer dependency, but it is not installed. This is likely an internal package that should be managed properly.

### 2. React Type Definitions Conflict

There is a conflict between:
- `@testing-library/react-hooks@8.0.1` requires `@types/react@^16.9.0 || ^17.0.0`
- Project uses `@types/react@18.3.20`

### 3. Outdated Dependencies

Multiple dependencies are outdated according to npm-check-updates:

```
 @testing-library/react        ^13.4.0  →   ^16.3.0
 @testing-library/user-event   ^14.4.3  →   ^14.6.1
 @types/jest                   ^29.5.1  →  ^29.5.14
 @types/node                  ^18.16.0  →  ^22.15.2
 @types/react                  ^18.2.0  →   ^19.1.2
 @types/react-dom              ^18.2.0  →   ^19.1.2
 jest                          ^29.5.0  →   ^29.7.0
 react                         ^18.2.0  →   ^19.1.0
 react-dom                     ^18.2.0  →   ^19.1.0
 rimraf                         ^5.0.0  →    ^6.0.1
 rollup                        ^3.21.0  →   ^4.40.0
 rollup-plugin-dts              ^5.3.0  →    ^6.2.1
 rollup-plugin-typescript2     ^0.34.1  →   ^0.36.0
 semver                         ^7.5.4  →    ^7.7.1
 ts-jest                       ^29.1.0  →   ^29.3.2
 tslib                          ^2.5.0  →    ^2.8.1
 typescript                     ^5.0.4  →    ^5.8.3
 webpack-bundle-analyzer        ^4.8.0  →   ^4.10.2
```

## Resolution Strategy

### Immediate Actions

1. Resolve `@vibing-ai/block-kit` dependency:
   - If it's an internal package, add it to the workspace
   - If it's a public package, install it
   - If it's a custom internal package, consider using a local path or GitHub reference

2. Address React Types conflict:
   - Option chosen: Replace `@testing-library/react-hooks` with React 18 compatible alternatives
   - React Testing Library now recommends using the `renderHook` function from `@testing-library/react` for React 18

### Dependency Update Groups

To maintain stability, dependencies will be updated in logical groups:

1. **Group 1: Core Dependencies**
   - `semver`
   - `tslib`
   - Base utility packages

2. **Group 2: Testing Foundation**
   - `jest`
   - `ts-jest`
   - `@types/jest`

3. **Group 3: React and Testing**
   - `@testing-library/*` packages
   - React-related type definitions

4. **Group 4: Build Tools**
   - `rollup` and plugins
   - `typescript`
   - `rimraf`

### Implementation Approach

Each group will be updated in a separate commit:

1. Update dependencies in the group
2. Run `npm install`
3. Fix any breaking changes
4. Run tests to verify functionality
5. Commit changes
6. Proceed to the next group

## Long-term Maintenance

To prevent future dependency conflicts:

1. Set up a regular schedule for dependency updates (e.g., monthly)
2. Add dependency update checks to CI/CD pipeline
3. Use tools like Dependabot for automated updates
4. Document peer dependency requirements clearly in README.md
5. Consider using npm overrides for persistent conflicts 