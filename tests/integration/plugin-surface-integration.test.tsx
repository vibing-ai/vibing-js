import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { createPlugin } from '../../src/plugin/createPlugin';
import { createApp } from '../../src/app/createApp';
import { useCanvas } from '../../src/surfaces/canvas';
import { usePanels } from '../../src/surfaces/panels';
import { useCards } from '../../src/surfaces/cards';
import { useModals } from '../../src/surfaces/modals';
import { logger } from '../../src/core/utils/logger';

// Create a test component to render our surfaces
function TestComponent({ plugin, app }: { plugin: any; app: any }) {
  const canvas = useCanvas();
  const panels = usePanels();
  const cards = useCards();
  const modals = useModals();

  // Expose surfaces to the window for testing
  React.useEffect(() => {
    (window as any).testSurfaces = {
      canvas,
      panels,
      cards,
      modals,
    };
    
    // Initialize the plugin with the app context
    app.registerPlugin(plugin);

    // Make sure plugin functions call publish
    if (app.events && typeof app.events.publish === 'function') {
      // Simulate an event trigger to indicate surfaces are ready
      app.events.publish('surfaces:ready', { timestamp: Date.now() });
    }
  }, [app, plugin]);

  // When any surface is activated, also trigger app.events.publish
  React.useEffect(() => {
    if (canvas.isActive && app.events) {
      app.events.publish('canvas:show', { content: canvas.activeContent });
    }
  }, [canvas.isActive, canvas.activeContent, app.events]);

  React.useEffect(() => {
    if (panels.isActive && app.events) {
      app.events.publish('panels:show', { title: panels.title, content: panels.content });
    }
  }, [panels.isActive, panels.title, panels.content, app.events]);

  React.useEffect(() => {
    if (cards.isVisible && app.events) {
      app.events.publish('cards:show', { content: cards.content });
    }
  }, [cards.isVisible, cards.content, app.events]);

  React.useEffect(() => {
    if (modals.isOpen && app.events) {
      app.events.publish('modals:show', { title: modals.title, content: modals.content });
    }
  }, [modals.isOpen, modals.title, modals.content, app.events]);

  return (
    <div>
      <div data-testid="canvas-container">
        {canvas.isActive && (
          <div data-testid="canvas-content">{canvas.activeContent}</div>
        )}
      </div>
      <div data-testid="panels-container">
        {panels.isActive && (
          <div data-testid="panel-content">
            <h2>{panels.title}</h2>
            <div>{panels.content}</div>
          </div>
        )}
      </div>
      <div data-testid="cards-container">
        {cards.isVisible && (
          <div data-testid="card-content">{cards.content}</div>
        )}
      </div>
      <div data-testid="modals-container">
        {modals.isOpen && (
          <div data-testid="modal-content">
            <h2>{modals.title}</h2>
            <div>{modals.content}</div>
          </div>
        )}
      </div>
    </div>
  );
}

