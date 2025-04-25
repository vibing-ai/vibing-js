import React from 'react';
import { createContextPanel, PanelConfig } from '../../src/surfaces/panels';

// Mock console.log to prevent test output noise
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Context Panels Surface', () => {
  describe('createContextPanel function', () => {
    it('should create a panel with simple content', () => {
      const content = <div>Simple content</div>;
      const panel = createContextPanel(content);
      
      expect(panel).toBeDefined();
      expect(panel.id).toMatch(/^panel-/);
      expect(panel.config.content).toBe(content);
      expect(panel.update).toBeInstanceOf(Function);
      expect(panel.remove).toBeInstanceOf(Function);
      expect(panel.show).toBeInstanceOf(Function);
      expect(panel.hide).toBeInstanceOf(Function);
    });
    
    it('should create a panel with full configuration', () => {
      const config: PanelConfig = {
        title: 'Test Panel',
        content: <div>Panel content</div>,
        actions: <button>Action</button>,
        footer: <div>Footer</div>,
        width: 400,
        metadata: { test: 'data' }
      };
      
      const panel = createContextPanel(config);
      
      expect(panel).toBeDefined();
      expect(panel.id).toMatch(/^panel-/);
      expect(panel.config).toEqual(config);
    });
    
    it('should normalize content-only input to proper config', () => {
      const content = <div>Content only</div>;
      const panel = createContextPanel(content);
      
      expect(panel.config.content).toBe(content);
      expect(panel.config.width).toBe(300); // Default width
    });
    
    it('should apply default width if not provided', () => {
      const panel = createContextPanel({
        content: <div>Test content</div>
      });
      
      expect(panel.config.width).toBe(300);
    });
    
    it('should respect custom width when provided', () => {
      const panel = createContextPanel({
        content: <div>Test content</div>,
        width: 500
      });
      
      expect(panel.config.width).toBe(500);
    });
    
    it('should log panel creation in Stage 1', () => {
      createContextPanel(<div>Test content</div>);
      
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Context Panel panel-/);
      expect((console.log as jest.Mock).mock.calls[0][1]).toBe('Created:');
    });
    
    it('should log update operations in Stage 1', () => {
      const panel = createContextPanel(<div>Initial content</div>);
      (console.log as jest.Mock).mockClear();
      
      const newConfig = { content: <div>Updated content</div> };
      panel.update(newConfig);
      
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Context Panel panel-/);
      expect((console.log as jest.Mock).mock.calls[0][1]).toBe('Updated:');
      expect((console.log as jest.Mock).mock.calls[0][2]).toEqual(newConfig);
    });
    
    it('should log remove operations in Stage 1', () => {
      const panel = createContextPanel(<div>To be removed</div>);
      (console.log as jest.Mock).mockClear();
      
      panel.remove();
      
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Context Panel panel-/);
      expect((console.log as jest.Mock).mock.calls[0][1]).toBe('Removed');
    });
    
    it('should log show operations in Stage 1', () => {
      const panel = createContextPanel(<div>Test panel</div>);
      (console.log as jest.Mock).mockClear();
      
      panel.show();
      
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Context Panel panel-/);
      expect((console.log as jest.Mock).mock.calls[0][1]).toBe('Shown');
    });
    
    it('should log hide operations in Stage 1', () => {
      const panel = createContextPanel(<div>Test panel</div>);
      (console.log as jest.Mock).mockClear();
      
      panel.hide();
      
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Context Panel panel-/);
      expect((console.log as jest.Mock).mock.calls[0][1]).toBe('Hidden');
    });
  });
}); 