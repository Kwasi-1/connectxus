import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/shared/Logo';
import {
  Home,
  Search,
  Compass,
  Bell,
  MessageCircle,
  Users,
  GraduationCap,
  User,
  BookOpen,
  Settings,
  LogOut,
  PlusCircle
} from 'lucide-react';

interface SidebarProps {
  onCreatePost?: (content: string, audience: string) => void;
}

export function Sidebar({ onCreatePost }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showComposer, setShowComposer] = useState(false);

  const handleSignOut = () => {
    signOut();
  };

  const handleCreatePostClick = () => {
    navigate('/compose');
  };

  const mainNavItems = [
    { icon: Home, label: 'Home', href: '/feed' }, // Changed from '/' to '/feed'
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: MessageCircle, label: 'Messages', href: '/messages' },
    { icon: Users, label: 'Hub', href: '/hub' },
    { icon: GraduationCap, label: 'Tutoring', href: '/tutoring' },
    { icon: BookOpen, label: 'Mentors', href: '/mentors' },
    { icon: User, label: 'Profile', href: `/profile/${user?.id}` },
  ];

  const bottomNavItems = [
    { icon: Settings, label: 'Settings', href: '/account' },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-background border-r border-border">
      {/* Logo */}
      <div className="p-4 xl:p-6">
        <Link to="/feed" className="flex items-center space-x-2"> {/* Changed from '/' to '/feed' */}
          <Logo className="w-8 h-8 xl:w-10 xl:h-10" />
          <span className="hidden xl:block text-xl font-bold text-foreground">Campus Vibe</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 xl:px-4">
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors hover:bg-muted group ${
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-foreground' : 'group-hover:text-foreground'}`} />
                  <span className="hidden xl:block font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Create Post Button */}
        <div className="mt-6">
          <Button
            onClick={handleCreatePostClick}
            className="w-full xl:w-full bg-foreground hover:bg-foreground/90 text-background font-semibold py-3"
          >
            <PlusCircle className="h-5 w-5 xl:mr-2" />
            <span className="hidden xl:block">Create</span>
          </Button>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-2 xl:px-4 py-4 border-t border-border">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors hover:bg-muted group ${
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-foreground' : 'group-hover:text-foreground'}`} />
                  <span className="hidden xl:block font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* User Profile */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="hidden xl:block flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start mt-2 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4 xl:mr-2" />
            <span className="hidden xl:block">Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
