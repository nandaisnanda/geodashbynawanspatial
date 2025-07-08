import React from 'react';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import UserDashboard from '@/components/UserDashboard';
import PageBackground from '@/components/layout/PageBackground';
import WelcomeSection from '@/components/sections/WelcomeSection';
import GettingStartedGuide from '@/components/sections/GettingStartedGuide';
import DashboardContent from '@/components/sections/DashboardContent';
import { useDataManagement } from '@/hooks/useDataManagement';

const Index = () => {
  const {
    data,
    dataType,
    analyticsData,
    filteredData,
    analysisResults,
    user,
    setFilteredData,
    setAnalysisResults,
    handleDataLoad,
    handleDataUpdate,
    handleAnalyticsUpdate
  } = useDataManagement();

  return (
    <div className="min-h-screen bg-background relative">
      <PageBackground />
      <Header />
      
      <main className="container mx-auto px-6 py-8 relative z-10">
        <div id="dashboard-content" className="space-y-12">
          {/* User Dashboard Section */}
          {user && (
            <section className="animate-fade-in-up">
              <UserDashboard />
            </section>
          )}

          <WelcomeSection />

          {/* Enhanced File Upload */}
          <section className="animate-fade-in-up animate-delay-200">
            <FileUpload onDataLoad={handleDataLoad} />
          </section>

          {/* Main Dashboard Content */}
          {data.length > 0 && (
            <DashboardContent
              data={data}
              filteredData={filteredData}
              dataType={dataType}
              analyticsData={analyticsData}
              analysisResults={analysisResults}
              onFilteredData={setFilteredData}
              onAnalysisResults={setAnalysisResults}
              onDataUpdate={handleDataUpdate}
              onAnalyticsUpdate={handleAnalyticsUpdate}
            />
          )}

          {/* Enhanced Getting Started Guide */}
          {data.length === 0 && <GettingStartedGuide />}
        </div>
      </main>
    </div>
  );
};

export default Index;