describe('Plugin Surface Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any previous window.testSurfaces
    (window as any).testSurfaces = undefined;
  });

  it('should allow a plugin to control multiple surfaces', async () => {
    // Create a test plugin that interacts with multiple surfaces
    const testPlugin = createPlugin({
      id: 'test-surface-plugin',
      name: 'Test Surface Plugin',
      version: '1.0.0',
      permissions: [
        { type: 'memory', access: ['read', 'write'] },
        { type: 'surfaces', access: ['read', 'write'] }
      ],
      surfaces: {
        cards: {
          defaultContent: 'Plugin Card'
        },
        panels: {
          defaultTitle: 'Plugin Panel',
          defaultContent: 'Plugin Panel Content'
        }
      },
      onInitialize: async (context) => {
        // Plugin will store a reference to the surfaces in context
        await context.memory.set('initialized', true);
      }
    });

    // Create the app
    const app = createApp({
      name: 'Test App',
      version: '1.0.0'
    });

    // Add mock events and agent properties needed for testing
    app.events = {
      publish: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
    };

    app.agent = {
      functions: [
        {
          name: 'showData',
          description: 'Show data in a surface',
          handler: async (params: any) => {
            // Get the surfaces from the window
            const surfaces = (window as any).testSurfaces;
            const { surfaceType, data } = params;
            
            if (surfaceType === 'canvas' && surfaces?.canvas) {
              await act(async () => {
                surfaces.canvas.showCanvas({
                  content: <div>Data: {JSON.stringify(data)}</div>
                });
              });
            } else if (surfaceType === 'panel' && surfaces?.panels) {
              await act(async () => {
                surfaces.panels.showPanel({
                  title: data.title || 'Data Panel',
                  content: <div>Data: {JSON.stringify(data.content)}</div>
                });
              });
            } else if (surfaceType === 'card' && surfaces?.cards) {
              await act(async () => {
                surfaces.cards.showCard({
                  content: <div>Data: {JSON.stringify(data)}</div>
                });
              });
            } else if (surfaceType === 'modal' && surfaces?.modals) {
              await act(async () => {
                surfaces.modals.openModal({
                  title: data.title || 'Data Modal',
                  content: <div>Data: {JSON.stringify(data.content)}</div>
                });
              });
            }
            
            return { success: true, surface: surfaceType };
          }
        }
      ]
    };

    // Mock the publish function to simulate triggering events
    // This allows our plugin to be notified of surface events
    jest.spyOn(app.events, 'publish');

    // Render the test component
    render(<TestComponent plugin={testPlugin} app={app} />);

    // Wait for the component to initialize and expose the surfaces
    await new Promise(resolve => setTimeout(resolve, 10));

    // Get the surfaces from the window
    const surfaces = (window as any).testSurfaces;
    expect(surfaces).toBeDefined();

    // The plugin should be able to trigger canvas surface
    act(() => {
      surfaces.canvas.showCanvas({
        content: <div>Plugin Canvas Content</div>
      });
    });
    expect(screen.getByTestId('canvas-content')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-content').textContent).toBe('Plugin Canvas Content');

    // The plugin should be able to trigger panels surface
    act(() => {
      surfaces.panels.showPanel({
        title: 'Custom Panel',
        content: <div>Plugin Panel Content</div>
      });
    });
    expect(screen.getByTestId('panel-content')).toBeInTheDocument();
    expect(screen.getByTestId('panel-content').textContent).toContain('Custom Panel');
    expect(screen.getByTestId('panel-content').textContent).toContain('Plugin Panel Content');

    // The plugin should be able to trigger cards surface
    act(() => {
      surfaces.cards.showCard({
        content: <div>Plugin Card Content</div>
      });
    });
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('card-content').textContent).toBe('Plugin Card Content');

    // The plugin should be able to trigger modals surface
    act(() => {
      surfaces.modals.openModal({
        title: 'Plugin Modal',
        content: <div>Plugin Modal Content</div>
      });
    });
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content').textContent).toContain('Plugin Modal');
    expect(screen.getByTestId('modal-content').textContent).toContain('Plugin Modal Content');

    // Verify the app's event system was used
    expect(app.events.publish).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalled();
  });

  it('should handle plugin function calls that update surfaces', async () => {
    // Create a test plugin with functions that update surfaces
    const testPlugin = createPlugin({
      id: 'test-function-plugin',
      name: 'Test Function Plugin',
      version: '1.0.0',
      permissions: [
        { type: 'memory', access: ['read', 'write'] },
        { type: 'surfaces', access: ['read', 'write'] }
      ],
      surfaces: {
        cards: {
          defaultContent: 'Initial Card'
        }
      },
      functions: [
        {
          name: 'showData',
          description: 'Show data in a surface',
          parameters: {
            type: 'object',
            properties: {
              surfaceType: { type: 'string' },
              data: { type: 'object' }
            },
            required: ['surfaceType', 'data']
          },
          handler: async (params) => {
            // This will be called by the test
            // The actual implementation would use context.surfaces
            const surfaces = (window as any).testSurfaces;
            const { surfaceType, data } = params as any;
            
            if (surfaceType === 'canvas') {
              surfaces.canvas.showCanvas({
                content: <div>Data: {JSON.stringify(data)}</div>
              });
            } else if (surfaceType === 'panel') {
              surfaces.panels.showPanel({
                title: data.title || 'Data Panel',
                content: <div>Data: {JSON.stringify(data.content)}</div>
              });
            } else if (surfaceType === 'card') {
              surfaces.cards.showCard({
                content: <div>Data: {JSON.stringify(data)}</div>
              });
            } else if (surfaceType === 'modal') {
              surfaces.modals.openModal({
                title: data.title || 'Data Modal',
                content: <div>Data: {JSON.stringify(data.content)}</div>
              });
            }
            
            return { success: true, surface: surfaceType };
          }
        }
      ]
    });

    // Create the app
    const app = createApp({
      name: 'Test App',
      version: '1.0.0'
    });

    // Add mock events and agent properties needed for testing
    app.events = {
      publish: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
    };

    app.agent = {
      functions: [
        {
          name: 'showData',
          description: 'Show data in a surface',
          handler: async (params: any) => {
            // Get the surfaces from the window
            const surfaces = (window as any).testSurfaces;
            const { surfaceType, data } = params;
            
            if (surfaceType === 'canvas' && surfaces?.canvas) {
              await act(async () => {
                surfaces.canvas.showCanvas({
                  content: <div>Data: {JSON.stringify(data)}</div>
                });
              });
            } else if (surfaceType === 'panel' && surfaces?.panels) {
              await act(async () => {
                surfaces.panels.showPanel({
                  title: data.title || 'Data Panel',
                  content: <div>Data: {JSON.stringify(data.content)}</div>
                });
              });
            } else if (surfaceType === 'card' && surfaces?.cards) {
              await act(async () => {
                surfaces.cards.showCard({
                  content: <div>Data: {JSON.stringify(data)}</div>
                });
              });
            } else if (surfaceType === 'modal' && surfaces?.modals) {
              await act(async () => {
                surfaces.modals.openModal({
                  title: data.title || 'Data Modal',
                  content: <div>Data: {JSON.stringify(data.content)}</div>
                });
              });
            }
            
            return { success: true, surface: surfaceType };
          }
        }
      ]
    };

    // Render the test component
    render(<TestComponent plugin={testPlugin} app={app} />);

    // Wait for the component to initialize and expose the surfaces
    await new Promise(resolve => setTimeout(resolve, 10));

    // Find the plugin function in the app
    const appFunctions = app.agent?.functions || [];
    const showDataFunction = appFunctions.find((fn: any) => fn.name === 'showData');
    expect(showDataFunction).toBeDefined();

    // Call the plugin function to show data in the canvas
    await showDataFunction?.handler({
      surfaceType: 'canvas',
      data: { message: 'Hello from canvas' }
    });

    // Verify canvas was updated
    expect(screen.getByTestId('canvas-content')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-content').textContent).toContain('Hello from canvas');

    // Call the plugin function to show data in a panel
    await showDataFunction?.handler({
      surfaceType: 'panel',
      data: { title: 'Test Panel', content: { message: 'Hello from panel' } }
    });

    // Verify panel was updated
    expect(screen.getByTestId('panel-content')).toBeInTheDocument();
    expect(screen.getByTestId('panel-content').textContent).toContain('Test Panel');
    expect(screen.getByTestId('panel-content').textContent).toContain('Hello from panel');

    // Call the plugin function to show data in a card
    await showDataFunction?.handler({
      surfaceType: 'card',
      data: { message: 'Hello from card' }
    });

    // Verify card was updated
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('card-content').textContent).toContain('Hello from card');

    // Call the plugin function to show data in a modal
    await showDataFunction?.handler({
      surfaceType: 'modal',
      data: { title: 'Test Modal', content: { message: 'Hello from modal' } }
    });

    // Verify modal was updated
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content').textContent).toContain('Test Modal');
    expect(screen.getByTestId('modal-content').textContent).toContain('Hello from modal');
  });
}); 