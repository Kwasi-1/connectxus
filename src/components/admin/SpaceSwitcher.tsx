import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminApi, Space } from '@/api/admin.api';
import { ChevronDown, Building2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SpaceSwitcherProps {
  className?: string;
}

export function SpaceSwitcher({ className = '' }: SpaceSwitcherProps) {
  const { selectedSpaceId, setSelectedSpaceId } = useAdminAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([]);
  const [displayedSpaces, setDisplayedSpaces] = useState<Space[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout>();
  const LIMIT = 10;

  useEffect(() => {
    const storedSpaces = localStorage.getItem('admin-spaces');
    if (storedSpaces) {
      try {
        setSpaces(JSON.parse(storedSpaces));
      } catch (error) {
        console.error('Failed to parse stored spaces:', error);
      }
    }
  }, []);

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchSpaces = useCallback(async (search: string = '', currentOffset: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setIsSearching(true);
      } else {
        setIsLoadingMore(true);
      }

      const { spaces: fetchedSpaces, total: fetchedTotal } = await adminApi.getSpaces({
        search: search || undefined,
        limit: LIMIT,
        offset: currentOffset,
      });

      if (append) {
        setDisplayedSpaces(prev => [...prev, ...fetchedSpaces]);
      } else {
        setDisplayedSpaces(fetchedSpaces);
      }

      setTotal(fetchedTotal);
      setHasMore(currentOffset + LIMIT < fetchedTotal);
      setOffset(currentOffset);
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
      toast.error('Failed to load spaces');
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && displayedSpaces.length === 0) {
      fetchSpaces('', 0, false);
    }
  }, [isOpen, displayedSpaces.length, fetchSpaces]);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (isOpen) {
      searchDebounceRef.current = setTimeout(() => {
        setOffset(0);
        fetchSpaces(searchQuery, 0, false);
      }, 300);
    }

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, isOpen, fetchSpaces]);

  const handleSpaceChange = (spaceId: string, spaceName: string) => {
    console.log('[DEBUG] SpaceSwitcher - Changing to space:', spaceId, spaceName);
    setSelectedSpaceId(spaceId);
    console.log('[DEBUG] SpaceSwitcher - Stored in localStorage:', localStorage.getItem('admin-current-space-id'));
    setIsOpen(false);
    setSearchQuery('');
    toast.success(`Switched to ${spaceName}`);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchSpaces(searchQuery, offset + LIMIT, true);
    }
  };

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
      setDisplayedSpaces([]);
      setOffset(0);
    }
  };

  const displayName = selectedSpaceId === 'all' ? 'All Spaces' : selectedSpace?.name || 'Select Space';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={handleDropdownToggle}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors w-full sm:w-auto"
      >
        <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
          {displayName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {isSearching && displayedSpaces.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : displayedSpaces.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No spaces found
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleSpaceChange('all', 'All Spaces')}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                    selectedSpaceId === 'all'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">All Spaces</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        View data across all spaces
                      </div>
                    </div>
                    {selectedSpaceId === 'all' && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {displayedSpaces.map((space) => (
                  <button
                    key={space.id}
                    onClick={() => handleSpaceChange(space.id, space.name)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      space.id === selectedSpaceId
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{space.name}</div>
                        {space.slug && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {space.slug}
                          </div>
                        )}
                      </div>
                      {space.id === selectedSpaceId && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}

                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full px-4 py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 border-t border-gray-200 dark:border-gray-700"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${displayedSpaces.length} of ${total})`
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
