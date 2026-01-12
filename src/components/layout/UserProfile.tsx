import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { User, Settings, LogOut, Palette, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/lib/theme";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
  collapsed?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  collapsed = false,
}) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  const handleManageAccount = () => {
    navigate("/account");
  };

  const handleSettings = () => {};

  const handleSignOut = () => {
    signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full justify-start p-3 h-auto hover:bg-muted -ml-3 ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          <div className="flex items-center space-x-2 w-full">
            {/* <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-10 xl:h-10 bg-foreground/50 rounded-sm flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-sm font-medium">
                {getInitials(user.name)}
              </span>
            </div> */}
            <Avatar className="w-10 h-10 lg:w-12 lg:h-12 xl:w-10 xl:h-10 rounded-sm">
              <AvatarImage
                src={user.avatar || undefined}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback className="text-sm bg-foreground/40 text-primary-foreground font-medium rounded-sm">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  @{user.email.split("@")[0]}
                </p>
              </div>
            )}
          </div>
          <MoreHorizontal className="h-5 w-5 block lg:hidden xl:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 sm:w-80 lg:w-60 bg-background border shadow-lg px-3 py-2"
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleManageAccount}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Manage Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          <Palette className="mr-2 h-4 w-4" />
          {theme === "light" ? "Dark" : "Light"} Theme
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
