# Interactive Examples for Vibing AI SDK

This directory contains interactive examples that demonstrate the capabilities of the Vibing AI SDK. These examples are designed to be both educational and practical, showing how to use various features of the SDK in real-world scenarios.

## Running the Examples

To run any of the examples, use the following command:

```bash
# Make sure you're in the project root directory
npx ts-node examples/interactive/[example-file].ts
```

For example:

```bash
npx ts-node examples/interactive/app-playground.ts
```

## Available Examples

### App Playground (`app-playground.ts`)

Demonstrates a fully functional app with interactive elements. Features include:

- State management
- Dynamic UI updates
- Multiple surface types (cards, panels, modals)
- Event handling
- Theme switching

This example is great for understanding the core app functionality of the SDK.

### Plugin Showcase (`plugin-showcase.ts`)

Shows multiple plugin types and how they integrate with different surfaces:

- Conversation analysis plugin with cards and panels
- Tool integration plugin with function calling capabilities
- Content provider plugin with data visualization
- Error handling demonstration

Use this to learn how to create plugins with various capabilities and UI integrations.

### Agent Demo (`agent-demo.ts`)

Demonstrates a conversational agent with domain knowledge:

- Travel recommendation agent
- Memory system for storing preferences
- Query handling and response generation
- UI integration with cards and panels
- State persistence across interactions

This example shows how to build an intelligent agent that can maintain conversations and learn from interactions.

## How to Modify the Examples

These examples are designed to be educational starting points. You're encouraged to modify them to learn how different settings and configurations affect behavior.

Some ideas for modifications:

1. **App Playground**:
   - Change the theme implementation
   - Add additional surfaces
   - Implement more complex state management

2. **Plugin Showcase**:
   - Add new function capabilities to the tool plugin
   - Enhance the conversation analysis with more features
   - Create additional visualizations for the content plugin

3. **Agent Demo**:
   - Add more domain knowledge
   - Implement additional conversation capabilities
   - Enhance the UI with more interactive elements

## Creating Your Own Examples

To create your own examples based on these templates:

1. Copy one of the existing examples as a starting point
2. Rename the file to reflect your new example's purpose
3. Modify the code to implement your desired functionality
4. Run your example using the same npx ts-node command

The structure of the examples follows a pattern that you can reuse:

1. Define configurations (app, plugin, or agent)
2. Create surfaces and UI elements
3. Implement event handlers and business logic
4. Register surfaces and start the component

## Additional Resources

For more information on the SDK features used in these examples, refer to:

- [Quick Start Guide](../../docs/guides/quick-start.md)
- [API Reference](../../docs/api-reference.md)
- [API Cheat Sheet](../../docs/api-cheat-sheet.md) 