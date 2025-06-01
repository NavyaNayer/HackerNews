import  { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchStories } from '../api';
import { Story, StoryType } from '../types';
import StoryCard from '../components/StoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSearch } from '../context/SearchContext';

interface HomePageProps {
  type?: StoryType;
}

export default function HomePage({ type = 'top' }: HomePageProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSearching } = useSearch();
  
  useEffect(() => {
    async function loadStories() {
      setIsLoading(true);
      try {
        const data = await fetchStories(type);
        setStories(data);
      } catch (err) {
        setError('Failed to load stories. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!isSearching) {
      loadStories();
    }
  }, [type, isSearching]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-2xl font-bold mb-6 font-mono">
        {type === 'top' && 'Top Stories'}
        {type === 'new' && 'New Stories'}
        {type === 'best' && 'Best Stories'}
        {type === 'ask' && 'Ask HN'}
        {type === 'show' && 'Show HN'}
        {type === 'job' && 'Job Listings'}
      </h1>
      
      <div>
        {stories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </motion.div>
  );
}
 