// Settings.jsx — goal slider + weight helper + units/theme/diet + data tools.
import React from 'react';
import { useStore } from '../store/store.jsx';
import { useNav } from '../nav.jsx';
import { PK_DATA } from '../data/data.js';
import { PKLib } from '../lib/lib.js';
import { Icon, Chip } from '../components/ui.jsx';
import { useAuth } from '../api/auth.jsx';
import { pushSupported, enablePush, disablePush, sendTestPush } from '../api/push.js';

export function Settings() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const s = state.settings;
  const set = (patch) => dispatch({ type: 'SETTINGS_SET', patch });
  const [confirm, setConfirm] = React.useState(null);
  const fileRef = React.useRef(null);

  const suggested = PKLib.suggestGoal(s.weight, s.activity);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'protein-kitchen-data.json'; a.click(); URL.revokeObjectURL(url);
    nav.notify({ msg: 'Data exported', icon: 'download' });
  };
  const importData = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { dispatch({ type: 'IMPORT', state: JSON.parse(r.result) }); nav.notify({ msg: 'Data imported', icon: 'check' }); } catch (err) { nav.notify({ msg: 'Invalid file', icon: 'info' }); } };
    r.readAsText(f); e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '4px 16px 8px', flex: '0 0 auto' }}><div className="num" style={{ fontSize: 26 }}>Settings</div></div>
      <div className="pk-scroll" style={{ flex: 1, padding: '0 16px 16px' }}>

        <AccountCard />

        {/* daily goal */}
        <Card>
          <Label>Daily protein goal</Label>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><span className="num" style={{ fontSize: 36, color: 'var(--saffron-deep)' }}>{s.goal}</span><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>g / day</span></div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="pk-press" onClick={() => set({ goal: Math.max(20, s.goal - 5) })} style={miniBtn}><Icon name="minus" size={16} /></button>
              <button className="pk-press" onClick={() => set({ goal: Math.min(300, s.goal + 5) })} style={miniBtn}><Icon name="plus" size={16} /></button>
            </div>
          </div>
          <input type="range" min="40" max="250" step="5" value={s.goal} onChange={e => set({ goal: +e.target.value })} style={{ width: '100%', accentColor: 'var(--saffron)' }} />
        </Card>

        {/* weight helper */}
        <Card>
          <Label>Body-weight helper</Label>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 12 }}>Suggests a goal from your weight & activity.</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Weight</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="pk-press" onClick={() => set({ weight: Math.max(35, s.weight - 1) })} style={miniBtn}><Icon name="minus" size={15} /></button>
              <span className="num" style={{ fontSize: 18, minWidth: 56, textAlign: 'center' }}>{s.weight} kg</span>
              <button className="pk-press" onClick={() => set({ weight: Math.min(200, s.weight + 1) })} style={miniBtn}><Icon name="plus" size={15} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
            {[['low', 'Light'], ['moderate', 'Active'], ['high', 'Athlete']].map(([k, l]) => <Chip key={k} active={s.activity === k} onClick={() => set({ activity: k })}>{l}</Chip>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--cream-2)', borderRadius: 13, padding: '11px 14px' }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Suggested <b className="num" style={{ fontSize: 17, color: 'var(--basil)', marginLeft: 4 }}>{suggested}g</b></span>
            <button className="pk-press" onClick={() => set({ goal: suggested })} disabled={s.goal === suggested} style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: s.goal === suggested ? 'var(--ink-3)' : 'var(--saffron)', padding: '8px 14px', borderRadius: 11, opacity: s.goal === suggested ? 0.6 : 1, whiteSpace: 'nowrap', flex: '0 0 auto' }}>{s.goal === suggested ? 'Applied' : 'Use this'}</button>
          </div>
        </Card>

        {/* preferences */}
        <Card>
          <Label>Preferences</Label>
          <SegRow label="Units" value={s.units} opts={[['g', 'Grams'], ['oz', 'Ounces']]} onChange={v => set({ units: v })} />
          <SegRow label="Theme" value={s.theme} opts={[['light', 'Light'], ['dark', 'Dark'], ['system', 'Auto']]} onChange={v => set({ theme: v })} />
          <SegRow label="Diet" value={s.diet} opts={[['all', 'All'], ['veg', 'Veg'], ['vegan', 'Vegan']]} onChange={v => set({ diet: v })} last />
        </Card>

        {/* data */}
        <Card>
          <Label>Data</Label>
          <DataRow icon="download" label="Export data (JSON)" onClick={exportData} />
          <DataRow icon="upload" label="Import data" onClick={() => fileRef.current && fileRef.current.click()} />
          <DataRow icon="back" label="Reset today's log" danger onClick={() => setConfirm({ msg: "Clear all entries logged for " + PKLib.relDay(state.currentDate) + "?", action: () => dispatch({ type: 'RESET_DAY', date: state.currentDate }), label: 'Reset day' })} />
          <DataRow icon="trash" label="Clear all data" danger last onClick={() => setConfirm({ msg: 'This erases your log, favorites, grocery & plan. This cannot be undone.', action: () => dispatch({ type: 'CLEAR_ALL' }), label: 'Clear everything' })} />
          <input ref={fileRef} type="file" accept="application/json" onChange={importData} style={{ display: 'none' }} />
        </Card>

        <div style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)', padding: '8px 0' }}>Protein Kitchen · v{PK_DATA.config.version}</div>
      </div>

      {confirm && (
        <React.Fragment>
          <div className="pk-sheet-bg" onClick={() => setConfirm(null)} />
          <div style={{ position: 'absolute', left: 24, right: 24, top: '38%', background: 'var(--card)', borderRadius: 20, padding: 22, zIndex: 50, boxShadow: 'var(--shadow-lg)', animation: 'pk-pop .2s ease' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Are you sure?</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.45, marginBottom: 18 }}>{confirm.msg}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="pk-press" onClick={() => setConfirm(null)} style={{ flex: 1, padding: 13, borderRadius: 13, background: 'var(--cream-2)', fontWeight: 700, fontSize: 14 }}>Cancel</button>
              <button className="pk-press" onClick={() => { confirm.action(); nav.notify({ msg: 'Done', icon: 'check' }); setConfirm(null); }} style={{ flex: 1, padding: 13, borderRadius: 13, background: 'var(--paprika)', color: '#fff', fontWeight: 800, fontSize: 14 }}>{confirm.label}</button>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

function AccountCard() {
  const auth = useAuth();
  const nav = useNav();
  const btnRef = React.useRef(null);
  const [pushOn, setPushOn] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (auth && auth.enabled && !auth.user && btnRef.current) auth.renderButton(btnRef.current);
  }, [auth, auth && auth.user, auth && auth.ready]);

  React.useEffect(() => {
    if (!pushSupported()) return;
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setPushOn(!!sub)).catch(() => {});
  }, [auth && auth.user]);

  if (!auth || !auth.enabled) return null;

  const togglePush = async () => {
    setBusy(true);
    try {
      if (pushOn) { await disablePush(); setPushOn(false); nav.notify({ msg: 'Reminders off', icon: 'info' }); }
      else { await enablePush(); setPushOn(true); nav.notify({ msg: 'Reminders on', icon: 'check' }); }
    } catch (e) { nav.notify({ msg: e.message || 'Push failed', icon: 'info' }); }
    finally { setBusy(false); }
  };

  return (
    <Card>
      <Label>Account</Label>
      {auth.user ? (
        <React.Fragment>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            {auth.user.picture
              ? <img src={auth.user.picture} alt="" width={44} height={44} style={{ borderRadius: 22 }} referrerPolicy="no-referrer" />
              : <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={22} /></div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{auth.user.name || 'Signed in'}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auth.user.email}</div>
            </div>
            <button className="pk-press" onClick={auth.logout} style={{ fontSize: 13, fontWeight: 700, color: 'var(--paprika)', padding: '8px 12px', borderRadius: 11, background: 'var(--cream-2)' }}>Sign out</button>
          </div>
          {pushSupported() && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Daily reminders</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>Push when you're behind your goal</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {pushOn && <button className="pk-press" onClick={() => sendTestPush().then(() => nav.notify({ msg: 'Test sent', icon: 'check' }))} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--saffron-deep)', padding: '8px 10px' }}>Test</button>}
                <button className="pk-press" disabled={busy} onClick={togglePush} style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: pushOn ? 'var(--ink-3)' : 'var(--saffron)', padding: '8px 14px', borderRadius: 11, opacity: busy ? 0.6 : 1 }}>{pushOn ? 'On' : 'Enable'}</button>
              </div>
            </div>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 14 }}>Sign in to sync your log, plan & favorites across devices.</div>
          <div ref={btnRef} style={{ display: 'flex', justifyContent: 'center' }} />
        </React.Fragment>
      )}
    </Card>
  );
}

