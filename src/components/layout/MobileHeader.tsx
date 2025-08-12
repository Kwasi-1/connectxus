
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import Logo from '../shared/Logo';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-background lg:hidden z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Profile Avatar */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="rounded-full p-0 w-8 h-8"
            >
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">U</span>
              </div>
            </Button>
          </div>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            {/* <img src={logo} alt="Campus Vibe Logo" className="h-12 w-auto rounded-lg" /> */}
            <Logo className="h-11 w-auto rounded-lg" />
          </div>

          {/* Search Button */}
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

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
