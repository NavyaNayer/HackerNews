import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatTime, getDomain } from '../api';
import { useSavedStories } from '../context/SavedStoriesContext';
import { Bookmark, Link as LinkIcon, Trash, ArrowLeft, Search, Calendar } from 'lucide-react';

export default function SavedStoriesPage() {
  const { savedStories, removeSavedStory } = useSavedStories();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStories = searchTerm 
    ? savedStories.filter(story => 
        story.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : savedStories;
  
  const handleRemove = (id: number) => {
    if (window.confirm('Are you sure you want to remove this saved story?')) {
      removeSavedStory(id);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4">
        <ArrowLeft size={16} className="mr-1" />
        Back to stories
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.h1 
          className="text-3xl font-mono font-bold gradient-text mb-4 md:mb-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Bookmark className="inline-block mr-2" />
          Your Saved Stories
        </motion.h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search saved stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
        </div>
      </div>
      
      {filteredStories.length === 0 && (
        <div className="card p-8 text-center">
          {searchTerm ? (
            <>
              <h2 className="text-xl font-semibold mb-2">No stories match your search</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Try a different search term or clear the search
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="btn btn-primary"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">You haven't saved any stories yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Browse stories and click the bookmark icon to save them for later
              </p>
              <Link to="/" className="btn btn-primary">
                Browse Stories
              </Link>
            </>
          )}
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStories.map((story) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="card overflow-hidden"
          >
            <div className="bg-primary/5 dark:bg-primary-dark/10 p-2 flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Calendar size={12} className="mr-1" />
                <span>Saved {formatTime(story.savedAt)}</span>
              </div>
              <button
                onClick={() => handleRemove(story.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Remove from saved"
              >
                <Trash size={14} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
              </button>
            </div>
            <div className="p-4">
              <h2 className="font-mono text-lg font-semibold mb-2 line-clamp-2">
                <Link
                  to={`/story/${story.id}`}
                  className="hover:text-primary dark:hover:text-primary-dark"
                >
                  {story.title}
                </Link>
              </h2>
              
              {story.url && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <LinkIcon size={14} className="mr-1 flex-shrink-0" />
                  <a 
                    href={story.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                  >
                    {getDomain(story.url)}
                  </a>
                </div>
              )}
              
              <div className="flex space-x-2 mt-4">
                <Link 
                  to={`/story/${story.id}`}
                  className="flex-1 btn btn-primary text-center text-sm py-1.5"
                >
                  View Story
                </Link>
                
                {story.url && (
                  <a 
                    href={story.url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 btn btn-secondary text-center text-sm py-1.5"
                  >
                    Read Article
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
 