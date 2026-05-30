// Onboarding.jsx — 3-slide first-run.
import React from 'react';
import { useStore } from '../store/store.jsx';
import { PKLib } from '../lib/lib.js';
import { Icon, Chip, LiquidGauge } from '../components/ui.jsx';

const miniBtn = { width: 32, height: 32, borderRadius: 10, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export function Onboarding({ onDone }) {
  const { state } = useStore();
  const [i, setI] = React.useState(0);
  const [goal, setGoal] = React.useState(state.settings.goal);
  const [weight, setWeight] = React.useState(state.settings.weight);
  const [activity, setActivity] = React.useState(state.settings.activity);
  const [diet, setDiet] = React.useState('all');
  const suggested = PKLib.suggestGoal(weight, activity);

  const finish = () => onDone({ goal, weight, activity, diet });

  const slides = [
    // 1 · welcome
    (
      <div key="w" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px' }}>
        <div style={{ marginBottom: 30 }}><LiquidGauge consumed={72} goal={100} size={150} /></div>
        <div className="num" style={{ fontSize: 30, lineHeight: 1.12, marginBottom: 16 }}>Hit your protein,<br />every day.</div>
        <div style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5, maxWidth: 280 }}>High-protein, Indian-first recipes and a daily tracker that keeps it simple.</div>
      </div>
    ),
    // 2 · goal
    (
      <div key="g" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>
        <div className="num" style={{ fontSize: 26, marginBottom: 8 }}>Set your goal</div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 24 }}>Most people aim for 1.6–2.2g per kg of body weight.</div>
        <div style={{ textAlign: 'center', marginBottom: 8 }}><span className="num" style={{ fontSize: 56, color: 'var(--saffron-deep)' }}>{goal}</span><span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-3)' }}> g/day</span></div>
        <input type="range" min="40" max="250" step="5" value={goal} onChange={e => setGoal(+e.target.value)} style={{ width: '100%', accentColor: 'var(--saffron)', marginBottom: 26 }} />
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Or use your weight</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Weight</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="pk-press" onClick={() => setWeight(Math.max(35, weight - 1))} style={miniBtn}><Icon name="minus" size={15} /></button>
              <span className="num" style={{ fontSize: 18, minWidth: 54, textAlign: 'center' }}>{weight} kg</span>
              <button className="pk-press" onClick={() => setWeight(Math.min(200, weight + 1))} style={miniBtn}><Icon name="plus" size={15} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
            {[['low', 'Light'], ['moderate', 'Active'], ['high', 'Athlete']].map(([k, l]) => <Chip key={k} active={activity === k} onClick={() => setActivity(k)}>{l}</Chip>)}
          </div>
          <button className="pk-press" onClick={() => setGoal(suggested)} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'var(--cream-2)', fontWeight: 800, fontSize: 13.5, color: 'var(--saffron-deep)' }}>Use suggested · {suggested}g</button>
        </div>
      </div>
    ),
    // 3 · diet + install
    (
      <div key="d" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>
        <div className="num" style={{ fontSize: 26, marginBottom: 8 }}>Your diet</div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 22 }}>We'll prioritise recipes that fit. Change it anytime.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[['all', 'Everything', 'Veg, egg & non-veg'], ['veg', 'Vegetarian', 'Hides non-veg dishes'], ['vegan', 'Vegan', 'Plant-based only']].map(([k, t, sub]) => (
            <button key={k} className="pk-press" onClick={() => setDiet(k)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 15, borderRadius: 16, background: 'var(--card)', border: '2px solid ' + (diet === k ? 'var(--saffron)' : 'var(--line)'), textAlign: 'left' }}>
              <span style={{ width: 22, height: 22, borderRadius: 11, border: '2px solid ' + (diet === k ? 'var(--saffron)' : 'var(--line)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>{diet === k && <span style={{ width: 11, height: 11, borderRadius: 6, background: 'var(--saffron)' }} />}</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700 }}>{t}</div><div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{sub}</div></div>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, background: 'var(--cream-2)', borderRadius: 14, padding: '13px 15px' }}>
          <Icon name="download" size={20} stroke="var(--saffron-deep)" />
          <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.4 }}>Add to your home screen for an app-like experience — tap Share → Add to Home Screen.</span>
        </div>
      </div>
    ),
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 4px' }}>
        <div style={{ display: 'flex', gap: 7 }}>{slides.map((_, k) => <span key={k} style={{ width: k === i ? 22 : 7, height: 7, borderRadius: 4, background: k === i ? 'var(--saffron)' : 'var(--line)', transition: 'width .2s' }} />)}</div>
        <button onClick={finish} style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-3)' }}>Skip</button>
      </div>
      {slides[i]}
      <div style={{ padding: '12px 28px calc(20px + var(--safe-bottom))' }}>
        <button className="pk-press" onClick={() => i < 2 ? setI(i + 1) : finish()} style={{ width: '100%', padding: 16, borderRadius: 16, background: 'var(--saffron)', color: '#fff', fontWeight: 800, fontSize: 16 }}>{i < 2 ? 'Continue' : "Start cooking"}</button>
      </div>
    </div>
  );
}
