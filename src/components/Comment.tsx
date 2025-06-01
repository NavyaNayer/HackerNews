import  { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, MessageCircle, VolumeX, Volume2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Comment as CommentType, UserComment } from '../types';
import { formatTime, textToSpeech, stopSpeech } from '../api';
import ReactMarkdown from 'react-markdown';
import { useUserComments } from '../context/UserCommentsContext';

interface CommentProps {
  comment: CommentType | UserComment;
  level?: number;
  childComments?: CommentType[];
  storyId?: number;
  isUserComment?: boolean;
}

export default function Comment({ comment, level = 0, childComments = [], storyId, isUserComment = false }: CommentProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [userReplies, setUserReplies] = useState<UserComment[]>([]);
  const { addComment, getCommentsByParent } = useUserComments();

  // Safely access comment properties based on type
  const commentBy = isUserComment ? (comment as UserComment).username : (comment as CommentType).by;
  const commentText = isUserComment ? (comment as UserComment).text : (comment as CommentType).text;
  const commentTime = isUserComment ? (comment as UserComment).timestamp : (comment as CommentType).time;
  const commentId = isUserComment ? (comment as UserComment).id : (comment as CommentType).id;
  const parentId = isUserComment ? (comment as UserComment).parentId : (comment as CommentType).parent;

  // Fetch user replies to this comment
  useEffect(() => {
    if (commentId) {
      const replies = getCommentsByParent(typeof commentId === 'string' ? parseInt(commentId) : commentId);
      setUserReplies(replies);
    }
  }, [commentId, getCommentsByParent]);

  const handleRead = () => {
    if (isReading) {
      stopSpeech();
      setIsReading(false);
    } else {
      textToSpeech(commentText || "This comment is unavailable");
      setIsReading(true);
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storyId) return;
    
    const commentIdNum = typeof commentId === 'string' ? parseInt(commentId) : commentId;
    
    // Add the reply
    addComment(
      replyText,
      commentIdNum,
      storyId,
      "User" // In a real app, you'd use the logged-in username
    );
    
    // Reset reply state
    setReplyText('');
    setIsReplying(false);
    
    // Refresh the user replies
    const replies = getCommentsByParent(commentIdNum);
    setUserReplies(replies);
  };

  if ((comment as CommentType).deleted || (comment as CommentType).dead) {
    return (
      <div className="pl-4 py-2 text-sm italic text-gray-400 dark:text-gray-500">
        Comment deleted or removed
      </div>
    );
  }

  const borderColors = [
    'border-primary dark:border-primary-dark',
    'border-blue-400 dark:border-blue-500',
    'border-green-400 dark:border-green-500',
    'border-purple-400 dark:border-purple-500',
    'border-pink-400 dark:border-pink-500',
  ];

  const borderColor = borderColors[level % borderColors.length];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mb-3"
    >
      <div className={`pl-4 border-l-2 ${borderColor}`}>
        <div className="py-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
            <div className="flex items-center">
              {isUserComment ? (
                <span className="flex items-center font-medium text-primary dark:text-primary-dark">
                  <User size={14} className="mr-1" />
                  {commentBy}
                </span>
              ) : (
                <span className="font-medium">{commentBy}</span>
              )}
            </div>
            <span className="mx-2">•</span>
            <span>{formatTime(commentTime)}</span>
            
            <button
              onClick={handleRead}
              className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-300"
              aria-label={isReading ? "Stop reading" : "Read aloud"}
            >
              {isReading ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-300"
              aria-label={isCollapsed ? "Expand comment" : "Collapse comment"}
            >
              {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
          
          {!isCollapsed && (
            <div className="text-sm prose-sm max-w-none dark:prose-invert">
              {isUserComment ? (
                <div className="whitespace-pre-wrap">{commentText}</div>
              ) : (
                <ReactMarkdown>
                  {commentText || ""}
                </ReactMarkdown>
              )}
            </div>
          )}
          
          {!isCollapsed && (
            <div className="flex items-center mt-2 text-sm">
              <button
                onClick={() => {
                  setLiked(!liked);
                  setLikeCount(prev => liked ? Math.max(0, prev - 1) : prev + 1);
                }}
                className={`flex items-center p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-300 ${
                  liked ? 'text-primary dark:text-primary-dark' : ''
                }`}
                aria-label="Like comment"
              >
                <ThumbsUp size={14} className={liked ? 'fill-current' : ''} />
                <span className="ml-1">{liked ? 'Liked' : 'Like'} {likeCount > 0 && `(${likeCount})`}</span>
              </button>
              
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center p-1 ml-3 rounded hover:bg-gray-100 dark:hover:bg-dark-300"
                aria-label="Reply"
              >
                <MessageCircle size={14} />
                <span className="ml-1">Reply</span>
              </button>
            </div>
          )}
          
          <AnimatePresence>
            {!isCollapsed && isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 bg-gray-50 dark:bg-dark-300/30 p-3 rounded-md overflow-hidden"
              >
                <form onSubmit={handleReplySubmit}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full p-2 border border-gray-200 dark:border-dark-300 rounded-md bg-white dark:bg-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    required
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsReplying(false)}
                      className="px-3 py-1 text-xs rounded-md bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-300/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-3 py-1 text-xs rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {!isCollapsed && (
          <div className="ml-2">
            {/* Show user-added replies first */}
            {userReplies.length > 0 && (
              <div className="mt-2">
                {userReplies.map(reply => (
                  <Comment 
                    key={reply.id} 
                    comment={reply} 
                    level={level + 1} 
                    storyId={storyId}
                    isUserComment={true}
                  />
                ))}
              </div>
            )}
            
            {/* Then show API-provided child comments */}
            {childComments.length > 0 && (
              <div className={userReplies.length > 0 ? "mt-2" : ""}>
                {childComments.map(child => (
                  <Comment 
                    key={child.id} 
                    comment={child} 
                    level={level + 1} 
                    storyId={storyId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
 