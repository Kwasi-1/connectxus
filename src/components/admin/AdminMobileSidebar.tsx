import { NavLink } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Shield,
  X,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";

interface AdminMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
    permission: "user_management" as const,
  },
  {
    name: "Content Management",
    href: "/admin/content",
    icon: FileText,
    permission: "content_management" as const,
  },
  {
    name: "Communities & Groups",
    href: "/admin/communities",
    icon: Users2,
    permission: "community_management" as const,
  },
  {
    name: "Tutoring & Mentorship",
    href: "/admin/tutoring",
    icon: GraduationCap,
    permission: "tutoring_management" as const,
  },
  {
    name: "Analytics & Reports",
    href: "/admin/analytics",
    icon: BarChart3,
    permission: "analytics" as const,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: FileBarChart,
    permission: "reports" as const,
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    permission: "notifications" as const,
  },
];

const superAdminItems = [
  {
    name: "Admin Management",
    href: "/admin/admins",
    icon: UserCog,
    permission: "admin_management" as const,
  },
  {
    name: "System Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "system_settings" as const,
  },
];

export function AdminMobileSidebar({
  isOpen,
  onClose,
}: AdminMobileSidebarProps) {
  const { hasPermission, hasRole } = useAdminAuth();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const filteredSuperAdminItems = superAdminItems.filter(
    (item) => hasRole("super_admin") && hasPermission(item.permission)
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full max-w-72 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="flex flex-row items-center justify-between p-6 border-b border-border">
            <div className="flex items-center">
              <Logo className="h-8 w-auto mr-3" />
              <div className="flex flex-col">
                <SheetTitle className="text-lg font-semibold text-foreground custom-font">
                  Connect
                </SheetTitle>
                <span className="text-xs text-muted-foreground">
                  Admin Portal
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto py-6">
            <div className="px-3 space-y-1">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </div>

            {filteredSuperAdminItems.length > 0 && (
              <>
                <div className="px-6 mt-8 mb-3">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-campus-orange" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Super Admin
                    </h3>
                  </div>
                </div>
                <div className="px-3 space-y-1">
                  {filteredSuperAdminItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                          isActive
                            ? "bg-campus-orange text-white"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
