// Today.jsx — Today tracker (liquid gauge) + macros + log by meal + quick add + date nav.
import React from 'react';
import { useStore, dayTotals } from '../store/store.jsx';
import { useNav } from '../nav.jsx';
import { PK_DATA } from '../data/data.js';
import { PKLib } from '../lib/lib.js';
import { Icon, Thumb, LiquidGauge, StatBox, EmptyState, Sheet, Chip } from '../components/ui.jsx';
import { RecipeCardGrid, LogSheet, MEAL_TYPES } from '../components/cards.jsx';

const QUICK_ADDS = [
  { name: 'Protein shake', grams: 25, kcal: 130, cat: 'tofu', icon: 'bolt' },
  { name: 'Greek yogurt', grams: 17, kcal: 100, cat: 'yogurt', icon: 'plus' },
  { name: 'Boiled eggs (2)', grams: 12, kcal: 140, cat: 'egg', icon: 'plus' },
  { name: 'Whey scoop', grams: 24, kcal: 120, cat: 'paneer', icon: 'bolt' },
];

export function Today() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const date = state.currentDate;
  const goal = state.settings.goal;
  const totals = dayTotals(state, date);
  const entries = state.log[date] || [];
  const [quickOpen, setQuickOpen] = React.useState(false);
  const remaining = Math.max(0, goal - totals.protein);

  const suggestions = React.useMemo(() => {
    if (remaining < 8) return [];
    return [...PK_DATA.recipes].sort((a, b) => Math.abs(a.proteinPerServing - remaining) - Math.abs(b.proteinPerServing - remaining)).slice(0, 5);
  }, [remaining]);

  const byMeal = MEAL_TYPES.map(m => ({ meal: m, items: entries.filter(e => e.meal === m) })).filter(g => g.items.length);

  const del = (e) => {
    dispatch({ type: 'LOG_DELETE', date, id: e.id });
    nav.notify({ msg: 'Removed', icon: 'trash', undo: () => dispatch({ type: 'LOG_ADD', entry: e }) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* header / date nav */}
      <div style={{ padding: '4px 16px 6px', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="pk-press" onClick={() => dispatch({ type: 'SET_DATE', date: PKLib.addDays(date, -1) })} aria-label="Previous day" style={navChip}><Icon name="chevL" size={18} /></button>
          <button className="pk-press" onClick={() => dispatch({ type: 'SET_DATE', date: PKLib.todayISO() })} style={{ textAlign: 'center', padding: '4px 8px' }}>
            <div className="num" style={{ fontSize: 20 }}>{PKLib.relDay(date)}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{PKLib.fmtDate(date)}</div>
          </button>
          <button className="pk-press" onClick={() => dispatch({ type: 'SET_DATE', date: PKLib.addDays(date, 1) })} aria-label="Next day" style={navChip}><Icon name="chevR" size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pk-press" onClick={() => nav.push({ name: 'favorites' })} aria-label="Favorites" style={iconBtn}><Icon name="heart" size={20} /></button>
          <button className="pk-press" onClick={() => nav.push({ name: 'grocery' })} aria-label="Grocery" style={iconBtn}><Icon name="cart" size={20} /></button>
        </div>
      </div>

      <div className="pk-scroll" style={{ flex: 1, padding: '0 16px 16px' }}>
        {/* liquid gauge */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 6px' }}>
          <LiquidGauge consumed={totals.protein} goal={goal} size={188} />
        </div>

        {/* macro mini-stats (D2) */}
        <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 18 }}>
          <StatBox value={totals.kcal} label="Calories" accent="var(--saffron-deep)" />
          <StatBox value={totals.carbs + 'g'} label="Carbs" accent="var(--teal)" />
          <StatBox value={totals.fat + 'g'} label="Fat" accent="var(--egg)" />
        </div>

        {/* quick add row */}
        <div className="pk-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
          <button className="pk-press" onClick={() => setQuickOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, flex: '0 0 auto', background: 'var(--ink)', color: 'var(--cream)', borderRadius: 14, padding: '11px 15px', fontSize: 13, fontWeight: 800 }}><Icon name="plus" size={17} stroke="var(--cream)" sw={2.4} />Quick add</button>
          {QUICK_ADDS.map(qa => (
            <button key={qa.name} className="pk-press" onClick={() => { dispatch({ type: 'LOG_ADD', entry: { id: PKLib.uid(), date, name: qa.name, cat: qa.cat, protein: qa.grams, kcal: qa.kcal, carbs: 2, fat: 2, meal: 'snack', servings: 1 } }); if (navigator.vibrate) navigator.vibrate(10); nav.notify({ msg: `Logged ${qa.grams}g protein`, icon: 'check' }); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flex: '0 0 auto', background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 14, padding: '9px 13px' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{qa.name}</span>
              <span className="num" style={{ fontSize: 14, color: 'var(--basil)' }}>+{qa.grams}</span>
            </button>
          ))}
        </div>

        {/* smart suggestions */}
        {suggestions.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 11 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--saffron-deep)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Need {remaining}g more</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>· try these</span>
            </div>
            <div className="pk-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {suggestions.map(r => <div key={r.id} style={{ width: 148, flex: '0 0 auto' }}><RecipeCardGrid recipe={r} /></div>)}
            </div>
          </div>
        )}

        {/* logged items by meal */}
        {entries.length === 0
          ? <EmptyState icon="utensil" title="Nothing logged yet" body={`Log your first meal to start filling your ${goal}g ring.`} cta="Quick add" onCta={() => setQuickOpen(true)} />
          : byMeal.map(g => (
            <div key={g.meal} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{g.meal}</span>
                <span className="num" style={{ fontSize: 14, color: 'var(--basil)' }}>{g.items.reduce((a, e) => a + (e.protein || 0), 0)}g</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {g.items.map(e => <LogItem key={e.id} e={e} onDelete={() => del(e)} />)}
              </div>
            </div>
          ))}
      </div>

      <QuickAddSheet open={quickOpen} onClose={() => setQuickOpen(false)} date={date} />
    </div>
  );
}
const navChip = { width: 34, height: 34, borderRadius: 12, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const iconBtn = { width: 38, height: 38, borderRadius: 12, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' };

function LogItem({ e, onDelete }) {
  const [dragX, setDragX] = React.useState(0);
  const start = React.useRef(null);
  const onDown = (ev) => { start.current = (ev.touches ? ev.touches[0].clientX : ev.clientX); };
  const onMove = (ev) => { if (start.current == null) return; const x = (ev.touches ? ev.touches[0].clientX : ev.clientX); setDragX(Math.min(0, Math.max(-80, x - start.current))); };
  const onUp = () => { if (dragX < -50) setDragX(-72); else setDragX(0); start.current = null; };
  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
      <button onClick={onDelete} aria-label="Delete" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 72, background: 'var(--paprika)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="trash" size={20} stroke="#fff" /></button>
      <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'var(--card)', borderRadius: 14, padding: 11, boxShadow: 'var(--shadow)', transform: `translateX(${dragX}px)`, transition: start.current == null ? 'transform .2s' : 'none', touchAction: 'pan-y' }}>
        <Thumb cat={e.cat || 'tofu'} style={{ width: 40, height: 40, borderRadius: 11, flex: '0 0 auto' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{e.servings ? e.servings + ' serving' + (e.servings > 1 ? 's' : '') + ' · ' : ''}{e.kcal} cal</div>
        </div>
        <div style={{ textAlign: 'right' }}><span className="num" style={{ fontSize: 17, color: 'var(--basil)' }}>{e.protein}</span><span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)' }}>g</span></div>
        <button onClick={onDelete} aria-label="Delete" className="pk-press" style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><Icon name="x" size={15} stroke="var(--ink-3)" /></button>
      </div>
    </div>
  );
}

