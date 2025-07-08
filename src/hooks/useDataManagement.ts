import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { initializeAuth } from '@/lib/firebase';

export const useDataManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [dataType, setDataType] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, []);

  const trackActivity = useCallback(async (activityType: string, metadata?: any) => {
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
  }, [user]);

  const handleDataLoad = useCallback(async (newData: any[], type: string) => {
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
  }, [trackActivity]);

  const handleDataUpdate = useCallback((updatedData: any[]) => {
    setData(updatedData);
    console.log('Data updated:', updatedData.length, 'records');
    toast.success('Data updated successfully!');
  }, []);

  const handleAnalyticsUpdate = useCallback(async (analytics: any) => {
    setAnalyticsData(analytics);
    
    // Track analysis completion
    await trackActivity('analysis_complete', {
      analysis_type: 'smart_analytics',
      insights_count: analytics?.insights?.length || 0,
      timestamp: new Date().toISOString()
    });
  }, [trackActivity]);

  return {
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
  };
};