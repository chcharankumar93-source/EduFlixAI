import type { Course, Progress, Stats, SortOption } from '@/types';
import { gradientFor } from '@/services/aiService';
import { Hero } from './Hero';
import { ContentRow } from './ContentRow';
import { FilterBar } from './FilterBar';
import { RowSkeleton } from './Skeleton';

type HomeViewProps = {
  courses: Course[];
  progress: Progress;
  bookmarks: string[];
  stats: Stats;
  searchQuery: string;
  debouncedQuery: string;
  selectedCategory: string;
  sortBy: SortOption;
  categories: string[];
  loading: boolean;
  coursePct: (id: string) => number;
  onCourseClick: (c: Course) => void;
  onBookmark: (id: string) => void;
  onUpvote: (id: string) => void;
  onGenerate: (topic: string) => void;
  onCategoryChange: (c: string) => void;
  onSortChange: (s: SortOption) => void;
  onClearFilters: () => void;
};

export function HomeView(props: HomeViewProps) {
  const {
    courses, progress, bookmarks, searchQuery, debouncedQuery,
    selectedCategory, sortBy, categories, loading,
    coursePct, onCourseClick, onBookmark, onUpvote, onGenerate,
    onCategoryChange, onSortChange, onClearFilters,
  } = props;

  const hero = courses[0];

  // Filter + sort
  let filtered = courses;
  if (debouncedQuery.trim()) {
    const q = debouncedQuery.toLowerCase();
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(c => c.category === selectedCategory);
  }
  if (sortBy === 'newest') {
    filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt);
  } else if (sortBy === 'upvoted') {
    filtered = [...filtered].sort((a, b) => b.upvotes - a.upvotes);
  } else {
    filtered = [...filtered].sort((a, b) => b.matchScore - a.matchScore);
  }

  const continueLearning = courses.filter(c => {
    const p = progress[c.id];
    return p && p.watched.length > 0 && !p.completed;
  });
  const trending = [...courses].sort((a, b) => b.upvotes - a.upvotes).slice(0, 6);
  const recommended = courses.slice(2, 8);

  // Show filtered grid if searching or filtering
  const isFiltering = !!debouncedQuery.trim() || selectedCategory !== 'all';

  if (loading && courses.length === 0) {
    return (
      <div className="pt-20 px-4 md:px-8 pb-12">
        <RowSkeleton />
      </div>
    );
  }

  return (
    <div className="pt-16">
      {hero && !isFiltering && (
        <Hero
          course={hero}
          loading={loading}
          onGenerate={onGenerate}
          onPlay={() => onCourseClick(hero)}
          onQuiz={() => onCourseClick(hero)}
        />
      )}

      <div className="px-4 md:px-8 -mt-8 space-y-8 pb-12 relative z-10">
        {isFiltering ? (
          <section>
            <FilterBar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              sortBy={sortBy}
              onSortChange={onSortChange}
              onClear={onClearFilters}
            />
            {filtered.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No courses found. Try a different search or filter.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(c => (
                  <FilteredCard
                    key={c.id}
                    course={c}
                    pct={coursePct(c.id)}
                    isBookmarked={bookmarks.includes(c.id)}
                    onClick={() => onCourseClick(c)}
                    onBookmark={() => onBookmark(c.id)}
                    onUpvote={() => onUpvote(c.id)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <ContentRow
              title="Continue Learning"
              courses={continueLearning.length ? continueLearning : courses.slice(0, 4)}
              progress={progress}
              bookmarks={bookmarks}
              onCourseClick={onCourseClick}
              onBookmark={onBookmark}
              onUpvote={onUpvote}
              coursePct={coursePct}
            />
            <ContentRow
              title="Trending Green & Tech Skills"
              courses={trending}
              progress={progress}
              bookmarks={bookmarks}
              onCourseClick={onCourseClick}
              onBookmark={onBookmark}
              onUpvote={onUpvote}
              coursePct={coursePct}
            />
            <ContentRow
              title="AI Recommended for Your Community"
              courses={recommended}
              progress={progress}
              bookmarks={bookmarks}
              onCourseClick={onCourseClick}
              onBookmark={onBookmark}
              onUpvote={onUpvote}
              coursePct={coursePct}
            />
          </>
        )}
      </div>
    </div>
  );
}

function FilteredCard({ course, pct, isBookmarked, onClick, onBookmark, onUpvote }: {
  course: Course;
  pct: number;
  isBookmarked: boolean;
  onClick: () => void;
  onBookmark: () => void;
  onUpvote: () => void;
}) {
  return (
    <button onClick={onClick} className="group text-left" aria-label={`Open course: ${course.title}`}>
      <div className={`relative h-36 rounded-lg overflow-hidden bg-gradient-to-br ${gradientFor(course.title)} transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-white/30`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-bold text-green-400">{course.matchScore}%</div>
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-sm font-bold truncate drop-shadow">{course.title}</div>
          <div className="text-[10px] text-gray-200">{course.duration} · {course.episodes.length} eps</div>
        </div>
        {pct > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/40">
            <div className="h-full bg-[#E50914]" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    </button>
  );
}
