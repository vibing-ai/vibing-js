# Browser Compatibility

This document outlines the browser compatibility information for the Vibing AI SDK.

## Supported Browsers

The Vibing AI SDK is tested and supported on the following browsers:

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 60+ | Fully supported |
| Firefox | 60+ | Fully supported |
| Safari | 12+ | Fully supported |
| Edge (Chromium) | 79+ | Fully supported |
| Edge (Legacy) | Not supported | Please upgrade to Chromium-based Edge |
| Internet Explorer | Not supported | Please use a modern browser |

## Mobile Browser Support

| Browser | Platform | Minimum Version | Notes |
|---------|----------|----------------|-------|
| Chrome | Android | 60+ | Fully supported |
| Safari | iOS | 12+ | Fully supported |
| Firefox | Android | 60+ | Fully supported |
| Samsung Internet | Android | 8.0+ | Fully supported |

## Feature Support

The SDK automatically handles compatibility differences between browsers through feature detection and fallbacks. Here's how various features are supported:

| Feature | Support Level | Fallback |
|---------|--------------|----------|
| LocalStorage | All supported browsers | Memory storage fallback |
| Fetch API | All supported browsers | Automatic polyfill |
| ES Modules | All supported browsers | Transpiled to ES5 |
| Intersection Observer | All supported browsers | Polyfill for older browsers |
| CSS Variables | All supported browsers | Static values for older browsers |
| Flex Layout | All supported browsers | None required |
| CSS Grid | All supported browsers | Flexbox fallback on older browsers |

## Automated Compatibility Detection

The SDK includes built-in compatibility detection that will warn you in development mode if you're using an unsupported browser. To manually check compatibility:

```javascript
import { checkCompatibility } from '@vibing-ai/sdk/common/compat';

const result = checkCompatibility();
if (!result.compatible) {
  console.warn(`Browser compatibility issue: ${result.reason}. ${result.recommendation}`);
}
```

## Polyfill Strategy

The SDK uses a targeted polyfill strategy to minimize bundle size:

1. Core polyfills are included automatically for features that are essential for SDK functionality
2. Optional polyfills are loaded on-demand only when needed
3. Polyfills are not loaded in modern browsers that already support required features

To manually load a polyfill:

```javascript
import { loadPolyfill } from '@vibing-ai/sdk/common/compat';

// Load only if needed
await loadPolyfill('intersectionObserver');
```

## Browser-Specific Considerations

### Safari

- IndexedDB storage in Safari has limitations in private browsing mode. The SDK automatically falls back to memory storage in these cases.
- Safari's implementation of Shadow DOM has some differences. The SDK provides normalizations for these differences.

### Firefox

- Firefox handles some CSS animations differently. The SDK's styles account for these differences.

### Mobile Browsers

- The SDK's UI components are designed to be responsive and touch-friendly by default.
- Scrolling behaviors are optimized for mobile to prevent common issues with touch interactions.

## Best Practices

1. **Test on multiple browsers**: While the SDK handles most compatibility issues, always test your app on different browsers.

2. **Responsive design**: Use the SDK's responsive components and layouts for better cross-browser compatibility.

3. **Feature detection**: Use the SDK's feature detection utilities instead of browser detection:

```javascript
import { features } from '@vibing-ai/sdk/common/compat';

if (features.intersectionObserver()) {
  // Use Intersection Observer
} else {
  // Use alternative approach
}
```

4. **Graceful degradation**: Design your app to work even when certain features aren't available:

```javascript
import { safeCall } from '@vibing-ai/sdk/common/compat';

// Will use fallback if the browser doesn't support the feature
const result = safeCall(() => {
  return window.someNewFeature.doSomething();
}, 'fallback value');
```

## Known Issues

- The SDK's UI components may have slight visual differences between browsers. These are intentional adjustments to maintain consistent user experience.
- Performance characteristics may vary between browsers, especially on lower-end devices.
- WebRTC features have some implementation differences across browsers that may affect advanced use cases. 