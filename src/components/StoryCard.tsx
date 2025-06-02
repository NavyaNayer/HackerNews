import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, MessageSquare, Link as LinkIcon, Bookmark, Zap, VolumeX, Volume2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Story } from '../types';
import { formatTime, getDomain, textToSpeech, stopSpeech } from '../api';
import { getStorySummary } from '../api/ai';
import { useSavedStories } from '../context/SavedStoriesContext';

interface StoryCardProps {
  story: Story;
  highlight?: string;
}

export default function StoryCard({ story, highlight }: StoryCardProps) {
  const [voted, setVoted] = useState(false);
  const [localScore, setLocalScore] = useState(story.score);
  const [reaction, setReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    '🔥': 0,
    '🤯': 0,
    '💡': 0
  });
  const reactions = ['🔥', '🤯', '💡'];
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const { saveStory, removeSavedStory, isStorySaved } = useSavedStories();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isStorySaved(story.id));
  }, [story.id, isStorySaved]);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const text = await getStorySummary(story);
        setSummary(text);
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [story]);

  const handleVote = () => {
    if (voted) {
      setLocalScore(prev => prev - 1);
    } else {
      setLocalScore(prev => prev + 1);
    }
    setVoted(!voted);
  };

  const handleReaction = (emoji: string) => {
    setReactionCounts(prev => {
      const newCounts = { ...prev };
      // If already selected, decrease count
      if (emoji === reaction) {
        newCounts[emoji] = Math.max(0, newCounts[emoji] - 1);
      } else {
        // If a different reaction was previously selected, decrease that one
        if (reaction) {
          newCounts[reaction] = Math.max(0, newCounts[reaction] - 1);
        }
        // Increase the new reaction
        newCounts[emoji] = (newCounts[emoji] || 0) + 1;
      }
      return newCounts;
    });
    
    setReaction(emoji === reaction ? null : emoji);
  };

  const getRandomTag = () => {
    if (story.title.toLowerCase().includes('ai') || story.title.toLowerCase().includes('artificial intelligence')) {
      return '#ai';
    } else if (story.title.toLowerCase().includes('crypto') || story.title.toLowerCase().includes('blockchain')) {
      return '#crypto';
    } else if (story.title.toLowerCase().includes('startup') || story.title.toLowerCase().includes('funding')) {
      return '#startup';
    } else if (story.title.toLowerCase().includes('security') || story.title.toLowerCase().includes('hack')) {
      return '#security';
    } else if (story.title.toLowerCase().includes('open source') || story.title.toLowerCase().includes('github')) {
      return '#opensource';
    } else {
      const tags = ['#webdev', '#cloud', '#tech', '#programming', '#data'];
      return tags[Math.floor(Math.random() * tags.length)];
    }
  };

  const handleRead = () => {
    if (isReading) {
      stopSpeech();
      setIsReading(false);
    } else {
      const textToRead = `${story.title}. ${summary}`;
      textToSpeech(textToRead);
      setIsReading(true);
    }
  };

  const handleToggleSave = () => {
    if (isSaved) {
      removeSavedStory(story.id);
      setIsSaved(false);
    } else {
      saveStory({
        ...story,
        savedAt: Math.floor(Date.now() / 1000)
      });
      setIsSaved(true);
    }
  };

  const tag = getRandomTag();

  // Function to highlight matching text
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === term.toLowerCase() 
            ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">{part}</mark> 
            : part
        )}
      </>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-4 mb-4 hover:shadow-lg transition-all duration-300 border-l-4 border-primary dark:border-primary-dark min-h-[220px] max-h-[260px] flex"
      style={{ height: '240px' }}
    >
      <div className="flex w-full">
        <div className="mr-3 flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleVote}
            className={`p-1 rounded-md transition-colors ${
              voted ? 'bg-primary text-white dark:bg-primary-dark dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label="Upvote"
          >
            <ArrowUp size={20} className={voted ? 'fill-current' : ''} />
          </motion.button>
          <span className="text-sm font-medium mt-1">{localScore}</span>
        </div>
        
        <div className="flex-1 flex flex-col">
          <h2 className="font-mono text-lg font-semibold mb-1 group">
            <a 
              href={story.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary dark:hover:text-primary-dark"
            >
              {highlight ? highlightText(story.title, highlight) : story.title}
              <span className="w-0 group-hover:w-full h-0.5 bg-primary dark:bg-primary-dark block transition-all duration-300 origin-left"></span>
            </a>
          </h2>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            {story.url && (
              <span className="flex items-center mr-3">
                <LinkIcon size={14} className="mr-1" />
                <a 
                  href={story.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {getDomain(story.url)}
                </a>
              </span>
            )}
            <span>by {story.by}</span>
            <span className="mx-2">•</span>
            <span>{formatTime(story.time)}</span>
            
            <button 
              onClick={handleRead}
              className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isReading ? "Stop reading" : "Read aloud"}
            >
              {isReading ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
          
          {summary && (
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md line-clamp-3 flex-1">
              {summary}
            </div>
          )}
          
          {isLoading && (
            <div className="mb-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <div className="w-4 h-4 border-2 border-t-primary border-gray-200 dark:border-gray-700 rounded-full animate-spin mr-2"></div>
              Generating summary...
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-full">
              {tag}
            </span>
            {localScore > 100 && (
              <span className="px-2 py-1 text-xs font-medium bg-primary bg-opacity-10 text-primary dark:text-primary-dark rounded-full flex items-center">
                <Zap size={12} className="mr-1" /> Hot
              </span>
            )}
          </div>
          
          <div className="flex items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Link 
              to={`/story/${story.id}`}
              className="flex items-center mr-4 text-sm hover:text-primary dark:hover:text-primary-dark transition-colors"
            >
              <MessageSquare size={16} className="mr-1" />
              {story.descendants || 0} comments
            </Link>
            
            <div className="flex space-x-1 ml-auto">
              {reactions.map(emoji => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleReaction(emoji)}
                  className={`p-1.5 text-sm rounded-full transition-colors ${
                    reaction === emoji 
                      ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-dark' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label={`React with ${emoji}`}
                >
                  {emoji} {reactionCounts[emoji] > 0 && <span className="ml-1 text-xs">{reactionCounts[emoji]}</span>}
                </motion.button>
              ))}
            </div>
            
            <button 
              onClick={handleToggleSave}
              className={`ml-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                isSaved ? 'text-primary dark:text-primary-dark' : ''
              }`}
              aria-label={isSaved ? "Unsave story" : "Save story"}
            >
              {isSaved ? <Check size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
