import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Filter,
  Download,
  Edit,
  MoreHorizontal,
  Clock,
  Users,
} from "lucide-react";
import {
  ContentModerationItem,
  CampusAnnouncement,
  CampusEvent,
} from "@/types/admin";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/api/admin.api";
import moment from "moment";

export function ContentManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("moderation");
  const [moderationItems, setModerationItems] = useState<
    ContentModerationItem[]
  >([]);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] =
    useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState<
    ContentModerationItem | CampusAnnouncement | CampusEvent | null
  >(null);
  const [reviewDecision, setReviewDecision] = useState<
    "approve" | "reject" | null
  >(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "general" as const,
    targetAudience: [] as string[],
    priority: "medium" as const,
    scheduledFor: "",
    expiresAt: "",
  });

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: "academic" as const,
    location: "",
    startDate: "",
    endDate: "",
    maxAttendees: "",
    registrationRequired: false,
    registrationDeadline: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);      const [moderationData, announcementData, eventData] = await Promise.all([
        adminApi.getContentReports(
          spaceId,
          statusFilter === "all" ? undefined : statusFilter
        ),
        adminApi.getAnnouncements(
          spaceId,
          statusFilter === "all" ? undefined : statusFilter,
          priorityFilter === "all" ? undefined : priorityFilter
        ),
        adminApi.getEvents(
          spaceId,
          statusFilter === "all" ? undefined : statusFilter
        ),
      ]);

      const moderationItems =
        moderationData.length > 0 &&
        moderationData.map((report: any) => ({
          id: report.id,
          type: report.content_type as "post" | "comment" | "message",
          content: report.description || "",
          reportedBy: report.reporter_id,
          reason: report.reason,
          status: report.status,
          createdAt: new Date(report.created_at),
        }));

      setModerationItems([]);
      setAnnouncements(announcementData.announcements || []);
      setEvents(eventData.events || []);
    } catch (error) {
      console.error("Failed to fetch content data:", error);
    } finally {
      setLoading(false);
    }
  }, [toast, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAnnouncement = useCallback(async () => {
    try {      await adminApi.createAnnouncement({
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        type: newAnnouncement.type,
        target_audience: newAnnouncement.targetAudience,
        priority: newAnnouncement.priority,
        scheduled_for: newAnnouncement.scheduledFor
          ? new Date(newAnnouncement.scheduledFor)
          : undefined,
        expires_at: newAnnouncement.expiresAt
          ? new Date(newAnnouncement.expiresAt)
          : undefined,
        attachments: undefined,
        is_pinned: false,
      });
      toast({
        title: "Success",
        description: "Announcement created successfully.",
      });
      setShowCreateAnnouncementModal(false);
      setNewAnnouncement({
        title: "",
        content: "",
        type: "general",
        targetAudience: [],
        priority: "medium",
        scheduledFor: "",
        expiresAt: "",
      });
      fetchData();
    } catch (error) {
      console.error("Failed to create announcement:", error);
      toast({
        title: "Error",
        description: "Failed to create announcement.",
        variant: "destructive",
      });
    }
  }, [newAnnouncement, toast, fetchData]);

  const handleCreateEvent = useCallback(async () => {
    try {      await adminApi.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        category: newEvent.category,
        location: newEvent.location,
        venue_details: "",
        start_date: new Date(newEvent.startDate),
        end_date: new Date(newEvent.endDate),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        tags: [],
        image_url: "",
        max_attendees: newEvent.maxAttendees
          ? parseInt(newEvent.maxAttendees)
          : undefined,
        registration_required: newEvent.registrationRequired,
        registration_deadline: newEvent.registrationDeadline
          ? new Date(newEvent.registrationDeadline)
          : undefined,
        is_public: true,
      });
      toast({
        title: "Success",
        description: "Event created successfully.",
      });
      setShowCreateEventModal(false);
      setNewEvent({
        title: "",
        description: "",
        category: "academic",
        location: "",
        startDate: "",
        endDate: "",
        maxAttendees: "",
        registrationRequired: false,
        registrationDeadline: "",
      });
      fetchData();
    } catch (error) {
      console.error("Failed to create event:", error);
      toast({
        title: "Error",
        description: "Failed to create event.",
        variant: "destructive",
      });
    }
  }, [newEvent, toast, fetchData]);

  const handleReviewContent = useCallback(async () => {
    if (!selectedItem || !reviewDecision || !("status" in selectedItem)) return;

    try {
      await adminApi.resolveReport(
        selectedItem.id,
        reviewDecision === "approve" ? "approved" : "rejected",
        reviewNotes
      );
      toast({
        title: "Success",
        description: `Content ${reviewDecision}d successfully.`,
      });
      setShowReviewModal(false);
      setSelectedItem(null);
      setReviewDecision(null);
      setReviewNotes("");
      fetchData();
    } catch (error) {
      console.error("Failed to review content:", error);
      toast({
        title: "Error",
        description: "Failed to review content.",
        variant: "destructive",
      });
    }
  }, [selectedItem, reviewDecision, reviewNotes, toast, fetchData]);

  const handleDeleteItem = useCallback(async () => {
    if (!selectedItem) return;

    try {
      if ("status" in selectedItem && "reason" in selectedItem) {
        toast({
          title: "Cannot Delete",
          description: "Moderation items can only be resolved, not deleted.",
          variant: "destructive",
        });
        return;
      } else if ("authorId" in selectedItem) {
        await adminApi.deleteAnnouncement(selectedItem.id);
      } else {
        await adminApi.deleteEvent(selectedItem.id);
      }

      toast({
        title: "Success",
        description: "Item deleted successfully.",
      });
      setShowDeleteDialog(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    }
  }, [selectedItem, toast, fetchData]);

  const handleBulkAction = useCallback(
    async (action: string) => {
      if (selectedItems.length === 0) {
        toast({
          title: "No Selection",
          description: "Please select items to perform bulk action.",
          variant: "destructive",
        });
        return;
      }

      try {
        if (activeTab === "moderation") {
          await Promise.all(
            selectedItems.map((id) =>
              adminApi.resolveReport(
                id,
                action === "approve" ? "approved" : "rejected",
                `Bulk ${action}`
              )
            )
          );
        } else if (activeTab === "announcements") {
          if (action === "delete") {
            await Promise.all(
              selectedItems.map((id) => adminApi.deleteAnnouncement(id))
            );
          } else {
            await Promise.all(
              selectedItems.map((id) =>
                adminApi.updateAnnouncementStatus(
                  id,
                  action === "publish" ? "active" : "draft"
                )
              )
            );
          }
        } else {
          if (action === "delete") {
            await Promise.all(
              selectedItems.map((id) => adminApi.deleteEvent(id))
            );
          } else {
            await Promise.all(
              selectedItems.map((id) =>
                adminApi.updateEventStatus(
                  id,
                  action === "cancel" ? "cancelled" : "completed"
                )
              )
            );
          }
        }

        toast({
          title: "Success",
          description: `Bulk ${action} completed successfully.`,
        });
        setSelectedItems([]);
        fetchData();
      } catch (error) {
        console.error("Failed to perform bulk action:", error);
        toast({
          title: "Error",
          description: `Failed to perform bulk ${action}.`,
          variant: "destructive",
        });
      }
    },
    [selectedItems, activeTab, toast, fetchData]
  );

  const handleExport = useCallback(async () => {
    try {
      let dataType: string;
      if (activeTab === "moderation") {
        dataType = "reports";
      } else if (activeTab === "announcements") {
        dataType = "announcements";
      } else {
        dataType = "events";
      }

      const blob = await adminApi.exportData("csv", dataType);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dataType}-export-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Data exported successfully.",
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast({
        title: "Error",
        description: "Failed to export data.",
        variant: "destructive",
      });
    }
  }, [activeTab, toast]);

  const getFilteredModerationItems = () => {
    return (
      moderationItems.length > 0 &&
      moderationItems.filter((item) => {
        const matchesSearch =
          item.content.text
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.reporterName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;
        const matchesPriority =
          priorityFilter === "all" || item.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
    );
  };

  const getFilteredAnnouncements = () => {
    return (
      announcements.length > 0 &&
      announcements.filter((announcement) => {
        const matchesSearch =
          announcement.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          announcement.content
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || announcement.status === statusFilter;
        const matchesPriority =
          priorityFilter === "all" || announcement.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
    );
  };

  const getFilteredEvents = () => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    let allItems: string[] = [];
    if (activeTab === "moderation") {
      allItems = getFilteredModerationItems().map((item) => item.id);
    } else if (activeTab === "announcements") {
      allItems = getFilteredAnnouncements().map((item) => item.id);
    } else {
      allItems = getFilteredEvents().map((item) => item.id);
    }

    if (selectedItems.length === allItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItems);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "removed":
        return <Badge className="bg-red-100 text-red-800">Removed</Badge>;
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">Content Management</h1>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog
            open={showCreateAnnouncementModal}
            onOpenChange={setShowCreateAnnouncementModal}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Megaphone className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Create a campus-wide announcement for students and staff.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="announcement-title">Title</Label>
                  <Input
                    id="announcement-title"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <Label htmlFor="announcement-content">Content</Label>
                  <Textarea
                    id="announcement-content"
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Enter announcement content"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="announcement-type">Type</Label>
                    <Select
                      value={newAnnouncement.type}
                      onValueChange={(
                        value:
                          | "general"
                          | "academic"
                          | "social"
                          | "emergency"
                          | "maintenance"
                      ) =>
                        setNewAnnouncement((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="announcement-priority">Priority</Label>
                    <Select
                      value={newAnnouncement.priority}
                      onValueChange={(
                        value: "low" | "medium" | "high" | "urgent"
                      ) =>
                        setNewAnnouncement((prev) => ({
                          ...prev,
                          priority: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled-for">
                      Scheduled For (Optional)
                    </Label>
                    <Input
                      id="scheduled-for"
                      type="datetime-local"
                      value={newAnnouncement.scheduledFor}
                      onChange={(e) =>
                        setNewAnnouncement((prev) => ({
                          ...prev,
                          scheduledFor: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="expires-at">Expires At (Optional)</Label>
                    <Input
                      id="expires-at"
                      type="datetime-local"
                      value={newAnnouncement.expiresAt}
                      onChange={(e) =>
                        setNewAnnouncement((prev) => ({
                          ...prev,
                          expiresAt: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateAnnouncementModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateAnnouncement}>
                  Create Announcement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={showCreateEventModal}
            onOpenChange={setShowCreateEventModal}
          >
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Create a campus event for students to participate in.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-title">Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-category">Category</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(
                        value:
                          | "academic"
                          | "social"
                          | "sports"
                          | "cultural"
                          | "professional"
                          | "other"
                      ) =>
                        setNewEvent((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="professional">
                          Professional
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="event-location">Location</Label>
                    <Input
                      id="event-location"
                      value={newEvent.location}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="Enter event location"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-attendees">
                      Max Attendees (Optional)
                    </Label>
                    <Input
                      id="max-attendees"
                      type="number"
                      value={newEvent.maxAttendees}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          maxAttendees: e.target.value,
                        }))
                      }
                      placeholder="Enter max attendees"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-8">
                    <Checkbox
                      id="registration-required"
                      checked={newEvent.registrationRequired}
                      onCheckedChange={(checked) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          registrationRequired: Boolean(checked),
                        }))
                      }
                    />
                    <Label htmlFor="registration-required">
                      Registration Required
                    </Label>
                  </div>
                </div>
                {newEvent.registrationRequired && (
                  <div>
                    <Label htmlFor="registration-deadline">
                      Registration Deadline
                    </Label>
                    <Input
                      id="registration-deadline"
                      type="datetime-local"
                      value={newEvent.registrationDeadline}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          registrationDeadline: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateEventModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Flag className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {moderationItems.length > 0 &&
                moderationItems.filter((item) => item.status === "pending")
                  .length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Announcements
            </CardTitle>
            <Megaphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.length > 0
                ? announcements.filter((a) => a.status === "published").length
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently published</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.length > 0
                ? events.filter(
                    (e) => e.status === "published" && e.startDate > new Date()
                  ).length
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationItems.length}</div>
            <p className="text-xs text-muted-foreground">Content reports</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions ({selectedItems.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {activeTab === "moderation" && (
                <>
                  <DropdownMenuItem onClick={() => handleBulkAction("approve")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("reject")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Selected
                  </DropdownMenuItem>
                </>
              )}
              {activeTab === "announcements" && (
                <>
                  <DropdownMenuItem onClick={() => handleBulkAction("publish")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("archive")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Archive Selected
                  </DropdownMenuItem>
                </>
              )}
              {activeTab === "events" && (
                <>
                  <DropdownMenuItem onClick={() => handleBulkAction("publish")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("cancel")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Selected
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleBulkAction("delete")}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedItems.length ===
                            getFilteredModerationItems().length &&
                          getFilteredModerationItems().length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : getFilteredModerationItems().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <MessageSquare className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No content reports found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredModerationItems().length > 0 &&
                    getFilteredModerationItems().map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleSelectItem(item.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={item.content.author.avatar} />
                              <AvatarFallback>
                                {item.content.author.displayName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">
                                {item.content.author.displayName}
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {item.content.text}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.reporterName}</TableCell>
                        <TableCell>{item.reason}</TableCell>
                        <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {item.createdAt.toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedItem(item);
                                  setReviewDecision("approve");
                                  setShowReviewModal(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedItem(item);
                                  setReviewDecision("reject");
                                  setShowReviewModal(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedItems.length ===
                            getFilteredAnnouncements().length &&
                          getFilteredAnnouncements().length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : getFilteredAnnouncements() && getFilteredAnnouncements().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Megaphone className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No announcements found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredAnnouncements() && getFilteredAnnouncements().map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(announcement.id)}
                            onCheckedChange={() =>
                              handleSelectItem(announcement.id)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {announcement.title}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {announcement.content}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{announcement.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(announcement.priority)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(announcement.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {announcement.scheduledFor
                              ? moment(announcement.scheduledFor).format(
                                  "Do MMMM"
                                )
                              : "Immediate"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {moment(announcement.createdAt).format("")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedItem(announcement);
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedItem(announcement);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedItems.length === getFilteredEvents().length &&
                          getFilteredEvents().length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : getFilteredEvents().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No events found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredEvents().map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(event.id)}
                            onCheckedChange={() => handleSelectItem(event.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {event.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.category}</Badge>
                        </TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {moment(event.startDate).format("")}
                            <div className="text-muted-foreground">
                              {moment(event.startDate).format("")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{event.currentAttendees}</span>
                            {event.maxAttendees && (
                              <span className="text-muted-foreground">
                                /{event.maxAttendees}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedItem(event);
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedItem(event);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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
        </TabsContent>
      </Tabs>

      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDecision === "approve"
                ? "Approve Content"
                : "Reject Content"}
            </DialogTitle>
            <DialogDescription>
              {reviewDecision === "approve"
                ? "Approve this reported content and keep it visible."
                : "Reject this reported content and remove it from the platform."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add review notes (optional)..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReviewContent}
              variant={reviewDecision === "approve" ? "default" : "destructive"}
            >
              {reviewDecision === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
