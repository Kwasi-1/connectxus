import React from "react";
import { PublicHero } from "@/components/public/PublicHero";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  Users,
  BookOpen,
  MessageCircle,
  Shield,
  Globe,
  Zap,
  Target,
  Heart,
  Lightbulb,
  Award,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  useScrollAnimation,
  useStaggeredScrollAnimation,
} from "@/hooks/use-scroll-animation";

const About: React.FC = () => {
  const missionSection = useScrollAnimation({ threshold: 0.2 });
  const featuresSection = useScrollAnimation({ threshold: 0.1 });
  const valuesSection = useScrollAnimation({ threshold: 0.1 });
  const timelineSection = useScrollAnimation({ threshold: 0.1 });
  const impactSection = useScrollAnimation({ threshold: 0.1 });
  const ctaSection = useScrollAnimation({ threshold: 0.3 });

  const featuresStagger = useStaggeredScrollAnimation(6, 150);
  const valuesStagger = useStaggeredScrollAnimation(4, 200);
  const timelineStagger = useStaggeredScrollAnimation(4, 250);
  const impactStagger = useStaggeredScrollAnimation(4, 100);

  const features = [
    {
      icon: Users,
      title: "Connect with Peers",
      description:
        "Build meaningful relationships with students, faculty, and staff across your university community through verified profiles and smart matching.",
    },
    {
      icon: BookOpen,
      title: "Academic Excellence",
      description:
        "Access peer tutoring, mentorship programs, study groups, and academic resources tailored to your specific courses and degree requirements.",
    },
    {
      icon: MessageCircle,
      title: "Real-time Communication",
      description:
        "Stay connected through instant messaging, group chats, forums, and live discussions with classmates and academic communities.",
    },
    {
      icon: Shield,
      title: "Safe Environment",
      description:
        "Verified university accounts and robust moderation ensure a secure, trusted academic community free from external interference.",
    },
    {
      icon: Globe,
      title: "Campus Discovery",
      description:
        "Discover events, opportunities, clubs, research projects, and resources happening across your campus in real-time.",
    },
    {
      icon: Zap,
      title: "Instant Updates",
      description:
        "Stay informed with smart notifications about academic deadlines, campus events, and opportunities relevant to your interests.",
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Academic Integrity",
      description:
        "We maintain the highest standards of academic honesty, ethical behavior, and intellectual property respect across all interactions.",
    },
    {
      icon: Heart,
      title: "Inclusive Community",
      description:
        "Every member of the university community deserves respect, equal opportunity to participate, and a voice in academic discussions.",
    },
    {
      icon: Lightbulb,
      title: "Innovation in Learning",
      description:
        "We continuously evolve to support new collaborative learning methods, research partnerships, and academic innovation.",
    },
    {
      icon: Award,
      title: "Excellence in Education",
      description:
        "We are committed to enhancing educational outcomes through meaningful peer connections and collaborative learning experiences.",
    },
  ];

  const impactStats = [
    {
      number: "50K+",
      label: "Active Students",
      description: "Engaged learners across universities",
    },
    {
      number: "200+",
      label: "Partner Universities",
      description: "Accredited institutions worldwide",
    },
    {
      number: "1M+",
      label: "Academic Connections",
      description: "Study partnerships formed",
    },
    {
      number: "95%",
      label: "Success Rate",
      description: "Students report improved outcomes",
    },
  ];

  const timeline = [
    {
      year: "2022",
      title: "Foundation",
      description:
        "Campus Connect was founded with a vision to revolutionize university social networking and academic collaboration.",
    },
    {
      year: "2023",
      title: "First Universities",
      description:
        "Launched at 10 pilot universities with over 5,000 students joining in the first semester.",
    },
    {
      year: "2024",
      title: "Rapid Growth",
      description:
        "Expanded to 100+ universities with advanced features like AI-powered study matching and career guidance.",
    },
    {
      year: "2025",
      title: "Global Reach",
      description:
        "Now serving 200+ universities worldwide with 50,000+ active students and innovative learning tools.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHero
        title="About Campus Connect"
        showVisualElements={true}
        size="medium"
        backgroundVariant="gradient"
        heroContent={
          <div className="px-4 textcenter flex flex-col itemscenter justify-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] xl:text-8xl leading-tight font-extrabold text-foreground mb-4 lg:mb-8 ">
              Connecting University
              <span className="block text-primary font-[500] custom-font">
                Communities
              </span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mr-auto leading-relaxed">
              Campus Connect is the premier social platform designed exclusively
              for university communities. We bring students, faculty, and staff
              together in one seamless, connected ecosystem where learning
              thrives and academic excellence flourishes.
            </p>
          </div>
        }
      />

      <main>
        <section
          ref={missionSection.ref as React.RefObject<HTMLElement>}
          className={`py-20 bg-gradient-to-t from-background via-background to-accent/50 transition-all duration-1000 ${
            missionSection.isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              <div className="lg:col-span-2">
                <div
                  className={`group bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8 lg:p-12 hover:shadow-xl hover:border-primary/30 transition-all duration-700 ${
                    missionSection.isInView
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-8"
                  }`}
                >
                  <h2 className="text-3xl font-semibold text-foreground mb-6 custom-font flex items-center">
                    <Target className="w-8 h-8 text-primary mr-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    Our Mission
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6 group-hover:text-foreground transition-colors duration-300">
                    To foster meaningful connections within university
                    communities by providing a platform where academic
                    collaboration thrives, knowledge flows freely, and every
                    member of the university ecosystem can grow together.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    We believe that the strongest learning happens when
                    brilliant minds connect, share expertise, and collaborate on
                    projects that shape the future of education and innovation.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div
                  className={`group bg-primary/10 border border-primary/20 rounded-xl p-6 text-center hover:bg-primary/20 hover:shadow-lg hover:scale-105 transition-all duration-500 cursor-pointer ${
                    missionSection.isInView
                      ? "opacity-100 translate-x-0 delay-300"
                      : "opacity-0 translate-x-8"
                  }`}
                >
                  <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />
                  <h3 className="text-2xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    Growing Fast
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    300% growth year over year
                  </p>
                </div>
                <div
                  className={`group bg-accent/10 border border-accent/20 rounded-xl p-6 text-center hover:bg-accent/20 hover:shadow-lg hover:scale-105 transition-all duration-500 cursor-pointer ${
                    missionSection.isInView
                      ? "opacity-100 translate-x-0 delay-500"
                      : "opacity-0 translate-x-8"
                  }`}
                >
                  <Clock className="w-12 h-12 text-accent mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                  <h3 className="text-2xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                    Always On
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    24/7 student support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={featuresStagger.ref as React.RefObject<HTMLElement>}
          className="py-20 bg-accent/5"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                featuresSection.isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2
                ref={featuresSection.ref as React.RefObject<HTMLHeadingElement>}
                className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 custom-font"
              >
                What Makes Us Different
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Purpose-built for the unique needs of university communities
                with features that enhance academic success.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group transition-all duration-700 ${
                    featuresStagger.visibleItems[index]
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-8 scale-95"
                  }`}
                >
                  <div className="bg-background border border-border/20 rounded-2xl p-8 h-full transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-400">
                      <feature.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 custom-font group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      {feature.description}
                    </p>

                    <div className="w-0 group-hover:w-12 h-1 bg-primary rounded-full transition-all duration-500 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={valuesStagger.ref as React.RefObject<HTMLElement>}
          className="py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                valuesSection.isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2
                ref={valuesSection.ref as React.RefObject<HTMLHeadingElement>}
                className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 custom-font"
              >
                Our Core Values
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The principles that guide every decision we make and every
                feature we build.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className={`group bg-gradient-to-br from-card/50 to-accent/5 border border-border/20 rounded-2xl p-8 hover:shadow-xl hover:scale-[1.02] transition-all duration-700 hover:border-primary/30 cursor-pointer ${
                    valuesStagger.visibleItems[index]
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-8 scale-95"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <value.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-3 custom-font group-hover:text-primary transition-colors duration-300">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={timelineStagger.ref as React.RefObject<HTMLElement>}
          className="py-20 bg-accent/5"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                timelineSection.isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2
                ref={timelineSection.ref as React.RefObject<HTMLHeadingElement>}
                className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 custom-font"
              >
                Our Journey
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From a simple idea to connecting universities worldwide.
              </p>
            </div>

            <div className="hidden md:block relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-border/40"></div>
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className={`group flex items-center transition-all duration-700 hover:scale-105 ${
                      index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                    } ${
                      timelineStagger.visibleItems[index]
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-8 scale-95"
                    }`}
                  >
                    <div
                      className={`w-1/2 ${
                        index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                      }`}
                    >
                      <div className="bg-background border border-border/20 rounded-xl p-6 hover:shadow-2xl hover:border-primary/40 transition-all duration-500 transform hover:-translate-y-2">
                        <div className="text-2xl font-semibold text-primary mb-2 group-hover:scale-105 transition-transform duration-300">
                          {item.year}
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-3 custom-font group-hover:text-primary transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="relative z-10 w-6 h-6 bg-primary rounded-full border-4 border-background group-hover:scale-125 group-hover:bg-primary/80 transition-all duration-300 shadow-lg">
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:hidden space-y-8">
              <div className="relative pl-[22px]">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border/40"></div>
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className={`relative mb-8 group transition-all duration-700 ${
                      timelineStagger.visibleItems[index]
                        ? "opacity-100 translate-x-0 scale-100"
                        : "opacity-0 translate-x-8 scale-95"
                    }`}
                  >
                    <div className="absolute -left-[0.8rem] top-2 w-4 h-4 bg-primary rounded-full border-2 border-background group-hover:scale-125 transition-transform duration-300 shadow-lg">
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="bg-background border border-border/20 rounded-xl p-6 ml-2 hover:shadow-xl hover:border-primary/40 transition-all duration-500 transform hover:-translate-y-1">
                      <div className="text-xl font-semibold text-primary mb-2 group-hover:scale-105 transition-transform duration-300">
                        {item.year}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-3 custom-font group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          ref={impactStagger.ref as React.RefObject<HTMLElement>}
          className="py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                impactSection.isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2
                ref={impactSection.ref as React.RefObject<HTMLHeadingElement>}
                className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 custom-font"
              >
                Our Impact
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Real numbers that show how we're transforming university
                education and student success.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
                <div
                  key={index}
                  className={`group border border-border/20 rounded-2xl p-8 text-center hover:shadow-2xl hover:scale-105 hover:border-primary/40 transition-all duration-700 cursor-pointer bg-gradient-to-br from-background to-accent/5 hover:from-primary/5 hover:to-accent/10 ${
                    impactStagger.visibleItems[index]
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-8 scale-95"
                  }`}
                >
                  <div className="text-4xl lg:text-5xl font-semibold text-primary mb-3 custom-font group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {stat.label}
                  </h3>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {stat.description}
                  </p>

                  <div className="w-0 group-hover:w-full h-0.5 bg-primary transition-all duration-500 mx-auto mt-4"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-4 mx-1 md:mx-10 rounded-3xl py-20 bg-gradient-to-r from-primary/10 to-accent/80 hover:from-primary/20 hover:to-accent/90 transition-all duration-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 custom-font hover:scale-105 transition-transform duration-300">
              Ready to Connect?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto hover:text-foreground transition-colors duration-300">
              Join thousands of students who are already building meaningful
              connections and achieving academic success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/signup"
                className="group inline-flex items-center justify-center px-8 py-4 bg-foreground text-background rounded-full text-lg font-semibold hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10">Get Started Today</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </a>
              <a
                href="/contact"
                className="group inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground rounded-full text-lg font-semibold hover:bg-accent/20 hover:border-primary/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="group-hover:scale-110 transition-transform duration-200">
                  Contact Us
                </span>
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
