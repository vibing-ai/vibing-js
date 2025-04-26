import { createPlugin } from '../../src/plugin/createPlugin';
import { logger } from '../../src/core/utils';
import {
  PluginConfig,
  PluginInstance,
  FunctionDefinition,
  PluginContext,
} from '../../src/plugin/types';

// Mock the logger
jest.mock('../../src/core/utils/logger', () => require('../mocks/common/logger'));

describe('createPlugin', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration validation', () => {
    it('should throw error if id is missing', () => {
      const invalidConfig = {
        name: 'Test Plugin',
        version: '1.0.0',
        permissions: [],
        surfaces: {},
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Plugin id is required');
    });

    it('should throw error if name is missing', () => {
      const invalidConfig = {
        id: 'test-plugin',
        version: '1.0.0',
        permissions: [],
        surfaces: {},
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Plugin name is required');
    });

    it('should throw error if version is missing', () => {
      const invalidConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        permissions: [],
        surfaces: {},
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Plugin version is required');
    });

    it('should throw error if permissions is not an array', () => {
      const invalidConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        permissions: 'invalid' as any,
        surfaces: {},
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Plugin permissions must be an array');
    });

    it('should throw error if permission type is missing', () => {
      const invalidConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        permissions: [{ access: ['read'] } as any],
        surfaces: {},
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Each permission must have a valid type string');
    });

    it('should throw error if permission access is missing', () => {
      const invalidConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        permissions: [{ type: 'memory' } as any],
        surfaces: {},
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Each permission must have an access array');
    });

    it('should throw error if surfaces is not an object', () => {
      const invalidConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        permissions: [],
        surfaces: 'invalid' as any,
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Plugin surfaces must be a valid object');
    });
    
    it('should throw error if functions is not an array', () => {
      const invalidConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        permissions: [],
        surfaces: {},
        functions: 'invalid' as any,
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Plugin functions must be an array');
    });

    it('should throw error if function name is missing', () => {
      const invalidConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        permissions: [],
        surfaces: {},
        functions: [{ description: 'Test function', parameters: {}, handler: () => {} } as any],
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Each function must have a valid name');
    });

    it('should throw error if function description is missing', () => {
      const invalidConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        permissions: [],
        surfaces: {},
        functions: [{ name: 'testFunc', parameters: {}, handler: () => {} } as any],
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Each function must have a valid description');
    });

    it('should throw error if function parameters is missing', () => {
      const invalidConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        permissions: [],
        surfaces: {},
        functions: [{ name: 'testFunc', description: 'Test function', handler: () => {} } as any],
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Each function must have valid parameters schema');
    });

    it('should throw error if function handler is missing', () => {
      const invalidConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        permissions: [],
        surfaces: {},
        functions: [{ name: 'testFunc', description: 'Test function', parameters: {} } as any],
      } as PluginConfig;

      expect(() => createPlugin(invalidConfig)).toThrow('Each function must have a valid handler function');
    });
  });

  describe('Plugin creation', () => {
    const validConfig: PluginConfig = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      permissions: [
        { type: 'memory', access: ['read', 'write'] }
      ],
      surfaces: {
        cards: {
          defaultContent: 'Test card content'
        },
        panels: {
          defaultTitle: 'Test Panel',
          defaultContent: 'Test panel content'
        }
      }
    };

    it('should create a plugin instance with valid config', () => {
      const plugin = createPlugin(validConfig);
      
      expect(plugin).toBeDefined();
      expect(plugin.config).toBe(validConfig);
      expect(typeof plugin.onInitialize).toBe('function');
      expect(typeof plugin.registerAction).toBe('function');
      expect(typeof plugin.registerFunction).toBe('function');
      expect(typeof plugin.getContext).toBe('function');
    });

    it('should log surface registration', () => {
      createPlugin(validConfig);
      
      expect(logger.log).toHaveBeenCalledWith(`Registered surface 'cards' for plugin 'Test Plugin'`);
      expect(logger.log).toHaveBeenCalledWith(`Registered surface 'panels' for plugin 'Test Plugin'`);
    });

    it('should register provided functions', () => {
      const configWithFunctions: PluginConfig = {
        ...validConfig,
        functions: [
          {
            name: 'testFunction',
            description: 'A test function',
            parameters: {
              type: 'object',
              properties: {
                testParam: { type: 'string' }
              }
            },
            handler: jest.fn()
          }
        ]
      };
      
      createPlugin(configWithFunctions);
      
      expect(logger.log).toHaveBeenCalledWith(`Registered function 'testFunction' for plugin 'Test Plugin'`);
    });

    it('should call onInitialize callback when provided', (done) => {
      const initCallback = jest.fn();
      const configWithInit: PluginConfig = {
        ...validConfig,
        onInitialize: initCallback
      };
      
      createPlugin(configWithInit);
      
      // Since onInitialize is called with setTimeout(0), we need to wait for the next tick
      setTimeout(() => {
        expect(initCallback).toHaveBeenCalled();
        expect(initCallback).toHaveBeenCalledWith(expect.any(Object));
        done();
      }, 10);
    });
  });

  describe('Plugin instance API', () => {
    let plugin: PluginInstance;
    const validConfig: PluginConfig = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      permissions: [
        { type: 'memory', access: ['read', 'write'] }
      ],
      surfaces: {}
    };

    beforeEach(() => {
      plugin = createPlugin(validConfig);
    });

    it('should allow registering an initialization callback', (done) => {
      const callback = jest.fn();
      
      plugin.onInitialize(callback);
      
      setTimeout(() => {
        expect(callback).toHaveBeenCalled();
        const context = callback.mock.calls[0][0];
        expect(context).toHaveProperty('memory');
        expect(context).toHaveProperty('permissions');
        expect(context).toHaveProperty('events');
        expect(context).toHaveProperty('surfaces');
        done();
      }, 10);
    });

    it('should allow registering an action handler', () => {
      const handler = jest.fn();
      
      plugin.registerAction('testAction', handler);
      
      expect(logger.log).toHaveBeenCalledWith(`Registered action 'testAction' for plugin 'Test Plugin'`);
    });

    it('should allow registering a function', () => {
      const functionDef: FunctionDefinition = {
        name: 'testFunc',
        description: 'A test function',
        parameters: {
          type: 'object',
          properties: {}
        },
        handler: jest.fn()
      };
      
      plugin.registerFunction(functionDef);
      
      expect(logger.log).toHaveBeenCalledWith(`Registered function 'testFunc' for plugin 'Test Plugin'`);
    });

    it('should provide access to the plugin context', () => {
      const context = plugin.getContext();
      
      expect(context).toBeDefined();
      expect(context).toHaveProperty('memory');
      expect(context).toHaveProperty('permissions');
      expect(context).toHaveProperty('events');
      expect(context).toHaveProperty('surfaces');
    });
  });
  
  describe('Real-world usage example', () => {
    it('should handle a complex plugin configuration', () => {
      const complexConfig: PluginConfig = {
        id: 'com.example.my-plugin',
        name: 'My Plugin',
        version: '1.0.0',
        description: 'A helpful plugin',
        permissions: [
          { type: 'memory', access: ['read', 'write'] }
        ],
        surfaces: {
          cards: {
            defaultContent: 'Hello from my plugin'
          },
          panels: {
            defaultTitle: 'My Plugin Panel',
            defaultContent: 'Detailed information here'
          }
        },
        functions: [
          {
            name: 'getInfo',
            description: 'Get information about something',
            parameters: {
              type: 'object',
              properties: {
                topic: { type: 'string' }
              },
              required: ['topic']
            },
            handler: async (params) => {
              return { result: `Info about ${params.topic}` };
            }
          }
        ],
        onInitialize: async (context: PluginContext) => {
          // This would normally set something in memory
          // jest.mocked would be needed for proper type handling in real test
        }
      };
      
      const plugin = createPlugin(complexConfig);
      
      expect(plugin).toBeDefined();
      expect(plugin.config).toBe(complexConfig);
      expect(logger.log).toHaveBeenCalledWith(`Registered function 'getInfo' for plugin 'My Plugin'`);
      expect(logger.log).toHaveBeenCalledWith(`Registered surface 'cards' for plugin 'My Plugin'`);
      expect(logger.log).toHaveBeenCalledWith(`Registered surface 'panels' for plugin 'My Plugin'`);
    });
  });
}); 