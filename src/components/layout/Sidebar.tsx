
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
  { icon: User, label: 'Account', path: '/account', id: 'account' },
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
    <div className="flex flex-col h-full w-64 p-4 border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-8 px-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">CV</span>
        </div>
        <span className="font-bold text-xl text-sidebar-foreground">Campus Vibe</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path, item.id);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full justify-start text-left px-3 py-6 text-lg font-medium hover:bg-hover",
                isActive && "bg-primary/10 text-primary font-bold"
              )}
            >
              <Icon className="mr-4 h-6 w-6" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Post Button */}
      <Button className="w-full mb-4 bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3 text-lg rounded-full">
        Post
      </Button>

      {/* Bottom Section */}
      <div className="flex items-center justify-between pt-4 border-t border-sidebar-border">
        <Button variant="ghost" className="flex-1 justify-start">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
