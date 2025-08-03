
import React, { useState } from 'react';
import { SignInForm } from '@/features/auth/SignInForm';
import { SignUpForm } from '@/features/auth/SignUpForm';
import { Card, CardContent } from '@/components/ui/card';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleMode = () => setIsSignUp(!isSignUp);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {isSignUp ? (
            <SignUpForm onToggleMode={toggleMode} />
          ) : (
            <SignInForm onToggleMode={toggleMode} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
