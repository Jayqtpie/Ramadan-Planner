import { useAutoSave } from '../hooks/useAutoSave';
import { getDefaultEidChecklist, EID_BEFORE, EID_DAY } from '../lib/data';
import { useNavigate } from 'react-router-dom';
import SectionBar from '../components/SectionBar';
import SavedToast from '../components/SavedToast';
import Footer from '../components/Footer';
import { ChevronLeft } from 'lucide-react';

export default function EidChecklist() {
  const navigate = useNavigate();
  const { data, update, loaded, showSaved } = useAutoSave('eidChecklist', 'eid', getDefaultEidChecklist);

  if (!loaded || !data) return <div className="p-8 text-center text-[var(--muted)]">Loading...</div>;

  const toggleBefore = (i) => update({ ...data, beforeEid: { ...data.beforeEid, [`item${i}`]: !data.beforeEid[`item${i}`] } });
  const toggleDay = (i) => update({ ...data, eidDay: { ...data.eidDay, [`item${i}`]: !data.eidDay[`item${i}`] } });
  const updateGift = (i, key, val) => {
    const gifts = [...data.gifts];
    gifts[i] = { ...gifts[i], [key]: val };
    update({ ...data, gifts });
  };

  return (
    <div className="animate-fade-in">
      <div className="geo-pattern rounded-b-3xl px-5 py-8 text-white" style={{ background: 'var(--primary)' }}>
        <button onClick={() => navigate('/reflect')} className="flex items-center gap-1 text-white/70 text-sm mb-3 hover:text-white">
          <ChevronLeft size={16} /> Back
        </button>
        <p className="spaced-caps text-[var(--accent)] mb-1">Preparation Checklist</p>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">Eid Mubarak <span>✸</span></h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Before Eid */}
        <div className="card animate-fade-in-up">
          <SectionBar variant="gold" icon="✸">BEFORE EID DAY</SectionBar>
          <div className="card-body space-y-2">
            {EID_BEFORE.map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer py-0.5">
                <input type="checkbox" className="custom-check" checked={data.beforeEid[`item${i}`] || false} onChange={() => toggleBefore(i)} />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Eid Day */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <SectionBar variant="dark" icon="●">EID DAY</SectionBar>
          <div className="card-body space-y-2">
            {EID_DAY.map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer py-0.5">
                <input type="checkbox" className="custom-check" checked={data.eidDay[`item${i}`] || false} onChange={() => toggleDay(i)} />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gifts */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <SectionBar variant="gold" icon="✸">EID GIFTS & BUDGET</SectionBar>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[var(--muted)] uppercase tracking-wider">
                    <th className="text-left py-2 pr-2">Person</th>
                    <th className="text-left py-2 pr-2">Gift Idea</th>
                    <th className="text-left py-2 pr-2">Budget</th>
                    <th className="text-center py-2">Done</th>
                  </tr>
                </thead>
                <tbody>
                  {data.gifts.map((gift, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-2 pr-2">
                        <input type="text" value={gift.person} onChange={(e) => updateGift(i, 'person', e.target.value)} placeholder="Name" className="text-xs" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="text" value={gift.giftIdea} onChange={(e) => updateGift(i, 'giftIdea', e.target.value)} placeholder="Gift" className="text-xs" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="text" value={gift.budget} onChange={(e) => updateGift(i, 'budget', e.target.value)} placeholder="£" className="text-xs" />
                      </td>
                      <td className="py-2 text-center">
                        <input type="checkbox" className="custom-check" checked={gift.done} onChange={(e) => updateGift(i, 'done', e.target.checked)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div className="p-5 rounded-xl text-center animate-fade-in-up" style={{ animationDelay: '0.2s', background: 'rgba(200,169,110,0.1)', border: '1px solid var(--accent)' }}>
          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--primary)' }}>
            Taqabbal Allahu minna wa minkum — May Allah accept from us and from you.
          </p>
          <p className="text-sm font-bold mt-2" style={{ color: 'var(--accent)' }}>Eid Mubarak to you and your loved ones.</p>
        </div>
      </div>

      <SavedToast show={showSaved} />
      <Footer />
    </div>
  );
}
