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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  MoreHorizontal, 
  UserX, 
  UserCheck, 
  Edit, 
  Shield,
  Filter,
  Download,
  Plus,
  Activity
} from 'lucide-react';
import { User } from '@/types/global';
import { useToast } from '@/hooks/use-toast';

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock loading users
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'john_doe',
          displayName: 'John Doe',
          email: 'john.doe@university.edu',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          bio: 'Computer Science student, passionate about AI',
          verified: true,
          followers: 234,
          following: 156,
          university: 'University of Ghana',
          major: 'Computer Science',
          year: 3,
          createdAt: new Date('2023-09-15'),
          roles: ['student'],
          department: 'Computer Science',
          level: 'undergraduate',
          mentorStatus: 'approved',
          tutorStatus: 'pending'
        },
        {
          id: '2',
          username: 'sarah_chen',
          displayName: 'Sarah Chen',
          email: 'sarah.chen@university.edu',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
          bio: 'Mathematics tutor and research assistant',
          verified: true,
          followers: 189,
          following: 98,
          university: 'University of Ghana',
          major: 'Mathematics',
          year: 4,
          createdAt: new Date('2023-08-20'),
          roles: ['student', 'tutor'],
          department: 'Mathematics',
          level: 'undergraduate',
          tutorStatus: 'approved'
        },
        {
          id: '3',
          username: 'prof_johnson',
          displayName: 'Dr. Michael Johnson',
          email: 'michael.johnson@university.edu',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          bio: 'Professor of Computer Science, AI Research',
          verified: true,
          followers: 892,
          following: 234,
          university: 'University of Ghana',
          major: 'Computer Science',
          createdAt: new Date('2022-01-10'),
          roles: ['lecturer', 'mentor'],
          department: 'Computer Science',
          level: 'faculty',
          mentorStatus: 'approved'
        }
      ];
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.roles.includes(selectedRole as any);
    
    return matchesSearch && matchesRole;
  });

  const handleSuspendUser = (userId: string) => {
    toast({
      title: "User Suspended",
      description: "User has been suspended successfully.",
      variant: "destructive"
    });
  };

  const handleActivateUser = (userId: string) => {
    toast({
      title: "User Activated",
      description: "User has been activated successfully."
    });
  };

  const getStatusBadge = (user: User) => {
    if (user.roles.includes('lecturer')) {
      return <Badge className="bg-campus-purple text-white">Faculty</Badge>;
    }
    if (user.roles.includes('tutor')) {
      return <Badge className="bg-primary">Tutor</Badge>;
    }
    if (user.roles.includes('mentor')) {
      return <Badge className="bg-campus-orange text-white">Mentor</Badge>;
    }
    return <Badge variant="secondary">Student</Badge>;
  };

  const userStats = {
    total: users.length,
    students: users.filter(u => u.roles.includes('student')).length,
    tutors: users.filter(u => u.roles.includes('tutor')).length,
    mentors: users.filter(u => u.roles.includes('mentor')).length,
    faculty: users.filter(u => u.roles.includes('lecturer')).length
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold custom-font">User Management</h1>
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
        <h1 className="text-3xl font-bold custom-font">User Management</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Badge variant="secondary">{userStats.students}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tutors</CardTitle>
            <Badge className="bg-primary">{userStats.tutors}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.tutors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty</CardTitle>
            <Badge className="bg-campus-purple text-white">{userStats.faculty}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.faculty}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="lecturer">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.displayName} />
                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{user.displayName}</div>
                          {user.verified && <Shield className="h-3 w-3 text-primary" />}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user)}
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="mr-2 h-4 w-4" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                          <UserX className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleActivateUser(user.id)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate User
                        </DropdownMenuItem>
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