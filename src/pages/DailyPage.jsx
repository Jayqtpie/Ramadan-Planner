import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import { getDefaultDailyPage, HADITHS, MUHASABAH } from '../lib/data';
import { getPrayerTimesForDay } from '../lib/prayerTimes';
import { getSetting, setSetting } from '../lib/db';
import SectionBar from '../components/SectionBar';
import StarRating from '../components/StarRating';
import SavedToast from '../components/SavedToast';
import Footer from '../components/Footer';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
  { key: 'taraweeh', label: 'Taraweeh' },
  { key: 'tahajjud', label: 'Tahajjud' },
];

const GOOD_DEEDS = [
  { key: 'sadaqah', label: 'Gave sadaqah / charity' },
  { key: 'helpedSomeone', label: 'Helped someone in need' },
  { key: 'extraDhikr', label: 'Extra dhikr / wird' },
  { key: 'learnedIslamic', label: 'Learned something Islamic' },
  { key: 'duaForOthers', label: 'Made dua for others' },
  { key: 'custom', label: '' },
];

export default function DailyPage() {
  const { day: dayParam } = useParams();
  const day = Math.min(30, Math.max(1, parseInt(dayParam) || 1));
  const navigate = useNavigate();
  const { data, update, loaded, showSaved } = useAutoSave('dailyPages', `day-${day}`, () => getDefaultDailyPage(day));

  const [prayerTimes, setPrayerTimes] = useState(null);

  useEffect(() => {
    if (!loaded || !data) return;
    // Only auto-fill if both times are empty (don't overwrite manual entries)
    if (!data.mealPlanner.suhoor.time && !data.mealPlanner.iftar.time) {
      getPrayerTimesForDay(day).then((times) => {
        if (times) {
          setPrayerTimes(times);
          update({
            ...data,
            mealPlanner: {
              ...data.mealPlanner,
              suhoor: { ...data.mealPlanner.suhoor, time: times.fajr },
              iftar: { ...data.mealPlanner.iftar, time: times.maghrib },
            },
          });
        }
      });
    } else {
      setPrayerTimes(null);
    }
  }, [loaded, data?.id]);

  // Auto-fill Gregorian date from Day 1's date
  useEffect(() => {
    if (!loaded || !data || data.date) return;
    if (day === 1) return; // Day 1 is set manually by the user
    getSetting('ramadanStartDate').then((startDate) => {
      if (startDate) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + (day - 1));
        const filled = d.toISOString().split('T')[0];
        update({ ...data, date: filled });
      }
    });
  }, [loaded, data?.id]);

  if (!loaded || !data) return <div className="p-8 text-center text-[var(--muted)]">Loading...</div>;

  const hadith = HADITHS[day - 1];
  const muhasabah = MUHASABAH[day - 1];
  const laylatAlQadrNight = [20, 22, 24, 26, 28].includes(day) ? day + 1 : null;

  const set = (field, value) => update({ ...data, [field]: value });
  const setSalah = (prayer, key, val) => {
    const salahTracker = { ...data.salahTracker, [prayer]: { ...data.salahTracker[prayer], [key]: val } };
    update({ ...data, salahTracker });
  };
  const setQuran = (key, val) => update({ ...data, quranProgress: { ...data.quranProgress, [key]: val } });
  const setDeed = (key, val) => update({ ...data, goodDeeds: { ...data.goodDeeds, [key]: val } });
  const setMeal = (meal, key, val) => {
    const mp = { ...data.mealPlanner, [meal]: { ...data.mealPlanner[meal], [key]: val } };
    update({ ...data, mealPlanner: mp });
  };
  const setArr = (field, i, val) => {
    const arr = [...data[field]];
    arr[i] = val;
    update({ ...data, [field]: arr });
  };

  const handleShare = async () => {
    const salah = data.salahTracker || {};
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const done = prayers.filter(p => salah[p]?.done).length;
    const onTime = prayers.filter(p => salah[p]?.onTime === 'Y').length;
    const extras = ['taraweeh', 'tahajjud'].filter(p => salah[p]?.done).map(p => p.charAt(0).toUpperCase() + p.slice(1));
    const pages = parseInt(data.quranProgress?.pages) || 0;
    const deeds = Object.entries(data.goodDeeds || {}).filter(([, v]) => v === true).length;
    const water = data.mealPlanner?.waterIntake || 0;
    const gratitudes = (data.gratitude || []).filter(g => g);

    const lines = [
      `\u2728 Ramadan Day ${day} \u2728`,
      '',
      `\uD83D\uDD4C Prayers: ${done}/5${onTime ? ` (${onTime} on time)` : ''}`,
    ];
    if (extras.length) lines.push(`\uD83C\uDF19 ${extras.join(' + ')}`);
    if (data.khushuRating) lines.push(`\uD83D\uDE4F Khushu\': ${'⭐'.repeat(data.khushuRating)}`);
    if (pages) lines.push(`\uD83D\uDCD6 Quran: ${pages} pages`);
    if (deeds) lines.push(`\u2764\uFE0F Good deeds: ${deeds}`);
    if (water) lines.push(`\uD83D\uDCA7 Water: ${water}/8 glasses`);
    if (gratitudes.length) lines.push(`\uD83E\uDD32 Grateful for: ${gratitudes.join(', ')}`);
    lines.push('', 'Tracked with The Ramadan Reset Planner by GuidedBarakah');

    const text = lines.join('\n');
    if (navigator.share) {
      try { await navigator.share({ title: `Ramadan Day ${day}`, text }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
      } catch {
        prompt('Copy your summary:', text);
      }
    }
  };

  return (
    <div className="animate-fade-in" key={day}>
      {/* Header */}
      <div className="geo-pattern rounded-b-3xl px-5 pb-6 text-white" style={{ background: 'var(--primary)', paddingTop: 'calc(2.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="flex justify-end max-w-2xl mx-auto">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Share this day"
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>
        </div>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => day > 1 && navigate(`/daily/${day - 1}`)}
            disabled={day <= 1}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30"
            aria-label="Previous day"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] flex items-center justify-center text-xl font-extrabold mx-auto mb-1">
              {day}
            </div>
            <h1 className="text-xl font-extrabold">Day {day}</h1>
            <p className="text-white/60 text-xs">of Ramadan</p>
            {laylatAlQadrNight && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-bold tracking-wide" style={{ background: 'rgba(200,169,110,0.2)', color: 'var(--accent)', border: '1px solid rgba(200,169,110,0.4)' }}>
                <span>☾</span>
                <span>Potential Laylat al-Qadr tonight ({laylatAlQadrNight}{laylatAlQadrNight === 21 ? 'st' : laylatAlQadrNight === 23 ? 'rd' : 'th'} night)</span>
              </div>
            )}
          </div>
          <button
            onClick={() => day < 30 && navigate(`/daily/${day + 1}`)}
            disabled={day >= 30}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30"
            aria-label="Next day"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        {/* Date inputs */}
        <div className="flex gap-3 max-w-sm mx-auto mt-3">
          <input
            type="date"
            value={data.date}
            onChange={(e) => {
              set('date', e.target.value);
              if (day === 1 && e.target.value) {
                setSetting('ramadanStartDate', e.target.value);
              }
            }}
            className="flex-1 text-xs !bg-white/10 !border-white/20 !text-white placeholder:text-white/40"
          />
          <input
            type="text"
            value={data.hijriDate}
            onChange={(e) => set('hijriDate', e.target.value)}
            placeholder="Hijri date"
            className="flex-1 text-xs !bg-white/10 !border-white/20 !text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Day selector strip */}
      <div className="overflow-x-auto py-3 px-2 flex gap-1.5 border-b border-gray-100">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
          <button
            key={d}
            onClick={() => navigate(`/daily/${d}`)}
            className="flex-shrink-0 w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all"
            style={{
              background: d === day ? 'var(--primary)' : 'transparent',
              color: d === day ? '#fff' : 'var(--muted)',
              border: d === day ? 'none' : '1px solid #E2E8F0',
            }}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Today's Niyyah */}
        <div className="card">
          <div className="section-bar" style={{ background: 'var(--accent)', color: '#2D3436' }}>
            <span>✸</span> <span>TODAY'S NIYYAH (Intention)</span>
          </div>
          <div className="card-body">
            <input type="text" value={data.todaysNiyyah} onChange={(e) => set('todaysNiyyah', e.target.value)} placeholder="What is your intention for today?" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* Salah Tracker */}
            <div className="card">
              <SectionBar variant="primary" icon="✸">SALAH TRACKER</SectionBar>
              <div className="card-body space-y-2">
                {PRAYERS.map((p) => (
                  <div key={p.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="custom-check"
                      checked={data.salahTracker[p.key]?.done || false}
                      onChange={(e) => setSalah(p.key, 'done', e.target.checked)}
                      aria-label={`${p.label} completed`}
                    />
                    <span className="text-sm font-medium flex-1 min-w-0">{p.label}</span>
                    <div className="on-time-toggle">
                      <button
                        type="button"
                        className={data.salahTracker[p.key]?.onTime === 'Y' ? 'yes' : ''}
                        onClick={() => setSalah(p.key, 'onTime', data.salahTracker[p.key]?.onTime === 'Y' ? '' : 'Y')}
                      >Y</button>
                      <button
                        type="button"
                        className={data.salahTracker[p.key]?.onTime === 'N' ? 'no' : ''}
                        onClick={() => setSalah(p.key, 'onTime', data.salahTracker[p.key]?.onTime === 'N' ? '' : 'N')}
                      >N</button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100">
                  <StarRating label="Khushu':" value={data.khushuRating || 0} onChange={(v) => set('khushuRating', v)} />
                </div>
              </div>
            </div>

            {/* Quran Progress */}
            <div className="card">
              <SectionBar variant="primary">QURAN PROGRESS</SectionBar>
              <div className="card-body space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-[var(--muted)] mb-1 block">Juz</label>
                    <input type="text" value={data.quranProgress.juz} onChange={(e) => setQuran('juz', e.target.value)} placeholder="—" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[var(--muted)] mb-1 block">Surah</label>
                    <input type="text" value={data.quranProgress.surah} onChange={(e) => setQuran('surah', e.target.value)} placeholder="—" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[var(--muted)] mb-1 block">Pages</label>
                    <input type="number" value={data.quranProgress.pages} onChange={(e) => setQuran('pages', e.target.value)} placeholder="0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Good Deeds */}
            <div className="card">
              <SectionBar variant="olive">GOOD DEEDS</SectionBar>
              <div className="card-body space-y-2">
                {GOOD_DEEDS.map((d) => (
                  <div key={d.key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="custom-check"
                      checked={data.goodDeeds[d.key] || false}
                      onChange={(e) => setDeed(d.key, e.target.checked)}
                      aria-label={d.label || 'Custom deed'}
                    />
                    {d.key === 'custom' ? (
                      <input
                        type="text"
                        value={data.customDeed || ''}
                        onChange={(e) => set('customDeed', e.target.value)}
                        placeholder="Custom good deed..."
                        className="flex-1 text-sm"
                      />
                    ) : (
                      <span className="text-sm">{d.label}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            {/* Meal Planner */}
            <div className="card">
              <SectionBar variant="primary">MEAL PLANNER</SectionBar>
              <div className="card-body space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">Suhoor</span>
                    <div className="flex items-center gap-2">
                      {prayerTimes && <span className="text-[0.6rem] text-[var(--accent)]">Fajr</span>}
                      <input type="time" value={data.mealPlanner.suhoor.time} onChange={(e) => setMeal('suhoor', 'time', e.target.value)} className="!w-auto text-xs" />
                    </div>
                  </div>
                  <textarea rows={2} value={data.mealPlanner.suhoor.notes} onChange={(e) => setMeal('suhoor', 'notes', e.target.value)} placeholder="Suhoor meal notes..." />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">Iftar</span>
                    <div className="flex items-center gap-2">
                      {prayerTimes && <span className="text-[0.6rem] text-[var(--accent)]">Maghrib</span>}
                      <input type="time" value={data.mealPlanner.iftar.time} onChange={(e) => setMeal('iftar', 'time', e.target.value)} className="!w-auto text-xs" />
                    </div>
                  </div>
                  <textarea rows={2} value={data.mealPlanner.iftar.notes} onChange={(e) => setMeal('iftar', 'notes', e.target.value)} placeholder="Iftar meal notes..." />
                </div>
                <div className="rounded-lg p-3" style={{ borderLeft: '3px solid var(--accent)', background: 'linear-gradient(135deg, rgba(200,169,110,0.08), rgba(200,169,110,0.03))' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[var(--accent)]">☾</span>
                    <span className="text-[0.65rem] font-bold text-[var(--accent)] uppercase tracking-wider">Dua for Breaking Fast</span>
                  </div>
                  <p className="text-sm italic leading-relaxed text-[var(--body)]">"Dhahaba al-zama'u wabtallati al-'uruqu wa thabata al-ajru in shaa Allah."</p>
                  <p className="text-xs text-[var(--muted)] mt-1.5">Thirst is gone, the veins are moistened, and the reward is certain if Allah wills.</p>
                  <p className="text-[0.6rem] text-[var(--muted)] mt-1">— Abu Dawud, 2357</p>
                </div>
                <div>
                  <span className="text-sm font-medium mb-1 block">Water Intake</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: 8 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`water-glass ${i < (data.mealPlanner.waterIntake || 0) ? 'filled' : ''}`}
                        onClick={() => update({ ...data, mealPlanner: { ...data.mealPlanner, waterIntake: i + 1 === data.mealPlanner.waterIntake ? 0 : i + 1 } })}
                        aria-label={`${i + 1} glasses`}
                      >
                        💧
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Gratitude */}
            <div className="card">
              <SectionBar variant="secondary">ALHAMDULILLAH — GRATITUDE</SectionBar>
              <div className="card-body space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'var(--secondary)' }}>{i + 1}</span>
                    <input type="text" value={data.gratitude[i] || ''} onChange={(e) => setArr('gratitude', i, e.target.value)} placeholder={`Grateful for...`} className="flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Priorities */}
            <div className="card">
              <SectionBar variant="primary">TOP 3 PRIORITIES</SectionBar>
              <div className="card-body space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'var(--primary)' }}>{i + 1}</span>
                    <input type="text" value={data.topPriorities[i] || ''} onChange={(e) => setArr('topPriorities', i, e.target.value)} placeholder={`Priority ${i + 1}`} className="flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Hadith */}
            <div className="card" style={{ borderLeft: '3px solid var(--olive-gold)' }}>
              <div className="card-body">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[var(--accent)]">☾</span>
                  <span className="text-xs font-bold text-[var(--olive-gold)] uppercase tracking-wider">Daily Hadith</span>
                </div>
                <p className="text-sm italic leading-relaxed">"{hadith.text}"</p>
                <p className="text-xs text-[var(--muted)] mt-2">— {hadith.source}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <SectionBar variant="primary">NOTES</SectionBar>
          <div className="card-body">
            <textarea rows={5} value={data.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Write your thoughts, reminders, or reflections..." />
          </div>
        </div>

        {/* Muhasabah */}
        <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="section-bar section-bar-muhasabah">
            <span>☾</span> <span>NIGHTLY MUHASABAH</span>
          </div>
          <div className="card-body">
            <p className="text-sm italic text-[var(--body)] mb-3">"{muhasabah}"</p>
            <textarea rows={3} value={data.muhasabahResponse} onChange={(e) => set('muhasabahResponse', e.target.value)} placeholder="Your reflection..." />
          </div>
        </div>
      </div>

      <SavedToast show={showSaved} />
      <Footer />
    </div>
  );
}
