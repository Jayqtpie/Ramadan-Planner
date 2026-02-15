import { useState, useEffect } from 'react';
import { getSetting, setSetting, exportAllData, importAllData, clearAllData } from '../lib/db';
import { shareProgress } from '../lib/shareProgress';
import { getLocation, setupLocation, clearLocation } from '../lib/prayerTimes';
import SavedToast from '../components/SavedToast';
import Footer from '../components/Footer';
import { Upload, Trash2, Info, Smartphone, FileText, Printer, Share2, HardDriveDownload, MapPin } from 'lucide-react';

const THEMES = [
  { id: 'forest', name: 'Forest', primary: '#1B4332', secondary: '#2D6A4F', bg: '#FAF8F3' },
  { id: 'rose', name: 'Rose', primary: '#5C2340', secondary: '#8B3A62', bg: '#FDF6F9' },
  { id: 'midnight', name: 'Midnight', primary: '#1A2332', secondary: '#2E4A6E', bg: '#F4F6F9' },
];

export default function Settings({ theme, onThemeChange }) {
  const [showSaved, setShowSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);

  useEffect(() => {
    getLocation().then((loc) => {
      if (loc) setLocation(loc);
      setLocationLoaded(true);
    });
  }, []);

  const handleEnableLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await setupLocation();
      setLocation(loc);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1300);
    } catch (err) {
      alert(err.message);
    }
    setLocationLoading(false);
  };

  const handleDisableLocation = async () => {
    await clearLocation();
    setLocation(null);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1300);
  };

  const changeTheme = async (id) => {
    await setSetting('theme', id);
    onThemeChange(id);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1300);
  };

  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const { generatePdf } = await import('../lib/exportPdf');
      await generatePdf();
    } catch (err) {
      console.error('PDF export error:', err);
      alert(`PDF error: ${err.message || err}`);
    }
    setExporting(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      const result = await shareProgress();
      if (result === 'copied') {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 1300);
      }
    } catch (err) {
      alert('Something went wrong. Please try again.');
      console.error(err);
    }
  };

  const handleBackup = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ramadan-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        await importAllData(data);
        const themeSetting = data.settings?.find(s => s.key === 'theme');
        if (themeSetting) onThemeChange(themeSetting.value);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 1300);
        window.location.reload();
      } catch {
        alert('Invalid backup file. Please select a valid JSON export.');
      }
    };
    input.click();
  };

  const handleReset = async () => {
    await clearAllData();
    onThemeChange('forest');
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      <div className="geo-pattern rounded-b-3xl px-5 py-9 text-center text-white" style={{ background: 'var(--primary)' }}>
        <p className="spaced-caps text-[var(--accent)] mb-1">Personalise</p>
        <h1 className="text-2xl font-extrabold">Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Theme selector */}
        <div className="card animate-fade-in-up">
          <div className="section-bar section-bar-primary">
            <span>✸</span> <span>THEME</span>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  className="rounded-xl p-3 text-center transition-all hover:scale-[1.03]"
                  style={{
                    border: theme === t.id ? `3px solid ${t.primary}` : '2px solid #E2E8F0',
                    background: t.bg,
                  }}
                >
                  <div className="flex gap-1 justify-center mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ background: t.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ background: t.secondary }} />
                    <div className="w-4 h-4 rounded-full" style={{ background: '#C8A96E' }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: t.primary }}>{t.name}</span>
                  {theme === t.id && <p className="text-[0.6rem] text-[var(--accent)] font-bold mt-1">Active</p>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prayer Times Location */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="section-bar section-bar-gold">
            <MapPin size={16} /> <span>PRAYER TIMES</span>
          </div>
          <div className="card-body">
            {!locationLoaded ? (
              <p className="text-sm text-[var(--muted)]">Loading...</p>
            ) : location ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(200,169,110,0.15)' }}>
                    <MapPin size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{location.city || 'Location set'}</p>
                    <p className="text-[0.65rem] text-[var(--muted)]">Fajr & Maghrib times will auto-fill on daily pages</p>
                  </div>
                </div>
                <button
                  onClick={handleDisableLocation}
                  className="text-xs text-[var(--muted)] underline hover:text-red-500 transition-colors"
                >
                  Remove location
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[var(--body)] leading-relaxed mb-3">
                  Enable location to automatically fill in Fajr (suhoor) and Maghrib (iftar) times on your daily pages.
                </p>
                <button
                  onClick={handleEnableLocation}
                  disabled={locationLoading}
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
                  style={{ background: 'var(--primary)' }}
                >
                  {locationLoading ? 'Getting location...' : 'Enable Prayer Times'}
                </button>
                <p className="text-[0.6rem] text-[var(--muted)] mt-2 leading-relaxed text-center">
                  Prayer times are based on your general location and may not be completely accurate. Please verify with your local masjid.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Export & Share */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="section-bar section-bar-primary">
            <span>●</span> <span>EXPORT & SHARE</span>
          </div>
          <div className="card-body space-y-3">
            <button onClick={handleExportPdf} disabled={exporting} className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-50 disabled:opacity-60" style={{ border: '1.5px solid #E2E8F0' }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              <div className="text-left flex-1">
                <span className="text-sm font-bold block">Download PDF</span>
                <span className="text-xs text-[var(--muted)]">Save your entire Ramadan journey as a beautiful PDF</span>
              </div>
              {exporting && <span className="text-xs text-[var(--muted)] animate-pulse">Creating...</span>}
            </button>
            <button onClick={handlePrint} className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-50" style={{ border: '1.5px solid #E2E8F0' }}>
              <Printer size={18} style={{ color: 'var(--primary)' }} />
              <div className="text-left">
                <span className="text-sm font-bold block">Print This Page</span>
                <span className="text-xs text-[var(--muted)]">Print or save as PDF using your browser</span>
              </div>
            </button>
            <button onClick={handleShare} className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-50" style={{ border: '1.5px solid #E2E8F0' }}>
              <Share2 size={18} style={{ color: 'var(--primary)' }} />
              <div className="text-left">
                <span className="text-sm font-bold block">Share Progress</span>
                <span className="text-xs text-[var(--muted)]">Share a summary via WhatsApp, iMessage, or other apps</span>
              </div>
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="section-bar section-bar-dark">
            <span>●</span> <span>DATA MANAGEMENT</span>
          </div>
          <div className="card-body space-y-3">
            <button onClick={handleBackup} className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-50" style={{ border: '1.5px solid #E2E8F0' }}>
              <HardDriveDownload size={18} style={{ color: 'var(--primary)' }} />
              <div className="text-left">
                <span className="text-sm font-bold block">Backup Data</span>
                <span className="text-xs text-[var(--muted)]">Download a backup file to restore later</span>
              </div>
            </button>
            <button onClick={handleImport} className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-50" style={{ border: '1.5px solid #E2E8F0' }}>
              <Upload size={18} style={{ color: 'var(--primary)' }} />
              <div className="text-left">
                <span className="text-sm font-bold block">Restore Backup</span>
                <span className="text-xs text-[var(--muted)]">Restore from a previously downloaded backup</span>
              </div>
            </button>
            <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-red-50" style={{ border: '1.5px solid #FCA5A5' }}>
              <Trash2 size={18} className="text-red-500" />
              <div className="text-left">
                <span className="text-sm font-bold block text-red-600">Reset All Data</span>
                <span className="text-xs text-[var(--muted)]">Clear all entries and start fresh</span>
              </div>
            </button>
          </div>
        </div>

        {/* Install PWA */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="section-bar section-bar-gold">
            <Smartphone size={16} /> <span>INSTALL APP</span>
          </div>
          <div className="card-body">
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              <strong>iPhone/iPad:</strong> Tap the Share button in Safari, then "Add to Home Screen."
            </p>
            <p className="text-sm text-[var(--muted)] leading-relaxed mt-2">
              <strong>Android:</strong> Tap the menu (⋮) in Chrome, then "Install app" or "Add to Home screen."
            </p>
          </div>
        </div>

        {/* About */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="section-bar section-bar-dark">
            <Info size={16} /> <span>ABOUT</span>
          </div>
          <div className="card-body text-center">
            <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>The Ramadan Reset Planner</p>
            <p className="text-xs text-[var(--muted)] mt-1">by GuidedBarakah</p>
            <p className="text-xs text-[var(--muted)] mt-1">www.guidedbarakah.com</p>
            <p className="text-[0.65rem] text-[var(--muted)] mt-2">&copy; GuidedBarakah 2026. All rights reserved.</p>
            <p className="text-xs text-[var(--muted)] mt-3 leading-relaxed">
              All data stays on your device. No server, no sync, no cloud. Your privacy is protected.
            </p>
          </div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-red-600 mb-2">Reset All Data?</h3>
            <p className="text-sm text-[var(--muted)] mb-4">Are you sure? This will delete all your entries, goals, reflections, and tracker data. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1.5px solid #E2E8F0' }}>
                Cancel
              </button>
              <button onClick={handleReset} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-red-500">
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      <SavedToast show={showSaved} />
      <Footer />
    </div>
  );
}
