import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, Activity, Calendar, TrendingUp, MapPin, BarChart3, Database, Clock,
  Award, Target, Zap, Globe, FileText, ChartBar
} from 'lucide-react';
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

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStreakData = () => {
    // Mock streak data - in real app, calculate from activities
    return {
      current: 7,
      best: 15,
      thisWeek: 5
    };
  };

  if (!user || !profile) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="glass-card h-32 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-24 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const streakData = getStreakData();

  return (
    <div className="space-y-8">
      {/* Enhanced User Profile Header */}
      <Card className="card-gradient border-0 relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-primary/30 hover-glow">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-2xl">
                    {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-3xl mb-2">{profile.full_name || 'User'}</CardTitle>
                <CardDescription className="text-lg mb-3">{user.email}</CardDescription>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {format(new Date(profile.created_at), 'MMMM yyyy')}
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={signOut} variant="outline" size="sm" className="glass-button hover-lift">
              Sign Out
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Stats Grid with Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-enhanced hover-glow animate-fade-in-up animate-delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <User className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalSessions}</div>
            <Progress value={calculateProgress(stats.totalSessions, 50)} className="mb-2" />
            <p className="text-xs text-muted-foreground">Target: 50 sessions</p>
          </CardContent>
        </Card>

        <Card className="card-enhanced hover-glow animate-fade-in-up animate-delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.filesUploaded}</div>
            <Progress value={calculateProgress(stats.filesUploaded, 25)} className="mb-2" />
            <p className="text-xs text-muted-foreground">Target: 25 files</p>
          </CardContent>
        </Card>

        <Card className="card-enhanced hover-glow animate-fade-in-up animate-delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses Run</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.analysisRun}</div>
            <Progress value={calculateProgress(stats.analysisRun, 20)} className="mb-2" />
            <p className="text-xs text-muted-foreground">Target: 20 analyses</p>
          </CardContent>
        </Card>

        <Card className="card-enhanced hover-glow animate-fade-in-up animate-delay-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Streak</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">{streakData.current}</div>
            <Progress value={calculateProgress(streakData.current, streakData.best)} className="mb-2" />
            <p className="text-xs text-muted-foreground">Best: {streakData.best} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Achievement Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-gradient hover-lift animate-fade-in-left animate-delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Achievements
            </CardTitle>
            <CardDescription>Your geospatial analytics milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 glass-card rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Target className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">First Upload</p>
                    <p className="text-sm text-muted-foreground">Completed your first data upload</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  Unlocked
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 glass-card rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <Globe className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Data Explorer</p>
                    <p className="text-sm text-muted-foreground">Upload 10 different datasets</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {stats.filesUploaded}/10
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient hover-lift animate-fade-in-right animate-delay-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 3).map((activity, index) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 glass-card rounded-lg animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className={`p-2 rounded-lg ${
                      activity.activity_type === 'sign_in' ? 'bg-green-100 dark:bg-green-900' :
                      activity.activity_type === 'file_upload' ? 'bg-blue-100 dark:bg-blue-900' :
                      activity.activity_type === 'analysis_complete' ? 'bg-purple-100 dark:bg-purple-900' :
                      'bg-gray-100 dark:bg-gray-900'
                    }`}>
                      {activity.activity_type === 'sign_in' && <User className="h-4 w-4 text-green-600" />}
                      {activity.activity_type === 'file_upload' && <FileText className="h-4 w-4 text-blue-600" />}
                      {activity.activity_type === 'analysis_complete' && <ChartBar className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm capitalize">
                        {activity.activity_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
