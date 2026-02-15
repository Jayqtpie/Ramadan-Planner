import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getSetting, setSetting } from './lib/db';
import { Home as HomeIcon, BookOpen, BookMarked, Moon, Settings as SettingsIcon, Lock } from 'lucide-react';
import unlockLogo from './assets/logo-full.png';

const Home = lazy(() => import('./pages/Home'));
const Niyyah = lazy(() => import('./pages/Niyyah'));
const Goals = lazy(() => import('./pages/Goals'));
const DailyPage = lazy(() => import('./pages/DailyPage'));
const QuranTracker = lazy(() => import('./pages/QuranTracker'));
const Reflect = lazy(() => import('./pages/Reflect'));
const WeeklyReflection = lazy(() => import('./pages/WeeklyReflection'));
const LastTenNights = lazy(() => import('./pages/LastTenNights'));
const EidChecklist = lazy(() => import('./pages/EidChecklist'));
const PostRamadan = lazy(() => import('./pages/PostRamadan'));
const SettingsPage = lazy(() => import('./pages/Settings'));

/**
 * Unique code validation system.
 * Codes follow the format: GB-XXXX-XXXX (e.g. GB-7K3M-9P2N)
 * Each code is validated by checking that its characters produce
 * a valid checksum when combined with a secret key.
 *
 * To generate codes, use: node scripts/generate-codes.js <count>
 */
const SECRET_KEY = 'barakah2026ramadan';

// Master keys for owner/partner access (SHA-256 hashes)
const MASTER_HASHES = [
  '76ffbe2730348eec0ba3aacabdd2b14158f443a5468cf376d0ddd35e332b9210',
  'b76b0a1d0976807bc1fe02870a5f8acad8374559beae9c4a5d3c25478026a54d',
];

async function hashString(str) {
  const data = new TextEncoder().encode(str);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function validateCode(code) {
  const cleaned = code.trim().toUpperCase().replace(/\s+/g, '');
  // Accept format GB-XXXX-XXXX or GBXXXXXXXX
  const match = cleaned.match(/^GB-?([A-Z0-9]{4})-?([A-Z0-9]{4})$/);
  if (!match) return false;

  const body = match[1] + match[2]; // 8 chars
  const payload = body.slice(0, 6);
  const check = body.slice(6, 8);

  // Compute checksum from payload + secret
  let hash = 0;
  const str = payload + SECRET_KEY;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I, O (avoid confusion)
  const c1 = chars[Math.abs(hash) % chars.length];
  const c2 = chars[Math.abs(hash >> 8) % chars.length];

  return check === c1 + c2;
}

async function isMasterKey(code) {
  const hash = await hashString(code.trim());
  return MASTER_HASHES.includes(hash);
}

function UnlockScreen({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError('');

    const master = await isMasterKey(code);
    if (master || validateCode(code)) {
      await setSetting('unlocked', true);
      await setSetting('unlockCode', master ? 'MASTER' : code.trim().toUpperCase());
      onUnlock();
    } else {
      setError('Invalid code. Please check your order confirmation email.');
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg, #FAF8F3)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <img src={unlockLogo} alt="GuidedBarakah" className="w-40 mx-auto mb-6 object-contain" />
          <p className="spaced-caps text-[var(--accent)] mb-2">The Ramadan Reset Planner</p>
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--primary)' }}>Welcome</h1>
          <p className="text-[var(--muted)] text-sm">Enter your unique code to unlock</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              placeholder="GB-XXXX-XXXX"
              autoFocus
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck="false"
              className="w-full py-3 pl-10 pr-4 rounded-xl text-sm font-mono font-bold tracking-wider text-center"
              style={{ background: 'white', color: 'var(--primary)', border: error ? '2px solid #FCA5A5' : '2px solid #E2E8F0' }}
            />
          </div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={checking || !code.trim()}
            className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-all"
            style={{ background: 'var(--primary)' }}
          >
            {checking ? 'Verifying...' : 'Unlock Planner'}
          </button>
        </form>
        <p className="text-[var(--muted)] text-[0.65rem] text-center mt-6 leading-relaxed">
          Your unique code was included in your order confirmation email. If you can't find it, contact us at support@guidedbarakah.com
        </p>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 rounded-full border-3 border-[var(--accent)] border-t-transparent animate-spin" style={{ borderWidth: '3px' }} />
    </div>
  );
}

const NAV_ITEMS = [
  { path: '/', icon: HomeIcon, label: 'Home', match: ['/'] },
  { path: '/daily/1', icon: BookOpen, label: 'Daily', match: ['/daily'] },
  { path: '/tracker', icon: BookMarked, label: 'Tracker', match: ['/tracker'] },
  { path: '/reflect', icon: Moon, label: 'Reflect', match: ['/reflect'] },
  { path: '/settings', icon: SettingsIcon, label: 'Settings', match: ['/settings'] },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const active = item.match.some(
          (m) => m === '/' ? location.pathname === '/' : location.pathname.startsWith(m)
        );
        return (
          <button
            key={item.path}
            className={active ? 'active' : ''}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent({ theme, setTheme }) {
  return (
    <>
      <ScrollToTop />
      <div className="pb-20 min-h-[100dvh]">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/niyyah" element={<Niyyah />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/daily/:day" element={<DailyPage />} />
            <Route path="/tracker" element={<QuranTracker />} />
            <Route path="/reflect" element={<Reflect />} />
            <Route path="/reflect/week/:week" element={<WeeklyReflection />} />
            <Route path="/reflect/last10" element={<LastTenNights />} />
            <Route path="/reflect/eid" element={<EidChecklist />} />
            <Route path="/reflect/post" element={<PostRamadan />} />
            <Route path="/settings" element={<SettingsPage theme={theme} onThemeChange={setTheme} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
      <BottomNav />
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState('forest');
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    Promise.all([
      getSetting('theme'),
      getSetting('unlocked'),
    ]).then(([t, u]) => {
      if (t) setTheme(t);
      if (u) setUnlocked(true);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!ready) return <Loader />;

  if (!unlocked) {
    return <UnlockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <BrowserRouter>
      <AppContent theme={theme} setTheme={setTheme} />
    </BrowserRouter>
  );
}
