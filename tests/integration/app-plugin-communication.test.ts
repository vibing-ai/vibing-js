/**
 * Integration tests for app-plugin communication
 */
import { createTestApp, createTestPlugin, createMockEventSystem } from './utils/test-utils';

// Mock the events system
jest.mock('../../src/common/events', () => {
  const mockEventSystem = createMockEventSystem();
  return {
    useEvents: () => mockEventSystem,
    events: mockEventSystem
  };
});

describe('App-Plugin Communication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('App can register and discover plugins', () => {
    // Create a test app and plugin
    const app = createTestApp();
    const plugin = createTestPlugin();
    
    // Register the plugin with the app
    app.registerPlugin(plugin);
    
    // Verify plugin was registered
    const plugins = app.getPlugins();
    expect(plugins).toHaveLength(1);
    expect(plugins[0].id).toBe('test-plugin');
  });
  
  test('App can communicate with plugins via events', async () => {
    // Create event mocks
    const { events } = require('../../src/common/events');
    
    // Create test app and plugin with event handlers
    const app = createTestApp();
    
    const mockHandler = jest.fn();
    const plugin = createTestPlugin({
      onInitialize: (context) => {
        context.events.on('app:test-event', mockHandler);
      }
    });
    
    // Register the plugin and initialize
    app.registerPlugin(plugin);
    await app.initialize();
    
    // Trigger an event from the app
    events.emit('app:test-event', { data: 'test-data' });
    
    // Verify plugin received the event
    expect(mockHandler).toHaveBeenCalledWith({ data: 'test-data' });
  });
  
  test('Plugins can communicate with app via events', async () => {
    // Create event mocks
    const { events } = require('../../src/common/events');
    
    // Create app with event handler
    const mockHandler = jest.fn();
    const app = createTestApp({
      onInitialize: (context) => {
        context.events.on('plugin:test-event', mockHandler);
      }
    });
    
    // Create plugin that emits events
    const plugin = createTestPlugin({
      onInitialize: (context) => {
        // Emit event after initialization
        context.events.emit('plugin:test-event', { pluginData: 'test-data' });
      }
    });
    
    // Register and initialize
    app.registerPlugin(plugin);
    await app.initialize();
    
    // Verify app received the event
    expect(mockHandler).toHaveBeenCalledWith({ pluginData: 'test-data' });
  });
  
  test('App can pass data to plugins during initialization', async () => {
    // Create app with initialization data
    const app = createTestApp({
      data: {
        sharedConfig: {
          theme: 'dark',
          apiEndpoint: 'https://api.example.com'
        }
      }
    });
    
    // Create plugin that accesses initialization data
    const mockInitialize = jest.fn();
    const plugin = createTestPlugin({
      onInitialize: mockInitialize
    });
    
    // Register and initialize
    app.registerPlugin(plugin);
    await app.initialize();
    
    // Verify plugin received the data
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({
        app: expect.objectContaining({
          data: expect.objectContaining({
            sharedConfig: expect.objectContaining({
              theme: 'dark',
              apiEndpoint: 'https://api.example.com'
            })
          })
        })
      })
    );
  });
  
  test('App handles plugin errors gracefully', async () => {
    // Create a console spy
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Create app
    const app = createTestApp();
    
    // Create plugin that throws an error during initialization
    const plugin = createTestPlugin({
      onInitialize: () => {
        throw new Error('Plugin initialization error');
      }
    });
    
    // Register and initialize
    app.registerPlugin(plugin);
    
    // Initialization should not throw
    await expect(app.initialize()).resolves.not.toThrow();
    
    // But error should be logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error initializing plugin'),
      expect.any(Error)
    );
    
    // Restore console
    consoleErrorSpy.mockRestore();
  });
  
  test('App correctly unregisters plugins', async () => {
    // Create event mocks
    const { events } = require('../../src/common/events');
    
    // Setup event handlers
    const mockHandler = jest.fn();
    
    // Create app and plugin
    const app = createTestApp();
    const plugin = createTestPlugin({
      onInitialize: (context) => {
        context.events.on('app:test-event', mockHandler);
      }
    });
    
    // Register, initialize, then unregister
    app.registerPlugin(plugin);
    await app.initialize();
    app.unregisterPlugin('test-plugin');
    
    // Emit event
    events.emit('app:test-event', { data: 'test-data' });
    
    // Handler should not be called since plugin was unregistered
    expect(mockHandler).not.toHaveBeenCalled();
    
    // Plugin should not be in the list
    expect(app.getPlugins()).toHaveLength(0);
  });
}); 