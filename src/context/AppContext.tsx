import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Course, Progress, Stats } from '@/types';
import { storageService } from '@/services/storageService';
import { SEED_COURSES, generateCourse } from '@/services/aiService';

type AppContextValue = {
  courses: Course[];
  progress: Progress;
  stats: Stats;
  apiKey: string;
  bookmarks: string[];
  loading: boolean;
  setApiKey: (key: string) => void;
  generateTopic: (topic: string) => Promise<void>;
  watchEpisode: (courseId: string, epNumber: number, co2: number, totalEps: number) => void;
  submitQuiz: (courseId: string, score: number, co2: number) => void;
  toggleBookmark: (courseId: string) => void;
  upvoteCourse: (courseId: string) => void;
  resetAll: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(() => {
    const stored = storageService.getCourses();
    return stored.length > 0 ? stored : SEED_COURSES;
  });
  const [progress, setProgress] = useState<Progress>(() => storageService.getProgress());
  const [stats, setStats] = useState<Stats>(() => storageService.getStats());
  const [apiKey, setApiKeyState] = useState<string>(() => storageService.getApiKey());
  const [bookmarks, setBookmarks] = useState<string[]>(() => storageService.getBookmarks());
  const [loading, setLoading] = useState(false);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    storageService.saveApiKey(key);
  }, []);

  const generateTopic = useCallback(async (topic: string) => {
    if (!topic.trim()) return;
    setLoading(true);
    const course = await generateCourse(topic, apiKey);
    const updated = [course, ...courses];
    setCourses(updated);
    storageService.saveCourses(updated);
    setLoading(false);
  }, [apiKey, courses]);

  const watchEpisode = useCallback((courseId: string, epNumber: number, co2: number, totalEps: number) => {
    const updated = storageService.markEpisodeWatched(courseId, epNumber, totalEps);
    setProgress(updated);
    const co2PerEp = totalEps > 0 ? co2 / totalEps : 0;
    const newStats = storageService.addEpisodeWatched(co2PerEp);
    setStats(newStats);
  }, []);

  const submitQuiz = useCallback((courseId: string, score: number, co2: number) => {
    const updated = storageService.recordQuizScore(courseId, score);
    setProgress(updated);
    const newStats = storageService.addQuizTaken(co2 * 0.3);
    setStats(newStats);
  }, []);

  const toggleBookmark = useCallback((courseId: string) => {
    const updated = storageService.toggleBookmark(courseId);
    setBookmarks(updated);
  }, []);

  const upvoteCourse = useCallback((courseId: string) => {
    const updated = courses.map(c =>
      c.id === courseId ? { ...c, upvotes: c.upvotes + 1 } : c
    );
    setCourses(updated);
    storageService.saveCourses(updated);
  }, [courses]);

  const resetAll = useCallback(() => {
    storageService.resetAll();
    setCourses(SEED_COURSES);
    setProgress({});
    setStats({ co2Saved: 0, quizzesTaken: 0, episodesWatched: 0 });
    setBookmarks([]);
  }, []);

  return (
    <AppContext.Provider value={{
      courses, progress, stats, apiKey, bookmarks, loading,
      setApiKey, generateTopic, watchEpisode, submitQuiz,
      toggleBookmark, upvoteCourse, resetAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
