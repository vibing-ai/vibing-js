import React from 'react';

export interface CardConfig {
  content: React.ReactNode;
  actions?: React.ReactNode;
  metadata?: Record<string, any>;
}

export const createConversationCard = jest.fn((contentOrConfig) => {
  return {
    id: 'mock-card-id',
    config: typeof contentOrConfig === 'object' && !React.isValidElement(contentOrConfig)
      ? contentOrConfig
      : { content: contentOrConfig },
    update: jest.fn(),
    remove: jest.fn(),
  };
});

export const createCards = jest.fn(() => {
  return {
    render: jest.fn(),
    cards: [],
    addCard: jest.fn(),
    removeCard: jest.fn(),
    updateCard: jest.fn(),
  };
}); 