import React from 'react';
import { createContextPanel, PanelConfig } from '../../src/surfaces/panels';
import { logger } from '../../src/core/utils/logger';

// Ensure logger methods are mocked
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Context Panels Surface', () => {
  describe('createContextPanel function', () => {
    it('should create a panel with simple content', () => {
      const content = <div>Simple content</div>;
      const panel = createContextPanel(content);
      
      expect(panel).toBeDefined();
      expect(panel.id).toMatch(/[a-z0-9]{7}/);
      expect(panel.config.content).toBe(content);
      expect(panel.update).toBeInstanceOf(Function);
      expect(panel.remove).toBeInstanceOf(Function);
    });
    
    it('should create a panel with full configuration', () => {
      const config: PanelConfig = {
        content: <div>Panel content</div>,
        actions: <button>Action</button>,
        footer: <div>Footer</div>,
        width: 400,
        metadata: { test: 'data' }
      };
      
      const panel = createContextPanel(config);
      
      expect(panel).toBeDefined();
      expect(panel.id).toMatch(/[a-z0-9]{7}/);
      expect(panel.config).toEqual(config);
    });
    
    it('should normalize content-only input to proper config', () => {
      const content = <div>Content only</div>;
      const panel = createContextPanel(content);
      
      expect(panel.config.content).toBe(content);
    });
    
    it('should log panel creation in Stage 1', () => {
      createContextPanel(<div>Test content</div>);
      
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Context Panel/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toBe('Created:');
    });
    
    it('should log update operations in Stage 1', () => {
      const panel = createContextPanel(<div>Initial content</div>);
      jest.clearAllMocks();
      
      const newConfig = { content: <div>Updated content</div> };
      panel.update(newConfig);
      
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Context Panel/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toBe('Updated:');
      expect((logger.log as jest.Mock).mock.calls[0][2]).toEqual(newConfig);
    });
    
    it('should log remove operations in Stage 1', () => {
      const panel = createContextPanel(<div>To be removed</div>);
      jest.clearAllMocks();
      
      panel.remove();
      
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Context Panel/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toBe('Removed');
    });
  });
}); 