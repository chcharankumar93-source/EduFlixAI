import { useState } from 'react';
import { Play, Leaf, BookOpen } from 'lucide-react';
import type { Course } from '@/types';

type HeroProps = {
  course: Course;
  loading: boolean;
  onGenerate: (topic: string) => void;
  onPlay: () => void;
  onQuiz: () => void;
};

export function Hero({ course, loading, onGenerate, onPlay, onQuiz }: HeroProps) {
  const [topic, setTopic] = useState('');

  return (
    <section className="relative h-[70vh] min-h-[420px] overflow-hidden" aria-label="Featured course">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
      <div className="relative h-full flex items-end pb-12 px-4 md:px-12">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-[#E50914] rounded text-xs font-bold mb-3">AI FEATURED COURSE</span>
          <span className="ml-2 text-green-400 font-bold text-sm">{course.matchScore}% Match for Your Skill Level</span>
          <h1 className="text-3xl md:text-5xl font-black mb-3 drop-shadow-lg">{course.title}</h1>
          <p className="text-gray-200 text-sm md:text-base mb-4 max-w-xl line-clamp-3">{course.summary}</p>
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-300">
            <span className="border border-white/30 px-1.5 py-0.5 rounded">{course.maturityRating}</span>
            <span>{course.duration}</span>
            <span className="flex items-center gap-1">
              <Leaf className="w-3 h-3 text-green-400" /> {course.co2SavedKg}kg CO₂ savable
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={onPlay}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded hover:bg-white/80 transition"
            >
              <Play className="w-5 h-5 fill-black" /> Play Episode 1
            </button>
            <button
              onClick={onQuiz}
              className="flex items-center gap-2 px-6 py-2.5 bg-white/20 text-white font-bold rounded hover:bg-white/30 transition backdrop-blur-sm"
            >
              <BookOpen className="w-5 h-5" /> Take Mastery Quiz
            </button>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); onGenerate(topic); setTopic(''); }}
            className="flex items-center gap-2 max-w-lg"
          >
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="+ Generate Custom AI Series..."
              aria-label="Generate custom AI series"
              className="flex-1 px-3 py-2 bg-black/60 border border-white/20 rounded text-sm placeholder-gray-400 focus:border-[#E50914] outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#E50914] rounded text-sm font-bold hover:bg-[#f6121d] transition disabled:opacity-50"
            >
              {loading ? '...' : 'Generate'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
