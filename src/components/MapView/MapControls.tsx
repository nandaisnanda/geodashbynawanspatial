
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw, Maximize2 } from 'lucide-react';
import { BASEMAPS } from './constants';

interface MapControlsProps {
  selectedBasemap: string;
  onBasemapChange: (basemap: string) => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  canResetView: boolean;
}

const MapControls = ({
  selectedBasemap,
  onBasemapChange,
  onResetView,
  onToggleFullscreen,
  canResetView
}: MapControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Select value={selectedBasemap} onValueChange={onBasemapChange}>
        <SelectTrigger className="w-36 bg-white/95 backdrop-blur-sm border-gray-300 shadow-lg text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(BASEMAPS).map((basemap) => (
            <SelectItem key={basemap} value={basemap} className="text-sm">
              {basemap}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        onClick={onResetView} 
        size="sm" 
        variant="outline"
        className="bg-white/95 backdrop-blur-sm border-gray-300 shadow-lg"
        disabled={!canResetView}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      
      <Button 
        onClick={onToggleFullscreen} 
        size="sm" 
        variant="outline"
        className="bg-white/95 backdrop-blur-sm border-gray-300 shadow-lg"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapControls;
