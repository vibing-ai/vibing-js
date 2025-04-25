import React from 'react';
import { useState, useCallback } from 'react';
import { CanvasHookResult } from '../../utils/test-types';

export interface CanvasConfig {
  width?: number;
  height?: number;
  background?: string;
  metadata?: Record<string, any>;
}

export const createCanvas = jest.fn((config) => {
  return {
    id: 'mock-canvas-id',
    config: config || {},
    draw: jest.fn(),
    clear: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
});

export const createCanvasSurface = jest.fn(() => {
  return {
    render: jest.fn(),
    canvases: [],
    addCanvas: jest.fn(),
    removeCanvas: jest.fn(),
    updateCanvas: jest.fn(),
  };
});

export const useCanvas = (): CanvasHookResult => {
  const [isActive, setIsActive] = useState(false);
  const [activeContent, setActiveContent] = useState<React.ReactNode | null>(null);
  const [config, setConfig] = useState<CanvasConfig>({ content: null });
  
  const showCanvas = useCallback((newConfig: CanvasConfig) => {
    // If there's already an active canvas, call its onClose
    if (isActive && config.onClose) {
      config.onClose();
    }
    
    setIsActive(true);
    setActiveContent(newConfig.content);
    setConfig(newConfig);
    
    console.log('[Canvas]', 'Opened:', newConfig);
  }, [isActive, config]);
  
  const updateCanvas = useCallback((newConfig: Partial<CanvasConfig>) => {
    if (!isActive) return;
    
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      console.log('[Canvas]', 'Updated:', newConfig);
      
      if (newConfig.content) {
        setActiveContent(newConfig.content);
      }
      
      return updated;
    });
  }, [isActive]);
  
  const hideCanvas = useCallback(() => {
    if (!isActive) return;
    
    if (config.onClose) {
      config.onClose();
    }
    
    setIsActive(false);
    setActiveContent(null);
    
    console.log('[Canvas]', 'Closed');
  }, [isActive, config]);
  
  return {
    isActive,
    activeContent,
    config,
    showCanvas,
    hideCanvas,
    updateCanvas
  };
}; 