import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PostCard } from "@/components/feed/PostCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  Calendar,
  Settings,
  Pin,
  Plus,
  Search,
  MapPin,
  GraduationCap,
  Building,
  Shield,
  Crown,
  UserCheck,
  ImageIcon,
  X,
} from "lucide-react";
import { Community, CommunityPost } from "@/types/communities";
import { Post, User } from "@/types/global";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/api/files.api";
import { toast as sonnerToast } from "sonner";
import {
  useCommunity,
  useCommunityMembers,
  useJoinCommunity,
  useLeaveCommunity,
} from "@/hooks/useCommunities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostsByCommunity, createPost } from "@/api/posts.api";
import { useFeed } from "@/hooks/useFeed";
import { FeedLoadingSkeleton } from "@/components/feed/PostCardSkeleton";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
  getCommunityAnnouncements,
  createCommunityAnnouncement,
  updateCommunityAnnouncement,
  deleteCommunityAnnouncement,
  pinCommunityAnnouncement,
  CommunityAnnouncement,
  CommunityMember,
  addCommunityAdmin,
  removeCommunityAdmin,
  updateCommunity,
} from "@/api/communities.api";
import moment from "moment";
import {
  getCommunityEvents,
  getCommunityUpcomingEvents,
  createCommunityEvent,
  updateEvent,
  Event,
  CreateEventRequest,
} from "@/api/events.api";
import { EventCard } from "@/components/events/EventCard";
import { EventForm } from "@/components/events/EventForm";
import { EventDetailModal } from "@/components/events/EventDetailModal";

type CommunityTab = "posts" | "announcements" | "members" | "settings" | "events";

const CommunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const currentUserId = user?.id || "";

  
  const initialTab = (searchParams.get("tab") as CommunityTab) || "posts";
  const [activeTab, setActiveTab] = useState<CommunityTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPostImages, setSelectedPostImages] = useState<File[]>([]);
  const [postImagePreviews, setPostImagePreviews] = useState<string[]>([]);
  const [isUploadingPostImages, setIsUploadingPostImages] = useState(false);

  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");
  const [newAnnouncementContent, setNewAnnouncementContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<CommunityAnnouncement | null>(null);

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [communityDescription, setCommunityDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const { data: community, isLoading } = useCommunity(id || "");

  const isAdmin = community?.role === "admin" || community?.role === "owner";
  const isModerator = community?.role === "moderator";
  const canManage = isAdmin || isModerator;

  
  const {
    posts,
    isLoading: postsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch: refetchPosts,
    likePost,
    repostPost,
    deletePost,
    sharePost,
  } = useFeed({
    type: 'community',
    communityId: id,
    enabled: !!id && activeTab === "posts",
  });

  
  const { loadMoreRef } = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasMore: hasNextPage || false,
    onLoadMore: fetchNextPage,
  });
  const { data: members = [], isLoading: membersLoading } = useCommunityMembers(
    id || "",
    { page: 1, limit: 100 }
  );

  const { data: announcements = [] } = useQuery({
    queryKey: ["community-announcements", id],
    queryFn: () => getCommunityAnnouncements(id || ""),
    enabled: !!id && activeTab === "announcements",
  });

  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; media?: any }) =>
      createPost({
        content: data.content,
        community_id: id || "",
        visibility: "community",
        media: data.media,
      }),
    onSuccess: () => {
      
      queryClient.invalidateQueries({
        queryKey: ["community-posts", id],
        refetchType: 'active'
      });
      toast({
        title: "Post created",
        description: "Your post has been shared with the community",
      });
      setIsComposerOpen(false);
      setNewPostContent("");
      setSelectedPostImages([]);
      setPostImagePreviews([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      is_pinned?: boolean;
    }) => createCommunityAnnouncement(id || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-announcements", id],
      });
      toast({
        title: "Announcement created",
        description: "Announcement has been posted",
      });
      setIsCreatingAnnouncement(false);
      setNewAnnouncementTitle("");
      setNewAnnouncementContent("");
      setIsPinned(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({
      announcementId,
      data,
    }: {
      announcementId: string;
      data: { title: string; content: string; is_pinned?: boolean };
    }) => updateCommunityAnnouncement(announcementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-announcements", id],
      });
      toast({
        title: "Announcement updated",
        description: "Announcement has been updated",
      });
      setEditingAnnouncement(null);
      setIsCreatingAnnouncement(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (announcementId: string) =>
      deleteCommunityAnnouncement(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-announcements", id],
      });
      toast({
        title: "Announcement deleted",
        description: "Announcement has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  const pinAnnouncementMutation = useMutation({
    mutationFn: ({
      announcementId,
      pinned,
    }: {
      announcementId: string;
      pinned: boolean;
    }) => pinCommunityAnnouncement(announcementId, pinned),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-announcements", id],
      });
      toast({
        title: "Announcement updated",
        description: "Announcement pin status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  const addAdminMutation = useMutation({
    mutationFn: (userId: string) => addCommunityAdmin(id || "", userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", id] });
      queryClient.invalidateQueries({ queryKey: ["community-members", id] });
      toast({
        title: "Admin added",
        description: "User has been promoted to admin",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add admin",
        variant: "destructive",
      });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: (userId: string) => removeCommunityAdmin(id || "", userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", id] });
      queryClient.invalidateQueries({ queryKey: ["community-members", id] });
      toast({
        title: "Admin removed",
        description: "User has been demoted from admin",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove admin",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (community?.description) {
      setCommunityDescription(community.description);
    }
    if (community?.cover_image) {
      setCoverImageUrl(community.cover_image);
    }
  }, [community]);

  const handleJoinCommunity = () => {
    if (!community || !id) return;

    if (community.is_member) {
      leaveMutation.mutate(id);
    } else {
      joinMutation.mutate(id);
    }
  };

  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    
    if (selectedPostImages.length + files.length > 4) {
      sonnerToast.error("You can only upload up to 4 images per post");
      return;
    }

    
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        sonnerToast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        sonnerToast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setSelectedPostImages([...selectedPostImages, ...validFiles]);
    setPostImagePreviews([...postImagePreviews, ...newPreviews]);
  };

  const handleRemovePostImage = (index: number) => {
    const newImages = selectedPostImages.filter((_, i) => i !== index);
    const newPreviews = postImagePreviews.filter((_, i) => i !== index);
    setSelectedPostImages(newImages);
    setPostImagePreviews(newPreviews);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedPostImages.length === 0) {
      toast({
        title: "Empty post",
        description: "Please write something or add an image before posting",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrls: string[] = [];

      
      if (selectedPostImages.length > 0) {
        setIsUploadingPostImages(true);
        const uploadPromises = selectedPostImages.map((file) =>
          uploadFile({
            file,
            moduleType: "posts",
            moduleId: id,
            accessLevel: "public",
          })
        );
        const uploadedFiles = await Promise.all(uploadPromises);
        imageUrls = uploadedFiles.map((file) => file.url);
      }

      createPostMutation.mutate({
        content: newPostContent.trim() || "",
        media: imageUrls.length > 0 ? imageUrls : undefined,
      });
    } catch (error) {
      console.error("Failed to upload images:", error);
      sonnerToast.error("Failed to upload images");
    } finally {
      setIsUploadingPostImages(false);
    }
  };

  const handleCreateAnnouncement = () => {
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and content",
        variant: "destructive",
      });
      return;
    }

    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({
        announcementId: editingAnnouncement.id,
        data: {
          title: newAnnouncementTitle,
          content: newAnnouncementContent,
          is_pinned: isPinned,
        },
      });
    } else {
      createAnnouncementMutation.mutate({
        title: newAnnouncementTitle,
        content: newAnnouncementContent,
        is_pinned: isPinned,
      });
    }
  };

  const handleEditAnnouncement = (announcement: CommunityAnnouncement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncementTitle(announcement.title);
    setNewAnnouncementContent(announcement.content);
    setIsPinned(announcement.is_pinned);
    setIsCreatingAnnouncement(true);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    deleteAnnouncementMutation.mutate(announcementId);
  };

  const handlePinAnnouncement = (announcementId: string, pinned: boolean) => {
    pinAnnouncementMutation.mutate({ announcementId, pinned: !pinned });
  };

  const updateCommunityMutation = useMutation({
    mutationFn: (data: {
      name: string;
      category: string;
      description?: string;
      cover_image?: string;
    }) => updateCommunity(id || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", id] });
      toast({
        title: "Settings updated",
        description: "Community settings have been saved",
      });
      setIsEditingSettings(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update community settings",
        variant: "destructive",
      });
    },
  });

  const handleUpdateCommunitySettings = () => {
    if (!community) return;

    updateCommunityMutation.mutate({
      name: community.name,
      category: community.category,
      description: communityDescription,
      cover_image: coverImageUrl,
    });
  };

  const handlePostAction = (
    postId: string,
    action: "like" | "repost" | "comment"
  ) => {
    if (action === "comment") {
      navigate(`/post/${postId}`);
    }
  };

  const handleQuote = (postId: string) => {
    console.log("Quote post:", postId);
  };

  const handlePromoteToAdmin = (userId: string) => {
    addAdminMutation.mutate(userId);
  };

  const handleDemoteFromAdmin = (userId: string) => {
    removeAdminMutation.mutate(userId);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!community) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
              Community Not Found
            </h2>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the community you're looking for.
            </p>
            <Button
              variant="link"
              onClick={() => navigate("/communities")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Communities
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        <div className="sticky top-16 lg:top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/communities")}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {community.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {community.member_count.toLocaleString()} members
                  </p>
                </div>
              </div>
              {canManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={coverImageUrl || community.cover_image || undefined}
                alt={community.name}
              />
              <AvatarFallback className="text-lg">
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{community.name}</h2>
              <p className="text-muted-foreground mt-1">
                {community.description}
              </p>

              <div className="flex items-center gap-4 mt-3">
                <Badge variant="secondary" className="gap-1">
                  {community.category === "Academic" && (
                    <GraduationCap className="h-3 w-3" />
                  )}
                  {community.category === "Level" && (
                    <Users className="h-3 w-3" />
                  )}
                  {community.category === "Hostel" && (
                    <Building className="h-3 w-3" />
                  )}
                  {community.category === "Department" && (
                    <GraduationCap className="h-3 w-3" />
                  )}
                  {community.category}
                </Badge>

                {(community.settings as any)?.level &&
                  (community.settings as any)?.level !== "All" && (
                    <Badge variant="outline" className="gap-1">
                      <GraduationCap className="h-3 w-3" />
                      Level {(community.settings as any).level}
                    </Badge>
                  )}

                {(community.settings as any)?.department &&
                  (community.settings as any)?.department !== "All" && (
                    <Badge variant="outline" className="gap-1">
                      <Building className="h-3 w-3" />
                      {(community.settings as any).department}
                    </Badge>
                  )}
              </div>

              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {community.member_count.toLocaleString()} members
                </span>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {new Date(community.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-4">
                {community.is_member ? (
                  <div className="flex items-center gap-2">
                    {!canManage && (
                      <Button onClick={handleJoinCommunity} variant="outline">
                        Leave Community
                      </Button>
                    )}
                    <Badge variant="default" className="gap-1">
                      <UserCheck className="h-3 w-3" />
                      Member
                    </Badge>
                    {canManage && (
                      <Badge variant="secondary" className="gap-1">
                        {isAdmin ? (
                          <>
                            <Crown className="h-3 w-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <Shield className="h-3 w-3" />
                            Moderator
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Button onClick={handleJoinCommunity} variant="default">
                    Join Community
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as CommunityTab)}
        >
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
            <TabsTrigger
              value="posts"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="announcements"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Announcements
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Members
            </TabsTrigger>
            {(community.is_member || community.community_type === "public") && (
              <TabsTrigger
                value="events"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Events
              </TabsTrigger>
            )}
            {canManage && (
              <TabsTrigger
                value="settings"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {community.is_member && (
              <div className="p-4 border-b border-border">
                {isComposerOpen ? (
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <Textarea
                          placeholder={`Share something with ${community.name}...`}
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          rows={3}
                        />

                        
                        {postImagePreviews.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {postImagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-border"
                                />
                                <button
                                  onClick={() => handleRemovePostImage(index)}
                                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handlePostImageSelect}
                              className="hidden"
                              id="post-image-upload"
                              disabled={selectedPostImages.length >= 4 || isUploadingPostImages}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => document.getElementById('post-image-upload')?.click()}
                              disabled={selectedPostImages.length >= 4 || isUploadingPostImages}
                            >
                              <ImageIcon className="h-4 w-4 mr-1" />
                              {selectedPostImages.length > 0
                                ? `${selectedPostImages.length}/4 images`
                                : 'Add images'}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              {newPostContent.length}/280
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsComposerOpen(false);
                                setNewPostContent("");
                                setSelectedPostImages([]);
                                setPostImagePreviews([]);
                              }}
                              disabled={isUploadingPostImages || createPostMutation.isPending}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreatePost}
                              disabled={
                                (!newPostContent.trim() && selectedPostImages.length === 0) ||
                                newPostContent.length > 280 ||
                                isUploadingPostImages ||
                                createPostMutation.isPending
                              }
                            >
                              {isUploadingPostImages
                                ? "Uploading..."
                                : createPostMutation.isPending
                                ? "Posting..."
                                : "Post"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    onClick={() => setIsComposerOpen(true)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Share with your community...
                  </Button>
                )}
              </div>
            )}

            {postsLoading ? (
              <FeedLoadingSkeleton count={5} />
            ) : (
              <>
                <div className="divide-y divide-border">
                  {posts.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">
                        {community.is_member
                          ? "No posts yet. Be the first to share something!"
                          : "No posts yet in this community"}
                      </p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={user?.id}
                      />
                    ))
                  )}
                </div>

                
                {hasNextPage && (
                  <div ref={loadMoreRef} className="py-4 text-center">
                    {isFetchingNextPage && <FeedLoadingSkeleton count={2} />}
                  </div>
                )}

                {!hasNextPage && posts.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    You've reached the end
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="announcements" className="mt-0">
            {canManage && (
              <div className="p-4 border-b border-border">
                {isCreatingAnnouncement ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Announcement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="announcement-title">Title</Label>
                        <Input
                          id="announcement-title"
                          value={newAnnouncementTitle}
                          onChange={(e) =>
                            setNewAnnouncementTitle(e.target.value)
                          }
                          placeholder="Announcement title..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="announcement-content">Content</Label>
                        <Textarea
                          id="announcement-content"
                          value={newAnnouncementContent}
                          onChange={(e) =>
                            setNewAnnouncementContent(e.target.value)
                          }
                          placeholder="Announcement content..."
                          rows={4}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="pin-announcement"
                          checked={isPinned}
                          onCheckedChange={setIsPinned}
                        />
                        <Label htmlFor="pin-announcement" className="text-sm">
                          Pin this announcement
                        </Label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateAnnouncement}
                          disabled={
                            !newAnnouncementTitle.trim() ||
                            !newAnnouncementContent.trim()
                          }
                        >
                          Post Announcement
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsCreatingAnnouncement(false);
                            setNewAnnouncementTitle("");
                            setNewAnnouncementContent("");
                            setIsPinned(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    onClick={() => setIsCreatingAnnouncement(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                )}
              </div>
            )}

            <div className="divide-y divide-border">
              {announcements.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {canManage
                      ? "No announcements yet. Create one to keep your community informed!"
                      : "No announcements yet"}
                  </p>
                </div>
              ) : (
                announcements
                  .sort((a, b) => {
                    if (a.is_pinned && !b.is_pinned) return -1;
                    if (!a.is_pinned && b.is_pinned) return 1;
                    return (
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                    );
                  })
                  .map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`p-4 hover:bg-muted/5 ${
                        announcement.is_pinned ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {announcement.is_pinned && (
                          <Pin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-lg">
                                {announcement.title}
                              </h3>
                              {announcement.is_pinned && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs mt-1"
                                >
                                  Pinned
                                </Badge>
                              )}
                            </div>
                            {canManage && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditAnnouncement(announcement)
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handlePinAnnouncement(
                                      announcement.id,
                                      announcement.is_pinned
                                    )
                                  }
                                >
                                  {announcement.is_pinned ? "Unpin" : "Pin"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteAnnouncement(announcement.id)
                                  }
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                            {announcement.author_avatar && (
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={announcement.author_avatar} />
                                <AvatarFallback className="text-xs">
                                  {announcement.author_full_name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <span>By {announcement.author_full_name}</span>
                            <span>•</span>
                            <span>
                              {new Date(
                                announcement.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-0">
                <div className="p-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {membersLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="divide-y divide-border">
                      {members
                        .filter(
                          (member) =>
                            member.full_name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            member.username
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map((member) => {
                          const isMemberAdmin = member.role === "admin";
                          const isMemberModerator = member.role === "moderator";

                          return (
                            <div
                              key={member.id}
                              className="p-4 hover:bg-muted/5"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar
                                  className="h-12 w-12 cursor-pointer"
                                  onClick={() => navigate(`/profile/${member.id}`)}
                                >
                                  <AvatarImage
                                    src={member.avatar || undefined}
                                    alt={member.full_name}
                                  />
                                  <AvatarFallback>
                                    {member.full_name
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className="flex-1 cursor-pointer"
                                  onClick={() => navigate(`/profile/${member.id}`)}
                                >
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">
                                      {member.full_name}
                                    </h3>
                                    {member.verified && (
                                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                        <span className="text-primary-foreground text-xs">
                                          ✓
                                        </span>
                                      </div>
                                    )}
                                    {isMemberAdmin && (
                                      <Badge
                                        variant="default"
                                        className="text-xs gap-1"
                                      >
                                        <Crown className="h-3 w-3" />
                                        Admin
                                      </Badge>
                                    )}
                                    {isMemberModerator && !isMemberAdmin && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs gap-1"
                                      >
                                        <Shield className="h-3 w-3" />
                                        Moderator
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    @{member.username}
                                  </p>
                                  {member.department && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {member.department}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </TabsContent>

              
              {(community.is_member || community.community_type === "public") && (
                <TabsContent value="events" className="mt-0">
                  <CommunityEventsTab
                    communityId={id || ""}
                    canManage={canManage}
                  />
                </TabsContent>
              )}

              {canManage && (
              <TabsContent value="settings" className="mt-0">
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Community Settings
                    </h3>

                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="community-name">Community Name</Label>
                          <Input
                            id="community-name"
                            value={community?.name || ""}
                            disabled
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Community name cannot be changed
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="community-description">
                            Description
                          </Label>
                          {isEditingSettings ? (
                            <Textarea
                              id="community-description"
                              value={communityDescription}
                              onChange={(e) =>
                                setCommunityDescription(e.target.value)
                              }
                              className="mt-1"
                              rows={3}
                            />
                          ) : (
                            <p className="mt-1 p-3 bg-muted rounded-md">
                              {community?.description}
                            </p>
                          )}
                        </div>

                        {isEditingSettings && (
                          <div>
                            <ImageUploadField
                              label="Cover Image"
                              currentImage={coverImageUrl}
                              onUploadComplete={(url) => setCoverImageUrl(url)}
                              moduleType="communities"
                              moduleId={id}
                              aspectRatio="16/9"
                            />
                          </div>
                        )}

                        <div>
                          <Label>Community Type</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary">
                              {community?.category}
                            </Badge>
                            {community?.level && community.level !== "All" && (
                              <Badge variant="outline">
                                Level {community.level}
                              </Badge>
                            )}
                            {community?.department &&
                              community.department !== "All" && (
                                <Badge variant="outline">
                                  {community.department}
                                </Badge>
                              )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Community type and criteria are set by app
                            administrators
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {isEditingSettings ? (
                            <>
                              <Button onClick={handleUpdateCommunitySettings}>
                                Save Changes
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsEditingSettings(false);
                                  setCommunityDescription(
                                    community?.description || ""
                                  );
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => setIsEditingSettings(true)}
                              variant="outline"
                            >
                              Edit Description
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Community Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Members
                          </span>
                          <span className="font-semibold">
                            {community?.member_count}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Posts This Month
                          </span>
                          <span className="font-semibold">{posts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Announcements
                          </span>
                          <span className="font-semibold">
                            {announcements.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Community Created
                          </span>
                          <span className="font-semibold">
                            {moment(community?.created_at).fromNow()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    
                    {isAdmin && (
                      <Card className="border-red-200 dark:border-red-900">
                        <CardHeader>
                          <CardTitle className="text-red-600 dark:text-red-400">
                            Danger Zone
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-md">
                            <div>
                              <p className="font-medium">Delete Community</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Permanently delete this community and all of its
                                content. This action cannot be undone.
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
                                  
                                  toast({
                                    title: "Not implemented",
                                    description: "Community deletion is not yet implemented",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              Delete Community
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
              )}
        </Tabs>
      </div>
    </AppLayout>
  );
};


const CommunityEventsTab = ({
  communityId,
  canManage,
}: {
  communityId: string;
  canManage: boolean;
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  const { data: upcomingEvents = [], isLoading: upcomingLoading } = useQuery({
    queryKey: ['community-upcoming-events', communityId],
    queryFn: () => getCommunityUpcomingEvents(communityId, 10),
    enabled: !!communityId,
  });

  const { data: allEvents = [], isLoading: allLoading } = useQuery({
    queryKey: ['community-events', communityId],
    queryFn: () => getCommunityEvents(communityId, { page: 1, limit: 20 }),
    enabled: !!communityId,
  });

  const createEventMutation = useMutation({
    mutationFn: (data: Omit<CreateEventRequest, 'space_id'>) => createCommunityEvent(communityId, data),
    onSuccess: () => {
      toast.success("Event created successfully");
      queryClient.invalidateQueries({ queryKey: ['community-events', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community-upcoming-events', communityId] });
      setShowCreateForm(false);
    },
    onError: () => {
      toast.error("Failed to create event");
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) => updateEvent(eventId, data),
    onSuccess: () => {
      toast.success("Event updated successfully");
      queryClient.invalidateQueries({ queryKey: ['community-events', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community-upcoming-events', communityId] });
      setEditingEvent(null);
    },
    onError: () => {
      toast.error("Failed to update event");
    },
  });

  if (upcomingLoading || allLoading) {
    return (
      <div className="p-8 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (showCreateForm || editingEvent) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingEvent ? "Edit Event" : "Create New Event"}
        </h3>
        <EventForm
          event={editingEvent || undefined}
          onSubmit={async (data) => {
            if (editingEvent) {
              await updateEventMutation.mutateAsync({ eventId: editingEvent.id, data });
            } else {
              await createEventMutation.mutateAsync(data);
            }
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingEvent(null);
          }}
          isSubmitting={createEventMutation.isPending || updateEventMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Community Events</h3>
        {canManage && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      <div className="space-y-6">
        
        <div>
          <h4 className="font-medium mb-3">Upcoming Events</h4>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          )}
        </div>

        
        <div>
          <h4 className="font-medium mb-3">All Events</h4>
          {allEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events yet. {canManage && "Create one to get started!"}
            </p>
          ) : (
            <div className="space-y-3">
              {allEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{event.title}</p>
                      {event.is_registered && (
                        <Badge variant="secondary" className="text-xs">Registered</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {moment(event.start_date).format('MMM D, YYYY • h:mm A')}
                    </p>
                  </div>
                  <Badge variant="outline">{event.category}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
          canManage={canManage}
          onEdit={() => {
            setEditingEvent(selectedEvent);
            setSelectedEvent(null);
          }}
          onDelete={() => {
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default CommunityDetail;