import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchInputProps {
  placeholder?: string;
  onSearchChange: (value: string) => void;
  className?: string;
  debounceDelay?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  onSearchChange,
  className = "",
  debounceDelay = 500
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  // Call the parent's search handler when debounced value changes
  useEffect(() => {
    onSearchChange(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearchChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      />
      {searchQuery && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}; 