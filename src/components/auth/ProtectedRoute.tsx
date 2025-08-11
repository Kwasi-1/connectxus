
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginDialog } from '@/components/auth/LoginDialog';
import logo from '@/assets/logo.png';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse rounded-full h-32 w-32 ">
          <img
            src={logo}
            alt="Loading..."
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
          <div className="text-center space-y-6 p-8">
            <div className="w-16 h-16 bg-foreground rounded-xl flex items-center justify-center mx-auto">
              <span className="text-background font-bold text-xl">CV</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">Welcome to Campus Vibe</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Connect with your university community. Please log in to access this page and explore all features.
              </p>
              <button
                onClick={() => setShowLoginDialog(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Login to Continue
              </button>
            </div>
          </div>
        </div>
        <LoginDialog 
          open={showLoginDialog} 
          onOpenChange={setShowLoginDialog}
        />
      </>
    );
  }

  return <>{children}</>;
};
