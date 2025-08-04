
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Lock, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { mockGroups } from '@/data/mockCommunitiesData';
import { Group, GroupCategory } from '@/types/communities';

const categoryFilters: GroupCategory[] = [
  'Academic', 'Study Group', 'Professional', 'Social', 'Sports', 'Arts', 'Technology', 'Other'
];

const GroupsNew = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GroupCategory | 'All'>('All');
  const [visibilityFilter, setVisibilityFilter] = useState<'All' | 'Public' | 'Private'>('All');

  useEffect(() => {
    const loadGroups = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setGroups(mockGroups);
      setIsLoading(false);
    };

    loadGroups();
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || group.category === selectedCategory;
    const matchesVisibility = visibilityFilter === 'All' || 
      (visibilityFilter === 'Public' && !group.isPrivate) ||
      (visibilityFilter === 'Private' && group.isPrivate);
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  if (isLoading) {
    return (
      <AppLayout showRightSidebar={false}>
        <LoadingSpinner size="lg" />
      </AppLayout>
    );
  }

  return (
    <AppLayout showRightSidebar={false}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Groups</h1>
            <p className="text-muted-foreground mt-1">Join smaller groups for focused discussions and collaboration</p>
          </div>
          <Button className="bg-foreground hover:bg-foreground/90 text-background">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'All' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('All')}
              className="rounded-full"
            >
              All Categories
            </Button>
            {categoryFilters.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant={visibilityFilter === 'All' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisibilityFilter('All')}
              className="rounded-full"
            >
              All Groups
            </Button>
            <Button
              variant={visibilityFilter === 'Public' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisibilityFilter('Public')}
              className="rounded-full"
            >
              Public
            </Button>
            <Button
              variant={visibilityFilter === 'Private' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisibilityFilter('Private')}
              className="rounded-full"
            >
              Private
            </Button>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card 
              key={group.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={group.avatar} alt={group.name} />
                      <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {group.name}
                        {group.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{group.category}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {group.memberCount}{group.maxMembers ? `/${group.maxMembers}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-2">{group.description}</p>
                <div className="flex flex-wrap gap-1">
                  {group.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {group.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No groups found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default GroupsNew;
