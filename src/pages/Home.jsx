import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getLocation, setupLocation } from '../lib/prayerTimes';
import { getData, getAllData } from '../lib/db';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';
import { MapPin, ChevronDown } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const today = Math.min(Math.max(1, new Date().getDate()), 30);
  const [location, setLocation] = useState(null);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [hasNiyyah, setHasNiyyah] = useState(null);
  const [daysLogged, setDaysLogged] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [howToOpen, setHowToOpen] = useState(null);

  useEffect(() => {
    getLocation().then((loc) => {
      if (loc) setLocation(loc);
      setLocationLoaded(true);
    });

    // Load niyyah and daily pages data
    Promise.all([
      getData('niyyah', 'niyyah'),
      getAllData('dailyPages'),
    ]).then(([niyyah, dailyPages]) => {
      // Check if niyyah has meaningful content
      const niyyahExists = niyyah && (
        (niyyah.intention && niyyah.intention.trim()) ||
        (niyyah.dua && niyyah.dua.trim())
      );
      setHasNiyyah(!!niyyahExists);

      // Count days with meaningful content
      const logged = (dailyPages || []).filter((page) => {
        if (page.muhasabahResponse && page.muhasabahResponse.trim()) return true;
        if (page.todaysNiyyah && page.todaysNiyyah.trim()) return true;
        if (page.salah && page.salah.some((s) => s.done)) return true;
        return false;
      }).length;
      setDaysLogged(logged);
      setHowToOpen(logged === 0);
      setDataLoaded(true);
    });
  }, []);

  const handleEnableLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await setupLocation();
      setLocation(loc);
    } catch (err) {
      alert(err.message);
    }
    setLocationLoading(false);
  };

  const isReturningUser = dataLoaded && daysLogged > 0;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="geo-pattern rounded-b-3xl px-5 py-10 text-center text-white" style={{ background: 'var(--primary)' }}>
        <p className="spaced-caps text-[var(--accent)] mb-2">The Ramadan Reset Planner</p>
        {isReturningUser ? (
          <>
            <h1 className="text-3xl font-extrabold mb-1">Ramadan Mubarak</h1>
            <p className="text-white/70 text-sm">Day {today} of 30</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold mb-1">Welcome</h1>
            <p className="text-white/70 text-sm">by GuidedBarakah</p>
          </>
        )}
        <img src={logo} alt="GuidedBarakah" className="w-20 h-20 mx-auto mt-4 object-contain" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Location prompt — shown early for first-time users */}
        {locationLoaded && !location && (
          <div className="card animate-fade-in-up">
            <div className="card-body text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(200,169,110,0.15)' }}>
                <MapPin size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--primary)' }}>Auto-fill Prayer Times</p>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">
                Enable location to automatically fill Fajr and Maghrib times on your daily pages.
              </p>
              <button
                onClick={handleEnableLocation}
                disabled={locationLoading}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
                style={{ background: 'var(--accent)' }}
              >
                {locationLoading ? 'Getting location...' : 'Enable Prayer Times'}
              </button>
              <p className="text-[0.6rem] text-[var(--muted)] mt-2 leading-relaxed">
                Prayer times are based on your general location and may not be completely accurate. Please verify with your local masjid.
              </p>
            </div>
          </div>
        )}

        <div className="animate-fade-in-up card card-body">
          <p className="text-[var(--body)] leading-relaxed mb-4">
            <span className="font-bold text-[var(--primary)]">Assalamu alaikum,</span>
          </p>
          <p className="text-sm leading-relaxed text-[var(--body)]">
            If you're reading this planner, it means you're serious about making this Ramadan count. You're not just planning to fast — you're planning to transform.
          </p>
          <p className="text-sm leading-relaxed text-[var(--body)] mt-3">
            This planner was designed to give you structure without rigidity, accountability without guilt, and a system that works with your faith — not against it. Every page is built around the rhythms of Ramadan: the pre-dawn quiet of suhoor, the five daily prayers that anchor your day, the communal breaking of fast, and the deep worship of the night.
          </p>
        </div>

        {/* Progress indicator — only shown for returning users */}
        {isReturningUser && (
          <div className="animate-fade-in-up card card-body" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>Day {today} of 30</span>
              <span className="text-xs text-[var(--muted)]">{daysLogged} {daysLogged === 1 ? 'day' : 'days'} logged</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.round((daysLogged / 30) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Collapsible How to Use */}
        <div className="animate-fade-in-up card" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setHowToOpen(!howToOpen)}
            className="section-bar section-bar-primary w-full justify-between cursor-pointer border-none text-left"
            type="button"
          >
            <div className="flex items-center gap-2">
              <span>✸</span>
              <span>HOW TO USE THIS PLANNER</span>
            </div>
            <ChevronDown
              size={18}
              className="transition-transform duration-200"
              style={{ transform: howToOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          {howToOpen && (
            <div className="card-body space-y-3">
              {[
                { n: 1, title: 'Begin with Intention', desc: 'Start on the Niyyah page. Write your deepest intentions for this Ramadan before Day 1 begins.' },
                { n: 2, title: 'Set Your Goals', desc: 'Use the Goals page to define what success looks like across four dimensions: spiritual, personal, charitable, and social.' },
                { n: 3, title: 'Track Daily', desc: 'Each of the 30 daily pages gives you space to plan your day, track your worship, log your meals, and reflect each night.' },
                { n: 4, title: 'Reflect Weekly', desc: 'Every Friday, use the Weekly Reflection page for your Jumu\'ah review.' },
                { n: 5, title: 'Intensify the Last 10', desc: 'The special Last 10 Nights section helps you plan your most focused worship.' },
                { n: 6, title: 'Carry It Forward', desc: 'After Eid, the Post-Ramadan page ensures your transformation doesn\'t end with the month.' },
              ].map((step) => (
                <div key={step.n} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--primary)' }}>
                    {step.n}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-[var(--body)]">{step.title}</span>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hadith-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm leading-relaxed">
            "Whoever fasts Ramadan out of sincere faith and hoping for reward from Allah, all his previous sins will be forgiven."
          </p>
          <p className="text-xs text-[var(--muted)] mt-2 not-italic">— Prophet Muhammad ﷺ (Bukhari & Muslim)</p>
        </div>

        <p className="text-center text-[var(--accent)] font-bold text-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Let's begin. Bismillah.
        </p>

        {/* CTA buttons — conditional on niyyah status */}
        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          {dataLoaded && hasNiyyah === false ? (
            <>
              <p className="text-xs text-center text-[var(--muted)] italic">
                Set your intention before Day 1 — it's the foundation of everything.
              </p>
              <button
                onClick={() => navigate('/niyyah')}
                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: 'var(--accent)' }}
              >
                Set Your Niyyah ✦
              </button>
              <button
                onClick={() => navigate(`/daily/${today}`)}
                className="w-full py-3 rounded-xl font-bold text-sm border-2"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                Go to Today's Page →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate(`/daily/${today}`)}
                className="w-full py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: 'var(--primary)' }}
              >
                Go to Today's Page →
              </button>
              {dataLoaded && hasNiyyah && (
                <button
                  onClick={() => navigate('/niyyah')}
                  className="text-sm font-medium py-1"
                  style={{ color: 'var(--muted)' }}
                >
                  Review My Niyyah →
                </button>
              )}
              {!dataLoaded && (
                <button
                  onClick={() => navigate('/niyyah')}
                  className="w-full py-3 rounded-xl font-bold text-sm border-2"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                >
                  Start with My Niyyah
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
