import { PluginConfig, PluginInstance, PluginContext, FunctionDefinition, PluginInitializeCallback } from './types';

/**
 * Validates a plugin configuration
 * @param config The plugin configuration to validate
 * @throws Error if the configuration is invalid
 */
function validatePluginConfig(config: PluginConfig): void {
  // Check required fields
  if (!config.id) {
    throw new Error('Plugin id is required');
  }
  
  if (!config.name) {
    throw new Error('Plugin name is required');
  }
  
  if (!config.version) {
    throw new Error('Plugin version is required');
  }
  
  if (!config.permissions || !Array.isArray(config.permissions)) {
    throw new Error('Plugin permissions must be an array');
  }
  
  // Validate permissions format
  for (const permission of config.permissions) {
    if (!permission.resource || typeof permission.resource !== 'string') {
      throw new Error('Each permission must have a valid resource string');
    }
    if (!permission.actions || !Array.isArray(permission.actions)) {
      throw new Error('Each permission must have an actions array');
    }
  }
  
  // Validate surfaces
  if (!config.surfaces || typeof config.surfaces !== 'object') {
    throw new Error('Plugin surfaces must be a valid object');
  }
  
  // Validate functions if provided
  if (config.functions) {
    if (!Array.isArray(config.functions)) {
      throw new Error('Plugin functions must be an array');
    }
    
    for (const func of config.functions) {
      if (!func.name || typeof func.name !== 'string') {
        throw new Error('Each function must have a valid name');
      }
      if (!func.description || typeof func.description !== 'string') {
        throw new Error('Each function must have a valid description');
      }
      if (!func.parameters || typeof func.parameters !== 'object') {
        throw new Error('Each function must have valid parameters schema');
      }
      if (typeof func.handler !== 'function') {
        throw new Error('Each function must have a valid handler function');
      }
    }
  }
}

/**
 * Creates a plugin instance
 * 
 * @param config Configuration for the plugin
 * @returns A plugin instance
 * 
 * @example
 * ```tsx
 * const myPlugin = createPlugin({
 *   id: 'com.example.my-plugin',
 *   name: 'My Plugin',
 *   version: '1.0.0',
 *   description: 'A helpful plugin',
 *   permissions: [
 *     { resource: 'memory', actions: ['read', 'write'] }
 *   ],
 *   surfaces: {
 *     cards: {
 *       defaultContent: 'Hello from my plugin'
 *     },
 *     panels: {
 *       defaultTitle: 'My Plugin Panel',
 *       defaultContent: 'Detailed information here'
 *     }
 *   },
 *   functions: [
 *     {
 *       name: 'getInfo',
 *       description: 'Get information about something',
 *       parameters: {
 *         type: 'object',
 *         properties: {
 *           topic: { type: 'string' }
 *         },
 *         required: ['topic']
 *       },
 *       handler: async (params) => {
 *         return { result: `Info about ${params.topic}` };
 *       }
 *     }
 *   ],
 *   onInitialize: async (context) => {
 *     // Setup code here
 *     await context.memory.set('initialized', true);
 *   }
 * });
 * ```
 */
export function createPlugin(config: PluginConfig): PluginInstance {
  // Validate the configuration
  validatePluginConfig(config);
  
  // Initialize context
  const context: PluginContext = {
    memory: {}, // This would be initialized with actual memory system
    permissions: {}, // This would be initialized with actual permissions system
    events: {}, // This would be initialized with actual events system
    surfaces: {} // This would be initialized with actual surface interfaces
  };
  
  // Create plugin instance
  const plugin: PluginInstance = {
    config,
    
    onInitialize: (callback: PluginInitializeCallback) => {
      // Store the callback to be executed at the appropriate time
      // In a real implementation, this would be tied to the lifecycle system
      setTimeout(() => {
        callback(context);
      }, 0);
    },
    
    registerAction: (name: string, handler: (payload: any) => any) => {
      // In a real implementation, this would register with an action system
      console.log(`Registered action '${name}' for plugin '${config.name}'`);
    },
    
    registerFunction: (functionDef: FunctionDefinition) => {
      // In a real implementation, this would register with the Super Agent
      console.log(`Registered function '${functionDef.name}' for plugin '${config.name}'`);
    },
    
    getContext: () => context
  };
  
  // Register provided functions with the Super Agent
  if (config.functions && Array.isArray(config.functions)) {
    for (const func of config.functions) {
      plugin.registerFunction(func);
    }
  }
  
  // Register surfaces
  for (const [surfaceType, surfaceConfig] of Object.entries(config.surfaces)) {
    // In a real implementation, this would register with the surface system
    console.log(`Registered surface '${surfaceType}' for plugin '${config.name}'`);
  }
  
  // Run initialization if provided
  if (typeof config.onInitialize === 'function') {
    plugin.onInitialize(config.onInitialize);
  }
  
  return plugin;
} 