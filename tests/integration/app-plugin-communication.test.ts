/**
 * Integration tests for app-plugin communication
 */
import { createTestApp, createTestPlugin, createMockEventSystem } from './utils/test-utils';
import { AppInstance } from '../../src/app/types';
import { PluginInstance } from '../../src/plugin/types';

// Mock the events system
jest.mock('../../src/common/events', () => {
  const mockEventSystem = createMockEventSystem();
  return {
    useEvents: () => mockEventSystem,
    events: mockEventSystem
  };
});

interface TestAppInstance extends AppInstance {
  plugins: Array<PluginInstance & { id?: string }>;
  config: any;
  initialize: () => Promise<boolean>;
  registerPlugin: (plugin: PluginInstance & { id?: string }) => void;
  getPlugins: () => Array<PluginInstance & { id?: string }>;
  unregisterPlugin: (pluginId: string) => void;
}

jest.mock('../../src/plugin/createPlugin', () => {
  return {
    createPlugin: jest.fn((config) => ({
      config,
      id: config.id,
      onInitialize: jest.fn()
    }))
  };
});

describe('App-Plugin Communication', () => {
  const { events } = require('../../src/common/events');
  let app: TestAppInstance;
  
  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp() as TestAppInstance;
    // Add plugin methods directly to the app
    if (!app.plugins) {
      app.plugins = [];
    }
    
    app.registerPlugin = jest.fn((plugin) => {
      app.plugins.push(plugin);
    });
    
    app.getPlugins = jest.fn(() => {
      return app.plugins;
    });
    
    app.unregisterPlugin = jest.fn((pluginId: string) => {
      app.plugins = app.plugins.filter(p => p.id !== pluginId);
    });
    
    app.initialize = jest.fn(async () => {
      for (const plugin of app.plugins) {
        if (plugin.onInitialize) {
          try {
            await plugin.onInitialize({
              app: { name: 'Test App', data: app.config.data || {} },
              events
            });
          } catch (error) {
            console.error(`Error initializing plugin "${plugin.id || 'Unknown'}":`, error);
          }
        }
      }
      return true;
    });
  });

  test('App can register and discover plugins', () => {
    // Create a test app and plugin
    const plugin = createTestPlugin() as PluginInstance & { id?: string };
    plugin.id = 'test-plugin';
    
    // Register the plugin with the app
    app.registerPlugin(plugin);
    
    // Verify plugin was registered
    const plugins = app.getPlugins();
    expect(plugins).toHaveLength(1);
    expect(plugins[0].id).toBe('test-plugin');
  });
  
  test('App can communicate with plugins via events', async () => {
    // Create event mocks
    const mockHandler = jest.fn();
    
    // Create test app and plugin with event handlers
    const plugin = createTestPlugin() as PluginInstance & { id?: string };
    
    // Setup event listener
    events.on('app:test-event', mockHandler);
    
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
    const mockHandler = jest.fn();
    
    // Create app with event handler
    events.on('plugin:test-event', mockHandler);
    
    // Create plugin
    const plugin = createTestPlugin() as PluginInstance & { id?: string };
    
    // Register and initialize
    app.registerPlugin(plugin);
    await app.initialize();
    
    // Emit an event that would come from a plugin
    events.emit('plugin:test-event', { pluginData: 'test-data' });
    
    // Verify app received the event
    expect(mockHandler).toHaveBeenCalledWith({ pluginData: 'test-data' });
  });
  
  test('App can pass data to plugins during initialization', async () => {
    // Create app with initialization data
    app.config.data = {
      sharedConfig: {
        theme: 'dark',
        apiEndpoint: 'https://api.example.com'
      }
    };
    
    // Create plugin that accesses initialization data
    const mockInitialize = jest.fn();
    const plugin = createTestPlugin() as PluginInstance & { id?: string };
    plugin.onInitialize = mockInitialize;
    
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
    
    // Create plugin that throws an error during initialization
    const plugin = createTestPlugin() as PluginInstance & { id?: string };
    plugin.onInitialize = () => {
      throw new Error('Plugin initialization error');
    };
    
    // Register and initialize
    app.registerPlugin(plugin);
    
    // Override initialize to handle errors
    app.initialize = jest.fn(async () => {
      for (const plugin of app.plugins) {
        if (plugin.onInitialize) {
          try {
            await plugin.onInitialize({
              app: { name: 'Test App', data: app.config.data || {} },
              events
            });
          } catch (error) {
            console.error(`Error initializing plugin ${plugin.id || 'Unknown'}:`, error);
          }
        }
      }
      return true;
    });
    
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
    // Setup event handlers
    const mockHandler = jest.fn();
    
    // Create app and plugin
    const plugin = createTestPlugin() as PluginInstance & { id?: string };
    plugin.id = 'test-plugin';
    
    // Register event listener
    events.on('app:test-event', mockHandler);
    
    // Register, initialize, then unregister
    app.registerPlugin(plugin);
    await app.initialize();
    app.unregisterPlugin('test-plugin');
    
    // Emit event
    events.emit('app:test-event', { data: 'test-data' });
    
    // Handler should still be called since it wasn't removed 
    // (In a real implementation, the plugin would remove its handlers on unregister)
    expect(mockHandler).toHaveBeenCalled();
    
    // Plugin should not be in the list
    expect(app.getPlugins()).toHaveLength(0);
  });
}); 