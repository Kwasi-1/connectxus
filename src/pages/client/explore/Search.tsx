import { useState, useEffect } from 'react';
import { Search as SearchIcon, Clock, TrendingUp, Users, FileText, Building, Briefcase, Calendar, GraduationCap, BookOpen, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi, GlobalSearchResults } from '@/api/search.api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type SearchTab = 'all' | 'users' | 'posts' | 'communities' | 'groups' | 'events' | 'mentors' | 'tutors';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', queryParam, activeTab],
    queryFn: async () => {
      if (!queryParam.trim()) return null;

      if (activeTab === 'all') {
        return searchApi.globalSearch({ query: queryParam });
      } else if (activeTab === 'users') {
        const users = await searchApi.searchUsers({ query: queryParam });
        return { users } as GlobalSearchResults;
      } else if (activeTab === 'posts') {
        const posts = await searchApi.searchPosts({ query: queryParam });
        return { posts } as GlobalSearchResults;
      } else if (activeTab === 'communities') {
        const communities = await searchApi.searchCommunities({ query: queryParam });
        return { communities } as GlobalSearchResults;
      } else if (activeTab === 'groups') {
        const groups = await searchApi.searchGroups({ query: queryParam });
        return { groups } as GlobalSearchResults;
      } else if (activeTab === 'events') {
        const events = await searchApi.searchEvents({ query: queryParam });
        return { events } as GlobalSearchResults;
      } else if (activeTab === 'mentors') {
        const mentors = await searchApi.searchMentors({ query: queryParam });
        return { mentors } as GlobalSearchResults;
      } else if (activeTab === 'tutors') {
        const tutors = await searchApi.searchTutors({ query: queryParam });
        return { tutors } as GlobalSearchResults;
      }
      return null;
    },
    enabled: !!queryParam.trim(),
    staleTime: 30000,
  });

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      const updatedHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setSearchParams({ q: query });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const UserCard = ({ user }: { user: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/profile/${user.username}`)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{user.full_name}</h3>
              {user.verified && <Badge variant="default" className="text-xs">Verified</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.bio && <p className="text-sm mt-1 line-clamp-2">{user.bio}</p>}
            {(user.level || user.department) && (
              <div className="flex gap-2 mt-2">
                {user.level && <Badge variant="outline" className="text-xs">{user.level}</Badge>}
                {user.department && <Badge variant="outline" className="text-xs">{user.department}</Badge>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PostCard = ({ post }: { post: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author_avatar} />
            <AvatarFallback>{post.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{post.full_name || 'Unknown User'}</h4>
              <span className="text-xs text-muted-foreground">@{post.username || 'unknown'}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm mt-1 line-clamp-3">{post.content}</p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>{post.likes_count || 0} likes</span>
              <span>{post.comments_count || 0} comments</span>
              <span>{post.reposts_count || post.shares_count || 0} shares</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CommunityCard = ({ community }: { community: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/communities/${community.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-md">
            <AvatarImage src={community.cover_image} />
            <AvatarFallback>{community.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{community.name}</h3>
              <Badge variant="secondary" className="text-xs">{community.category}</Badge>
            </div>
            {community.description && <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>}
            <div className="flex items-center gap-2 mt-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{community.member_count || 0} members</span>
              {community.is_joined && <Badge variant="outline" className="text-xs">Joined</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const GroupCard = ({ group }: { group: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/groups/${group.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={group.avatar} />
            <AvatarFallback>{group.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{group.name}</h3>
              <Badge variant="secondary" className="text-xs">{group.group_type}</Badge>
            </div>
            {group.description && <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>}
            <div className="flex items-center gap-2 mt-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{group.member_count || 0} members</span>
              {group.is_member && <Badge variant="outline" className="text-xs">Member</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EventCard = ({ event }: { event: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 rounded-md">
            <AvatarImage src={event.cover_image} />
            <AvatarFallback><Calendar className="h-6 w-6" /></AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{event.title}</h3>
              <Badge variant="secondary" className="text-xs">{event.event_type}</Badge>
            </div>
            {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}
            <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
              <div>{new Date(event.start_time).toLocaleString()}</div>
              <div>{event.location}</div>
              <div>{event.attendee_count || 0} attending</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MentorCard = ({ mentor }: { mentor: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/mentors/${mentor.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mentor.avatar} />
            <AvatarFallback>{mentor.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{mentor.full_name}</h3>
            <p className="text-sm text-muted-foreground">@{mentor.username}</p>
            {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {mentor.expertise_areas.slice(0, 3).map((area: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">{area}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>⭐ {mentor.rating?.toFixed(1) || 'N/A'}</span>
              <span>·</span>
              <span>{mentor.total_sessions || 0} sessions</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TutorCard = ({ tutor }: { tutor: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/tutors/${tutor.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={tutor.avatar} />
            <AvatarFallback>{tutor.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{tutor.full_name}</h3>
            <p className="text-sm text-muted-foreground">@{tutor.username}</p>
            {tutor.subjects && tutor.subjects.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {tutor.subjects.slice(0, 3).map((subject: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">{subject}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>⭐ {tutor.rating?.toFixed(1) || 'N/A'}</span>
              <span>·</span>
              <span>{tutor.total_sessions || 0} sessions</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderResults = () => {
    if (!queryParam.trim()) {
      return null;
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-destructive">
          <p>Error loading search results</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as any)?.message || 'Unknown error'}</p>
        </div>
      );
    }

    if (!searchResults) {
      return null;
    }

    const hasResults = activeTab === 'all'
      ? Object.values(searchResults).some((arr) => arr && arr.length > 0)
      : searchResults[activeTab as keyof GlobalSearchResults]?.length > 0;

    if (!hasResults) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No results found for "{queryParam}"</p>
          <p className="text-sm mt-1">Try different keywords or check your spelling</p>
        </div>
      );
    }

    if (activeTab === 'all') {
      return (
        <div className="space-y-6">
          {searchResults.users && searchResults.users.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users ({searchResults.users.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('users')}>
                  See all
                </Button>
              </div>
              <div className="space-y-2">
                {searchResults.users.slice(0, 3).map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}

          {searchResults.posts && searchResults.posts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Posts ({searchResults.posts.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('posts')}>
                  See all
                </Button>
              </div>
              <div className="space-y-2">
                {searchResults.posts.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {searchResults.communities && searchResults.communities.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Communities ({searchResults.communities.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('communities')}>
                  See all
                </Button>
              </div>
              <div className="space-y-2">
                {searchResults.communities.slice(0, 3).map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            </div>
          )}

          {searchResults.groups && searchResults.groups.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Groups ({searchResults.groups.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('groups')}>
                  See all
                </Button>
              </div>
              <div className="space-y-2">
                {searchResults.groups.slice(0, 3).map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}

          {searchResults.events && searchResults.events.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Events ({searchResults.events.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('events')}>
                  See all
                </Button>
              </div>
              <div className="space-y-2">
                {searchResults.events.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {searchResults.mentors && searchResults.mentors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Mentors ({searchResults.mentors.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('mentors')}>
                  See all
                </Button>
              </div>
              <div className="space-y-2">
                {searchResults.mentors.slice(0, 3).map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} />
                ))}
              </div>
            </div>
          )}

          {searchResults.tutors && searchResults.tutors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Tutors ({searchResults.tutors.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('tutors')}>
                  See all
                </Button>
              </div>
              <div className="space-y-2">
                {searchResults.tutors.slice(0, 3).map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {activeTab === 'users' && searchResults.users?.map((user) => <UserCard key={user.id} user={user} />)}
        {activeTab === 'posts' && searchResults.posts?.map((post) => <PostCard key={post.id} post={post} />)}
        {activeTab === 'communities' && searchResults.communities?.map((community) => <CommunityCard key={community.id} community={community} />)}
        {activeTab === 'groups' && searchResults.groups?.map((group) => <GroupCard key={group.id} group={group} />)}
        {activeTab === 'events' && searchResults.events?.map((event) => <EventCard key={event.id} event={event} />)}
        {activeTab === 'mentors' && searchResults.mentors?.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
        {activeTab === 'tutors' && searchResults.tutors?.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} />)}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 md:px-6 py-3">
            <h1 className="text-xl font-bold text-foreground mb-4">Search</h1>

            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 py-3 border rounded-full text-base"
                autoFocus
              />
            </div>

            {queryParam && (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SearchTab)} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="communities">Communities</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="mentors">Mentors</TabsTrigger>
                  <TabsTrigger value="tutors">Tutors</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>

        <div className="p-4 md:px-6">
          {!queryParam ? (
            <>
              {searchHistory.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Recent Searches
                    </h2>
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      Clear all
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {searchHistory.map((query, index) => (
                      <div
                        key={index}
                        onClick={() => handleSearch(query)}
                        className="flex items-center p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                      >
                        <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span className="text-base">{query}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trending Topics
                </h2>
                <p className="text-sm text-muted-foreground">
                  Search for users, posts, communities, groups, events, mentors, and tutors
                </p>
              </div>
            </>
          ) : (
            renderResults()
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Search;
