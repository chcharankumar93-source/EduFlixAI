import { Bookmark, ThumbsUp, Play } from 'lucide-react';
import type { Course } from '@/types';
import { gradientFor } from '@/services/aiService';

type CourseCardProps = {
  course: Course;
  progressPct: number;
  isBookmarked: boolean;
  onClick: () => void;
  onBookmark: () => void;
  onUpvote: () => void;
};

export function CourseCard({ course, progressPct, isBookmarked, onClick, onBookmark, onUpvote }: CourseCardProps) {
  return (
    <button onClick={onClick} className="group flex-shrink-0 w-56 text-left" aria-label={`Open course: ${course.title}`}>
      <div className={`relative h-32 rounded-lg overflow-hidden bg-gradient-to-br ${gradientFor(course.title)} transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-white/30`}>
        <div className="absolute inset-0 bg-black/20" />

        {/* Match score */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-bold text-green-400">
          {course.matchScore}%
        </div>

        {/* Bookmark */}
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') onBookmark(); }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          className={`absolute top-2 left-2 p-1 rounded transition cursor-pointer ${isBookmarked ? 'text-[#E50914]' : 'text-white/60 hover:text-white'}`}
        >
          <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? '#E50914' : 'none'} />
        </div>

        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-sm font-bold truncate drop-shadow">{course.title}</div>
          <div className="text-[10px] text-gray-200">{course.duration} · {course.episodes.length} eps</div>
        </div>

        {progressPct > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/40">
            <div className="h-full bg-[#E50914]" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="flex items-center gap-2 mt-1.5 px-0.5">
        <span className="text-[10px] text-gray-500 truncate flex-1">{course.category}</span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onUpvote(); }}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') onUpvote(); }}
          aria-label={`Upvote ${course.title}`}
          className="flex items-center gap-0.5 text-[10px] text-gray-500 hover:text-white transition cursor-pointer"
        >
          <ThumbsUp className="w-2.5 h-2.5" /> {course.upvotes}
        </span>
      </div>
    </button>
  );
}
