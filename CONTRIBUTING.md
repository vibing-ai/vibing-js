# Contributing to Vibing AI SDK

Thank you for your interest in contributing to the Vibing AI JavaScript SDK!

## Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/yourusername/vibing-js.git
   cd vibing-js
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Development Workflow

1. Create a branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure they follow the coding conventions

3. Run tests:
   ```bash
   npm test
   ```

4. Run linting:
   ```bash
   npm run lint
   ```

5. Commit your changes with meaningful commit messages

## Code Style and Conventions

- Follow TypeScript best practices
- Document public APIs with JSDoc comments
- Write tests for new functionality
- Use Prettier for code formatting
- Follow the existing pattern in the codebase

## Commit Message Format

Please follow these guidelines for commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

Example:
```
Add memory persistence layer

Implements the memory persistence module with localStorage and adds tests.
Fixes #123
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the documentation with any new interfaces or APIs
3. Ensure all tests pass and add new tests for your code
4. The PR should work for Node.js 16.x and above
5. Request a review from a maintainer

## Testing Requirements

- Maintain or improve test coverage
- Include unit tests for new functionality
- Ensure all existing tests pass

## Documentation Requirements

- Add JSDoc comments to all public interfaces and functions
- Update any relevant documentation files
- Include usage examples for new features

## Issue Reporting Guidelines

- Use the issue templates provided
- Include clear reproduction steps for bugs
- For feature requests, explain the use case and expected behavior

Thanks for contributing! 