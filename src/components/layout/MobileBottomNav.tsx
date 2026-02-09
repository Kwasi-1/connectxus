import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import {
  IconlyHome2,
  IconlyMessage,
  IconlyCategory,
} from "@/assets/icons/IconSet";
import TutoringIcon from "@/assets/icons/Tutoring.svg?react";
import HelpIcon from "@/assets/icons/Help.svg?react";

const navigationItems = [
  { icon: IconlyHome2, label: "Home", path: "/feed", id: "home" },
  { icon: IconlyCategory, label: "Groups", path: "/hub", id: "groups" },
  { icon: TutoringIcon, label: "Tutoring", path: "/tutoring", id: "tutoring" },
  { icon: HelpIcon, label: "Campus Help", path: "/help", id: "help" },
  {
    icon: IconlyMessage,
    activeIcon: IconlyMessage,
    label: "Messages",
    path: "/messages",
    id: "messages",
  },
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
          const Icon = item.icon;

          const isActive = isActiveRoute(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                "hover:bg-muted",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              

              <Icon
                className={cn(
                  "h-6 w-6 sm:h-[1.35rem] sm:w-[1.35rem] mb-1 transtion duration-300",
                  isActive ? "fill-transparent scale-110" : "stroke-current"
                )}
              />
              <span
                className={cn(
                  "text-xs hidden sm:block truncate",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
