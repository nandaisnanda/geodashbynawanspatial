
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Activity, Calendar, TrendingUp, MapPin, BarChart3, Database, Clock } from 'lucide-react';
import { format } from 'date-fns';

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

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    filesUploaded: 0,
    analysisRun: 0,
    lastActivity: null as string | null
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserActivities();
      trackActivity('dashboard_view');
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const fetchUserActivities = async () => {
    if (!user) return;

    const { data, error } = await supabase
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
  };

  const trackActivity = async (activityType: string, metadata?: any) => {
    if (!user) return;

    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        metadata: metadata || {}
      });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sign_in': return <User className="h-4 w-4" />;
      case 'file_upload': return <Database className="h-4 w-4" />;
      case 'analysis_complete': return <BarChart3 className="h-4 w-4" />;
      case 'dashboard_view': return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sign_in': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'file_upload': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'analysis_complete': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'dashboard_view': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!user || !profile) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* User Profile Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 ring-4 ring-white dark:ring-gray-800">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.full_name || 'User'}</CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Member since {format(new Date(profile.created_at), 'MMMM yyyy')}
                </div>
              </div>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Login sessions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.filesUploaded}</div>
            <p className="text-xs text-muted-foreground">Data files processed</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses Run</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.analysisRun}</div>
            <p className="text-xs text-muted-foreground">Smart analyses completed</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-orange-600">
              {stats.lastActivity ? format(new Date(stats.lastActivity), 'MMM dd, HH:mm') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Most recent action</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest actions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type)}`}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {activity.activity_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {activity.activity_type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
