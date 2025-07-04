
import { useEffect } from 'react';
import L from 'leaflet';
import { BASEMAPS, MAP_CONFIG, TILE_LAYER_OPTIONS } from '../constants';

export const useMapSetup = (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  mapRef: React.MutableRefObject<L.Map | null>,
  dataLayerRef: React.MutableRefObject<L.LayerGroup | null>,
  selectedBasemap: string
) => {
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, MAP_CONFIG);
    mapRef.current.zoomControl.setPosition('bottomright');

    const basemap = BASEMAPS[selectedBasemap];
    L.tileLayer(basemap.url, {
      ...basemap.options,
      ...TILE_LAYER_OPTIONS
    }).addTo(mapRef.current);

    dataLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapContainerRef, mapRef, dataLayerRef, selectedBasemap]);
};
