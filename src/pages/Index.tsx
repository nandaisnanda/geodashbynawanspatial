
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import MapView from '@/components/MapView';
import AttributeTable from '@/components/AttributeTable';
import DataCharts from '@/components/DataCharts';
import PDFExport from '@/components/PDFExport';
import { initializeAuth } from '@/lib/firebase';
import { toast } from 'sonner';

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [dataType, setDataType] = useState<string>('');

  useEffect(() => {
    initializeAuth();
  }, []);

  const handleDataLoad = (newData: any[], type: string) => {
    console.log('Loading data:', { count: newData.length, type });
    setData(newData);
    setDataType(type);
    toast.success(`Loaded ${newData.length} features successfully!`);
  };

  const handleDataUpdate = (updatedData: any[]) => {
    setData(updatedData);
    // Here you would typically save to Firestore
    console.log('Data updated:', updatedData.length, 'records');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div id="dashboard-content" className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground">
              Interactive Geospatial Data Visualization Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your geospatial data and automatically generate beautiful maps, 
              insightful charts, and comprehensive reports with intelligent analysis.
            </p>
          </div>

          {/* File Upload */}
          <div className="animate-slide-up">
            <FileUpload onDataLoad={handleDataLoad} />
          </div>

          {/* Main Dashboard Content */}
          {data.length > 0 && (
            <>
              {/* Map Section */}
              <div className="animate-slide-up">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  📍 Interactive Map Visualization
                </h3>
                <MapView data={data} dataType={dataType} />
              </div>

              {/* Charts Section */}
              <div className="animate-slide-up">
                <DataCharts data={data} dataType={dataType} />
              </div>

              {/* Attribute Table Section */}
              <div className="animate-slide-up">
                <AttributeTable 
                  data={data} 
                  dataType={dataType} 
                  onDataUpdate={handleDataUpdate}
                />
              </div>

              {/* PDF Export Section */}
              <div className="animate-slide-up">
                <PDFExport />
              </div>
            </>
          )}

          {/* Getting Started Guide */}
          {data.length === 0 && (
            <div className="grid md:grid-cols-3 gap-6 mt-12 animate-slide-up">
              <div className="text-center p-6 rounded-lg border border-border">
                <div className="text-4xl mb-4">📂</div>
                <h3 className="font-semibold mb-2">1. Upload Data</h3>
                <p className="text-sm text-muted-foreground">
                  Support for GeoJSON, CSV with coordinates, and Shapefiles
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border border-border">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="font-semibold mb-2">2. Explore Maps</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive maps with multiple Esri basemap options
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border border-border">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="font-semibold mb-2">3. Generate Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic charts and professional PDF exports
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
