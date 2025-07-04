
import { BasemapsConfig } from './types';

export const BASEMAPS: BasemapsConfig = {
  Streets: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19, attribution: '© Esri' }
  },
  Satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19, attribution: '© Esri' }
  },
  Terrain: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19, attribution: '© Esri' }
  },
  'Dark Canvas': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 16, attribution: '© Esri' }
  },
  'Light Gray': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 16, attribution: '© Esri' }
  },
  OpenStreetMap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 19, attribution: '© OpenStreetMap contributors' }
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
