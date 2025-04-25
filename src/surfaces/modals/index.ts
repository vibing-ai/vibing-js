import { ReactNode, useState } from 'react';
import { adaptModalToBlockKit, isBlockKitAvailable } from './block-kit-adapter';

/**
 * Configuration for a modal dialog
 */
export interface ModalConfig {
  /**
   * Modal title
   */
  title?: string;
  
  /**
   * Main content of the modal
   */
  content: ReactNode;
  
  /**
   * Action buttons or links to display in the modal footer
   */
  actions?: ReactNode;
  
  /**
   * Size of the modal
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Whether to close the modal when clicking outside
   */
  closeOnOverlayClick?: boolean;
  
  /**
   * Callback when the modal is closed
   */
  onClose?: () => void;
}

/**
 * Modal instance object
 */
export interface ModalInstance<T = any> {
  /**
   * Unique ID for the modal
   */
  id: string;
  
  /**
   * Function to hide the modal
   */
  hide: (result?: T) => void;
  
  /**
   * Function to update the modal content
   */
  update: (newConfig: Partial<ModalConfig>) => void;
  
  /**
   * Promise that resolves when the modal is closed with the result
   */
  result: Promise<T | undefined>;
}

/**
 * Hook for creating and managing modal dialogs
 * 
 * @returns Modal management functions
 * 
 * @example
 * ```tsx
 * const { showModal, hideModal, updateModal } = useModal();
 * 
 * // Show a simple modal
 * const modal = showModal({
 *   title: 'Confirmation',
 *   content: <p>Are you sure you want to delete this item?</p>,
 *   actions: (
 *     <>
 *       <button onClick={() => modal.hide(false)}>Cancel</button>
 *       <button onClick={() => modal.hide(true)}>Delete</button>
 *     </>
 *   )
 * });
 * 
 * // Wait for the result
 * modal.result.then(confirmed => {
 *   if (confirmed) {
 *     // User confirmed, perform delete
 *   }
 * });
 * 
 * // Update the modal later
 * updateModal(modal.id, {
 *   content: <p>Deleting will remove all associated data.</p>
 * });
 * ```
 */
export function useModal() {
  const [modals, setModals] = useState<Record<string, any>>({});
  
  // Check if Block Kit is available
  const useBlockKit = isBlockKitAvailable();
  
  /**
   * Shows a modal dialog
   * 
   * @param config Modal configuration
   * @returns Modal instance with management functions
   */
  function showModal<T = any>(config: ModalConfig): ModalInstance<T> {
    // Generate a unique ID for the modal
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a promise that will resolve when the modal is closed
    let resolvePromise: (value: T | undefined) => void;
    const resultPromise = new Promise<T | undefined>(resolve => {
      resolvePromise = resolve;
    });
    
    // Function to hide the modal and resolve the promise
    const hide = (result?: T) => {
      console.log(`[Modal ${id}] Closed with result:`, result);
      
      // Call onClose callback if provided
      if (config.onClose) {
        config.onClose();
      }
      
      // Remove modal from state
      setModals(prev => {
        const newModals = { ...prev };
        delete newModals[id];
        return newModals;
      });
      
      // Resolve the promise with the result
      resolvePromise(result);
    };
    
    // Function to update the modal content
    const update = (newConfig: Partial<ModalConfig>) => {
      const updatedConfig = { ...config, ...newConfig };
      
      if (useBlockKit) {
        const blockKitModal = adaptModalToBlockKit(updatedConfig);
        console.log(`[Modal ${id}] Updated with Block Kit:`, blockKitModal);
      } else {
        console.log(`[Modal ${id}] Updated:`, newConfig);
      }
      
      setModals(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          config: updatedConfig
        }
      }));
    };
    
    // Create the modal instance
    const modalInstance: ModalInstance<T> = {
      id,
      hide,
      update,
      result: resultPromise
    };
    
    // Add modal to state
    setModals(prev => ({
      ...prev,
      [id]: {
        config,
        instance: modalInstance
      }
    }));
    
    // Render with Block Kit if available
    if (useBlockKit) {
      const blockKitModal = adaptModalToBlockKit(config);
      console.log(`[Modal ${id}] Created with Block Kit:`, blockKitModal);
    } else {
      console.log(`[Modal ${id}] Created (Block Kit not available):`, config);
    }
    
    return modalInstance;
  }
  
  /**
   * Hides a modal dialog by ID
   * 
   * @param id Modal ID
   * @param result Optional result to resolve the modal promise with
   */
  function hideModal<T = any>(id: string, result?: T) {
    const modal = modals[id];
    if (modal) {
      modal.instance.hide(result);
    }
  }
  
  /**
   * Updates a modal dialog by ID
   * 
   * @param id Modal ID
   * @param newConfig New configuration
   */
  function updateModal(id: string, newConfig: Partial<ModalConfig>) {
    const modal = modals[id];
    if (modal) {
      modal.instance.update(newConfig);
    }
  }
  
  return {
    showModal,
    hideModal,
    updateModal,
    // For debugging in Stage 1
    _modals: modals
  };
}

// Future enhancements for Stage 2:
// - Full integration with @vibing-ai/block-kit
// - Support for stacked modals
// - Animations and transitions
// - Keyboard navigation and focus management
// - Accessibility improvements 