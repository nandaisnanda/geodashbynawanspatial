import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Layers, MapPin, Maximize2 } from 'lucide-react';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  data: any[];
  dataType: string;
}

const MapView = ({ data, dataType }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dataLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedBasemap, setSelectedBasemap] = useState('Streets');
  const [isLoading, setIsLoading] = useState(false);
  const [mapStats, setMapStats] = useState({ features: 0, type: '', bounds: null });

  // Enhanced basemaps with better performance
  const basemaps = {
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

  // Initialize map with enhanced performance settings
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
      preferCanvas: true,
      worldCopyJump: true,
      maxBounds: [[-90, -180], [90, 180]],
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true
    });

    // Add zoom control in bottom right
    mapRef.current.zoomControl.setPosition('bottomright');

    // Add initial basemap
    const basemap = basemaps[selectedBasemap];
    L.tileLayer(basemap.url, {
      ...basemap.options,
      detectRetina: true,
      updateWhenIdle: true,
      keepBuffer: 2,
      updateWhenZooming: false
    }).addTo(mapRef.current);

    dataLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

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

    const basemap = basemaps[newBasemap];
    const newLayer = L.tileLayer(basemap.url, {
      ...basemap.options,
      detectRetina: true,
      updateWhenIdle: true,
      keepBuffer: 2,
      updateWhenZooming: false
    });

    newLayer.on('load', () => setIsLoading(false));
    newLayer.on('tileerror', () => setIsLoading(false));
    newLayer.addTo(mapRef.current!);

    // Fallback timeout
    setTimeout(() => setIsLoading(false), 3000);
  }, []);

  // Enhanced data rendering with performance optimization
  useEffect(() => {
    if (!mapRef.current || !dataLayerRef.current || !data.length) {
      setMapStats({ features: 0, type: '', bounds: null });
      return;
    }

    setIsLoading(true);
    dataLayerRef.current.clearLayers();

    try {
      let featureCount = 0;
      let mapBounds: L.LatLngBounds | null = null;

      if (dataType === 'csv') {
        // Handle CSV with coordinates
        const markers: L.Marker[] = [];
        const validData = data.filter(row => {
          const headers = Object.keys(row).map(h => h.toLowerCase());
          const latCol = headers.find(h => ['latitude', 'lat', 'y', 'lat_dd', 'latitude_dd'].includes(h));
          const lonCol = headers.find(h => ['longitude', 'lon', 'lng', 'x', 'lon_dd', 'longitude_dd'].includes(h));
          
          if (latCol && lonCol) {
            const lat = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === latCol)!]);
            const lon = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === lonCol)!]);
            return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
          }
          return false;
        });

        validData.forEach((row, index) => {
          const headers = Object.keys(row).map(h => h.toLowerCase());
          const latCol = headers.find(h => ['latitude', 'lat', 'y', 'lat_dd', 'latitude_dd'].includes(h));
          const lonCol = headers.find(h => ['longitude', 'lon', 'lng', 'x', 'lon_dd', 'longitude_dd'].includes(h));
          
          const lat = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === latCol!)!]);
          const lon = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === lonCol!)!]);
          
          // Create custom marker with better styling
          const marker = L.circleMarker([lat, lon], {
            radius: 6,
            fillColor: '#0ea5e9',
            color: '#0284c7',
            weight: 2,
            fillOpacity: 0.8
          }).bindPopup(`
            <div class="p-3 max-w-sm">
              <h4 class="font-semibold mb-3 text-blue-600 border-b pb-2">Feature ${index + 1}</h4>
              <div class="space-y-2 text-sm max-h-48 overflow-y-auto">
                ${Object.entries(row).map(([key, value]) => 
                  `<div class="flex justify-between py-1">
                    <span class="font-medium text-gray-700 mr-2">${key}:</span> 
                    <span class="text-gray-900 text-right">${value || 'N/A'}</span>
                  </div>`
                ).join('')}
              </div>
            </div>
          `, { maxWidth: 350, className: 'custom-popup' });
          
          markers.push(marker);
          dataLayerRef.current!.addLayer(marker);
          featureCount++;
        });

        if (markers.length > 0) {
          const group = new L.featureGroup(markers);
          mapBounds = group.getBounds();
          mapRef.current.fitBounds(mapBounds, { 
            padding: [20, 20],
            maxZoom: 15
          });
        }
      } else {
        // Handle GeoJSON/Shapefile with enhanced styling
        const geoJsonLayer = L.geoJSON(data, {
          style: (feature) => {
            const geometryType = feature?.geometry?.type;
            if (geometryType === 'Point') {
              return {};
            }
            return {
              color: '#0ea5e9',
              weight: 2,
              fillColor: '#0ea5e9',
              fillOpacity: 0.3,
              opacity: 0.8
            };
          },
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 8,
              color: '#0ea5e9',
              weight: 2,
              fillColor: '#0ea5e9',
              fillOpacity: 0.7
            });
          },
          onEachFeature: (feature, layer) => {
            featureCount++;
            if (feature.properties) {
              const properties = Object.entries(feature.properties).filter(([key, value]) => 
                value !== null && value !== undefined && value !== ''
              );
              
              const popupContent = `
                <div class="p-3 max-w-sm">
                  <h4 class="font-semibold mb-3 text-blue-600 border-b pb-2">
                    ${feature.geometry.type} Feature
                  </h4>
                  <div class="space-y-2 text-sm max-h-48 overflow-y-auto">
                    ${properties.map(([key, value]) => 
                      `<div class="flex justify-between py-1">
                        <span class="font-medium text-gray-700 mr-2">${key}:</span> 
                        <span class="text-gray-900 text-right">${value}</span>
                      </div>`
                    ).join('')}
                  </div>
                </div>
              `;
              layer.bindPopup(popupContent, { maxWidth: 350, className: 'custom-popup' });
            }
          }
        });

        dataLayerRef.current.addLayer(geoJsonLayer);
        mapBounds = geoJsonLayer.getBounds();
        
        if (mapBounds.isValid()) {
          mapRef.current.fitBounds(mapBounds, { 
            padding: [20, 20],
            maxZoom: 15
          });
        }
      }

      setMapStats({
        features: featureCount,
        type: dataType.toUpperCase(),
        bounds: mapBounds
      });

    } catch (error) {
      console.error('Error adding data to map:', error);
      setMapStats({ features: 0, type: dataType.toUpperCase(), bounds: null });
    } finally {
      setIsLoading(false);
    }
  }, [data, dataType]);

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
        <div className="flex items-center gap-2">
          <Select value={selectedBasemap} onValueChange={handleBasemapChange}>
            <SelectTrigger className="w-36 bg-white/95 backdrop-blur-sm border-gray-300 shadow-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(basemaps).map((basemap) => (
                <SelectItem key={basemap} value={basemap} className="text-sm">
                  {basemap}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={resetMapView} 
            size="sm" 
            variant="outline"
            className="bg-white/95 backdrop-blur-sm border-gray-300 shadow-lg"
            disabled={!mapStats.bounds}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={toggleFullscreen} 
            size="sm" 
            variant="outline"
            className="bg-white/95 backdrop-blur-sm border-gray-300 shadow-lg"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Map statistics */}
        {mapStats.features > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <Layers className="h-4 w-4 text-blue-600" />
              <Badge variant="secondary" className="text-xs">
                {mapStats.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="font-medium">{mapStats.features} features</span>
            </div>
          </div>
        )}
      </div>

      <div 
        ref={mapContainerRef} 
        className="h-[500px] w-full rounded-lg"
        style={{ minHeight: '500px' }}
      />
      
      {/* Fixed custom CSS for popups */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .custom-popup .leaflet-popup-tip {
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
      `}</style>
    </Card>
  );
};

export default MapView;
