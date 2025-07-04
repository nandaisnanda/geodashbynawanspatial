
import L from 'leaflet';

export const createPopupContent = (data: any, index?: number, geometryType?: string) => {
  const title = geometryType ? `${geometryType} Feature` : `Feature ${(index || 0) + 1}`;
  const entries = Object.entries(data).filter(([key, value]) => 
    value !== null && value !== undefined && value !== ''
  );
  
  return `
    <div class="p-3 max-w-sm">
      <h4 class="font-semibold mb-3 text-blue-600 border-b pb-2">${title}</h4>
      <div class="space-y-2 text-sm max-h-48 overflow-y-auto">
        ${entries.map(([key, value]) => 
          `<div class="flex justify-between py-1">
            <span class="font-medium text-gray-700 mr-2">${key}:</span> 
            <span class="text-gray-900 text-right">${value || 'N/A'}</span>
          </div>`
        ).join('')}
      </div>
    </div>
  `;
};

export const findCoordinateColumns = (row: any) => {
  const headers = Object.keys(row).map(h => h.toLowerCase());
  const latCol = headers.find(h => ['latitude', 'lat', 'y', 'lat_dd', 'latitude_dd'].includes(h));
  const lonCol = headers.find(h => ['longitude', 'lon', 'lng', 'x', 'lon_dd', 'longitude_dd'].includes(h));
  
  return { latCol, lonCol };
};

export const isValidCoordinate = (lat: number, lon: number) => {
  return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

export const createCircleMarker = (latlng: L.LatLngExpression, options?: L.CircleMarkerOptions) => {
  return L.circleMarker(latlng, {
    radius: 6,
    fillColor: '#0ea5e9',
    color: '#0284c7',
    weight: 2,
    fillOpacity: 0.8,
    ...options
  });
};

export const getGeoJsonStyle = (feature?: any) => {
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
};
