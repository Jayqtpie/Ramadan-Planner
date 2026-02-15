import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const SECTIONS = [
  { id: 'weekly', label: 'Weekly Reflections', sub: '4 Jumu\'ah Reviews', icon: '✸' },
  { id: 'last10', label: 'Last 10 Nights', sub: 'Nights 21-30', icon: '☾' },
  { id: 'eid', label: 'Eid Mubarak', sub: 'Preparation & Checklist', icon: '✸' },
  { id: 'post', label: 'Post-Ramadan', sub: 'Keep the Momentum', icon: '●' },
];

export default function Reflect() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <div className="geo-pattern rounded-b-3xl px-5 py-8 text-center text-white" style={{ background: 'var(--primary)', paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))' }}>
        <p className="spaced-caps text-[var(--accent)] mb-1">Reflect & Review</p>
        <h1 className="text-2xl font-extrabold">Your Journey</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Weekly reflection links */}
        <div className="card animate-fade-in-up">
          <div className="section-bar section-bar-primary">
            <span>✸</span> <span>WEEKLY REFLECTIONS</span>
          </div>
          <div className="card-body grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((w) => (
              <button
                key={w}
                onClick={() => navigate(`/reflect/week/${w}`)}
                className="p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{ border: '1.5px solid #E2E8F0' }}
              >
                <div className="text-sm font-bold">Week {w}</div>
                <div className="text-xs text-[var(--muted)]">
                  Days {w === 4 ? '22-30' : `${(w - 1) * 7 + 1}-${w * 7}`}
                </div>
              </button>
            ))}
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
