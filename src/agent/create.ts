/**
 * Agent creation utilities
 */
import { AgentConfig, AgentInstance, AgentOptions } from './types';
import { createAgent } from './createAgent';
import { logger } from '../core/utils/logger';

/**
 * Creates a new Vibing Agent with the specified configuration
 */
export function create(agentConfig: AgentConfig, _options: AgentOptions = {}): AgentInstance {
  // TODO: Implement more robust configuration validation
  try {
    // Validate and process the agent configuration
    logger.log('Creating agent with config:', agentConfig);
    return createAgent(agentConfig);
  } catch (error) {
    logger.error('Error creating agent:', error);
    throw error;
  }
}
