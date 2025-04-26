# Release Guide for Maintainers

This document outlines the procedures for planning, executing, and communicating releases of the Vibing AI SDK, including regular releases and hotfixes.

## Release Types

### Standard Releases

- **Major releases** (1.0.0, 2.0.0): Include breaking changes, major new features
- **Minor releases** (1.1.0, 1.2.0): Add new features in a backward-compatible manner
- **Patch releases** (1.0.1, 1.0.2): Bug fixes and minor improvements

### Hotfix Releases

Emergency fixes for critical issues that cannot wait for the next standard release.

## Release Schedule

- **Major releases**: Scheduled 2-3 times per year with significant advance notice
- **Minor releases**: Approximately every 4-6 weeks
- **Patch releases**: As needed, typically every 1-2 weeks
- **Hotfixes**: Immediately as needed for critical issues

## Hotfix Protocol

### Criteria for Hotfixes

A hotfix should be issued when:

1. A critical bug affects a large portion of users
2. A security vulnerability is discovered
3. A data loss or corruption issue is identified
4. Core functionality is broken in the current release

### Hotfix Process

1. **Identification**:
   - Confirm issue severity meets hotfix criteria
   - Get approval from engineering lead

2. **Development**:
   - Create a hotfix branch from the current release tag: `git checkout -b hotfix-x.y.z release-x.y.z`
   - Implement minimal changes to fix the specific issue
   - Avoid including new features or non-critical fixes

3. **Testing**:
   - Perform focused testing on the specific issue
   - Run regression tests to ensure no new issues
   - Have at least one other team member verify the fix

4. **Deployment**:
   - Bump version according to semver (usually patch)
   - Update CHANGELOG.md with hotfix details
   - Create a new npm tag for the hotfix
   - Merge hotfix branch back to both main and release branches

5. **Communication**:
   - Issue security advisory if applicable
   - Notify users through available channels
   - Update documentation with issue details and fix

### Hotfix Communication Template

```
SECURITY HOTFIX: Vibing AI SDK v1.0.X

We've released version 1.0.X of the Vibing AI SDK addressing a [critical security vulnerability/serious bug] that affects [describe impact].

Issue: [Brief description of the issue]
Fix: [Brief description of the fix]
Affected versions: [List of affected versions]
Recommended action: Update immediately to version 1.0.X

npm install @vibing-ai/sdk@1.0.X

If you cannot update immediately, we recommend [workaround if available].

For more details, see [link to security advisory/issue].
```

## Standard Release Process

### 1. Release Planning

1. **Feature Collection**:
   - Review and prioritize merged PRs since last release
   - Collect all resolved issues to include in release notes
   - Identify any dependencies that need updating

2. **Version Decision**:
   - Determine appropriate version bump based on changes
   - Update version in package.json and other relevant files
   - Create or update version compatibility documentation

3. **Documentation Updates**:
   - Ensure all new features are properly documented
   - Update API references for any changed APIs
   - Review and update guides if necessary
   - Finalize CHANGELOG.md entries

### 2. Release Preparation

1. **Testing**:
   - Run full test suite on multiple environments
   - Perform manual testing of key features
   - Run compatibility tests with dependent packages
   - Verify documentation accuracy

2. **Build Verification**:
   - Create production build
   - Verify bundle size is within acceptable limits
   - Check that all exports are correctly configured
   - Verify source maps are correctly generated

3. **Pre-release (Optional)**:
   - Consider publishing a release candidate: `npm publish --tag next`
   - Collect feedback from internal teams or trusted users
   - Address any last-minute issues

### 3. Release Execution

1. **Final Verification**:
   - Run pre-release checklist one final time
   - Ensure CI pipeline passes all checks
   - Verify version numbers are consistent

2. **Git Operations**:
   - Create a release branch if not exists: `git checkout -b release-x.y.z`
   - Tag the release: `git tag v1.2.3`
   - Push the tag: `git push origin v1.2.3`

3. **Publishing**:
   - Publish to npm: `npm publish`
   - Verify package is available on npm
   - Create GitHub release with release notes

### 4. Post-Release

1. **Verification**:
   - Install from npm in a test project to verify it works
   - Check npm package page for correct information
   - Verify documentation site is updated

2. **Announcement**:
   - Publish release announcement to blog
   - Share on social media channels
   - Update community forums or Discord
   - Email newsletter if applicable

3. **Monitoring**:
   - Monitor issue reports for 24-48 hours after release
   - Be prepared to issue a hotfix if critical issues emerge
   - Track adoption metrics

## Release Notes Guidelines

Release notes should be:

1. **Comprehensive**: Cover all notable changes
2. **Categorized**: Group changes by type (Added, Changed, Fixed, etc.)
3. **User-focused**: Explain impact and benefits to users
4. **Actionable**: Include upgrade instructions when needed
5. **Credited**: Acknowledge community contributions

### Release Notes Template

```
# Vibing AI SDK v1.2.3

Release Date: YYYY-MM-DD

## Highlights

Brief overview of the most important changes in this release.

## Added

* New feature A - enables users to...
* New API for handling X - makes it easier to...

## Changed

* Improved performance of feature B by X%
* Updated dependency C to version X.Y.Z

## Fixed

* Fixed issue with feature D that caused... (#123)
* Resolved a bug where... (#456)

## Deprecated

* Feature E will be removed in version X.Y.Z, use feature F instead

## Breaking Changes (if applicable)

* Changed API signature for method G - update your code by...

## Security

* Addressed security vulnerability in... (CVE-YYYY-XXXXX)

## Dependencies

* Updated dependency X to version A.B.C
* Added new dependency Y version D.E.F

## Contributors

Thanks to the following people who contributed to this release:
@username1, @username2, @username3

## Upgrading

npm install @vibing-ai/sdk@1.2.3
```

## Rollback Procedures

If a critical issue is discovered after release:

1. **Assessment**:
   - Determine severity and impact
   - Decide between hotfix or rollback

2. **Rollback Process**:
   - Unpublish recent version if within 72 hours: `npm unpublish @vibing-ai/sdk@1.2.3`
   - Or deprecate the version: `npm deprecate @vibing-ai/sdk@1.2.3 "Critical issue found, please use version 1.2.2"`
   - Communicate rollback to users

3. **Follow-up**:
   - Investigate root cause
   - Implement fix on previous version
   - Release new version with fix
   - Update post-mortem documentation

## Security Issue Handling

For security vulnerabilities:

1. **Privately disclose** to security@vibing.ai
2. **Assess severity and impact**
3. **Develop fix** without disclosing vulnerability details
4. **Release hotfix** following hotfix protocol
5. **Disclose vulnerability** after fix is available:
   - Create CVE if applicable
   - Publish security advisory
   - Notify users to update

## Release Checklist

Use the [../release-checklist.md](../release-checklist.md) document before every release to ensure all necessary steps are completed. 