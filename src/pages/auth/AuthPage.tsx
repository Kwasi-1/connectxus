
import React, { useState } from 'react';
import { SignInForm } from '@/features/auth/SignInForm';
import { SignUpForm } from '@/features/auth/SignUpForm';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/shared/Logo';

interface AuthPageProps {
  initialMode?: 'signIn' | 'signUp';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'signIn' }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signUp');

  const toggleMode = () => setIsSignUp((prev) => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className={`w-full ${isSignUp ? 'max-w-xl' : 'max-w-lg'}`}>
        <div className="text-center mb-8 custom-font">
          <div className="hidden w-12 h-12 bg-foreground rounded-xl fle items-center justify-center mx-auto mb-4">
            <span className="text-background font-bold text-lg">CV</span>
          </div>
          <Logo className="w-auto mx-auto h-16 block"/>
        </div>
        
        <Card className="border border-border/40 shadow-lg customfonts rounded-none">
          <CardContent className="p-8">
            {isSignUp ? (
              <SignUpForm onToggleMode={toggleMode} />
            ) : (
              <div>
                <div className="space-y-2 text-center mb-4 lg:mb-6">
                  <h2 className="text-3xl font-bold">Welcome Back</h2>
                  <p className="text-muted-foreground">Sign in to your Campus Vibe account</p>
                </div>
                <SignInForm onToggleMode={toggleMode} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
