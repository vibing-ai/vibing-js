/**
 * Test utilities for integration tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createApp, AppConfig } from '../../../src/app/createApp';
import { createPlugin, PluginConfig } from '../../../src/plugin/createPlugin';

/**
 * Creates a test app with basic configuration
 */
export function createTestApp(config: Partial<AppConfig> = {}) {
  return createApp({
    id: 'test-app',
    name: 'Test App',
    version: '1.0.0',
    permissions: [],
    ...config
  });
}

/**
 * Creates a test plugin with basic configuration
 */
export function createTestPlugin(config: Partial<PluginConfig> = {}) {
  return createPlugin({
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    permissions: [],
    surfaces: {},
    ...config
  });
}

/**
 * Custom renderer with app context
 */
export function renderWithApp(ui: React.ReactElement, appConfig: Partial<AppConfig> = {}) {
  const app = createTestApp(appConfig);
  const utils = render(ui, {
    wrapper: ({ children }) => app.AppProvider({ children })
  });
  return {
    ...utils,
    app
  };
}

/**
 * Wait for an element to be removed from the DOM
 */
export async function waitForElementToBeRemoved(element: Element | null) {
  if (!element) return;
  await waitFor(() => {
    expect(element).not.toBeInTheDocument();
  });
}

/**
 * Create a mock memory store for testing
 */
export function createMockMemoryStore() {
  const store: Record<string, any> = {};
  
  return {
    get: jest.fn((key: string) => Promise.resolve(store[key])),
    set: jest.fn((key: string, value: any) => {
      store[key] = value;
      return Promise.resolve();
    }),
    remove: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    }),
    getAll: jest.fn(() => Promise.resolve({ ...store })),
    store
  };
}

/**
 * Creates mock event system for testing
 */
export function createMockEventSystem() {
  const listeners: Record<string, Array<(...args: any[]) => void>> = {};
  
  return {
    on: jest.fn((event: string, callback: (...args: any[]) => void) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    }),
    off: jest.fn((event: string, callback: (...args: any[]) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(cb => cb !== callback);
      }
    }),
    emit: jest.fn((event: string, ...args: any[]) => {
      if (listeners[event]) {
        listeners[event].forEach(callback => callback(...args));
      }
    }),
    listeners
  };
}

/**
 * Creates a test user for user events
 */
export function createTestUser() {
  return userEvent.setup();
}

/**
 * Wait for a specified time
 */
export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
} 