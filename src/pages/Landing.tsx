
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/shared/Logo';
import { FooterLinks } from '@/components/landing/FooterLinks';

const Landing = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl flex items-center justify-between">
          {/* Left Side - Visual Elements */}
          <div className="hidden lg:flex flex-1 justify-center items-center">
            <div className="relative">
              {/* Mock phone frames with colorful content */}
              <div className="relative w-80 h-96 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-1">
                <div className="w-full h-full bg-black rounded-3xl overflow-hidden relative">
                  <div className="absolute inset-4 bg-gradient-to-b from-purple-500/20 to-pink-500/20 rounded-2xl">
                    <div className="p-4 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                        <div className="space-y-1">
                          <div className="h-3 bg-white/30 rounded w-20"></div>
                          <div className="h-2 bg-white/20 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="h-48 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-white/30 rounded w-3/4"></div>
                        <div className="h-2 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <div className="absolute top-1/2 -right-8 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full lg:w-auto lg:min-w-[400px]">
            <Card className="bg-black border-gray-800">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Campus Vibe
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Connect with your university community
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Phone number, username, or email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12"
                  />
                  
                  <Input
                    type="password"
                    placeholder="Password"
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12"
                  />
                  
                  <Button 
                    onClick={handleSignIn}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold"
                  >
                    Log in
                  </Button>

                  <div className="flex items-center justify-center space-x-4 text-gray-500">
                    <div className="h-px bg-gray-700 flex-1"></div>
                    <span className="text-sm">OR</span>
                    <div className="h-px bg-gray-700 flex-1"></div>
                  </div>

                  <Button 
                    variant="ghost"
                    className="w-full text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Log in with Facebook
                  </Button>

                  <div className="text-center">
                    <Button variant="link" className="text-blue-400 hover:text-blue-300 text-sm p-0">
                      Forgot password?
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-gray-800 mt-4">
              <CardContent className="p-6 text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <Button 
                    variant="link" 
                    onClick={handleGetStarted}
                    className="text-blue-400 hover:text-blue-300 p-0 font-semibold"
                  >
                    Sign up
                  </Button>
                </p>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm mb-4">Get the app.</p>
              <div className="flex justify-center space-x-3">
                <Button 
                  variant="ghost" 
                  className="text-blue-400 hover:text-blue-300 text-sm"
                  onClick={() => navigate('/download')}
                >
                  Download Mobile App
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <FooterLinks />
    </div>
  );
};

export default Landing;
