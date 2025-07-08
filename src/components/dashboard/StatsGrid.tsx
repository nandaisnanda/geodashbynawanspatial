import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { User, Database, BarChart3, Zap } from 'lucide-react';

interface UserStats {
  totalSessions: number;
  filesUploaded: number;
  analysisRun: number;
  lastActivity: string | null;
}

interface StatsGridProps {
  stats: UserStats;
}

const StatsGrid = ({ stats }: StatsGridProps) => {
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

  const streakData = getStreakData();

  const statItems = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      target: 50,
      icon: User,
      color: 'green',
      delay: 'animate-delay-100'
    },
    {
      title: 'Files Uploaded',
      value: stats.filesUploaded,
      target: 25,
      icon: Database,
      color: 'blue',
      delay: 'animate-delay-200'
    },
    {
      title: 'Analyses Run',
      value: stats.analysisRun,
      target: 20,
      icon: BarChart3,
      color: 'purple',
      delay: 'animate-delay-300'
    },
    {
      title: 'Activity Streak',
      value: streakData.current,
      target: streakData.best,
      icon: Zap,
      color: 'orange',
      delay: 'animate-delay-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className={`card-enhanced hover-glow animate-fade-in-up ${item.delay}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <div className={`p-2 bg-${item.color}-100 dark:bg-${item.color}-900 rounded-lg`}>
                <Icon className={`h-4 w-4 text-${item.color}-600 dark:text-${item.color}-400`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold text-${item.color}-600 mb-2`}>{item.value}</div>
              <Progress value={calculateProgress(item.value, item.target)} className="mb-2" />
              <p className="text-xs text-muted-foreground">
                {item.title === 'Activity Streak' 
                  ? `Best: ${item.target} days`
                  : `Target: ${item.target} ${item.title.toLowerCase()}`}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsGrid;