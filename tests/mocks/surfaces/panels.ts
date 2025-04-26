import React from 'react';

export interface PanelConfig {
  content: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  metadata?: Record<string, any>;
}

export const createContextPanel = jest.fn((contentOrConfig) => {
  return {
    id: 'mock-panel-id',
    config: typeof contentOrConfig === 'object' && !React.isValidElement(contentOrConfig)
      ? contentOrConfig
      : { content: contentOrConfig },
    update: jest.fn(),
    remove: jest.fn(),
  };
});

export const createPanels = jest.fn(() => {
  return {
    render: jest.fn(),
    panels: [],
    showPanel: jest.fn(),
    hidePanel: jest.fn(),
    updatePanel: jest.fn(),
  };
}); 