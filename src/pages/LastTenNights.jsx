import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutoSave } from '../hooks/useAutoSave';
import { getAllData } from '../lib/db';
import { useRamadanDay } from '../hooks/useRamadanDay';
import { getDefaultLastTenNight, LAST_TEN_DUAS } from '../lib/data';
import SectionBar from '../components/SectionBar';
import SavedToast from '../components/SavedToast';
import Footer from '../components/Footer';
import { ChevronLeft } from 'lucide-react';

const WORSHIP_ITEMS = [
  { key: 'ishaInCongregation', label: 'Prayed Isha in congregation' },
  { key: 'fullTaraweeh', label: 'Prayed full Taraweeh' },
  { key: 'tahajjud', label: 'Prayed Tahajjud / Qiyam al-Layl' },
  { key: 'lengthyDua', label: 'Made lengthy dua' },
  { key: 'readQuran', label: 'Read Quran' },
  { key: 'gaveCharity', label: 'Gave charity / sadaqah' },
  { key: 'istighfar100', label: 'Made istighfar (100+ times)' },
  { key: 'surahAlQadr', label: 'Recited Surah Al-Qadr' },
];

function hasNightContent(nightData) {
  if (!nightData) return false;
  const wc = nightData.worshipChecklist || {};
  const anyChecked = Object.entries(wc).some(([k, v]) => k !== 'quranJuz' && v === true);
  if (anyChecked) return true;
  if (nightData.personalDuas && nightData.personalDuas.trim()) return true;
  if (nightData.reflection && nightData.reflection.trim()) return true;
  return false;
}

