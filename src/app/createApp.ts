import {
  AppConfig,
  AppInstance,
  AppInitializeCallback,
  AppRenderCallback,
  AppPlugin,
} from './types';
import React from 'react';
// import { permissions } from '../core/permissions'; // Will be implemented later
import { events } from '../core/events';
import { logger } from '../core/utils';

/**
 * Creates a Vibing AI app
 *
 * @param config - Configuration options for the app
 * @returns An AppInstance object
 *
 * @example
 * ```tsx
 * const app = createApp({
 *   name: 'My Awesome App',
 *   description: 'This app does amazing things',
 *   permissions: ['memory:read', 'memory:write']
 * });
 *
 * app.onInitialize(async () => {
 *   // Initialize app state, load data, etc.
 *   console.log('App is initializing');
 * });
 *
 * app.onRender((container) => {
 *   // Render your app UI
 *   container.innerHTML = '<div>Hello, Vibing!</div>';
 * });
 * ```
 */
export function createApp(config: AppConfig): AppInstance {
  // Validate config
  if (!config.name) {
    throw new Error('App name is required');
  }

  // Initialize lifecycle handlers
  let initializeCallback: AppInitializeCallback | null = null;
  let renderCallback: AppRenderCallback | null = null;

  // Store for plugins
  const plugins: AppPlugin[] = [];

  // Type for internal methods
  interface InternalApp extends AppInstance {
    _initialize: () => Promise<boolean>;
    _render: (container: HTMLElement) => Promise<boolean>;
    _requestPermissions?: () => Promise<void>;
  }

  // Create app instance
  const app: InternalApp = {
    config,

    onInitialize: (callback: AppInitializeCallback): void => {
      initializeCallback = callback;
    },

    onRender: (callback: AppRenderCallback): void => {
      renderCallback = callback;
    },

    // Plugin management
    registerPlugin: (plugin: AppPlugin): void => {
      plugins.push(plugin);
      logger.log(
        `Plugin "${plugin.config?.name || 'Unknown'}" registered with app "${config.name}"`
      );
    },

    unregisterPlugin: (pluginId: string): void => {
      const index = plugins.findIndex(p => p.config?.id === pluginId);
      if (index >= 0) {
        plugins.splice(index, 1);
        logger.log(`Plugin "${pluginId}" unregistered from app "${config.name}"`);
      }
    },

    getPlugins: (): AppPlugin[] => {
      return [...plugins];
    },

    initialize: async (): Promise<boolean> => {
      return app._initialize();
    },

    // React Provider component for tests
    AppProvider: ({ children }: { children: React.ReactNode }): React.ReactElement => {
      return React.createElement(React.Fragment, null, children);
    },

    // Implementation of internal methods - will be defined below
    _initialize: async (): Promise<boolean> => {
      throw new Error('Not implemented');
    },

    _render: async (_container: HTMLElement): Promise<boolean> => {
      throw new Error('Not implemented');
    },
  };

  // Log app creation
  logger.log(`Vibing AI App "${config.name}" created`);

  // Request necessary permissions if specified
  if (config.permissions && config.permissions.length > 0) {
    // In the actual implementation, this would handle permission requests properly
    // For Stage 1, we'll just log them
    logger.log(`App "${config.name}" requires permissions: ${config.permissions.join(', ')}`);

    // Example permission request for when it's needed
    const requestPermissions = async (): Promise<void> => {
      // This is a simplified implementation for Stage 1
      // In production, this would handle more complex permission mapping
      const permissionRequests = config.permissions?.map(perm => {
        const [type, access] = perm.split(':');
        return {
          type,
          access: [access],
          scope: 'conversation' as const,
          purpose: `Required for ${config.name} to function`,
        };
      });

      // For demonstration purposes, log but don't actually request in this version
      logger.log('App will request permissions:', permissionRequests);
    };

    // Store the permission request function for later use
    app._requestPermissions = requestPermissions;
  }

  // Register with the app lifecycle management system
  events.publish('app:created', {
    name: config.name,
    description: config.description,
  });

  // Handle app initialization
  app._initialize = async (): Promise<boolean> => {
    try {
      // Emit initialization event
      events.publish('app:initializing', { name: config.name });

      // Initialize plugins if any
      for (const plugin of plugins) {
        if (plugin.onInitialize && typeof plugin.onInitialize === 'function') {
          try {
            // Initialize plugin with app context
            await plugin.onInitialize({
              app: {
                name: config.name,
                data: config.data || {},
              },
              events: events,
            });
          } catch (error) {
            logger.error(`Error initializing plugin "${plugin.config?.name || 'Unknown'}":`, error);
          }
        }
      }

      // Call initialization callback if registered
      if (initializeCallback) {
        await initializeCallback();
      }

      // Emit initialized event
      events.publish('app:initialized', { name: config.name });

      return true;
    } catch (error) {
      logger.error(`Error initializing app "${config.name}":`, error);
      events.publish('app:error', {
        name: config.name,
        phase: 'initialization',
        error,
      });
      return false;
    }
  };

  // Handle app rendering
  app._render = async (container: HTMLElement): Promise<boolean> => {
    try {
      // Emit rendering event
      events.publish('app:rendering', { name: config.name });

      // Call render callback if registered
      if (renderCallback) {
        await renderCallback(container);
      } else {
        // Default render if no callback specified
        container.innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <h2>${config.name}</h2>
            ${config.description ? `<p>${config.description}</p>` : ''}
            <p>No render function provided for this app.</p>
          </div>
        `;
      }

      // Emit rendered event
      events.publish('app:rendered', { name: config.name });

      return true;
    } catch (error) {
      logger.error(`Error rendering app "${config.name}":`, error);
      events.publish('app:error', {
        name: config.name,
        phase: 'rendering',
        error,
      });

      // Show error in container
      container.innerHTML = `
        <div style="padding: 20px; color: #ff3333; text-align: center;">
          <h2>Error in ${config.name}</h2>
          <p>${error instanceof Error ? error.message : String(error)}</p>
        </div>
      `;

      return false;
    }
  };

  return app;
}
