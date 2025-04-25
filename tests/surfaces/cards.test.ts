import React from 'react';
import { createConversationCard, CardConfig } from '../../src/surfaces/cards';

// Mock console.log to prevent test output noise
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Conversation Cards Surface', () => {
  describe('createConversationCard function', () => {
    it('should create a card with simple content', () => {
      const content = <div>Simple content</div>;
      const card = createConversationCard(content);
      
      expect(card).toBeDefined();
      expect(card.id).toMatch(/^card-/);
      expect(card.config.content).toBe(content);
      expect(card.update).toBeInstanceOf(Function);
      expect(card.remove).toBeInstanceOf(Function);
    });
    
    it('should create a card with full configuration', () => {
      const config: CardConfig = {
        content: <div>Card content</div>,
        actions: <button>Action</button>,
        metadata: { test: 'data' },
        style: { color: 'red' }
      };
      
      const card = createConversationCard(config);
      
      expect(card).toBeDefined();
      expect(card.id).toMatch(/^card-/);
      expect(card.config).toEqual(config);
    });
    
    it('should normalize content-only input to proper config', () => {
      const content = <div>Content only</div>;
      const card = createConversationCard(content);
      
      expect(card.config).toEqual({ content });
    });
    
    it('should log card creation in Stage 1', () => {
      createConversationCard(<div>Test content</div>);
      
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Conversation Card card-/);
      expect((console.log as jest.Mock).mock.calls[0][1]).toBe('Created:');
    });
    
    it('should log update operations in Stage 1', () => {
      const card = createConversationCard(<div>Initial content</div>);
      (console.log as jest.Mock).mockClear();
      
      const newConfig = { content: <div>Updated content</div> };
      card.update(newConfig);
      
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Conversation Card card-/);
      expect((console.log as jest.Mock).mock.calls[0][1]).toBe('Updated:');
      expect((console.log as jest.Mock).mock.calls[0][2]).toEqual(newConfig);
    });
    
    it('should log remove operations in Stage 1', () => {
      const card = createConversationCard(<div>To be removed</div>);
      (console.log as jest.Mock).mockClear();
      
      card.remove();
      
      expect(console.log).toHaveBeenCalled();
      expect((console.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Conversation Card card-/);
      expect((console.log as jest.Mock).mock.calls[0][1]).toBe('Removed');
    });
  });
}); 