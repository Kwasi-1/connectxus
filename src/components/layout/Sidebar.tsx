
import { Home, Search, Bell, Mail, Users, BookOpen, GraduationCap, User, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation, Link } from 'react-router-dom';

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

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-full w-full p-6 bg-background border-r border-border">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8 mx-3">
        <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
          <span className="text-background font-bold text-sm">CV</span>
        </div>
        <span className="font-bold text-xl text-foreground">Campus Vibe</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);
          
          return (
            <Link
              key={item.id}
              // variant="ghost"
              // onClick={() => handleNavigation(item.path)}
              to={item.path}
              className={cn(
                "w-full justify-start text-left px-4 py-3 text-xl font-medium rounded-full flex items-center transition-colors",
                "hover:bg-muted font-[300]",
                isActive && "font-bold"
              )}
            >
              <Icon className="mr-4 h-6 w-6 text-3xl" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Post Button */}
      <Button className="w-[90%] mb-4 bg-foreground hover:bg-foreground/90 text-background font-bold py-6 text-lg rounded-full">
        Post
      </Button>

      {/* Bottom Section */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
