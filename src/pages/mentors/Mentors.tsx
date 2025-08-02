import { useState, useEffect } from 'react';
import { Search, Star, Briefcase, MessageCircle, UserPlus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MentoringRequestModal } from '@/components/mentors/MentoringRequestModal';
import { MessageModal } from '@/components/messages/MessageModal';
import { mockMentors } from '@/data/mockData';
import { MentorProfile } from '@/types/global';
import { useNavigate } from 'react-router-dom';

const industryFilters = ['All', 'Technology', 'Business', 'Entrepreneurship', 'Finance', 'Healthcare', 'Education'];

const Mentors = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMentors(mockMentors);
      setLoading(false);
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'All' || mentor.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleContactMentor = (mentor: MentorProfile) => {
    console.log('Contact mentor:', mentor.id);
    setSelectedMentor(mentor);
    setIsMessageModalOpen(true);
  };

  const handleRequestMentoring = (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setIsRequestModalOpen(true);
  };

  const handleBecomeMentor = () => {
    navigate('/mentors/become-mentor');
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 space-y-6 custom-fonts">
        {/* Header */}
        <div className="flex justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mentors</h1>
            <p className="text-muted-foreground mt-1">Connect with experienced professionals and alumni</p>
          </div>
          <Button variant="outline" onClick={handleBecomeMentor}>
            <UserPlus className="h-4 w-4" />
            <span className='hidden md:block ml-2'>Become a Mentor</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search mentors or industries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>

          <div className="flex w-full overflow-x-auto scrollbar-hide gap-2">
            {industryFilters.map((industry) => (
              <Button
                key={industry}
                variant={selectedIndustry === industry ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIndustry(industry)}
                className='rounded-full px-4'
              >
                {industry}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <>
            {/* Mentors Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Mentor Header */}
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={mentor.user.avatar} alt={mentor.user.displayName} />
                          <AvatarFallback>{mentor.user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">{mentor.user.displayName}</h3>
                            {mentor.verified && (
                              <Badge variant="default" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          {mentor.position && mentor.company && (
                            <p className="text-muted-foreground mb-2">
                              {mentor.position} at {mentor.company}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            {mentor.industry} • {mentor.experience} years experience
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground">{mentor.description}</p>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1">
                        {mentor.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      {/* Rating and Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {mentor.rating} ({mentor.reviewCount} reviews)
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => handleContactMentor(mentor)}
                            size="sm"
                            variant="outline"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="hidden md:inline ml-2">Message</span>
                          </Button>
                          <Button 
                            onClick={() => handleRequestMentoring(mentor)}
                            size="sm"
                            className="bg-foreground hover:bg-foreground/90 text-background"
                          >
                            Request Mentoring
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No mentors found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Request Mentoring Modal */}
      {selectedMentor && (
        <MentoringRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setSelectedMentor(null);
          }}
          mentor={selectedMentor}
        />
      )}

      {/* Message Modal */}
      {selectedMentor && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => {
            setIsMessageModalOpen(false);
            setSelectedMentor(null);
          }}
          recipient={selectedMentor.user}
        />
      )}
    </AppLayout>
  );
};

export default Mentors;
