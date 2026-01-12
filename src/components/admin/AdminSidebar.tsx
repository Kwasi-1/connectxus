import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useTheme } from "@/lib/theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
  Activity,
  DollarSign,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import Logo from "@/components/shared/Logo";

interface SubItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  permission: any | null;
  subItems?: SubItem[];
}

const navItems: NavItem[] = [
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
    name: "Communities & Groups",
    href: "/admin/communities",
    icon: Users2,
    permission: "community_management" as const,
  },
  {
    name: "Tutoring",
    href: "/admin/tutoring",
    icon: GraduationCap,
    permission: "tutoring_management" as const,
  },
  {
    name: "Tutoring Business",
    href: "/admin/tutoring-business",
    icon: DollarSign,
    permission: "tutoring_management" as const,
    subItems: [
      { name: "Overview", href: "/admin/tutoring-business" },
      { name: "Transactions", href: "/admin/tutoring-business/transactions" },
      { name: "Payouts", href: "/admin/tutoring-business/payouts" },
      { name: "Disputes & Refunds", href: "/admin/tutoring-business/disputes" },
      { name: "Analytics", href: "/admin/tutoring-business/analytics" },
    ],
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    permission: null,
  },
  {
    name: "Space Activities",
    href: "/admin/activities",
    icon: Activity,
    permission: null,
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

export function AdminSidebar() {
  const { hasPermission, hasRole, admin, signOut } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const filteredSuperAdminItems = superAdminItems.filter(
    (item) => hasRole("super_admin") && hasPermission(item.permission)
  );

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-24 xl:w-64 bg-card border-r border-border">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center xl:justify-start h-16 px-6 borderb border-border">
          <Logo className="h-8 w-auto" />
          <div className="flex-col ml-3 hidden xl:flex">
            <span className="text-lg font-semibold text-foreground custom-font">
              Connect
            </span>
            <span className="text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide py-6">
          <div className="px-3 space-y-3 xl:space-y-1">
            {filteredNavItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.name);
              const isItemActive = isActive(item.href);

              return (
                <div key={item.name}>
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={cn(
                          "flex items-center justify-center xl:justify-between px-3 py-2 text-sm font-medium rounded transition-colors w-fit xl:w-full mx-auto",
                          isItemActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5" />
                          <span className="ml-3 hidden xl:block">
                            {item.name}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 hidden xl:block" />
                        ) : (
                          <ChevronRight className="h-4 w-4 hidden xl:block" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="mt-1 ml-8 space-y-1 hidden xl:block">
                          {item.subItems.map((subItem) => (
                            <NavLink
                              key={subItem.href}
                              to={subItem.href}
                              className={cn(
                                "flex items-center px-3 py-1.5 text-sm rounded transition-colors",
                                location.pathname === subItem.href
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )}
                            >
                              {subItem.name}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={cn(
                        "flex items-center justify-center xl:justify-start px-3 py-2 text-sm font-medium rounded transition-colors w-fit xl:w-full mx-auto",
                        isItemActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="ml-3 hidden xl:block">{item.name}</span>
                    </NavLink>
                  )}
                </div>
              );
            })}
          </div>

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

        {/* User Profile Section - Fixed at Bottom */}
        <div className="mt-auto border mx-3 mb-3 py-1 rounded-md border-border p-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors w-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={admin?.avatar} alt={admin?.name} />
                  <AvatarFallback className="bg-campus-orange text-white">
                    {admin?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden xl:block flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">
                      {admin?.name}
                    </p>
                    {hasRole("super_admin") && (
                      <Shield className="h-3 w-3 text-campus-orange flex-shrink-0" />
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs mt-1 h-5">
                    {admin?.role === "super_admin" ? "Super Admin" : "Admin"}
                  </Badge>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="top">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium leading-none">
                      {admin?.name}
                    </p>
                    {hasRole("super_admin") && (
                      <Shield className="h-3 w-3 text-campus-orange" />
                    )}
                  </div>
                  <p className="text-xs leading-none text-muted-foreground pb-2">
                    {admin?.email}
                  </p>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {admin?.role === "super_admin" ? "Super Admin" : "Admin"}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              </DropdownMenuItem>
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
