import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';

export default function Home() {
  const navigate = useNavigate();
  const today = Math.min(Math.max(1, new Date().getDate()), 30);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="geo-pattern rounded-b-3xl px-5 py-10 text-center text-white" style={{ background: 'var(--primary)' }}>
        <p className="spaced-caps text-[var(--accent)] mb-2">The Ramadan Reset Planner</p>
        <h1 className="text-3xl font-extrabold mb-1">Welcome</h1>
        <p className="text-white/70 text-sm">by GuidedBarakah</p>
        <img src={logo} alt="GuidedBarakah" className="w-20 h-20 mx-auto mt-4 object-contain" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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

        <div className="animate-fade-in-up card" style={{ animationDelay: '0.1s' }}>
          <div className="section-bar section-bar-primary">
            <span>✸</span>
            <span>HOW TO USE THIS PLANNER</span>
          </div>
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

        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={() => navigate(`/daily/${today}`)}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: 'var(--primary)' }}
          >
            Go to Today's Page →
          </button>
          <button
            onClick={() => navigate('/niyyah')}
            className="w-full py-3 rounded-xl font-bold text-sm border-2"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            Start with My Niyyah
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
