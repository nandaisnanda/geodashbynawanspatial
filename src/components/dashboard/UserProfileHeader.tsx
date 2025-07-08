import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProfileHeaderProps {
  user: User;
  profile: UserProfile;
  onSignOut: () => void;
}

const UserProfileHeader = ({ user, profile, onSignOut }: UserProfileHeaderProps) => {
  return (
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
          <Button onClick={onSignOut} variant="outline" size="sm" className="glass-button hover-lift">
            Sign Out
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default UserProfileHeader;