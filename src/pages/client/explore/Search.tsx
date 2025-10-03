
import { useState, useEffect } from 'react';
import { Search as SearchIcon, Clock, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { mockTrendingTopics } from '@/data/mockData';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      // Add to search history
      const updatedHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 3);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      
      // Navigate to explore with search query
      navigate(`/explore?q=${encodeURIComponent(query)}`);
      setSearchQuery('');
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

  return (
    <AppLayout>
      <div className="border-r border-border h-full tracking-wider">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 md:px-6 py-3">
            <h1 className="text-xl font-bold text-foreground mb-4">Search</h1>
            
            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search Campus Vibe"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 py-3 border rounded-full text-base"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:px-6">
          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent
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

          {/* Trending */}
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Trending on Campus Vibe
            </h2>
            <div className="">
              {mockTrendingTopics.slice(0, 10).map((topic, index) => (
                <div
                  key={topic.id}
                  onClick={() => handleSearch(topic.name)}
                  className="p-4 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        {index + 1} · Trending in {topic.category}
                      </p>
                      <p className="font-semibold text-foreground text-base mb-1 tracking-wider">{topic.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {topic.posts.toLocaleString()} posts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Search;
