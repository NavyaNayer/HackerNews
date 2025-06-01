import  { useState } from 'react';
import { Filter, ArrowDownUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SortOption, FilterOption } from '../types';

interface StoryFiltersProps {
  currentSort: SortOption;
  currentFilter: FilterOption;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
}

export default function StoryFilters({
  currentSort,
  currentFilter,
  onSortChange,
  onFilterChange
}: StoryFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filters: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All Stories' },
    { value: 'tech', label: 'Technology' },
    { value: 'ai', label: 'AI & ML' },
    { value: 'business', label: 'Business' },
    { value: 'dev', label: 'Development' }
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'score', label: 'Highest Points' },
    { value: 'time', label: 'Most Recent' },
    { value: 'comments', label: 'Most Comments' }
  ];

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    if (isSortOpen) setIsSortOpen(false);
  };

  const toggleSort = () => {
    setIsSortOpen(!isSortOpen);
    if (isFilterOpen) setIsFilterOpen(false);
  };

  return (
    <div className="flex items-center space-x-2 relative">
      <div className="relative">
                 <button
            onClick={toggleFilter}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-haspopup="true"
            aria-expanded={isFilterOpen}
            aria-label="Filter stories"
          >
 
          <Filter size={16} />
          <span className="text-sm font-medium">Filter</span>
        </button>
        
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 min-w-[180px]"
            >
              <div className="py-1">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      onFilterChange(filter.value);
                      setIsFilterOpen(false);
                    }}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>{filter.label}</span>
                    {currentFilter === filter.value && <Check size={16} className="text-primary dark:text-primary-dark" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
                 <button
            onClick={toggleSort}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-haspopup="true"
            aria-expanded={isSortOpen}
            aria-label="Sort stories"
          >
 
          <ArrowDownUp size={16} />
          <span className="text-sm font-medium">Sort</span>
        </button>
        
        <AnimatePresence>
          {isSortOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 min-w-[180px]"
            >
              <div className="py-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setIsSortOpen(false);
                    }}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>{option.label}</span>
                    {currentSort === option.value && <Check size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
 