
import { useState, useEffect } from 'react';
import { Search, Star, MessageCircle, UserCheck, Briefcase, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MentoringRequestModal } from '@/components/mentors/MentoringRequestModal';
import { MessageModal } from '@/components/messages/MessageModal';
import { MentorApplicationCard } from '@/components/mentors/MentorApplicationCard';
import { MentoringRequestCard } from '@/components/mentors/MentoringRequestCard';
import { EditMentorApplicationModal } from '@/components/mentors/EditMentorApplicationModal';
import { mockMentors } from '@/data/mockData';
import { mockMentorApplications } from '@/data/mockApplications';
import { mockMentoringRequests } from '@/data/mockMentoringData';
import { MentorProfile } from '@/types/global';
import { MentorApplication } from '@/types/applications';
import { MentoringRequest } from '@/types/mentoring';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const industryFilters = ['All', 'Technology', 'Business', 'Finance', 'Healthcare', 'Engineering', 'Marketing'];

const Mentors = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [requests, setRequests] = useState<MentoringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<MentorApplication | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Simulate current user ID
  const currentUserId = '1';
  const hasApplication = applications.some(app => app.applicantId === currentUserId);
  const isApprovedMentor = applications.some(app => app.applicantId === currentUserId && app.status === 'approved');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMentors(mockMentors);
      setApplications(mockMentorApplications);
      setLoading(false);
    };

    fetchData();
  }, []);

  const fetchRequests = async () => {
    setRequestsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRequests(mockMentoringRequests);
    setRequestsLoading(false);
  };

  useEffect(() => {
    if (isApprovedMentor) {
      fetchRequests();
    }
  }, [isApprovedMentor]);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'All' || mentor.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const userApplications = applications.filter(app => app.applicantId === currentUserId);
  const userRequests = requests.filter(req => req.mentorId === currentUserId);

  const handleRequestMentoring = (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setIsRequestModalOpen(true);
  };

  const handleContactMentor = (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setIsMessageModalOpen(true);
  };

  const handleBecomeMentor = () => {
    navigate('/mentors/become-mentor');
  };

  const handleFollowMentor = (mentor: MentorProfile) => {
    toast({
      title: "Following",
      description: `You are now following ${mentor.user.displayName}`,
    });
  };

  const handleEditApplication = (application: MentorApplication) => {
    setSelectedApplication(application);
    setIsEditModalOpen(true);
  };

  const handleSaveApplication = (updatedApplication: MentorApplication) => {
    setApplications(prev => prev.map(app => 
      app.id === updatedApplication.id ? updatedApplication : app
    ));
  };

  const handleDeleteApplication = async (applicationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setApplications(prev => prev.filter(app => app.id !== applicationId));
    toast({
      title: "Application Deleted",
      description: "Your mentor application has been deleted successfully.",
    });
  };

  const handleAcceptRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'accepted' as const } : req
    ));
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'declined' as const } : req
    ));
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="px-4 py-6 md:p-6 space-y-6 custom-fonts">
        <div className="flex justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mentors</h1>
            <p className="text-muted-foreground mt-1">Connect with experienced professionals and alumni</p>
          </div>
          <Button variant="outline" onClick={handleBecomeMentor}>
            <Briefcase className="h-4 w-4" />
            <span className='hidden md:block ml-2'>Become a Mentor</span>
          </Button>
        </div>

        {isApprovedMentor ? (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">Available Mentors</TabsTrigger>
              <TabsTrigger value="services">My Application</TabsTrigger>
              {/* <TabsTrigger value="requests">Requests ({userRequests.length})</TabsTrigger> */}
              {/* <TabsTrigger value="sessions">Sessions</TabsTrigger> */}
            </TabsList>
            
            <TabsContent value="available" className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search mentors or specialties..."
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
                      className='rounded-full px-5'
                    >
                      {industry}
                    </Button>
                  ))}
                </div>
              </div>

              {loading ? (
                <LoadingSpinner size='md' />
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
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
                                  <span className="hidden md:inline ml-2">Contact</span>
                                </Button>
                                <Button 
                                  onClick={() => handleFollowMentor(mentor)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  <span className="hidden md:inline ml-2">Follow</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredMentors.length === 0 && (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No mentors found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="services" className="space-y-4">
              {userApplications.map((application) => (
                <MentorApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={handleEditApplication}
                  onDelete={handleDeleteApplication}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="requests" className="space-y-4">
              {requestsLoading ? (
                <LoadingSpinner size="md" />
              ) : (
                <>
                  {userRequests.length > 0 ? (
                    <div className="space-y-4">
                      {userRequests.map((request) => (
                        <MentoringRequestCard
                          key={request.id}
                          request={request}
                          onAccept={handleAcceptRequest}
                          onDecline={handleDeclineRequest}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No mentoring requests</h3>
                      <p className="text-muted-foreground">Requests from students will appear here</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-4">
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
                <p className="text-muted-foreground">Your confirmed mentoring sessions will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        ) : hasApplication ? (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">Available Mentors</TabsTrigger>
              <TabsTrigger value="application">My Application</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search mentors or specialties..."
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
                      className='rounded-full px-5'
                    >
                      {industry}
                    </Button>
                  ))}
                </div>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="space-y-4">
                    {filteredMentors.map((mentor) => (
                      <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex items-start space-x-4 flex-1">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={mentor.user.avatar} alt={mentor.user.displayName} />
                                <AvatarFallback>{mentor.user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-semibold">{mentor.user.displayName}</h3>
                                  {mentor.verified && (
                                    <Badge variant="default" className="text-xs">Verified</Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground mb-2">{mentor.position} at {mentor.company}</p>
                                <p className="text-sm mb-3">{mentor.description}</p>
                                
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {mentor.specialties.map((specialty, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                    {mentor.rating} ({mentor.reviewCount} reviews)
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {mentor.experience} years experience
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="lg:w-64 space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Industry</h4>
                                <Badge variant="outline">{mentor.industry}</Badge>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => handleContactMentor(mentor)}
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  <span className="ml-2">Contact</span>
                                </Button>
                                <Button 
                                  onClick={() => handleFollowMentor(mentor)}
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

                  {filteredMentors.length === 0 && (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No mentors found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="application" className="space-y-4">
              {userApplications.map((application) => (
                <MentorApplicationCard
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
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search mentors or specialties..."
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
                    className='rounded-full px-5'
                  >
                    {industry}
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="space-y-4">
                  {filteredMentors.map((mentor) => (
                    <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={mentor.user.avatar} alt={mentor.user.displayName} />
                              <AvatarFallback>{mentor.user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-semibold">{mentor.user.displayName}</h3>
                                {mentor.verified && (
                                  <Badge variant="default" className="text-xs">Verified</Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground mb-2">{mentor.position} at {mentor.company}</p>
                              <p className="text-sm mb-3">{mentor.description}</p>
                              
                              <div className="flex flex-wrap gap-1 mb-3">
                                {mentor.specialties.map((specialty, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                  {mentor.rating} ({mentor.reviewCount} reviews)
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {mentor.experience} years experience
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="lg:w-64 space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Industry</h4>
                              <Badge variant="outline">{mentor.industry}</Badge>
                            </div>
                            <Button 
                              onClick={() => handleRequestMentoring(mentor)}
                              className="w-full bg-foreground hover:bg-foreground/90 text-background"
                            >
                              Request Mentoring
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredMentors.length === 0 && (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No mentors found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

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

      {selectedApplication && (
        <EditMentorApplicationModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
          onSave={handleSaveApplication}
        />
      )}
    </AppLayout>
  );
};

export default Mentors;
