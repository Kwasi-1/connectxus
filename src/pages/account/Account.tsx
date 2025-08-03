
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileHeader } from '@/components/account/ProfileHeader';
import { ProfileTabs } from '@/components/account/ProfileTabs';
import { mockUserProfile } from '@/data/mockData';
import { UserProfile } from '@/types/global';

const Account = () => {
  const [user, setUser] = useState<UserProfile>(mockUserProfile);

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="">
        <ProfileHeader user={user} onUserUpdate={handleUserUpdate} />
        <ProfileTabs user={user} />
      </div>
    </AppLayout>
  );
};

export default Account;
