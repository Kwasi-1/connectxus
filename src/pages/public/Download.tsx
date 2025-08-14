
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, Tablet, Monitor, Download as DownloadIcon } from 'lucide-react';

const Download = () => {
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
            Get Campus Vibe
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Stay connected with your university community wherever you go
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Smartphone className="h-6 w-6 mr-2 text-green-400" />
                Mobile App
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>Get the full Campus Vibe experience on your phone</p>
              <div className="space-y-3">
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  Download for iOS
                </Button>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  Download for Android
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Tablet className="h-6 w-6 mr-2 text-blue-400" />
                Tablet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>Optimized for larger screens and productivity</p>
              <div className="space-y-3">
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  iPad App
                </Button>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  Android Tablet
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Monitor className="h-6 w-6 mr-2 text-purple-400" />
                Desktop
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>Full-featured experience for your computer</p>
              <div className="space-y-3">
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  Windows App
                </Button>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  macOS App
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-center">Features Available on All Platforms</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Social Features</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Share posts and photos</li>
                  <li>Connect with classmates</li>
                  <li>Join study groups</li>
                  <li>Real-time messaging</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Academic Tools</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Find tutors and mentors</li>
                  <li>Schedule study sessions</li>
                  <li>Share resources</li>
                  <li>Academic calendar integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Coming Soon</h3>
          <p className="text-gray-400">
            Native mobile and desktop apps are currently in development. 
            In the meantime, enjoy the full web experience!
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
          >
            Use Web App Now
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Download;
