import { useAutoSave } from '../hooks/useAutoSave';
import { getDefaultNiyyah } from '../lib/data';
import SectionBar from '../components/SectionBar';
import SavedToast from '../components/SavedToast';
import Footer from '../components/Footer';

export default function Niyyah() {
  const { data, update, loaded, showSaved } = useAutoSave('niyyah', 'niyyah', getDefaultNiyyah);

  if (!loaded || !data) return <div className="p-8 text-center text-[var(--muted)]">Loading...</div>;

  const updateField = (field, value) => update({ ...data, [field]: value });
  const updateHabit = (i, key, val) => {
    const habits = [...data.habitsToBuild];
    habits[i] = { ...habits[i], [key]: val };
    update({ ...data, habitsToBuild: habits });
  };

  return (
    <div className="animate-fade-in">
      <div className="geo-pattern rounded-b-3xl px-5 py-8 text-center text-white" style={{ background: 'var(--primary)' }}>
        <p className="spaced-caps text-[var(--accent)] mb-1">Pre-Ramadan Preparation</p>
        <h1 className="text-2xl font-extrabold">My Niyyah</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          The Prophet ﷺ said: <em>'Actions are judged by intentions.'</em> Before Ramadan begins, clarify why you are fasting, what you hope to gain, and who you want to become by Eid.
        </p>

        {/* Why am I fasting */}
        <div className="card animate-fade-in-up">
          <SectionBar variant="primary">WHY AM I FASTING THIS RAMADAN?</SectionBar>
          <div className="card-body">
            <p className="text-xs text-[var(--muted)] mb-2">Beyond obligation — what do you personally want from this month?</p>
            <textarea
              rows={4}
              value={data.whyFasting}
              onChange={(e) => updateField('whyFasting', e.target.value)}
              placeholder="Write your intention..."
            />
          </div>
        </div>

        {/* Habits */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <SectionBar variant="gold" icon="✸">HABITS I WANT TO BUILD</SectionBar>
          <div className="card-body">
            <p className="text-xs text-[var(--muted)] mb-3">List 3-5 specific habits you will commit to this Ramadan:</p>
            <div className="space-y-2">
              {data.habitsToBuild.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="custom-check"
                    checked={h.checked}
                    onChange={(e) => updateHabit(i, 'checked', e.target.checked)}
                    aria-label={`Habit ${i + 1} complete`}
                  />
                  <input
                    type="text"
                    value={h.text}
                    onChange={(e) => updateHabit(i, 'text', e.target.value)}
                    placeholder={`Habit ${i + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leave behind */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <SectionBar variant="dark" icon="●">WHAT I WANT TO LEAVE BEHIND</SectionBar>
          <div className="card-body">
            <p className="text-xs text-[var(--muted)] mb-2">Bad habits, negative patterns, or sins I am committing to removing:</p>
            <textarea
              rows={3}
              value={data.leaveBehind}
              onChange={(e) => updateField('leaveBehind', e.target.value)}
              placeholder="Write what you want to let go of..."
            />
          </div>
        </div>

        {/* Dua */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <SectionBar variant="gold" icon="✸">MY DUA FOR THIS RAMADAN</SectionBar>
          <div className="card-body">
            <p className="text-xs text-[var(--muted)] mb-2">Write a personal dua — what are you asking Allah for this Ramadan?</p>
            <textarea
              rows={4}
              value={data.personalDua}
              onChange={(e) => updateField('personalDua', e.target.value)}
              placeholder="O Allah..."
            />
          </div>
        </div>
      </div>

      <SavedToast show={showSaved} />
      <Footer />
    </div>
  );
}
