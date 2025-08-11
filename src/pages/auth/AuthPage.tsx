
import React, { useState } from 'react';
import { SignInForm } from '@/features/auth/SignInForm';
import { SignUpForm } from '@/features/auth/SignUpForm';
import { Card, CardContent } from '@/components/ui/card';
import smallLogo from '@/assets/connect_small_logo.png';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleMode = () => setIsSignUp(!isSignUp);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className={`w-full ${isSignUp ? 'max-w-xl' : 'max-w-lg'}`}>
        <div className="text-center mb-8 custom-font">
          <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-background font-bold text-lg">CV</span>
          </div>
          {/* <h1 className="text-2xl font-bold text-foreground mb-2">Campus Vibe</h1>
          <p className="text-muted-foreground">Connect with your university community</p> */}
          {/* <img src={smallLogo} alt="Campus Vibe Logo" className="w-auto mx-auto h-16 hidden xl:block" /> */}
        </div>
        
        <Card className="border border-border/40 shadow-lg customfonts rounded-none">
          <CardContent className="p-8">
            {isSignUp ? (
              <SignUpForm onToggleMode={toggleMode} />
            ) : (
              <SignInForm onToggleMode={toggleMode} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
