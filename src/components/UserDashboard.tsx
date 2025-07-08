import React from 'react';
import { useUserDashboard } from '@/hooks/useUserDashboard';
import UserProfileHeader from '@/components/dashboard/UserProfileHeader';
import StatsGrid from '@/components/dashboard/StatsGrid';
import AchievementsSection from '@/components/dashboard/AchievementsSection';
import RecentActivity from '@/components/dashboard/RecentActivity';

const UserDashboard = () => {
  const { user, profile, activities, stats, signOut } = useUserDashboard();

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

  return (
    <div className="space-y-8">
      <UserProfileHeader user={user} profile={profile} onSignOut={signOut} />
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AchievementsSection filesUploaded={stats.filesUploaded} />
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
};

export default UserDashboard;
