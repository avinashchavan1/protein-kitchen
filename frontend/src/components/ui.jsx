// ui.jsx — styles injection + shared UI primitives.
import React from 'react';

(function injectCss() {
  if (document.getElementById('pk-app-styles')) return;
  const s = document.createElement('style'); s.id = 'pk-app-styles';
  s.textContent = `
  :root{
    --saffron:#E8983C; --saffron-deep:#D97B26; --turmeric:#F0B94A;
    --paprika:#C73E2E; --basil:#4A8B5C; --teal:#2E8B82; --egg:#A8743A;
    --ink:#221E1A; --ink-2:#54493E; --ink-3:#8A7E70;
    --cream:#FBF7F0; --cream-2:#F4ECDF; --line:#EADFCE; --card:#FFFFFF;
    --shadow:0 4px 18px rgba(60,40,15,0.08); --shadow-lg:0 12px 34px rgba(60,40,15,0.16);
    --safe-top:env(safe-area-inset-top,14px); --safe-bottom:env(safe-area-inset-bottom,20px);
  }
  [data-theme="dark"]{
    --ink:#F6EEE2; --ink-2:#C7B9A6; --ink-3:#8C7E6C;
    --cream:#17140F; --cream-2:#221D16; --line:#352F26; --card:#241F18;
    --shadow:0 4px 18px rgba(0,0,0,0.4); --shadow-lg:0 14px 38px rgba(0,0,0,0.55);
  }
  .pk-app *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  .pk-app{font-family:'Hanken Grotesk',system-ui,sans-serif;color:var(--ink);letter-spacing:-0.011em;-webkit-font-smoothing:antialiased;}
  .pk-app button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}
  .num{font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:700;letter-spacing:-0.02em;line-height:0.92;}
  .pk-scroll{overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;}
  .pk-scroll::-webkit-scrollbar{width:0;display:none;} .pk-scroll{scrollbar-width:none;}
  .pk-press{transition:transform .12s ease, background .12s, box-shadow .15s, opacity .12s;}
  .pk-press:active{transform:scale(0.96);}
  @keyframes pk-pop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
  @keyframes pk-slideup{from{transform:translateY(100%)}to{transform:translateY(0)}}
  @keyframes pk-fade{from{opacity:0}to{opacity:1}}
  @keyframes pk-toast{0%{transform:translateY(20px);opacity:0}12%{transform:translateY(0);opacity:1}88%{opacity:1}100%{opacity:0}}
  @keyframes pk-confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(-120px) rotate(360deg);opacity:0}}
  .pk-sheet-bg{position:absolute;inset:0;background:rgba(20,12,4,0.45);animation:pk-fade .2s ease;z-index:40;}
  .pk-sheet{position:absolute;left:0;right:0;bottom:0;background:var(--card);border-radius:26px 26px 0 0;
    box-shadow:var(--shadow-lg);animation:pk-slideup .26s cubic-bezier(.2,.8,.2,1);z-index:41;max-height:88%;display:flex;flex-direction:column;}
  @media (prefers-reduced-motion: reduce){.pk-press:active{transform:none} *{animation:none !important}}
  `;
  document.head.appendChild(s);
})();

