import React, { useEffect } from "react";
import { PublicHero } from "@/components/public/PublicHero";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  Trash2,
  Smartphone,
  Mail,
  Clock,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const AccountDeletion: React.FC = () => {
  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = "Account Deletion - Campus Connect";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Learn how to permanently delete your Campus Connect account and understand what data will be removed. Official account deletion policy for Google Play compliance."
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Learn how to permanently delete your Campus Connect account and understand what data will be removed. Official account deletion policy for Google Play compliance.";
      document.head.appendChild(meta);
    }
  }, []);

  const deletionSteps = [
    {
      step: 1,
      title: "Open the Campus Connect Mobile App",
      description: "Launch the Campus Connect app on your mobile device",
    },
    {
      step: 2,
      title: "Navigate to Account Settings",
      description: "Tap on your profile icon, then select 'Account' → 'Settings'",
    },
    {
      step: 3,
      title: "Scroll to Delete Account Section",
      description: "Locate the 'Delete Account' button at the bottom of the Settings page",
    },
    {
      step: 4,
      title: "Confirm Deletion",
      description: "Review the warning message and confirm that you want to permanently delete your account",
    },
    {
      step: 5,
      title: "Account Deleted",
      description: "Your account will be immediately deactivated and scheduled for permanent deletion",
    },
  ];

  const dataCategories = [
    {
      icon: Database,
      title: "Data Permanently Deleted",
      items: [
        "Profile information (name, email, avatar, bio)",
        "All posts, comments, and reactions",
        "Messages and conversations",
        "Group and community memberships",
        "Tutoring requests and help requests",
        "Payment information and transaction history",
        "Notification preferences and settings",
      ],
    },
    {
      icon: Shield,
      title: "Data Retention (Legal Compliance)",
      items: [
        "Transaction records (retained for 7 years for tax/legal purposes)",
        "Abuse reports and moderation logs (retained for 90 days)",
        "Backup copies (automatically deleted within 30 days)",
      ],
      note: "Some data may be retained where required by law or for fraud prevention purposes.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHero
        title="Account Deletion"
        subtitle="Learn how to permanently delete your Campus Connect account and personal data"
        showVisualElements={true}
        size="medium"
        heroContent={
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-full mb-6">
              <Trash2 className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 custom-font">
              Account <span className="block text-destructive">Deletion</span>
            </h1>
            <p className="text-base md:text-lg xl:text-xl text-muted-foreground max-w-2xl lg:max-w-3xl mx-auto mb-6">
              This page explains how users can permanently delete their Campus
              Connect account and all associated personal data.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
              <span className="font-medium">Developer:</span>
              <span className="text-muted-foreground">Campus Connect Team</span>
            </div>
          </div>
        }
      />

      <main>
        {/* Introduction Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-background border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    Before You Delete Your Account
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Deleting your Campus Connect account is{" "}
                    <strong className="text-foreground">permanent and cannot be undone</strong>.
                    All your data will be permanently removed from our servers.
                  </p>
                  <p className="text-muted-foreground">
                    Please ensure you have downloaded any content or information
                    you wish to keep before proceeding with account deletion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Delete Your Account */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">
                  How to Delete Your Account
                </h2>
              </div>
              <p className="text-muted-foreground">
                Follow these simple steps to permanently delete your Campus
                Connect account:
              </p>
            </div>

            <div className="space-y-4">
              {deletionSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {step.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alternative: Email Support */}
            <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Alternative: Request Deletion via Email
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    If you're unable to access your account or prefer email
                    support, you can request account deletion by contacting us:
                  </p>
                  <a
                    href="mailto:support@campusconnect.com"
                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    support@campusconnect.com
                  </a>
                  <p className="text-sm text-muted-foreground mt-3">
                    Please include your registered email address and username in
                    your deletion request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Deletion Details */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">
                  What Data Gets Deleted
                </h2>
              </div>
              <p className="text-muted-foreground">
                Here's what happens to your data when you delete your account:
              </p>
            </div>

            <div className="grid md:grid-cols-1 gap-6">
              {dataCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-background border border-border rounded-xl p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        {category.title}
                      </h3>
                      <ul className="space-y-3">
                        {category.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex items-start gap-3 text-muted-foreground"
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      {category.note && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Note:</strong>{" "}
                            {category.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Processing Timeline */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">
                  Deletion Timeline
                </h2>
              </div>
              <p className="text-muted-foreground">
                Understanding the account deletion process and timeline:
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-background border border-border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Immediate Actions (Within Minutes)
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>Your account is immediately deactivated</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>Your profile becomes inaccessible to other users</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>You're automatically logged out of all devices</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Complete Deletion (Within 30 Days)
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          All personal data is permanently deleted from active
                          databases
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>Backup copies are automatically purged</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Anonymized analytics data may be retained for platform
                          improvements
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Recovery Period
                    </h3>
                    <p className="text-muted-foreground">
                      Once you confirm account deletion, there is{" "}
                      <strong className="text-foreground">
                        no recovery period or grace period
                      </strong>
                      . The deletion process begins immediately and cannot be
                      reversed. Please ensure you want to permanently delete
                      your account before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-background border border-border rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Need Help?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                If you have questions about account deletion or need assistance
                with the process, our support team is here to help.
              </p>
              <a
                href="mailto:support@campusconnect.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </a>
            </div>
          </div>
        </section>

        {/* Footer Information */}
        <section className="py-12 border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">App Name:</strong> Campus
                Connect
              </p>
              <p>
                <strong className="text-foreground">Developer:</strong> Campus
                Connect Team
              </p>
              <p>
                <strong className="text-foreground">Last Updated:</strong>{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="pt-4">
                This page is provided for Google Play Store compliance and
                outlines our account deletion policy.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default AccountDeletion;
