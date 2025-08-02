
import { Home, Search, Bell, Mail, Users, BookOpen, GraduationCap, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full max-w-80 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-sm">CV</span>
              </div>
              <SheetTitle className="font-bold text-xl text-foreground">Campus Vibe</SheetTitle>
            </div>
          </SheetHeader>

          <nav className="flex-1 p-6 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full justify-start text-left px-4 py-3 text-lg font-[300] rounded-full transition-colors",
                    "hover:bg-muted",
                    isActive && "font-bold"
                  )}
                >
                  <Icon className="mr-4 h-6 w-6" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <div className="p-6 border-t border-border">
            <Button className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold py-7 text-lg rounded-full">
              Post
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
