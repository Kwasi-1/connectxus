
import { Home, Search, Bell, Mail, Users, BookOpen, GraduationCap, User, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  activeTab?: string;
}

const navigationItems = [
  { icon: Home, label: 'Home', path: '/', id: 'home' },
  { icon: Search, label: 'Explore', path: '/explore', id: 'explore' },
  { icon: Bell, label: 'Notifications', path: '/notifications', id: 'notifications' },
  { icon: Mail, label: 'Messages', path: '/messages', id: 'messages' },
  { icon: Users, label: 'Groups', path: '/groups', id: 'groups' },
  { icon: BookOpen, label: 'Tutoring', path: '/tutoring', id: 'tutoring' },
  { icon: GraduationCap, label: 'Mentors', path: '/mentors', id: 'mentors' },
  { icon: User, label: 'Profile', path: '/profile', id: 'profile' },
];

export function Sidebar({ activeTab }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActiveRoute = (path: string, id: string) => {
    if (activeTab) {
      return activeTab === id;
    }
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-background border-r border-border">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">CV</span>
        </div>
        <span className="font-bold text-xl text-foreground">Campus Vibe</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path, item.id);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full justify-start text-left px-4 py-3 text-lg font-normal rounded-full hover:bg-muted transition-colors",
                isActive && "font-bold"
              )}
            >
              <Icon className="mr-4 h-6 w-6" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Post Button */}
      <Button className="w-full mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 text-lg rounded-full">
        Post
      </Button>

      {/* Bottom Section */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="flex-1 justify-start rounded-full p-3">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
