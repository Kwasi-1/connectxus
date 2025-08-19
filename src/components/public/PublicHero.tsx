
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, MessageCircle, Sparkles } from 'lucide-react';
import Logo from '@/components/shared/Logo';

interface PublicHeroProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showVisualElements?: boolean;
  className?: string;
  heroContent?: React.ReactNode;
  backgroundVariant?: 'default' | 'gradient' | 'minimal';
  size?: 'small' | 'medium' | 'large';
}

export const PublicHero: React.FC<PublicHeroProps> = ({ 
  title, 
  subtitle,
  showBackButton = true, 
  showVisualElements = false,
  className = "",
  heroContent,
  backgroundVariant = 'default',
  size = 'medium'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-12 lg:py-16';
      case 'large':
        return 'py-24 lg:py-40';
      default:
        return 'py-20 lg:py-32';
    }
  };

  const getBackgroundClasses = () => {
    switch (backgroundVariant) {
      case 'gradient':
        return 'bg-gradient-to-br from-background via-background to-accent/50';
      case 'minimal':
        return 'bg-background';
      default:
        return 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent via-accent/20 to-background';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Navigation Header */}
      <header className="border-b border-border/20 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className=" hidden md:flex items-center space-x-4">
              {showBackButton && (
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-200 p-2 rounded-full hover:bg-accent/50"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Back</span>
                </Link>
              )}
              <Logo className="w-auto h-8" />
            </div>
            
            <div className="flex-1 max-w-xl mx-4 lg:mx-8">
              <h1 className="text-lg lg:text-xl font-bold text-foreground custom-font truncate">
                {title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Link 
                to="/auth/signin" 
                className="hidden sm:inline-flex px-3 lg:px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Sign in
              </Link>
              <Link 
                to="/auth/signup" 
                className="inline-flex px-4 lg:px-6 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Join now
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      {(showVisualElements || heroContent) && (
        <div className={`relative ${getBackgroundClasses()} overflow-hidden`}>
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
            <div className="absolute top-40 right-40 w-48 h-48 bg-primary/5 rounded-full blur-2xl"></div>
          </div>

          <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${getSizeClasses()}`}>
            {heroContent ? (
              heroContent
            ) : (
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left Content */}
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 custom-font leading-tight">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
                      {subtitle}
                    </p>
                  )}
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                    <Link 
                      to="/auth/signup" 
                      className="inline-flex items-center justify-center px-8 py-4 bg-foreground text-background rounded-full text-lg font-semibold hover:bg-foreground/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Get started
                    </Link>
                    <Link 
                      to="/about" 
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground rounded-full text-lg font-semibold hover:bg-accent/50 transition-all duration-200"
                    >
                      Learn more
                    </Link>
                  </div>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-medium">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Connect</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-medium">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Learn</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-medium">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <span>Collaborate</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-medium">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Succeed</span>
                    </div>
                  </div>
                </div>

                {/* Right Visual */}
                <div className="relative hidden lg:block">
                  <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm border border-border/20">
                    <div className="space-y-6">
                      {/* Mock Interface Elements */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="h-3 bg-foreground/10 rounded-full mb-2"></div>
                          <div className="h-2 bg-foreground/5 rounded-full w-2/3"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="h-3 bg-foreground/10 rounded-full mb-2"></div>
                          <div className="h-2 bg-foreground/5 rounded-full w-3/4"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="h-3 bg-foreground/10 rounded-full mb-2"></div>
                          <div className="h-2 bg-foreground/5 rounded-full w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-2xl backdrop-blur-sm border border-border/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/20 rounded-xl backdrop-blur-sm border border-border/20"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
