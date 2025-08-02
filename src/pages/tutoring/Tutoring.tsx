
import { useState, useEffect } from 'react';
import { Search, Star, Clock, DollarSign, BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TutoringRequestModal } from '@/components/tutoring/TutoringRequestModal';
import { mockTutors } from '@/data/mockData';
import { TutorProfile } from '@/types/global';

const subjectFilters = ['All', 'DCIT 101', 'DCIT 201', 'Mathematics', 'Programming', 'Calculus I', 'Statistics'];

const Tutoring = () => {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTutors(mockTutors);
      setLoading(false);
    };

    fetchTutors();
  }, []);

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutor.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || tutor.subjects.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  const handleRequestTutoring = (tutor: TutorProfile) => {
    setSelectedTutor(tutor);
    setIsRequestModalOpen(true);
  };

  const handleBecomeTutor = () => {
    // Future: Navigate to tutor application form
    console.log('Navigate to become a tutor form');
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 space-y-6 custom-fonts">
        {/* Header */}
        <div className="flex justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tutoring</h1>
            <p className="text-muted-foreground mt-1">Find tutors to help with your studies</p>
          </div>
          <Button variant="outline" onClick={handleBecomeTutor}>
            <BookOpen className="h-4 w-4" />
            <span className='hidden md:block ml-2'>Become a Tutor</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tutors or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>

          <div className="flex w-full overflow-x-auto scrollbar-hide gap-2">
            {subjectFilters.map((subject) => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSubject(subject)}
                className='rounded-full px-5'
              >
                {subject}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <>
            {/* Tutors List */}
            <div className="space-y-4">
              {filteredTutors.map((tutor) => (
                <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Tutor Info */}
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={tutor.user.avatar} alt={tutor.user.displayName} />
                          <AvatarFallback>{tutor.user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{tutor.user.displayName}</h3>
                            {tutor.verified && (
                              <Badge variant="default" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-4 lg:mb-2">{tutor.user.major} • Year {tutor.user.year}</p>
                          <p className="text-sm mb-3 -ml-[5rem] lg:ml-0">{tutor.description}</p>
                          
                          {/* Subjects */}
                          <div className="flex flex-wrap gap-1 mb-3 -ml-20 lg:ml-0">
                            {tutor.subjects.map((subject, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground -ml-20 lg:ml-0">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              {tutor.rating} ({tutor.reviewCount} reviews)
                            </div>
                            {tutor.hourlyRate && (
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                ${tutor.hourlyRate}/hour
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Availability & Actions */}
                      <div className="lg:w-64 space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Availability
                          </h4>
                          <div className="space-y-1">
                            {tutor.availability.slice(0, 2).map((slot, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                {slot.day}: {slot.startTime} - {slot.endTime}
                              </div>
                            ))}
                            {tutor.availability.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{tutor.availability.length - 2} more slots
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleRequestTutoring(tutor)}
                          className="w-full bg-foreground hover:bg-foreground/90 text-background"
                        >
                          Request Tutoring
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredTutors.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No tutors found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Request Modal */}
      {selectedTutor && (
        <TutoringRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setSelectedTutor(null);
          }}
          tutor={selectedTutor}
        />
      )}
    </AppLayout>
  );
};

export default Tutoring;
