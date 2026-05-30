// Planner.jsx — weekly planner + streak + 7-day history.
import React from 'react';
import { useStore, dayTotals, streak } from '../store/store.jsx';
import { useNav, getRecipe } from '../nav.jsx';
import { PK_DATA } from '../data/data.js';
import { PKLib } from '../lib/lib.js';
import { Icon, Thumb, Sheet } from '../components/ui.jsx';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function Planner() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const goal = state.settings.goal;
  const ws = PKLib.weekStart(state.currentDate);
  const days = DOW.map((_, i) => PKLib.addDays(ws, i));
  const [pickFor, setPickFor] = React.useState(null);
  const st = streak(state);

  // last 7 days history (protein)
  const hist = Array.from({ length: 7 }, (_, i) => { const d = PKLib.addDays(PKLib.todayISO(), -(6 - i)); return { d, p: dayTotals(state, d).protein }; });
  const histMax = Math.max(goal, ...hist.map(h => h.p), 1);

  const weekProtein = days.reduce((a, d) => a + (state.plan[d] || []).reduce((s, id) => { const r = getRecipe(id); return s + (r ? r.proteinPerServing : 0); }, 0), 0);

  const sendWeekToGrocery = () => {
    const ingMap = Object.fromEntries(PK_DATA.ingredients.map(i => [i.id, i]));
    const items = [];
    days.forEach(d => (state.plan[d] || []).forEach(id => {
      const r = getRecipe(id); if (!r) return;
      (r.ingredients || []).forEach(ref => { const ing = ingMap[ref.ingredientId] || {}; items.push({ ingredientId: ref.ingredientId, name: ing.name || ref.ingredientId, qty: ref.quantityGrams, unit: ing.defaultUnit || 'g', aisle: ing.aisle || 'pantry' }); });
    }));
    if (!items.length) { nav.notify({ msg: 'Plan some meals first', icon: 'info' }); return; }
    dispatch({ type: 'GROCERY_ADD', items });
    nav.notify({ msg: `${items.length} ingredients sent to grocery`, icon: 'cart' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '4px 16px 8px', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="num" style={{ fontSize: 26 }}>Planner</div>
        <button className="pk-press" onClick={sendWeekToGrocery} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 800, color: '#fff', background: 'var(--saffron)', padding: '9px 13px', borderRadius: 12, whiteSpace: 'nowrap', flex: '0 0 auto' }}><Icon name="cart" size={15} stroke="#fff" />Send week</button>
      </div>

      <div className="pk-scroll" style={{ flex: 1, padding: '0 16px 16px' }}>
        {/* streak + history */}
        <div style={{ background: 'var(--card)', borderRadius: 18, padding: 16, boxShadow: 'var(--shadow)', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name="flame" size={26} stroke="var(--paprika)" fill="var(--paprika)" />
              <div><div className="num" style={{ fontSize: 24 }}>{st.current}</div><div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-3)' }}>DAY STREAK</div></div>
            </div>
            <div style={{ width: 1, background: 'var(--line)' }} />
            <div><div className="num" style={{ fontSize: 24 }}>{st.best}</div><div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-3)' }}>BEST STREAK</div></div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Last 7 days</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 88, paddingTop: 6 }}>
            {hist.map(h => {
              const met = h.p >= goal;
              return (
                <div key={h.d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
                  <span className="num" style={{ fontSize: 10, color: h.p ? 'var(--ink-2)' : 'var(--ink-3)' }}>{h.p}</span>
                  <div style={{ width: '100%', maxWidth: 26, height: Math.max(h.p / histMax * 58, 4), borderRadius: 7, background: met ? 'linear-gradient(var(--basil),#3E7A52)' : h.p ? 'linear-gradient(var(--turmeric),var(--saffron-deep))' : 'var(--line)' }} />
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--ink-3)' }}>{new Date(h.d + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'narrow', timeZone: 'UTC' })}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* weekly plan */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, gap: 10 }}>
          <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: 'nowrap' }}>This week's plan</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>Planned <span className="num" style={{ fontSize: 15, color: 'var(--basil)' }}>{weekProtein}g</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {days.map((d, i) => {
            const ids = state.plan[d] || [];
            const dayP = ids.reduce((s, id) => { const r = getRecipe(id); return s + (r ? r.proteinPerServing : 0); }, 0);
            const isToday = d === PKLib.todayISO();
            return (
              <div key={d} style={{ background: 'var(--card)', borderRadius: 16, padding: '12px 14px', boxShadow: 'var(--shadow)', border: isToday ? '1.5px solid var(--saffron)' : '1.5px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: ids.length ? 10 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{DOW[i]}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>{new Date(d + 'T00:00:00Z').getUTCDate()}</span>
                    {dayP > 0 && <span className="num" style={{ fontSize: 13, color: dayP >= goal ? 'var(--basil)' : 'var(--ink-3)' }}>{dayP}g</span>}
                  </div>
                  <button className="pk-press" onClick={() => setPickFor(d)} aria-label="Add meal" style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={17} stroke="var(--saffron-deep)" sw={2.3} /></button>
                </div>
                {ids.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {ids.map(id => { const r = getRecipe(id); if (!r) return null; return (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <Thumb cat={r.category} style={{ width: 30, height: 30, borderRadius: 9, flex: '0 0 auto' }} />
                        <span className="pk-press" onClick={() => nav.push({ name: 'detail', recipeId: id })} style={{ flex: 1, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>{r.title}</span>
                        <span className="num" style={{ fontSize: 13, color: 'var(--basil)' }}>{r.proteinPerServing}g</span>
                        <button className="pk-press" onClick={() => dispatch({ type: 'PLAN_TOGGLE', date: d, recipeId: id })} aria-label="Remove" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={14} stroke="var(--ink-3)" /></button>
                      </div>
                    ); })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <PlanPicker open={!!pickFor} date={pickFor} onClose={() => setPickFor(null)} />
    </div>
  );
}

function PlanPicker({ open, date, onClose }) {
  const { state, dispatch } = useStore();
  const [q, setQ] = React.useState('');
  React.useEffect(() => { if (open) setQ(''); }, [open]);
  const list = PK_DATA.recipes.filter(r => r.title.toLowerCase().includes(q.toLowerCase()));
  const planned = (date && state.plan[date]) || [];
  return (
    <Sheet open={open} onClose={onClose} title={date ? 'Add to ' + PKLib.relDay(date) : 'Add meal'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1.5px solid var(--line)', borderRadius: 13, padding: '10px 13px', marginBottom: 12 }}>
        <Icon name="search" size={16} stroke="var(--ink-3)" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search recipes" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, width: '100%', fontFamily: 'inherit', color: 'var(--ink)' }} />
      </div>
      {list.map(r => {
        const on = planned.includes(r.id);
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
            <Thumb cat={r.category} style={{ width: 42, height: 42, borderRadius: 12, flex: '0 0 auto' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{r.proteinPerServing}g · {r.timeMinutes} min</div>
            </div>
            <button className="pk-press" onClick={() => dispatch({ type: 'PLAN_TOGGLE', date, recipeId: r.id })} style={{ width: 34, height: 34, borderRadius: 11, background: on ? 'var(--basil)' : 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={on ? 'check' : 'plus'} size={17} stroke={on ? '#fff' : 'var(--saffron-deep)'} sw={2.3} />
            </button>
          </div>
        );
      })}
    </Sheet>
  );
}