const ICONS = {
  browse: 'M3 5.5h7v6H3zM14 5.5h7v4h-7zM14 13.5h7v5h-7zM3 15.5h7v3H3z',
  today: 'M12 12m-9 0a9 9 0 1018 0a9 9 0 10-18 0 M12 12m-4.5 0a4.5 4.5 0 109 0a4.5 4.5 0 10-9 0 M12 12m-1 0a1 1 0 102 0a1 1 0 10-2 0',
  planner: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2zM4 9.5h16M8 3v4M16 3v4',
  settings: 'M5 21v-7M5 10V3M12 21v-9M12 8V3M19 21v-5M19 12V3M2.5 14h5M9.5 8h5M16.5 16h5',
  heart: 'M12 20.5s-6.5-4.2-9-8.3C1.2 9 2.6 5.3 6 5.3c2 0 3.1 1.2 4 2.5C11 6.5 12.1 5.3 14 5.3c3.4 0 4.8 3.7 3 6.9-2.5 4.1-9 8.3-9 8.3z',
  search: 'M11 11m-7 0a7 7 0 1014 0a7 7 0 10-14 0 M20.5 20.5l-4.2-4.2',
  plus: 'M12 5v14M5 12h14', minus: 'M5 12h14',
  clock: 'M12 12m-9 0a9 9 0 1018 0a9 9 0 10-18 0 M12 7.5v4.8l3.2 1.9',
  chevL: 'M15 18.5l-6.5-6.5L15 5.5', chevR: 'M9 5.5l6.5 6.5L9 18.5', chevDown: 'M5.5 9l6.5 6.5L18.5 9', chevUp: 'M5.5 15l6.5-6.5L18.5 15',
  x: 'M6 6l12 12M18 6L6 18',
  bag: 'M6 8h12l-1 12H7zM9 8a3 3 0 016 0', cart: 'M3 4h2l2.3 12.5a1 1 0 001 .8h8.7a1 1 0 001-.8L21 8H6 M9 21a1 1 0 100-2 1 1 0 000 2M17 21a1 1 0 100-2 1 1 0 000 2',
  bolt: 'M13 2L4.5 13.5H11l-1 8.5L19.5 10H13z',
  user: 'M12 11.5m-4 0a4 4 0 108 0a4 4 0 10-8 0 M4.5 20.5c0-3.6 3.5-5.5 7.5-5.5s7.5 1.9 7.5 5.5',
  check: 'M5 12.5l4.5 4.5L19 7', share: 'M12 3v13M8 7l4-4 4 4M5 13v6a1 1 0 001 1h12a1 1 0 001-1v-6',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
  flame: 'M12 2c1.2 4-3 5.2-3 9.2a3 3 0 006 0c0-1.5-.8-2.6-1-4 2 1 4.2 3 4.2 6.2A6.2 6.2 0 015.8 13.4C5.8 8.5 10 6.5 12 2z',
  sun: 'M12 12m-4 0a4 4 0 108 0a4 4 0 10-8 0 M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19',
  moon: 'M20 14.5A8 8 0 119.5 4 6.5 6.5 0 0020 14.5z', auto: 'M12 3a9 9 0 000 18zM12 3a9 9 0 010 18',
  edit: 'M4 20h4l10-10-4-4L4 16zM14 6l4 4',
  sliders2: 'M4 7h11M19 7h1M4 17h1M9 17h11M15 4v6M9 14v6',
  info: 'M12 12m-9 0a9 9 0 1018 0a9 9 0 10-18 0 M12 11v6M12 7.5v.5',
  download: 'M12 4v11M8 11l4 4 4-4M5 20h14', upload: 'M12 20V9M8 13l4-4 4 4M5 4h14',
  star: 'M12 3.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z',
  awake: 'M12 12m-9 0a9 9 0 1018 0a9 9 0 10-18 0 M12 8v4l3 2', back: 'M15 18.5l-6.5-6.5L15 5.5',
  veg: 'M12 8v8M8 12h8', utensil: 'M5 3v7a2 2 0 002 2v9M16 3c-1.5 0-2 2-2 4s.5 4 2 4v6',
};

export function Icon({ name, size = 22, sw = 1.85, stroke = 'currentColor', fill = 'none', style }) {
  const d = ICONS[name] || ICONS.info;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flex: '0 0 auto', ...style }}>
      {d.split(' M').map((p, i) => <path key={i} d={(i ? 'M' : '') + p} />)}
    </svg>
  );
}

const GRAD = {
  chicken: 'radial-gradient(120% 95% at 28% 8%, #F4C76A, #E08A3C 46%, #B25018 100%)',
  paneer: 'radial-gradient(120% 95% at 28% 8%, #FBE9C8, #F0C079 46%, #CE8C3E 100%)',
  egg: 'radial-gradient(120% 95% at 28% 8%, #FAD98A, #EBA94B 46%, #C57F2A 100%)',
  dal: 'radial-gradient(120% 95% at 28% 8%, #E8B65A, #C77E2C 46%, #8E4F18 100%)',
  fish: 'radial-gradient(120% 95% at 28% 8%, #F2C98E, #D98E5A 46%, #A0512F 100%)',
  tofu: 'radial-gradient(120% 95% at 28% 8%, #F5EAC9, #DCC987 46%, #AE9648 100%)',
  chickpea: 'radial-gradient(120% 95% at 28% 8%, #EFD79A, #CFA34F 46%, #97702A 100%)',
  yogurt: 'radial-gradient(120% 95% at 28% 8%, #FBF3E2, #E9DBBE 46%, #C7B488 100%)',
};
export function catGrad(cat) { return GRAD[cat] || GRAD.chicken; }

