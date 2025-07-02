
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import MapView from '@/components/MapView';
import AttributeTable from '@/components/AttributeTable';
import DataCharts from '@/components/DataCharts';
import DataHeaderEditor from '@/components/DataHeaderEditor';
import SmartAnalytics from '@/components/SmartAnalytics';
import PDFExport from '@/components/PDFExport';
import { initializeAuth } from '@/lib/firebase';
import { toast } from 'sonner';

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [dataType, setDataType] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const handleDataLoad = (newData: any[], type: string) => {
    console.log('Loading data:', { count: newData.length, type });
    setData(newData);
    setDataType(type);
    toast.success(`Loaded ${newData.length} features successfully! Smart analysis initiated.`);
  };

  const handleDataUpdate = (updatedData: any[]) => {
    setData(updatedData);
    console.log('Data updated:', updatedData.length, 'records');
    toast.success('Data updated successfully!');
  };

  const handleAnalyticsUpdate = (analytics: any) => {
    setAnalyticsData(analytics);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div id="dashboard-content" className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground">
              Advanced Geospatial Analytics Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Upload your geospatial data for instant smart analysis, beautiful visualizations, 
              and professional reporting with AI-powered insights and recommendations.
            </p>
          </div>

          {/* File Upload */}
          <div className="animate-slide-up">
            <FileUpload onDataLoad={handleDataLoad} />
          </div>

          {/* Main Dashboard Content */}
          {data.length > 0 && (
            <>
              {/* Smart Analytics Section */}
              <div className="animate-slide-up">
                <SmartAnalytics 
                  data={data} 
                  dataType={dataType}
                />
              </div>

              {/* Data Header Editor */}
              <div className="animate-slide-up">
                <DataHeaderEditor 
                  data={data} 
                  dataType={dataType} 
                  onDataUpdate={handleDataUpdate}
                />
              </div>

              {/* Map Section */}
              <div className="animate-slide-up" id="map-section" data-section="map">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🗺️ High-Performance Interactive Map
                </h3>
                <MapView data={data} dataType={dataType} />
              </div>

              {/* Charts Section */}
              <div className="animate-slide-up" data-section="charts">
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
                <PDFExport data={data} analysisData={analyticsData} />
              </div>
            </>
          )}

          {/* Enhanced Getting Started Guide */}
          {data.length === 0 && (
            <div className="grid md:grid-cols-4 gap-6 mt-12 animate-slide-up">
              <div className="text-center p-6 rounded-lg border border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <div className="text-4xl mb-4">📂</div>
                <h3 className="font-semibold mb-2">1. Upload Data</h3>
                <p className="text-sm text-muted-foreground">
                  GeoJSON, CSV with coordinates, Shapefiles (.zip/.shp)
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border border-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="font-semibold mb-2">2. Smart Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered insights and data quality assessment
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border border-border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="font-semibold mb-2">3. Interactive Maps</h3>
                <p className="text-sm text-muted-foreground">
                  High-performance maps with premium Esri basemaps
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border border-border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="font-semibold mb-2">4. Professional Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive PDF exports with analysis
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
