import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getSetting } from './lib/db';
import { Home as HomeIcon, BookOpen, BookMarked, Moon, Settings as SettingsIcon } from 'lucide-react';

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

  useEffect(() => {
    getSetting('theme').then((t) => {
      if (t) setTheme(t);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!ready) return <Loader />;

  return (
    <BrowserRouter>
      <AppContent theme={theme} setTheme={setTheme} />
    </BrowserRouter>
  );
}
