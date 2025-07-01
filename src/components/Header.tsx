
import React from 'react';
import { MapPin } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary rounded-lg p-2">
              <MapPin className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Geodash</h1>
              <p className="text-sm text-muted-foreground">by NawanSpatial</p>
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground">
              Interactive Geospatial Data Visualization Platform
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
