import { useState, useEffect } from 'react';
import { Search, Star, Clock, DollarSign, BookOpen, MessageCircle, UserCheck } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TutoringRequestModal } from '@/components/tutoring/TutoringRequestModal';
import { MessageModal } from '@/components/messages/MessageModal';
import { TutorApplicationCard } from '@/components/tutoring/TutorApplicationCard';
import { mockTutors } from '@/data/mockData';
import { mockTutorApplications } from '@/data/mockApplications';
import { TutorProfile } from '@/types/global';
import { TutorApplication } from '@/types/applications';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const subjectFilters = ['All', 'DCIT 101', 'DCIT 201', 'Mathematics', 'Programming', 'Calculus I', 'Statistics'];

const Tutoring = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Simulate current user ID (in real app, this would come from auth)
  const currentUserId = '1';
  const hasApplication = applications.some(app => app.applicantId === currentUserId);
  const isApprovedTutor = applications.some(app => app.applicantId === currentUserId && app.status === 'approved');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTutors(mockTutors);
      setApplications(mockTutorApplications);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutor.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || tutor.subjects.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  const userApplications = applications.filter(app => app.applicantId === currentUserId);

  const handleRequestTutoring = (tutor: TutorProfile) => {
    setSelectedTutor(tutor);
    setIsRequestModalOpen(true);
  };

  const handleContactTutor = (tutor: TutorProfile) => {
    setSelectedTutor(tutor);
    setIsMessageModalOpen(true);
  };

  const handleBecomeTutor = () => {
    navigate('/tutoring/become-tutor');
  };

  const handleEditApplication = (application: TutorApplication) => {
    console.log('Edit application:', application.id);
    toast({
      title: "Edit Application",
      description: "This feature will be implemented soon.",
    });
  };

  const handleDeleteApplication = async (applicationId: string) => {
    console.log('Delete application:', applicationId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setApplications(prev => prev.filter(app => app.id !== applicationId));
    toast({
      title: "Application Deleted",
      description: "Your tutor application has been deleted successfully.",
    });
  };

  const handleFollowTutor = (tutor: TutorProfile) => {
    toast({
      title: "Following",
      description: `You are now following ${tutor.user.displayName}`,
    });
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

        {isApprovedTutor ? (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available Tutors</TabsTrigger>
              <TabsTrigger value="services">My Services</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available" className="space-y-4">
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
                <LoadingSpinner size='md' />
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
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => handleContactTutor(tutor)}
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  <span className="ml-2">Contact</span>
                                </Button>
                                <Button 
                                  onClick={() => handleFollowTutor(tutor)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              </div>
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
            </TabsContent>
            
            <TabsContent value="services" className="space-y-4">
              {userApplications.map((application) => (
                <TutorApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={handleEditApplication}
                  onDelete={handleDeleteApplication}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="requests" className="space-y-4">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No tutoring requests</h3>
                <p className="text-muted-foreground">Requests from students will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        ) : hasApplication ? (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">Available Tutors</TabsTrigger>
              <TabsTrigger value="application">My Application</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              {/* Same content as the regular tutoring page */}
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
                <LoadingSpinner />
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
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => handleContactTutor(tutor)}
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  <span className="ml-2">Contact</span>
                                </Button>
                                <Button 
                                  onClick={() => handleFollowTutor(tutor)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              </div>
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
            </TabsContent>
            
            <TabsContent value="application" className="space-y-4">
              {userApplications.map((application) => (
                <TutorApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={handleEditApplication}
                  onDelete={handleDeleteApplication}
                />
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {/* Regular tutoring page content */}
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
              <LoadingSpinner />
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

      {/* Message Modal */}
      {selectedTutor && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => {
            setIsMessageModalOpen(false);
            setSelectedTutor(null);
          }}
          recipient={selectedTutor.user}
        />
      )}
    </AppLayout>
  );
};

export default Tutoring;
