import React, { useState } from "react";
import { PublicHero } from "@/components/public/PublicHero";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  Mail,
  MessageCircle,
  Phone,
  Clock,
  HelpCircle,
  Bug,
  Users,
  BookOpen,
  Shield,
  Send,
  MapPin,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university: "",
    subject: "",
    message: "",
    category: "general",
  });

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help from our dedicated support team",
      contact: "support@campusconnect.edu",
      responseTime: "Usually responds within 4 hours",
      color: "primary",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us in real-time for instant help",
      contact: "Available 24/7",
      responseTime: "Instant response during business hours",
      color: "accent",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our team directly for complex issues",
      contact: "1-800-CAMPUS-1",
      responseTime: "Mon-Fri, 8AM-8PM EST",
      color: "primary",
    },
  ];

  const supportCategories = [
    {
      icon: Users,
      title: "Account & Profile",
      description: "Account setup, profile issues, verification problems",
      topics: [
        "Email verification",
        "Profile setup",
        "Account recovery",
        "Privacy settings",
      ],
    },
    {
      icon: BookOpen,
      title: "Academic Features",
      description: "Tutoring, study groups, and academic tools",
      topics: [
        "Finding tutors",
        "Study group creation",
        "Academic resources",
      ],
    },
    {
      icon: MessageCircle,
      title: "Communication",
      description: "Messaging, groups, communities, and networking",
      topics: [
        "Group chats",
        "Community guidelines",
        "Connection issues",
        "Notification settings",
      ],
    },
    {
      icon: Shield,
      title: "Safety & Security",
      description: "Reporting, safety concerns, and platform security",
      topics: [
        "Report content",
        "User safety",
        "Data security",
        "Community standards",
      ],
    },
    {
      icon: Bug,
      title: "Technical Support",
      description: "App bugs, performance issues, and technical problems",
      topics: [
        "App crashes",
        "Loading issues",
        "Feature problems",
        "Browser compatibility",
      ],
    },
    {
      icon: HelpCircle,
      title: "General Questions",
      description: "Platform information, features, and general inquiries",
      topics: [
        "How it works",
        "Feature requests",
        "University partnerships",
        "Platform updates",
      ],
    },
  ];

  const faqItems = [
    {
      question: "How do I verify my university email?",
      answer:
        "After signing up, check your university email for a verification link. Click the link to verify your account and gain access to your university community. If you don't receive the email within 5 minutes, check your spam folder or request a new verification email.",
    },
    {
      question: "Can I join multiple university communities?",
      answer:
        "Each account is tied to one university for security and community integrity. If you're a transfer student or have affiliations with multiple institutions, contact our support team to discuss options for your specific situation.",
    },
    {
      question: "How do I find tutors on the platform?",
      answer:
        'Use our smart matching system in the "Academic Support" section. Filter by subject, availability, and expertise level. You can also browse tutor profiles, read reviews, and book sessions directly through the platform.',
    },
    {
      question: "How do I report inappropriate content or behavior?",
      answer:
        "Use the report button (three dots menu) on any post, comment, or message. You can also report users directly from their profiles. Our moderation team reviews all reports within 2 hours during business hours to ensure a safe community environment.",
    },
    {
      question: "Is my personal information safe on Campus Connect?",
      answer:
        "Absolutely. We use enterprise-grade encryption, never sell personal data, and limit access to verified university community members. We comply with FERPA and other educational privacy regulations. Read our Privacy Policy for complete details.",
    },
    {
      question: "How do I delete my account and data?",
      answer:
        "You can permanently delete your account from your privacy settings. This action removes all your data from our servers within 30 days. Some anonymized usage statistics may be retained for platform improvement purposes.",
    },
    {
      question: "Can faculty and staff join Campus Connect?",
      answer:
        "Yes! Faculty and staff with verified university email addresses can join their institution's community. They have access to special features for academic collaboration and can connect with students  and research opportunities.",
    },
    {
      question: "How does the project collaboration feature work?",
      answer:
        'Create project listings in the "Collaborate" section, specify skills needed, and invite team members. Use built-in project management tools, file sharing, and group messaging to coordinate your work with classmates.',
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHero
        title="Contact & Support"
        subtitle="Get the support you need to make the most of your Campus Connect experience."
        showVisualElements={true}
        size="large"
        heroContent={
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 custom-font">
              We're Here to
              <span className="block text-primary">Help</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Get the support you need to make the most of your Campus Connect
              experience. Our team is dedicated to helping students, faculty,
              and staff succeed.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>200+ Universities Supported</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <span>50K+ Students Helped</span>
              </div>
            </div>
          </div>
        }
      />

      <main>
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-background/50 backdrop-blur-sm border border-border/20 rounded-xl p-8 text-center hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                >
                  <div
                    className={`w-16 h-16 bg-${method.color}/10 rounded-2xl flex items-center justify-center mx-auto mb-6`}
                  >
                    <method.icon className={`w-8 h-8 text-${method.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 custom-font">
                    {method.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {method.description}
                  </p>
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">
                      {method.contact}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {method.responseTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4 custom-font">
                How Can We Help?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose your topic to get targeted support and resources.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-card/50 border border-border/20 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="space-y-1">
                    {category.topics.map((topic, topicIndex) => (
                      <div
                        key={topicIndex}
                        className="text-xs text-muted-foreground"
                      >
                        • {topic}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-accent/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4 custom-font">
                Send Us a Message
              </h2>
              <p className="text-lg text-muted-foreground">
                Can't find what you're looking for? Send us a detailed message
                and we'll get back to you soon.
              </p>
            </div>

            <Card className="border border-border/20 shadow-xl bg-background/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="your.email@university.edu"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="university"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        University
                      </label>
                      <input
                        type="text"
                        id="university"
                        name="university"
                        value={formData.university}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Your university name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      >
                        <option value="general">General Question</option>
                        <option value="account">Account & Profile</option>
                        <option value="academic">Academic Features</option>
                        <option value="technical">Technical Support</option>
                        <option value="safety">Safety & Security</option>
                        <option value="partnership">
                          University Partnership
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                      placeholder="Please provide as much detail as possible about your question or issue..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4 custom-font">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Quick answers to common questions about Campus Connect.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card
                  key={index}
                  className="border border-border/20 bg-card/50"
                >
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-start">
                      <HelpCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      {item.question}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed ml-7">
                      {item.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Still have questions? We're here to help!
              </p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Live Chat
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Contact;
