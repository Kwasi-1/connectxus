
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b border-border lg:hidden z-50">
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
          <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center">
            <span className="text-background font-bold text-xs">CV</span>
          </div>
          <span className="font-bold text-lg text-foreground">Campus Vibe</span>
        </div>

        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="rounded-full"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
