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
  Users, 
  Shield, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GroupManagement } from '@/types/admin';

export function CommunitiesGroups() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<GroupManagement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      const mockGroups: GroupManagement[] = [
        {
          id: '1',
          name: 'Computer Science Study Group',
          description: 'A community for CS students to collaborate on projects and share resources',
          category: 'Academic',
          memberCount: 245,
          status: 'active',
          visibility: 'public',
          createdBy: 'John Doe',
          moderators: ['John Doe', 'Sarah Chen'],
          flags: 0,
          lastActivity: new Date('2024-01-15'),
          createdAt: new Date('2023-09-01')
        },
        {
          id: '2',
          name: 'Photography Club',
          description: 'Share your photography skills and organize photo walks around campus',
          category: 'Creative',
          memberCount: 89,
          status: 'active',
          visibility: 'public',
          createdBy: 'Emma Wilson',
          moderators: ['Emma Wilson'],
          flags: 1,
          lastActivity: new Date('2024-01-14'),
          createdAt: new Date('2023-10-15')
        },
        {
          id: '3',
          name: 'Gaming Community',
          description: 'Connect with fellow gamers and organize tournaments',
          category: 'Entertainment',
          memberCount: 156,
          status: 'suspended',
          visibility: 'public',
          createdBy: 'Mike Johnson',
          moderators: ['Mike Johnson', 'Alex Brown'],
          flags: 3,
          lastActivity: new Date('2024-01-10'),
          createdAt: new Date('2023-11-01')
        },
        {
          id: '4',
          name: 'Mathematics Tutoring',
          description: 'Get help with mathematics courses and share study materials',
          category: 'Academic',
          memberCount: 78,
          status: 'active',
          visibility: 'private',
          createdBy: 'Dr. Smith',
          moderators: ['Dr. Smith', 'Lisa Wang'],
          flags: 0,
          lastActivity: new Date('2024-01-13'),
          createdAt: new Date('2023-08-20')
        }
      ];
      setGroups(mockGroups);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || group.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'flagged' && group.flags > 0) ||
                      (activeTab === 'pending' && group.status === 'suspended');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const handleApproveGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, status: 'active' as const } : group
    ));
    toast({
      title: "Group Approved",
      description: "Group has been approved and activated."
    });
  };

  const handleSuspendGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, status: 'suspended' as const } : group
    ));
    toast({
      title: "Group Suspended",
      description: "Group has been suspended.",
      variant: "destructive"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-600 text-white">Suspended</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    return visibility === 'public' 
      ? <Badge variant="outline">Public</Badge>
      : <Badge className="bg-campus-orange text-white">Private</Badge>;
  };

  const groupStats = {
    total: groups.length,
    active: groups.filter(g => g.status === 'active').length,
    suspended: groups.filter(g => g.status === 'suspended').length,
    flagged: groups.filter(g => g.flags > 0).length
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold custom-font">Communities & Groups</h1>
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
        <h1 className="text-3xl font-bold custom-font">Communities & Groups</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats.suspended}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats.flagged}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Groups Management</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All Groups</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
            </TabsList>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {group.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Created by {group.createdBy}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{group.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{group.memberCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(group.status)}</TableCell>
                  <TableCell>{getVisibilityBadge(group.visibility)}</TableCell>
                  <TableCell>
                    {group.flags > 0 ? (
                      <Badge className="bg-red-600 text-white">{group.flags}</Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>{group.lastActivity.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          View Members
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          Manage Moderators
                        </DropdownMenuItem>
                        {group.status === 'suspended' ? (
                          <DropdownMenuItem onClick={() => handleApproveGroup(group.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Group
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSuspendGroup(group.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Suspend Group
                          </DropdownMenuItem>
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