function QuickAddSheet({ open, onClose, date }) {
  const { dispatch } = useStore();
  const nav = useNav();
  const [name, setName] = React.useState('');
  const [grams, setGrams] = React.useState(20);
  const [meal, setMeal] = React.useState('snack');
  React.useEffect(() => { if (open) { setName(''); setGrams(20); setMeal('snack'); } }, [open]);
  const add = () => {
    dispatch({ type: 'LOG_ADD', entry: { id: PKLib.uid(), date, name: name.trim() || 'Protein', cat: 'tofu', protein: +grams, kcal: Math.round(grams * 5), carbs: 2, fat: 2, meal, servings: 1 } });
    if (navigator.vibrate) navigator.vibrate(12);
    onClose(); nav.notify({ msg: `Logged ${grams}g protein`, icon: 'check' });
  };
  return (
    <Sheet open={open} onClose={onClose} title="Quick add protein">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 7 }}>What did you eat?</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grilled chicken, dal…" style={{ width: '100%', border: '1.5px solid var(--line)', borderRadius: 13, padding: '13px 14px', fontSize: 14.5, fontWeight: 500, fontFamily: 'inherit', background: 'var(--card)', color: 'var(--ink)', outline: 'none' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Protein</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><span className="num" style={{ fontSize: 26, color: 'var(--basil)' }}>{grams}</span><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)' }}>g</span></div>
      </div>
      <input type="range" min="2" max="80" step="1" value={grams} onChange={e => setGrams(+e.target.value)} style={{ width: '100%', accentColor: 'var(--basil)', marginBottom: 18 }} />
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 8 }}>Meal</div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 20 }}>
        {MEAL_TYPES.map(mt => <Chip key={mt} active={meal === mt} onClick={() => setMeal(mt)}>{mt[0].toUpperCase() + mt.slice(1)}</Chip>)}
      </div>
      <button className="pk-press" onClick={add} style={{ width: '100%', background: 'var(--saffron)', color: '#fff', fontWeight: 800, fontSize: 15.5, padding: 15, borderRadius: 16 }}>Add {grams}g protein</button>
    </Sheet>
  );
}
