
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

  const basemaps = {
    Streets: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    Topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    Imagery: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    'Dark Gray': 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    'Light Gray': 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true
    });

    // Add initial basemap
    L.tileLayer(basemaps[selectedBasemap], {
      attribution: '© Esri'
    }).addTo(mapRef.current);

    dataLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle basemap changes
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current!.removeLayer(layer);
      }
    });

    L.tileLayer(basemaps[selectedBasemap], {
      attribution: '© Esri'
    }).addTo(mapRef.current);
  }, [selectedBasemap]);

  // Handle data updates
  useEffect(() => {
    if (!mapRef.current || !dataLayerRef.current || !data.length) return;

    dataLayerRef.current.clearLayers();

    try {
      if (dataType === 'csv') {
        const markers: L.Marker[] = [];
        data.forEach((row, index) => {
          const headers = Object.keys(row).map(h => h.toLowerCase());
          const latCol = headers.find(h => ['latitude', 'lat', 'y'].includes(h));
          const lonCol = headers.find(h => ['longitude', 'lon', 'lng', 'x'].includes(h));
          
          if (latCol && lonCol) {
            const lat = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === latCol)!]);
            const lon = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === lonCol)!]);
            
            if (!isNaN(lat) && !isNaN(lon)) {
              const marker = L.marker([lat, lon])
                .bindPopup(`
                  <div class="p-2">
                    <h4 class="font-semibold mb-2">Feature ${index + 1}</h4>
                    ${Object.entries(row).map(([key, value]) => 
                      `<div><strong>${key}:</strong> ${value}</div>`
                    ).join('')}
                  </div>
                `);
              markers.push(marker);
              dataLayerRef.current!.addLayer(marker);
            }
          }
        });

        if (markers.length > 0) {
          const group = new L.featureGroup(markers);
          mapRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
      } else {
        // GeoJSON or Shapefile
        const geoJsonLayer = L.geoJSON(data, {
          style: (feature) => ({
            color: '#0ea5e9',
            weight: 2,
            fillColor: '#0ea5e9',
            fillOpacity: 0.3
          }),
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 6,
              color: '#0ea5e9',
              weight: 2,
              fillColor: '#0ea5e9',
              fillOpacity: 0.7
            });
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const popupContent = `
                <div class="p-2 max-w-xs">
                  <h4 class="font-semibold mb-2">Feature Properties</h4>
                  ${Object.entries(feature.properties).map(([key, value]) => 
                    `<div class="text-sm"><strong>${key}:</strong> ${value}</div>`
                  ).join('')}
                </div>
              `;
              layer.bindPopup(popupContent);
            }
          }
        });

        dataLayerRef.current.addLayer(geoJsonLayer);
        mapRef.current.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
      }
    } catch (error) {
      console.error('Error adding data to map:', error);
    }
  }, [data, dataType]);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-4 right-4 z-[1000]">
        <Select value={selectedBasemap} onValueChange={setSelectedBasemap}>
          <SelectTrigger className="w-32 bg-card border-border">
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
