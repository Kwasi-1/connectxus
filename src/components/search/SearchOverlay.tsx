import { useState, useEffect } from "react";
import { X, Search, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      const updatedHistory = [
        query,
        ...searchHistory.filter((item) => item !== query),
      ].slice(0, 3);
      setSearchHistory(updatedHistory);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

      navigate(`/explore?q=${encodeURIComponent(query)}`);
      onClose();
      setSearchQuery("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-3">
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search Campus Vibe"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 border-none bg-muted rounded-full text-base focus-visible:ring-0"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {searchHistory.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent
              </h3>
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
                  <span>{query}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Trending
          </h3>
          <div className="space-y-2"></div>
        </div>
      </div>
    </div>
  );
}
