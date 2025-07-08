import React from 'react';

const GettingStartedGuide = () => {
  return (
    <section className="mt-16 animate-fade-in-up animate-delay-300">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold mb-4">Get Started in 4 Simple Steps</h3>
        <p className="text-muted-foreground text-lg">
          Transform your geospatial data into actionable insights
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="card-enhanced text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover-lift animate-fade-in-up animate-delay-400">
          <div className="text-6xl mb-6">📂</div>
          <h4 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">1. Upload Data</h4>
          <p className="text-muted-foreground">
            GeoJSON, CSV with coordinates, Shapefiles (.zip/.shp)
          </p>
        </div>
        
        <div className="card-enhanced text-center p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover-lift animate-fade-in-up animate-delay-500">
          <div className="text-6xl mb-6">🧠</div>
          <h4 className="text-xl font-semibold mb-3 text-green-600 dark:text-green-400">2. Smart Analysis</h4>
          <p className="text-muted-foreground">
            AI-powered insights and data quality assessment
          </p>
        </div>
        
        <div className="card-enhanced text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover-lift animate-fade-in-up animate-delay-600">
          <div className="text-6xl mb-6">🗺️</div>
          <h4 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">3. Interactive Maps</h4>
          <p className="text-muted-foreground">
            High-performance maps with premium Esri basemaps
          </p>
        </div>
        
        <div className="card-enhanced text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover-lift animate-fade-in-up animate-delay-700">
          <div className="text-6xl mb-6">📊</div>
          <h4 className="text-xl font-semibold mb-3 text-orange-600 dark:text-orange-400">4. Professional Reports</h4>
          <p className="text-muted-foreground">
            Comprehensive PDF exports with analysis
          </p>
        </div>
      </div>
    </section>
  );
};

export default GettingStartedGuide;