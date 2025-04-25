/**
 * App Playground - Interactive Example
 * 
 * This example demonstrates how to create a fully functional Vibing AI app
 * with multiple interactive elements and configuration options.
 * 
 * Run this example with:
 * npx ts-node examples/interactive/app-playground.ts
 */

import { 
  createApp, 
  createCardSurface, 
  createPanelSurface,
  createModalSurface,
  AppOptions,
  VERSION
} from '../../src';

// ------------------------------------------------------------------
// Step 1: Define app configuration
// ------------------------------------------------------------------
// You can customize these options to see how they affect the app
const appOptions: AppOptions = {
  name: 'interactive-playground',
  description: 'An interactive playground app for exploring the SDK features',
  version: '1.0.0',
  // Enable debug mode to see detailed logs
  debug: true,
  // Custom settings for your app
  settings: {
    theme: 'light',  // Try changing to 'dark'
    animationsEnabled: true,
    persistState: true,
  }
};

// ------------------------------------------------------------------
// Step 2: Create the app instance
// ------------------------------------------------------------------
console.log(`Creating app using Vibing SDK v${VERSION}`);
const app = createApp(appOptions);

// ------------------------------------------------------------------
// Step 3: Set up state management
// ------------------------------------------------------------------
// This keeps track of our app's state
const state = {
  counter: 0,
  theme: appOptions.settings?.theme || 'light',
  lastAction: 'none',
  surfacesCreated: 0,
};

// ------------------------------------------------------------------
// Step 4: Create interactive card surface
// ------------------------------------------------------------------
console.log('Creating interactive card surface');
const cardSurface = createCardSurface({
  title: 'Interactive Card Example',
  description: 'Try clicking the buttons below to see real-time updates',
  content: `
    <div class="counter-display">
      <h2>Counter: ${state.counter}</h2>
      <p>Last action: ${state.lastAction}</p>
      <p>Current theme: ${state.theme}</p>
    </div>
  `,
  actions: [
    {
      type: 'button',
      text: 'Increment',
      style: 'primary',
      onClick: () => {
        // Update state
        state.counter++;
        state.lastAction = 'increment';
        
        // Update UI to reflect new state
        updateCardContent();
        
        console.log(`Counter incremented to ${state.counter}`);
      }
    },
    {
      type: 'button',
      text: 'Decrement',
      style: 'secondary',
      onClick: () => {
        // Update state
        state.counter--;
        state.lastAction = 'decrement';
        
        // Update UI to reflect new state
        updateCardContent();
        
        console.log(`Counter decremented to ${state.counter}`);
      }
    },
    {
      type: 'button',
      text: 'Toggle Theme',
      style: 'text',
      onClick: () => {
        // Update state
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        state.lastAction = 'theme toggle';
        
        // Update UI to reflect new state
        updateCardContent();
        
        // Apply theme to app
        app.updateSettings({
          theme: state.theme
        });
        
        console.log(`Theme switched to ${state.theme}`);
      }
    },
    {
      type: 'button',
      text: 'Open Panel',
      style: 'accent',
      onClick: () => {
        state.lastAction = 'open panel';
        updateCardContent();
        
        // Create panel on demand for better performance
        createAndShowPanel();
        
        console.log('Panel opened');
      }
    }
  ]
});

// ------------------------------------------------------------------
// Step 5: Helper functions for UI updates
// ------------------------------------------------------------------
// Updates the card content to reflect the current state
function updateCardContent() {
  cardSurface.update({
    content: `
      <div class="counter-display ${state.theme}">
        <h2>Counter: ${state.counter}</h2>
        <p>Last action: ${state.lastAction}</p>
        <p>Current theme: ${state.theme}</p>
        <p>Surfaces created: ${state.surfacesCreated}</p>
      </div>
    `
  });
}

// Creates a panel surface when needed
function createAndShowPanel() {
  state.surfacesCreated++;
  
  const panelSurface = createPanelSurface({
    title: 'Interactive Panel',
    position: 'right',
    width: 'medium',
    content: `
      <div class="panel-content">
        <h3>Panel Example</h3>
        <p>This panel was created dynamically.</p>
        <p>Current counter value: ${state.counter}</p>
        <p>Panel instance #${state.surfacesCreated}</p>
      </div>
    `,
    actions: [
      {
        type: 'button',
        text: 'Reset Counter',
        onClick: () => {
          state.counter = 0;
          state.lastAction = 'counter reset';
          updateCardContent();
          
          // Update panel content too
          panelSurface.update({
            content: `
              <div class="panel-content">
                <h3>Panel Example</h3>
                <p>Counter has been reset!</p>
                <p>Current counter value: ${state.counter}</p>
                <p>Panel instance #${state.surfacesCreated}</p>
              </div>
            `
          });
        }
      },
      {
        type: 'button',
        text: 'Open Modal',
        onClick: () => {
          createAndShowModal();
        }
      },
      {
        type: 'button',
        text: 'Close',
        onClick: () => {
          panelSurface.close();
        }
      }
    ],
    onClose: () => {
      console.log('Panel closed');
    }
  });
  
  // Register and show the panel
  app.registerSurface(panelSurface);
  panelSurface.show();
}

// Creates a modal surface when needed
function createAndShowModal() {
  state.surfacesCreated++;
  state.lastAction = 'open modal';
  updateCardContent();
  
  const modalSurface = createModalSurface({
    title: 'Important Action',
    size: 'medium',
    content: `
      <div class="modal-content">
        <h3>Confirm Action</h3>
        <p>Are you sure you want to perform this action?</p>
        <p>This will save the current counter value (${state.counter}).</p>
      </div>
    `,
    actions: [
      {
        type: 'button',
        text: 'Confirm',
        style: 'primary',
        onClick: () => {
          // Simulate saving data
          console.log(`Saved counter value: ${state.counter}`);
          state.lastAction = 'saved counter';
          updateCardContent();
          
          // Show success message in modal before closing
          modalSurface.update({
            content: `
              <div class="modal-content success">
                <h3>Success!</h3>
                <p>Counter value (${state.counter}) has been saved.</p>
                <p>The modal will close in 2 seconds.</p>
              </div>
            `
          });
          
          // Auto-close after delay
          setTimeout(() => {
            modalSurface.close();
          }, 2000);
        }
      },
      {
        type: 'button',
        text: 'Cancel',
        style: 'secondary',
        onClick: () => {
          modalSurface.close();
        }
      }
    ],
    onClose: () => {
      console.log('Modal closed');
    }
  });
  
  // Register and show the modal
  app.registerSurface(modalSurface);
  modalSurface.show();
}

// ------------------------------------------------------------------
// Step 6: Register app event handlers
// ------------------------------------------------------------------
app.addEventListener('start', () => {
  console.log('App started successfully');
});

app.addEventListener('error', (error) => {
  console.error('App encountered an error:', error);
});

app.addEventListener('settingsChange', (newSettings) => {
  console.log('App settings changed:', newSettings);
});

// ------------------------------------------------------------------
// Step 7: Register surfaces and start the app
// ------------------------------------------------------------------
console.log('Registering card surface');
app.registerSurface(cardSurface);

console.log('Starting app...');
app.start();

// ------------------------------------------------------------------
// USAGE NOTES:
// ------------------------------------------------------------------
// 1. Run this example to see a fully interactive app with dynamic surfaces
// 2. Try modifying the appOptions to change the app's behavior
// 3. Experiment with different event handlers and surface configurations
// 4. Check the console logs to see what's happening behind the scenes
// 5. Use this as a template for your own interactive applications
// ------------------------------------------------------------------ 