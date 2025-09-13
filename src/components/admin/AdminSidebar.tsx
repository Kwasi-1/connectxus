import { NavLink, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Users2, 
  GraduationCap, 
  BarChart3, 
  Settings, 
  UserCog,
  FileBarChart,
  Bell,
  Shield
} from 'lucide-react';
import Logo from '@/components/shared/Logo';

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: null
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    permission: 'user_management' as const
  },
  {
    name: 'Content Management',
    href: '/admin/content',
    icon: FileText,
    permission: 'content_management' as const
  },
  {
    name: 'Communities & Groups',
    href: '/admin/communities',
    icon: Users2,
    permission: 'community_management' as const
  },
  {
    name: 'Tutoring & Mentorship',
    href: '/admin/tutoring',
    icon: GraduationCap,
    permission: 'tutoring_management' as const
  },
  {
    name: 'Analytics & Reports',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: 'analytics' as const
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileBarChart,
    permission: 'reports' as const
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    permission: 'notifications' as const
  }
];

const superAdminItems = [
  {
    name: 'Admin Management',
    href: '/admin/admins',
    icon: UserCog,
    permission: 'admin_management' as const
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'system_settings' as const
  }
];

export function AdminSidebar() {
  const { hasPermission, hasRole } = useAdminAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const filteredSuperAdminItems = superAdminItems.filter(item => 
    hasRole('super_admin') && hasPermission(item.permission)
  );

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-24 xl:w-64 bg-card border-r border-border">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center xl:justify-start h-16 px-6 border-b border-border">
          <Logo className="h-8 w-auto" />
          <div className="flex-col ml-3 hidden xl:flex">
            <span className="text-lg font-semibold text-foreground custom-font">Connect</span>
            <span className="text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="px-3 space-y-3 xl:space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center justify-center xl:justify-start px-3 py-2 text-sm font-medium rounded-lg transition-colors w-fit xl:w-full mx-auto",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-3 hidden xl:block">{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Super Admin Section */}
          {filteredSuperAdminItems.length > 0 && (
            <>
              <div className="px-6 mt-8 mb-3">
                <div className="flex items-center justify-center xl:justify-start">
                  <Shield className="h-4 w-4 mr-2 text-campus-orange" />
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Super Admin
                  </h3>
                </div>
              </div>
              <div className="px-3 space-y-3 xl:space-y-1">
                {filteredSuperAdminItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-fit xl:w-full mx-auto",
                      isActive(item.href)
                        ? "bg-campus-orange text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="ml-3 hidden xl:block">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}