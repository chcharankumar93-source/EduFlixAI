import { useState, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { Course, View, SortOption } from '@/types';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/hooks/useTheme';
import { useDebounce } from '@/hooks/useDebounce';
import { ALL_CATEGORIES, generateCourse } from '@/services/aiService';

import { Navbar } from '@/components/Navbar';
import { HomeView } from '@/components/HomeView';
import { MyListView } from '@/components/MyListView';
import { StatsView } from '@/components/StatsView';
import { CourseModal } from '@/components/CourseModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { ToastContainer } from '@/components/ToastContainer';

export default function App() {
  const {
    courses, progress, stats, apiKey, bookmarks, loading,
    setApiKey, generateTopic, watchEpisode, submitQuiz,
    toggleBookmark, upvoteCourse, resetAll,
  } = useApp();
  const { notify } = useToast();
  const { theme, setTheme } = useTheme();

  const [view, setView] = useState<View>('home');
  const [selected, setSelected] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [showKeyModal, setShowKeyModal] = useState(false);

  const coursePct = useCallback((id: string): number => {
    const p = progress[id];
    if (!p) return 0;
    const course = courses.find(c => c.id === id);
    const totalEps = course?.episodes.length || 1;
    const watchPct = (p.watched.length / Math.max(1, totalEps)) * 60;
    const quizPct = p.quizScores.length
      ? (p.quizScores.reduce((a, b) => a + b, 0) / p.quizScores.length) * 0.4
      : 0;
    return Math.min(100, watchPct + quizPct);
  }, [progress, courses]);

  const handleGenerate = useCallback(async (topic: string) => {
    if (!topic.trim()) return;
    await generateTopic(topic);
    notify(`Generated "${topic}" course`, 'success');
    setSearchQuery('');
  }, [generateTopic, notify]);

  const handleWatch = useCallback((epNumber: number) => {
    if (!selected) return;
    watchEpisode(selected.id, epNumber, selected.co2SavedKg, selected.episodes.length);
    notify(`Episode ${epNumber} marked as watched`, 'success');
  }, [selected, watchEpisode, notify]);

  const handleSubmitQuiz = useCallback((score: number) => {
    if (!selected) return;
    submitQuiz(selected.id, score, selected.co2SavedKg);
    notify(score >= 70 ? `Quiz passed with ${score}%!` : `Quiz scored ${score}% — keep practicing`, score >= 70 ? 'success' : 'info');
  }, [selected, submitQuiz, notify]);

  const handleBookmark = useCallback((id: string) => {
    const isBookmarked = bookmarks.includes(id);
    toggleBookmark(id);
    notify(isBookmarked ? 'Removed bookmark' : 'Bookmarked', 'info');
  }, [bookmarks, toggleBookmark, notify]);

  const handleUpvote = useCallback((id: string) => {
    upvoteCourse(id);
    notify('Upvoted!', 'success');
  }, [upvoteCourse, notify]);

  const handleRemedial = useCallback(async (topic: string) => {
    await generateTopic(topic);
    notify(`Generated remedial course for ${topic}`, 'success');
  }, [generateTopic, notify]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSearchQuery('');
  }, []);

  const handleSearchSubmit = useCallback((q: string) => {
    if (q.trim()) {
      setSearchQuery(q);
      setView('home');
    }
  }, []);

  const categories = useMemo(() => {
    const fromCourses = courses.map(c => c.category);
    return [...new Set([...ALL_CATEGORIES, ...fromCourses])].sort();
  }, [courses]);

  return (
    <div className="min-h-screen bg-[#141414] dark:bg-[#141414] text-white font-sans">
      <Navbar
        view={view}
        onViewChange={setView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        hasApiKey={!!apiKey}
        onApiKeyClick={() => setShowKeyModal(true)}
        theme={theme}
        onThemeChange={setTheme}
        loading={loading}
      />

      <main>
        {view === 'home' && (
          <HomeView
            courses={courses}
            progress={progress}
            bookmarks={bookmarks}
            stats={stats}
            searchQuery={searchQuery}
            debouncedQuery={debouncedQuery}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            categories={categories}
            loading={loading}
            coursePct={coursePct}
            onCourseClick={setSelected}
            onBookmark={handleBookmark}
            onUpvote={handleUpvote}
            onGenerate={handleGenerate}
            onCategoryChange={setSelectedCategory}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
          />
        )}

        {view === 'mylist' && (
          <MyListView
            courses={courses}
            progress={progress}
            bookmarks={bookmarks}
            coursePct={coursePct}
            onCourseClick={setSelected}
          />
        )}

        {view === 'stats' && (
          <StatsView
            courses={courses}
            progress={progress}
            stats={stats}
            apiKey={apiKey}
            onGenerateRemedial={handleRemedial}
          />
        )}
      </main>

      <footer className="border-t border-white/10 py-6 px-4 md:px-8 text-center text-xs text-gray-600">
        <p>EduFlix AI — Adaptive Learning & Sustainable Community Skills</p>
      </footer>

      {selected && (
        <CourseModal
          course={selected}
          progress={progress[selected.id]}
          isBookmarked={bookmarks.includes(selected.id)}
          onClose={() => setSelected(null)}
          onWatch={handleWatch}
          onQuiz={handleSubmitQuiz}
          onBookmark={() => handleBookmark(selected.id)}
        />
      )}

      {showKeyModal && (
        <ApiKeyModal
          currentKey={apiKey}
          onSave={(key) => {
            setApiKey(key);
            notify(key ? 'API key saved' : 'API key cleared', 'success');
          }}
          onClose={() => setShowKeyModal(false)}
        />
      )}

      <ToastContainer />
    </div>
  );
}
