import { Circle, Play, Award, CheckCircle2, Bookmark } from 'lucide-react';
import type { Course, Progress } from '@/types';
import { Ring } from './Ring';
import { gradientFor } from '@/services/aiService';

type MyListViewProps = {
  courses: Course[];
  progress: Progress;
  bookmarks: string[];
  coursePct: (id: string) => number;
  onCourseClick: (c: Course) => void;
};

export function MyListView({ courses, progress, bookmarks, coursePct, onCourseClick }: MyListViewProps) {
  const myList = courses.filter(c => progress[c.id] || bookmarks.includes(c.id));

  if (myList.length === 0) {
    return (
      <div className="pt-24 px-4 md:px-8 pb-12 text-center">
        <div className="py-20 text-gray-500">
          <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Start watching courses or bookmark them to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-8 pb-12">
      <h1 className="text-2xl md:text-3xl font-black mb-6">My List & Progress</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {myList.map(c => {
          const pct = coursePct(c.id);
          const p = progress[c.id];
          const isBookmarked = bookmarks.includes(c.id);
          return (
            <article
              key={c.id}
              className="rounded-lg overflow-hidden bg-[#181818] hover:bg-[#2a2a2a] transition cursor-pointer group"
              onClick={() => onCourseClick(c)}
            >
              <div className={`relative h-28 bg-gradient-to-br ${gradientFor(c.title)}`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-2 left-3 text-sm font-bold drop-shadow">{c.title}</div>
                <div className="absolute top-2 right-2"><Ring pct={pct} size={42} stroke={4} /></div>
                {isBookmarked && !p && (
                  <div className="absolute top-2 left-2 text-[#E50914]"><Bookmark className="w-3.5 h-3.5" fill="#E50914" /></div>
                )}
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Play className="w-3 h-3" /> {p?.watched.length || 0}/{c.episodes.length} episodes
                  <span className="ml-auto flex items-center gap-1">
                    <Award className="w-3 h-3" /> {p?.quizScores.length || 0} quizzes
                  </span>
                </div>
                {p?.completed && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                )}
                {isBookmarked && !p?.completed && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Bookmark className="w-3 h-3" /> Bookmarked
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
