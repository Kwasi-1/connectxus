
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export function AppLayout({ children, showRightSidebar = true }: AppLayoutProps) {
  const location = useLocation();

  // Determine which pages should show the right sidebar
  const shouldShowRightSidebar = showRightSidebar && [
    '/', '/explore', '/notifications'
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background font-['Poppins']">
      <div className="flex max-w-7xl mx-auto">
        {/* Fixed Left Sidebar */}
        <div className="fixed left-0 top-0 h-screen w-72 hidden lg:block z-40">
          <Sidebar />
        </div>
        
        {/* Main Content Area with left margin to account for fixed sidebar */}
        <div className="flex-1 lg:ml-72">
          <div className="flex">
            {/* Page Content */}
            <main className={`flex-1 min-w-0 ${shouldShowRightSidebar ? 'xl:mr-96' : ''}`}>
              {children}
            </main>
            
            {/* Fixed Right Sidebar */}
            {shouldShowRightSidebar && (
              <div className="fixed right-0 top-0 h-screen w-96 hidden xl:block z-30 bg-background border-l border-border">
                <RightSidebar />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
