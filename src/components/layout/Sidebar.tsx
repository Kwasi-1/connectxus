import { Button } from "@/components/ui/button";
import { PostModal } from "@/components/post/PostModal";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { UserProfile } from "./UserProfile";
import Logo from "../shared/Logo";
import HomeIcon from "@/assets/icons/Home.svg?react";
import ExploreIcon from "@/assets/icons/ExploreIcon.svg?react";
import NotificationsIcon from "@/assets/icons/NotificationsIcon.svg?react";
import MessagesIcon from "@/assets/icons/Message.svg?react";
import GroupsIcon from "@/assets/icons/Category.svg?react";
import TutoringIcon from "@/assets/icons/TutoringIcon.svg?react";
import MentorsIcon from "@/assets/icons/MentorsIcon.svg?react";
import AccountIcon from "@/assets/icons/AccountIcon.svg?react";

const navigationItems = [
  { icon: HomeIcon, label: "Home", path: "/feed", id: "home" },
  { icon: ExploreIcon, label: "Explore", path: "/search", id: "explore" },
  {
    icon: NotificationsIcon,
    label: "Notifications",
    path: "/notifications",
    id: "notifications",
  },
  { icon: MessagesIcon, label: "Messages", path: "/messages", id: "messages" },
  { icon: GroupsIcon, label: "Groups", path: "/hub", id: "groups" },
  { icon: TutoringIcon, label: "Tutoring", path: "/tutoring", id: "tutoring" },
  { icon: MentorsIcon, label: "Mentors", path: "/mentors", id: "mentors" },
  { icon: AccountIcon, label: "Account", path: "/account", id: "account" },
];

interface SidebarProps {
  onCreatePost?: (content: string, audience: string) => void;
}

export function Sidebar({ onCreatePost }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handlePostClick = () => {
    setIsPostModalOpen(true);
  };

  const handleCreatePost = (content: string, audience: string) => {
    if (onCreatePost) {
      onCreatePost(content, audience);
    }
    setIsPostModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col h-full w-full p-6 pb-4 bg-background border-r border-border">
        <div className="flex items-center mb-4 mx-auto xl:mx-3">
          <Logo className="w-auto h-12 xl:h-14" />
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "w-fit xl:w-full justify-start text-left xl:ml-0 px-3 my-2 xl:my-0 xl:px-4 py-3 text-xl font-medium rounded-full flex items-center transition-colors",
                  "hover:bg-muted font-[300]",
                  isActive && "font-bold"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 text-3xl xl:h-[22px] xl:w-[22px] transtion duration-300",
                    isActive ? "fill-transparent scale-110" : "stroke-current"
                  )}
                />
                <span className="ml-4 hidden xl:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Button
          onClick={handlePostClick}
          className="mx-auto xl:mx-0 w-full xl:w-[90%] mb-4 bg-foreground hover:bg-foreground/90 text-background font-bold py-6 text-lg rounded-full"
        >
          <Icon icon="gridicons:create" className="h-6 w-6 block xl:hidden" />
          <span className="hidden xl:block ml-2">Post</span>
        </Button>

        <div>
          <UserProfile />
        </div>
      </div>

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPost={handleCreatePost}
      />
    </>
  );
}
