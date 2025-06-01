import  { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, MessageSquare, Link as LinkIcon, Bookmark, Zap, VolumeX, Volume2, Check } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { Story } from '../types';
import { formatTime, getDomain, textToSpeech, stopSpeech } from '../api';
import { getStorySummary } from '../api/ai';
import { useSavedStories } from '../context/SavedStoriesContext';

interface StoryCardProps {
  story: Story;
  highlight?: string;
}

export default function StoryCardEnhanced({ story, highlight }: StoryCardProps) {
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
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });
  
  const scoreClass = localScore > 200 
    ? 'text-red-500 font-bold' 
    : localScore > 100 
      ? 'text-primary dark:text-primary-dark font-bold' 
      : '';

  useEffect(() => {
    setIsSaved(isStorySaved(story.id));
  }, [story.id, isStorySaved]);

  useEffect(() => {
    // Only fetch summary when card is in view
    if (isInView && !summary && !isLoading) {
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
    }
  }, [isInView, story, summary, isLoading]);

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

  const getStoryTag = () => {
    const title = story.title.toLowerCase();
    
    if (title.includes('ai') || title.includes('artificial intelligence') || title.includes('machine learning') || title.includes('gpt')) {
      return { name: 'AI', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-300' };
    } else if (title.includes('crypto') || title.includes('blockchain') || title.includes('bitcoin') || title.includes('web3')) {
      return { name: 'Crypto', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300' };
    } else if (title.includes('startup') || title.includes('funding') || title.includes('million') || title.includes('billion')) {
      return { name: 'Startup', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-300' };
    } else if (title.includes('security') || title.includes('hack') || title.includes('vulnerability') || title.includes('breach')) {
      return { name: 'Security', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-300' };
    } else if (title.includes('open source') || title.includes('github') || title.includes('code') || title.includes('developer')) {
      return { name: 'Dev', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' };
    }
    
    return { name: 'Tech', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:bg-opacity-30 dark:text-amber-300' };
  };

  const tag = getStoryTag();

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

  // Calculate how hot the story is based on points and recency
  const isHot = localScore > 100 || (localScore > 50 && (Date.now()/1000 - story.time) < 3600*3);

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="card mb-4 hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-primary dark:border-primary-dark"
    >
      <div className="p-4">
        <div className="flex">
          <div className="mr-3 flex flex-col items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleVote}
              className={`p-1 rounded-md transition-colors ${
                voted ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-dark' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Upvote"
            >
              <ArrowUp size={20} className={voted ? 'fill-current' : ''} />
            </motion.button>
            <span className={`text-sm font-medium mt-1 ${scoreClass}`}>
              {localScore}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center mb-1 gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${tag.color}`}>
                {tag.name}
              </span>
              {isHot && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary bg-opacity-10 text-primary dark:text-primary-dark flex items-center">
                  <Zap size={12} className="mr-1" /> Hot
                </span>
              )}
            </div>
            
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
              
              <div className="flex items-center ml-auto">
                <button 
                  onClick={handleRead}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={isReading ? "Stop reading" : "Read aloud"}
                >
                  {isReading ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>
            </div>
            
            {summary && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md"
              >
                {summary}
              </motion.div>
            )}
            
            {isLoading && (
              <div className="mb-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <div className="w-4 h-4 border-2 border-t-primary border-gray-200 dark:border-gray-700 rounded-full animate-spin mr-2"></div>
                Generating summary...
              </div>
            )}
            
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
      </div>
    </motion.div>
  );
}
 