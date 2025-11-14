import {
  MessageSquare,
  Heart,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile, Post } from "@/types/global";
import { hasRole } from "@/lib/role";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/PostCard";

interface ProfileTabsProps {
  user: UserProfile;
  isOwnProfile?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onQuote?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onMediaClick?: (post: Post) => void;
}

export const ProfileTabs = ({
  user,
  isOwnProfile = true,
  onLike = () => {},
  onComment = () => {},
  onRepost = () => {},
  onQuote = () => {},
  onShare = () => {},
  onMediaClick = () => {},
}: ProfileTabsProps) => {
  const { user: authUser } = useAuth();

  const getTabs = () => {
    const baseTabs = [
      {
        id: "posts",
        label: "Posts",
        icon: MessageSquare,
        count: user.posts.length,
      },
    ];

        if (isOwnProfile) {
      baseTabs.push({ id: "likes", label: "Likes", icon: Heart, count: 0 });

            if (hasRole(authUser, "student")) {
        baseTabs.push({
          id: "groups",
          label: "Groups",
          icon: Users,
          count: user.joinedGroups.length,
        });
      }

      if (hasRole(authUser, "tutor")) {
        baseTabs.push({
          id: "tutoring",
          label: "Tutoring",
          icon: BookOpen,
          count: user.tutoringRequests.length,
        });
      }

      if (hasRole(authUser, "mentor")) {
        baseTabs.push({
          id: "mentorship",
          label: "Mentorship",
          icon: GraduationCap,
          count: null,
        });
      }

      baseTabs.push({
        id: "settings",
        label: "Settings",
        icon: Settings,
        count: null,
      });
    }

    return baseTabs;
  };

  const tabs = getTabs();

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full overflow-x-auto justify-start h-auto p-0 bg-transparent border-b rounded-none">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex-1 min-w-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-4 px-6"
          >
            <div className="flex items-center gap-2 min-w-0">
              <tab.icon className="h-4 w-4" />
              <span className="truncate">{tab.label}</span>
              {tab.count !== null && (
                <span className="text-muted-foreground">({tab.count})</span>
              )}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="posts" className="space-y-0 mt-0">
        {user.posts.length > 0 ? (
          user.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={onLike}
              onComment={onComment}
              onRepost={onRepost}
              onQuote={onQuote}
              onShare={onShare}
              onMediaClick={onMediaClick}
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No posts yet</p>
            <p className="text-sm">
              When {isOwnProfile ? "you" : user.username} post something, it
              will show up here.
            </p>
          </div>
        )}
      </TabsContent>

      {isOwnProfile && (
        <>
          <TabsContent value="likes" className="space-y-4 mt-0">
            <div className="pt-4" />
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No likes yet</p>
              <p className="text-sm">
                Tap the heart on posts you like and they'll show up here.
              </p>
            </div>
          </TabsContent>

          {hasRole(authUser, "student") && (
            <TabsContent value="groups" className="space-y-4 mt-0">
              <div className="pt-4" />
              {user.joinedGroups.length > 0 ? (
                user.joinedGroups.map((group) => (
                  <Card
                    key={group.id}
                    className="border-0 border-b border-border rounded-none"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={group.avatar} />
                          <AvatarFallback>
                            {group.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{group.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.members} members • {group.category}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No groups joined</p>
                  <p className="text-sm">
                    Join groups to connect with others who share your interests.
                  </p>
                </div>
              )}
            </TabsContent>
          )}

          {hasRole(authUser, "tutor") && (
            <TabsContent value="tutoring" className="space-y-4 mt-0">
              <div className="pt-4" />
              {user.tutoringRequests.length > 0 ? (
                user.tutoringRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="border-0 border-b border-border rounded-none"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{request.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "accepted"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No tutoring requests</p>
                  <p className="text-sm">
                    Your tutoring sessions will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          )}

          {hasRole(authUser, "mentor") && (
            <TabsContent value="mentorship" className="space-y-4 mt-0">
              <div className="border-b border-border pt-4" />
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No mentorship sessions</p>
                <p className="text-sm">
                  Your mentoring activities will show up here.
                </p>
              </div>
            </TabsContent>
          )}

          <TabsContent value="settings" className="space-y-4">
            <Card className="rounded-none border-0">
              <CardContent className="p-6 space-y-6 rounded-none">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Appearance</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize how Campus Vibe looks on your device
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified about activity via email
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Privacy Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Control your privacy and data settings
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};
