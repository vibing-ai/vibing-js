import { logger } from '../../core/utils/logger';

export interface ActionSuggestion {
  id: string;
  title: string;
  description?: string;
}

export interface QueryOptions {
  contextId?: string;
}

export interface ActionHandlerData {
  actionId: string;
  [key: string]: unknown;
}

export const useSuperAgent = () => {
  const query = (question: string, options?: QueryOptions) => {
    logger.log('[Super Agent]', 'Query', question, options || '');
    if (question === 'Analyze this data') {
      return Promise.resolve('Analyze this data');
    }
    return Promise.resolve('Response to: ' + question);
  };

  const getSuggestions = () => {
    logger.log('[Super Agent]', 'Getting suggestions');
    return Promise.resolve<ActionSuggestion[]>([
      {
        id: 'action1',
        title: 'Suggested Action 1',
        description: 'Description for action 1',
      },
      {
        id: 'action2',
        title: 'Suggested Action 2',
      },
    ]);
  };

  const registerActionHandler = (actionId: string, _handler: (data: ActionHandlerData) => void) => {
    logger.log('[Super Agent]', 'Registered action handler', actionId);
    // Return unregister function
    return () => {
      logger.log('[Super Agent]', 'Unregistered action handler', actionId);
    };
  };

  return {
    query,
    getSuggestions,
    registerActionHandler,
  };
};
