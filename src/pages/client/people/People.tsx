import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PeopleFilters } from "@/components/people/PeopleFilters";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPeopleInSpace,
  getPeopleInDepartment,
  getPeopleYouMayKnow,
  searchUsers,
  followUser,
  unfollowUser,
  checkFollowingStatus,
  UserProfile,
} from "@/api/users.api";
import { toast } from "sonner";

type FilterType = "all" | "department" | "may-know";

export function People() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("may-know");
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const { data: allPeople = [], isLoading: loadingAll } = useQuery({
    queryKey: ["people", "all"],
    queryFn: () => getAllPeopleInSpace({ limit: 100 }),
    enabled: activeFilter === "all" && !searchQuery,
  });

  const { data: departmentPeople = [], isLoading: loadingDepartment } =
    useQuery({
      queryKey: ["people", "department"],
      queryFn: () => getPeopleInDepartment({ limit: 100 }),
      enabled: activeFilter === "department" && !searchQuery,
    });

  const { data: mayKnowPeople = [], isLoading: loadingMayKnow } = useQuery({
    queryKey: ["people", "may-know"],
    queryFn: () => getPeopleYouMayKnow({ limit: 100 }),
    enabled: activeFilter === "may-know" && !searchQuery,
  });

  const { data: searchResults = [], isLoading: loadingSearch } = useQuery({
    queryKey: ["people", "search", searchQuery],
    queryFn: () => searchUsers({ q: searchQuery, limit: 100 }),
    enabled: !!searchQuery && searchQuery.length > 0,
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: (_, userId) => {
      setFollowingIds((prev) => new Set(prev).add(userId));
      queryClient.invalidateQueries({ queryKey: ["people"] });
      toast.success("Followed successfully");
    },
    onError: () => {
      toast.error("Failed to follow user");
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: (_, userId) => {
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ["people"] });
      toast.success("Unfollowed successfully");
    },
    onError: () => {
      toast.error("Failed to unfollow user");
    },
  });

  const handleFollow = (personId: string) => {
    if (followingIds.has(personId)) {
      unfollowMutation.mutate(personId);
    } else {
      followMutation.mutate(personId);
    }
  };

  const handleCardClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  let people: UserProfile[] = [];
  let isLoading = false;

  if (searchQuery) {
    people = searchResults;
    isLoading = loadingSearch;
  } else {
    switch (activeFilter) {
      case "all":
        people = allPeople;
        isLoading = loadingAll;
        break;
      case "department":
        people = departmentPeople;
        isLoading = loadingDepartment;
        break;
      case "may-know":
        people = mayKnowPeople;
        isLoading = loadingMayKnow;
        break;
    }
  }

  return (
    <AppLayout
      rightSidebarContent={
        <PeopleFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      }
    >
      <div className="min-h-screen bg-background border-r border-border">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border mb-8">
          <div className="px-4 md:px-6 py-3">
            <h1 className="text-xl font-bold text-foreground mb-4">
              Discover People
            </h1>
            <p className="text-muted-foreground mb-4">
              Connect with students and tutors in your community
            </p>

            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 border rounded-full text-base"
                autoFocus
              />
            </div>
          </div>
        </div>
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {people.length} {people.length === 1 ? "person" : "people"} found
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* People Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 gap-4">
              {people.map((person) => (
                <Card
                  key={person.id}
                  className="hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <CardContent className="p-5">
                    <div
                      className="flex items-start gap-4"
                      onClick={(e) => {
                        if (!(e.target as HTMLElement).closest("button")) {
                          handleCardClick(person.id);
                        }
                      }}
                    >
                      {/* Avatar */}
                      <Avatar className="h-14 w-14 ring-2 ring-background transition-all">
                        <AvatarImage
                          src={person.avatar || undefined}
                          alt={person.full_name}
                        />
                        <AvatarFallback>
                          {person.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                              {person.full_name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              @{person.username}
                            </p>
                          </div>
                        </div>

                        {person.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {person.bio}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                          <span>{person.followers_count || 0} followers</span>
                          {person.level && (
                            <span className="text-primary">
                              Level {person.level}
                            </span>
                          )}
                        </div>

                        {/* Follow Button */}
                        <Button
                          size="sm"
                          variant={
                            followingIds.has(person.id) ? "outline" : "default"
                          }
                          className="w-full bg-foreground hover:bg-foreground/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollow(person.id);
                          }}
                          disabled={
                            followMutation.isPending ||
                            unfollowMutation.isPending
                          }
                        >
                          {followingIds.has(person.id) ? "Following" : "Follow"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && people.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No people found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Try adjusting your filters"}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
