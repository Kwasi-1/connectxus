import {
  Home,
  Search,
  Bell,
  Mail,
  Users,
  BookOpen,
  HandHeart,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { UserProfile } from "./UserProfile";
import {
  IconlyHome2,
  IconlySearch,
  IconlyNotification,
  IconlyMessage,
  IconlyCategory,
} from "@/assets/icons/IconSet";
import TutoringIcon from "@/assets/icons/Tutoring.svg?react";
import HelpIcon from "@/assets/icons/Help.svg?react";
import AccountIcon from "@/assets/icons/AccountIcon.svg?react";
import { navigationItems } from "./Sidebar";


const navItems = navigationItems;

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
          <SheetHeader className="p-6 borderb border-border custom-font">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-sm">CV</span>
              </div>
              <SheetTitle className="font-semibold text-xl text-foreground">
                Campus Vibe
              </SheetTitle>
            </div>
          </SheetHeader>

          <nav className="flex-1 p-6 space-y-1 md:space-y-4 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    "w-fit xl:w-full justify-start text-left xl:ml-0 px-3 my-2 xl:my-0 xl:px-4 py-3 text-xl font-medium rounded-full flex items-center transition-colors",
                    "hover:bg-muted font-[300] gap-4",
                    isActive && "font-bold"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 text-3xl xl:h-[22px] xl:w-[22px] transtion duration-300",
                      isActive ? "fill-transparent scale-110" : "stroke-current"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-6 mb-4 space-y-4">
            <Button className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold py-7 text-lg rounded-full">
              Post
            </Button>
          </div>

          <div className="p-6 pt-2 space-y-4 border-t border-border">
            <UserProfile />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
