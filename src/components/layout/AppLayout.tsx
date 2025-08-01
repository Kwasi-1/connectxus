
import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';
import { MobileSidebar } from './MobileSidebar';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export function AppLayout({ children, showRightSidebar = true }: AppLayoutProps) {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Determine which pages should show the right sidebar
  const shouldShowRightSidebar = showRightSidebar && [
    '/', '/explore', '/notifications'
  ].includes(location.pathname);
  
  const handleMobileMenuClick = () => {
    setIsMobileSidebarOpen(true);
  };
  
  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };
  
  // Special layout for messages page
  const isMessagesPage = location.pathname === '/messages';
  
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={handleMobileMenuClick} />
     
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleMobileSidebarClose}
      />
      
      {/* Main Container - Centered with max width constraint */}
      <div className="flex justify-center w-full min-h-screen">
        <div className={cn(
          "flex w-full",
          isMessagesPage ? "max-w-full" : "max-w-7xl"
        )}>
          {/* Left Sidebar - Positioned within container */}
          <div className="sticky top-0 h-screen w-72 hidden lg:block z-40 flex-shrink-0">
            <Sidebar />
          </div>
          
          {/* Main Content Area */}
          <div className={cn(
            "flex-1 min-w-0",
            isMessagesPage ? "max-w-none" : ""
          )}>
            <main className={cn(
              "w-full mx-auto pt-16 pb-16 lg:pt-0 lg:pb-0 border-none border-border",
              isMessagesPage ? "h-screen pt-0 pb-0 lg:pt-0 lg:pb-0" : ""
            )}>
              {children}
            </main>
          </div>
          
          {/* Right Sidebar - Positioned within container */}
          {shouldShowRightSidebar && !isMessagesPage && (
            <div className="sticky top-0 h-screen w-96 hidden xl:block z-30 bg-background border-l border-border flex-shrink-0">
              <RightSidebar />
            </div>
          )}
        </div>
      </div>
     
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
