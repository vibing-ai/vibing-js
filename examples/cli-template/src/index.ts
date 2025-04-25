/**
 * Main entry point for the Vibing Template App
 */
import { createApp, LifecyclePhase } from '@vibing-ai/sdk';
import { registerComponents } from './components';
import { setupMemory } from './utils/memory';
import { registerEventHandlers } from './utils/events';

// Import our sample feature implementations
import { noteFeature } from './features/notes';
import { taskFeature } from './features/tasks';

// Create the Vibing application
const app = createApp({
  name: 'Vibing Template App',
  version: '1.0.0',
  
  // Define permission requirements
  permissions: [
    { type: 'memory.read', reason: 'Read user data' },
    { type: 'memory.write', reason: 'Store user data' },
    { type: 'permissions.request', reason: 'Request additional permissions when needed' },
    { type: 'surfaces.cards.create', reason: 'Show conversation cards' },
    { type: 'surfaces.panels.create', reason: 'Display information panels' },
    { type: 'surfaces.modals.show', reason: 'Show dialogs for user input' },
    { type: 'surfaces.canvas.edit', reason: 'Create and edit canvas documents' }
  ],
  
  // App lifecycle hooks
  onInitialize: async (context) => {
    console.log('App initializing...');
    
    // Initialize memory system
    await setupMemory();
    
    // Register UI components
    registerComponents();
    
    // Register event handlers
    registerEventHandlers();
    
    // Initialize features
    await noteFeature.initialize(context);
    await taskFeature.initialize(context);
    
    console.log('App initialized successfully!');
  },
  
  onPhaseChange: (phase) => {
    switch (phase) {
      case LifecyclePhase.LOADING:
        console.log('App is loading...');
        break;
      case LifecyclePhase.RUNNING:
        console.log('App is now running!');
        break;
      case LifecyclePhase.PAUSED:
        console.log('App is paused');
        break;
      case LifecyclePhase.STOPPING:
        console.log('App is shutting down...');
        break;
    }
  },
  
  onError: (error) => {
    console.error('App encountered an error:', error);
    // Report error or attempt recovery
  },
  
  onUninstall: async () => {
    console.log('App is being uninstalled, cleaning up...');
    // Perform cleanup tasks
  }
});

// Export the app instance
export default app; 