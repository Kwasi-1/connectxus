
import React from 'react';
import { PublicHero } from '@/components/public/PublicHero';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Smartphone, Monitor, QrCode, Apple, Play, Download as DownloadIcon, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Download: React.FC = () => {
  const platforms = [
    {
      icon: Smartphone,
      title: 'Mobile Apps',
      description: 'Stay connected on the go with our native mobile applications.',
      features: ['Push notifications', 'Offline reading', 'Camera integration', 'Native performance'],
      downloads: [
        { platform: 'iOS', icon: Apple, url: '#', version: 'iOS 14.0+' },
        { platform: 'Android', icon: Play, url: '#', version: 'Android 8.0+' }
      ]
    },
    {
      icon: Monitor,
      title: 'Desktop Apps',
      description: 'Get the full experience with dedicated desktop applications.',
      features: ['Multi-window support', 'Keyboard shortcuts', 'System notifications', 'Full-screen mode'],
      downloads: [
        { platform: 'Windows', icon: DownloadIcon, url: '#', version: 'Windows 10+' },
        { platform: 'macOS', icon: DownloadIcon, url: '#', version: 'macOS 11+' }
      ]
    }
  ];

  const features = [
    {
      icon: Star,
      title: 'Push Notifications',
      description: 'Never miss important updates from your university community'
    },
    {
      icon: DownloadIcon,
      title: 'Offline Access',
      description: 'Read saved posts and messages even without internet connection'
    },
    {
      icon: Smartphone,
      title: 'Better Performance',
      description: 'Faster loading times and smoother animations'
    },
    {
      icon: Monitor,
      title: 'Native Integration',
      description: 'Camera access, file sharing, and system-level features'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHero 
        title="Download Campus Connect" 
        subtitle="Take your campus community everywhere with our native apps for all devices."
        showVisualElements={true}
        backgroundVariant="gradient"
        size="medium"
        heroContent={
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 custom-font">
              Take Your Campus Community 
              <span className="block text-primary">Everywhere</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Download Campus Connect for the best experience on all your devices. Available on mobile and desktop platforms.
            </p>
            
            {/* Download Stats */}
            <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground mb-8">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.8/5 Rating</span>
              </div>
              <div>50K+ Downloads</div>
              <div>200+ Universities</div>
            </div>

            {/* Quick Download Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="space-x-2">
                <Apple className="w-5 h-5" />
                <span>Download for iOS</span>
              </Button>
              <Button variant="outline" size="lg" className="space-x-2">
                <Play className="w-5 h-5" />
                <span>Download for Android</span>
              </Button>
            </div>
          </div>
        }
      />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Platform Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {platforms.map((platform, index) => (
              <Card key={index} className="border-border/40 overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                      <platform.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{platform.title}</h3>
                      <p className="text-muted-foreground text-sm">{platform.description}</p>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {platform.features.map((feature, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-muted-foreground text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Download Buttons */}
                  <div className="space-y-3">
                    {platform.downloads.map((download, i) => (
                      <Button 
                        key={i} 
                        variant="outline" 
                        className="w-full justify-start h-12"
                        asChild
                      >
                        <a href={download.url} className="flex items-center space-x-3">
                          <download.icon className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-medium">Download for {download.platform}</div>
                            <div className="text-xs text-muted-foreground">{download.version}</div>
                          </div>
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* QR Code Section */}
          <div className="bg-card border border-border/40 rounded-xl p-8 mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Quick Download</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Scan the QR code with your phone's camera to quickly download the mobile app.
                </p>
                <p className="text-sm text-muted-foreground">
                  Compatible with iOS and Android devices. The QR code will automatically detect your device type.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-muted/30 border-2 border-dashed border-border rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">QR Code Placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Download Section */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-8 custom-font">Why Download the App?</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* System Requirements */}
          <div className="bg-muted/30 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">System Requirements</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-foreground mb-4">Mobile</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>iOS:</span>
                    <span>14.0 or later</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Android:</span>
                    <span>8.0 (API level 26) or later</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span>100MB free space</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RAM:</span>
                    <span>2GB minimum</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Desktop</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Windows:</span>
                    <span>10 version 1903 or later</span>
                  </div>
                  <div className="flex justify-between">
                    <span>macOS:</span>
                    <span>11.0 (Big Sur) or later</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span>500MB free space</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RAM:</span>
                    <span>4GB minimum</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Download;
