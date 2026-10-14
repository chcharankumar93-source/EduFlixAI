import type { Course, Episode, Quiz } from '@/types';

const FALLBACK_TITLES = ['Fundamentals', 'Intermediate Mastery', 'Advanced Applications', 'Community Impact', 'Future Frontiers'];
const FALLBACK_LESSONS = [
  'Build core mental models through guided examples and interactive reasoning exercises.',
  'Develop structured problem-solving skills with progressively challenging scenarios.',
  'Apply knowledge to complex real-world projects that mirror professional challenges.',
  'Leverage your skills to design and implement sustainable community initiatives.',
  'Explore cutting-edge developments and emerging opportunities in this domain.',
];
const ECO_ACTIONS = [
  'Switch to digital notes for this topic — save 2kg CO2 from paper production.',
  'Host a community study group online instead of commuting — saves 5kg CO2 per session.',
  'Share your project digitally rather than printing — saves 1.5kg CO2.',
  'Mentor a peer remotely using open-source tools — reduces carbon footprint by 3kg.',
  'Create an open educational resource for your neighborhood — saves 4kg CO2 from textbook production.',
];

const CATEGORIES = ['Renewable Energy', 'Sustainability', 'Technology', 'Community', 'Environment', 'Education', 'Green Tech', 'Social Impact'];

function inferCategory(topic: string): string {
  const lower = topic.toLowerCase();
  if (/solar|wind|grid|energy|power/.test(lower)) return 'Renewable Energy';
  if (/waste|recycle|compost|zero/.test(lower)) return 'Sustainability';
  if (/python|code|ai|data|tech/.test(lower)) return 'Technology';
  if (/community|organiz/.test(lower)) return 'Community';
  if (/water|garden|tree|carbon|climate/.test(lower)) return 'Environment';
  return 'Education';
}

export function localCourse(topic: string): Course {
  const t = topic.trim();
  const eps: Episode[] = FALLBACK_TITLES.map((title, i) => ({
    epNumber: i + 1,
    title: `${t}: ${title}`,
    lesson: FALLBACK_LESSONS[i],
    ecoAction: ECO_ACTIONS[i],
  }));
  const quiz: Quiz[] = [
    {
      q: `What is the most fundamental concept in ${t}?`,
      options: ['Understanding core principles', 'Memorizing facts', 'Skipping fundamentals', 'Avoiding practice'],
      answerIndex: 0,
      explanation: `Core principles form the foundation for all advanced work in ${t}.`,
    },
    {
      q: `How can learning ${t} benefit your community?`,
      options: ['It cannot help', 'By sharing knowledge and creating sustainable solutions', 'Only through certifications', 'By keeping skills private'],
      answerIndex: 1,
      explanation: 'Knowledge shared creates compounding community impact through sustainable practices.',
    },
    {
      q: `What's the best way to master ${t} long-term?`,
      options: ['Cramming once', 'Consistent practice with real-world application', 'Watching without doing', 'Avoiding challenges'],
      answerIndex: 1,
      explanation: 'Spaced repetition and hands-on application produce durable mastery.',
    },
  ];
  return {
    id: `${t}-${Date.now()}`,
    title: t,
    matchScore: 80 + Math.floor(Math.random() * 18),
    maturityRating: 'ALL',
    duration: `${30 + eps.length * 12} min`,
    summary: `An AI-curated adaptive learning series covering ${t} from fundamentals through community impact, with real-world sustainability challenges at every step.`,
    episodes: eps,
    quiz,
    co2SavedKg: 15 + Math.floor(Math.random() * 20),
    category: inferCategory(t),
    createdAt: Date.now(),
    upvotes: Math.floor(Math.random() * 50),
  };
}

export async function geminiCourse(topic: string, apiKey: string): Promise<Course> {
  const prompt = `Create a learning course about "${topic}". Return ONLY valid JSON (no markdown): {"title":"...","matchScore":95,"maturityRating":"ALL","duration":"45 min","summary":"...","episodes":[{"epNumber":1,"title":"...","lesson":"2 sentence lesson","ecoAction":"1 sentence sustainability action"}],"quiz":[{"q":"...","options":["a","b","c","d"],"answerIndex":0,"explanation":"..."}],"co2SavedKg":12}. Include 4-5 episodes and 3 quiz questions.`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!res.ok) throw new Error('Gemini API error');
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    ...parsed,
    id: `${topic}-${Date.now()}`,
    co2SavedKg: parsed.co2SavedKg || 12,
    matchScore: parsed.matchScore || 90,
    category: inferCategory(topic),
    createdAt: Date.now(),
    upvotes: 0,
    episodes: (parsed.episodes || []).map((e: Episode, i: number) => ({ ...e, epNumber: e.epNumber || i + 1 })),
    quiz: parsed.quiz || [],
  };
}

export async function generateCourse(topic: string, apiKey: string): Promise<Course> {
  if (!apiKey.trim()) return localCourse(topic);
  try {
    return await geminiCourse(topic, apiKey);
  } catch {
    return localCourse(topic);
  }
}

export const SEED_TOPICS = [
  'Solar Energy Basics', 'Urban Gardening', 'Python for Data', 'Water Conservation',
  'Zero Waste Living', 'AI Ethics', 'Composting Science', 'Community Organizing',
  'Wind Power Tech', 'Recycling Innovation', 'Carbon Footprint', 'Smart Grids',
];

export const SEED_COURSES: Course[] = SEED_TOPICS.map(localCourse);

export const ALL_CATEGORIES = [...new Set([...CATEGORIES, ...SEED_TOPICS.map(inferCategory)])];

export const GRADIENTS = [
  'from-blue-600 to-cyan-500', 'from-emerald-600 to-green-500',
  'from-orange-600 to-amber-500', 'from-purple-600 to-pink-500',
  'from-red-600 to-rose-500', 'from-indigo-600 to-blue-500',
  'from-teal-600 to-emerald-500', 'from-yellow-600 to-orange-500',
];

export function gradientFor(title: string): string {
  return GRADIENTS[title.length % GRADIENTS.length];
}
