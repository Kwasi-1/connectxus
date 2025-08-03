
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
  onCreatePost?: (content: string, audience: string) => void;
}

export function AppLayout({ children, showRightSidebar = true, onCreatePost }: AppLayoutProps) {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Determine which pages should show the right sidebar
  const shouldShowRightSidebar = showRightSidebar;
  
  const handleMobileMenuClick = () => {
    setIsMobileSidebarOpen(true);
  };
  
  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-background md:px-10">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={handleMobileMenuClick} />
     
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleMobileSidebarClose}
      />
      
      {/* Main Container - Centered with max width constraint */}
      <div className="flex justify-center w-full min-h-screen">
        <div className="flex w-full max-w-7xl">
          {/* Left Sidebar - Positioned within container */}
          <div className="fixed top-0 h-screen w-24 xl:w-72 hidden xl:-ml-4 lg:block z-40">
            <Sidebar onCreatePost={onCreatePost} />
          </div>
          
          {/* Main Content Area */}
          <div className={`flex-1 min-w-0 lg:ml-[6rem] xl:ml-[17rem] ${!shouldShowRightSidebar ? 'xl:border-r border-border' : ''}`}>
            <main className="w-full  mx-auto pt-16 pb-16 lg:pt-0 lg:pb-0 border-none border-border">
              {children}
            </main>
          </div>
          
          {/* Right Sidebar - Positioned within container */}
          {shouldShowRightSidebar && (
            <div className="stick bottom-0 h-screen w-96 hidden lg:block z-30 bg-background border-l border-border">
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
