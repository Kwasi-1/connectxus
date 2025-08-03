
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { User, Settings, LogOut, Palette } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useNavigate } from 'react-router-dom';

interface UserProfileProps {
  collapsed?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ collapsed = false }) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  const handleManageAccount = () => {
    navigate('/account');
  };

  const handleSettings = () => {
    // You can create a settings page route later
    console.log('Settings clicked');
  };

  const handleSignOut = () => {
    signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full justify-start p-3 h-auto hover:bg-muted ${collapsed ? 'px-2' : 'px-3'}`}
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-sm font-medium">
                {getInitials(user.name)}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">@{user.email.split('@')[0]}</p>
              </div>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleManageAccount} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Manage Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          <Palette className="mr-2 h-4 w-4" />
          {theme === 'light' ? 'Dark' : 'Light'} Theme
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
