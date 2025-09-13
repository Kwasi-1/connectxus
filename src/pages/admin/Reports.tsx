import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  MoreHorizontal, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Flag,
  Eye,
  Trash2,
  UserX,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContentModerationItem } from '@/types/admin';

export function Reports() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ContentModerationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      const mockReports: ContentModerationItem[] = [
        {
          id: '1',
          type: 'post',
          contentId: 'post-123',
          reporterId: 'user-456',
          reporterName: 'Sarah Chen',
          reason: 'Inappropriate content',
          status: 'pending',
          priority: 'high',
          content: {
            text: 'This is an example of reported content that may contain inappropriate material...',
            images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop'],
            author: {
              id: 'user-789',
              username: 'john_doe',
              displayName: 'John Doe',
              email: 'john@university.edu',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
              verified: false,
              followers: 234,
              following: 156,
              university: 'University of Ghana',
              major: 'Computer Science',
              year: 3,
              createdAt: new Date(),
              roles: ['student']
            }
          },
          createdAt: new Date('2024-01-15T10:30:00')
        },
        {
          id: '2',
          type: 'comment',
          contentId: 'comment-456',
          reporterId: 'user-789',
          reporterName: 'Mike Johnson',
          reason: 'Harassment',
          status: 'approved',
          priority: 'urgent',
          reviewedBy: 'Admin',
          reviewedAt: new Date('2024-01-14T15:45:00'),
          content: {
            text: 'This comment was reported for harassment...',
            author: {
              id: 'user-321',
              username: 'emma_w',
              displayName: 'Emma Wilson',
              email: 'emma@university.edu',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
              verified: true,
              followers: 189,
              following: 98,
              university: 'University of Ghana',
              major: 'Mathematics',
              year: 4,
              createdAt: new Date(),
              roles: ['student']
            }
          },
          createdAt: new Date('2024-01-14T09:15:00')
        },
        {
          id: '3',
          type: 'group',
          contentId: 'group-789',
          reporterId: 'user-654',
          reporterName: 'Alex Brown',
          reason: 'Spam activity',
          status: 'rejected',
          priority: 'medium',
          reviewedBy: 'Super Admin',
          reviewedAt: new Date('2024-01-13T11:20:00'),
          content: {
            text: 'Gaming Community - reported for spam activities...',
            author: {
              id: 'user-987',
              username: 'game_master',
              displayName: 'Game Master',
              email: 'gamemaster@university.edu',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
              verified: false,
              followers: 456,
              following: 234,
              university: 'University of Ghana',
              major: 'Engineering',
              year: 2,
              createdAt: new Date(),
              roles: ['student']
            }
          },
          createdAt: new Date('2024-01-13T08:00:00')
        }
      ];
      setReports(mockReports);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.content.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.content.author.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const handleApproveReport = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { 
        ...report, 
        status: 'approved' as const,
        reviewedBy: 'Admin',
        reviewedAt: new Date()
      } : report
    ));
    toast({
      title: "Report Approved",
      description: "Content has been removed and user has been notified."
    });
  };

  const handleRejectReport = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { 
        ...report, 
        status: 'rejected' as const,
        reviewedBy: 'Admin',
        reviewedAt: new Date()
      } : report
    ));
    toast({
      title: "Report Rejected",
      description: "No action taken. Content remains published."
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-600 text-white">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white">Rejected</Badge>;
      case 'removed':
        return <Badge className="bg-gray-600 text-white">Removed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-600 text-white">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-600 text-white">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600 text-white">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <Flag className="h-4 w-4" />;
      case 'comment':
        return <AlertTriangle className="h-4 w-4" />;
      case 'group':
        return <UserX className="h-4 w-4" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  };

  const reportStats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    approved: reports.filter(r => r.status === 'approved').length,
    rejected: reports.filter(r => r.status === 'rejected').length
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold custom-font">Reports & Moderation</h1>
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
        <h1 className="text-3xl font-bold custom-font">Reports & Moderation</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Moderation Queue</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
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
                <TableHead>Reported</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarImage src={report.content.author.avatar} alt={report.content.author.displayName} />
                        <AvatarFallback>{report.content.author.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{report.content.author.displayName}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {report.content.text}
                        </div>
                        {report.content.images && report.content.images.length > 0 && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {report.content.images.length} image(s)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(report.type)}
                      <span className="capitalize">{report.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{report.reporterName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.reason}</Badge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>{report.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {report.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleApproveReport(report.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve & Remove
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectReport(report.id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Report
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserX className="mr-2 h-4 w-4" />
                              Warn User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}