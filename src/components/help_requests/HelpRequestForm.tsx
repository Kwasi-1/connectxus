import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, HelpCircle, BookOpen, Calendar, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createHelpRequest, updateHelpRequest } from "@/api/help_requests.api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { HelpRequest } from "@/types/help_requests";

interface HelpRequestFormProps {
  initialData?: HelpRequest | null;
  isEditing?: boolean;
}

export function HelpRequestForm({ initialData, isEditing = false }: HelpRequestFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    type: "course" as "course" | "project" | "general",
    level: 100 as number | undefined,
    deadline: "",
    status: "public" as "public" | "private",
  });

  useEffect(() => {
    if (initialData) {
      const deadlineDate = new Date(initialData.deadline);
      const formattedDeadline = new Date(
        deadlineDate.getTime() - deadlineDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        subject: initialData.subject || "",
        type: (initialData.type as "course" | "project" | "general") || "course",
        deadline: formattedDeadline,
        status: (initialData.status as "public" | "private") || "public",
      });
    }
  }, [initialData]);

  const createMutation = useMutation({
    mutationFn: createHelpRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-help-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-help-requests"] });
      toast.success("Help request posted successfully!");
      navigate("/help");
    },
    onError: (error: any) => {
      console.error("Error creating help request:", error);
      toast.error(
        error?.response?.data?.error?.message || "Failed to post help request"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; data: any }) =>
      updateHelpRequest(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-help-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-help-requests"] });
      queryClient.invalidateQueries({ queryKey: ["help-request", initialData?.id] });
      toast.success("Help request updated successfully!");
      navigate("/help");
    },
    onError: (error: any) => {
      console.error("Error updating help request:", error);
      toast.error(
        error?.response?.data?.error?.message || "Failed to update help request"
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    const requestData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      subject: formData.subject.trim() || undefined,
      type: formData.type,
      level: formData.type === "course" ? formData.level : undefined,
      deadline: new Date(formData.deadline).toISOString(),
      status: formData.status,
    };

    if (isEditing && initialData) {
      updateMutation.mutate({ id: initialData.id, data: requestData });
    } else {
      createMutation.mutate(requestData);
    }
  };

  const handleCancel = () => {
    navigate("/help");
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4"
          disabled={isPending}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Help Requests
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Help Request" : "Request Help"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditing
            ? "Update your help request details"
            : "Post a help request and connect with peers who can assist you"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Request Details
            </CardTitle>
            <CardDescription>
              Describe what you need help with clearly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Help needed with Calculus II assignment"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                minLength={3}
                maxLength={255}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide details about what you need help with..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                minLength={10}
                rows={6}
                disabled={isPending}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "course" | "project" | "general") =>
                    setFormData({ ...formData, type: value })
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course Work</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="general">General Help</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, DCIT 101"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>
            </div>

            {formData.type === "course" && (
              <div className="space-y-2">
                <Label htmlFor="level">
                  Academic Level <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.level?.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, level: parseInt(value) })
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level (Masters)</SelectItem>
                    <SelectItem value="600">600 Level (Masters)</SelectItem>
                    <SelectItem value="700">700 Level (PhD)</SelectItem>
                    <SelectItem value="800">800 Level (PhD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline & Visibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">
                  Deadline <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Visibility</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "public" | "private") =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>Public - Everyone can see</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        <span>Private - Only you can see</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isEditing && (
          <Card className="bg-muted/50 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">How it works:</p>
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Post your help request with clear details</li>
                    <li>Peers who can help will see your request</li>
                    <li>They can message you directly to offer assistance</li>
                    <li>No payments or file submissions required</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditing
                ? "Updating..."
                : "Posting..."
              : isEditing
              ? "Update Help Request"
              : "Post Help Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
