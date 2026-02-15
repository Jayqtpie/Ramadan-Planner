import { useParams, useNavigate } from 'react-router-dom';
import { useAutoSave } from '../hooks/useAutoSave';
import { getDefaultWeeklyReflection } from '../lib/data';
import SectionBar from '../components/SectionBar';
import StarRating from '../components/StarRating';
import SavedToast from '../components/SavedToast';
import Footer from '../components/Footer';
import { ChevronLeft } from 'lucide-react';

const WEEK_RANGES = { 1: '1-7', 2: '8-14', 3: '15-21', 4: '22-30' };

const SECTIONS_DEF = [
  { key: 'wentWell', title: 'WHAT WENT WELL THIS WEEK?', sub: 'Celebrate your wins — no matter how small. Where did you see barakah?' },
  { key: 'needsImprovement', title: 'WHAT NEEDS IMPROVEMENT?', sub: 'Be honest with yourself. What fell short? Why?' },
  { key: 'quranProgress', title: 'MY QURAN PROGRESS', sub: 'Where are you in your Khatm? Are you on track?' },
  { key: 'spiritualHighlight', title: 'SPIRITUAL HIGHLIGHT OF THE WEEK', sub: 'A moment of connection with Allah — in salah, dua, or Quran.' },
  { key: 'goalsNextWeek', title: 'GOALS FOR NEXT WEEK', sub: 'Set 3 clear, specific goals for the coming 7 days.' },
];

export default function WeeklyReflection() {
  const { week: weekParam } = useParams();
  const week = Math.min(4, Math.max(1, parseInt(weekParam) || 1));
  const navigate = useNavigate();
  const { data, update, loaded, showSaved } = useAutoSave('weeklyReflections', `week-${week}`, () => getDefaultWeeklyReflection(week));

  if (!loaded || !data) return <div className="p-8 text-center text-[var(--muted)]">Loading...</div>;

  const set = (field, value) => update({ ...data, [field]: value });

  return (
    <div className="animate-fade-in">
      <div className="geo-pattern rounded-b-3xl px-5 py-8 text-white" style={{ background: 'var(--primary)' }}>
        <button onClick={() => navigate('/reflect')} className="flex items-center gap-1 text-white/70 text-sm mb-3 hover:text-white">
          <ChevronLeft size={16} /> Back
        </button>
        <p className="spaced-caps text-[var(--accent)] mb-1">Jumu'ah Review</p>
        <h1 className="text-2xl font-extrabold">Week {week} Reflection</h1>
        <p className="text-white/60 text-sm mt-1">Days {WEEK_RANGES[week]}</p>
        <p className="text-xs text-white/40 mt-1">Use this page every Friday to review your week and recalibrate.</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {SECTIONS_DEF.map((s, i) => (
          <div key={s.key} className="card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <SectionBar variant="primary" icon="✸">{s.title}</SectionBar>
            <div className="card-body">
              <p className="text-xs text-[var(--muted)] mb-2">{s.sub}</p>
              <textarea rows={4} value={data[s.key]} onChange={(e) => set(s.key, e.target.value)} placeholder="Write here..." />
            </div>
          </div>
        ))}

        {/* Rating */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.25s', borderLeft: '3px solid var(--accent)' }}>
          <div className="card-body space-y-3">
            <StarRating label="Overall Week Rating:" value={data.weekRating || 0} onChange={(v) => set('weekRating', v)} />
            <div>
              <label className="text-sm font-medium text-[var(--muted)] block mb-1">One word to describe this week:</label>
              <input type="text" value={data.oneWord} onChange={(e) => set('oneWord', e.target.value)} placeholder="e.g. Grateful, Focused, Struggling..." />
            </div>
          </div>
        </div>
      </div>

      <SavedToast show={showSaved} />
      <Footer />
    </div>
  );
}
