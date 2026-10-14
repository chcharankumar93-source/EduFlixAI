import { Search, Key, Sun, Moon, Monitor } from 'lucide-react';
import type { View, Theme } from '@/types';

type NavbarProps = {
  view: View;
  onViewChange: (v: View) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  hasApiKey: boolean;
  onApiKeyClick: () => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  loading: boolean;
};

const VIEW_LABELS: Record<View, string> = {
  home: 'Home',
  mylist: 'My List & Progress',
  stats: 'AI Impact Stats',
};

export function Navbar({
  view, onViewChange, searchQuery, onSearchChange, onSearchSubmit,
  hasApiKey, onApiKeyClick, theme, onThemeChange, loading,
}: NavbarProps) {
  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-gradient-to-b from-black/90 to-transparent dark:from-black/90 dark:to-transparent" aria-label="Main navigation">
      <div className="flex items-center gap-3 px-4 md:px-8 h-16">
        <span className="text-[#E50914] font-black text-xl md:text-2xl tracking-tight">EDUFLIX</span>

        <div className="hidden md:flex items-center gap-1 ml-4" role="tablist">
          {(Object.keys(VIEW_LABELS) as View[]).map(v => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3 py-1.5 text-sm rounded transition ${view === v ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              role="tab"
              aria-selected={view === v}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearchSubmit(searchQuery)}
            placeholder="What do you want to master?"
            aria-label="Search topics"
            className="w-full pl-9 pr-3 py-2 bg-black/70 border border-white/10 rounded text-sm placeholder-gray-500 focus:border-white/30 outline-none"
          />
        </div>

        {/* Theme toggle */}
        <div className="flex items-center gap-0.5 bg-black/40 rounded-lg border border-white/10 p-0.5">
          {(['light', 'system', 'dark'] as Theme[]).map(t => {
            const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Monitor;
            return (
              <button
                key={t}
                onClick={() => onThemeChange(t)}
                aria-label={`Set ${t} theme`}
                className={`p-1.5 rounded transition ${theme === t ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        <button
          onClick={onApiKeyClick}
          aria-label="Configure API key"
          className="flex items-center gap-1.5 px-3 py-2 bg-black/50 border border-white/10 rounded text-sm text-gray-300 hover:text-white hover:border-white/30 transition"
        >
          <Key className="w-4 h-4" />
          <span className="hidden md:inline">{hasApiKey ? 'API Key ✓' : 'API Key'}</span>
        </button>
      </div>

      {/* Mobile nav */}
      <div className="flex md:hidden items-center gap-1 px-4 pb-2" role="tablist">
        {(Object.keys(VIEW_LABELS) as View[]).map(v => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-3 py-1 text-xs rounded ${view === v ? 'text-white bg-white/10' : 'text-gray-400'}`}
            role="tab"
            aria-selected={view === v}
          >
            {v === 'home' ? 'Home' : v === 'mylist' ? 'My List' : 'Stats'}
          </button>
        ))}
        {loading && <span className="text-xs text-[#E50914] animate-pulse">Generating...</span>}
      </div>
    </nav>
  );
}
