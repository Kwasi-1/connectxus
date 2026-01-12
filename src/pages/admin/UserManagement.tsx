import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  ShieldBan,
  Search,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Ban,
  Key,
  Activity,
  Filter,
  Building2,
} from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { adminApi } from "@/api/admin.api";
import { useToast } from "@/hooks/use-toast";
import moment from "moment";

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar?: string | null;
  bio?: string | null;
  role: string;
  status: string;
  department: string;
  level?: string | null;
  verified?: boolean;
  created_at: string;
}

export function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentSpaceId, setCurrentSpaceId] = React.useState<string>(() => {
    return localStorage.getItem("admin-current-space-id") || "";
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      const newSpaceId = localStorage.getItem("admin-current-space-id") || "";
      setCurrentSpaceId(newSpaceId);
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(20);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);

  const [addUserModalOpen, setAddUserModalOpen] = React.useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = React.useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = React.useState(false);
  const [banModalOpen, setBanModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = React.useState(false);

  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [actionUser, setActionUser] = React.useState<User | null>(null);
  const [suspendReason, setSuspendReason] = React.useState("");
  const [banReason, setBanReason] = React.useState("");
  const [resetPassword, setResetPassword] = React.useState("");

  const [newUser, setNewUser] = React.useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    department: "",
    level: "" as string,
    role: "user" as string,
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users", currentPage, pageSize, currentSpaceId],
    queryFn: () => adminApi.getUsers(currentPage, pageSize, currentSpaceId),
    enabled: !!currentSpaceId && currentSpaceId !== "all",
    staleTime: 30000,
  });

  const users = (usersData?.users || []) as User[];
  const totalUsers = usersData?.total || 0;

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      const matchesStatus =
        selectedStatus === "all" || user.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const userStats = React.useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
      banned: users.filter((u) => u.status === "banned").length,
      admins: users.filter(
        (u) => u.role === "super_admin" || u.role === "admin"
      ).length,
      staff: users.filter(
        (u) =>
          u.role === "support_staff" ||
          u.role === "content_moderator" ||
          u.role === "finance_officer" ||
          u.role === "operations_manager"
      ).length,
      developers: users.filter((u) => u.role === "developer_admin").length,
      regularUsers: users.filter((u) => u.role === "user").length,
    };
  }, [users]);

  const createUserMutation = useMutation({
    mutationFn: (data: any) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User Created",
        description: "User has been created successfully.",
      });
      setAddUserModalOpen(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        full_name: "",
        department: "",
        level: "",
        role: "user",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });
      setEditUserModalOpen(false);
      setEditingUser(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: (data: any) => adminApi.suspendUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User Suspended",
        description: "User has been suspended.",
        variant: "destructive",
      });
      setSuspendModalOpen(false);
      setSuspendReason("");
      setActionUser(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to suspend user.",
        variant: "destructive",
      });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.banUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User Banned",
        description: "User has been banned permanently.",
        variant: "destructive",
      });
      setBanModalOpen(false);
      setBanReason("");
      setActionUser(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to ban user.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User Deleted",
        description: "User has been deleted permanently.",
        variant: "destructive",
      });
      setDeleteModalOpen(false);
      setActionUser(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminApi.resetUserPassword(id, password),
    onSuccess: () => {
      toast({
        title: "Password Reset",
        description: "Password has been reset successfully.",
      });
      setResetPasswordModalOpen(false);
      setResetPassword("");
      setActionUser(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset password.",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    createUserMutation.mutate({
      ...newUser,
      status: "active",
      verified: true,
    });
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      data: {
        email: editingUser.email,
        full_name: editingUser.full_name,
        department: editingUser.department,
        role: editingUser.role,
        status: editingUser.status,
      },
    });
  };

  const handleSuspendUser = () => {
    if (!actionUser) return;
    const adminUserId = localStorage.getItem("userId") || "";
    suspendUserMutation.mutate({
      user_id: actionUser.id,
      suspended_by: adminUserId,
      reason: suspendReason,
      duration_days: 7,
      is_permanent: false,
    });
  };

  const handleBanUser = () => {
    if (!actionUser) return;
    banUserMutation.mutate({
      id: actionUser.id,
      reason: banReason,
    });
  };

  const handleDeleteUser = () => {
    if (!actionUser) return;
    deleteUserMutation.mutate(actionUser.id);
  };

  const handleResetPassword = () => {
    if (!actionUser || !resetPassword) return;
    resetPasswordMutation.mutate({
      id: actionUser.id,
      password: resetPassword,
    });
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

  const handleExportUsers = async () => {
    try {
      const blob = await adminApi.exportData("csv", "users");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${moment().format("YYYY-MM-DD")}.csv`;
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
        description: "Failed to export users.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: "suspend" | "activate" | "delete") => {
    if (selectedUsers.length === 0) return;

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
          case "activate":
            return adminApi.unsuspendUser(userId);
          case "delete":
            return adminApi.deleteUser(userId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUsers([]);

      toast({
        title: "Bulk Action Complete",
        description: `${selectedUsers.length} users ${action}d successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} users.`,
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      super_admin: "bg-red-600 text-white",
      admin: "bg-purple-600 text-white",
      support_staff: "bg-blue-600 text-white",
      content_moderator: "bg-green-600 text-white",
      finance_officer: "bg-yellow-600 text-white",
      operations_manager: "bg-indigo-600 text-white",
      developer_admin: "bg-gray-700 text-white",
      user: "bg-gray-400 text-white",
    };

    const roleLabels: Record<string, string> = {
      super_admin: "Super Admin",
      admin: "Admin",
      support_staff: "Support Staff",
      content_moderator: "Content Moderator",
      finance_officer: "Finance Officer",
      operations_manager: "Operations Manager",
      developer_admin: "Developer Admin",
      user: "User",
    };

    const roleClass = roleColors[role] || "bg-gray-400 text-white";
    const roleLabel = roleLabels[role] || role;

    return <Badge className={roleClass}>{roleLabel}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
            Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800">
            Suspended
          </Badge>
        );
      case "banned":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
            Banned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!currentSpaceId || currentSpaceId === "all") {
    return (
      <AdminPageLayout title="User Management">
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Space</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Please select a specific space from the space switcher to manage
              users.
            </p>
          </CardContent>
        </Card>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="User Management">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{userStats.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all roles
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{userStats.active}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently active
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Suspended
              </CardTitle>
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950">
                <UserX className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{userStats.suspended}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Temporarily suspended
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admins & Staff
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {userStats.admins + userStats.staff}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Privileged accounts
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users
              </CardTitle>
              <div className="flex items-center gap-2">
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
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
                        <DropdownMenuItem
                          onClick={() => handleBulkAction("suspend")}
                        >
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
                <Button size="sm" onClick={() => setAddUserModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="support_staff">Support Staff</SelectItem>
                  <SelectItem value="content_moderator">
                    Content Moderator
                  </SelectItem>
                  <SelectItem value="finance_officer">
                    Finance Officer
                  </SelectItem>
                  <SelectItem value="operations_manager">
                    Operations Manager
                  </SelectItem>
                  <SelectItem value="developer_admin">
                    Developer Admin
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {searchQuery || selectedRole !== "all" || selectedStatus !== "all"
                    ? "Try adjusting your filters or search query."
                    : "No users are registered in this space yet."}
                </p>
              </div>
            ) : (
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
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback>
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{user.username}</div>
                              {user.verified && (
                                <Shield className="h-3 w-3 text-blue-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{user.department || "—"}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {moment(user.created_at).format("MMM D, YYYY")}
                        </span>
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
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setActionUser(user);
                                setResetPasswordModalOpen(true);
                              }}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Activity className="mr-2 h-4 w-4" />
                              View Activity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status !== "suspended" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setActionUser(user);
                                  setSuspendModalOpen(true);
                                }}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend User
                              </DropdownMenuItem>
                            )}
                            {user.status !== "banned" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setActionUser(user);
                                  setBanModalOpen(true);
                                }}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Ban User
                              </DropdownMenuItem>
                            )}
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
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalUsers > pageSize && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {Math.ceil(totalUsers / pageSize)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= Math.ceil(totalUsers / pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Dialog open={addUserModalOpen} onOpenChange={setAddUserModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account for this space.
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
                    setNewUser((prev) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="john_doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, full_name: e.target.value }))
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
                  setNewUser((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Enter password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newUser.department}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, department: e.target.value }))
                  }
                  placeholder="Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={newUser.level}
                  onValueChange={(value) =>
                    setNewUser((prev) => ({ ...prev, level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
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
                  <SelectItem value="content_moderator">
                    Content Moderator
                  </SelectItem>
                  <SelectItem value="finance_officer">Finance Officer</SelectItem>
                  <SelectItem value="operations_manager">
                    Operations Manager
                  </SelectItem>
                  <SelectItem value="developer_admin">Developer Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
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
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-full_name">Full Name</Label>
                  <Input
                    id="edit-full_name"
                    value={editingUser.full_name}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, full_name: e.target.value } : null
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
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={editingUser.department || ""}
                  onChange={(e) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, department: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, role: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support_staff">Support Staff</SelectItem>
                      <SelectItem value="content_moderator">
                        Content Moderator
                      </SelectItem>
                      <SelectItem value="finance_officer">
                        Finance Officer
                      </SelectItem>
                      <SelectItem value="operations_manager">
                        Operations Manager
                      </SelectItem>
                      <SelectItem value="developer_admin">
                        Developer Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingUser.status}
                    onValueChange={(value) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, status: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            <Button
              onClick={handleEditUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend User Modal */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspend {actionUser?.username} for 7 days. Please provide a reason.
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
                rows={4}
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
              onClick={handleSuspendUser}
              disabled={suspendUserMutation.isPending || !suspendReason}
            >
              {suspendUserMutation.isPending ? "Suspending..." : "Suspend User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Modal */}
      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User Permanently</DialogTitle>
            <DialogDescription>
              Permanently ban {actionUser?.username}. This action is more severe
              than suspension.
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
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={banUserMutation.isPending || !banReason}
            >
              {banUserMutation.isPending ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {actionUser?.username}? This action
              cannot be undone. All user data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Modal */}
      <Dialog
        open={resetPasswordModalOpen}
        onOpenChange={setResetPasswordModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {actionUser?.username}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Password</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Enter new password..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending || !resetPassword}
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}

export default UserManagement;