function NightCard({ night }) {
  const isOdd = night % 2 === 1;
  const { data, update, loaded, showSaved } = useAutoSave('lastTenNights', `night-${night}`, () => getDefaultLastTenNight(night));
  const dua = LAST_TEN_DUAS[night];

  if (!loaded || !data) return <div className="p-4 text-center text-[var(--muted)] text-sm">Loading...</div>;

  const setChecklist = (key, val) => update({ ...data, worshipChecklist: { ...data.worshipChecklist, [key]: val } });
  const set = (field, val) => update({ ...data, [field]: val });

  return (
    <div className="card">
      <div className="section-bar section-bar-primary">
        <span>Night {night} of Ramadan</span>
        {isOdd && <span className="ml-auto text-xs text-[var(--accent)] font-bold">ODD NIGHT</span>}
      </div>
      {isOdd && (
        <div className="px-3 py-1 text-[0.65rem] font-bold text-[var(--accent)] tracking-wider uppercase" style={{ background: 'rgba(200,169,110,0.1)' }}>
          Potential Laylatul Qadr
        </div>
      )}
      <div className="card-body space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--muted)]">Date:</label>
          <input type="date" value={data.date} onChange={(e) => set('date', e.target.value)} className="!w-auto text-xs" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Worship Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Worship Checklist</h4>
            <div className="space-y-1.5">
              {WORSHIP_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="custom-check"
                    checked={data.worshipChecklist[item.key] || false}
                    onChange={(e) => setChecklist(item.key, e.target.checked)}
                    aria-label={item.label}
                  />
                  <span className="text-xs">{item.label}</span>
                  {item.key === 'readQuran' && (
                    <input
                      type="text"
                      value={data.worshipChecklist.quranJuz || ''}
                      onChange={(e) => setChecklist('quranJuz', e.target.value)}
                      placeholder="Juz"
                      className="!w-16 text-xs ml-auto"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dua Focus */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Tonight's Dua Focus</h4>
            <div className="p-3 rounded-lg mb-3" style={{ background: 'rgba(200,169,110,0.1)', borderLeft: '3px solid var(--accent)' }}>
              <p className="text-xs italic font-medium" style={{ color: 'var(--primary)' }}>"{dua.arabic}"</p>
              <p className="text-xs text-[var(--muted)] mt-1">{dua.english}</p>
            </div>
            <label className="text-xs text-[var(--muted)] block mb-1">Personal duas for tonight:</label>
            <textarea rows={3} value={data.personalDuas} onChange={(e) => set('personalDuas', e.target.value)} placeholder="Your duas..." />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">Reflection</label>
          <textarea rows={2} value={data.reflection} onChange={(e) => set('reflection', e.target.value)} placeholder="How did tonight feel spiritually?" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">Notes</label>
          <textarea rows={2} value={data.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Additional notes..." />
        </div>
      </div>
      <SavedToast show={showSaved} />
    </div>
  );
}

export default function LastTenNights() {
  const navigate = useNavigate();
  const { today } = useRamadanDay();
  const tonightNight = today >= 21 && today <= 30 ? today : null;
  const [selectedNight, setSelectedNight] = useState(tonightNight);
  const [trackedNights, setTrackedNights] = useState({});

  useEffect(() => {
    getAllData('lastTenNights').then((nights) => {
      const tracked = {};
      (nights || []).forEach((n) => {
        if (hasNightContent(n)) tracked[n.id] = true;
      });
      setTrackedNights(tracked);
    });
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Intro */}
      <div className="geo-pattern rounded-b-3xl px-5 py-10 text-center text-white" style={{ background: 'var(--primary)' }}>
        <button onClick={() => navigate('/reflect')} className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white">
          <ChevronLeft size={16} /> Back
        </button>
        <p className="spaced-caps text-[var(--accent)] mb-2">The Final Stretch</p>
        <h1 className="text-3xl font-extrabold mb-2">The Last 10 Nights</h1>
        <p className="text-white/70 text-sm">Where the Greatest Rewards Await</p>
        <div className="text-4xl mt-4 text-[var(--accent)]">☾</div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="hadith-block">
          <p className="text-sm leading-relaxed italic">
            "The Prophet ﷺ used to strive more in worship during the last ten days of Ramadan than at any other time."
          </p>
          <p className="text-xs text-[var(--muted)] mt-2 not-italic">— Sahih Muslim</p>
        </div>

        {/* Laylatul Qadr dua — always visible */}
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(200,169,110,0.12)', border: '1.5px solid var(--accent)' }}
        >
          <p className="text-[0.65rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
            The Dua for Laylatul Qadr
          </p>
          <p className="text-sm font-medium italic" style={{ color: 'var(--primary)' }}>
            "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni"
          </p>
          <p className="text-xs text-[var(--muted)] mt-1.5">
            Oh Allah, You are the most forgiving and You love forgiveness; so forgive me.
          </p>
          <p className="text-[0.6rem] text-[var(--muted)] mt-1.5 not-italic">— Tirmidhi</p>
        </div>

        <div className="text-center text-sm text-[var(--muted)] leading-relaxed">
          <p>Laylatul Qadr — the Night of Decree — is better than 1,000 months.</p>
          <p className="mt-1">It falls on one of the odd nights: 21st, 23rd, 25th, 27th, or 29th.</p>
          <p className="text-[var(--accent)] font-bold mt-3">Give these nights everything.</p>
        </div>

        {/* Night selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: 10 }, (_, i) => i + 21).map((n) => {
            const isOdd = n % 2 === 1;
            const isTracked = trackedNights[`night-${n}`];
            const isTonight = n === tonightNight;
            return (
              <button
                key={n}
                onClick={() => setSelectedNight(selectedNight === n ? null : n)}
                className="px-3 py-2 rounded-lg text-sm font-bold transition-all relative"
                style={{
                  background: selectedNight === n ? 'var(--primary)' : isOdd ? 'rgba(200,169,110,0.15)' : 'var(--card)',
                  color: selectedNight === n ? '#fff' : 'var(--body)',
                  border: isOdd && selectedNight !== n ? '1.5px solid var(--accent)' : '1.5px solid #E2E8F0',
                }}
              >
                {n}
                {isOdd && selectedNight !== n && <span className="text-[0.6rem] block text-[var(--accent)]">odd</span>}
                {isOdd && selectedNight === n && <span className="text-[0.6rem] block text-[var(--accent)]">odd</span>}
                {isTracked && (
                  <div
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
                {isTonight && !isTracked && (
                  <div
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                    style={{ background: 'var(--primary)', border: '1px solid white' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected night */}
        {selectedNight && (
          <div className="animate-fade-in-up">
            <NightCard night={selectedNight} />
          </div>
        )}

        {/* If none selected */}
        {!selectedNight && (
          <p className="text-center text-xs text-[var(--muted)]">Select a night above to track your worship.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
