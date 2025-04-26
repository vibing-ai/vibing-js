import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useModal, ModalConfig } from '../../src/surfaces/modals';
import { logger } from '../../src/core/utils/logger';

// Ensure logger methods are mocked
beforeEach(() => {
  jest.clearAllMocks();
});

// Helper function for tests
const createMockFn = () => jest.fn();

interface ModalInstance {
  id: string;
  hide: (result?: any) => void;
  update: (config: Partial<ModalConfig>) => void;
  result: Promise<any>;
}

describe('Modal Dialogs Surface', () => {
  describe('useModal hook', () => {
    it('should initialize with no modals', () => {
      const { result } = renderHook(() => useModal());
      
      expect(result.current._modals).toEqual({});
    });
    
    it('should show a modal with correct configuration', () => {
      const { result } = renderHook(() => useModal());
      
      const config: ModalConfig = {
        title: 'Test Modal',
        content: <div>Modal content</div>,
        actions: <button>Close</button>,
        size: 'medium',
        closeOnOverlayClick: true,
        onClose: createMockFn()
      };
      
      let modalInstance: ModalInstance | undefined;
      act(() => {
        modalInstance = result.current.showModal(config);
      });
      
      expect(modalInstance).toBeDefined();
      if (modalInstance) {
        expect(modalInstance.id).toMatch(/[a-z0-9]{7}/);
        expect(modalInstance.hide).toBeInstanceOf(Function);
        expect(modalInstance.update).toBeInstanceOf(Function);
        expect(modalInstance.result).toBeInstanceOf(Promise);
        
        // Check that the modal is in the internal state
        const modalId = modalInstance.id;
        expect(result.current._modals[modalId]).toBeDefined();
        expect(result.current._modals[modalId].config).toEqual(config);
      }
    });
    
    it('should log modal creation in Stage 1', () => {
      const { result } = renderHook(() => useModal());
      jest.clearAllMocks();
      
      const config = { content: <div>Test modal</div> };
      
      act(() => {
        result.current.showModal(config);
      });
      
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Modal/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toBe('Created:');
      expect((logger.log as jest.Mock).mock.calls[0][2]).toEqual(config);
    });
    
    it('should update a modal correctly', () => {
      const { result } = renderHook(() => useModal());
      
      let modalInstance: ModalInstance | undefined;
      act(() => {
        modalInstance = result.current.showModal({ content: <div>Initial content</div> });
      });
      
      if (!modalInstance) {
        fail('Modal instance should be defined');
        return;
      }
      
      const modalId = modalInstance.id;
      jest.clearAllMocks();
      
      const newConfig = { content: <div>Updated content</div> };
      act(() => {
        result.current.updateModal(modalId, newConfig);
      });
      
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Modal/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toBe('Updated:');
      expect((logger.log as jest.Mock).mock.calls[0][2]).toEqual(newConfig);
      
      // Check that the modal config was updated
      expect(result.current._modals[modalId].config.content).toEqual(newConfig.content);
    });
    
    it('should hide a modal correctly', () => {
      const { result } = renderHook(() => useModal());
      const onCloseMock = createMockFn();
      
      let modalInstance: ModalInstance | undefined;
      act(() => {
        modalInstance = result.current.showModal({ 
          content: <div>Modal content</div>,
          onClose: onCloseMock
        });
      });
      
      if (!modalInstance) {
        fail('Modal instance should be defined');
        return;
      }
      
      const modalId = modalInstance.id;
      expect(result.current._modals[modalId]).toBeDefined();
      
      jest.clearAllMocks();
      
      act(() => {
        result.current.hideModal(modalId, 'test-result');
      });
      
      // The modal should be removed from state
      expect(result.current._modals[modalId]).toBeUndefined();
      
      // onClose should have been called
      expect(onCloseMock).toHaveBeenCalled();
      
      // Log should have been called
      expect(logger.log).toHaveBeenCalled();
      expect((logger.log as jest.Mock).mock.calls[0][0]).toMatch(/^\[Modal/);
      expect((logger.log as jest.Mock).mock.calls[0][1]).toBe('Closed with result:');
      expect((logger.log as jest.Mock).mock.calls[0][2]).toBe('test-result');
    });
    
    it('should resolve the modal promise with the result', async () => {
      const { result } = renderHook(() => useModal());
      
      let modalInstance: ModalInstance | undefined;
      act(() => {
        modalInstance = result.current.showModal({ content: <div>Modal content</div> });
      });
      
      if (!modalInstance) {
        fail('Modal instance should be defined');
        return;
      }
      
      // Create a promise that will resolve with the modal result
      const resultPromise = modalInstance.result;
      
      // Hide the modal with a result
      act(() => {
        modalInstance!.hide('test-result');
      });
      
      // Wait for the promise to resolve
      const modalResult = await resultPromise;
      expect(modalResult).toBe('test-result');
    });
    
    it('should not throw errors when updating non-existent modals', () => {
      const { result } = renderHook(() => useModal());
      
      // This should not throw
      act(() => {
        result.current.updateModal('non-existent-id', { content: <div>New content</div> });
      });
      
      // This should not throw
      act(() => {
        result.current.hideModal('non-existent-id');
      });
    });
  });
}); 