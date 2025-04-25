/**
 * Surface type definitions
 */

export interface SurfaceOptions {
  id?: string;
}

export interface Surface {
  id: string;
  render: (container: HTMLElement) => void;
  destroy: () => void;
}

export interface CardSurface extends Surface {
  type: 'card';
}

export interface PanelSurface extends Surface {
  type: 'panel';
}

export interface ModalSurface extends Surface {
  type: 'modal';
}
