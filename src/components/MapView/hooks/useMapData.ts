
import { useEffect } from 'react';
import L from 'leaflet';
import { MapStats } from '../types';
import { 
  createPopupContent, 
  findCoordinateColumns, 
  isValidCoordinate, 
  createCircleMarker,
  getGeoJsonStyle
} from '../utils';

export const useMapData = (
  mapRef: React.MutableRefObject<L.Map | null>,
  dataLayerRef: React.MutableRefObject<L.LayerGroup | null>,
  data: any[],
  dataType: string,
  setIsLoading: (loading: boolean) => void,
  setMapStats: (stats: MapStats) => void
) => {
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
        const markers: L.CircleMarker[] = [];
        const validData = data.filter(row => {
          const { latCol, lonCol } = findCoordinateColumns(row);
          
          if (latCol && lonCol) {
            const lat = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === latCol)!]);
            const lon = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === lonCol)!]);
            return isValidCoordinate(lat, lon);
          }
          return false;
        });

        validData.forEach((row, index) => {
          const { latCol, lonCol } = findCoordinateColumns(row);
          const lat = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === latCol!)!]);
          const lon = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === lonCol!)!]);
          
          const marker = createCircleMarker([lat, lon])
            .bindPopup(createPopupContent(row, index), { 
              maxWidth: 350, 
              className: 'custom-popup' 
            });
          
          markers.push(marker);
          dataLayerRef.current!.addLayer(marker);
          featureCount++;
        });

        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          mapBounds = group.getBounds();
          mapRef.current.fitBounds(mapBounds, { 
            padding: [20, 20],
            maxZoom: 15
          });
        }
      } else {
        const geoJsonLayer = L.geoJSON(data, {
          style: getGeoJsonStyle,
          pointToLayer: (feature, latlng) => {
            return createCircleMarker(latlng, {
              radius: 8,
              fillOpacity: 0.7
            });
          },
          onEachFeature: (feature, layer) => {
            featureCount++;
            if (feature.properties) {
              const popupContent = createPopupContent(
                feature.properties, 
                undefined, 
                feature.geometry.type
              );
              layer.bindPopup(popupContent, { 
                maxWidth: 350, 
                className: 'custom-popup' 
              });
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
  }, [data, dataType, mapRef, dataLayerRef, setIsLoading, setMapStats]);
};
