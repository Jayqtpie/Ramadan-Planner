import { useAutoSave } from '../hooks/useAutoSave';
import { getDefaultGoals } from '../lib/data';
import SectionBar from '../components/SectionBar';
import SavedToast from '../components/SavedToast';
import Footer from '../components/Footer';

const QUADRANTS = [
  { key: 'spiritual', title: 'Spiritual Goals', sub: 'Quran, prayer, dhikr, tawbah' },
  { key: 'personalGrowth', title: 'Personal Growth', sub: 'Habits, discipline, learning' },
  { key: 'charity', title: 'Charity & Service', sub: 'Sadaqah, volunteering, kindness' },
  { key: 'familyCommunity', title: 'Family & Community', sub: 'Relationships, iftar hosting, connections' },
];

const QURAN_OPTIONS = [
  { value: 'full-khatm', label: 'Complete one full Khatm (30 Juz)' },
  { value: 'specific-juz', label: 'Complete a specific number of Juz' },
  { value: 'tafsir', label: 'Read with Tafsir — focus on understanding' },
  { value: 'memorise', label: 'Memorise specific surahs' },
  { value: 'other', label: 'Other' },
];

export default function Goals() {
  const { data, update, loaded, showSaved } = useAutoSave('goals', 'goals', getDefaultGoals);

  if (!loaded || !data) return <div className="p-8 text-center text-[var(--muted)]">Loading...</div>;

  const updateGoal = (quad, i, val) => {
    const arr = [...data[quad]];
    arr[i] = val;
    update({ ...data, [quad]: arr });
  };

  const updateQuranGoal = (key, val) => update({ ...data, quranGoal: { ...data.quranGoal, [key]: val } });
  const updateCharity = (key, val) => update({ ...data, charityCommitment: { ...data.charityCommitment, [key]: val } });

  return (
    <div className="animate-fade-in">
      <div className="geo-pattern rounded-b-3xl px-5 py-8 text-center text-white" style={{ background: 'var(--primary)' }}>
        <p className="spaced-caps text-[var(--accent)] mb-1">Pre-Ramadan Preparation</p>
        <h1 className="text-2xl font-extrabold">My Ramadan Goals</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* 4 Quadrants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUADRANTS.map((q, qi) => (
            <div key={q.key} className="card animate-fade-in-up" style={{ animationDelay: `${qi * 0.05}s` }}>
              <SectionBar variant="primary">{q.title.toUpperCase()}</SectionBar>
              <div className="card-body">
                <p className="text-xs text-[var(--muted)] mb-3">{q.sub}</p>
                <div className="space-y-2">
                  {data[q.key].map((val, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--muted)] w-5">{i + 1}.</span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateGoal(q.key, i, e.target.value)}
                        placeholder={`Goal ${i + 1}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quran Goal */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <SectionBar variant="gold" icon="✸">MY QURAN GOAL FOR RAMADAN</SectionBar>
          <div className="card-body space-y-2">
            {QURAN_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-start gap-3 cursor-pointer py-1">
                <input
                  type="radio"
                  name="quranGoal"
                  checked={data.quranGoal.type === opt.value}
                  onChange={() => updateQuranGoal('type', opt.value)}
                  className="mt-0.5 accent-[var(--primary)]"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
            {(data.quranGoal.type === 'specific-juz' || data.quranGoal.type === 'memorise' || data.quranGoal.type === 'other') && (
              <input
                type="text"
                value={data.quranGoal.customValue}
                onChange={(e) => updateQuranGoal('customValue', e.target.value)}
                placeholder={data.quranGoal.type === 'specific-juz' ? 'Number of Juz' : 'Specify...'}
                className="ml-7"
                style={{ width: 'calc(100% - 1.75rem)' }}
              />
            )}
          </div>
        </div>

        {/* Charity Commitment */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <SectionBar variant="dark" icon="●">MY CHARITY COMMITMENT</SectionBar>
          <div className="card-body space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium w-40 flex-shrink-0">Total Sadaqah Budget:</label>
              <div className="flex items-center gap-1 flex-1">
                <span className="text-sm font-bold">£</span>
                <input
                  type="number"
                  value={data.charityCommitment.sadaqahBudget}
                  onChange={(e) => updateCharity('sadaqahBudget', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium w-40 flex-shrink-0">Zakat al-Fitr:</label>
              <div className="flex items-center gap-1 flex-1">
                <span className="text-sm font-bold">£</span>
                <input
                  type="number"
                  value={data.charityCommitment.zakatAlFitr}
                  onChange={(e) => updateCharity('zakatAlFitr', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium w-40 flex-shrink-0">Daily micro-charity:</label>
              <input
                type="text"
                value={data.charityCommitment.microCharity}
                onChange={(e) => updateCharity('microCharity', e.target.value)}
                placeholder="e.g. smile, help someone, give £1"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <SavedToast show={showSaved} />
      <Footer />
    </div>
  );
}
