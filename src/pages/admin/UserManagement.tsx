import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Activity,
  Trash2,
  Key,
  Ban,
  UserMinus,
} from "lucide-react";
import { User, UserRole } from "@/types/global";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/api/admin.api";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminSpace } from "@/contexts/AdminSpaceContext";

export function UserManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedSpaceId } = useAdminSpace();
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionUser, setActionUser] = useState<User | null>(null);

  const [suspendReason, setSuspendReason] = useState("");
  const [banReason, setBanReason] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    bio: "",
    department: "",
    level: "undergraduate" as "undergraduate" | "graduate" | "faculty",
    role: "user" as string,
  });
  const [resetPassword, setResetPassword] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getUsers(currentPage, pageSize, selectedSpaceId);
      setUsers(response.users as User[]);
      setTotalUsers(response.total);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedSpaceId, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    try {      await adminApi.createUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        full_name: newUser.username,
        department: newUser.department,
        level: newUser.level,
        role: newUser.role,
        status: "active",
        verified: true,
      });

      toast({
        title: "User Created",
        description: `${newUser.username} has been created successfully.`,
      });

      setNewUser({
        username: "",
        displayName: "",
        email: "",
        password: "",
        bio: "",
        department: "",
        level: "undergraduate" as "undergraduate" | "graduate" | "faculty",
        role: "user",
      });

      setAddUserModalOpen(false);
      await loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      await adminApi.updateUser(editingUser.id, {
        email: editingUser.email,
        full_name: editingUser.username,
        department: editingUser.department,
        role: editingUser.role,
        status: editingUser.isActive ? "active" : "inactive",
      });

      toast({
        title: "User Updated",
        description: `${editingUser.username} has been updated successfully.`,
      });

      setEditUserModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuspendUser = async (user: User) => {
    try {
      const adminUserId = localStorage.getItem("userId") || "";
      await adminApi.suspendUser({
        user_id: user.id,
        suspended_by: adminUserId,
        reason: suspendReason,
        duration_days: 7,
        is_permanent: false,
      });
      await loadUsers();
      setSuspendModalOpen(false);
      setSuspendReason("");
      setActionUser(null);

      toast({
        title: "User Suspended",
        description: `${user.username} has been suspended.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error suspending user:", error);
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async (user: User) => {
    try {
      await adminApi.banUser(user.id, banReason);
      await loadUsers();
      setBanModalOpen(false);
      setBanReason("");
      setActionUser(null);

      toast({
        title: "User Banned",
        description: `${user.username} has been banned permanently.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await adminApi.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setDeleteModalOpen(false);
      setActionUser(null);

      toast({
        title: "User Deleted",
        description: `${user.username} has been deleted permanently.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!resetPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    try {
      await adminApi.resetUserPassword(user.id, resetPassword);

      toast({
        title: "Password Reset",
        description: `Password for ${user.username} has been reset successfully.`,
      });

      setResetPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (
    action: "suspend" | "activate" | "delete"
  ) => {
    try {
      const adminUserId = localStorage.getItem("userId") || "";
      const promises = selectedUsers.map((userId) => {
        switch (action) {
          case "suspend":
            return adminApi.suspendUser({
              user_id: userId,
              suspended_by: adminUserId,
              reason: "Bulk action",
              duration_days: 7,
              is_permanent: false,
            });
          case "delete":
            return adminApi.deleteUser(userId);
          case "activate":
            return adminApi.unsuspendUser(userId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);

      if (action === "delete") {
        setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.id)));
      } else {
        await loadUsers();
      }

      setSelectedUsers([]);

      toast({
        title: "Bulk Action Complete",
        description: `${selectedUsers.length} users ${action}d successfully.`,
      });
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast({
        title: "Error",
        description: `Failed to ${action} users`,
        variant: "destructive",
      });
    }
  };

  const handleExportUsers = async () => {
    try {
      const blob = await adminApi.exportData("csv", "users");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users-export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Users data exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export users",
        variant: "destructive",
      });
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map((u) => u.id)
    );
  };

  const getStatusBadge = (user: User) => {
    const roleColors: Record<string, string> = {
      'super_admin': 'bg-red-600 text-white',
      'admin': 'bg-campus-purple text-white',
      'support_staff': 'bg-blue-600 text-white',
      'content_moderator': 'bg-green-600 text-white',
      'finance_officer': 'bg-yellow-600 text-white',
      'operations_manager': 'bg-indigo-600 text-white',
      'developer_admin': 'bg-gray-700 text-white',
      'user': 'bg-gray-400 text-white'
    };

    const roleLabels: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'support_staff': 'Support Staff',
      'content_moderator': 'Content Moderator',
      'finance_officer': 'Finance Officer',
      'operations_manager': 'Operations Manager',
      'developer_admin': 'Developer Admin',
      'user': 'User'
    };

    const roleClass = roleColors[user.role] || 'bg-gray-400 text-white';
    const roleLabel = roleLabels[user.role] || user.role;

    return <Badge className={roleClass}>{roleLabel}</Badge>;
  };

  const userStats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'super_admin' || u.role === 'admin').length,
    staff: users.filter((u) => u.role === 'support_staff' || u.role === 'content_moderator' || u.role === 'finance_officer' || u.role === 'operations_manager').length,
    developers: users.filter((u) => u.role === 'developer_admin').length,
    regularUsers: users.filter((u) => u.role === 'user').length,
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">User Management</h1>
        <div className="flex items-center space-x-2">
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedUsers.length} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction("suspend")}>
                    <UserX className="mr-2 h-4 w-4" />
                    Suspend Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("activate")}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("delete")}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={addUserModalOpen} onOpenChange={setAddUserModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      placeholder="john_doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="john@university.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={newUser.bio}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Student bio..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newUser.department}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select
                      value={newUser.level}
                      onValueChange={(
                        value: "undergraduate" | "graduate" | "faculty"
                      ) => setNewUser((prev) => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="undergraduate">
                          Undergraduate
                        </SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support_staff">Support Staff</SelectItem>
                      <SelectItem value="content_moderator">Content Moderator</SelectItem>
                      <SelectItem value="finance_officer">Finance Officer</SelectItem>
                      <SelectItem value="operations_manager">Operations Manager</SelectItem>
                      <SelectItem value="developer_admin">Developer Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddUserModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
            <Badge className="bg-campus-purple text-white">
              {userStats.faculty}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.faculty}</div>
          </CardContent>
        </Card>
      </div>

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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="support_staff">Support Staff</SelectItem>
                  <SelectItem value="content_moderator">Content Moderator</SelectItem>
                  <SelectItem value="finance_officer">Finance Officer</SelectItem>
                  <SelectItem value="operations_manager">Operations Manager</SelectItem>
                  <SelectItem value="developer_admin">Developer Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
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
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>
                          {user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{user.username}</div>
                          {user.verified && (
                            <Shield className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {moment(user.createdAt).format("Do MMMM")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingUser(user);
                            setEditUserModalOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleResetPassword(user)}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="mr-2 h-4 w-4" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setActionUser(user);
                            setSuspendModalOpen(true);
                          }}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setActionUser(user);
                            setBanModalOpen(true);
                          }}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Ban User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setActionUser(user);
                            setDeleteModalOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
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

      <Dialog open={editUserModalOpen} onOpenChange={setEditUserModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editingUser.username}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, username: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-displayName">Display Name</Label>
                  <Input
                    id="edit-displayName"
                    value={editingUser.username}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, displayName: e.target.value } : null
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, email: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={editingUser.bio || ""}
                  onChange={(e) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, bio: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-verified"
                  checked={editingUser.verified}
                  onCheckedChange={(checked) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, verified: checked as boolean } : null
                    )
                  }
                />
                <Label htmlFor="edit-verified">Verified Account</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditUserModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {actionUser?.displayName}? Please
              provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">Reason for suspension</Label>
              <Textarea
                id="suspend-reason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter reason for suspension..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspendModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => actionUser && handleSuspendUser(actionUser)}
            >
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {actionUser?.displayName}? This
              action is more severe than suspension.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason for ban</Label>
              <Textarea
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for ban..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => actionUser && handleBanUser(actionUser)}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {actionUser?.displayName}? This
              action cannot be undone. All user data will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => actionUser && handleDeleteUser(actionUser)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
