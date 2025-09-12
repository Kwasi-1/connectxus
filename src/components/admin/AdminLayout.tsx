import { ReactNode, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminMobileSidebar } from './AdminMobileSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleMobileMenuClick = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <AdminMobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleMobileSidebarClose}
      />

      {/* Main Container */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 min-h-screen">
          {/* Header */}
          <AdminHeader onMenuClick={handleMobileMenuClick} />
          
          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}