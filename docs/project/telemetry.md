# Telemetry in Vibing AI SDK

The Vibing AI SDK includes an optional telemetry system that collects anonymous usage data to help us improve the developer experience. This document explains what data is collected, how it's used, and how to control telemetry settings.

## Telemetry Philosophy

Our telemetry system is built on the following principles:

- **Strictly opt-in**: Telemetry is disabled by default and must be explicitly enabled.
- **Privacy-focused**: We collect only anonymous, non-identifying information.
- **Transparent**: We clearly document all data collection.
- **Minimal**: We collect only what's necessary to improve the SDK.
- **Controlled**: You have full control over what data is shared.

## What Data Is Collected

When telemetry is enabled, we collect:

### Feature Usage Statistics

- Which APIs and features are used
- Feature configuration patterns (without sensitive values)
- Performance characteristics of features
- SDK initialization patterns

### Error Information

- Error types and frequencies
- Stack traces with PII (Personally Identifiable Information) removed
- Context in which errors occur
- Recovery attempts

### Performance Metrics

- Operation durations
- Resource utilization patterns
- Rendering performance metrics
- Network request timings (without URLs or payloads)

### Environment Information

- SDK version
- Node.js version
- Browser type/version (if applicable)
- OS type (without specific version)
- Basic device characteristics (mobile vs. desktop)

## What Is NOT Collected

We do NOT collect:

- Personal information (names, emails, etc.)
- API keys, tokens, or credentials
- Content of your applications or messages
- User data or inputs
- IP addresses or precise geolocation
- Full URLs or domain names
- Device identifiers

## Data Anonymization

All telemetry data is anonymized before submission:

1. A random installation ID is generated for each SDK installation
2. Sensitive fields (password, token, apiKey, etc.) are automatically filtered
3. Long strings are truncated to prevent accidental PII collection
4. Stack traces are sanitized to remove file paths and project-specific details
5. Data is aggregated when possible

## How Data Is Used

Telemetry data helps us:

- Identify bugs and issues that affect users
- Understand which features are most valuable
- Prioritize improvements and new features
- Optimize performance for real-world usage patterns
- Improve documentation for commonly used features

## Data Retention

Telemetry data is:

- Stored securely in our protected analytics infrastructure
- Retained for a maximum of 12 months
- Aggregated for long-term trend analysis with all identifiers removed
- Not shared with third parties

## Enabling/Disabling Telemetry

### Disabling Telemetry (Default)

Telemetry is **disabled by default**. You don't need to do anything to keep it disabled.

### Enabling Telemetry

To enable telemetry, initialize the SDK with the `telemetry` option:

```js
import { createApp, initTelemetry } from '@vibing-ai/sdk';

// Option 1: Enable when creating an app
const app = createApp({
  name: 'My App',
  // ... other options
  telemetry: {
    enabled: true,
    // Optional granular control
    featureUsage: true,
    errorReporting: true,
    performanceMetrics: true
  }
});

// Option 2: Enable separately
initTelemetry({
  enabled: true,
  // Optional granular control
  featureUsage: true,
  errorReporting: true,
  performanceMetrics: false, // Disable specific collection
});
```

### Granular Control

You can enable/disable specific types of telemetry:

```js
initTelemetry({
  enabled: true,
  featureUsage: true,    // Collect feature usage
  errorReporting: true,  // Collect error reports
  performanceMetrics: false, // Don't collect performance metrics
  environmentInfo: true  // Collect environment info
});
```

### Runtime Control

You can enable or disable telemetry at runtime:

```js
import { disableTelemetry, initTelemetry, getTelemetryConfig } from '@vibing-ai/sdk';

// Disable telemetry
disableTelemetry();

// Re-enable telemetry
initTelemetry({ enabled: true });

// Check current configuration
const config = getTelemetryConfig();
console.log('Telemetry enabled:', config.enabled);
```

## Development Notice

When telemetry is enabled in a development environment, a console notice will appear:

```
[Vibing SDK] Telemetry is enabled. To learn more or opt out, visit https://docs.vibing.ai/telemetry
```

This notice only appears in development to avoid console clutter in production.

## Enterprise Controls

For enterprise users with compliance requirements, we offer additional controls:

- Custom data retention policies
- On-premises telemetry endpoints
- Signed data processing agreements
- Compliance certifications

Contact enterprise@vibing.ai for more information.

## Feedback and Questions

If you have questions or concerns about telemetry:

- File an issue on GitHub
- Email privacy@vibing.ai
- Join our Discord community for discussion

We welcome feedback on our telemetry practices and are committed to transparency. 