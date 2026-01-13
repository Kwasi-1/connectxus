import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { mockCampusHighlightStories } from "@/data/mockStories";
import { Story } from "@/types/story";
import { StoryViewer } from "@/components/story/StoryViewer";
import { StoryGroup } from "@/types/story";
import { cn } from "@/lib/utils";

const categoryColors = {
  EVENT: "bg-blue-500",
  ACADEMIA: "bg-green-500",
  SCIENCE: "bg-purple-500",
  SPORTS: "bg-orange-500",
  CLUBS: "bg-pink-500",
};

const HighlightStories = () => {
  const navigate = useNavigate();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filters = ["All", "Events", "Clubs", "Academics"];

  // Convert stories to story groups for the viewer
  const storyGroups: StoryGroup[] = mockCampusHighlightStories.map((story) => ({
    user_id: story.user_id,
    username: story.username,
    avatar: story.avatar,
    has_unseen: false,
    stories: [story],
  }));

  // Featured story (first one)
  const featuredStory = mockCampusHighlightStories[0];
  const recentStories = mockCampusHighlightStories.slice(1);

  return (
    <>
      <AppLayout>
        <div className="border-x min-h-screen lg:border-x-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="flex items-center gap-4 p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Campus Highlights</h1>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Featured Stories Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Featured Stories</h2>
                <Button variant="link" className="text-primary p-0 h-auto">
                  View all
                </Button>
              </div>

              {/* Featured story card */}
              <div
                className="relative rounded-3xl overflow-hidden cursor-pointer h-64 group"
                onClick={() => setSelectedStoryIndex(0)}
              >
                <img
                  src={featuredStory.media_url}
                  alt={featuredStory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {featuredStory.category && (
                  <div className="absolute top-4 left-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-white text-xs font-semibold uppercase",
                        categoryColors[featuredStory.category]
                      )}
                    >
                      {featuredStory.category}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {featuredStory.title}
                  </h3>
                  <p className="text-sm text-white/90">
                    {featuredStory.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Updates Section */}
            <div>
              <h2 className="text-lg font-bold mb-3">Recent Updates</h2>

              {/* Grid layout */}
              <div className="grid grid-cols-2 gap-3">
                {recentStories.map((story, index) => (
                  <div
                    key={story.id}
                    className="relative rounded-2xl overflow-hidden cursor-pointer aspect-[3/4] group"
                    onClick={() => setSelectedStoryIndex(index + 1)}
                  >
                    <img
                      src={story.media_url}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {story.category && (
                      <div className="absolute top-3 left-3">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-white text-[10px] font-semibold uppercase",
                            categoryColors[story.category]
                          )}
                        >
                          {story.category}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h3 className="text-sm font-bold mb-1 line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-xs text-white/80 line-clamp-1">
                        {story.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
