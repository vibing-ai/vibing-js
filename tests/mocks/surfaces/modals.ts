import React from 'react';
import { useState, useCallback } from 'react';
import { ModalInstance } from '../../utils/test-types';

export interface ModalConfig {
  title?: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: (result?: any) => void;
  closeOnOverlayClick?: boolean;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  width?: number;
  height?: number;
  closeOnOutsideClick?: boolean;
  metadata?: Record<string, any>;
}

export const useModal = () => {
  const [_modals, setModals] = useState<Record<string, { config: ModalConfig, promise: any }>>({});

  const showModal = useCallback((config: ModalConfig): ModalInstance => {
    const modalId = `modal-${Date.now()}`;
    
    // Create deferred promise for modal result
    let resolvePromise: (value: any) => void;
    const resultPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    const instance: ModalInstance = {
      id: modalId,
      hide: (result?: any) => hideModal(modalId, result),
      update: (newConfig: Partial<ModalConfig>) => updateModal(modalId, newConfig),
      result: resultPromise
    };
    
    setModals(prev => ({
      ...prev,
      [modalId]: { 
        config, 
        promise: resolvePromise 
      }
    }));
    
    console.log(`[Modal ${modalId}]`, 'Created:', config);
    
    return instance;
  }, []);
  
  const updateModal = useCallback((modalId: string, newConfig: Partial<ModalConfig>) => {
    setModals(prev => {
      if (!prev[modalId]) return prev;
      
      const updatedConfig = { ...prev[modalId].config, ...newConfig };
      console.log(`[Modal ${modalId}]`, 'Updated:', newConfig);
      
      return {
        ...prev,
        [modalId]: { ...prev[modalId], config: updatedConfig }
      };
    });
  }, []);
  
  const hideModal = useCallback((modalId: string, result?: any) => {
    setModals(prev => {
      if (!prev[modalId]) return prev;
      
      // Call onClose callback if provided
      if (prev[modalId].config.onClose) {
        prev[modalId].config.onClose(result);
      }
      
      // Resolve the modal's promise with the result
      if (prev[modalId].promise) {
        prev[modalId].promise(result);
      }
      
      console.log(`[Modal ${modalId}]`, 'Closed with result:', result);
      
      // Remove this modal from state
      const newState = { ...prev };
      delete newState[modalId];
      return newState;
    });
  }, []);
  
  return {
    _modals,
    showModal,
    updateModal,
    hideModal
  };
};

export const createModal = jest.fn((contentOrConfig) => {
  return {
    id: 'mock-modal-id',
    config: typeof contentOrConfig === 'object' && !React.isValidElement(contentOrConfig)
      ? contentOrConfig
      : { content: contentOrConfig },
    show: jest.fn(),
    hide: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
});

export const createModals = jest.fn(() => {
  return {
    render: jest.fn(),
    modals: [],
    showModal: jest.fn(),
    hideModal: jest.fn(),
    updateModal: jest.fn(),
  };
}); 