
import React from 'react';
import { PublicHero } from '@/components/public/PublicHero';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Cookie, Settings, BarChart3, Shield, Trash2, RefreshCw } from 'lucide-react';

const Cookies: React.FC = () => {
  const cookieTypes = [
    {
      icon: Shield,
      title: 'Essential Cookies',
      description: 'Required for basic site functionality, security, and user authentication.',
      examples: ['Login sessions', 'Security tokens', 'Form submissions', 'Load balancing'],
      canDisable: false
    },
    {
      icon: Settings,
      title: 'Functional Cookies',
      description: 'Remember your preferences and settings to improve your experience.',
      examples: ['Language preferences', 'Theme selection', 'Notification settings', 'Layout preferences'],
      canDisable: true
    },
    {
      icon: BarChart3,
      title: 'Analytics Cookies',
      description: 'Help us understand how you use the platform to improve our services.',
      examples: ['Page views', 'Feature usage', 'Performance metrics', 'Error tracking'],
      canDisable: true
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHero 
        title="Cookies Policy" 
        subtitle="Learn how we use cookies to provide and improve our services."
        // backgroundVariant="minimal"
        size="medium"
        heroContent={
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4 custom-font">Cookies Policy</h2>
            <p className="text-muted-foreground mb-2">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              This policy explains how Campus Connect uses cookies and similar technologies to provide, improve, and protect our services.
            </p>
          </div>
        }
      />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">          

          {/* What are Cookies */}
          <div className="bg-card border border-border/40 rounded-xl p-8 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">What are Cookies?</h3>
            </div>
            
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cookies are small text files that are stored on your device when you visit our website. They help us remember your preferences, keep you signed in, and understand how you use our platform to provide you with a better experience.
            </p>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Good to know:</strong> Campus Connect only uses cookies that are necessary for our educational platform to function properly and to improve your academic networking experience.
              </p>
            </div>
          </div>

          {/* Types of Cookies */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center custom-font">Types of Cookies We Use</h3>
            <div className="space-y-6">
              {cookieTypes.map((type, index) => (
                <div key={index} className="bg-card border border-border/40 rounded-xl p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <type.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-foreground">{type.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          type.canDisable 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        }`}>
                          {type.canDisable ? 'Optional' : 'Required'}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-4">{type.description}</p>
                      <div>
                        <h5 className="text-sm font-semibold text-foreground mb-2">Examples:</h5>
                        <div className="flex flex-wrap gap-2">
                          {type.examples.map((example, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Managing Cookies */}
          <div className="bg-card border border-border/40 rounded-xl p-8 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Managing Your Cookie Preferences</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Browser Settings</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  You can control cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-center space-x-2">
                    <Trash2 className="w-4 h-4 text-primary" />
                    <span>Delete existing cookies</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Block all cookies (may affect site functionality)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span>Set preferences for specific websites</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Important Note</h5>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  Disabling essential cookies may prevent you from using certain features of Campus Connect, including logging in and accessing your account.
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Services */}
          <div className="bg-card border border-border/40 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Third-Party Services</h3>
            <p className="text-muted-foreground mb-4">
              Campus Connect may use trusted third-party services that also use cookies:
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Analytics:</strong> To understand platform usage and improve user experience</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Security:</strong> To protect against fraud and maintain platform security</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Performance:</strong> To ensure fast loading and optimal functionality</span>
              </div>
            </div>
          </div>

          {/* Updates to Policy */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-border/40 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Updates to This Policy</h3>
            <p className="text-muted-foreground mb-4">
              We may update this Cookies Policy from time to time. We'll notify you of any material changes through the platform or via email.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Questions about cookies? Contact us at: privacy@campusconnect.edu</p>
              <p>Or visit our <a href="/contact" className="text-primary hover:underline">Contact page</a></p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Cookies;
