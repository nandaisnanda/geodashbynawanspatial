
import { BasemapsConfig } from './types';

export const BASEMAPS: BasemapsConfig = {
  OpenStreetMap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }
  },
  CartoDB: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 19,
      attribution: '© CartoDB',
      subdomains: 'abcd'
    }
  },
  Satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: '© Esri'
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
  keepBuffer: 4,
  updateWhenZooming: false,
  crossOrigin: true,
  errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
};
