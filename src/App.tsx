import  { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import { SearchProvider } from './context/SearchContext';
import { SavedStoriesProvider } from './context/SavedStoriesContext';
import { UserCommentsProvider } from './context/UserCommentsContext';
import useSWR from 'swr';
import { fetchStories } from './api';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePageEnhanced'));
const StoryPage = lazy(() => import('./pages/StoryPage'));
const SavedStoriesPage = lazy(() => import('./pages/SavedStoriesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  // Fetch all stories for search functionality
  const { data: stories } = useSWR('allStories', () => fetchStories('top', 100), {
    revalidateOnFocus: false,
    dedupingInterval: 300000 // 5 minutes
  });
  
  // Setup accessibility attributes
  useEffect(() => {
    // Set up document with proper accessibility
    document.documentElement.lang = 'en';
    
    // Check for saved preferences
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.documentElement.setAttribute('data-font-size', fontSize);
    
    // Theme preference
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
    
    // Add keyboard navigation indication
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
      }
    };
    
    const handleMouseDown = () => {
      document.body.classList.remove('user-is-tabbing');
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    // Add meta description and title
    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Built with jdoodle.ai - HackerNews is a modern, accessible reimagining of Hacker News with filters, sorting, AI-generated summaries, and voice capabilities.';
      document.head.appendChild(meta);
    }
    
    document.title = 'HackerNews - A Modern Hacker News Experience';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <BrowserRouter>
      <SearchProvider>
        <SavedStoriesProvider>
          <UserCommentsProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar stories={stories || []} />
              <main className="flex-1">
                <AnimatePresence mode="wait">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<HomePage type="top" />} />
                      <Route path="/ask" element={<HomePage type="ask" />} />
                      <Route path="/show" element={<HomePage type="show" />} />
                      <Route path="/jobs" element={<HomePage type="job" />} />
                      <Route path="/saved" element={<SavedStoriesPage />} />
                      <Route path="/story/:id" element={<StoryPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </AnimatePresence>
              </main>
              <footer className="py-6 px-4 border-t border-gray-200 dark:border-gray-700">
                <div className="container mx-auto text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    HackerNews - A reimagined Hacker News experience
                  </p>
                  <div className="mt-2 flex justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1475070929565-c985b496cb9f?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWNoJTIwaW50ZXJmYWNlJTIwd2l0aCUyMHNlYXJjaCUyMGJhciUyMGRhcmslMjBtb2RlfGVufDB8fHx8MTc0ODc3MjQwOXww&ixlib=rb-4.1.0&fit=fillmax&h=400&w=800" 
                      alt="Modern tech interface" 
                      className="h-8 w-auto rounded"
                    />
                  </div>
                </div>
              </footer>
            </div>
            <ScrollToTop />
          </UserCommentsProvider>
        </SavedStoriesProvider>
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;
 