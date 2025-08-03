
// import { Home, User, Users, BookOpen, GraduationCap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

const navigationItems = [
  { icon: 'hugeicons:home-04', label: 'Home', path: '/', id: 'home' },
  { icon: 'uil:users-alt', label: 'Groups', path: '/groups', id: 'groups' },
  { icon: 'hugeicons:book-open-01', label: 'Tutoring', path: '/tutoring', id: 'tutoring' },
  { icon: 'ph:graduation-cap', label: 'Mentors', path: '/mentors', id: 'mentors' },
  { icon: 'line-md:account', label: 'Account', path: '/account', id: 'account' },
];

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 lg:hidden z-50">
      <nav className="flex justify-around items-center py-2">
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                "hover:bg-muted",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon icon={item.icon} className={cn("h-6 w-6 sm:h-[1.35rem] sm:w-[1.35rem] mb-1", isActive && "stroke-2")} />
              <span className={cn("text-xs hidden sm:block truncate", isActive && "font-semibold")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
