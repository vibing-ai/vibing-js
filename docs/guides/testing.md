# Testing Guide

This guide provides strategies and best practices for testing applications, plugins, and agents built with the Vibing AI SDK.

## Table of Contents

- [Testing Fundamentals](#testing-fundamentals)
- [Testing Apps](#testing-apps)
- [Testing Plugins](#testing-plugins)
- [Testing Agents](#testing-agents)
- [Mocking SDK Components](#mocking-sdk-components)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Testing in CI/CD](#testing-in-cicd)
- [Performance Testing](#performance-testing)

## Testing Fundamentals

Testing SDK-based code requires understanding the SDK's architecture and how components interact. This section covers general testing principles for Vibing AI SDK projects.

### Test Structure

We recommend organizing tests into these categories:

- **Unit tests**: Test individual functions and components in isolation
- **Integration tests**: Test interactions between components
- **End-to-end tests**: Test complete workflows from a user perspective

### Testing Tools

For Vibing AI SDK projects, we recommend these testing tools:

- **Jest**: For unit and integration testing
- **React Testing Library**: For testing UI components
- **Cypress**: For end-to-end testing
- **Mock Service Worker**: For API mocking

### Test Setup

```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';
import { mockSDK } from '@vibing-ai/sdk/testing';

// Initialize SDK mocking
beforeAll(() => {
  mockSDK();
});

// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});
```

### Basic Testing Pattern

```typescript
// Example test pattern
describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { /* ... */ };
    
    // Act
    render(<MyComponent {...props} />);
    
    // Assert
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('should handle interactions', async () => {
    // Arrange
    render(<MyComponent />);
    
    // Act
    await userEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(screen.getByText('Changed Text')).toBeInTheDocument();
  });
});
```

## Testing Apps

Apps created with the Vibing AI SDK have specific characteristics that require special testing approaches.

### Mocking App Infrastructure

```typescript
// src/__tests__/app.test.ts
import { mockApp } from '@vibing-ai/sdk/testing';
import myApp from '../app';

// Mock app infrastructure
const mockedApp = mockApp(myApp);

describe('My App', () => {
  it('should initialize correctly', () => {
    // Trigger initialization
    mockedApp.triggerInitialize();
    
    // Verify expected initialization behavior
    expect(mockedApp.getState()).toEqual(expect.objectContaining({
      initialized: true,
      // other expected state
    }));
  });
  
  it('should render UI components', () => {
    // Create a container
    const container = document.createElement('div');
    
    // Trigger render
    mockedApp.triggerRender(container);
    
    // Verify expected DOM content
    expect(container.querySelector('h1')).toHaveTextContent('My App');
  });
  
  it('should clean up properly', () => {
    // Setup mock
    const cleanupMock = jest.fn();
    
    // Override cleanup
    mockedApp.overrideCleanup(cleanupMock);
    
    // Trigger cleanup
    mockedApp.triggerCleanup();
    
    // Verify cleanup was called
    expect(cleanupMock).toHaveBeenCalled();
  });
});
```

### Testing App Lifecycle

```typescript
// Example testing app lifecycle events
it('should handle the complete app lifecycle', () => {
  // Create app with mocked environment
  const { app, environment } = createMockedAppEnvironment();
  
  // Verify initialization
  environment.triggerInitialize();
  expect(environment.getState('initialized')).toBe(true);
  
  // Verify rendering
  const container = environment.createContainer();
  environment.triggerRender(container);
  expect(container.querySelector('.app-root')).toBeInTheDocument();
  
  // Verify cleanup
  environment.triggerCleanup();
  expect(environment.getState('cleaned')).toBe(true);
});
```

## Testing Plugins

Plugins have their own testing considerations since they interact with the host environment.

### Mocking Plugin Host

```typescript
// src/__tests__/plugin.test.ts
import { mockPluginHost } from '@vibing-ai/sdk/testing';
import myPlugin from '../plugin';

describe('My Plugin', () => {
  let pluginHost;
  
  beforeEach(() => {
    // Create a mocked plugin host
    pluginHost = mockPluginHost();
    
    // Initialize the plugin with the mocked host
    myPlugin.initialize(pluginHost);
  });
  
  it('should register capabilities', () => {
    // Verify the plugin registered expected capabilities
    expect(pluginHost.getRegisteredCapabilities()).toContain('conversation-cards');
  });
  
  it('should handle events', () => {
    // Mock event handler
    const handlerMock = jest.fn();
    pluginHost.overrideEventHandler('conversation:started', handlerMock);
    
    // Trigger the event
    pluginHost.triggerEvent('conversation:started', { conversationId: '123' });
    
    // Verify the handler was called with the right arguments
    expect(handlerMock).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: '123' })
    );
  });
});
```

### Testing Plugin UI Components

```typescript
// Testing plugin UI components
import { render, screen } from '@testing-library/react';
import { PluginCard } from '../components/PluginCard';
import { mockPluginContext } from '@vibing-ai/sdk/testing';

describe('PluginCard', () => {
  it('should render correctly', () => {
    // Mock the plugin context
    const context = mockPluginContext({
      data: { title: 'Test Card', content: 'Card content' }
    });
    
    // Render with mocked context
    render(<PluginCard context={context} />);
    
    // Verify rendering
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });
});
```

## Testing Agents

Agents require special testing approaches due to their AI-driven nature.

### Mocking Agent Environment

```typescript
// src/__tests__/agent.test.ts
import { mockAgentEnvironment } from '@vibing-ai/sdk/testing';
import myAgent from '../agent';

describe('My Agent', () => {
  let agentEnv;
  
  beforeEach(() => {
    // Mock the agent environment
    agentEnv = mockAgentEnvironment({
      capabilities: ['text-generation', 'memory-access']
    });
    
    // Initialize the agent
    myAgent.initialize(agentEnv);
  });
  
  it('should handle queries', async () => {
    // Mock query handler
    agentEnv.mockQueryResponse('What is the weather?', {
      content: 'The weather is sunny.',
      confidence: 0.95
    });
    
    // Perform the query
    const result = await agentEnv.performQuery('What is the weather?');
    
    // Verify the response
    expect(result.content).toBe('The weather is sunny.');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
  
  it('should use tools', async () => {
    // Mock tool usage
    const toolMock = jest.fn().mockResolvedValue({ result: 'Success' });
    agentEnv.mockTool('weather-tool', toolMock);
    
    // Trigger agent to use tool
    await agentEnv.triggerQuery('What is the weather in New York?');
    
    // Verify tool was called with expected arguments
    expect(toolMock).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'New York' })
    );
  });
});
```

### Testing Agent Responses

```typescript
// Testing deterministic agent responses
it('should provide deterministic responses for testing', async () => {
  // Setup agent with deterministic mode
  const agent = createDeterministicAgent();
  
  // Register test queries and responses
  agent.registerTestCase('What is Vibing AI?', 
    'Vibing AI is a platform for building AI-powered apps and plugins.');
  
  // Test the response
  const response = await agent.query('What is Vibing AI?');
  expect(response.content).toBe(
    'Vibing AI is a platform for building AI-powered apps and plugins.'
  );
});
```

## Mocking SDK Components

The Vibing AI SDK provides utilities for mocking its components during testing.

### Mocking Memory

```typescript
// Mocking the memory system
import { mockMemory } from '@vibing-ai/sdk/testing';

describe('Component using memory', () => {
  beforeEach(() => {
    // Setup memory mock
    mockMemory({
      'user-preferences': { theme: 'dark', fontSize: 16 },
      'recent-items': ['item1', 'item2']
    });
  });
  
  it('should read from memory', () => {
    // Test component that uses memory
    render(<UserPreferences />);
    
    // Verify it displays the mocked memory data
    expect(screen.getByText('Dark Theme')).toBeInTheDocument();
    expect(screen.getByText('Font Size: 16')).toBeInTheDocument();
  });
  
  it('should write to memory', async () => {
    // Test component that modifies memory
    render(<ThemeSelector />);
    
    // Perform an action that should write to memory
    await userEvent.click(screen.getByText('Light Theme'));
    
    // Verify memory was updated
    expect(mockMemory.get('user-preferences')).toEqual(
      expect.objectContaining({ theme: 'light' })
    );
  });
});
```

### Mocking Permissions

```typescript
// Mocking the permissions system
import { mockPermissions } from '@vibing-ai/sdk/testing';

describe('Component requiring permissions', () => {
  it('should handle granted permission', () => {
    // Mock permission as granted
    mockPermissions.grant('memory:read');
    
    // Test component that requires permission
    render(<DataViewer />);
    
    // Verify it works with granted permission
    expect(screen.getByText('User Data')).toBeInTheDocument();
  });
  
  it('should handle denied permission', () => {
    // Mock permission as denied
    mockPermissions.deny('memory:write');
    
    // Test component that requires permission
    render(<DataEditor />);
    
    // Verify it shows permission request UI
    expect(screen.getByText('Permission Required')).toBeInTheDocument();
  });
  
  it('should handle permission requests', async () => {
    // Mock permission request response
    mockPermissions.setRequestResponse('memory:write', { granted: true });
    
    // Test component that requests permission
    render(<DataEditor />);
    
    // Click request permission button
    await userEvent.click(screen.getByText('Request Permission'));
    
    // Verify permission was requested and UI updated
    expect(mockPermissions.wasRequested('memory:write')).toBe(true);
    expect(screen.getByText('Edit Data')).toBeInTheDocument();
  });
});
```

## Integration Testing

Integration testing verifies that different components work together correctly.

### Testing App and Plugin Integration

```typescript
// Testing app with plugin integration
import { mockIntegrationEnvironment } from '@vibing-ai/sdk/testing';
import myApp from '../app';
import myPlugin from '../plugin';

describe('App and Plugin Integration', () => {
  let environment;
  
  beforeEach(() => {
    // Create integration environment
    environment = mockIntegrationEnvironment();
    
    // Register app and plugin
    environment.registerApp(myApp);
    environment.registerPlugin(myPlugin);
  });
  
  it('should allow app to use plugin functionality', async () => {
    // Initialize both
    await environment.initialize();
    
    // Simulate app using plugin
    await environment.executeAppAction('usePlugin', { 
      pluginName: 'myPlugin',
      action: 'processData',
      data: { value: 42 }
    });
    
    // Verify plugin action was called
    expect(environment.getPluginActionCalls('myPlugin', 'processData')).toHaveLength(1);
    
    // Verify app received result
    expect(environment.getAppState('pluginResult')).toEqual({ processed: 42 });
  });
});
```

### Testing Surface Integration

```typescript
// Testing integration with surfaces
import { mockSurfaceEnvironment } from '@vibing-ai/sdk/testing';
import myPlugin from '../plugin';

describe('Plugin with Surfaces', () => {
  let environment;
  
  beforeEach(() => {
    // Create surface environment
    environment = mockSurfaceEnvironment({
      availableSurfaces: ['conversation-card', 'context-panel', 'modal']
    });
    
    // Register plugin
    environment.registerPlugin(myPlugin);
  });
  
  it('should render content in conversation card', async () => {
    // Initialize
    await environment.initialize();
    
    // Trigger event that should create a card
    await environment.triggerEvent('message:received', {
      messageId: '123',
      content: 'Hello'
    });
    
    // Verify card was created
    const cards = environment.getRenderedSurfaces('conversation-card');
    expect(cards).toHaveLength(1);
    expect(cards[0].content).toContain('Response to: Hello');
  });
});
```

## End-to-End Testing

End-to-end tests verify complete user workflows.

### Setting Up E2E Tests

```typescript
// cypress/integration/app.spec.js
describe('App E2E', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('/');
    
    // Mock any external dependencies
    cy.intercept('GET', '/api/user', { fixture: 'user.json' }).as('getUser');
  });
  
  it('should complete the user workflow', () => {
    // Wait for app to initialize
    cy.wait('@getUser');
    
    // Interact with the app
    cy.findByText('Start').click();
    
    // Verify progression
    cy.findByText('Step 1').should('be.visible');
    
    // Complete steps
    cy.findByLabelText('Name').type('Test User');
    cy.findByText('Next').click();
    
    // Verify completion
    cy.findByText('Workflow Complete').should('be.visible');
    cy.findByText('Test User').should('be.visible');
  });
});
```

### Testing with Real AI Services

```typescript
// Testing with real AI capabilities in E2E tests
describe('Agent E2E', () => {
  beforeEach(() => {
    // Setup test mode that uses real AI but with deterministic seed
    cy.window().then((win) => {
      win.setAITestMode({ 
        mode: 'real', 
        seed: 'test-seed-123',
        recordResponses: true
      });
    });
    
    // Visit agent page
    cy.visit('/agent');
  });
  
  it('should respond to user queries', () => {
    // Type a query
    cy.findByPlaceholderText('Ask a question').type('What can you help me with?');
    cy.findByText('Send').click();
    
    // Wait for response
    cy.findByTestId('agent-response', { timeout: 10000 }).should('be.visible');
    
    // Verify response contains expected capabilities
    cy.findByTestId('agent-response').should('contain', 'help you with');
  });
});
```

## Testing in CI/CD

Setting up continuous integration for your Vibing AI SDK projects.

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run type checking
      run: npm run typecheck
      
    - name: Run unit and integration tests
      run: npm run test
      
    - name: Build
      run: npm run build
      
    - name: Run E2E tests
      uses: cypress-io/github-action@v2
      with:
        start: npm run start
        wait-on: 'http://localhost:3000'
```

### Test Reports

```typescript
// jest.config.js
module.exports = {
  // ... other config
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports/junit',
      outputName: 'js-test-results.xml',
    }],
    ['jest-html-reporter', {
      pageTitle: 'Test Report',
      outputPath: 'reports/test-report.html',
    }]
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
```

## Performance Testing

Testing the performance characteristics of your SDK-based projects.

### Memory Usage Testing

```typescript
// src/__tests__/performance/memory.test.ts
import { measureMemoryUsage } from '@vibing-ai/sdk/testing';
import myApp from '../../app';

describe('Memory Usage', () => {
  it('should not exceed memory limits', async () => {
    // Measure memory usage during operation
    const usage = await measureMemoryUsage(() => {
      // Initialize the app
      const app = myApp.initialize();
      
      // Perform memory-intensive operations
      app.loadLargeDataset();
      
      // Return app for cleanup
      return app;
    });
    
    // Verify memory usage is within limits
    expect(usage.heapUsed).toBeLessThan(50 * 1024 * 1024); // 50MB limit
  });
});
```

### Rendering Performance

```typescript
// src/__tests__/performance/rendering.test.ts
import { measureRenderTime } from '@vibing-ai/sdk/testing';
import ComplexComponent from '../../components/ComplexComponent';

describe('Rendering Performance', () => {
  it('should render efficiently', async () => {
    // Measure render time
    const metrics = await measureRenderTime(() => <ComplexComponent />, {
      iterations: 5,
      warmupIterations: 2
    });
    
    // Check median render time
    expect(metrics.median).toBeLessThan(100); // 100ms limit
    
    // Check consistency
    expect(metrics.stdDev).toBeLessThan(metrics.median * 0.2); // 20% max variation
  });
});
```

### Load Testing

```typescript
// src/__tests__/performance/load.test.ts
import { simulateLoad } from '@vibing-ai/sdk/testing';
import myAgent from '../../agent';

describe('Load Handling', () => {
  it('should handle concurrent requests', async () => {
    // Create agent instance
    const agent = myAgent.initialize();
    
    // Simulate concurrent load
    const results = await simulateLoad(agent, {
      concurrentUsers: 10,
      actionsPerUser: 5,
      actionGenerator: (user, action) => ({
        type: 'query',
        payload: `Test query ${user}-${action}`
      })
    });
    
    // Verify performance metrics
    expect(results.successRate).toBeGreaterThan(0.98); // 98% success
    expect(results.medianResponseTime).toBeLessThan(500); // 500ms
    expect(results.p95ResponseTime).toBeLessThan(1000); // 1s for p95
  });
});
```

This guide provides a comprehensive approach to testing Vibing AI SDK projects. For more specific testing scenarios or detailed examples, please consult the relevant API documentation or reach out to our support team. 