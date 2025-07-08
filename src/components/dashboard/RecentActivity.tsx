import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, User, FileText, ChartBar } from 'lucide-react';
import { format } from 'date-fns';

interface UserActivity {
  id: string;
  activity_type: string;
  metadata: any;
  created_at: string;
}

interface RecentActivityProps {
  activities: UserActivity[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sign_in': return <User className="h-4 w-4 text-green-600" />;
      case 'file_upload': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'analysis_complete': return <ChartBar className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBackground = (type: string) => {
    switch (type) {
      case 'sign_in': return 'bg-green-100 dark:bg-green-900';
      case 'file_upload': return 'bg-blue-100 dark:bg-blue-900';
      case 'analysis_complete': return 'bg-purple-100 dark:bg-purple-900';
      default: return 'bg-gray-100 dark:bg-gray-900';
    }
  };

  return (
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
              <div 
                key={activity.id} 
                className="flex items-center gap-3 p-3 glass-card rounded-lg animate-slide-up" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-2 rounded-lg ${getActivityBackground(activity.activity_type)}`}>
                  {getActivityIcon(activity.activity_type)}
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
  );
};

export default RecentActivity;