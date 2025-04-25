/**
 * Modal surface creation utilities
 */

import React, { useState, useCallback } from 'react';
import { logger } from '../../core/utils/logger';

export interface ModalConfig {
  content: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  width?: number;
  height?: number;
  closeOnOutsideClick?: boolean;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlayClick?: boolean;
  onClose?: () => void;
  metadata?: Record<string, unknown>;
}

export interface ModalInstance {
  id: string;
  config: ModalConfig;
  hide: (result?: unknown) => void;
  update: (newConfig: Partial<ModalConfig>) => void;
  result: Promise<unknown>;
}

export const createModal = (contentOrConfig: React.ReactNode | ModalConfig) => {
  const isConfig =
    typeof contentOrConfig !== 'string' &&
    contentOrConfig !== null &&
    typeof contentOrConfig === 'object' &&
    !React.isValidElement(contentOrConfig);

  const config = isConfig
    ? (contentOrConfig as ModalConfig)
    : { content: contentOrConfig as React.ReactNode };

  const modalId = Math.random().toString(36).substring(2, 9);
  logger.log(`[Modal ${modalId}]`, 'Created with config:', config);

  // These methods will be replaced when the modal is actually rendered
  let resolvePromise: (value: unknown) => void = () => {};
  const resultPromise = new Promise<unknown>(resolve => {
    resolvePromise = resolve;
  });

  return {
    id: modalId,
    config,
    /**
     * Show the modal in the UI
     */
    show: () => {
      logger.log(`[Modal ${modalId}]`, 'Showing modal');
      // In an actual implementation, this would trigger UI rendering
    },
    /**
     * Hide the modal and resolve its promise with the provided result
     * @param result Optional result to pass to the modal promise
     */
    hide: (result?: unknown) => {
      logger.log(`[Modal ${modalId}]`, 'Hiding modal with result:', result);
      if (config.onClose) {
        config.onClose();
      }
      resolvePromise(result);
    },
    /**
     * Update the modal configuration
     * @param newConfig New properties to update in the modal config
     */
    update: (newConfig: Partial<ModalConfig>) => {
      logger.log(`[Modal ${modalId}]`, 'Updating modal with:', newConfig);
      Object.assign(config, newConfig);
    },
    /**
     * Remove the modal from the DOM and any modal collections
     */
    remove: () => {
      logger.log(`[Modal ${modalId}]`, 'Removing modal');
      // In an actual implementation, this would remove the modal from the DOM
      // and from any collections tracking it
    },
    result: resultPromise,
  };
};

/**
 * React hook for managing modals
 */
export const useModal = () => {
  const [_modals, setModals] = useState<Record<string, ModalInstance>>({});

  const showModal = useCallback((config: ModalConfig) => {
    const modalId = Math.random().toString(36).substring(2, 9);

    let modalResolve: (value: unknown) => void = () => { /* default empty resolver */ };
    const modalPromise = new Promise<unknown>(resolve => {
      modalResolve = resolve;
    });

    logger.log(`[Modal ${modalId}]`, 'Created:', config);

    const modalInstance = {
      id: modalId,
      hide: (result?: unknown) => {
        if (config.onClose) {
          config.onClose();
        }

        logger.log(`[Modal ${modalId}]`, 'Closed with result:', result);

        setModals(prev => {
          const newModals = { ...prev };
          delete newModals[modalId];
          return newModals;
        });

        modalResolve(result);
      },
      update: (newConfig: Partial<ModalConfig>) => {
        setModals(prev => {
          if (!prev[modalId]) return prev;

          return {
            ...prev,
            [modalId]: {
              ...prev[modalId],
              config: { ...prev[modalId].config, ...newConfig },
            },
          };
        });
      },
      result: modalPromise,
    };

    setModals(prev => ({
      ...prev,
      [modalId]: {
        id: modalId,
        config,
        hide: modalInstance.hide,
        update: modalInstance.update,
        result: modalPromise,
      },
    }));

    return modalInstance;
  }, []);

  const hideModal = useCallback((modalId: string, result?: unknown) => {
    setModals(prev => {
      if (!prev[modalId]) return prev;

      if (prev[modalId].config.onClose) {
        prev[modalId].config.onClose();
      }

      logger.log(`[Modal ${modalId}]`, 'Closed with result:', result);

      // Resolve the promise with the result
      const modalInstance = prev[modalId] as ModalInstance & { resolve?: (value: unknown) => void };
      if (modalInstance.resolve) {
        modalInstance.resolve(result);
      }

      const newModals = { ...prev };
      delete newModals[modalId];
      return newModals;
    });
  }, []);

  const updateModal = useCallback((modalId: string, config: Partial<ModalConfig>) => {
    setModals(prev => {
      if (!prev[modalId]) return prev;

      logger.log(`[Modal ${modalId}]`, 'Updated:', config);

      return {
        ...prev,
        [modalId]: {
          ...prev[modalId],
          config: { ...prev[modalId].config, ...config },
        },
      };
    });
  }, []);

  return {
    _modals,
    showModal,
    hideModal,
    updateModal,
  };
};

/**
 * Modal dialogs UI Component for Vibing AI
 */

// Factory function to create a Modals UI instance
export function createModals(_options: Record<string, unknown> = {}): {
  render: (container: HTMLElement) => void;
  modals: Array<ReturnType<typeof createModal>>;
  showModal: (contentOrConfig: React.ReactNode | ModalConfig) => ReturnType<typeof createModal>;
  hideModal: (modalId: string, result?: unknown) => boolean;
  updateModal: (modalId: string, config: Partial<ModalConfig>) => boolean;
} {
  // Configuration and state
  const modals: Array<ReturnType<typeof createModal>> = [];

  // Render function that places the Modals UI in a container
  function render(_container: HTMLElement) {
    // Implementation placeholder - will be added in future releases
    logger.log('[Modals]', 'Rendering modals component');
  }

  // Public API
  return {
    render,
    modals,
    /**
     * Show a modal with the given configuration
     * @param contentOrConfig Modal content or configuration
     * @returns The created modal instance
     */
    showModal: (contentOrConfig: React.ReactNode | ModalConfig) => {
      const modal = createModal(contentOrConfig);
      modals.push(modal);
      modal.show();
      logger.log('[Modals]', 'Showing modal:', modal.id);
      return modal;
    },

    /**
     * Hide a specific modal by ID
     * @param modalId ID of the modal to hide
     * @param result Optional result to return from the modal's promise
     * @returns Boolean indicating success of the operation
     */
    hideModal: (modalId: string, result?: unknown) => {
      const modalIndex = modals.findIndex(modal => modal.id === modalId);
      if (modalIndex === -1) {
        logger.warn('[Modals]', `Modal with ID ${modalId} not found`);
        return false;
      }

      modals[modalIndex].hide(result);
      modals.splice(modalIndex, 1);
      logger.log('[Modals]', `Hidden modal: ${modalId}`);
      return true;
    },

    /**
     * Update an existing modal's configuration
     * @param modalId ID of the modal to update
     * @param newConfig New configuration to apply
     * @returns Boolean indicating success of the operation
     */
    updateModal: (modalId: string, newConfig: Partial<ModalConfig>) => {
      const modal = modals.find(modal => modal.id === modalId);
      if (!modal) {
        logger.warn('[Modals]', `Modal with ID ${modalId} not found`);
        return false;
      }

      modal.update(newConfig);
      logger.log('[Modals]', `Updated modal: ${modalId}`);
      return true;
    },
  };
}

// Export createModalSurface as an alias for createModals to match import in index.ts
export const createModalSurface = createModals;
