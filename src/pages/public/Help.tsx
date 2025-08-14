
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, MessageSquare, Users, GraduationCap, Settings } from 'lucide-react';

const Help = () => {
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
            Help Center
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of Campus Vibe
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="h-6 w-6 mr-2 text-blue-400" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-1">Creating Your Account</h4>
                <p className="text-sm">Sign up with your university email to join your campus community.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Setting Up Your Profile</h4>
                <p className="text-sm">Add your photo, bio, and interests to help others connect with you.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <MessageSquare className="h-6 w-6 mr-2 text-green-400" />
                Messaging & Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-1">Sending Messages</h4>
                <p className="text-sm">Connect with classmates through direct messages and group chats.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Creating Posts</h4>
                <p className="text-sm">Share updates, photos, and thoughts with your university community.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <GraduationCap className="h-6 w-6 mr-2 text-purple-400" />
                Academic Features
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-1">Finding Tutors</h4>
                <p className="text-sm">Search for tutors in specific subjects and book sessions.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Joining Study Groups</h4>
                <p className="text-sm">Find or create study groups for your classes.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Settings className="h-6 w-6 mr-2 text-yellow-400" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-1">Privacy Controls</h4>
                <p className="text-sm">Manage who can see your posts and contact you.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Notification Settings</h4>
                <p className="text-sm">Customize when and how you receive notifications.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <HelpCircle className="h-6 w-6 mr-2 text-pink-400" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-6">
            <div>
              <h4 className="font-semibold text-white mb-2">How do I verify my university email?</h4>
              <p>After signing up, check your university email for a verification link. Click it to confirm your account.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Can I join multiple universities?</h4>
              <p>Currently, each account is associated with one university. Contact support if you need to transfer schools.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">How do I report inappropriate content?</h4>
              <p>Use the report button (⋯) on any post or message, or contact our support team directly.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Is Campus Vibe free to use?</h4>
              <p>Yes! Campus Vibe is completely free for all university students, faculty, and staff.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">How do I delete my account?</h4>
              <p>Go to Settings → Account → Delete Account. Note that this action is permanent and cannot be undone.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Can I use Campus Vibe on mobile?</h4>
              <p>Yes! Campus Vibe works great in your mobile browser. Native apps are coming soon.</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Still need help?</h3>
          <p className="text-gray-400">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Button
            onClick={() => navigate('/contact')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
          >
            Contact Support
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Help;
