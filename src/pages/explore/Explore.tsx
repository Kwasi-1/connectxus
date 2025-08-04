
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/feed/PostCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { mockPosts, mockUsers } from '@/data/mockData';
import { Post, User } from '@/types/global';

type SearchTab = 'top' | 'latest' | 'people' | 'media';

const Explore = () => {
  const [activeTab, setActiveTab] = useState<SearchTab>('top');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const navigate = useNavigate();

  // Simulate API call with useEffect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setPosts([]);
      setUsers([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter data based on active tab and search query
      const query = searchQuery.toLowerCase();
      
      if (activeTab === 'people') {
        const filteredUsers = mockUsers.filter(user => 
          user.displayName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          (user.bio && user.bio.toLowerCase().includes(query))
        );
        setUsers(filteredUsers);
      } else {
        let filteredPosts = mockPosts.filter(post => 
          post.content.toLowerCase().includes(query) ||
          post.author.displayName.toLowerCase().includes(query) ||
          post.author.username.toLowerCase().includes(query)
        );
        
        if (activeTab === 'latest') {
          filteredPosts = filteredPosts.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else if (activeTab === 'media') {
          filteredPosts = filteredPosts.filter(post => post.images && post.images.length > 0);
        } else if (activeTab === 'top') {
          filteredPosts = filteredPosts.sort((a, b) => 
            (b.likes + b.comments + b.reposts) - (a.likes + a.comments + a.reposts)
          );
        }
        
        setPosts(filteredPosts);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [activeTab, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleRepost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isReposted: !post.isReposted, 
            reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1 
          }
        : post
    ));
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  return (
    <AppLayout>
      <div className="border-r border-border">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          {/* Search Bar */}
          <div className="flex items-center gap-4 px-4 py-3">
            <button 
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-hover transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 py-3 border rounded-full text-base bg-muted/50 border-transparent focus:bg-background focus:border-border"
                />
              </div>
            </form>
          </div>
          
          {/* Search Tabs */}
          {searchQuery && (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SearchTab)}>
              <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-none">
                <TabsTrigger 
                  value="top" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Top
                </TabsTrigger>
                <TabsTrigger 
                  value="latest" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Latest
                </TabsTrigger>
                <TabsTrigger 
                  value="people" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  People
                </TabsTrigger>
                <TabsTrigger 
                  value="media" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Media
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* Content */}
        <div className="mt-0">
          {!searchQuery ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-lg">Try searching for people, topics, or keywords</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SearchTab)}>
              <TabsContent value="top" className="mt-0">
                {loading ? (
                  <LoadingSpinner size="lg" />
                ) : (
                  <div className="divide-y divide-border">
                    {posts.length > 0 ? (
                      posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onLike={handleLike}
                          onComment={handleComment}
                          onRepost={handleRepost}
                          onShare={handleShare}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="latest" className="mt-0">
                {loading ? (
                  <LoadingSpinner size="lg" />
                ) : (
                  <div className="divide-y divide-border">
                    {posts.length > 0 ? (
                      posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onLike={handleLike}
                          onComment={handleComment}
                          onRepost={handleRepost}
                          onShare={handleShare}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">No recent results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="people" className="mt-0">
                {loading ? (
                  <LoadingSpinner size="lg" />
                ) : (
                  <div className="divide-y divide-border">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserClick(user.username)}
                          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={user.avatar || '/placeholder.svg'}
                              alt={user.displayName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="font-semibold text-foreground truncate">
                                  {user.displayName}
                                </p>
                                {user.verified && (
                                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm">@{user.username}</p>
                              {user.bio && (
                                <p className="text-foreground text-sm mt-1 line-clamp-2">{user.bio}</p>
                              )}
                              <p className="text-muted-foreground text-sm mt-1">
                                {user.followers.toLocaleString()} followers
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">No people found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="media" className="mt-0">
                {loading ? (
                  <LoadingSpinner size="lg" />
                ) : (
                  <div className="divide-y divide-border">
                    {posts.length > 0 ? (
                      posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onLike={handleLike}
                          onComment={handleComment}
                          onRepost={handleRepost}
                          onShare={handleShare}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">No media found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
