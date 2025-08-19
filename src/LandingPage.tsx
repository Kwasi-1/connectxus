import React, { useState } from "react";
import { SignInForm } from "@/features/auth/SignInForm";
import { SignUpForm } from "@/features/auth/SignUpForm";
import { FooterLinks } from "./components/landing/FooterLinks";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/shared/Logo";

export const LandingPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleMode = () => setIsSignUp(!isSignUp);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p4">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center justify-center gap-8 lg:gap-16">
          {/* Left Section - Phone Mockups */}
          <div className="hidden lg:flex w-full justify-center items-center  h-[calc(100vh-7.8rem)] min-h-full">
            <div className="relative flex-1 pr-4 pb-4 h-full">
              {/* Phone mockup container */}
              <div className="w[100%] flex-1 max-wmd xl:maxw-lg h-full bg-black rounded-br-full p4 shadow-2xl relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-white/80 scale-110">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">CV</span>
                    </div>
                    <p className="text-sm">Campus Connect</p>
                    <p className="text-xs opacity-60">
                      Connect with your university
                    </p>
                  </div>
                </div>
              </div>

              {/* Second phone mockup (stacked behind) */}
              <div className="absolute -right-8 -top-4 w-80 h-96 bg-black/80 rounded-3xl p-4 shadow-xl -z-10">
                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl"></div>
              </div>
            </div>
          </div>

          {/* Right Section - Auth Form */}
          <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-4">
              <Logo className="w-auto h-12 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2 custom-font">
                Campus Connect
              </h1>
              <p className="text-muted-foreground text-sm">
                {isSignUp
                  ? "Join your university community"
                  : "Sign in to your account"}
              </p>
            </div>

            <Card className="border-none border-border/40 shadow-none">
              <CardContent className="p-6">
                {isSignUp ? (
                  <SignUpForm onToggleMode={toggleMode} />
                ) : (
                  <SignInForm onToggleMode={toggleMode} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <FooterLinks />
    </div>
  );
};
