# Remaining Issues Fixes 2.0

This document tracks the remaining issues that need to be addressed in the codebase after resolving the TypeScript Ban Types Error.

## Linting Issues

### 1. Console Statements ✅ (Completed)
Progress has been made on replacing direct console statements with logger utility:
- ✅ Logger utility has been implemented in `src/core/utils/logger.ts`
- ✅ Many components now use the logger utility instead of direct console statements
- ✅ The logger utility itself still uses direct console statements (as expected for its implementation)
- ✅ Test files have been updated to mock the logger utility instead of console.log

**Action Items:**
- ✅ Update tests to mock the logger utility instead of console.log
- ✅ Ensure logger is properly imported in any remaining files using direct console statements
- ✅ Run ESLint to verify no unauthorized console statements remain

### 2. Type Improvements ✅ (Completed)
Several files have been updated to replace 'any' types with more specific types or 'unknown':
- ✅ `src/agent/types.ts` (replaced 11 instances of 'any' with proper types)
- ✅ `src/app/types.ts` (replaced 3 instances of 'any' with proper types)
- ✅ `src/common/events/index.ts` (replaced 2 instances of 'any' with 'unknown')
- ✅ `src/core/memory/memory.ts` (replaced 8 instances of 'any' with proper types)
- ✅ `src/core/types.ts` (replaced 'any' with union types and 'unknown')
- ✅ `src/plugin/types.ts` (replaced 15 instances of 'any' with proper types)
- ✅ `src/surfaces/block-kit-types.ts` (replaced 6 instances of 'any' with more specific types)
- ✅ `src/surfaces/canvas/index.ts` (replaced multiple instances of 'any' with 'unknown')
- ✅ `src/core/errors/index.ts` (replaced multiple 'any' types with 'unknown' or more specific types)
- ✅ `src/core/events/index.ts` (introduced generics and replaced 'any' with 'unknown')
- ✅ `src/surfaces/modals/index.ts` (fixed type casting with proper TypeScript)
- ✅ `src/types/utilities.ts` (improved generic function types)

**Action Items:**
- ✅ Create proper type definitions for each component
- ✅ Use generics where appropriate instead of 'any'
- ✅ Replace 'any' with 'unknown' where exact type is truly unknown
- ✅ Add specific function type signatures instead of generic ones
- ✅ Complete type improvements in all files

### 3. Unused Variables ✅ (Completed)
Multiple files had unused variables or parameters:
- ✅ `src/common/app/index.ts` (prefixed config and callback with underscore)
- ✅ `src/common/memory/memoryStorage/index.ts` (removed unused scopedKey variable)
- ✅ `src/common/permissions/index.ts` (prefixed options with underscore)
- ✅ `src/common/permissions/permissionManager/index.ts` (no issues found - parameters are used)
- ✅ `src/common/super-agent/index.ts` (prefixed handler with underscore)
- ✅ `src/core/errors/index.ts` (prefixed Component and fallback with underscore)
- ✅ `src/core/security/index.ts` (prefixed Permission with underscore)
- ✅ `src/surfaces/canvas/index.ts` (commented out unused useEffect import)

**Action Items:**
- ✅ Prefix unused variables with underscore (_) to match ESLint config
- ✅ Remove unused imports
- ✅ Refactor functions to use the variables or remove them

### 4. ESLint Ignore Migration ✅ (Completed)
ESLint ignore patterns have been migrated to the flat config.

**Action Items:**
- ✅ Migrate ignore patterns from `.eslintignore` to the `ignores` property in `eslint.config.js`
- Note: The `.eslintignore` file can now be removed if needed

## Build Issues

### 1. Type Export Missing ✅ (Completed)
Build error due to missing exported type has been fixed:
- ✅ Added the missing `AppPlugin` interface to `src/app/types.ts`
- ✅ Updated interface to properly define config and onInitialize properties
- ✅ Added proper type imports in `src/app/createApp.ts`

### 2. Test Console Mock Issues ✅ (Completed)
Test failures due to console logging replacement:
- ✅ Fixed 18 test failures from 6 test files
- ✅ Tests now mock the logger utility instead of console.log

**Action Items:**
- ✅ Created logger mock implementation in `tests/mocks/common/logger.ts`
- ✅ Updated test setup to properly mock the logger utility
- ✅ Updated individual test files to use the logger mock:
  - ✅ `tests/surfaces/cards.test.tsx`
  - ✅ `tests/surfaces/panels.test.tsx`
  - ✅ `tests/surfaces/modals.test.tsx`
  - ✅ `tests/surfaces/canvas.test.tsx`
  - ✅ `tests/common/events-super-agent.test.ts`
  - ✅ `tests/common/super-agent.test.ts`