export function Thumb({ cat, style, children, slot }) {
  return <div style={{ background: catGrad(cat), position: 'relative', overflow: 'hidden', ...style }}>{children}</div>;
}

const DIET = { veg: ['var(--basil)', 'Veg'], nonveg: ['var(--paprika)', 'Non-veg'], egg: ['var(--egg)', 'Egg'], vegan: ['var(--teal)', 'Vegan'] };
export function DietDot({ type, size = 14, label }) {
  const [c, l] = DIET[type] || DIET.veg;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: size, height: size, borderRadius: 4, border: `1.6px solid ${c}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
        <span style={{ width: size * 0.46, height: size * 0.46, borderRadius: type === 'nonveg' ? 0 : '50%', background: c }} />
      </span>
      {label && <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{l}</span>}
    </span>
  );
}

export function Spice({ level = 1, size = 6 }) {
  if (!level) return <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)' }}>Mild</span>;
  return (
    <span style={{ display: 'inline-flex', gap: 2.5, alignItems: 'center' }} title={'Spice ' + level + '/3'}>
      {[0, 1, 2].map(i => <span key={i} style={{ width: size, height: size, borderRadius: '50%', background: i < level ? 'var(--paprika)' : 'var(--line)' }} />)}
    </span>
  );
}

export function MacroBar({ protein, carbs, fat, height = 9, showLabels }) {
  const pc = protein * 4, cc = carbs * 4, fc = fat * 9; const tot = pc + cc + fc || 1;
  const seg = [['Protein', pc, 'var(--basil)', protein], ['Carbs', cc, 'var(--teal)', carbs], ['Fat', fc, 'var(--egg)', fat]];
  return (
    <div>
      <div style={{ display: 'flex', height, borderRadius: height, overflow: 'hidden', background: 'var(--cream-2)' }}>
        {seg.map(([n, v, c]) => <div key={n} style={{ width: `${v / tot * 100}%`, background: c }} />)}
      </div>
      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {seg.map(([n, v, c, g]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)' }}>{n} <b style={{ color: 'var(--ink)' }}>{g}g</b></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Liquid-fill gauge (B2). animated fill.
export function LiquidGauge({ consumed, goal, size = 200, label = true }) {
  const pct = Math.max(0, Math.min(consumed / goal, 1));
  const [fill, setFill] = React.useState(0);
  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setFill(pct); return; }
    let raf; const t0 = performance.now();
    const step = (t) => { const k = Math.min((t - t0) / 900, 1); setFill(pct * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [pct]);
  const W = size, H = size * 1.18;
  const gx = W * 0.13, gy = H * 0.03, gw = W * 0.74, gh = H * 0.94, rx = W * 0.18;
  const fillY = gy + gh * (1 - fill);
  const wave = W * 0.05;
  const done = consumed >= goal;
  const col = done ? 'var(--basil)' : pct >= 0.66 ? 'var(--turmeric)' : pct >= 0.33 ? 'var(--saffron)' : '#E0734A';
  const remaining = Math.max(0, Math.round(goal - consumed));
  return (
    <div style={{ position: 'relative', width: W, height: H }} role="progressbar" aria-valuenow={Math.round(consumed)} aria-valuemin={0} aria-valuemax={goal} aria-label={'Protein ' + Math.round(consumed) + ' of ' + goal + ' grams'}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <clipPath id={'jar' + size}><rect x={gx} y={gy} width={gw} height={gh} rx={rx} /></clipPath>
          <linearGradient id={'liq' + size} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={done ? '#6FBF85' : '#F0B94A'} /><stop offset="1" stopColor={done ? '#3E8059' : '#D97B26'} />
          </linearGradient>
        </defs>
        <rect x={gx} y={gy} width={gw} height={gh} rx={rx} fill="var(--cream-2)" />
        <g clipPath={`url(#jar${size})`}>
          <path d={`M${gx} ${fillY} q ${gw * 0.25} ${-wave} ${gw * 0.5} 0 t ${gw * 0.5} 0 V${gy + gh} H${gx} Z`} fill={`url(#liq${size})`} />
        </g>
        <rect x={gx} y={gy} width={gw} height={gh} rx={rx} fill="none" stroke="var(--line)" strokeWidth="3" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 6%' }}>
        <span className="num" style={{ fontSize: size * 0.27, color: fill > 0.5 ? '#fff' : 'var(--ink)', textShadow: fill > 0.5 ? '0 1px 5px rgba(120,60,10,0.4)' : 'none' }}>{Math.round(consumed)}</span>
        {label && <span style={{ fontSize: Math.max(size * 0.062, 10), fontWeight: 800, color: fill > 0.46 ? 'rgba(255,255,255,0.95)' : 'var(--ink-3)', marginTop: 3, whiteSpace: 'nowrap', textShadow: fill > 0.46 ? '0 1px 4px rgba(120,60,10,0.35)' : 'none' }}>of {goal}g protein</span>}
        {label && <span style={{ fontSize: Math.max(size * 0.058, 9.5), fontWeight: 800, color: '#fff', marginTop: 6, background: col, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>{done ? 'Goal hit 🎉' : remaining + 'g to go'}</span>}
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, min = 0.5, max = 12, step = 0.5, suffix }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--cream-2)', borderRadius: 14, padding: 3 }}>
      <button className="pk-press" onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))} aria-label="Decrease" style={stepBtn}><Icon name="minus" size={18} /></button>
      <span className="num" style={{ minWidth: 54, textAlign: 'center', fontSize: 18 }}>{value % 1 === 0 ? value : value}{suffix ? '' : ''}</span>
      <button className="pk-press" onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))} aria-label="Increase" style={stepBtn}><Icon name="plus" size={18} /></button>
    </div>
  );
}
const stepBtn = { width: 36, height: 36, borderRadius: 11, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' };

export function Chip({ active, children, onClick, color = 'var(--saffron)' }) {
  return (
    <button onClick={onClick} className="pk-press" style={{
      fontSize: 12.5, fontWeight: 700, padding: '8px 13px', borderRadius: 20, whiteSpace: 'nowrap',
      background: active ? color : 'var(--card)', color: active ? '#fff' : 'var(--ink-2)',
      border: active ? '1.5px solid ' + color : '1.5px solid var(--line)', flex: '0 0 auto',
    }}>{children}</button>
  );
}

export function EmptyState({ icon = 'utensil', title, body, cta, onCta }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 28px', gap: 6 }}>
      <div style={{ width: 70, height: 70, borderRadius: 22, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <Icon name={icon} size={32} stroke="var(--saffron-deep)" />
      </div>
      <div style={{ fontSize: 17, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-3)', maxWidth: 230, lineHeight: 1.4 }}>{body}</div>
      {cta && <button className="pk-press" onClick={onCta} style={{ marginTop: 10, background: 'var(--saffron)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '11px 20px', borderRadius: 14 }}>{cta}</button>}
    </div>
  );
}

// Bottom sheet
export function Sheet({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <React.Fragment>
      <div className="pk-sheet-bg" onClick={onClose} />
      <div className="pk-sheet">
        <div style={{ padding: '14px 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)', width: 38, height: 4, borderRadius: 4, background: 'var(--line)' }} />
          <span style={{ fontSize: 17, fontWeight: 700, marginTop: 6 }}>{title}</span>
          <button className="pk-press" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 6 }}><Icon name="x" size={18} /></button>
        </div>
        <div className="pk-scroll" style={{ padding: '6px 20px 26px' }}>{children}</div>
      </div>
    </React.Fragment>
  );
}

export function Toast({ toast, onUndo }) {
  if (!toast) return null;
  return (
    <div style={{ position: 'absolute', left: 16, right: 16, bottom: 86, zIndex: 60, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--ink)', color: 'var(--cream)', padding: '13px 16px', borderRadius: 16, boxShadow: 'var(--shadow-lg)', animation: 'pk-toast 2.8s ease forwards' }}>
      <Icon name={toast.icon || 'check'} size={19} stroke="var(--turmeric)" />
      <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{toast.msg}</span>
      {toast.undo && <button className="pk-press" onClick={onUndo} style={{ fontSize: 13, fontWeight: 800, color: 'var(--turmeric)' }}>UNDO</button>}
    </div>
  );
}

export function StatBox({ value, unit, label, accent }) {
  return (
    <div style={{ flex: 1, background: 'var(--card)', borderRadius: 14, padding: '11px 12px', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span className="num" style={{ fontSize: 18, color: accent || 'var(--ink)' }}>{value}</span>
        {unit && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)' }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
    </div>
  );
}
