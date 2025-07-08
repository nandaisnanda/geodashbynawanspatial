import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Target, Globe } from 'lucide-react';

interface AchievementsSectionProps {
  filesUploaded: number;
}

const AchievementsSection = ({ filesUploaded }: AchievementsSectionProps) => {
  return (
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
              {filesUploaded}/10
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementsSection;