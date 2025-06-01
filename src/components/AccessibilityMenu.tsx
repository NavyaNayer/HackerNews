import  { useState, useRef, useEffect } from 'react';
import { Settings, Type, Monitor, Volume2 } from 'lucide-react';

interface AccessibilityMenuProps {
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'system';
  textToSpeechEnabled: boolean;
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onTextToSpeechToggle: (enabled: boolean) => void;
}

export default function AccessibilityMenu({
  fontSize,
  theme,
  textToSpeechEnabled,
  onFontSizeChange,
  onThemeChange,
  onTextToSpeechToggle
}: AccessibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors"
        aria-label="Accessibility settings"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 dark:border-dark-300">
            <h3 className="font-medium">Accessibility Settings</h3>
          </div>

          <div className="p-3 border-b border-gray-200 dark:border-dark-300">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center text-sm">
                <Type size={16} className="mr-2" />
                Font Size
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onFontSizeChange('small')}
                className={`px-3 py-1 text-xs rounded-md ${
                  fontSize === 'small'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-300/70'
                }`}
              >
                Small
              </button>
              <button
                onClick={() => onFontSizeChange('medium')}
                className={`px-3 py-1 text-xs rounded-md ${
                  fontSize === 'medium'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-300/70'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => onFontSizeChange('large')}
                className={`px-3 py-1 text-xs rounded-md ${
                  fontSize === 'large'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-300/70'
                }`}
              >
                Large
              </button>
            </div>
          </div>

          <div className="p-3 border-b border-gray-200 dark:border-dark-300">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center text-sm">
                <Monitor size={16} className="mr-2" />
                Theme
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onThemeChange('light')}
                className={`px-3 py-1 text-xs rounded-md ${
                  theme === 'light'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-300/70'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`px-3 py-1 text-xs rounded-md ${
                  theme === 'dark'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-300/70'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => onThemeChange('system')}
                className={`px-3 py-1 text-xs rounded-md ${
                  theme === 'system'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-300/70'
                }`}
              >
                System
              </button>
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between">
              <label htmlFor="tts-toggle" className="flex items-center text-sm cursor-pointer">
                <Volume2 size={16} className="mr-2" />
                Text-to-Speech
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  id="tts-toggle"
                  type="checkbox"
                  checked={textToSpeechEnabled}
                  onChange={() => onTextToSpeechToggle(!textToSpeechEnabled)}
                  className="sr-only"
                />
                <div className={`block h-6 rounded-full w-10 ${textToSpeechEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-dark-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${textToSpeechEnabled ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-sm text-center hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
 