
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
            Terms of Service
          </h1>
          <p className="text-gray-400">
            Last updated: January 2025
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              By accessing and using Campus Vibe, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please 
              do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">2. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              To access certain features of Campus Vibe, you must create an account. You are 
              responsible for maintaining the confidentiality of your account information and 
              for all activities that occur under your account.
            </p>
            <p>
              You must provide accurate and complete information when creating your account and 
              keep your information updated.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">3. Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>You agree to use Campus Vibe only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post content that is harmful, threatening, abusive, or harassing</li>
              <li>Impersonate any person or entity</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Spam other users or engage in disruptive behavior</li>
              <li>Share content that infringes on intellectual property rights</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">4. Content and Privacy</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              You retain ownership of content you post on Campus Vibe. However, by posting content, 
              you grant us a license to use, display, and distribute your content on the platform.
            </p>
            <p>
              We respect your privacy and are committed to protecting your personal information. 
              Please review our Privacy Policy for details on how we collect and use your data.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">5. Termination</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              We reserve the right to terminate or suspend your account at any time for any reason, 
              including violation of these Terms of Service.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">6. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              If you have any questions about these Terms of Service, please contact us at 
              support@campusvibe.com
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Terms;
