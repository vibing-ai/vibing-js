# Contributing to Vibing AI SDK

Thank you for considering contributing to the Vibing AI SDK! This document outlines the process and guidelines for contributing to our project.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Development Setup

### Prerequisites

- Node.js (v14 or later)
- npm, yarn, or pnpm
- Git

### Setup Steps

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/js-sdk.git
   cd js-sdk
   ```

3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/vibing-ai/js-sdk.git
   ```

4. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

5. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   # or
   pnpm build
   ```

## Development Workflow

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them with descriptive commit messages (see our commit message format below)

3. Write or update tests for your changes

4. Run tests to ensure everything works:
   ```bash
   npm test
   # or
   yarn test
   # or
   pnpm test
   ```

5. Update documentation for any new features or changes

6. Rebase your branch on the latest upstream main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

7. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

8. Create a pull request from your fork to the main repository

## Code Style and Conventions

We follow strict coding conventions to maintain consistency throughout the codebase:

### TypeScript Style

- Use TypeScript for all new code
- Prefer interfaces over type aliases for object types
- Use explicit return types on functions and methods
- Use readonly modifiers where applicable
- Avoid the any type where possible
- Use union types instead of enums
- Use optional chaining and nullish coalescing when appropriate

### JSDoc Comments

All public APIs should have JSDoc comments following this pattern:

```typescript
/**
 * Brief description of what the function does
 *
 * @param paramName - Description of the parameter
 * @param anotherParam - Description of another parameter
 * @returns Description of the return value
 *
 * @example
 * ```typescript
 * // Example usage
 * const result = someFunction('example', 123);
 * ```
 */
function someFunction(paramName: string, anotherParam: number): ReturnType {
  // Implementation
}
```

### File Organization

- One class/interface/type per file when possible
- Group related functionality in directories
- Use index.ts files for re-exporting
- Keep file and directory names in kebab-case

### Testing Standards

- Write unit tests for all new functionality
- Maintain or improve test coverage
- Use descriptive test names that explain the expected behavior
- Structure tests with describe and it blocks
- Use mock data and avoid external dependencies in tests

## Commit Message Format

We follow the Conventional Commits specification for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Code changes that improve performance
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

Example:
```
feat(memory): add persistent storage option

Implements LocalStorage and IndexedDB adapters for persistent memory storage.
This allows application state to persist across sessions.

Closes #123
```

## Pull Request Process

1. **Before submitting a PR**:
   - Update documentation for any changed functionality
   - Add or update tests for all changes
   - Ensure all tests pass locally
   - Verify your changes work in all supported environments
   - Make sure your code follows the style guidelines

2. **Pull Request Template**:
   All PRs should include:
   - A clear description of the changes
   - Link to related issues
   - Screenshots or examples for UI changes
   - List of testing done
   - Any breaking changes

3. **PR Title**:
   Follow the same convention as commit messages:
   ```
   feat(component): add new feature
   ```

4. **Review Process**:
   - All PRs require at least one review from a maintainer
   - Address all review comments and requested changes
   - Continuous Integration checks must pass
   - Code coverage should not decrease

5. **Merge Requirements**:
   - PR must be approved by at least one maintainer
   - All CI checks must pass
   - PR must be up to date with the main branch

## Documentation Requirements

- Add JSDoc comments to all public interfaces and functions
- Update any relevant documentation files
- Include usage examples for new features
- Update API references when changing interfaces
- Add explanations for complex implementations

## Issue Reporting Guidelines

- Always search for existing issues before creating a new one
- Use the provided issue templates
- Include clear reproduction steps for bugs
- For feature requests, explain the use case and expected behavior
- Include your environment details: OS, Node.js version, browser if applicable

### Bug Report Template

```markdown
## Bug Description
A clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened (include error messages, screenshots if applicable)

## Environment
- OS: [e.g. Windows 10, macOS 12.0]
- Node.js version: [e.g. 16.5.0]
- Browser (if applicable): [e.g. Chrome 96]
- SDK Version: [e.g. 1.2.0]

## Additional Context
Any additional information that might be relevant
```

### Feature Request Template

```markdown
## Feature Description
A clear description of the feature you'd like to see

## Use Case
Explain why this feature would be valuable and how it would be used

## Proposed Solution
If you have ideas about how to implement it, describe them here

## Alternatives Considered
Any alternative solutions or features you've considered

## Additional Context
Any other context, screenshots, or examples about the feature request
```

## Community

- Join our [Discord server](https://discord.gg/vibingai) for discussion
- Follow us on [Twitter](https://twitter.com/vibingai) for updates
- Check our [blog](https://vibing.ai/blog) for detailed articles

## Recognition

Contributors will be recognized in the following ways:
- Listed in the Contributors section of the README
- Mentioned in release notes for significant contributions
- Featured in our community showcase for major features

Thank you for contributing to making the Vibing AI SDK better for everyone! 