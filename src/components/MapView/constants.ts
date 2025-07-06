
import { BasemapsConfig } from './types';

export const BASEMAPS: BasemapsConfig = {
  OpenStreetMap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
      detectRetina: true,
      updateWhenIdle: false,
      keepBuffer: 2,
      updateWhenZooming: false
    }
  }
};

export const MAP_CONFIG = {
  center: [0, 0] as [number, number],
  zoom: 2,
  zoomControl: true,
  preferCanvas: true,
  worldCopyJump: true,
  maxBounds: [[-90, -180], [90, 180]] as [[number, number], [number, number]],
  zoomAnimation: true,
  fadeAnimation: true,
  markerZoomAnimation: true
};

export const TILE_LAYER_OPTIONS = {
  detectRetina: true,
  updateWhenIdle: true,
  keepBuffer: 2,
  updateWhenZooming: false
};
