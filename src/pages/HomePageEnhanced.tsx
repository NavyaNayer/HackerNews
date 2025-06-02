import  { useState, useEffect } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import StoryCardEnhanced from '../components/StoryCardEnhanced';
import LoadingSpinner from '../components/LoadingSpinner';
import StoryFilters from '../components/StoryFilters';
import Header from '../components/Header';
import { fetchStories } from '../api';
import { StoryType, SortOption, FilterOption } from '../types';
import { useSearch } from '../context/SearchContext';
import { filterStories, sortStories } from '../utils/storyUtils';
import SearchResultsPage from './SearchResultsPage';

interface HomePageProps {
  type?: StoryType;
}

export default function HomePageEnhanced({ type = 'top' }: HomePageProps) {
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>('score');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const pageSize = 10;
  const { isSearching } = useSearch();
  
  const { data: stories, error, isLoading } = useSWR(
    `stories/${type}`,
    () => fetchStories(type, 50),
    { revalidateOnFocus: false }
  );

  // Apply filters and sorting
  let filteredStories = stories ? filterStories(stories, filterOption) : [];

  // Time cutoff support for "Go back a day/month/year"
  // Only apply cutoff if a special sort option is selected
  const timeCutoff = (window as any).__storyTimeCutoff;
  if (
    (sortOption === 'time' || sortOption === 'score' || sortOption === 'comments' || sortOption === 'oldest') &&
    timeCutoff &&
    Array.isArray(filteredStories)
  ) {
    filteredStories = filteredStories.filter(story => story.time >= timeCutoff);
  } else if (!timeCutoff && (window as any).__storyTimeCutoff) {
    // If cutoff is cleared, remove it from window
    delete (window as any).__storyTimeCutoff;
  }

  const sortedStories = sortStories(filteredStories, sortOption);
  const displayedStories = sortedStories.slice(0, page * pageSize);
  const hasMore = sortedStories.length > page * pageSize;

  useEffect(() => {
    setPage(1);
  }, [type, sortOption, filterOption]);

  const loadMore = () => {
    setPage(page + 1);
  };

  // If we're in search mode, show search results instead
  if (isSearching) {
    return <SearchResultsPage />;
  }

  if (error) return <div className="p-8 text-center">Failed to load stories</div>;
  if (isLoading) return <LoadingSpinner />;

  const titles: Record<string, string> = {
    top: "Trending Stories",
    new: "Latest Stories",
    best: "Best Stories",
    ask: "Ask HackerNews",
    show: "Show HackerNews",
    job: "Job Listings"
  };

  // Get the top story for featured display
  const topStory = sortedStories[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {type === 'top' && <Header />}
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <motion.h1 
            className="text-3xl font-mono font-bold gradient-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {titles[type]}
          </motion.h1>
          
          <div className="flex items-center justify-between md:justify-end space-x-2">
            <StoryFilters
              currentSort={sortOption}
              currentFilter={filterOption}
              onSortChange={setSortOption}
              onFilterChange={setFilterOption}
            />
          </div>
        </div>
        
        {filteredStories.length === 0 ? (
          <div className="card p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No stories match your filter</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try selecting a different filter or category.
            </p>
            <button
              onClick={() => setFilterOption('all')}
              className="btn btn-primary"
            >
              Show All Stories
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* All stories with consistent styling */}
              {displayedStories.map((story) => (
                <StoryCardEnhanced 
                  key={story.id} 
                  story={story} 
                />
              ))}
            </div>
            
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="btn btn-primary"
                >
                  Load More Stories
                </button>
              </div>
            )}

            {!hasMore && sortedStories.length > 0 && (
              <div className="text-center mt-8 text-gray-500 dark:text-gray-400">
                You've reached the end of the list
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
