
import React, { useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import MapControls from './MapView/MapControls';
import MapStats from './MapView/MapStats';
import { useMapSetup } from './MapView/hooks/useMapSetup';
import { useMapData } from './MapView/hooks/useMapData';
import { BASEMAPS, TILE_LAYER_OPTIONS } from './MapView/constants';
import { MapViewProps, MapStats as MapStatsType } from './MapView/types';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ data, dataType }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dataLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedBasemap, setSelectedBasemap] = useState('OpenStreetMap');
  const [isLoading, setIsLoading] = useState(false);
  const [mapStats, setMapStats] = useState<MapStatsType>({ features: 0, type: '', bounds: null });

  // Initialize map
  useMapSetup(mapContainerRef, mapRef, dataLayerRef, selectedBasemap);

  // Handle data rendering
  useMapData(mapRef, dataLayerRef, data, dataType, setIsLoading, setMapStats);

  // Enhanced basemap switching
  const handleBasemapChange = useCallback((newBasemap: string) => {
    if (!mapRef.current) return;

    setIsLoading(true);
    setSelectedBasemap(newBasemap);

    // Remove existing tile layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current!.removeLayer(layer);
      }
    });

    const basemap = BASEMAPS[newBasemap];
    const newLayer = L.tileLayer(basemap.url, {
      ...basemap.options,
      ...TILE_LAYER_OPTIONS
    });

    newLayer.on('load', () => setIsLoading(false));
    newLayer.on('tileerror', () => setIsLoading(false));
    newLayer.addTo(mapRef.current!);

    // Fallback timeout
    setTimeout(() => setIsLoading(false), 3000);
  }, []);

  const resetMapView = useCallback(() => {
    if (mapRef.current && mapStats.bounds) {
      mapRef.current.fitBounds(mapStats.bounds, { 
        padding: [20, 20],
        maxZoom: 15
      });
    }
  }, [mapStats.bounds]);

  const toggleFullscreen = useCallback(() => {
    if (mapContainerRef.current) {
      if (!document.fullscreenElement) {
        mapContainerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  return (
    <Card className="relative overflow-hidden border border-blue-200 shadow-lg">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 bg-blue-500 h-1 z-[1001]">
          <div className="h-full bg-blue-300 animate-pulse"></div>
        </div>
      )}
      
      {/* Enhanced control panel */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <MapControls
          selectedBasemap={selectedBasemap}
          onBasemapChange={handleBasemapChange}
          onResetView={resetMapView}
          onToggleFullscreen={toggleFullscreen}
          canResetView={!!mapStats.bounds}
        />
        
        {/* Map statistics */}
        <MapStats stats={mapStats} />
      </div>

      <div 
        ref={mapContainerRef} 
        className="h-[500px] w-full rounded-lg"
        style={{ minHeight: '500px' }}
      />
      
      {/* Custom CSS for popups */}
      <style>
        {`
          .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .custom-popup .leaflet-popup-tip {
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
        `}
      </style>
    </Card>
  );
};

export default MapView;
