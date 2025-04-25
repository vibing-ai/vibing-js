import { AppConfig, AppInstance, AppInitializeCallback, AppRenderCallback } from './types';
import { permissions } from '../common/permissions';
import { events } from '../common/events';

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

  // Create app instance
  const app: AppInstance = {
    config,

    onInitialize: (callback: AppInitializeCallback): void => {
      initializeCallback = callback;
    },

    onRender: (callback: AppRenderCallback): void => {
      renderCallback = callback;
    }
  };

  // Log app creation
  console.log(`Vibing AI App "${config.name}" created`);

  // Request necessary permissions if specified
  if (config.permissions && config.permissions.length > 0) {
    // In the actual implementation, this would handle permission requests properly
    // For Stage 1, we'll just log them
    console.log(`App "${config.name}" requires permissions: ${config.permissions.join(', ')}`);
    
    // Example permission request for when it's needed
    const requestPermissions = async () => {
      // This is a simplified implementation for Stage 1
      // In production, this would handle more complex permission mapping
      const permissionRequests = config.permissions?.map(perm => {
        const [type, access] = perm.split(':');
        return {
          type,
          access: [access],
          scope: 'conversation' as const,
          purpose: `Required for ${config.name} to function`
        };
      });

      // For demonstration purposes, log but don't actually request in this version
      console.log('App will request permissions:', permissionRequests);
    };

    // Store the permission request function for later use
    (app as any)._requestPermissions = requestPermissions;
  }

  // Register with the app lifecycle management system
  events.publish('app:created', { 
    name: config.name,
    description: config.description
  });

  // Handle app initialization
  (app as any)._initialize = async () => {
    try {
      // Emit initialization event
      events.publish('app:initializing', { name: config.name });
      
      // Call initialization callback if registered
      if (initializeCallback) {
        await initializeCallback();
      }
      
      // Emit initialized event
      events.publish('app:initialized', { name: config.name });
      
      return true;
    } catch (error) {
      console.error(`Error initializing app "${config.name}":`, error);
      events.publish('app:error', { 
        name: config.name, 
        phase: 'initialization',
        error
      });
      return false;
    }
  };

  // Handle app rendering
  (app as any)._render = async (container: HTMLElement) => {
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
      console.error(`Error rendering app "${config.name}":`, error);
      events.publish('app:error', { 
        name: config.name, 
        phase: 'rendering',
        error
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