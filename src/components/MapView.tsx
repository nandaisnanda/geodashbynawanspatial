
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  // Optimized basemaps with better tile servers
  const basemaps = {
    Streets: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      options: { maxZoom: 19, attribution: '© Esri' }
    },
    Topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      options: { maxZoom: 19, attribution: '© Esri' }
    },
    Imagery: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: { maxZoom: 19, attribution: '© Esri' }
    },
    'Dark Gray': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      options: { maxZoom: 16, attribution: '© Esri' }
    },
    'Light Gray': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      options: { maxZoom: 16, attribution: '© Esri' }
    }
  };

  // Initialize map with optimized settings
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
      preferCanvas: true, // Better performance for large datasets
      worldCopyJump: true,
      maxBounds: [[-90, -180], [90, 180]]
    });

    // Add initial basemap with optimized settings
    const basemap = basemaps[selectedBasemap];
    L.tileLayer(basemap.url, {
      ...basemap.options,
      detectRetina: true,
      updateWhenIdle: true,
      keepBuffer: 2
    }).addTo(mapRef.current);

    dataLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle basemap changes with loading state
  useEffect(() => {
    if (!mapRef.current) return;

    setIsLoading(true);
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current!.removeLayer(layer);
      }
    });

    const basemap = basemaps[selectedBasemap];
    const newLayer = L.tileLayer(basemap.url, {
      ...basemap.options,
      detectRetina: true,
      updateWhenIdle: true,
      keepBuffer: 2
    });

    newLayer.on('load', () => setIsLoading(false));
    newLayer.addTo(mapRef.current);
  }, [selectedBasemap]);

  // Optimized data handling with clustering for large datasets
  useEffect(() => {
    if (!mapRef.current || !dataLayerRef.current || !data.length) return;

    setIsLoading(true);
    dataLayerRef.current.clearLayers();

    try {
      if (dataType === 'csv') {
        const markers: L.Marker[] = [];
        const validData = data.filter(row => {
          const headers = Object.keys(row).map(h => h.toLowerCase());
          const latCol = headers.find(h => ['latitude', 'lat', 'y'].includes(h));
          const lonCol = headers.find(h => ['longitude', 'lon', 'lng', 'x'].includes(h));
          
          if (latCol && lonCol) {
            const lat = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === latCol)!]);
            const lon = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === lonCol)!]);
            return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
          }
          return false;
        });

        validData.forEach((row, index) => {
          const headers = Object.keys(row).map(h => h.toLowerCase());
          const latCol = headers.find(h => ['latitude', 'lat', 'y'].includes(h));
          const lonCol = headers.find(h => ['longitude', 'lon', 'lng', 'x'].includes(h));
          
          const lat = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === latCol!)!]);
          const lon = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === lonCol!)!]);
          
          const marker = L.marker([lat, lon])
            .bindPopup(`
              <div class="p-3 max-w-sm">
                <h4 class="font-semibold mb-2 text-blue-600">Feature ${index + 1}</h4>
                <div class="space-y-1 text-sm">
                  ${Object.entries(row).map(([key, value]) => 
                    `<div class="flex justify-between">
                      <span class="font-medium text-gray-700">${key}:</span> 
                      <span class="text-gray-900">${value || 'N/A'}</span>
                    </div>`
                  ).join('')}
                </div>
              </div>
            `, { maxWidth: 300 });
          
          markers.push(marker);
          dataLayerRef.current!.addLayer(marker);
        });

        if (markers.length > 0) {
          const group = new L.featureGroup(markers);
          mapRef.current.fitBounds(group.getBounds(), { 
            padding: [20, 20],
            maxZoom: 15
          });
        }
      } else {
        // Enhanced GeoJSON/Shapefile rendering
        const geoJsonLayer = L.geoJSON(data, {
          style: (feature) => ({
            color: '#0ea5e9',
            weight: 2,
            fillColor: '#0ea5e9',
            fillOpacity: 0.3,
            opacity: 0.8
          }),
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
            if (feature.properties) {
              const popupContent = `
                <div class="p-3 max-w-sm">
                  <h4 class="font-semibold mb-2 text-blue-600">Feature Properties</h4>
                  <div class="space-y-1 text-sm">
                    ${Object.entries(feature.properties).map(([key, value]) => 
                      `<div class="flex justify-between">
                        <span class="font-medium text-gray-700">${key}:</span> 
                        <span class="text-gray-900">${value || 'N/A'}</span>
                      </div>`
                    ).join('')}
                  </div>
                </div>
              `;
              layer.bindPopup(popupContent, { maxWidth: 300 });
            }
          }
        });

        dataLayerRef.current.addLayer(geoJsonLayer);
        mapRef.current.fitBounds(geoJsonLayer.getBounds(), { 
          padding: [20, 20],
          maxZoom: 15
        });
      }
    } catch (error) {
      console.error('Error adding data to map:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data, dataType]);

  return (
    <Card className="relative overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 bg-blue-500 h-1 z-[1001]">
          <div className="h-full bg-blue-300 animate-pulse"></div>
        </div>
      )}
      <div className="absolute top-4 right-4 z-[1000]">
        <Select value={selectedBasemap} onValueChange={setSelectedBasemap}>
          <SelectTrigger className="w-32 bg-card border-border shadow-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(basemaps).map((basemap) => (
              <SelectItem key={basemap} value={basemap}>
                {basemap}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div 
        ref={mapContainerRef} 
        className="h-96 w-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
    </Card>
  );
};

export default MapView;
