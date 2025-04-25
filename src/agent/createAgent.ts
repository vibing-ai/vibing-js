import {
  AgentConfig,
  AgentInstance,
  AgentContext,
  AgentInitializeCallback,
  AgentResponse,
  QueryContext,
  AgentMessageHandler,
} from './types';
import { logger } from '../core/utils';

/**
 * Validates an agent configuration
 * @param config The agent configuration to validate
 * @throws Error if the configuration is invalid
 */
function validateAgentConfig(config: AgentConfig): void {
  // Check required fields
  if (!config.id) {
    throw new Error('Agent id is required');
  }

  if (!config.name) {
    throw new Error('Agent name is required');
  }

  if (!config.version) {
    throw new Error('Agent version is required');
  }

  if (!config.domain) {
    throw new Error('Agent domain is required');
  }

  if (
    !config.capabilities ||
    !Array.isArray(config.capabilities) ||
    config.capabilities.length === 0
  ) {
    throw new Error('Agent capabilities must be a non-empty array');
  }

  if (!config.processQuery || typeof config.processQuery !== 'function') {
    throw new Error('Agent must have a processQuery function');
  }

  if (!config.permissions || !Array.isArray(config.permissions)) {
    throw new Error('Agent permissions must be an array');
  }

  // Validate permissions format
  for (const permission of config.permissions) {
    if (!permission.type || typeof permission.type !== 'string') {
      throw new Error('Each permission must have a valid type string');
    }
    if (!permission.access || !Array.isArray(permission.access)) {
      throw new Error('Each permission must have an access array');
    }
  }

  // Validate surfaces if provided
  if (config.surfaces && typeof config.surfaces !== 'object') {
    throw new Error('Agent surfaces must be a valid object');
  }
}

/**
 * Creates an agent instance
 *
 * @param config Configuration for the agent
 * @returns An agent instance
 *
 * @example
 * ```tsx
 * const financialAdvisor = createAgent({
 *   id: 'com.example.financial-advisor',
 *   name: 'Financial Advisor',
 *   version: '1.0.0',
 *   description: 'I provide financial advice and investment recommendations',
 *   domain: 'finance',
 *   capabilities: ['investment-advice', 'budget-planning', 'tax-optimization'],
 *   permissions: [
 *     { type: 'memory', access: ['read', 'write'] },
 *     { type: 'user-data', access: ['read'] }
 *   ],
 *   processQuery: async (query, context) => {
 *     // Process the user's query and generate a response
 *     // This is where the agent's domain-specific logic goes
 *     return {
 *       text: `Here's my advice about "${query}"...`,
 *       followupQuestions: [
 *         'Would you like to learn more about tax optimization?',
 *         'Should we review your investment portfolio?'
 *       ]
 *     };
 *   },
 *   onInitialize: async (context) => {
 *     // Load knowledge base, models, or other resources
 *     await context.memory.set('agent:initialized', true);
 *   }
 * });
 * ```
 */
export function createAgent(config: AgentConfig): AgentInstance {
  // Validate the configuration
  validateAgentConfig(config);

  // Initialize context
  const context: AgentContext = {
    memory: {}, // This would be initialized with actual memory system
    permissions: {}, // This would be initialized with actual permissions system
    events: {}, // This would be initialized with actual events system
    surfaces: {}, // This would be initialized with actual surface interfaces
  };

  // Initialize message handler
  let messageHandler: AgentMessageHandler | null = null;

  // Create agent instance
  const agent: AgentInstance = {
    config,

    onInitialize: (callback: AgentInitializeCallback) => {
      // Store the callback to be executed at the appropriate time
      // In a real implementation, this would be tied to the lifecycle system
      setTimeout(() => {
        callback(context);
      }, 0);
    },

    onMessage: (handler: AgentMessageHandler) => {
      messageHandler = handler;
      logger.log(`Registered message handler for agent '${config.name}'`);
    },

    processQuery: async (
      query: string,
      partialContext?: Partial<QueryContext>
    ): Promise<AgentResponse> => {
      // Create a complete context by merging the partial context with defaults
      const queryContext: QueryContext = {
        memory: context.memory,
        permissions: context.permissions,
        history: [],
        ...partialContext,
      };

      try {
        // Use the custom message handler if set, otherwise use the default processQuery
        if (messageHandler) {
          return await messageHandler(query, queryContext);
        }

        // Use the configuration's processQuery function
        return await config.processQuery(query, queryContext);
      } catch (error) {
        logger.error(`Error processing query in agent '${config.name}':`, error);
        return {
          text: 'I encountered an error while processing your request. Please try again later.',
          data: { error: String(error) },
        };
      }
    },

    getContext: () => context,
  };

  // Register surfaces if provided
  if (config.surfaces) {
    for (const [surfaceType, _surfaceConfig] of Object.entries(config.surfaces)) {
      // In a real implementation, this would register with the surface system
      logger.log(`Registered surface '${surfaceType}' for agent '${config.name}'`);
    }
  }

  // Run initialization if provided
  if (typeof config.onInitialize === 'function') {
    agent.onInitialize(config.onInitialize);
  }

  return agent;
}
