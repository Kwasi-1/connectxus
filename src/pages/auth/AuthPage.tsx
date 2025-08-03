
import React, { useState } from 'react';
import { SignInForm } from '@/features/auth/SignInForm';
import { SignUpForm } from '@/features/auth/SignUpForm';
import { Card, CardContent } from '@/components/ui/card';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleMode = () => setIsSignUp(!isSignUp);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-background font-bold text-lg">CV</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Campus Vibe</h1>
          <p className="text-muted-foreground">Connect with your university community</p>
        </div>
        
        <Card className="border-0 shadow-lg">
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
