import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserActivity {
  id: string;
  activity_type: string;
  metadata: any;
  created_at: string;
}

interface UserStats {
  totalSessions: number;
  filesUploaded: number;
  analysisRun: number;
  lastActivity: string | null;
}

export const useUserDashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalSessions: 0,
    filesUploaded: 0,
    analysisRun: 0,
    lastActivity: null
  });

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  }, [user]);

  const fetchUserActivities = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setActivities(data);
      
      // Calculate stats
      const signInCount = data.filter(a => a.activity_type === 'sign_in').length;
      const fileUploadCount = data.filter(a => a.activity_type === 'file_upload').length;
      const analysisCount = data.filter(a => a.activity_type === 'analysis_complete').length;
      const lastActivity = data.length > 0 ? data[0].created_at : null;

      setStats({
        totalSessions: signInCount,
        filesUploaded: fileUploadCount,
        analysisRun: analysisCount,
        lastActivity
      });
    }
  }, [user]);

  const trackActivity = useCallback(async (activityType: string, metadata?: any) => {
    if (!user) return;

    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        metadata: metadata || {}
      });
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserActivities();
      trackActivity('dashboard_view');
    }
  }, [user, fetchUserProfile, fetchUserActivities, trackActivity]);

  return {
    user,
    profile,
    activities,
    stats,
    signOut
  };
};