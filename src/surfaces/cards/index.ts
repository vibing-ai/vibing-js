/**
 * Cards UI Component for Vibing AI
 */

import React from 'react';
import { logger } from '../../core/utils/logger';

export interface CardConfig {
  content: React.ReactNode;
  actions?: React.ReactNode;
  metadata?: Record<string, unknown>;
}

export interface CardInstance {
  id: string;
  config: CardConfig;
  update: (newConfig: Partial<CardConfig>) => void;
  remove: () => void;
}

export const createConversationCard = (contentOrConfig: React.ReactNode | CardConfig) => {
  const isConfig =
    typeof contentOrConfig !== 'string' &&
    contentOrConfig !== null &&
    typeof contentOrConfig === 'object' &&
    !React.isValidElement(contentOrConfig);

  const config = isConfig
    ? (contentOrConfig as CardConfig)
    : { content: contentOrConfig as React.ReactNode };

  const cardId = Math.random().toString(36).substring(2, 9);

  logger.log(`[Conversation Card ${cardId}]`, 'Created:', config);

  return {
    id: cardId,
    config,
    update: (newConfig: Partial<CardConfig>) => {
      logger.log(`[Conversation Card ${cardId}]`, 'Updated:', newConfig);
    },
    remove: () => {
      logger.log(`[Conversation Card ${cardId}]`, 'Removed');
    },
  };
};

// Factory function to create a Cards UI instance
export function createCards(_options: Record<string, unknown> = {}) {
  // Configuration and state
  const cards: CardInstance[] = [];

  // Render function that places the Cards UI in a container
  function render(_container: HTMLElement) {
    // Implementation will be added in future releases
    logger.log('[Cards]', 'Rendering cards component');
  }

  // Public API
  return {
    render,
    cards,
    /**
     * Add a new card to the cards collection
     * @param cardConfig Configuration for the new card
     * @returns The newly created card instance
     */
    addCard: (cardConfig: React.ReactNode | CardConfig) => {
      const card = createConversationCard(cardConfig);
      cards.push(card);
      logger.log('[Cards]', 'Added card:', card.id);
      return card;
    },

    /**
     * Remove a card from the cards collection
     * @param cardId ID of the card to remove
     * @returns Boolean indicating success of the operation
     */
    removeCard: (cardId: string) => {
      const cardIndex = cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) {
        logger.warn('[Cards]', `Card with ID ${cardId} not found`);
        return false;
      }

      cards.splice(cardIndex, 1);
      logger.log('[Cards]', `Removed card: ${cardId}`);
      return true;
    },

    /**
     * Update an existing card's configuration
     * @param cardId ID of the card to update
     * @param newConfig New configuration to apply
     * @returns Boolean indicating success of the operation
     */
    updateCard: (cardId: string, newConfig: Partial<CardConfig>) => {
      const card = cards.find(card => card.id === cardId);
      if (!card) {
        logger.warn('[Cards]', `Card with ID ${cardId} not found`);
        return false;
      }

      card.update(newConfig);
      logger.log('[Cards]', `Updated card: ${cardId}`);
      return true;
    },
  };
}

// Export createCardSurface as an alias for createCards to match import in index.ts
export const createCardSurface = createCards;
