import React from 'react';
import { Search, X } from 'lucide-react';
import Button from './Button';

export const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search by skill, title, or keyword...',
  buttonText = 'Search',
  className = '',
  size = 'md'
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  const handleClear = () => {
    if (onChange) onChange('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-9 bg-surface-white border border-border rounded-md text-content-primary placeholder:text-content-subtle transition-all focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 ${
            size === 'lg' ? 'py-3 text-base' : 'py-2 text-sm'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle hover:text-content-primary p-0.5"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size={size === 'lg' ? 'lg' : 'md'}
        className="shrink-0"
      >
        {buttonText}
      </Button>
    </form>
  );
};

export default SearchBar;
