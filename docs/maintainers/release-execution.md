# Release Execution Guide

This guide provides a step-by-step process for executing a release of the Vibing AI SDK. Follow these instructions after completing all items in the [Pre-Release Checklist](./release-checklist.md).

## 1. Final Preparation Steps

### Verify Pre-Release Checklist

```bash
# View the pre-release checklist and ensure all items are complete
open docs/maintainers/release-checklist.md
```

### Update Version

```bash
# Edit package.json to update version
npm version [major|minor|patch] --no-git-tag-version
```

Replace `[major|minor|patch]` with the appropriate version increment based on the changes in this release, following semantic versioning principles.

### Update CHANGELOG.md

```bash
# Open CHANGELOG.md for editing
code CHANGELOG.md
```

- Move all items from the "Unreleased" section to a new section with the version number and release date
- Format: `## [1.2.3] - 2023-04-25`
- Ensure all significant changes are properly documented and categorized

### Commit Changes

```bash
# Add the updated files
git add package.json CHANGELOG.md src/version.ts

# Commit the changes
git commit -m "chore: release v1.2.3"
```

Replace `1.2.3` with the actual version number.

### Create Git Tag

```bash
# Create an annotated tag
git tag -a v1.2.3 -m "v1.2.3 - Brief description of release"

# Verify the tag was created
git tag -l -n1
```

Replace `1.2.3` and the description with appropriate values.

## 2. Build and Test

### Clean Build Directory

```bash
# Remove previous build artifacts
npm run clean
```

### Run Full Build Process

```bash
# Build the SDK
npm run build

# Verify build output exists and looks correct
ls -la dist/
```

### Run All Tests

```bash
# Run all test suites
npm test

# Verify all tests pass
echo $?  # Should output 0 if tests passed
```

### Create a Package Locally

```bash
# Create a tarball of the package
npm pack

# Verify the tarball was created
ls -la vibing-ai-sdk-*.tgz
```

### Test the Packed Version

```bash
# Create a temporary directory
mkdir -p /tmp/vibing-sdk-test
cd /tmp/vibing-sdk-test

# Initialize a test project
npm init -y

# Install the packed SDK
npm install /path/to/vibing-ai-sdk-*.tgz

# Create a test script
echo "
const vibingSDK = require('@vibing-ai/sdk');
console.log('SDK Version:', vibingSDK.version);
" > test.js

# Run the test script
node test.js

# Return to the project directory
cd /path/to/project
```

## 3. Publishing Steps

### Log in to npm

```bash
# Log in to npm (ensure you have publish access to @vibing-ai org)
npm login

# Verify you're logged in as the correct user
npm whoami
```

### Publish the Package

```bash
# Publish to npm
npm publish --access public

# Verify the package was published
npm view @vibing-ai/sdk version
```

### Push Git Tag

```bash
# Push the tag to the remote repository
git push origin v1.2.3

# Push the release commit
git push origin [branch-name]
```

Replace `[branch-name]` with the name of your current branch (e.g., `main`).

### Create GitHub Release

```bash
# Open GitHub releases page to create a new release
open https://github.com/vibing-ai/sdk/releases/new
```

- Select the tag you just pushed
- Title: `v1.2.3: Release Name`
- Description: Copy from CHANGELOG.md and format appropriately
- Include any additional notes, migration guides, or highlights
- If there are any assets to upload (e.g., examples, demos), attach them
- Click "Publish release"

### Upload Artifacts (if needed)

If there are any additional artifacts that need to be uploaded (e.g., to CDN, documentation site):

```bash
# Example: Upload docs to S3 (adjust as needed)
aws s3 sync ./docs/dist s3://docs.vibing.ai/sdk/v1.2.3/
```

## 4. Verification Steps

### Install from npm in a Test Project

```bash
# Create a test directory
mkdir -p /tmp/vibing-test-published
cd /tmp/vibing-test-published

# Initialize a project
npm init -y

# Install the published SDK
npm install @vibing-ai/sdk

# Create a test script
echo "
const vibingSDK = require('@vibing-ai/sdk');
console.log('SDK Version:', vibingSDK.version);
" > test.js

# Run the test script
node test.js

# Return to the project directory
cd /path/to/project
```

### Verify Published Documentation

```bash
# Open the documentation site
open https://docs.vibing.ai/sdk/v1.2.3/
```

Verify:
- Documentation is accessible
- Version numbers are correct
- Examples work as expected

### Check npm Package Page

```bash
# Open the npm package page
open https://www.npmjs.com/package/@vibing-ai/sdk
```

Verify:
- Version is updated
- README is displayed correctly
- Package information is accurate

### Verify GitHub Release Page

```bash
# Open the GitHub release page
open https://github.com/vibing-ai/sdk/releases/tag/v1.2.3
```

Verify:
- Release notes are formatted correctly
- Assets are available for download (if applicable)
- Tag is correctly linked

### Run Smoke Tests on the Published Version

```bash
# Clone the examples repository
git clone https://github.com/vibing-ai/sdk-examples.git /tmp/sdk-examples
cd /tmp/sdk-examples

# Update to use the new SDK version
npm install @vibing-ai/sdk@latest

# Run the examples
npm run examples

# Return to the project directory
cd /path/to/project
```

## 5. Announcement Steps

### Publish Blog Post (if applicable)

```bash
# Open the blog post draft
open docs/launch/blog-post.md
```

- Finalize the blog post content
- Publish to the appropriate platform
- Share the link with the team

### Send Social Media Announcements

```bash
# Open social media kit
open docs/launch/social-media-kit.md
```

- Post announcements on Twitter, LinkedIn, etc.
- Share in relevant communities (Discord, Slack, etc.)
- Monitor for engagement and questions

### Update Website (if applicable)

```bash
# Update the website with new version info
open https://github.com/vibing-ai/website
```

- Update download links
- Add new release information
- Update compatibility information

### Notify Existing Users (if applicable)

```bash
# Send notification email (if using a mailing service)
open docs/launch/email-template.md
```

- Finalize the email content
- Send to the mailing list
- Monitor for responses and questions

### Monitor Feedback Channels

```bash
# Open GitHub issues
open https://github.com/vibing-ai/sdk/issues

# Open Discord channel
open https://discord.gg/vibing-ai

# Open community forums
open https://community.vibing.ai
```

- Monitor for feedback, questions, and issues
- Respond promptly to critical issues
- Document feedback for future improvements

## 6. Post-Release Cleanup

### Update Development Version

```bash
# Update version for development
npm version --no-git-tag-version prerelease --preid dev

# Commit the change
git add package.json
git commit -m "chore: begin development on next version"
git push origin [branch-name]
```

### Create New Unreleased Section in CHANGELOG

```bash
# Edit CHANGELOG.md
code CHANGELOG.md
```

Add a new "Unreleased" section at the top:

```markdown
## [Unreleased]

### Added
- (Nothing yet)

### Changed
- (Nothing yet)

### Fixed
- (Nothing yet)

### Removed
- (Nothing yet)
```

### Review Release Process

Schedule a team meeting to discuss:
- What went well in the release process
- What could be improved
- Action items for improving the next release

## Conclusion

Congratulations on completing the release! The new version is now available to users. Follow the [Post-Release Activities Guide](./post-release.md) for next steps on monitoring, supporting, and planning for the next release. 