import React from 'react';
import SmartFiltering from '@/components/SmartFiltering';
import SmartAnalytics from '@/components/SmartAnalytics';
import DynamicChartBuilder from '@/components/DynamicChartBuilder';
import AdvancedVisualizations from '@/components/AdvancedVisualizations';
import DataHeaderEditor from '@/components/DataHeaderEditor';
import MapView from '@/components/MapView';
import DataCharts from '@/components/DataCharts';
import AttributeTable from '@/components/AttributeTable';
import PDFExport from '@/components/PDFExport';

interface DashboardContentProps {
  data: any[];
  filteredData: any[];
  dataType: string;
  analyticsData: any;
  analysisResults: any;
  onFilteredData: (data: any[]) => void;
  onAnalysisResults: (results: any) => void;
  onDataUpdate: (data: any[]) => void;
  onAnalyticsUpdate: (analytics: any) => void;
}

const DashboardContent = ({
  data,
  filteredData,
  dataType,
  analyticsData,
  analysisResults,
  onFilteredData,
  onAnalysisResults,
  onDataUpdate,
  onAnalyticsUpdate
}: DashboardContentProps) => {
  return (
    <div className="space-y-12">
      {/* Smart Filtering & Analysis Section */}
      <section className="animate-fade-in-up animate-delay-300">
        <SmartFiltering 
          data={data}
          onFilteredData={onFilteredData}
          onAnalysisResults={onAnalysisResults}
        />
      </section>

      {/* Smart Analytics Section */}
      <section className="animate-fade-in-up animate-delay-350">
        <SmartAnalytics 
          data={filteredData} 
          dataType={dataType}
          onAnalyticsUpdate={onAnalyticsUpdate}
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
          onDataUpdate={onDataUpdate}
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
          onDataUpdate={onDataUpdate}
        />
      </section>

      {/* PDF Export Section */}
      <section className="animate-fade-in-up animate-delay-900">
        <PDFExport data={filteredData} analysisData={analyticsData} />
      </section>
    </div>
  );
};

export default DashboardContent;