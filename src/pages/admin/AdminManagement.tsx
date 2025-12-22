import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  MoreHorizontal,
  Shield,
  UserPlus,
  Edit,
  Trash2,
  Crown,
  Settings,
  CheckCircle,
  XCircle,
  Plus,
  Users,
  Key,
  Power,
  PowerOff,
  Filter,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminUser, AdminRole, AdminPermission } from "@/types/admin";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminApi } from "@/api/admin.api";

export function AdminManagement() {
  const { toast } = useToast();
  const { hasRole } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    console.log("AdminManagement component mounted");
    return () => {
      console.log("AdminManagement component unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("Modal states changed:", {
      showCreateModal,
      showEditModal,
      showPermissionsModal,
      showDeleteDialog,
    });
  }, [showCreateModal, showEditModal, showPermissionsModal, showDeleteDialog]);

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    role: "admin" as AdminRole,
    permissions: [] as AdminPermission[],
    department: "",
    university: "University of Ghana",
  });

  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  const availablePermissions: {
    value: AdminPermission;
    label: string;
    description: string;
  }[] = [
    {
      value: "user_management",
      label: "User Management",
      description: "Manage student and faculty accounts",
    },
    {
      value: "content_management",
      label: "Content Management",
      description: "Moderate posts, comments, and media",
    },
    {
      value: "community_management",
      label: "Community Management",
      description: "Manage groups and communities",
    },
    {
      value: "tutoring_management",
      label: "Tutoring Management",
      description: "Oversee tutoring  programs",
    },
    {
      value: "analytics",
      label: "Analytics",
      description: "View system analytics and reports",
    },
    {
      value: "admin_management",
      label: "Admin Management",
      description: "Manage other administrators (Super Admin only)",
    },
    {
      value: "system_settings",
      label: "System Settings",
      description: "Configure system-wide settings",
    },
    {
      value: "reports",
      label: "Reports Access",
      description: "View and manage content reports",
    },
    {
      value: "notifications",
      label: "Notifications",
      description: "Manage system notifications",
    },
  ];

  const departments = [
    "Student Affairs",
    "Academic Affairs",
    "Communications",
    "Information Technology",
    "Human Resources",
    "Finance",
    "Security",
    "General Administration",
  ];

  useEffect(() => {
    loadAdmins();
  }, [statusFilter]);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAdmins(
        statusFilter === "all" ? undefined : statusFilter,
        1,
        100
      );

      const transformedAdmins: AdminUser[] = data.admins.map((item: any) => ({
        id: item.id,
        email: item.email,
        name: item.full_name || item.username,
        role: item.roles?.[0] || "admin",
        permissions: item.roles || [],
        avatar: item.avatar,
        university: "University of Ghana",
        department: item.department,
        createdAt: new Date(item.created_at),
        lastLogin: item.last_login ? new Date(item.last_login) : undefined,
        isActive: item.status === "active",
        createdBy: item.created_by,
      }));

      setAdmins(transformedAdmins);
    } catch (error) {
      console.error("Failed to load admins:", error);
      toast({
        title: "Error",
        description: "Failed to load administrators. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || admin.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && admin.isActive) ||
      (statusFilter === "inactive" && !admin.isActive);
    const matchesDepartment =
      departmentFilter === "all" || admin.department === departmentFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const handleCreateAdmin = useCallback(() => {
    console.log("handleCreateAdmin called", {
      newAdmin,
      admins: admins.length,
    });
    try {
      if (
        !newAdmin.name.trim() ||
        !newAdmin.email.trim() ||
        !newAdmin.university.trim()
      ) {
        toast({
          title: "Missing Information",
          description:
            "Please fill in all required fields (Name, Email, University).",
          variant: "destructive",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAdmin.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      if (
        admins.some(
          (admin) => admin.email.toLowerCase() === newAdmin.email.toLowerCase()
        )
      ) {
        toast({
          title: "Email Already Exists",
          description: "An admin with this email already exists.",
          variant: "destructive",
        });
        return;
      }

      const admin: AdminUser = {
        id: Date.now().toString(),
        ...newAdmin,
        name: newAdmin.name.trim(),
        email: newAdmin.email.trim().toLowerCase(),
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop`,
        createdAt: new Date(),
        isActive: true,
        createdBy: "current-super-admin",
      };

      console.log("Creating admin:", admin);
      setAdmins((prev) => [...prev, admin]);
      setShowCreateModal(false);
      setNewAdmin({
        name: "",
        email: "",
        role: "admin",
        permissions: [],
        department: "",
        university: "University of Ghana",
      });

      toast({
        title: "Admin Created Successfully",
        description: `${admin.name} has been added as an admin with ${admin.permissions.length} permissions.`,
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      toast({
        title: "Error",
        description: "Failed to create admin. Please try again.",
        variant: "destructive",
      });
    }
  }, [newAdmin, admins, toast]);

  const handleEditAdmin = useCallback(() => {
    if (
      !editingAdmin ||
      !editingAdmin.name.trim() ||
      !editingAdmin.email.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (
      admins.some(
        (admin) =>
          admin.id !== editingAdmin.id &&
          admin.email.toLowerCase() === editingAdmin.email.toLowerCase()
      )
    ) {
      toast({
        title: "Email Already Exists",
        description: "Another admin with this email already exists.",
        variant: "destructive",
      });
      return;
    }

    setAdmins((prev) =>
      prev.map((admin) =>
        admin.id === editingAdmin.id
          ? {
              ...editingAdmin,
              name: editingAdmin.name.trim(),
              email: editingAdmin.email.trim().toLowerCase(),
            }
          : admin
      )
    );

    setShowEditModal(false);
    setEditingAdmin(null);

    toast({
      title: "Admin Updated",
      description: `${editingAdmin.name}'s information has been updated.`,
    });
  }, [editingAdmin, admins, toast]);

  const handleUpdatePermissions = useCallback(
    async (adminId: string, newPermissions: AdminPermission[]) => {
      try {
        await adminApi.updateAdminRole(adminId, newPermissions);

        setAdmins((prev) =>
          prev.map((admin) =>
            admin.id === adminId
              ? { ...admin, permissions: newPermissions }
              : admin
          )
        );

        const admin = admins.find((a) => a.id === adminId);
        toast({
          title: "Permissions Updated",
          description: `${admin?.name}'s permissions have been updated.`,
        });
      } catch (error) {
        console.error("Failed to update permissions:", error);
        toast({
          title: "Error",
          description: "Failed to update permissions. Please try again.",
          variant: "destructive",
        });
      }
    },
    [admins, toast]
  );

  const handleToggleStatus = useCallback(
    async (adminId: string) => {
      try {
        const admin = admins.find((a) => a.id === adminId);
        const newStatus = !admin?.isActive;
        const statusValue = newStatus ? "active" : "inactive";

        await adminApi.updateAdminStatus(adminId, statusValue);

        setAdmins((prev) =>
          prev.map((admin) =>
            admin.id === adminId ? { ...admin, isActive: newStatus } : admin
          )
        );

        toast({
          title: newStatus ? "Admin Activated" : "Admin Deactivated",
          description: `${admin?.name} has been ${
            newStatus ? "activated" : "deactivated"
          }.`,
          variant: newStatus ? "default" : "destructive",
        });
      } catch (error) {
        console.error("Failed to update status:", error);
        toast({
          title: "Error",
          description: "Failed to update status. Please try again.",
          variant: "destructive",
        });
      }
    },
    [admins, toast]
  );

  const handleDeleteAdmin = useCallback(() => {
    if (!selectedAdmin) return;

    setAdmins((prev) => prev.filter((admin) => admin.id !== selectedAdmin.id));
    setShowDeleteDialog(false);

    toast({
      title: "Admin Deleted",
      description: `${selectedAdmin.name} has been permanently removed.`,
      variant: "destructive",
    });

    setSelectedAdmin(null);
  }, [selectedAdmin, toast]);

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin({ ...admin });
    setShowEditModal(true);
  };

  const openPermissionsModal = (admin: AdminUser) => {
    console.log("openPermissionsModal called", { admin });
    try {
      setSelectedAdmin(admin);
      setShowPermissionsModal(true);
    } catch (error) {
      console.error("Error opening permissions modal:", error);
      toast({
        title: "Error",
        description: "Failed to open permissions modal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowDeleteDialog(true);
  };

  const handlePermissionToggle = (
    permission: AdminPermission,
    checked: boolean
  ) => {
    try {
      if (!permission) {
        console.warn("Invalid permission object");
        return;
      }

      if (checked) {
        setNewAdmin((prev) => ({
          ...prev,
          permissions: [...prev.permissions, permission],
        }));
      } else {
        setNewAdmin((prev) => ({
          ...prev,
          permissions: prev.permissions.filter((p) => p !== permission),
        }));
      }
    } catch (error) {
      console.error("Error toggling permission:", error);
      toast({
        title: "Error",
        description: "Failed to update permission. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPermissionToggle = (
    permission: AdminPermission,
    checked: boolean
  ) => {
    try {
      if (!editingAdmin) return;

      if (!permission) {
        console.warn("Invalid permission object");
        return;
      }

      if (checked) {
        setEditingAdmin((prev) =>
          prev
            ? {
                ...prev,
                permissions: [...prev.permissions, permission],
              }
            : null
        );
      } else {
        setEditingAdmin((prev) =>
          prev
            ? {
                ...prev,
                permissions: prev.permissions.filter((p) => p !== permission),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error toggling edit permission:", error);
      toast({
        title: "Error",
        description: "Failed to update permission. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectedAdminPermissionToggle = (
    permission: AdminPermission,
    checked: boolean
  ) => {
    try {
      if (!selectedAdmin) return;

      if (!permission) {
        console.warn("Invalid permission object");
        return;
      }

      const newPermissions = checked
        ? [...selectedAdmin.permissions, permission]
        : selectedAdmin.permissions.filter((p) => p !== permission);

      setSelectedAdmin((prev) =>
        prev ? { ...prev, permissions: newPermissions } : null
      );
    } catch (error) {
      console.error("Error toggling selected admin permission:", error);
      toast({
        title: "Error",
        description: "Failed to update permission. Please try again.",
        variant: "destructive",
      });
    }
  };

  const savePermissions = () => {
    try {
      if (!selectedAdmin) return;

      handleUpdatePermissions(selectedAdmin.id, selectedAdmin.permissions);
      setShowPermissionsModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: "Failed to save permissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!hasRole("super_admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You need Super Admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: AdminRole) => {
    return role === "super_admin" ? (
      <Badge className="bg-campus-purple text-white">
        <Crown className="h-3 w-3 mr-1" />
        Super Admin
      </Badge>
    ) : (
      <Badge className="bg-primary">
        <Shield className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-600 text-white">
        <Power className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-600 text-white">
        <PowerOff className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const adminStats = {
    total: admins.length,
    active: admins.filter((a) => a.isActive).length,
    inactive: admins.filter((a) => !a.isActive).length,
    superAdmins: admins.filter((a) => a.role === "super_admin").length,
  };

  const getPermissionLabel = (permission: AdminPermission): string => {
    const labels: Record<AdminPermission, string> = {
      user_management: "User Management",
      content_management: "Content Management",
      community_management: "Community Management",
      tutoring_management: "Tutoring Management",
      analytics: "Analytics",
      admin_management: "Admin Management",
      system_settings: "System Settings",
      reports: "Reports Access",
      notifications: "Notifications",
    };
    return labels[permission] || permission;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold custom-font">Admin Management</h1>
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
        <h1 className="text-3xl font-bold custom-font">Admin Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <ErrorBoundary>
                <DialogHeader>
                  <DialogTitle>Create New Admin</DialogTitle>
                  <DialogDescription>
                    Add a new administrator to the system with specific
                    permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newAdmin.name}
                        onChange={(e) =>
                          setNewAdmin((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) =>
                          setNewAdmin((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="university">University *</Label>
                      <Input
                        id="university"
                        value={newAdmin.university}
                        onChange={(e) =>
                          setNewAdmin((prev) => ({
                            ...prev,
                            university: e.target.value,
                          }))
                        }
                        placeholder="Enter university name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={newAdmin.department}
                        onValueChange={(value) =>
                          setNewAdmin((prev) => ({
                            ...prev,
                            department: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newAdmin.role}
                      onValueChange={(value: AdminRole) =>
                        setNewAdmin((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                      {availablePermissions.map((permissionObj) => {
                        const permission = permissionObj.value;
                        return (
                          <div
                            key={permission}
                            className="flex items-start space-x-2"
                          >
                            <Checkbox
                              id={permission}
                              checked={newAdmin.permissions.includes(
                                permission
                              )}
                              onCheckedChange={(checked) =>
                                handlePermissionToggle(
                                  permission,
                                  Boolean(checked)
                                )
                              }
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor={permission}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {permissionObj.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {permissionObj.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {newAdmin.permissions.length} permissions
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAdmin}>Create Admin</Button>
                </DialogFooter>
              </ErrorBoundary>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <PowerOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.superAdmins}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No admins found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={admin.avatar} alt={admin.name} />
                          <AvatarFallback>
                            {admin.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{admin.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(admin.role)}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {admin.department || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{admin.university}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions.slice(0, 2).map((permission) => (
                          <Badge
                            key={permission}
                            variant="outline"
                            className="text-xs"
                          >
                            {getPermissionLabel(permission)}
                          </Badge>
                        ))}
                        {admin.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{admin.permissions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(admin.isActive)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {admin.lastLogin
                          ? admin.lastLogin.toLocaleDateString()
                          : "Never"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditModal(admin)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openPermissionsModal(admin)}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(admin.id)}
                          >
                            {admin.isActive ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(admin)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Admin Details</DialogTitle>
            <DialogDescription>
              Update administrator information and basic settings.
            </DialogDescription>
          </DialogHeader>
          {editingAdmin && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingAdmin.name}
                    onChange={(e) =>
                      setEditingAdmin((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingAdmin.email}
                    onChange={(e) =>
                      setEditingAdmin((prev) =>
                        prev ? { ...prev, email: e.target.value } : null
                      )
                    }
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-university">University *</Label>
                  <Input
                    id="edit-university"
                    value={editingAdmin.university || ""}
                    onChange={(e) =>
                      setEditingAdmin((prev) =>
                        prev ? { ...prev, university: e.target.value } : null
                      )
                    }
                    placeholder="Enter university name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-department">Department</Label>
                  <Select
                    value={editingAdmin.department || ""}
                    onValueChange={(value) =>
                      setEditingAdmin((prev) =>
                        prev ? { ...prev, department: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editingAdmin.role}
                  onValueChange={(value: AdminRole) =>
                    setEditingAdmin((prev) =>
                      prev ? { ...prev, role: value } : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Current Permissions</Label>
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  <div className="flex flex-wrap gap-2">
                    {editingAdmin.permissions.map((permission) => (
                      <Badge key={permission} variant="outline">
                        {getPermissionLabel(permission)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {editingAdmin.permissions.length} permissions assigned
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAdmin}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showPermissionsModal}
        onOpenChange={setShowPermissionsModal}
      >
        <DialogContent className="max-w-2xl">
          <ErrorBoundary>
            <DialogHeader>
              <DialogTitle>Manage Permissions</DialogTitle>
              <DialogDescription>
                Update permissions for {selectedAdmin?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedAdmin && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {availablePermissions.map((permissionObj) => {
                    const permission = permissionObj.value;
                    return (
                      <div
                        key={permission}
                        className="flex items-start space-x-3 p-3 border rounded-lg"
                      >
                        <Checkbox
                          id={`perm-${permission}`}
                          checked={selectedAdmin.permissions.includes(
                            permission
                          )}
                          onCheckedChange={(checked) =>
                            handleSelectedAdminPermissionToggle(
                              permission,
                              Boolean(checked)
                            )
                          }
                        />
                        <div className="grid gap-1.5 leading-none flex-1">
                          <Label
                            htmlFor={`perm-${permission}`}
                            className="text-sm font-medium leading-none"
                          >
                            {permissionObj.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {permissionObj.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Selected: {selectedAdmin.permissions.length} permissions
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedAdmin((prev) =>
                        prev
                          ? {
                              ...prev,
                              permissions:
                                selectedAdmin.permissions.length ===
                                availablePermissions.length
                                  ? []
                                  : [
                                      ...availablePermissions.map(
                                        (p) => p.value
                                      ),
                                    ],
                            }
                          : null
                      )
                    }
                  >
                    {selectedAdmin.permissions.length ===
                    availablePermissions.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPermissionsModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={savePermissions}>Save Permissions</Button>
            </DialogFooter>
          </ErrorBoundary>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedAdmin?.name}
              's admin account? This action cannot be undone and will
              immediately revoke all their administrative access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
