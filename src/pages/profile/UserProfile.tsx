
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileHeader } from '@/components/account/ProfileHeader';
import { ProfileTabs } from '@/components/account/ProfileTabs';
import { mockUserProfile } from '@/data/mockData';
import { UserProfile as UserProfileType } from '@/types/global';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data based on userId
    // In a real app, this would be an API call
    const fetchUserProfile = async () => {
      setIsLoading(true);
      // For now, using mock data
      setUser(mockUserProfile);
      setIsLoading(false);
    };

    fetchUserProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-x min-h-screen lg:border-x-0 pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="border-x min-h-screen lg:border-x-0 pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">User not found</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleUserUpdate = (updatedUser: UserProfileType) => {
    setUser(updatedUser);
  };

  return (
    <AppLayout>
      <div className="border-x min-h-screen lg:border-x-0 pb-6">
        <div className='hidden px-2 py-4 sticky top-16 lg:top-0 bg-background z-50 md:flex items-center gap-2 border-b'>
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon icon="line-md:arrow-left" className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">{user.displayName}</h1>
        </div>
        <ProfileHeader user={user} onUserUpdate={handleUserUpdate} isOwnProfile={false} />
        <ProfileTabs user={user} isOwnProfile={false} />
      </div>
    </AppLayout>
  );
};

export default UserProfile;
