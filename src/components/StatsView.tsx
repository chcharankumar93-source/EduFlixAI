import { BarChart3, TrendingUp, AlertTriangle, Leaf, RotateCcw } from 'lucide-react';
import type { Course, Progress, Stats } from '@/types';
import { Ring } from './Ring';

type StatsViewProps = {
  courses: Course[];
  progress: Progress;
  stats: Stats;
  apiKey: string;
  onGenerateRemedial: (topic: string) => Promise<void>;
};

export function StatsView({ courses, progress, stats, apiKey, onGenerateRemedial }: StatsViewProps) {
  const myList = courses.filter(c => progress[c.id]);
  const atRisk = myList.filter(c => {
    const p = progress[c.id];
    return p && p.quizScores.length > 0 && p.quizScores[p.quizScores.length - 1] < 70;
  });

  const allQuizScores = Object.values(progress).flatMap(p => p.quizScores);
  const avgScore = allQuizScores.length
    ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
    : 0;
  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const masteryVelocity = stats.episodesWatched > 0
    ? Math.round((stats.episodesWatched / Math.max(1, stats.quizzesTaken)) * 10) / 10
    : 0;

  return (
    <div className="pt-24 px-4 md:px-8 pb-12 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-2">
        <BarChart3 className="w-7 h-7 text-[#E50914]" /> AI Impact & Predictive Stats
      </h1>

      {/* Summary rings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="CO₂ Saved (kg)"><Ring pct={Math.min(100, stats.co2Saved)} label="kg" size={72} /></StatCard>
        <StatCard label="Avg Quiz Score"><Ring pct={avgScore} size={72} /></StatCard>
        <StatCard label="Episodes Watched"><div className="text-3xl font-black text-blue-400">{stats.episodesWatched}</div></StatCard>
        <StatCard label="Mastery Velocity"><div className="text-3xl font-black text-orange-400">{masteryVelocity}x</div></StatCard>
      </div>

      {/* Mastery velocity bar */}
      <section className="bg-[#181818] rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <h3 className="font-bold">Mastery Velocity</h3>
        </div>
        <div className="h-3 rounded-full bg-black/40 overflow-hidden" role="progressbar" aria-valuenow={Math.min(100, masteryVelocity * 25)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, masteryVelocity * 25)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats.episodesWatched} episodes · {stats.quizzesTaken} quizzes · {completedCount} completed
        </p>
      </section>

      {/* At-risk topics */}
      <section className="bg-[#181818] rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="font-bold">At-Risk Topics</h3>
        </div>
        {atRisk.length === 0 ? (
          <p className="text-sm text-gray-500">No at-risk topics. Score 70%+ on quizzes to stay on track.</p>
        ) : (
          <div className="space-y-3">
            {atRisk.map(c => {
              const lastScore = progress[c.id]?.quizScores.slice(-1)[0] || 0;
              return (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{c.title}</div>
                    <div className="text-xs text-red-400">Last quiz: {lastScore}%</div>
                  </div>
                  <button
                    onClick={() => onGenerateRemedial(`${c.title} Remedial`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#E50914] rounded text-xs font-bold hover:bg-[#f6121d] transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Generate AI Remedial Episode
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Community impact */}
      <section className="bg-[#181818] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="w-4 h-4 text-green-400" />
          <h3 className="font-bold">Community Impact</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ImpactCard><Ring pct={Math.min(100, stats.co2Saved)} label="kg" size={56} /></ImpactCard>
          <ImpactCard label="Sheets Paper Saved" value={String(Math.round(stats.co2Saved * 2.5))} color="text-green-400" />
          <ImpactCard label="Trees Preserved" value={String(Math.round(stats.co2Saved * 0.8))} color="text-emerald-400" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#181818] rounded-xl p-4 flex flex-col items-center">
      {children}
      <span className="text-xs text-gray-400 mt-2">{label}</span>
    </div>
  );
}

function ImpactCard({ children, label, value, color }: { children?: React.ReactNode; label?: string; value?: string; color?: string }) {
  return (
    <div className="flex flex-col items-center p-3 bg-black/20 rounded-lg">
      {children}
      {value && <div className={`text-2xl font-black ${color}`}>{value}</div>}
      {label && <span className="text-xs text-gray-400 mt-1">{label}</span>}
    </div>
  );
}
