import { useAutoSave } from '../hooks/useAutoSave';
import { getDefaultQuranTracker, JUZ_DATA } from '../lib/data';
import SavedToast from '../components/SavedToast';
import Footer from '../components/Footer';

export default function QuranTracker() {
  const { data, update, loaded, showSaved } = useAutoSave('quranTracker', 'quran', getDefaultQuranTracker);

  if (!loaded || !data) return <div className="p-8 text-center text-[var(--muted)]">Loading...</div>;

  const completed = data.juz.filter((j) => j.completed).length;
  const pct = Math.round((completed / 30) * 100);

  const toggleJuz = (num) => {
    const juz = data.juz.map((j) => j.number === num ? { ...j, completed: !j.completed } : j);
    update({ ...data, juz });
  };

  return (
    <div className="animate-fade-in">
      <div className="geo-pattern rounded-b-3xl px-5 py-8 text-center text-white" style={{ background: 'var(--primary)', paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
        <p className="spaced-caps text-[var(--accent)] mb-1">Quran Tracker</p>
        <h1 className="text-2xl font-extrabold">Khatm Completion Plan</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <p className="text-sm text-[var(--muted)]">
          Track your progress through the Quran. Check each Juz as you complete it.
        </p>

        {/* Progress */}
        <div className="card card-body animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">{completed}/30 Juz completed</span>
            <span className="text-sm font-bold text-[var(--accent)]">{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {JUZ_DATA.map((juz, i) => {
            const done = data.juz[i]?.completed;
            return (
              <button
                key={juz.num}
                onClick={() => toggleJuz(juz.num)}
                className="card text-left transition-all duration-200 animate-fade-in-up hover:scale-[1.02]"
                style={{
                  animationDelay: `${i * 0.02}s`,
                  borderLeft: done ? '3px solid var(--accent)' : '3px solid transparent',
                  opacity: done ? 1 : 0.85,
                }}
              >
                <div className="p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: done ? 'var(--accent)' : 'var(--primary)' }}
                    >
                      {juz.num}
                    </span>
                    {done && <span className="text-[var(--accent)] text-sm">✓</span>}
                  </div>
                  <p className="text-[0.65rem] text-[var(--muted)] leading-tight mt-1">{juz.surahs}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <SavedToast show={showSaved} />
      <Footer />
    </div>
  );
}
