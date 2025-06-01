import  { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowRight, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../context/SearchContext';
import { searchStories } from '../api';
import { Story } from '../types';

interface SearchBarProps {
  stories: Story[];
  isCompact?: boolean;
  onClose?: () => void;
}

export default function SearchBar({ stories, isCompact = false, onClose }: SearchBarProps) {
  const { 
    searchTerm, 
    setSearchTerm,
    setSearchResults,
    setIsSearching
  } = useSearch();
  
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);
  
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);
  
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setIsSearching(true);
    
    // Add to recent searches
    if (!recentSearches.includes(searchTerm)) {
      setRecentSearches(prev => [searchTerm, ...prev.slice(0, 4)]);
    }
    
    // Perform search
    setTimeout(() => {
      const results = searchStories(stories, searchTerm);
      setSearchResults(results);
      setLoading(false);
      
      // Close the search dropdown in compact mode
      if (isCompact && onClose) {
        onClose();
      }
    }, 500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      if (isCompact && onClose) {
        onClose();
      } else {
        setIsExpanded(false);
      }
    }
  };
  
  const handleRecentSearch = (term: string) => {
    setSearchTerm(term);
    
    // Automatically trigger search with the selected term
    setTimeout(() => {
      const results = searchStories(stories, term);
      setSearchResults(results);
      setIsSearching(true);
      
      // Close the search dropdown in compact mode
      if (isCompact && onClose) {
        onClose();
      }
    }, 100);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Simple component for compact mode
  if (isCompact) {
    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search stories..."
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <Search size={18} className="absolute left-3 top-3.5 text-gray-500" />
          
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        {recentSearches.length > 0 && !searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
            <div className="p-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 pb-1">Recent Searches</h3>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(term)}
                  className="flex items-center w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Clock size={14} className="mr-2 text-gray-400" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSearch}
            disabled={!searchTerm.trim() || loading}
            className="px-4 py-2 bg-primary text-white rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={16} className="mr-2" />
                Search
              </>
            )}
          </button>
        </div>
      </div>
    );
  }
  
  // Enhanced version for regular use
  return (
    <div className="relative">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ width: "2.5rem" }}
            animate={{ width: "16rem" }}
            exit={{ width: "2.5rem" }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => !searchTerm && setIsExpanded(false)}
              placeholder="Search stories..."
              className="w-full pl-10 pr-8 py-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
            
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
            
            {recentSearches.length > 0 && isExpanded && searchTerm === '' && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                <div className="p-2">
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 pb-1">Recent Searches</h3>
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearch(term)}
                      className="flex items-center w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Clock size={14} className="mr-2 text-gray-400" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.button
            initial={{ width: "2.5rem" }}
            animate={{ width: "2.5rem" }}
            onClick={() => setIsExpanded(true)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </motion.button>
        )}
      </AnimatePresence>
      
      {isExpanded && searchTerm && (
        <button
          onClick={handleSearch}
          disabled={loading}
          className="absolute right-[-2.5rem] top-0 p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
          aria-label="Submit search"
        >
          {loading ? <Loader size={20} className="animate-spin" /> : <ArrowRight size={20} />}
        </button>
      )}
    </div>
  );
}
 