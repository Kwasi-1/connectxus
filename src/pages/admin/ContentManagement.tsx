import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  AlertTriangle, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Flag,
  MessageSquare,
  Calendar,
  Megaphone,
  Plus,
  Filter
} from 'lucide-react';
import { ContentModerationItem, CampusAnnouncement, CampusEvent } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

export function ContentManagement() {
  const { toast } = useToast();
  const [moderationItems, setModerationItems] = useState<ContentModerationItem[]>([]);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock loading data
    setTimeout(() => {
      const mockModerationItems: ContentModerationItem[] = [
        {
          id: '1',
          type: 'post',
          contentId: 'post_123',
          reporterId: 'user_456',
          reporterName: 'Sarah Chen',
          reason: 'Inappropriate language',
          status: 'pending',
          priority: 'high',
          content: {
            text: 'This is an example of reported content that needs review...',
            author: {
              id: '1',
              username: 'john_doe',
              displayName: 'John Doe',
              email: 'john@university.edu',
              verified: false,
              followers: 120,
              following: 89,
              createdAt: new Date(),
              roles: ['student']
            }
          },
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'comment',
          contentId: 'comment_789',
          reporterId: 'user_789',
          reporterName: 'Mike Johnson',
          reason: 'Spam content',
          status: 'pending',
          priority: 'medium',
          content: {
            text: 'Check out this amazing deal! Click here to learn more...',
            author: {
              id: '2',
              username: 'spam_user',
              displayName: 'Spam User',
              email: 'spam@example.com',
              verified: false,
              followers: 5,
              following: 1,
              createdAt: new Date(),
              roles: ['student']
            }
          },
          createdAt: new Date()
        }
      ];

      const mockAnnouncements: CampusAnnouncement[] = [
        {
          id: '1',
          title: 'Campus Wi-Fi Maintenance',
          content: 'The campus Wi-Fi will undergo maintenance on Saturday from 2-4 PM.',
          type: 'maintenance',
          targetAudience: ['all'],
          priority: 'medium',
          status: 'published',
          authorId: 'admin_1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: 'New Academic Year Registration',
          content: 'Registration for the new academic year starts next Monday.',
          type: 'academic',
          targetAudience: ['students'],
          priority: 'high',
          status: 'scheduled',
          scheduledFor: new Date(Date.now() + 86400000),
          authorId: 'admin_1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockEvents: CampusEvent[] = [
        {
          id: '1',
          title: 'Tech Career Fair 2024',
          description: 'Annual technology career fair with top companies.',
          category: 'professional',
          location: 'Main Auditorium',
          startDate: new Date(Date.now() + 604800000),
          endDate: new Date(Date.now() + 604800000 + 28800000),
          currentAttendees: 150,
          registrationRequired: true,
          status: 'published',
          organizer: 'Career Services',
          tags: ['career', 'technology', 'networking'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setModerationItems(mockModerationItems);
      setAnnouncements(mockAnnouncements);
      setEvents(mockEvents);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleApproveContent = (itemId: string) => {
    setModerationItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, status: 'approved' as const, reviewedAt: new Date() }
          : item
      )
    );
    toast({
      title: "Content Approved",
      description: "The reported content has been approved."
    });
  };

  const handleRejectContent = (itemId: string) => {
    setModerationItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, status: 'removed' as const, reviewedAt: new Date() }
          : item
      )
    );
    toast({
      title: "Content Removed",
      description: "The reported content has been removed.",
      variant: "destructive"
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'removed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const moderationStats = {
    pending: moderationItems.filter(item => item.status === 'pending').length,
    approved: moderationItems.filter(item => item.status === 'approved').length,
    removed: moderationItems.filter(item => item.status === 'removed').length,
    total: moderationItems.length
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold custom-font">Content Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">Content Management</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{moderationStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{moderationStats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Removed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{moderationStats.removed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Flag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="moderation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reported Content</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moderationItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.content.author.avatar} />
                            <AvatarFallback>{item.content.author.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">{item.content.author.displayName}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {item.content.text}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{item.reporterName}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review Content</DialogTitle>
                                <DialogDescription>
                                  Review the reported content and take appropriate action.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Content</Label>
                                  <div className="p-3 bg-muted rounded-md">
                                    {item.content.text}
                                  </div>
                                </div>
                                <div>
                                  <Label>Reason for Report</Label>
                                  <div className="p-3 bg-muted rounded-md">
                                    {item.reason}
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => handleApproveContent(item.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button variant="destructive" onClick={() => handleRejectContent(item.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Megaphone className="h-5 w-5 mr-2" />
                Campus Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getPriorityColor(announcement.priority)}>
                            {announcement.priority}
                          </Badge>
                          <Badge variant="outline">{announcement.type}</Badge>
                          <Badge className={getStatusColor(announcement.status)}>
                            {announcement.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Campus Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>📍 {event.location}</span>
                          <span>📅 {event.startDate.toLocaleDateString()}</span>
                          <span>👥 {event.currentAttendees} attendees</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{event.category}</Badge>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}