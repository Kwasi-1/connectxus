import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { MobileSidebar } from "./MobileSidebar";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
  onCreatePost?: (content: string, audience: string) => void;
}

export function AppLayout({
  children,
  showRightSidebar = true,
  onCreatePost,
}: AppLayoutProps) {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const shouldShowRightSidebar = showRightSidebar;

  const handleMobileMenuClick = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background md:px-10">
      <MobileHeader onMenuClick={handleMobileMenuClick} />

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleMobileSidebarClose}
      />

      <div className="flex justify-center w-full min-h-screen">
        <div className="flex w-full max-w-7xl">
          <div className="fixed top-0 h-screen w-24 xl:w-72 hidden xl:-ml-4 lg:block z-40">
            <Sidebar onCreatePost={onCreatePost} />
          </div>

          <div
            className={`flex-1 min-w-0 h-full lg:ml-[6rem] xl:ml-[17rem] ${
              !shouldShowRightSidebar ? "lg:border-r border-border" : ""
            }`}
          >
            <main className="w-full h-full mx-auto pt-16 pb-16 lg:pt-0 lg:pb-0 border-none border-border">
              {children}
            </main>
          </div>

          {shouldShowRightSidebar && (
            <div className="w-96 hidden lg:block z-30">
              <div className="sticky top-0 self-start bg-background borderl border-border">
                <RightSidebar />
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
