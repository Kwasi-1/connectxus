import React, { useState } from "react";
import { SignInForm } from "@/features/auth/SignInForm";
import { SignUpForm } from "@/features/auth/SignUpForm";
import { FooterLinks } from "./components/landing/FooterLinks";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/shared/Logo";
import logo from "@/assets/connect_small_logo_white.png";
import { ArrowLeft } from "lucide-react";

export const LandingPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleMode = () => setIsSignUp(!isSignUp);

  return (
    <div className="min-h-screen flex flex-col landing-fonts">
      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 p-7 min-h-screen">
        {/* Left Section - Gradient Background with Text */}
        <div className="hidden lg:flex relative overflow-hidden gradientbg rounded-md bg-image h-[calc(100vh-50px)]">
          {/* <div className="absolute inset-0 " /> */}
          <div className="relative z-10 flex flex-col justify-between p-6 w-full">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
                <img src={logo} alt="Logo"className="w-5 h-5" />
              </div>
              <span className="text-xl font-semibold">Campus Connect</span>
            </div>

            {/* Main Content */}
            <div className="">
              <p className="text-[#0000004d] font-[500] text-xl mb-2">
                The ultimate platform for university students.
              </p>
              <h1 className="text-[2.65rem] font-[500] leading-[1] text-gray-900 mb-2">
                Link with peers, find mentors, and collaborate on projects.
                Stay Connected.
              </h1>
            </div>
          </div>
        </div>

        {/* Right Section - Auth Form */}
        <div className="flex items-center justify-center p-6 lg:p-12 lg:px-6 bg-background h-full">
          <div className="w-full max-w-lg">
            {/* Back Button */}
            <button
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold mb-3">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp
                  ? "Join your university community today!"
                  : "Sign in to access your communities, projects, and connections."}
              </p>
            </div>

            {/* Form */}
            {isSignUp ? (
              <SignUpForm onToggleMode={toggleMode} />
            ) : (
              <SignInForm onToggleMode={toggleMode} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <FooterLinks />
    </div>
  );
};
