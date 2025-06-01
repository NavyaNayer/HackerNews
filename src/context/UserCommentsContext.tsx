import  { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserComment } from '../types';

interface UserCommentsContextType {
  userComments: UserComment[];
  addComment: (text: string, parentId: number, storyId: number, username: string) => UserComment;
  getCommentsByStory: (storyId: number) => UserComment[];
  getCommentsByParent: (parentId: number) => UserComment[];
}

const UserCommentsContext = createContext<UserCommentsContextType | undefined>(undefined);

export const UserCommentsProvider = ({ children }: { children: ReactNode }) => {
  const [userComments, setUserComments] = useState<UserComment[]>(() => {
    const saved = localStorage.getItem('userComments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('userComments', JSON.stringify(userComments));
  }, [userComments]);

  const addComment = (text: string, parentId: number, storyId: number, username: string) => {
    const newComment: UserComment = {
      id: Date.now().toString(), // Simple unique ID
      text,
      parentId,
      storyId,
      username,
      timestamp: Math.floor(Date.now() / 1000)
    };
    
    setUserComments(prev => [...prev, newComment]);
    return newComment;
  };

  const getCommentsByStory = (storyId: number) => {
    return userComments.filter(comment => comment.storyId === storyId);
  };

  const getCommentsByParent = (parentId: number) => {
    return userComments.filter(comment => comment.parentId === parentId);
  };

  return (
    <UserCommentsContext.Provider
      value={{ userComments, addComment, getCommentsByStory, getCommentsByParent }}
    >
      {children}
    </UserCommentsContext.Provider>
  );
};

export const useUserComments = () => {
  const context = useContext(UserCommentsContext);
  if (context === undefined) {
    throw new Error('useUserComments must be used within a UserCommentsProvider');
  }
  return context;
};
 