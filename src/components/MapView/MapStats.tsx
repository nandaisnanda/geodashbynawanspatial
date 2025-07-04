
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Layers, MapPin } from 'lucide-react';
import { MapStats as MapStatsType } from './types';

interface MapStatsProps {
  stats: MapStatsType;
}

const MapStats = ({ stats }: MapStatsProps) => {
  if (stats.features === 0) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 text-sm">
        <Layers className="h-4 w-4 text-blue-600" />
        <Badge variant="secondary" className="text-xs">
          {stats.type}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-sm mt-1">
        <MapPin className="h-4 w-4 text-green-600" />
        <span className="font-medium">{stats.features} features</span>
      </div>
    </div>
  );
};

export default MapStats;
