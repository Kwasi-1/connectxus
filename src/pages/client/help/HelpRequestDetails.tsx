import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  User,
  BookOpen,
  Calendar,
  MessageCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import {
  getHelpRequest,
  deleteHelpRequest,
  toggleHelpRequestVisibility,
} from "@/api/help_requests.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import type { HelpRequest } from "@/types/help_requests";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function HelpRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const { data: helpRequest, isLoading: loading } = useQuery({
    queryKey: ["help-request", id],
    queryFn: () => getHelpRequest(id!),
    enabled: !!id,
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: () => toggleHelpRequestVisibility(id!),
    onSuccess: (updated) => {
      queryClient.setQueryData(["help-request", id], updated);
      queryClient.invalidateQueries({ queryKey: ["available-help-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-help-requests"] });
      toast.success(
        `Help request is now ${updated.status === "public" ? "public" : "private"}`
      );
    },
    onError: () => {
      toast.error("Failed to update visibility");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteHelpRequest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-help-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-help-requests"] });
      toast.success("Help request deleted");
      navigate("/help");
    },
    onError: () => {
      toast.error("Failed to delete help request");
    },
  });

  const handleMessageRequester = async () => {
    if (!helpRequest || !helpRequest.owner_id || isMessageLoading) return;

    setIsMessageLoading(true);

    try {
      const response = await getOrCreateDirectConversation(helpRequest.owner_id);
      const ownerName = helpRequest.owner_name || helpRequest.owner_username || "there";
      const helpRequestUrl = `${window.location.origin}/help/${helpRequest.id}`;
      const prefillMessage = `Hey ${ownerName}, here to help you with "${helpRequest.title}" (${helpRequestUrl})`;

      navigate(`/messages/${response.conversation_id}`, {
        state: { prefillMessage }
      });
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    } finally {
      setIsMessageLoading(false);
    }
  };

  const handleToggleVisibility = () => {
    if (!helpRequest || !id) return;
    toggleVisibilityMutation.mutate();
  };

  const handleDelete = () => {
    if (!helpRequest || !id) return;

    if (!confirm("Are you sure you want to delete this help request?")) {
      return;
    }

    deleteMutation.mutate();
  };

  if (loading) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!helpRequest) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Help request not found</h3>
            <Button onClick={() => navigate("/help")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Requests
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isOwner = user?.id === helpRequest.owner_id;
  const isUrgent =
    new Date(helpRequest.deadline) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "course":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "project":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "general":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/help")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Requests
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{helpRequest.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={getTypeColor(helpRequest.type)}>
                  {helpRequest.type.charAt(0).toUpperCase() +
                    helpRequest.type.slice(1)}
                </Badge>
                {helpRequest.status === "private" && (
                  <Badge variant="secondary">Private</Badge>
                )}
                {isUrgent && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/help/edit/${id}`)}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleVisibility}
                  disabled={toggleVisibilityMutation.isPending}
                  title={`Make ${helpRequest.status === "public" ? "private" : "public"}`}
                >
                  {helpRequest.status === "public" ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-destructive hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {helpRequest.description}
                </p>
              </CardContent>
            </Card>

            {helpRequest.subject && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subject
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{helpRequest.subject}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Info & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Deadline</p>
                    <p
                      className={`text-sm ${
                        isUrgent ? "text-destructive font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {format(new Date(helpRequest.deadline), "PPp")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Posted</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(helpRequest.created_at), "PPp")}
                    </p>
                  </div>
                </div>

                {helpRequest.owner_level && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Level</p>
                      <p className="text-sm text-muted-foreground">
                        {helpRequest.owner_level}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {helpRequest.owner_name && (
              <Card>
                <CardHeader>
                  <CardTitle>Requester</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {helpRequest.owner_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{helpRequest.owner_name}</p>
                      {helpRequest.owner_username && (
                        <p className="text-sm text-muted-foreground">
                          @{helpRequest.owner_username}
                        </p>
                      )}
                      {helpRequest.department_name && (
                        <p className="text-sm text-muted-foreground">
                          {helpRequest.department_name}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isOwner && (
              <Button
                onClick={handleMessageRequester}
                className="w-full"
                size="lg"
                disabled={isMessageLoading}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {isMessageLoading ? "Loading..." : "Offer to Help"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
