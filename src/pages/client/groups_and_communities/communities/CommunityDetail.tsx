import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Community, CommunityPost, Announcement } from "@/types/communities";
import { Post, User } from "@/types/global";
import { useToast } from "@/hooks/use-toast";
import { useCommunity, useCommunityMembers, useJoinCommunity, useLeaveCommunity } from "@/hooks/useCommunities";
import { useQuery } from "@tanstack/react-query";
import { getPostsByCommunity } from "@/api/posts.api";
import { mockAnnouncements } from "@/data/mockCommunitiesData";

type CommunityTab = "posts" | "announcements" | "members" | "settings";

const CommunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<CommunityTab>("posts");
  const [searchQuery, setSearchQuery] = useState("");

    const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");

    const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");
  const [newAnnouncementContent, setNewAnnouncementContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

    const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [communityDescription, setCommunityDescription] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const { data: community, isLoading } = useCommunity(id || '');
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['community-posts', id],
    queryFn: () => getPostsByCommunity(id || ''),
    enabled: !!id && activeTab === 'posts',
  });
  const { data: members = [], isLoading: membersLoading } = useCommunityMembers(id || '', { page: 1, limit: 100 });

  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

    useEffect(() => {
    if (community?.description) {
      setCommunityDescription(community.description);
    }
  }, [community]);

    useEffect(() => {
    if (activeTab === "announcements" && id) {
      const communityAnnouncements = mockAnnouncements.filter(
        (a) => a.communityId === id
      );
      setAnnouncements(communityAnnouncements);
    }
  }, [activeTab, id]);

  const handleJoinCommunity = () => {
    if (!community || !id) return;

    if (community.is_member) {
      leaveMutation.mutate(id);
    } else {
      joinMutation.mutate(id);
    }
  };

  const handleCreatePost = (content: string, images?: string[]) => {
    if (!community) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: mockUsers.find((u) => u.id === currentUserId) || mockUsers[0],
      content,
      images: images || [],
      likes: 0,
      comments: 0,
      reposts: 0,
      quotes: 0,
      isLiked: false,
      isReposted: false,
      createdAt: new Date(),
    };

    setPosts([newPost, ...posts]);
    setIsComposerOpen(false);

    toast({
      title: "Post created",
      description: "Your post has been shared with the community",
    });
  };

  const handleCreateAnnouncement = () => {
    if (
      !community ||
      !newAnnouncementTitle.trim() ||
      !newAnnouncementContent.trim()
    )
      return;

    const newAnnouncement: Announcement = {
      id: `announcement-${Date.now()}`,
      communityId: community.id,
      title: newAnnouncementTitle,
      content: newAnnouncementContent,
      author: mockUsers.find((u) => u.id === currentUserId) || mockUsers[0],
      createdAt: new Date(),
      isPinned: isPinned,
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setNewAnnouncementTitle("");
    setNewAnnouncementContent("");
    setIsPinned(false);
    setIsCreatingAnnouncement(false);

    toast({
      title: "Announcement created",
      description: "Your announcement has been posted to the community",
    });
  };

  const handleUpdateCommunitySettings = () => {
    if (!community) return;

    setCommunity({
      ...community,
      description: communityDescription,
    });

    setIsEditingSettings(false);

    toast({
      title: "Settings updated",
      description: "Community settings have been saved",
    });
  };

  const handlePostAction = (
    postId: string,
    action: "like" | "repost" | "comment"
  ) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          switch (action) {
            case "like":
              return {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              };
            case "repost":
              return {
                ...post,
                isReposted: !post.isReposted,
                reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
              };
            default:
              return post;
          }
        }
        return post;
      })
    );
  };

    const handleQuote = (postId: string) => {
        console.log("Quote post:", postId);
  };

  const isAdmin = community?.role === 'admin' || community?.role === 'owner';
  const isModerator = community?.role === 'moderator';
  const canManage = isAdmin || isModerator;

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
        {}
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

        {}
        <div className="p-4 border-b border-border">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={community.cover_image || undefined} alt={community.name} />
              <AvatarFallback className="text-lg">
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{community.name}</h2>
              <p className="text-muted-foreground mt-1">
                {community.description}
              </p>

              {}
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

                {(community.settings as any)?.level && (community.settings as any)?.level !== "All" && (
                  <Badge variant="outline" className="gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Level {(community.settings as any).level}
                  </Badge>
                )}

                {(community.settings as any)?.department && (community.settings as any)?.department !== "All" && (
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

              {}
              <div className="mt-4">
                {community.is_member ? (
                  <div className="flex items-center gap-2">
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

        {}
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
            {canManage && (
              <>
                <TabsTrigger
                  value="members"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Members
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Settings
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {}
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
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {newPostContent.length}/280
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsComposerOpen(false);
                                setNewPostContent("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                handleCreatePost(newPostContent);
                                setNewPostContent("");
                              }}
                              disabled={
                                !newPostContent.trim() ||
                                newPostContent.length > 280
                              }
                            >
                              Post
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
              <LoadingSpinner />
            ) : (
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
                      onLike={() => handlePostAction(post.id, "like")}
                      onRepost={() => handlePostAction(post.id, "repost")}
                      onComment={() => handlePostAction(post.id, "comment")}
                      onShare={() => {}}
                      onQuote={handleQuote}
                    />
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="announcements" className="mt-0">
            {}
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

            {announcementsLoading ? (
              <LoadingSpinner />
            ) : (
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
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 hover:bg-muted/5">
                      <div className="flex items-start gap-3">
                        {announcement.isPinned && (
                          <Pin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="font-bold text-lg">
                              {announcement.title}
                            </h3>
                            {announcement.isPinned && (
                              <Badge variant="secondary" className="text-xs">
                                Pinned
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={announcement.author.avatar} />
                              <AvatarFallback className="text-xs">
                                {announcement.author.displayName
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>By {announcement.author.displayName}</span>
                            <span>•</span>
                            <span>
                              {announcement.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {canManage && (
            <>
              <TabsContent value="members" className="mt-0">
                <div className="p-4 space-y-4">
                  {}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {}
                  {membersLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="divide-y divide-border">
                      {members
                        .filter(
                          (member) =>
                            member.displayName
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            member.username
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map((member) => {
                          const isMemberAdmin = community?.admins.includes(
                            member.id
                          );
                          const isMemberModerator =
                            community?.moderators.includes(member.id);

                          return (
                            <div
                              key={member.id}
                              className="p-4 hover:bg-muted/5"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage
                                    src={member.avatar}
                                    alt={member.displayName}
                                  />
                                  <AvatarFallback>
                                    {member.displayName
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">
                                      {member.displayName}
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
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                    <span>{member.followers} followers</span>
                                    <span>{member.following} following</span>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Community Settings
                    </h3>

                    {}
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

                    {}
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
                            {community?.memberCount.toLocaleString()}
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
                            {community?.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {}
                    <Card>
                      <CardHeader>
                        <CardTitle>Management Team</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">
                            Administrators
                          </Label>
                          <div className="mt-2 space-y-2">
                            {community?.admins.map((adminId) => {
                              const admin = mockUsers.find(
                                (u) => u.id === adminId
                              );
                              return admin ? (
                                <div
                                  key={adminId}
                                  className="flex items-center gap-3 p-2 bg-muted/50 rounded-md"
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={admin.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {admin.displayName
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {admin.displayName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      @{admin.username}
                                    </p>
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>

                        {community?.moderators &&
                          community.moderators.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">
                                Moderators
                              </Label>
                              <div className="mt-2 space-y-2">
                                {community.moderators.map((modId) => {
                                  const moderator = mockUsers.find(
                                    (u) => u.id === modId
                                  );
                                  return moderator ? (
                                    <div
                                      key={modId}
                                      className="flex items-center gap-3 p-2 bg-muted/50 rounded-md"
                                    >
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={moderator.avatar} />
                                        <AvatarFallback className="text-xs">
                                          {moderator.displayName
                                            .substring(0, 2)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">
                                          {moderator.displayName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          @{moderator.username}
                                        </p>
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}

                        <p className="text-xs text-muted-foreground">
                          Administrators and moderators are assigned by app
                          administrators
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CommunityDetail;
