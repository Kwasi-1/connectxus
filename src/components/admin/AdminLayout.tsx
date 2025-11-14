import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminMobileSidebar } from "./AdminMobileSidebar";

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
      <AdminMobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleMobileSidebarClose}
      />

      <div className="flex">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        <div className="flex-1 lg:ml-24 xl:ml-64 min-h-screen">
          <AdminHeader onMenuClick={handleMobileMenuClick} />

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
