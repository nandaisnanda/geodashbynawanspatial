
import L from 'leaflet';

export interface MapViewProps {
  data: any[];
  dataType: string;
}

export interface MapStats {
  features: number;
  type: string;
  bounds: L.LatLngBounds | null;
}

export interface BasemapConfig {
  url: string;
  options: {
    maxZoom: number;
    attribution: string;
    detectRetina?: boolean;
    updateWhenIdle?: boolean;
    keepBuffer?: number;
    updateWhenZooming?: boolean;
  };
}

export interface BasemapsConfig {
  [key: string]: BasemapConfig;
}
