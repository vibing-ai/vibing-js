# Changelog

All notable changes to the Vibing AI SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Advanced analytics integration
- Additional surface types
- Performance optimizations for large-scale applications

## [1.0.0] - 2023-04-25

### Added
- Complete SDK core functionality
- App creation and management
- Plugin development support
- Agent creation and configuration
- Surface integration (cards, panels, modals)
- Memory management system
- Event system for communication
- Permission system for security
- Complete TypeScript support
- Integration with @vibing-ai/block-kit
- Integration with @vibing-ai/cli
- Comprehensive error handling system
- Versioning and compatibility system
- Browser compatibility enhancements
- Production-ready optimizations

### Changed
- Improved API consistency across all modules
- Enhanced TypeScript types for better developer experience
- Optimized bundle size through tree-shaking and code splitting

### Fixed
- All known issues from beta releases
- Browser compatibility issues
- Performance bottlenecks

## [0.9.0] - 2023-03-10

### Added
- Beta version of the SDK
- Initial implementation of core features
- Preliminary documentation

### Known Limitations
- Limited browser compatibility
- Some API endpoints subject to change
- Performance optimizations pending

## Upgrade Guidance

### Upgrading from 0.9.0 (Beta)
- Replace deprecated `createAppLegacy` with `createApp`
- Update surface initialization to use the new unified API
- Migrate to the new error handling system
- Check TypeScript types as some interfaces have been refined

---

## How to Contribute to the Changelog

When contributing to this project, please add your changes to the "Unreleased" section following these guidelines:

1. Add your changes under the appropriate category:
   - **Added** for new features
   - **Changed** for changes in existing functionality
   - **Deprecated** for soon-to-be removed features
   - **Removed** for now removed features
   - **Fixed** for any bug fixes
   - **Security** in case of vulnerabilities

2. Reference GitHub issues or PRs when applicable (e.g., "- Fixed memory leak (#123)")

3. Provide clear, concise descriptions of the changes 