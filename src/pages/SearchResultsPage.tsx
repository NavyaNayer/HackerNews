import  { useEffect } from 'react';
import { motion } from 'framer-motion';
import StoryCard from '../components/StoryCard';
import { useSearch } from '../context/SearchContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

export default function SearchResultsPage() {
  const { searchTerm, searchResults } = useSearch();
  
  // Scroll to top when search results change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchResults]);

  return (
    <div className="container mx-auto px-4 py-6">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      <div className="flex items-center mb-6">
        <Link to="/" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-300">
          <ArrowLeft size={20} />
        </Link>
        
        <motion.h1 
          className="text-2xl font-mono font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Search Results for <span className="text-primary dark:text-primary-dark">"{searchTerm}"</span>
        </motion.h1>
      </div>
      
      <div id="main-content">
        {searchResults.length > 0 ? (
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </p>
            
            <div className="space-y-4">
              {searchResults.map((story) => (
                <StoryCard key={story.id} story={story} highlight={searchTerm} />
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="flex justify-center mb-4">
              <Search size={48} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              We couldn't find any stories matching "{searchTerm}". 
              Try different keywords or browse our trending stories.
            </p>
            <Link to="/" className="btn btn-primary">
              Browse Trending Stories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
 