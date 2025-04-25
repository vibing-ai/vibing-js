/**
 * Memory System Setup
 * 
 * This module handles the initialization and configuration of the memory system.
 */
import { useMemory } from '@vibing-ai/sdk';

/**
 * Sets up the memory system for the application
 */
export async function setupMemory(): Promise<void> {
  const { initialize, ensureNamespace } = useMemory();
  
  // Initialize the memory system with default configuration
  await initialize({
    persistenceLevel: 'session',
    encryptionLevel: 'medium',
    compressionEnabled: true
  });
  
  // Ensure necessary namespaces exist
  await ensureNamespace('notes', {
    description: 'Storage for user notes',
    permissionLevel: 'private'
  });
  
  await ensureNamespace('tasks', {
    description: 'Storage for user tasks',
    permissionLevel: 'private'
  });
  
  await ensureNamespace('settings', {
    description: 'User application settings',
    permissionLevel: 'private'
  });
  
  // Set default settings if they don't exist
  const { get, set } = useMemory();
  
  const settings = await get('settings');
  if (!settings) {
    await set('settings', {
      theme: 'light',
      notificationEnabled: true,
      autoSave: true,
      defaultView: 'list'
    });
  }
  
  console.log('Memory system initialized');
} 