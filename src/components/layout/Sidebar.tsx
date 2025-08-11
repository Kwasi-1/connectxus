
import { Home, Search, Bell, Mail, Users, BookOpen, GraduationCap, User, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostModal } from '@/components/post/PostModal';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { UserProfile } from './UserProfile';
import Logo from '../shared/Logo';

const navigationItems = [
  { icon: Home, label: 'Home', path: '/', id: 'home' },
  { icon: Search, label: 'Explore', path: '/search', id: 'explore' },
  { icon: Bell, label: 'Notifications', path: '/notifications', id: 'notifications' },
  { icon: Mail, label: 'Messages', path: '/messages', id: 'messages' },
  { icon: Users, label: 'Groups', path: '/hub', id: 'groups' },
  { icon: BookOpen, label: 'Tutoring', path: '/tutoring', id: 'tutoring' },
  { icon: GraduationCap, label: 'Mentors', path: '/mentors', id: 'mentors' },
  { icon: User, label: 'Account', path: '/account', id: 'account' },
];

interface SidebarProps {
  onCreatePost?: (content: string, audience: string) => void;
}

export function Sidebar({ onCreatePost }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handlePostClick = () => {
    setIsPostModalOpen(true);
  };

  const handleCreatePost = (content: string, audience: string) => {
    if (onCreatePost) {
      onCreatePost(content, audience);
    }
    setIsPostModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col h-full w-full p-6 pb-4 bg-background border-r border-border">
        {/* Logo */}
        <div className="flex items-center mb-4 mx-auto xl:mx-3">
          {/* <div className="w-8 h-8 bg-foreground rounded-full xl:rounded-lg flex items-center justify-center px-2">
            <span className="text-background font-bold text-sm">CV</span>
          </div>
          <span className="font-bold text-xl hidden xl:block text-foreground">Campus Vibe</span> */}
          <Logo className="w-auto h-14"/>
          {/* <img src={smallLogo} alt="Campus Vibe Logo" className="w-auto h-14 hidden xl:block" />
          <img src={smallLogo} alt="Campus Vibe Logo" className="w-auto h-12 xl:hidden block" /> */}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "w-fit xl:w-full justify-start text-left xl:ml-0 px-3 my-2 xl:my-0 xl:px-4 py-3 text-xl font-medium rounded-full flex items-center transition-colors",
                  "hover:bg-muted font-[300]",
                  isActive && "font-bold"
                )}
              >
                <Icon className="h-6 w-6 text-3xl xl:h-5 xl:w-5" />
                <span className="ml-4 hidden xl:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Post Button */}
        <Button 
          onClick={handlePostClick}
          className="mx-auto xl:mx-0 w-full xl:w-[90%] mb-4 bg-foreground hover:bg-foreground/90 text-background font-bold py-6 text-lg rounded-full"
        >
          <Icon icon="gridicons:create" className="h-6 w-6 block xl:hidden" />
          <span className="hidden xl:block ml-2">Post</span>
        </Button>

        {/* User Profile */}
        <div>
          <UserProfile />
        </div>
      </div>

      {/* Post Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPost={handleCreatePost}
      />
    </>
  );
}
