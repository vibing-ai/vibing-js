/**
 * Event Handling Setup
 * 
 * This module registers global event handlers for the application.
 */
import { useEvents } from '@vibing-ai/sdk';

/**
 * Registers global event handlers for the application
 */
export function registerEventHandlers(): void {
  const { subscribe, publish } = useEvents();
  
  // Handle application error events
  subscribe('app:error', (error) => {
    console.error('Application error:', error);
    
    // Publish an event to show an error notification
    publish('notification:show', {
      type: 'error',
      title: 'Application Error',
      message: error.message || 'An unknown error occurred',
      duration: 5000
    });
  });
  
  // Handle application warning events
  subscribe('app:warning', (warning) => {
    console.warn('Application warning:', warning);
    
    // Publish an event to show a warning notification
    publish('notification:show', {
      type: 'warning',
      title: 'Warning',
      message: warning.message || 'A warning occurred',
      duration: 4000
    });
  });
  
  // Handle application info events
  subscribe('app:info', (info) => {
    console.info('Application info:', info);
    
    // Publish an event to show an info notification
    publish('notification:show', {
      type: 'info',
      title: 'Information',
      message: info.message || '',
      duration: 3000
    });
  });
  
  // Handle auth state changes
  subscribe('auth:stateChange', (state) => {
    console.log('Auth state changed:', state);
    
    if (state.type === 'signIn') {
      // Handle user sign in
      publish('app:userSignedIn', { user: state.user });
    } else if (state.type === 'signOut') {
      // Handle user sign out
      publish('app:userSignedOut');
    }
  });
  
  // Handle permission changes
  subscribe('permissions:change', (change) => {
    console.log('Permission change:', change);
    
    if (change.type === 'granted') {
      publish('app:info', {
        message: `Permission ${change.permission} granted`
      });
    } else if (change.type === 'denied') {
      publish('app:warning', {
        message: `Permission ${change.permission} denied`
      });
    }
  });
  
  console.log('Event handlers registered');
} 