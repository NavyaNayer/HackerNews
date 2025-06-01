import  { createContext, useState, useContext, ReactNode } from 'react';
import { Story } from '../types';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Story[];
  setSearchResults: (results: Story[]) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  searchIndex: Record<string, number[]>;
  setSearchIndex: (index: Record<string, number[]>) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Story[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchIndex, setSearchIndex] = useState<Record<string, number[]>>({});

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        searchResults,
        setSearchResults,
        isSearching,
        setIsSearching,
        searchIndex,
        setSearchIndex
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
 