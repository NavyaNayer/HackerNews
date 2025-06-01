import  { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUp, Link as LinkIcon, MessageSquare, Bookmark, Check, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import Comment from '../components/Comment';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchStory, fetchComment, formatTime, getDomain, generateStoryDescription, textToSpeech, stopSpeech } from '../api';
import { Story, Comment as CommentType, UserComment } from '../types';
import { useSavedStories } from '../context/SavedStoriesContext';
import { useUserComments } from '../context/UserCommentsContext';

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [description, setDescription] = useState<string>('');
  const [isReading, setIsReading] = useState(false);
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const { saveStory, removeSavedStory, isStorySaved } = useSavedStories();
  const [isSaved, setIsSaved] = useState(false);
  const { addComment, getCommentsByStory } = useUserComments();
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [loadedCommentsCount, setLoadedCommentsCount] = useState(10);

   useEffect(() => {
    if (story) {
      setIsSaved(isStorySaved(story.id));
      setLocalScore(story.score);
    }
  }, [story, isStorySaved]);
 

  useEffect(() => {
    const loadStory = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const storyId = parseInt(id);
        const storyData = await fetchStory(storyId);
        setStory(storyData);
        
        if (storyData.kids && storyData.kids.length > 0) {
          // Load first batch of comments initially
          const initialCommentIds = storyData.kids.slice(0, loadedCommentsCount);
          const commentPromises = initialCommentIds.map(kid => fetchComment(kid));
          const commentData = await Promise.all(commentPromises);
          setComments(commentData);
        }
        
        // Load user comments for this story
        const userCommentData = getCommentsByStory(storyId);
        setUserComments(userCommentData);
        
        // Get description for the story
        setDescriptionLoading(true);
        try {
          const desc = await generateStoryDescription(storyData.title);
          setDescription(desc);
        } catch (error) {
          console.error('Error fetching description:', error);
        } finally {
          setDescriptionLoading(false);
        }
      } catch (error) {
        console.error('Error loading story:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStory();
    
    // Clean up any ongoing speech on unmount
    return () => {
      stopSpeech();
    };
  }, [id, getCommentsByStory, loadedCommentsCount]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!story || !id) return;
    
    // Add the comment to the story
    addComment(
      commentText,
      story.id, // parentId is the story id for top-level comments
      story.id, // storyId
      "User" // In a real app, you'd use the logged-in username
    );
    
    // Reset comment input
    setCommentText('');
    
    // Refresh user comments
    const userCommentData = getCommentsByStory(story.id);
    setUserComments(userCommentData);
  };
  
  const handleRead = () => {
    if (isReading) {
      stopSpeech();
      setIsReading(false);
    } else {
      const textToRead = `${story?.title}. ${description}`;
      textToSpeech(textToRead);
      setIsReading(true);
    }
  };
  
  const handleToggleSave = () => {
    if (!story) return;
    
    if (isSaved) {
      removeSavedStory(story.id);
      setIsSaved(false);
    } else {
      saveStory({
        id: story.id,
        title: story.title,
        url: story.url,
        savedAt: Math.floor(Date.now() / 1000)
      });
      setIsSaved(true);
    }
  };
  
  const loadMoreComments = async () => {
    if (!story || !story.kids) return;
    
    const nextBatch = story.kids.slice(loadedCommentsCount, loadedCommentsCount + 10);
    if (nextBatch.length === 0) return;
    
    try {
      const commentPromises = nextBatch.map(kid => fetchComment(kid));
      const newComments = await Promise.all(commentPromises);
      setComments(prev => [...prev, ...newComments]);
      setLoadedCommentsCount(prev => prev + 10);
    } catch (error) {
      console.error('Error loading more comments:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!story) return <div className="p-8 text-center">Story not found</div>;

  const totalCommentCount = (story.descendants || 0) + userComments.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-6"
    >
      {/* Removed skip to main content link */}
      
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6">
        <ArrowLeft size={16} className="mr-1" />
        Back to stories
      </Link>
      
      <div id="main-content" className="card p-6 mb-6">
        <div className="flex">
          <div className="mr-4 flex flex-col items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setVoted(!voted)}
              className={`p-2 rounded-md ${
                voted ? 'bg-primary/10 text-primary dark:text-primary-dark' : 'hover:bg-gray-100 dark:hover:bg-dark-300'
              }`}
              aria-label="Upvote"
            >
              <ArrowUp size={20} className={voted ? 'fill-primary' : ''} />
            </motion.button>
            <span className="font-medium mt-1">{localScore}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <h1 className="font-mono text-2xl font-bold mb-2">{story.title}</h1>
              <button 
                onClick={handleRead}
                className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                aria-label={isReading ? "Stop reading" : "Read aloud"}
              >
                {isReading ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
            
            {description && (
              <div className="mb-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-dark-300/50 p-3 rounded-md">
                {description}
              </div>
            )}
            
            {descriptionLoading && (
              <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                Generating summary...
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
              {story.url && (
                <span className="flex items-center mr-4">
                  <LinkIcon size={16} className="mr-1" />
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
            </div>
            
            <div className="mt-4">
              {story.url && (
                <a 
                  href={story.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex items-center"
                >
                  <LinkIcon size={16} className="mr-2" />
                  Read Full Article
                </a>
              )}
              
              <button 
                onClick={handleToggleSave}
                className={`btn ml-3 inline-flex items-center ${
                  isSaved 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50' 
                    : 'btn-ghost'
                }`}
              >
                {isSaved ? <Check size={16} className="mr-2" /> : <Bookmark size={16} className="mr-2" />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-mono font-bold flex items-center">
            <MessageSquare className="mr-2" size={20} />
            Comments ({totalCommentCount})
          </h2>
        </div>
        
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-medium mb-3">Add Your Comment</h3>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What are your thoughts on this story?"
              className="w-full p-3 border border-gray-200 dark:border-dark-300 rounded-md bg-white dark:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
              required
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </form>
        </div>
        
        {userComments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Your Comments</h3>
            <div className="space-y-4">
              {userComments.map(comment => (
                <Comment 
                  key={comment.id} 
                  comment={comment} 
                  storyId={story.id}
                  isUserComment={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map(comment => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                storyId={story.id}
              />
            ))}
            
            {story.kids && loadedCommentsCount < story.kids.length && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMoreComments}
                  className="px-4 py-2 bg-gray-100 dark:bg-dark-300 rounded-md hover:bg-gray-200 dark:hover:bg-dark-300/70 transition-colors"
                >
                  Load More Comments
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
 