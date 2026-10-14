import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Course, Progress } from '@/types';
import { CourseCard } from './CourseCard';

type ContentRowProps = {
  title: string;
  courses: Course[];
  progress: Progress;
  bookmarks: string[];
  onCourseClick: (c: Course) => void;
  onBookmark: (id: string) => void;
  onUpvote: (id: string) => void;
  coursePct: (id: string) => number;
};

export function ContentRow({
  title, courses, progress, bookmarks, onCourseClick, onBookmark, onUpvote, coursePct,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 400, behavior: 'smooth' });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg md:text-xl font-bold">{title}</h2>
        <div className="flex gap-1">
          <button onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`} className="p-1.5 bg-white/10 rounded hover:bg-white/20 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll(1)} aria-label={`Scroll ${title} right`} className="p-1.5 bg-white/10 rounded hover:bg-white/20 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {courses.map(c => (
          <CourseCard
            key={c.id}
            course={c}
            progressPct={coursePct(c.id)}
            isBookmarked={bookmarks.includes(c.id)}
            onClick={() => onCourseClick(c)}
            onBookmark={() => onBookmark(c.id)}
            onUpvote={() => onUpvote(c.id)}
          />
        ))}
      </div>
    </section>
  );
}
