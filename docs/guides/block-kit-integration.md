# Block Kit Integration Guide

This guide explains how to integrate the Vibing AI SDK with the @vibing-ai/block-kit component library for creating beautiful, consistent, and interactive user interfaces.

## Overview

The @vibing-ai/block-kit package provides a set of React components that work seamlessly with the Vibing AI SDK. This integration offers several advantages:

- **Consistent Design Language**: Pre-designed components following Vibing AI's design system
- **Responsive Layouts**: Components that work across devices and screen sizes
- **Accessibility**: WCAG 2.1 AA compliant components
- **Theme Support**: Built-in light and dark themes with customization
- **Performance Optimized**: Efficient rendering and state management
- **Type Safety**: Fully typed props for improved developer experience

## Installation

Install both the SDK and Block Kit packages:

```bash
# Using npm
npm install @vibing-ai/sdk @vibing-ai/block-kit

# Using yarn
yarn add @vibing-ai/sdk @vibing-ai/block-kit
```

## Basic Integration

### 1. Wrap Your Application

Use the `BlockKitProvider` to enable Block Kit components:

```tsx
import { createApp } from '@vibing-ai/sdk';
import { BlockKitProvider } from '@vibing-ai/block-kit';

const app = createApp({
  name: 'My App',
  // other app configuration...
  
  render: () => (
    <BlockKitProvider theme="light">
      <YourAppComponent />
    </BlockKitProvider>
  )
});
```

### 2. Use Block Kit Components

Once your app is wrapped in the provider, you can use Block Kit components:

```tsx
import { TextBlock, ButtonBlock, CardBlock } from '@vibing-ai/block-kit';

function YourAppComponent() {
  return (
    <CardBlock>
      <TextBlock content="Hello from Block Kit!" />
      <ButtonBlock 
        label="Click Me" 
        onClick={() => console.log('Button clicked')} 
      />
    </CardBlock>
  );
}
```

## Component Mapping

The SDK's surface components automatically map to Block Kit components when available. Here's how the mapping works:

### Cards

```tsx
// SDK way (automatically uses Block Kit when available)
import { useCards } from '@vibing-ai/sdk';

function MyComponent() {
  const { showCard } = useCards();
  
  const handleClick = () => {
    showCard({
      content: <p>This is a card</p>,
      actions: <button>Action</button>
    });
  };
}

// Direct Block Kit way
import { CardBlock, CardContent, CardActions } from '@vibing-ai/block-kit';

function MyComponent() {
  return (
    <CardBlock>
      <CardContent>This is a card</CardContent>
      <CardActions>
        <button>Action</button>
      </CardActions>
    </CardBlock>
  );
}
```

### Panels

```tsx
// SDK way
import { usePanels } from '@vibing-ai/sdk';

function MyComponent() {
  const { showPanel } = usePanels();
  
  const handleClick = () => {
    showPanel({
      title: 'Information',
      content: <p>This is a panel</p>,
      footer: <button>Close</button>
    });
  };
}

// Direct Block Kit way
import { PanelBlock, PanelHeader, PanelContent, PanelFooter } from '@vibing-ai/block-kit';

function MyComponent() {
  return (
    <PanelBlock>
      <PanelHeader>Information</PanelHeader>
      <PanelContent>This is a panel</PanelContent>
      <PanelFooter>
        <button>Close</button>
      </PanelFooter>
    </PanelBlock>
  );
}
```

### Modals

```tsx
// SDK way
import { useModals } from '@vibing-ai/sdk';

function MyComponent() {
  const { showModal } = useModals();
  
  const handleClick = () => {
    showModal({
      title: 'Confirmation',
      content: <p>Are you sure?</p>,
      actions: (
        <>
          <button>Cancel</button>
          <button>Confirm</button>
        </>
      )
    });
  };
}

// Direct Block Kit way
import { ModalBlock, ModalHeader, ModalContent, ModalFooter } from '@vibing-ai/block-kit';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      {isOpen && (
        <ModalBlock onClose={() => setIsOpen(false)}>
          <ModalHeader>Confirmation</ModalHeader>
          <ModalContent>Are you sure?</ModalContent>
          <ModalFooter>
            <button onClick={() => setIsOpen(false)}>Cancel</button>
            <button onClick={() => setIsOpen(false)}>Confirm</button>
          </ModalFooter>
        </ModalBlock>
      )}
    </>
  );
}
```

## Theming

Block Kit supports both light and dark themes, as well as custom theming.

### Theme Options

```tsx
// Light theme
<BlockKitProvider theme="light">

// Dark theme
<BlockKitProvider theme="dark">

// System preference
<BlockKitProvider useSystemTheme>

// Custom theme
import { createCustomTheme } from '@vibing-ai/block-kit';

const customTheme = createCustomTheme({
  type: 'light',
  primary: '#3498db',
  secondary: '#2ecc71',
  // other color overrides...
});

<BlockKitProvider theme={customTheme}>
```

### Dynamic Theme Switching

```tsx
import { useState } from 'react';
import { BlockKitProvider } from '@vibing-ai/block-kit';

function App() {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };
  
  return (
    <BlockKitProvider theme={theme}>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <YourApp />
    </BlockKitProvider>
  );
}
```

## Version Compatibility

