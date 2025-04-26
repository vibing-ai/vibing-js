# Security Policy

## Reporting a Vulnerability

The Vibing AI team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

To report a security issue, please email [security@vibing.ai](mailto:security@vibing.ai) with a description of the issue, the steps you took to create it, affected versions, and if known, mitigations for the issue. Our security team will respond within 48 hours.

Please do **NOT** file a public GitHub issue for security vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Security Update Policy

Security updates will be released in the following ways:

1. **Critical vulnerabilities**: Patched as soon as possible and released as a patch version
2. **High severity issues**: Addressed within 30 days, typically as part of the next patch release
3. **Medium severity issues**: Addressed within 90 days, typically as part of a minor release
4. **Low severity issues**: Addressed as time permits, typically in the next minor release

## Best Practices

For guidelines on writing secure applications with our SDK, please refer to:

- [Security Guide](https://github.com/vibing-ai/vibing-js/blob/main/docs/guides/security.md)
- [API Security Recommendations](https://github.com/vibing-ai/vibing-js/blob/main/docs/api-reference.md#security-considerations)

## Security Features

The Vibing AI SDK includes several security features:

- Secure storage utilities for sensitive data
- Input sanitization helpers
- Permission validation system
- Content Security Policy recommendations
- CSRF protection mechanisms
- Security logging
- Rate limiting utilities

## Third-party Dependencies

We regularly monitor our dependencies for security issues and update them as needed. Our CI/CD pipeline includes automated vulnerability scanning of all dependencies.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the issue and determine its severity
2. Develop a fix for the issue
3. Release a new version with the fix
4. Make an announcement about the vulnerability, including CVE if applicable

## Security Contacts

- Primary Contact: [security@vibing.ai](mailto:security@vibing.ai)
- Secondary Contact: [support@vibing.ai](mailto:support@vibing.ai) 