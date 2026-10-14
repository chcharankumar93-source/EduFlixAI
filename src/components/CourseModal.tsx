import { useState } from 'react';
import { X, Play, CheckCircle2, Circle, Leaf, RotateCcw, Bookmark } from 'lucide-react';
import type { Course, ProgressEntry } from '@/types';
import { gradientFor } from '@/services/aiService';
import { useEscapeKey } from '@/hooks/useEscapeKey';

type CourseModalProps = {
  course: Course;
  progress?: ProgressEntry;
  isBookmarked: boolean;
  onClose: () => void;
  onWatch: (epNumber: number) => void;
  onQuiz: (score: number) => void;
  onBookmark: () => void;
};

export function CourseModal({ course, progress, isBookmarked, onClose, onWatch, onQuiz, onBookmark }: CourseModalProps) {
  const [tab, setTab] = useState<'episodes' | 'quiz'>('episodes');
  const [activeEp, setActiveEp] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const watched = progress?.watched || [];

  useEscapeKey(onClose);

  const score = submitted ? answers.reduce((acc, a, i) => acc + (a === course.quiz[i]?.answerIndex ? 1 : 0), 0) : 0;
  const scorePct = course.quiz.length ? Math.round((score / course.quiz.length) * 100) : 0;
  const allAnswered = answers.filter(a => a !== undefined).length === course.quiz.length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-modal-title"
    >
      <div className="min-h-full flex items-start justify-center p-4 md:p-8" onClick={e => e.stopPropagation()}>
        <div className="bg-[#181818] rounded-2xl max-w-3xl w-full overflow-hidden">
          {/* Header */}
          <div className={`relative h-40 bg-gradient-to-br ${gradientFor(course.title)}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent" />
            <button
              onClick={onClose}
              aria-label="Close course dialog"
              className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={onBookmark}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              className="absolute top-3 left-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
            >
              <Bookmark className="w-5 h-5" fill={isBookmarked ? '#E50914' : 'none'} color={isBookmarked ? '#E50914' : 'white'} />
            </button>
            <div className="absolute bottom-3 left-5 right-5">
              <span className="text-green-400 font-bold text-sm">{course.matchScore}% Match</span>
              <h2 id="course-modal-title" className="text-2xl font-black drop-shadow">{course.title}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
                <span className="border border-white/30 px-1.5 rounded">{course.maturityRating}</span>
                <span>{course.duration}</span>
                <span className="flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-green-400" />{course.co2SavedKg}kg CO₂
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10" role="tablist">
            {(['episodes', 'quiz'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                role="tab"
                aria-selected={tab === t}
                className={`px-5 py-3 text-sm font-bold transition ${tab === t ? 'text-white border-b-2 border-[#E50914]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {t === 'episodes' ? `Episodes (${course.episodes.length})` : `Mastery Quiz (${course.quiz.length})`}
              </button>
            ))}
          </div>

          {/* Episodes */}
          {tab === 'episodes' && (
            <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
              {course.episodes.map((ep, i) => {
                const isWatched = watched.includes(ep.epNumber);
                const isActive = activeEp === i;
                return (
                  <div key={i}>
                    <button
                      onClick={() => setActiveEp(i)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      aria-expanded={isActive}
                    >
                      <div className="flex-shrink-0">
                        {isWatched ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <Circle className="w-6 h-6 text-gray-600" />}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-semibold">{ep.epNumber}. {ep.title}</div>
                        <div className="text-xs text-gray-500 truncate">{ep.lesson}</div>
                      </div>
                      {!isWatched && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onWatch(ep.epNumber); }}
                          aria-label={`Watch episode ${ep.epNumber}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#E50914] rounded text-xs font-bold hover:bg-[#f6121d] transition"
                        >
                          <Play className="w-3 h-3 fill-white" /> Watch
                        </button>
                      )}
                    </button>
                    {isActive && (
                      <div className="ml-9 mt-2 p-3 bg-black/30 rounded-lg space-y-2 animate-fade-in">
                        <p className="text-sm text-gray-300">{ep.lesson}</p>
                        <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded">
                          <Leaf className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-green-300">{ep.ecoAction}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quiz */}
          {tab === 'quiz' && (
            <div className="p-5 space-y-5 max-h-[50vh] overflow-y-auto">
              {course.quiz.map((q, qi) => (
                <div key={qi}>
                  <p className="text-sm font-semibold mb-2">{qi + 1}. {q.q}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[qi] === oi;
                      const isCorrect = q.answerIndex === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => { if (!submitted) setAnswers([...answers.slice(0, qi), oi, ...answers.slice(qi + 1)]); }}
                          disabled={submitted}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition ${
                            submitted
                              ? isCorrect
                                ? 'bg-green-500/15 border-green-500/40 text-green-300'
                                : isSelected
                                  ? 'bg-red-500/15 border-red-500/40 text-red-300'
                                  : 'border-white/10 text-gray-400'
                              : isSelected
                                ? 'bg-[#E50914]/20 border-[#E50914]/50 text-white'
                                : 'border-white/10 text-gray-300 hover:border-white/30'
                          }`}
                        >
                          {opt}
                          {submitted && isCorrect && <CheckCircle2 className="inline w-4 h-4 ml-2 text-green-400" />}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && <p className="text-xs text-gray-400 mt-2 p-2 bg-black/30 rounded">{q.explanation}</p>}
                </div>
              ))}

              {!submitted ? (
                <button
                  onClick={() => { if (allAnswered) { setSubmitted(true); onQuiz(scorePct); } }}
                  disabled={!allAnswered}
                  className="w-full py-3 bg-[#E50914] rounded-lg font-bold text-sm hover:bg-[#f6121d] transition disabled:opacity-40"
                >
                  Submit Quiz
                </button>
              ) : (
                <div className="text-center p-4 bg-black/30 rounded-lg">
                  <div
                    className="text-3xl font-black mb-1"
                    style={{ color: scorePct >= 70 ? '#22c55e' : scorePct >= 40 ? '#eab308' : '#ef4444' }}
                  >
                    {scorePct}%
                  </div>
                  <p className="text-sm text-gray-400">
                    {scorePct >= 70 ? 'Mastered! Great work.' : 'Keep practicing — review the episodes and try again.'}
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setAnswers([]); }}
                    className="mt-3 px-4 py-2 bg-white/10 rounded text-sm font-bold hover:bg-white/20 transition flex items-center gap-1.5 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
