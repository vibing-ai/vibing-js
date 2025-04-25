/**
 * Vibing AI JavaScript SDK
 * The official JavaScript SDK for building Vibing AI apps, plugins, and agents.
 *
 * @packageDocumentation
 */

// Import version utilities
import { SDK_VERSION, checkSDKVersion } from './core/version';

// Public API exports with proper tree-shaking
// App exports
import { createApp } from './app/createApp';
export { createApp };

// Plugin exports
import { createPlugin } from './plugin/createPlugin';
export { createPlugin };

// Agent exports
import { createAgent } from './agent/createAgent';
export { createAgent };

// Common utilities - export individual utilities rather than entire modules
import { EventEmitter } from './core/events';
import { createMemory } from './core/memory';
import { createPermissions } from './core/permissions';
export { EventEmitter, createMemory, createPermissions };

// Surface exports
import { createCards } from './surfaces/cards';
import { createPanels } from './surfaces/panels';
import { createModals } from './surfaces/modals';
export {
  createCards as createCardSurface,
  createPanels as createPanelSurface,
  createModals as createModalSurface,
};

// Export utility types to improve developer experience
export * from './types/utilities';

// Type-Only exports - for better type organization and developer experience
export type {
  // App types
  App,
  AppOptions,
  AppConfig,
  AppState,
  AppEvents,
} from './app/types';

export type {
  // Plugin types
  Plugin,
  PluginOptions,
  PluginConfig,
  PluginState,
  PluginEvents,
} from './plugin/types';

export type {
  // Agent types
  Agent,
  AgentOptions,
  AgentConfig,
  AgentState,
  AgentEvents,
} from './agent/types';

export type {
  // Surface types
  Surface,
  SurfaceOptions,
  CardSurface,
  PanelSurface,
  ModalSurface,
} from './surfaces/types';

// Common types
export * from './core/types';

// Block Kit adapter types for integration with @vibing-ai/block-kit
export type {
  BlockKitAdapter,
  BlockKitOptions,
  BlockKitComponent,
  BlockKitTheme,
} from './surfaces/block-kit-types';

// Export version
export const VERSION: string = SDK_VERSION;

// Check version compatibility when SDK is imported
// Only in non-production environments to avoid console noise in production
if (process.env.NODE_ENV !== 'production') {
  checkSDKVersion();
}
