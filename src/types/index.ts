export type Episode = {
  epNumber: number;
  title: string;
  lesson: string;
  ecoAction: string;
};

export type Quiz = {
  q: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type Course = {
  id: string;
  title: string;
  matchScore: number;
  maturityRating: string;
  duration: string;
  summary: string;
  episodes: Episode[];
  quiz: Quiz[];
  co2SavedKg: number;
  category: string;
  createdAt: number;
  upvotes: number;
};

export type ProgressEntry = {
  watched: number[];
  quizScores: number[];
  completed: boolean;
};

export type Progress = Record<string, ProgressEntry>;

export type Stats = {
  co2Saved: number;
  quizzesTaken: number;
  episodesWatched: number;
};

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

export type View = 'home' | 'mylist' | 'stats';

export type SortOption = 'trending' | 'newest' | 'upvoted';

export type Theme = 'dark' | 'light' | 'system';
