import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Users, TrendingUp, Sparkles } from "lucide-react";
import { mockPeople, Person } from "@/data/mockPeople";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PeopleFilters } from "@/components/people/PeopleFilters";

type FilterType = "all" | "department" | "may-know" | "trending" | "new";

export function People() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const handleFollow = (personId: string) => {
    setFollowingIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(personId)) {
        newSet.delete(personId);
      } else {
        newSet.add(personId);
      }
      return newSet;
    });
  };

  const filterPeople = (people: Person[]): Person[] => {
    let filtered = people;

    // Apply filter
    switch (activeFilter) {
      case "department":
        filtered = people.filter(
          (p) =>
            p.department === user?.department ||
            p.department === "Computer Science"
        );
        break;
      case "may-know":
        filtered = people.filter((p) => p.mutualFollowers > 5);
        break;
      case "trending":
        filtered = people.filter((p) => p.isTrending);
        break;
      case "new":
        filtered = people.filter((p) => p.isNew);
        break;
      default:
        filtered = people;
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPeople = filterPeople(mockPeople);

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
                Connect with students, tutors, and creators in your community
              </p>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 border rounded-full text-base"
                  autoFocus
                />
              </div>
            </div>
          </div>
        <div className="px-4 md:px-6 ">          
          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredPeople.length}{" "}
              {filteredPeople.length === 1 ? "person" : "people"} found
            </p>
          </div>

          {/* People Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredPeople.map((person) => (
              <Card
                key={person.id}
                className="group hover:shadow-md transition-all duration-200 hover:border-primary/20"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-14 w-14 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {person.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            @{person.username}
                          </p>
                        </div>
                        {(person.isTrending || person.isNew) && (
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            {person.isTrending ? "Trending" : "New"}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {person.bio}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                        <span>
                          {person.followers.toLocaleString()} followers
                        </span>
                        {person.mutualFollowers > 0 && (
                          <span className="text-primary">
                            {person.mutualFollowers} mutual
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
                        onClick={() => handleFollow(person.id)}
                      >
                        {followingIds.has(person.id) ? "Following" : "Follow"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredPeople.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No people found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