function Card({ children }) { return <div style={{ background: 'var(--card)', borderRadius: 18, padding: 16, boxShadow: 'var(--shadow)', marginBottom: 14 }}>{children}</div>; }
function Label({ children }) { return <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>{children}</div>; }
const miniBtn = { width: 32, height: 32, borderRadius: 10, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' };

function SegRow({ label, value, opts, onChange, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: last ? 0 : 14, marginBottom: last ? 0 : 14, borderBottom: last ? 'none' : '1px solid var(--line)' }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      <div style={{ display: 'flex', background: 'var(--cream-2)', borderRadius: 10, padding: 3, gap: 2 }}>
        {opts.map(([k, l]) => <button key={k} className="pk-press" onClick={() => onChange(k)} style={{ padding: '6px 11px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, background: value === k ? 'var(--card)' : 'transparent', color: value === k ? 'var(--ink)' : 'var(--ink-3)', boxShadow: value === k ? 'var(--shadow)' : 'none' }}>{l}</button>)}
      </div>
    </div>
  );
}
function DataRow({ icon, label, onClick, danger, last }) {
  return (
    <button className="pk-press" onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 2px', borderBottom: last ? 'none' : '1px solid var(--line)', textAlign: 'left' }}>
      <Icon name={icon} size={19} stroke={danger ? 'var(--paprika)' : 'var(--ink-2)'} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: danger ? 'var(--paprika)' : 'var(--ink)' }}>{label}</span>
      <Icon name="chevR" size={17} stroke="var(--ink-3)" />
    </button>
  );
}