The SDK and Block Kit packages are designed to be compatible when sharing the same major version number. The SDK includes built-in version checking to ensure compatibility.

### Checking Compatibility

```tsx
import { checkCompatibility } from '@vibing-ai/sdk';

// Run this during app initialization
const { compatible, issues } = checkCompatibility();

if (!compatible) {
  console.warn('Compatibility issues detected:', issues);
}
```

### Handling Version Mismatches

If you encounter version compatibility issues:

1. Check the installed versions:
   ```bash
   npm list @vibing-ai/sdk @vibing-ai/block-kit
   ```

2. Update packages to compatible versions:
   ```bash
   npm install @vibing-ai/sdk@1.x.x @vibing-ai/block-kit@1.x.x
   ```

3. If you can't update immediately, consider using the SDK's native rendering instead of Block Kit for the incompatible features.

## Performance Optimization

### When to Use Block Kit vs. Custom Components

- **Use Block Kit when**:
  - You need consistent UI matching Vibing AI's design language
  - You want pre-built, accessible components
  - You need cross-platform compatibility
  - You want automatic theme support

- **Consider custom components when**:
  - You need highly specialized UI not covered by Block Kit
  - You have extreme performance requirements
  - You want complete control over styling
  - You need to support legacy browsers not covered by Block Kit

### Bundle Size Considerations

Block Kit is designed to be tree-shakeable, meaning you only pay the bundle size cost for components you actually use.

```tsx
// Good: Only import what you need
import { ButtonBlock, TextBlock } from '@vibing-ai/block-kit';

// Avoid: Importing everything
import * as BlockKit from '@vibing-ai/block-kit';
```

For even smaller bundles, consider dynamic imports:

```tsx
import React, { lazy, Suspense } from 'react';

// Dynamically import only when needed
const ComplexChart = lazy(() => import('@vibing-ai/block-kit/charts'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <ComplexChart data={chartData} />
    </Suspense>
  );
}
```

### Rendering Optimization

1. **Memoize components** to prevent unnecessary re-renders:
   ```tsx
   import { memo } from 'react';
   import { CardBlock } from '@vibing-ai/block-kit';
   
   const MemoizedCard = memo(({ title, content }) => (
     <CardBlock>
       <h3>{title}</h3>
       <p>{content}</p>
     </CardBlock>
   ));
   ```

2. **Use virtualization** for long lists:
   ```tsx
   import { VirtualList } from '@vibing-ai/block-kit';
   
   <VirtualList
     height={400}
     itemCount={1000}
     itemSize={50}
     renderItem={({ index, style }) => (
       <div style={style}>Item {index}</div>
     )}
   />
   ```

3. **Lazy load images** to improve initial rendering:
   ```tsx
   import { ImageBlock } from '@vibing-ai/block-kit';
   
   <ImageBlock src="large-image.jpg" lazyLoad />
   ```

### State Management with Block Kit

Block Kit components work with any state management solution, but integrate particularly well with React's built-in hooks.

```tsx
import { useState } from 'react';
import { FormBlock, InputBlock, ButtonBlock } from '@vibing-ai/block-kit';

function MyForm() {
  const [formState, setFormState] = useState({ name: '', email: '' });
  
  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = () => {
    // Process form submission
    console.log('Submitting:', formState);
  };
  
  return (
    <FormBlock onSubmit={handleSubmit}>
      <InputBlock
        label="Name"
        value={formState.name}
        onChange={value => handleChange('name', value)}
      />
      <InputBlock
        label="Email"
        type="email"
        value={formState.email}
        onChange={value => handleChange('email', value)}
      />
      <ButtonBlock label="Submit" type="submit" />
    </FormBlock>
  );
}
```

## Integration Tests

To ensure your integration with Block Kit works correctly, it's recommended to write integration tests.

```tsx
// Example using React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockKitProvider, ButtonBlock } from '@vibing-ai/block-kit';
import YourComponent from './YourComponent';

test('renders component with Block Kit and handles interactions', () => {
  const handleClick = jest.fn();
  
  render(
    <BlockKitProvider theme="light">
      <YourComponent onClick={handleClick} />
    </BlockKitProvider>
  );
  
  // Find elements
  const button = screen.getByRole('button', { name: /click me/i });
  
  // Interact with them
  fireEvent.click(button);
  
  // Assert expectations
  expect(handleClick).toHaveBeenCalled();
});
```

## Troubleshooting

### Common Issues

1. **Components not rendering correctly**: Ensure you've wrapped your app with `BlockKitProvider`.

2. **Theme not applying**: Check that you're passing the theme correctly to the provider.

3. **TypeScript errors**: Ensure you're using the correct prop types for each component.

4. **Version mismatches**: Verify that your SDK and Block Kit versions are compatible.

5. **Performance issues**: Ensure you're following the optimization tips above.

## Conclusion

Integrating the Vibing AI SDK with Block Kit provides a powerful foundation for building beautiful, consistent, and interactive UIs. By leveraging pre-built components and theming capabilities, you can focus on your application's unique functionality while maintaining a professional look and feel that aligns with the Vibing AI ecosystem.

For more information, refer to:
- [Block Kit Component Reference](https://vibing-ai.github.io/block-kit)
- [SDK Surface API Reference](../api-reference.md#surfaces)
- [Performance Optimization Guide](./performance.md) 