import type { Course, Progress, Stats } from '@/types';

const KEYS = {
  courses: 'eduflix_courses',
  progress: 'eduflix_progress',
  stats: 'eduflix_stats',
  apiKey: 'eduflix_key',
  bookmarks: 'eduflix_bookmarks',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export const storageService = {
  // ── Courses ──
  getCourses(): Course[] {
    return read<Course[]>(KEYS.courses, []);
  },
  saveCourses(courses: Course[]): void {
    write(KEYS.courses, courses);
  },
  addCourse(course: Course): Course[] {
    const courses = [course, ...this.getCourses()];
    this.saveCourses(courses);
    return courses;
  },

  // ── Progress ──
  getProgress(): Progress {
    return read<Progress>(KEYS.progress, {});
  },
  saveProgress(progress: Progress): void {
    write(KEYS.progress, progress);
  },
  markEpisodeWatched(courseId: string, epNumber: number, totalEps: number): Progress {
    const progress = this.getProgress();
    const existing = progress[courseId] || { watched: [], quizScores: [], completed: false };
    if (!existing.watched.includes(epNumber)) {
      existing.watched = [...existing.watched, epNumber];
    }
    progress[courseId] = existing;
    this.saveProgress(progress);
    return progress;
  },
  recordQuizScore(courseId: string, score: number): Progress {
    const progress = this.getProgress();
    const existing = progress[courseId] || { watched: [], quizScores: [], completed: false };
    existing.quizScores = [...existing.quizScores, score];
    existing.completed = score >= 70;
    progress[courseId] = existing;
    this.saveProgress(progress);
    return progress;
  },

  // ── Stats ──
  getStats(): Stats {
    return read<Stats>(KEYS.stats, { co2Saved: 0, quizzesTaken: 0, episodesWatched: 0 });
  },
  saveStats(stats: Stats): void {
    write(KEYS.stats, stats);
  },
  addEpisodeWatched(co2PerEp: number): Stats {
    const stats = this.getStats();
    stats.episodesWatched += 1;
    stats.co2Saved += Math.round(co2PerEp);
    this.saveStats(stats);
    return stats;
  },
  addQuizTaken(co2Bonus: number): Stats {
    const stats = this.getStats();
    stats.quizzesTaken += 1;
    stats.co2Saved += Math.round(co2Bonus);
    this.saveStats(stats);
    return stats;
  },

  // ── API Key ──
  getApiKey(): string {
    return read<string>(KEYS.apiKey, '');
  },
  saveApiKey(key: string): void {
    write(KEYS.apiKey, key);
  },

  // ── Bookmarks ──
  getBookmarks(): string[] {
    return read<string[]>(KEYS.bookmarks, []);
  },
  toggleBookmark(courseId: string): string[] {
    const bookmarks = this.getBookmarks();
    const updated = bookmarks.includes(courseId)
      ? bookmarks.filter(id => id !== courseId)
      : [...bookmarks, courseId];
    write(KEYS.bookmarks, updated);
    return updated;
  },

  // ── Reset ──
  resetAll(): void {
    Object.values(KEYS).forEach(key => {
      try { localStorage.removeItem(key); } catch { /* noop */ }
    });
  },
};
