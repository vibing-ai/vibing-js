/**
 * Integration tests for surface coordination
 */
import { renderWithApp, createTestApp, createMockEventSystem, wait } from './utils/test-utils';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

// Mock the surface modules
jest.mock('../../src/surfaces/modals', () => {
  const showModalMock = jest.fn();
  const hideModalMock = jest.fn();
  const updateModalMock = jest.fn();
  
  return {
    useModal: () => ({
      showModal: showModalMock,
      hideModal: hideModalMock,
      updateModal: updateModalMock
    }),
    modals: {
      show: showModalMock,
      hide: hideModalMock,
      update: updateModalMock
    }
  };
});

jest.mock('../../src/surfaces/panels', () => {
  const createContextPanelMock = jest.fn(config => ({
    ...config,
    id: 'test-panel'
  }));
  
  return {
    createContextPanel: createContextPanelMock,
    panels: {
      create: createContextPanelMock
    }
  };
});

jest.mock('../../src/surfaces/cards', () => {
  const createConversationCardMock = jest.fn(config => ({
    ...config,
    id: 'test-card'
  }));
  
  return {
    createConversationCard: createConversationCardMock,
    cards: {
      create: createConversationCardMock
    }
  };
});

// Mock the events system
jest.mock('../../src/common/events', () => {
  const mockEventSystem = createMockEventSystem();
  return {
    useEvents: () => mockEventSystem,
    events: mockEventSystem
  };
});

describe('Surface Coordination', () => {
  // Import mocked modules
  const { modals } = require('../../src/surfaces/modals');
  const { panels } = require('../../src/surfaces/panels');
  const { cards } = require('../../src/surfaces/cards');
  const { events } = require('../../src/common/events');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('Modal can update panel content', async () => {
    // Create a test component that uses modals and panels
    const TestComponent = () => {
      const { showModal } = require('../../src/surfaces/modals').useModal();
      
      const openModalWithPanel = () => {
        showModal({
          title: 'Settings',
          content: (
            <button 
              onClick={() => {
                const panel = panels.create({
                  title: 'Settings Panel',
                  content: 'Panel content from modal'
                });
                events.emit('surface:panel:open', panel);
              }}
            >
              Open Panel
            </button>
          )
        });
      };
      
      return <button onClick={openModalWithPanel}>Open Modal</button>;
    };
    
    // Render with app context
    const { getByText } = renderWithApp(<TestComponent />);
    
    // Open modal
    fireEvent.click(getByText('Open Modal'));
    expect(modals.show).toHaveBeenCalled();
    
    // Simulate user clicking button in modal 
    // Get the onClick handler from the mocked showModal call
    const modalConfig = modals.show.mock.calls[0][0];
    const mockClickEvent = {};
    
    // Extract the button's onClick and call it
    React.Children.forEach(modalConfig.content, child => {
      if (React.isValidElement(child) && child.type === 'button') {
        if (child.props.onClick) {
          child.props.onClick(mockClickEvent);
        }
      }
    });
    
    // Panel should be created
    expect(panels.create).toHaveBeenCalledWith({
      title: 'Settings Panel',
      content: 'Panel content from modal'
    });
    
    // Event should be emitted to open panel
    expect(events.emit).toHaveBeenCalledWith('surface:panel:open', expect.objectContaining({
      id: 'test-panel'
    }));
  });
  
  test('Card can control modal visibility', async () => {
    // Create a test component that uses cards and modals
    const TestComponent = () => {
      const { showModal, hideModal } = require('../../src/surfaces/modals').useModal();
      
      const handleCardAction = () => {
        showModal({
          title: 'Card Modal',
          content: 'Modal opened from card'
        });
      };
      
      const createCard = () => {
        const card = cards.create({
          content: 'Test Card',
          actions: <button onClick={handleCardAction}>Show Details</button>
        });
        events.emit('surface:card:add', card);
      };
      
      return <button onClick={createCard}>Create Card</button>;
    };
    
    // Render with app context
    const { getByText } = renderWithApp(<TestComponent />);
    
    // Create card
    fireEvent.click(getByText('Create Card'));
    expect(cards.create).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith('surface:card:add', expect.objectContaining({
      id: 'test-card'
    }));
    
    // Simulate user clicking action button on card
    const cardConfig = cards.create.mock.calls[0][0];
    const mockClickEvent = {};
    
    // Extract the button's onClick and call it
    React.Children.forEach(cardConfig.actions, child => {
      if (React.isValidElement(child) && child.type === 'button') {
        if (child.props.onClick) {
          child.props.onClick(mockClickEvent);
        }
      }
    });
    
    // Modal should be shown
    expect(modals.show).toHaveBeenCalledWith({
      title: 'Card Modal',
      content: 'Modal opened from card'
    });
  });
  
  test('Panels can update cards in response to user interaction', async () => {
    // Create a test app that coordinates surfaces
    const app = createTestApp();
    
    // Set up event handling for surface coordination
    events.on('surface:panel:action', (data) => {
      if (data.action === 'update-card') {
        // Update a card based on panel action
        const updatedCard = cards.create({
          content: `Card updated by panel: ${data.value}`
        });
        events.emit('surface:card:update', { id: 'target-card', card: updatedCard });
      }
    });
    
    // Simulate panel emitting an action event
    events.emit('surface:panel:action', { 
      action: 'update-card', 
      value: 'New content',
      panelId: 'settings-panel'
    });
    
    // Card should be updated
    expect(cards.create).toHaveBeenCalledWith({
      content: 'Card updated by panel: New content'
    });
    
    // Update event should be emitted
    expect(events.emit).toHaveBeenCalledWith('surface:card:update', {
      id: 'target-card',
      card: expect.objectContaining({ id: 'test-card' })
    });
  });
  
  test('Surface coordination with multiple event handlers', async () => {
    // Create handlers
    const modalHandler = jest.fn();
    const panelHandler = jest.fn();
    const cardHandler = jest.fn();
    
    // Register multiple handlers
    events.on('surface:modal:close', modalHandler);
    events.on('surface:panel:open', panelHandler);
    events.on('surface:card:select', cardHandler);
    
    // Emit events
    events.emit('surface:modal:close', { id: 'settings-modal' });
    events.emit('surface:panel:open', { id: 'details-panel' });
    events.emit('surface:card:select', { id: 'info-card' });
    
    // All handlers should be called with correct data
    expect(modalHandler).toHaveBeenCalledWith({ id: 'settings-modal' });
    expect(panelHandler).toHaveBeenCalledWith({ id: 'details-panel' });
    expect(cardHandler).toHaveBeenCalledWith({ id: 'info-card' });
    
    // Unregister one handler
    events.off('surface:modal:close', modalHandler);
    
    // Emit event again
    events.emit('surface:modal:close', { id: 'settings-modal' });
    
    // Handler should not be called second time
    expect(modalHandler).toHaveBeenCalledTimes(1);
  });
}); 