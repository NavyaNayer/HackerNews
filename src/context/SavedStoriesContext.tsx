import  { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { SavedStory } from '../types';

interface SavedStoriesContextType {
  savedStories: SavedStory[];
  saveStory: (story: SavedStory) => void;
  removeSavedStory: (id: number) => void;
  isStorySaved: (id: number) => boolean;
}

const SavedStoriesContext = createContext<SavedStoriesContextType | undefined>(undefined);

export const SavedStoriesProvider = ({ children }: { children: ReactNode }) => {
  const [savedStories, setSavedStories] = useState<SavedStory[]>(() => {
    const saved = localStorage.getItem('savedStories');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('savedStories', JSON.stringify(savedStories));
  }, [savedStories]);

  const saveStory = (story: SavedStory) => {
    setSavedStories(prev => {
      // Check if already saved to prevent duplicates
      if (prev.some(s => s.id === story.id)) {
        return prev;
      }
      return [...prev, story];
    });
  };

  const removeSavedStory = (id: number) => {
    setSavedStories(prev => prev.filter(story => story.id !== id));
  };

  const isStorySaved = (id: number) => {
    return savedStories.some(story => story.id === id);
  };

  return (
    <SavedStoriesContext.Provider
      value={{ savedStories, saveStory, removeSavedStory, isStorySaved }}
    >
      {children}
    </SavedStoriesContext.Provider>
  );
};

export const useSavedStories = () => {
  const context = useContext(SavedStoriesContext);
  if (context === undefined) {
    throw new Error('useSavedStories must be used within a SavedStoriesProvider');
  }
  return context;
};
 