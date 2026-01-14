import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Clock } from "lucide-react";
import { mockCampusHighlightStories } from "@/data/mockStories";
import { StoryViewer } from "@/components/story/StoryViewer";
import { StoryGroup } from "@/types/story";

const HighlightStories = () => {
  const navigate = useNavigate();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filters = ["All", "Communities", "Following", "Others"];

  // Convert stories to story groups for the viewer
  const storyGroups: StoryGroup[] = mockCampusHighlightStories.map((story) => ({
    user_id: story.user_id,
    username: story.username,
    avatar: story.avatar,
    has_unseen: false,
    stories: [story],
  }));

  const getTimeAgo = (createdAt: string) => {
    const now = Date.now();
    const timestamp = new Date(createdAt).getTime();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <>
      <AppLayout showRightSidebar={false}>
        <div className="border-x min-h-screen lg:border-l-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b">
            <div className="flex items-center gap-3 p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Campus Stories
                </h1>
                <p className="text-xs text-muted-foreground">
                  Stories from your community
                </p>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full whitespace-nowrap text-sm"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Story Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {mockCampusHighlightStories.map((story, index) => (
                <div
                  key={story.id}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[9/16] border border-border"
                  onClick={() => setSelectedStoryIndex(index)}
                >
                  {/* Story Background Image */}
                  <img
                    src={story.media_url}
                    alt={story.username}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

                  {/* User Avatar - Top */}
                  <div className="absolute top-3 left-3">
                    <Avatar className="h-10 w-10 ring-2 ring-white/50">
                      <AvatarImage src={story.avatar} alt={story.username} />
                      <AvatarFallback className="bg-primary/80 text-white font-semibold text-xs">
                        {story.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Time Badge - Top Right */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-white" />
                      <span className="text-xs text-white font-medium">
                        {getTimeAgo(story.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* User Info - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-semibold text-sm mb-0.5 truncate">
                      {story.username}
                    </h3>
                    {story.title && (
                      <p className="text-xs text-white/90 line-clamp-2">
                        {story.title}
                      </p>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Empty state */}
            {mockCampusHighlightStories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Clock className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No stories yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Stories from your communities, people you follow, and others
                  will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>

      {/* Story Viewer */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          isOpen={selectedStoryIndex !== null}
          onClose={() => setSelectedStoryIndex(null)}
          storyGroups={storyGroups}
          initialGroupIndex={selectedStoryIndex}
        />
      )}
    </>
  );
};

export default HighlightStories;