### 3. Test Coverage
Poor test coverage across multiple files:
- Overall coverage: 45.65% (statements), 37.19% (branches), 32.38% (functions), 46.2% (lines)
- Target thresholds: 75% (statements), 70% (branches), 75% (lines), 70% (functions)

**Action Items:**
- Increase test coverage for core modules
- Add unit tests for surfaces components
- Implement integration tests for plugin functionality

### 4. Dependency Management ⚠️ (In Progress)
There are peer dependency conflicts as seen during package installation attempts.

**Identified Issues:**
- Missing peer dependency: `@vibing-ai/block-kit@^1.0.0`
- Conflicting peer dependencies: `@testing-library/react-hooks@8.0.1` requires `@types/react@^16.9.0 || ^17.0.0` but project has `@types/react@18.3.20`
- Multiple outdated dependencies identified via npm-check-updates

**Action Plan:**
1. Resolve peer dependency for `@vibing-ai/block-kit`:
   - Option 1: Install the missing package using `npm install @vibing-ai/block-kit@^1.0.0`
   - Option 2: If private/internal package, add it to workspace or as a local dependency
   - Option 3: Add to `overrides` section in package.json for resolution

2. Resolve conflict with `@testing-library/react-hooks`:
   - Option 1: Downgrade `@types/react` to v17 (not recommended as it may break other dependencies)
   - Option 2: Upgrade `@testing-library/react-hooks` to a version compatible with React 18
   - Option 3: Use `--legacy-peer-deps` flag temporarily during development

3. Incremental dependency updates:
   - Create groups of related dependencies to update together
   - Prioritize security updates first
   - Test each group update thoroughly before proceeding to next
   
4. Update package.json's peerDependencies section to be more explicit about version requirements

5. Document dependency requirements and known conflicts in README.md for future developers

**Implementation Sequence:**
1. Create a separate branch for dependency updates
2. Resolve critical peer dependency conflicts first
3. Update testing libraries as a group
4. Update React and React-related packages
5. Update build tooling (rollup, typescript, etc.)
6. Run tests after each group update to ensure compatibility

### 5. Jest Configuration
Test failures have been fixed by updating Jest configuration:

**Action Items:**
- ✅ Updated Jest configuration to properly mock the logger utility across all test files
- ✅ Created reusable mock implementation for the logger utility
- Set up proper test environment for all component types

## Next Steps Priority

1. ✅ Fix the build error by adding the missing `AppPlugin` export (COMPLETED)
2. ✅ Update tests to work with the new logger utility (COMPLETED)
3. ✅ Address 'any' types in type definitions (COMPLETED - 12 of 12 files fixed)
4. ✅ Fix unused variables warnings (COMPLETED)
5. ✅ Migrate ESLint ignore settings to flat config (COMPLETED)
6. 🔄 Resolve dependency conflicts (IN PROGRESS)
7. Improve test coverage
8. Set up pre-commit hooks with husky

## Implementation Plan

| Task | Issue Type | Estimated Time | Priority | Status |
|------|------------|----------------|----------|--------|
| Fix missing AppPlugin export | Build | 30 mins | Blocker | ✅ COMPLETED |
| Update tests for logger utility | Test | 4 hours | High | ✅ COMPLETED |
| Migrate ESLint ignore to flat config | Linting | 1 hour | High | ✅ COMPLETED |
| Fix 'any' types in core components | Linting | 4 hours | High | ✅ COMPLETED |
| Fix 'any' types in surface components | Linting | 4 hours | High | ✅ COMPLETED |
| Fix 'any' types in remaining files | Linting | 2 hours | High | ✅ COMPLETED |
| Fix unused variables | Linting | 2 hours | Medium | ✅ COMPLETED |
| Resolve dependency conflicts | Build | 2 hours | Medium | 🔄 IN PROGRESS |
| Improve test coverage for core modules | Test | 6 hours | Medium | PENDING |
| Improve test coverage for surfaces | Test | 8 hours | Medium | PENDING |
| Set up pre-commit hooks | CI/CD | 1 hour | Low | PENDING |

## Technical Debt Items

1. Consistent error handling strategy
2. Performance optimization for large datasets
3. Better TypeScript strict mode compliance
4. Improved documentation and examples
5. Modularization of surface components
6. TypeScript project references for incremental builds
7. Comprehensive API documentation
8. Integration and end-to-end testing strategy 