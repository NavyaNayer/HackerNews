import  { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, MessageCircle, Image, Briefcase, Menu, X, Code, Bookmark } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AccessibilityMenu from './AccessibilityMenu';
import SearchBar from './SearchBar';
import { useSearch } from '../context/SearchContext';
import { Story } from '../types';

interface NavbarProps {
  stories: Story[];
}

export default function Navbar({ stories }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { isSearching } = useSearch();
  
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(
    () => (localStorage.getItem('fontSize') as 'small' | 'medium' | 'large') || 'medium'
  );
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );
  
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(
    localStorage.getItem('textToSpeech') === 'true'
  );

  useEffect(() => {
    // Apply font size to html element using Tailwind's text-[size] classes
    document.documentElement.classList.remove('text-xs', 'text-sm', 'text-base', 'text-lg');
    switch (fontSize) {
      case 'small':
        document.documentElement.classList.add('text-sm');
        break;
      case 'large':
        document.documentElement.classList.add('text-lg');
        break;
      default:
        document.documentElement.classList.add('text-base');
    }
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);
  
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      // System preference
      localStorage.removeItem('theme');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('textToSpeech', textToSpeechEnabled.toString());
  }, [textToSpeechEnabled]);

  const navItems = [
    { path: '/', label: 'Trending', icon: <Zap size={18} /> },
    { path: '/ask', label: 'Ask', icon: <MessageCircle size={18} /> },
    { path: '/show', label: 'Show', icon: <Image size={18} /> },
    { path: '/jobs', label: 'Jobs', icon: <Briefcase size={18} /> },
    { path: '/saved', label: 'Saved', icon: <Bookmark size={18} /> }
  ];

  const isActive = (path: string) => {
    if (path === '/' && isSearching) return false;
    return currentPath === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#f8fafc] dark:bg-dark-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <Code className="text-primary dark:text-primary-dark mr-2" size={28} />
          <span className="font-mono font-bold text-xl">Hacker<span className="text-primary dark:text-primary-dark">News</span></span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        <SearchBar stories={stories} />

        <div className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive(item.path)
                  ? 'bg-gray-200 dark:bg-dark-300 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.icon}
              <span className="ml-1">{item.label}</span>
            </Link>
          ))}
          <Link
            to="/login"
            className="ml-2 px-3 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Login / Signup
          </Link>
        </div>

        <AccessibilityMenu 
          fontSize={fontSize}
          theme={theme}
          textToSpeechEnabled={textToSpeechEnabled}
          onFontSizeChange={setFontSize}
          onThemeChange={setTheme}
          onTextToSpeechToggle={setTextToSpeechEnabled}
        />
        <ThemeToggle />
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center">
        <SearchBar stories={stories} />
        <AccessibilityMenu 
          fontSize={fontSize}
          theme={theme}
          textToSpeechEnabled={textToSpeechEnabled}
          onFontSizeChange={setFontSize}
          onThemeChange={setTheme}
          onTextToSpeechToggle={setTextToSpeechEnabled}
        />
        <ThemeToggle />
        <Link
          to="/login"
          className="ml-2 px-3 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
        >
          Login / Signup
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-dark-200 shadow-lg p-4 md:hidden animate-in">
          <div className="relative mb-4">
            <SearchBar stories={stories} isCompact onClose={() => setIsOpen(false)} />
          </div>
          
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md ${
                  isActive(item.path)
                    ? 'bg-gray-200 dark:bg-dark-300 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            ))}
            <Link
              to="/login"
              className="flex items-center px-4 py-3 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Login / Signup
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
