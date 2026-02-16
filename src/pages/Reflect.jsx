import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllData } from '../lib/db';
import Footer from '../components/Footer';

export default function Reflect() {
  const navigate = useNavigate();
  const today = Math.min(Math.max(1, new Date().getDate()), 30);
  const currentWeek = Math.min(4, Math.ceil(today / 7));
  const [weeksDone, setWeeksDone] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    getAllData('weeklyReflections').then((reflections) => {
      const done = {};
      (reflections || []).forEach((r) => {
        const hasContent =
          (r.wentWell && r.wentWell.trim()) ||
          (r.needsImprovement && r.needsImprovement.trim()) ||
          (r.spiritualHighlight && r.spiritualHighlight.trim()) ||
          r.weekRating > 0;
        if (hasContent) done[r.id] = true;
      });
      setWeeksDone(done);
      setDataLoaded(true);
    });
  }, []);

  const nightsRemaining = today < 21 ? 30 - today : Math.max(0, 30 - today);
  const daysUntilLast10 = Math.max(0, 20 - today);
  const inLast10 = today >= 21;

  return (
    <div className="animate-fade-in">
      <div className="geo-pattern rounded-b-3xl px-5 py-9 text-center text-white" style={{ background: 'var(--primary)' }}>
        <p className="spaced-caps text-[var(--accent)] mb-1">Reflect & Review</p>
        <h1 className="text-2xl font-extrabold">Your Journey</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Last 10 Nights countdown/urgency banner */}
        {inLast10 ? (
          <div
            className="rounded-xl p-4 text-center animate-fade-in-up"
            style={{ background: 'rgba(200,169,110,0.12)', border: '1.5px solid var(--accent)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              ☾ The Last 10 Nights have begun
            </p>
            <p className="text-sm font-bold mt-1" style={{ color: 'var(--primary)' }}>
              {nightsRemaining > 0 ? `${nightsRemaining} night${nightsRemaining === 1 ? '' : 's'} remaining` : 'Tonight is the last night'}
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl p-3 text-center animate-fade-in-up"
            style={{ background: 'var(--card)', border: '1.5px solid #E2E8F0' }}
          >
            <p className="text-xs text-[var(--muted)]">
              <span style={{ color: 'var(--accent)' }}>☾</span> {daysUntilLast10} day{daysUntilLast10 === 1 ? '' : 's'} until the Last 10 Nights
            </p>
          </div>
        )}

        {/* Weekly reflection links */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="section-bar section-bar-primary">
            <span>✸</span> <span>WEEKLY REFLECTIONS</span>
          </div>
          <div className="card-body grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((w) => {
              const isCurrent = w === currentWeek;
              const isDone = weeksDone[`week-${w}`];
              return (
                <button
                  key={w}
                  onClick={() => navigate(`/reflect/week/${w}`)}
                  className="p-3 rounded-xl text-left transition-all hover:scale-[1.02] relative"
                  style={{
                    border: isCurrent ? '2px solid var(--accent)' : '1.5px solid #E2E8F0',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold">Week {w}</div>
                    {isDone && (
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                    )}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    Days {w === 4 ? '22-30' : `${(w - 1) * 7 + 1}-${w * 7}`}
                  </div>
                  {isCurrent && (
                    <span className="text-[0.6rem] font-bold" style={{ color: 'var(--accent)' }}>This week</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Last 10 Nights */}
        <button
          onClick={() => navigate('/reflect/last10')}
          className="card w-full text-left animate-fade-in-up hover:scale-[1.01] transition-all"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="geo-pattern p-5 text-white rounded-xl" style={{ background: 'var(--primary)' }}>
            <p className="spaced-caps text-[var(--accent)] mb-1">The Final Stretch</p>
            <h2 className="text-xl font-extrabold mb-1">The Last 10 Nights</h2>
            <p className="text-white/60 text-xs">Where the Greatest Rewards Await</p>
            <div className="text-2xl mt-2 text-[var(--accent)]">☾</div>
          </div>
        </button>

        {/* Eid */}
        <button
          onClick={() => navigate('/reflect/eid')}
          className="card w-full text-left animate-fade-in-up hover:scale-[1.01] transition-all"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="p-5" style={{ background: 'linear-gradient(135deg, var(--accent), var(--olive-gold))' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✸</span>
              <span className="spaced-caps text-white/80">Preparation Checklist</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Eid Mubarak</h2>
          </div>
        </button>

        {/* Post-Ramadan */}
        <button
          onClick={() => navigate('/reflect/post')}
          className="card w-full text-left animate-fade-in-up hover:scale-[1.01] transition-all"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="section-bar section-bar-dark">
            <span>●</span> <span>BEYOND RAMADAN</span>
          </div>
          <div className="card-body">
            <h2 className="text-lg font-bold">Keep the Momentum</h2>
            <p className="text-xs text-[var(--muted)]">Carry your Ramadan gains into the rest of the year</p>
          </div>
        </button>
      </div>
      <Footer />
    </div>
  );
}
