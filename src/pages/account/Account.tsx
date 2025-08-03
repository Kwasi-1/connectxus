
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileHeader } from '@/components/account/ProfileHeader';
import { ProfileTabs } from '@/components/account/ProfileTabs';
import { mockUserProfile } from '@/data/mockData';
import { UserProfile } from '@/types/global';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';

const Account = () => {
  const [user, setUser] = useState<UserProfile>(mockUserProfile);

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  return (
    <AppLayout>
      <div className="border-x min-h-screen lg:border-x-0 pb-6">
        <div className='hidden px-2 py-4 sticky top-16 lg:top-0 bg-background z-50 md:flex items-center gap-2 border-b'>
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon icon="line-md:arrow-left" className="h-6 w-6" />
          </Button>
          {/* <Icon icon="line-md:arrow-left" className="h-5 w-5" /> */}
          <h1 className="text-xl font-semibold">{user.displayName}</h1>
        </div>
        <ProfileHeader user={user} onUserUpdate={handleUserUpdate} />
        <ProfileTabs user={user} />
      </div>
    </AppLayout>
  );
};

export default Account;
