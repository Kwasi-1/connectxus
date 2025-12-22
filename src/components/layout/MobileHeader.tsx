import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import Logo from "../shared/Logo";
import { useAuth } from "@/contexts/AuthContext";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const getFallbackInitials = () => {
    if (user?.full_name) {
      const names = user.full_name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return user.full_name.substring(0, 2).toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-background lg:hidden z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="rounded-full p-0 w-8 h-8"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar || undefined} alt={user?.full_name || user?.username || 'User'} />
                <AvatarFallback className="text-xs font-medium">
                  {getFallbackInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Logo className="h-10 w-auto rounded-lg" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
            className="rounded-full"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
