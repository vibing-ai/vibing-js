# Vibing AI SDK

The official JavaScript SDK for building AI-powered apps, plugins, and agents for the Vibing AI platform. Create engaging conversational experiences with just a few lines of code.

## Key Features

- **App Creation**: Build and deploy full-featured AI applications
- **Plugin Development**: Extend functionality with custom plugins
- **Agent Creation**: Design intelligent conversational agents
- **Surface Integration**: Add cards, panels, and modals to your AI interfaces
- **Memory Management**: Persistent state and context for conversations
- **Permission System**: Secure access control for your AI applications
- **Event System**: Robust event handling for real-time communication
- **TypeScript Support**: Full type safety and autocompletion

## Installation

```bash
# Using npm
npm install @vibing-ai/sdk

# Using yarn
yarn add @vibing-ai/sdk

# Using pnpm
pnpm add @vibing-ai/sdk
```

> **Note:** If the package is not yet published to npm, you can install it directly from the GitHub repository using:
> ```bash
> npm install vibing-ai/js-sdk
> ```

## Quick Start

```typescript
import { createApp } from '@vibing-ai/sdk';

// Create a simple app
const app = createApp({
  name: 'My First Vibing App',
  description: 'A simple app built with Vibing AI SDK',
  version: '1.0.0',
});

// Add a message handler
app.onMessage(async (message, context) => {
  if (message.content.includes('hello')) {
    return {
      content: 'Hello there! How can I help you today?',
    };
  }
  
  return {
    content: 'I received your message. How can I assist you?',
  };
});

// Start the app
app.start();
```

## Documentation

For comprehensive documentation, visit:

- [Documentation Home](https://github.com/vibing-ai/js-sdk/blob/main/docs/index.md)
- [Getting Started Guide](https://github.com/vibing-ai/js-sdk/blob/main/docs/guides/getting-started.md)
- [Examples](https://github.com/vibing-ai/js-sdk/tree/main/examples/)
- [Cookbook](https://github.com/vibing-ai/js-sdk/blob/main/docs/cookbook/)

## Examples

Here are some examples to get you started:

- [Interactive App Playground](https://github.com/vibing-ai/js-sdk/blob/main/examples/interactive/app-playground.ts)
- [Plugin Showcase](https://github.com/vibing-ai/js-sdk/blob/main/examples/interactive/plugin-showcase.ts)
- [Agent Demo](https://github.com/vibing-ai/js-sdk/blob/main/examples/interactive/agent-demo.ts)
- [Weather Plugin Example](https://github.com/vibing-ai/js-sdk/blob/main/examples/weather-plugin.ts)
- [Note App Example](https://github.com/vibing-ai/js-sdk/blob/main/examples/note-app.ts)

## Compatibility

- **Node.js**: 14.x and higher
- **Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **@vibing-ai/block-kit**: 1.0.0 and higher
- **@vibing-ai/cli**: 1.0.0 and higher

## Support

- [GitHub Issues](https://github.com/vibing-ai/js-sdk/issues) - Bug reports and feature requests
- [Discord Community](https://discord.gg/vibingai) - Discussion and help
- [Email Support](mailto:support@vibing.ai) - Direct support

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/vibing-ai/js-sdk/blob/main/CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/vibing-ai/js-sdk/blob/main/LICENSE) file for details. 
