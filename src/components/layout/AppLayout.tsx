
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { mockTrendingTopics, mockCampusHighlights } from '@/data/mockData';

interface AppLayoutProps {
  children: ReactNode;
  activeTab?: string;
  showRightSidebar?: boolean;
}

export function AppLayout({ children, activeTab, showRightSidebar = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto flex">
        {/* Fixed Left Sidebar */}
        <div className="fixed left-0 top-0 h-screen w-72 hidden lg:block">
          <div className="max-w-7xl mx-auto">
            <div className="w-72">
              <Sidebar activeTab={activeTab} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 lg:ml-72 lg:mr-96">
          <div className="max-w-2xl mx-auto border-x border-border min-h-screen">
            {children}
          </div>
        </div>

        {/* Fixed Right Sidebar */}
        {showRightSidebar && (
          <div className="fixed right-0 top-0 h-screen w-96 hidden xl:block">
            <div className="max-w-7xl mx-auto flex justify-end">
              <div className="w-96">
                <RightSidebar 
                  trendingTopics={mockTrendingTopics}
                  campusHighlights={mockCampusHighlights}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
