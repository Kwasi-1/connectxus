
import React from 'react';
import { PublicHero } from '@/components/public/PublicHero';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Users, BookOpen, MessageCircle, Shield, Globe, Zap, Target, Heart, Lightbulb, Award, TrendingUp, Clock } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Connect with Peers',
      description: 'Build meaningful relationships with students, faculty, and staff across your university community through verified profiles and smart matching.'
    },
    {
      icon: BookOpen,
      title: 'Academic Excellence',
      description: 'Access peer tutoring, mentorship programs, study groups, and academic resources tailored to your specific courses and degree requirements.'
    },
    {
      icon: MessageCircle,
      title: 'Real-time Communication',
      description: 'Stay connected through instant messaging, group chats, forums, and live discussions with classmates and academic communities.'
    },
    {
      icon: Shield,
      title: 'Safe Environment',
      description: 'Verified university accounts and robust moderation ensure a secure, trusted academic community free from external interference.'
    },
    {
      icon: Globe,
      title: 'Campus Discovery',
      description: 'Discover events, opportunities, clubs, research projects, and resources happening across your campus in real-time.'
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Stay informed with smart notifications about academic deadlines, campus events, and opportunities relevant to your interests.'
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Academic Integrity',
      description: 'We maintain the highest standards of academic honesty, ethical behavior, and intellectual property respect across all interactions.'
    },
    {
      icon: Heart,
      title: 'Inclusive Community',
      description: 'Every member of the university community deserves respect, equal opportunity to participate, and a voice in academic discussions.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation in Learning',
      description: 'We continuously evolve to support new collaborative learning methods, research partnerships, and academic innovation.'
    },
    {
      icon: Award,
      title: 'Excellence in Education',
      description: 'We are committed to enhancing educational outcomes through meaningful peer connections and collaborative learning experiences.'
    }
  ];

  const impactStats = [
    {
      number: '50K+',
      label: 'Active Students',
      description: 'Engaged learners across universities'
    },
    {
      number: '200+',
      label: 'Partner Universities',
      description: 'Accredited institutions worldwide'
    },
    {
      number: '1M+',
      label: 'Academic Connections',
      description: 'Study partnerships formed'
    },
    {
      number: '95%',
      label: 'Success Rate',
      description: 'Students report improved outcomes'
    }
  ];

  const timeline = [
    {
      year: '2022',
      title: 'Foundation',
      description: 'Campus Connect was founded with a vision to revolutionize university social networking and academic collaboration.'
    },
    {
      year: '2023',
      title: 'First Universities',
      description: 'Launched at 10 pilot universities with over 5,000 students joining in the first semester.'
    },
    {
      year: '2024',
      title: 'Rapid Growth',
      description: 'Expanded to 100+ universities with advanced features like AI-powered study matching and career guidance.'
    },
    {
      year: '2025',
      title: 'Global Reach',
      description: 'Now serving 200+ universities worldwide with 50,000+ active students and innovative learning tools.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHero title="About Campus Connect" />

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background via-accent/5 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-cente mb-16 h-[55vh] flex flex-col items-cente justify-center space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] leading-tight font-semibold text-foreground mb-4 lg:mb-8 custom-font">
                Connecting University
                <span className="block text-primary">Communities</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mxauto leading-relaxed">
                Campus Connect is the premier social platform designed exclusively for university communities. 
                We bring students, faculty, and staff together in one seamless, connected ecosystem where 
                learning thrives and academic excellence flourishes.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              <div className="lg:col-span-2">
                <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8 pl-0 lg:pl-0 lg:p-12">
                  <h2 className="text-3xl font-semibold text-foreground mb-6 custom-font flex items-center">
                    <Target className="w-8 h-8 text-primary mr-3" />
                    Our Mission
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    To foster meaningful connections within university communities by providing a platform where 
                    academic collaboration thrives, knowledge flows freely, and every member of the university 
                    ecosystem can grow together.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We believe that the strongest learning happens when brilliant minds connect, share expertise, 
                    and collaborate on projects that shape the future of education and innovation.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-foreground mb-2">Growing Fast</h3>
                  <p className="text-muted-foreground">300% growth year over year</p>
                </div>
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 text-center">
                  <Clock className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-foreground mb-2">Always On</h3>
                  <p className="text-muted-foreground">24/7 student support</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-accent/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 custom-font">
                What Makes Us Different
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Purpose-built for the unique needs of university communities with features that enhance academic success.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-background border border-border/20 rounded-2xl p-8 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 custom-font">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 custom-font">
                Our Core Values
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The principles that guide every decision we make and every feature we build.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-gradient-to-br from-card/50 to-accent/5 border border-border/20 rounded-2xl p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-3 custom-font">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-accent/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 custom-font">
                Our Journey
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From a simple idea to connecting universities worldwide.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-border/40"></div>
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="bg-background border border-border/20 rounded-xl p-6 shadow-lg">
                        <div className="text-2xl font-semibold text-primary mb-2">{item.year}</div>
                        <h3 className="text-xl font-semibold text-foreground mb-3 custom-font">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="relative z-10 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 custom-font">
                Our Impact
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Real numbers that show how we're transforming university education and student success.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border/20 rounded-2xl p-8 text-center">
                  <div className="text-4xl lg:text-5xl font-semibold text-primary mb-3 custom-font">
                    {stat.number}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{stat.label}</h3>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 custom-font">
              Ready to Connect?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already building meaningful connections and achieving academic success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/signup" 
                className="inline-flex items-center justify-center px-8 py-4 bg-foreground text-background rounded-full text-lg font-semibold hover:bg-foreground/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started Today
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground rounded-full text-lg font-semibold hover:bg-accent/20 transition-all duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default About;
