export  interface Story {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
  descendants?: number;
  kids?: number[];
  text?: string;
  type: string;
}

export interface Comment {
  id: number;
  text?: string;
  by: string;
  time: number;
  kids?: number[];
  parent: number;
  deleted?: boolean;
  dead?: boolean;
}

export interface User {
  id: string;
  created: number;
  karma: number;
  about?: string;
  submitted?: number[];
}

export interface UserComment {
  id: string;
  text: string;
  parentId: number;
  storyId: number;
  username: string;
  timestamp: number;
}

export interface SavedStory extends Story {
  savedAt: number;
}

export type StoryType = 'top' | 'new' | 'best' | 'ask' | 'show' | 'job';

export type SortOption = 'score' | 'time' | 'comments';
export type FilterOption = 'all' | 'tech' | 'ai' | 'business' | 'dev';
 