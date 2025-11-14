import React from "react";
import { PublicHero } from "@/components/public/PublicHero";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  Database,
  Lock,
  Eye,
  Settings,
  Download,
  Trash2,
  Shield,
  Bell,
  Users,
  AlertCircle,
} from "lucide-react";

const Privacy: React.FC = () => {
  const privacyPrinciples = [
    {
      icon: Lock,
      title: "University-Verified Only",
      description: "Only verified university accounts can access the platform",
    },
    {
      icon: Shield,
      title: "End-to-End Encryption",
      description: "Your messages and data are encrypted and secure",
    },
    {
      icon: Eye,
      title: "No Third-Party Sales",
      description: "We never sell your personal data to advertisers",
    },
    {
      icon: Settings,
      title: "Full Control",
      description: "Complete control over your privacy settings and data",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHero
        title="Privacy Policy"
        subtitle="We're committed to protecting your information and maintaining transparency about how your data is used."
        showVisualElements={true}
        size="medium"
        heroContent={
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 custom-font">
              Privacy &<span className="block text-primary">Security</span>
            </h1>
            <p className="text-base md:text-lg xl:text-xl text-muted-foreground max-w-2xl lg:max-w-3xl mx-auto mb-6">
              We're committed to protecting the information you share with us.
              This policy explains how we collect, use, and protect your
              personal information on Campus Connect.
            </p>
            <div className="text-sm text-muted-foreground mb-8">
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {privacyPrinciples.map((principle, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-medium"
                >
                  <principle.icon className="w-4 h-4 text-primary" />
                  <span>{principle.title}</span>
                </div>
              ))}
            </div>
          </div>
        }
      />

      <main>
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {privacyPrinciples.map((principle, index) => (
                <div
                  key={index}
                  className="bg-background/50 backdrop-blur-sm border border-border/20 rounded-xl p-6 text-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <principle.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
            <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8 lg:p-12 mb-12">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground custom-font">
                  Information We Collect
                </h2>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="bg-background/50 border border-border/20 rounded-xl p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center">
                    <Users className="w-5 h-5 text-primary mr-2" />
                    Account Information
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• University email address and verification status</li>
                    <li>• Name, username, and profile information</li>
                    <li>• Academic details (major, year, department)</li>
                    <li>• Profile photo and bio (optional)</li>
                    <li>• Contact preferences and settings</li>
                  </ul>
                </div>

                <div className="bg-background/50 border border-border/20 rounded-xl p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center">
                    <Bell className="w-5 h-5 text-primary mr-2" />
                    Platform Activity
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• Posts, comments, and messages you create</li>
                    <li>• Groups and communities you join</li>
                    <li>• Connections and interactions with other users</li>
                    <li>• Study sessions and tutoring activities</li>
                    <li>• Event participation and RSVPs</li>
                  </ul>
                </div>

                <div className="bg-background/50 border border-border/20 rounded-xl p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center">
                    <Shield className="w-5 h-5 text-primary mr-2" />
                    Technical Data
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• Device and browser information</li>
                    <li>• IP address and general location</li>
                    <li>• Usage analytics and performance data</li>
                    <li>• Cookies and session tokens</li>
                    <li>• Error logs and diagnostic information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-accent/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4 custom-font">
                How We Use Your Information
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We use your information to provide, improve, and personalize
                your Campus Connect experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-background/70 border border-border/20 rounded-xl p-8">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                  <Settings className="w-6 h-6 text-primary mr-3" />
                  Core Services
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Creating and maintaining your account</li>
                  <li>• Facilitating connections with other students</li>
                  <li>• Enabling messaging and group communications</li>
                  <li>• Matching you with relevant tutors and mentors</li>
                  <li>• Providing academic resources and opportunities</li>
                  <li>• Organizing and promoting campus events</li>
                </ul>
              </div>

              <div className="bg-background/70 border border-border/20 rounded-xl p-8">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                  <Eye className="w-6 h-6 text-primary mr-3" />
                  Platform Improvement
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Analyzing usage patterns to improve features</li>
                  <li>• Personalizing content and recommendations</li>
                  <li>• Detecting and preventing security threats</li>
                  <li>• Ensuring compliance with university policies</li>
                  <li>• Providing customer support and assistance</li>
                  <li>• Conducting research on educational outcomes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-border/20 rounded-2xl p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-foreground mb-8 custom-font">
                Data Sharing & Protection
              </h2>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                    <Lock className="w-5 h-5 text-primary mr-2" />
                    When We Share Information
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>With Your University:</strong> Limited academic
                      data for verification and compliance purposes only.
                    </p>
                    <p>
                      <strong>With Other Students:</strong> Only the information
                      you choose to make public in your profile and posts.
                    </p>
                    <p>
                      <strong>Service Providers:</strong> Trusted partners who
                      help us operate the platform under strict confidentiality
                      agreements.
                    </p>
                    <p>
                      <strong>Legal Requirements:</strong> When required by law
                      or to protect the safety of our community.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                    <Shield className="w-5 h-5 text-primary mr-2" />
                    How We Protect Your Data
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>Encryption:</strong> All data is encrypted in
                      transit and at rest using industry-standard protocols.
                    </p>
                    <p>
                      <strong>Access Controls:</strong> Strict employee access
                      controls and regular security audits.
                    </p>
                    <p>
                      <strong>Secure Infrastructure:</strong> Enterprise-grade
                      cloud security with 99.9% uptime guarantee.
                    </p>
                    <p>
                      <strong>Regular Updates:</strong> Continuous security
                      monitoring and prompt security patches.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-accent/20 border border-accent/30 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      We Never Sell Your Data
                    </h4>
                    <p className="text-muted-foreground">
                      Unlike many social platforms, we never sell, rent, or
                      trade your personal information to third parties for
                      marketing purposes. Your academic data stays within the
                      university community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-accent/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4 custom-font">
                Your Privacy Rights
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                You have complete control over your data and privacy settings.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-background/70 border border-border/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-3">
                  Access Your Data
                </h3>
                <p className="text-muted-foreground text-sm">
                  Request a complete copy of all the data we have about you at
                  any time.
                </p>
              </div>

              <div className="bg-background/70 border border-border/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-3">
                  Control Your Privacy
                </h3>
                <p className="text-muted-foreground text-sm">
                  Adjust privacy settings, control who can see your information,
                  and manage notifications.
                </p>
              </div>

              <div className="bg-background/70 border border-border/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-3">
                  Delete Your Account
                </h3>
                <p className="text-muted-foreground text-sm">
                  Permanently delete your account and all associated data
                  whenever you want.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-background/70 border border-border/20 rounded-xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Contact Our Privacy Team
              </h3>
              <p className="text-muted-foreground mb-4">
                Have questions about your privacy or want to exercise your
                rights? Our privacy team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:privacy@campusconnect.edu"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Contact Privacy Team
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-accent/20 transition-colors"
                >
                  General Support
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card/50 border border-border/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4 custom-font">
                Policy Updates
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                We may update this privacy policy from time to time. We'll
                notify you of any material changes via email and through the
                platform.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Current Version:</strong> 2.1
                </p>
                <p>
                  <strong>Effective Date:</strong>{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Privacy;
