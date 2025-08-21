
import React from 'react';
import { PublicHero } from '@/components/public/PublicHero';
import { PublicFooter } from '@/components/public/PublicFooter';
import { FileText, Shield, Users, AlertTriangle } from 'lucide-react';

const Terms: React.FC = () => {
  const sections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content: 'By accessing and using Campus Connect, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    {
      icon: Shield,
      title: 'Use License',
      content: 'Permission is granted to temporarily use Campus Connect for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to reverse engineer any software contained on the platform; or remove any copyright or other proprietary notations from the materials.'
    },
    {
      icon: Users,
      title: 'User Conduct',
      content: 'You agree to use Campus Connect responsibly and in accordance with all applicable laws and university policies. You will not post harmful, offensive, or inappropriate content; will not harass or bully other users; will respect intellectual property rights; will maintain academic integrity; and will follow your university\'s code of conduct and community guidelines.'
    },
    {
      icon: AlertTriangle,
      title: 'Content and Privacy',
      content: 'You retain ownership of content you post, but grant Campus Connect a license to use, display, and distribute your content on the platform. We respect your privacy and handle your data according to our Privacy Policy. You are responsible for maintaining the confidentiality of your account credentials.'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHero 
        title="Terms & Conditions" 
        // backgroundVariant="minimal"
        size="medium"
        heroContent={
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 custom-font">Terms of Service</h2>
            <p className="text-muted-foreground mb-2">Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-sm lg:text-base xl:text-lg text-muted-foreground max-w-2xl mx-auto">
              Please read these Terms of Service carefully before using Campus Connect. These terms govern your use of our platform and services.
            </p>
          </div>
        }
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          

          {/* Summary Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">Summary of our Terms</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These Terms of Service are part of a legally binding contract governing your use of Campus Connect. Here are the key points:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Academic Platform:</strong> Campus Connect is designed exclusively for verified university community members.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Responsible Use:</strong> You must comply with university policies and maintain academic integrity.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Content Rights:</strong> You own your content but grant us license to display it on the platform.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Community Standards:</strong> We have broad enforcement rights to maintain a safe academic environment.</span>
              </li>
            </ul>
          </div>

          {/* Main Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="bg-card border border-border/40 rounded-xl p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{index + 1}. {section.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Additional Terms */}
          <div className="mt-12 space-y-8">
            <div className="bg-card border border-border/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">5. Service Availability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Campus Connect strives to maintain high availability but does not guarantee uninterrupted service. We may temporarily suspend access for maintenance, updates, or technical issues. We are not liable for any damages resulting from service interruptions.
              </p>
            </div>

            <div className="bg-card border border-border/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">6. Modifications to Terms</h3>
              <p className="text-muted-foreground leading-relaxed">
                Campus Connect reserves the right to revise these terms at any time. Material changes will be communicated through the platform or via email. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </div>

            <div className="bg-card border border-border/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">7. Contact Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these Terms of Service, please contact us at legal@campusconnect.edu or through our contact page.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Terms;
