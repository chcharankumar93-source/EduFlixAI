import { TrendingUp, Clock, ThumbsUp, Filter, X } from 'lucide-react';
import type { SortOption } from '@/types';

type FilterBarProps = {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onClear: () => void;
};

const SORT_OPTIONS: { id: SortOption; label: string; icon: typeof TrendingUp }[] = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'newest', label: 'Newest', icon: Clock },
  { id: 'upvoted', label: 'Most Upvoted', icon: ThumbsUp },
];

export function FilterBar({
  categories, selectedCategory, onCategoryChange, sortBy, onSortChange, onClear,
}: FilterBarProps) {
  const hasFilters = selectedCategory !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Sort */}
      <div className="flex items-center gap-1 bg-black/40 rounded-lg border border-white/10 p-0.5">
        {SORT_OPTIONS.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => onSortChange(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
                sortBy === opt.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
              aria-pressed={sortBy === opt.id}
            >
              <Icon className="w-3.5 h-3.5" />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-gray-500 mr-1">
          <Filter className="w-3.5 h-3.5" />
        </span>
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
            selectedCategory === 'all'
              ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40'
              : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
          }`}
          aria-pressed={selectedCategory === 'all'}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              selectedCategory === cat
                ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
            }`}
            aria-pressed={selectedCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition"
          aria-label="Clear filters"
        >
          <X className="w-3.5 h-3.5" /> Clear
        </button>
      )}
    </div>
  );
}
