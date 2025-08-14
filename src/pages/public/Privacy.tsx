
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react';

const Privacy = () => {
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
            Privacy Policy
          </h1>
          <p className="text-gray-400">
            Last updated: January 2025
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="h-6 w-6 mr-2 text-green-400" />
                Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                We implement industry-standard security measures to protect your personal 
                information and ensure your data remains secure.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Eye className="h-6 w-6 mr-2 text-blue-400" />
                Transparency
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                We believe in being transparent about what data we collect and how we use it 
                to improve your Campus Vibe experience.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Database className="h-6 w-6 mr-2 text-purple-400" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>We collect information you provide directly to us, such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email, university affiliation)</li>
              <li>Profile information and photos</li>
              <li>Posts, comments, and messages</li>
              <li>Preferences and settings</li>
            </ul>
            <p>We also automatically collect certain information when you use Campus Vibe:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information and identifiers</li>
              <li>Usage data and analytics</li>
              <li>Location information (with your permission)</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Lock className="h-6 w-6 mr-2 text-yellow-400" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our services</li>
              <li>Connect you with other users and content</li>
              <li>Send you notifications and updates</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              We do not sell your personal information. We may share your information in the 
              following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With your consent</li>
              <li>With service providers who help us operate Campus Vibe</li>
              <li>To comply with legal requirements</li>
              <li>To protect the rights and safety of our users</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Control your privacy settings</li>
              <li>Opt out of certain communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us at privacy@campusvibe.com
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Privacy;
