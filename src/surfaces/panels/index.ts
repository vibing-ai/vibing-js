/**
 * Panel surface creation utilities
 */

import React from 'react';
import { logger } from '../../core/utils/logger';

export interface PanelConfig {
  content: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  metadata?: Record<string, unknown>;
}

export interface PanelInstance {
  id: string;
  config: PanelConfig;
  update: (newConfig: Partial<PanelConfig>) => void;
  remove: () => void;
}

export const createContextPanel = (contentOrConfig: React.ReactNode | PanelConfig) => {
  const isConfig =
    typeof contentOrConfig !== 'string' &&
    contentOrConfig !== null &&
    typeof contentOrConfig === 'object' &&
    !React.isValidElement(contentOrConfig);

  const config = isConfig
    ? (contentOrConfig as PanelConfig)
    : { content: contentOrConfig as React.ReactNode };

  const panelId = Math.random().toString(36).substring(2, 9);

  logger.log(`[Context Panel ${panelId}]`, 'Created:', config);

  return {
    id: panelId,
    config,
    update: (newConfig: Partial<PanelConfig>) => {
      logger.log(`[Context Panel ${panelId}]`, 'Updated:', newConfig);
    },
    remove: () => {
      logger.log(`[Context Panel ${panelId}]`, 'Removed');
    },
  };
};

/**
 * Panels UI Component for Vibing AI
 */

// Factory function to create a Panels UI instance
export function createPanels(_options: Record<string, unknown> = {}) {
  // Configuration and state
  const panels: PanelInstance[] = [];

  // Render function that places the Panels UI in a container
  function render(_container: HTMLElement) {
    // Implementation placeholder - will be added in future releases
    logger.log('[Panels]', 'Rendering panels component');
  }

  // Public API
  return {
    render,
    panels,
    /**
     * Show a panel with the given configuration
     * @param contentOrConfig Panel content or configuration
     * @returns The created panel instance
     */
    showPanel: (contentOrConfig: React.ReactNode | PanelConfig) => {
      const panel = createContextPanel(contentOrConfig);
      panels.push(panel);
      logger.log('[Panels]', 'Showing panel:', panel.id);
      return panel;
    },

    /**
     * Hide a specific panel by ID
     * @param panelId ID of the panel to hide
     * @returns Boolean indicating success of the operation
     */
    hidePanel: (panelId: string) => {
      const panelIndex = panels.findIndex(panel => panel.id === panelId);
      if (panelIndex === -1) {
        logger.warn('[Panels]', `Panel with ID ${panelId} not found`);
        return false;
      }

      panels[panelIndex].remove();
      panels.splice(panelIndex, 1);
      logger.log('[Panels]', `Hidden panel: ${panelId}`);
      return true;
    },

    /**
     * Update an existing panel's configuration
     * @param panelId ID of the panel to update
     * @param newConfig New configuration to apply
     * @returns Boolean indicating success of the operation
     */
    updatePanel: (panelId: string, newConfig: Partial<PanelConfig>) => {
      const panel = panels.find(panel => panel.id === panelId);
      if (!panel) {
        logger.warn('[Panels]', `Panel with ID ${panelId} not found`);
        return false;
      }

      panel.update(newConfig);
      logger.log('[Panels]', `Updated panel: ${panelId}`);
      return true;
    },
  };
}

// Export createPanelSurface as an alias for createPanels to match import in index.ts
export const createPanelSurface = createPanels;
