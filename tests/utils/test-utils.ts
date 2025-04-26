import React from 'react';
import { render, screen, waitFor, renderHook as rtlRenderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { RenderHookResult } from './test-types';

// Re-export testing utilities
export { render, screen, waitFor, userEvent };

// Custom render function with options for providers if needed
export function customRender(ui: React.ReactElement, options = {}) {
  return render(ui, {
    // You can add custom wrapper providers here if needed
    ...options,
  });
}

// Helper function to wait for promises to resolve
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper function to create mock functions
export const createMockFn = <T extends (...args: any[]) => any>(
  implementation?: T
) => jest.fn(implementation);

// Custom renderHook function that adds better type support
export function renderHook<T, Props = any>(
  callback: (props: Props) => T
): RenderHookResult<T> {
  return rtlRenderHook(callback) as unknown as RenderHookResult<T>;
}

// Helper to wrap act with proper types
export { act } from '@testing-library/react';

// Export everything from RTL
export * from '@testing-library/react'; 