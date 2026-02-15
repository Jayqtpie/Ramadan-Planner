import { useAutoSave } from '../hooks/useAutoSave';
import { getDefaultPostRamadan } from '../lib/data';
import { useNavigate } from 'react-router-dom';
import SectionBar from '../components/SectionBar';
import SavedToast from '../components/SavedToast';
import Footer from '../components/Footer';
import { ChevronLeft } from 'lucide-react';

export default function PostRamadan() {
  const navigate = useNavigate();
  const { data, update, loaded, showSaved } = useAutoSave('postRamadan', 'post-ramadan', getDefaultPostRamadan);

  if (!loaded || !data) return <div className="p-8 text-center text-[var(--muted)]">Loading...</div>;

  const updateHabit = (i, key, val) => {
    const habits = [...data.habitsKeeping];
    habits[i] = { ...habits[i], [key]: val };
    update({ ...data, habitsKeeping: habits });
  };

  const updateShawwal = (i, key, val) => {
    const days = [...data.shawwalDays];
    days[i] = { ...days[i], [key]: val };
    update({ ...data, shawwalDays: days });
  };

  const setGoal = (key, val) => update({ ...data, ninetyDayGoals: { ...data.ninetyDayGoals, [key]: val } });

  return (
    <div className="animate-fade-in">
      <div className="geo-pattern rounded-b-3xl px-5 py-8 text-white" style={{ background: 'var(--primary)' }}>
        <button onClick={() => navigate('/reflect')} className="flex items-center gap-1 text-white/70 text-sm mb-3 hover:text-white">
          <ChevronLeft size={16} /> Back
        </button>
        <p className="spaced-caps text-[var(--accent)] mb-1">Beyond Ramadan</p>
        <h1 className="text-2xl font-extrabold">Keep the Momentum</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Ramadan is over, but your transformation shouldn't be. The Prophet ﷺ said the most beloved deeds to Allah are those done consistently, even if small. Use this page to carry your Ramadan gains into the rest of the year.
        </p>

        {/* Habits */}
        <div className="card animate-fade-in-up">
          <SectionBar variant="gold" icon="✸">HABITS I'M KEEPING BEYOND RAMADAN</SectionBar>
          <div className="card-body">
            <p className="text-xs text-[var(--muted)] mb-3">Which Ramadan habits will you maintain? Be specific and realistic.</p>
            <div className="space-y-2">
              {data.habitsKeeping.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input type="checkbox" className="custom-check" checked={h.checked} onChange={(e) => updateHabit(i, 'checked', e.target.checked)} />
                  <input type="text" value={h.text} onChange={(e) => updateHabit(i, 'text', e.target.value)} placeholder={`Habit ${i + 1}`} className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6 Days of Shawwal */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <SectionBar variant="dark" icon="●">6 DAYS OF SHAWWAL</SectionBar>
          <div className="card-body">
            <p className="text-xs text-[var(--muted)] mb-3 italic">
              The Prophet ﷺ said: 'Whoever fasts Ramadan and follows it with six days of Shawwal, it is as if they fasted the entire year.' (Muslim)
            </p>
            <p className="text-sm font-bold mb-3">My 6 Shawwal Fast Days:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.shawwalDays.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" className="custom-check" checked={d.completed} onChange={(e) => updateShawwal(i, 'completed', e.target.checked)} />
                  <div className="flex-1">
                    <label className="text-xs text-[var(--muted)]">Day {i + 1}</label>
                    <input type="date" value={d.date} onChange={(e) => updateShawwal(i, 'date', e.target.value)} className="text-xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 90-Day Goals */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <SectionBar variant="gold" icon="✸">MY 90-DAY POST-RAMADAN GOALS</SectionBar>
          <div className="card-body space-y-3">
            <p className="text-xs text-[var(--muted)] mb-1">Where do you want to be 90 days from now?</p>
            {[
              { key: 'spiritual', label: 'Spiritual' },
              { key: 'health', label: 'Health' },
              { key: 'career', label: 'Career/Learning' },
              { key: 'relationships', label: 'Relationships' },
            ].map((g) => (
              <div key={g.key}>
                <label className="text-sm font-bold block mb-1">{g.label}:</label>
                <input type="text" value={data.ninetyDayGoals[g.key]} onChange={(e) => setGoal(g.key, e.target.value)} placeholder={`Your ${g.label.toLowerCase()} goal...`} />
              </div>
            ))}
          </div>
        </div>

        {/* Final Reflection */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s', borderLeft: '3px solid var(--accent)' }}>
          <div className="card-body">
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--accent)' }}>FINAL REFLECTION</h3>
            <p className="text-sm italic text-[var(--muted)] mb-2">How has this Ramadan changed me?</p>
            <textarea rows={4} value={data.finalReflection} onChange={(e) => update({ ...data, finalReflection: e.target.value })} placeholder="Reflect on your transformation..." />
          </div>
        </div>

        <p className="text-center text-sm italic font-medium" style={{ color: 'var(--accent)' }}>
          May Allah accept your Ramadan and make it a turning point in your life. Ameen.
        </p>
      </div>

      <SavedToast show={showSaved} />
      <Footer />
    </div>
  );
}
