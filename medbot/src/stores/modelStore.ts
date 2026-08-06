import { create } from 'zustand';

export const MODEL_DEFAULTS = {
  position: {
    x: 0,
    y: -3.9,
  },
  zoom: 1.6,
  rotation: {
    x: 0,
    y: 0,
    z: 0,
  },
  lighting: 'clinical' as const,
  explodedView: false,
  cameraPreset: 'front' as const,
};

export interface ModelSettings {
  xPosition: number; // -5 to +5 (default 0)
  yPosition: number; // -5 to +5 (default -3.9)
  zoom: number; // 0.5x to 3.0x (default 1.6)
  rotation: number; // 0 to 360
  lighting: 'clinical' | 'ambient' | 'studio';
  explodedView: boolean;
  cameraPreset: 'front' | 'side' | 'top' | 'closeUp';
}

interface ModelStore extends ModelSettings {
  setXPosition: (x: number) => void;
  setYPosition: (y: number) => void;
  setZoom: (z: number) => void;
  setRotation: (r: number) => void;
  setLighting: (l: 'clinical' | 'ambient' | 'studio') => void;
  setExplodedView: (e: boolean) => void;
  setCameraPreset: (p: 'front' | 'side' | 'top' | 'closeUp') => void;
  resetControls: () => void;
}

const defaultModelSettings: ModelSettings = {
  xPosition: MODEL_DEFAULTS.position.x,
  yPosition: MODEL_DEFAULTS.position.y,
  zoom: MODEL_DEFAULTS.zoom,
  rotation: MODEL_DEFAULTS.rotation.y,
  lighting: MODEL_DEFAULTS.lighting,
  explodedView: MODEL_DEFAULTS.explodedView,
  cameraPreset: MODEL_DEFAULTS.cameraPreset,
};

/**
 * Zustand Store for 3D Model Viewer Transformation Controls & Settings
 * Synchronized with MODEL_DEFAULTS (X: -5 to +5, Y: -5 to +5, Zoom: 0.5 to 3.0)
 */
export const useModelStore = create<ModelStore>((set) => ({
  ...defaultModelSettings,
  setXPosition: (xPosition) => set({ xPosition: Math.max(-5, Math.min(5, xPosition)) }),
  setYPosition: (yPosition) => set({ yPosition: Math.max(-5, Math.min(5, yPosition)) }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3.0, zoom)) }),
  setRotation: (rotation) => set({ rotation }),
  setLighting: (lighting) => set({ lighting }),
  setExplodedView: (explodedView) => set({ explodedView }),
  setCameraPreset: (cameraPreset) => set({ cameraPreset }),
  resetControls: () => set({ ...defaultModelSettings }),
}));

export default useModelStore;
