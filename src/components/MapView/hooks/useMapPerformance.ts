import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';

// Enhanced map performance hook with clustering and optimization
export const useMapPerformance = (
  mapRef: React.MutableRefObject<L.Map | null>,
  dataLayerRef: React.MutableRefObject<L.LayerGroup | null>,
  data: any[],
  dataType: string
) => {
  const clustersRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || !data.length) return;

    // Clean up existing clusters
    if (clustersRef.current) {
      mapRef.current.removeLayer(clustersRef.current);
    }

    // Create cluster group for performance with large datasets
    if (data.length > 100) {
      clustersRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        chunkInterval: 200,
        chunkDelay: 50,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          let size = 'small';
          if (count > 100) size = 'large';
          else if (count > 10) size = 'medium';
          
          return L.divIcon({
            html: `<div class="cluster-marker cluster-${size}"><span>${count}</span></div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(40, 40)
          });
        }
      });

      mapRef.current.addLayer(clustersRef.current);
    }

    return () => {
      if (clustersRef.current && mapRef.current) {
        mapRef.current.removeLayer(clustersRef.current);
        clustersRef.current = null;
      }
    };
  }, [data.length, mapRef]);

  return { clustersRef };
};