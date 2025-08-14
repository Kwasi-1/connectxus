
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, GraduationCap, Heart } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Campus Vibe
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            About Campus Vibe
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connecting university communities through meaningful social interactions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="h-6 w-6 mr-2 text-purple-400" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                Campus Vibe is dedicated to fostering authentic connections within university communities. 
                We believe that meaningful relationships are the foundation of a great college experience.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <MessageSquare className="h-6 w-6 mr-2 text-blue-400" />
                What We Do
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                We provide a platform where students can share experiences, connect with mentors, 
                find study groups, and build lasting friendships that extend beyond graduation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <GraduationCap className="h-6 w-6 mr-2 text-green-400" />
                Academic Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                From tutoring services to mentorship programs, we support academic excellence 
                while maintaining a fun and engaging social environment.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Heart className="h-6 w-6 mr-2 text-pink-400" />
                Community First
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                Every feature we build is designed with community wellbeing in mind, 
                promoting positive interactions and supporting student success.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-center">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              Founded in 2024, Campus Vibe emerged from the recognition that university students 
              needed a dedicated space to connect, collaborate, and grow together. Our team of 
              passionate developers and educators came together with a shared vision of enhancing 
              the university experience through technology.
            </p>
            <p>
              Today, Campus Vibe serves thousands of students across multiple universities, 
              facilitating everything from study sessions to career mentorship, from casual 
              conversations to lifelong friendships.
            </p>
            <p>
              We're committed to creating a safe, inclusive, and supportive environment where 
              every student can thrive academically and socially.
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
          >
            Join Campus Vibe Today
          </Button>
        </div>
      </main>
    </div>
  );
};

export default About;
