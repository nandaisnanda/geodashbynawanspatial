import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import MapView from '@/components/MapView';
import AttributeTable from '@/components/AttributeTable';
import DataCharts from '@/components/DataCharts';
import DataHeaderEditor from '@/components/DataHeaderEditor';
import SmartAnalytics from '@/components/SmartAnalytics';
import AdvancedVisualizations from '@/components/AdvancedVisualizations';
import SmartFiltering from '@/components/SmartFiltering';
import DynamicChartBuilder from '@/components/DynamicChartBuilder';
import PDFExport from '@/components/PDFExport';
import UserDashboard from '@/components/UserDashboard';
import { initializeAuth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [dataType, setDataType] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, []);

  const trackActivity = async (activityType: string, metadata?: any) => {
    if (!user) return;

    try {
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          metadata: metadata || {}
        });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const handleDataLoad = async (newData: any[], type: string) => {
    console.log('Loading data:', { count: newData.length, type });
    setData(newData);
    setFilteredData(newData);
    setDataType(type);
    toast.success(`Loaded ${newData.length} features successfully! Smart analysis initiated.`);
    
    // Track file upload activity
    await trackActivity('file_upload', {
      file_type: type,
      feature_count: newData.length,
      timestamp: new Date().toISOString()
    });
  };

  const handleDataUpdate = (updatedData: any[]) => {
    setData(updatedData);
    console.log('Data updated:', updatedData.length, 'records');
    toast.success('Data updated successfully!');
  };

  const handleAnalyticsUpdate = async (analytics: any) => {
    setAnalyticsData(analytics);
    
    // Track analysis completion
    await trackActivity('analysis_complete', {
      analysis_type: 'smart_analytics',
      insights_count: analytics?.insights?.length || 0,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Enhanced background with animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <Header />
      
      <main className="container mx-auto px-6 py-8 relative z-10">
        <div id="dashboard-content" className="space-y-12">
          {/* User Dashboard Section */}
          {user && (
            <section className="animate-fade-in-up">
              <UserDashboard />
            </section>
          )}

          {/* Enhanced Welcome Section */}
          <section className="text-center space-y-6 animate-fade-in-up animate-delay-100">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Advanced Geospatial Analytics Platform
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Upload your geospatial data for instant smart analysis, beautiful visualizations, 
                and professional reporting with AI-powered insights and recommendations.
              </p>
            </div>
          </section>

          {/* Enhanced File Upload */}
          <section className="animate-fade-in-up animate-delay-200">
            <FileUpload onDataLoad={handleDataLoad} />
          </section>

          {/* Main Dashboard Content */}
          {data.length > 0 && (
            <div className="space-y-12">
              {/* Smart Filtering & Analysis Section */}
              <section className="animate-fade-in-up animate-delay-300">
                <SmartFiltering 
                  data={data}
                  onFilteredData={setFilteredData}
                  onAnalysisResults={setAnalysisResults}
                />
              </section>

              {/* Smart Analytics Section */}
              <section className="animate-fade-in-up animate-delay-350">
                <SmartAnalytics 
                  data={filteredData} 
                  dataType={dataType}
                  onAnalyticsUpdate={handleAnalyticsUpdate}
                />
              </section>

              {/* Dynamic Chart Builder Section */}
              <section className="animate-fade-in-up animate-delay-400">
                <DynamicChartBuilder 
                  data={filteredData} 
                  dataType={dataType}
                />
              </section>

              {/* Advanced Visualizations Section */}
              <section className="animate-fade-in-up animate-delay-450">
                <AdvancedVisualizations 
                  data={filteredData} 
                  dataType={dataType}
                />
              </section>

              {/* Data Header Editor */}
              <section className="animate-fade-in-up animate-delay-500">
                <DataHeaderEditor 
                  data={filteredData} 
                  dataType={dataType} 
                  onDataUpdate={handleDataUpdate}
                />
              </section>

              {/* Enhanced Map Section */}
              <section className="animate-fade-in-up animate-delay-600" id="map-section" data-section="map">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                      🗺️
                    </div>
                    High-Performance Interactive Map
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Explore your geospatial data with clustering and fast OpenStreetMap rendering
                  </p>
                </div>
                <MapView data={filteredData} dataType={dataType} />
              </section>

              {/* Charts Section */}
              <section className="animate-fade-in-up animate-delay-700" data-section="charts">
                <DataCharts data={filteredData} dataType={dataType} />
              </section>

              {/* Attribute Table Section */}
              <section className="animate-fade-in-up animate-delay-800">
                <AttributeTable 
                  data={filteredData} 
                  dataType={dataType} 
                  onDataUpdate={handleDataUpdate}
                />
              </section>

              {/* PDF Export Section */}
              <section className="animate-fade-in-up animate-delay-900">
                <PDFExport data={filteredData} analysisData={analyticsData} />
              </section>
            </div>
          )}

          {/* Enhanced Getting Started Guide */}
          {data.length === 0 && (
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
