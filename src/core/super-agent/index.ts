import { type ReactNode as _ReactNode, useCallback, useState } from 'react';
import { logger } from '../utils/logger';

/**
 * Options for querying the Super Agent
 */
export interface QueryOptions {
  /**
   * Whether to include conversation history
   */
  includeHistory?: boolean;

  /**
   * Additional context items to include
   */
  contextItems?: ContextItem[];

  /**
   * Whether to stream the response
   */
  stream?: boolean;

  /**
   * Callback for handling streamed chunks
   */
  onStream?: (chunk: string) => void;
}

/**
 * Context item for providing additional context to the Super Agent
 */
export interface ContextItem {
  /**
   * Content of the context item
   */
  content: string;

  /**
   * Optional title of the context item
   */
  title?: string;

  /**
   * Optional source of the context item
   */
  source?: string;

  /**
   * Optional relevance score (0-1)
   */
  relevance?: number;
}

/**
 * Response from the Super Agent
 */
export interface AgentResponse {
  /**
   * The generated text
   */
  text: string;

  /**
   * Optional structured data from the agent
   */
  data?: unknown;

  /**
   * Optional suggested follow-up questions
   */
  followupQuestions?: string[];

  /**
   * Optional suggested actions
   */
  suggestedActions?: ActionSuggestion[];
}

/**
 * Suggested action from the Super Agent
 */
export interface ActionSuggestion {
  /**
   * Type of action
   */
  type: string;

  /**
   * Display title for the action
   */
  title: string;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Optional icon identifier
   */
  icon?: string;

  /**
   * Function to execute when the action is chosen
   */
  action: () => void;
}

/**
 * Intent handler function
 */
export type IntentHandler = (
  intent: string,
  parameters: Record<string, unknown>
) => Promise<void> | void;

/**
 * Conversation context
 */
export interface ConversationContext {
  /**
   * Recent messages in the conversation
   */
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;

  /**
   * Active UI components and their state
   */
  activeComponents: Record<string, unknown>;

  /**
   * Current application state
   */
  appState: Record<string, unknown>;
}

/**
 * Hook for interacting with the Super Agent
 *
 * @returns Super Agent interaction functions
 *
 * @example
 * ```tsx
 * const {
 *   askSuperAgent,
 *   suggestAction,
 *   getConversationContext,
 *   onIntent
 * } = useSuperAgent();
 *
 * // Ask the Super Agent a question
 * const response = await askSuperAgent('What can I do with this data?');
 * console.log(response.text);
 *
 * // Suggest an action to the user
 * suggestAction({
 *   type: 'visualization',
 *   title: 'Create chart',
 *   description: 'Visualize the data as a bar chart',
 *   icon: 'chart-bar',
 *   action: () => createChart()
 * });
 *
 * // Register an intent handler
 * onIntent('createReport', async (intent, params) => {
 *   await generateReport(params.type, params.data);
 * });
 * ```
 */
export function useSuperAgent() {
  // For Stage 1, this is a simplified implementation
  // In production, this would connect to the actual Super Agent system

  const [intentHandlers, setIntentHandlers] = useState<Record<string, IntentHandler>>({});

  /**
   * Asks the Super Agent a question
   *
   * @param query The query to ask
   * @param options Additional options for the query
   * @returns The agent's response
   */
  const askSuperAgent = useCallback(
    async (query: string, options: QueryOptions = {}): Promise<AgentResponse> => {
      logger.log('[Super Agent] Query:', query, 'Options:', options);

      // In Stage 1, we return a mock response
      // In production, this would call the actual Super Agent API

      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate a mock response
      return {
        text: `This is a mock response to your query: "${query}"`,
        followupQuestions: ['What else would you like to know?', 'Should I provide more details?'],
        suggestedActions: [
          {
            type: 'example',
            title: 'Example Action',
            description: 'This is an example action suggestion',
            icon: 'bolt',
            action: () => logger.log('Example action executed'),
          },
        ],
      };
    },
    []
  );

  /**
   * Suggests an action to the user
   *
   * @param suggestion The action suggestion
   */
  const suggestAction = useCallback((suggestion: ActionSuggestion) => {
    logger.log('[Super Agent] Action suggestion:', suggestion);

    // In Stage 1, this just logs the suggestion
    // In production, this would display the suggestion in the UI
  }, []);

  /**
   * Gets the current conversation context
   *
   * @returns The conversation context
   */
  const getConversationContext = useCallback((): ConversationContext => {
    // In Stage 1, this returns a mock context
    // In production, this would get the actual conversation context

    return {
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'How can I help you today?' },
      ],
      activeComponents: {},
      appState: {},
    };
  }, []);

  /**
   * Registers a handler for a specific intent
   *
   * @param intent The intent name
   * @param handler The handler function
   * @returns A function to unregister the handler
   */
  const onIntent = useCallback((intent: string, handler: IntentHandler) => {
    logger.log(`[Super Agent] Registered handler for intent: ${intent}`);

    setIntentHandlers(prev => ({
      ...prev,
      [intent]: handler,
    }));

    // Return a function to unregister the handler
    return () => {
      setIntentHandlers(prev => {
        const newHandlers = { ...prev };
        delete newHandlers[intent];
        return newHandlers;
      });
    };
  }, []);

  /**
   * Handles an intent from the Super Agent
   *
   * @param intent The intent name
   * @param parameters The intent parameters
   * @returns Whether the intent was handled
   */
  const handleIntent = useCallback(
    async (intent: string, parameters: Record<string, unknown> = {}): Promise<boolean> => {
      logger.log(`[Super Agent] Handling intent: ${intent}`, parameters);

      const handler = intentHandlers[intent];
      if (handler) {
        await handler(intent, parameters);
        return true;
      }

      return false;
    },
    [intentHandlers]
  );

  return {
    askSuperAgent,
    suggestAction,
    getConversationContext,
    onIntent,
    handleIntent,
  };
}

// Future enhancements for Stage 2:
// - Integration with actual Super Agent backend
// - Improved context management
// - Advanced action suggestion system
// - Intent detection in natural language
