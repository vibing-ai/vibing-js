# Vibing AI SDK

<p align="center">
  <img src="https://vibing.ai/assets/logo.png" alt="Vibing AI SDK" width="200"/>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@vibing-ai/sdk"><img src="https://img.shields.io/npm/v/@vibing-ai/sdk.svg" alt="npm version"></a>
  <a href="https://github.com/vibing-ai/js-sdk/actions"><img src="https://github.com/vibing-ai/js-sdk/workflows/CI/badge.svg" alt="Build Status"></a>
  <a href="https://github.com/vibing-ai/js-sdk/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@vibing-ai/sdk.svg" alt="License"></a>
  <a href="https://www.npmjs.com/package/@vibing-ai/sdk"><img src="https://img.shields.io/npm/dm/@vibing-ai/sdk.svg" alt="npm downloads"></a>
</p>

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

- [Documentation Home](docs/index.md)
- [Getting Started Guide](docs/guides/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Examples](examples/)
- [Cookbook](docs/cookbook/)

## Examples

Here are some examples to get you started:

- [Simple Conversational App](https://github.com/vibing-ai/js-sdk/tree/main/examples/simple-app)
- [Plugin with UI Surfaces](https://github.com/vibing-ai/js-sdk/tree/main/examples/plugin-with-surfaces)
- [Agent with Memory](https://github.com/vibing-ai/js-sdk/tree/main/examples/agent-with-memory)
- [Interactive Cards](https://github.com/vibing-ai/js-sdk/tree/main/examples/interactive-cards)

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

We welcome contributions! Please see our [Contributing Guide](https://github.com/vibing-ai/js-sdk/blob/main/docs/project/CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 