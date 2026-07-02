// App.jsx — shell: theme, routing (tabs + stack), bottom nav, toast. Fullscreen PWA (no phone frame).
import React from 'react';
import { useStore } from './store/store.jsx';
import { useAuth } from './api/auth.jsx';
import { useCloudSync } from './api/sync.js';
import { PKNavCtx } from './nav.jsx';
import { Icon, Toast } from './components/ui.jsx';
import { Browse } from './pages/Browse.jsx';
import { Today } from './pages/Today.jsx';
import { Planner } from './pages/Planner.jsx';
import { Settings } from './pages/Settings.jsx';
import { Favorites, Grocery } from './pages/Lists.jsx';
import { RecipeDetail, CookMode } from './pages/Detail.jsx';
import { Onboarding } from './pages/Onboarding.jsx';

const TABS = [['browse', 'Browse', 'browse'], ['today', 'Today', 'today'], ['planner', 'Planner', 'planner'], ['settings', 'Settings', 'settings']];

function useEffectiveTheme(pref) {
  const [sysDark, setSysDark] = React.useState(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = e => setSysDark(e.matches); mq.addEventListener('change', h); return () => mq.removeEventListener('change', h);
  }, []);
  return pref === 'system' ? (sysDark ? 'dark' : 'light') : pref;
}

function BottomNav({ tab, go }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'var(--cream)', borderTop: '1px solid var(--line)', padding: '10px 6px 12px', flex: '0 0 auto' }}>
      {TABS.map(([key, label, icon]) => {
        const on = tab === key;
        return (
          <button key={key} className="pk-press" onClick={() => go(key)} aria-label={label} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '2px 14px' }}>
            {on && <span style={{ position: 'absolute', top: -9, width: 22, height: 3, borderRadius: 3, background: 'var(--saffron-deep)' }} />}
            <Icon name={icon} size={23} stroke={on ? 'var(--saffron-deep)' : 'var(--ink-3)'} fill={on ? 'rgba(232,152,60,0.22)' : 'none'} sw={on ? 2 : 1.85} />
            <span style={{ fontSize: 10, fontWeight: on ? 800 : 600, color: on ? 'var(--saffron-deep)' : 'var(--ink-3)' }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Screen({ name, props }) {
  switch (name) {
    case 'detail': return <RecipeDetail recipeId={props.recipeId} />;
    case 'cook': return <CookMode recipeId={props.recipeId} />;
    case 'favorites': return <Favorites />;
    case 'grocery': return <Grocery />;
    default: return null;
  }
}

export function App() {
  const { state, dispatch } = useStore();
  const auth = useAuth();
  const { refresh } = useCloudSync(state, dispatch, auth && auth.user);
  const theme = useEffectiveTheme(state.settings.theme);
  const [tab, setTab] = React.useState('today');
  const [stack, setStack] = React.useState([]);
  const [toast, setToast] = React.useState(null);
  const undoRef = React.useRef(null);
  const toastTimer = React.useRef(null);

  // keep browser theme-color + root background in sync with effective theme.
  // Every bottom-touching surface (html/body, .pk-app, the nav) uses the SAME screen
  // colour (--cream), so the iOS PWA home-indicator safe zone — which paints the root
  // background below the content — is invisible on every screen (no band/strip).
  React.useEffect(() => {
    const cream = theme === 'dark' ? '#17140F' : '#FBF7F0';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', cream);
    document.documentElement.style.background = cream;
    document.body.style.background = cream;
  }, [theme]);

  const notify = React.useCallback((t) => {
    undoRef.current = t.undo || null;
    setToast({ ...t, _id: Math.random() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  const nav = React.useMemo(() => ({
    go: (t) => { setStack([]); setTab(t); },
    push: (screen) => setStack(s => [...s, screen]),
    pop: () => setStack(s => s.slice(0, -1)),
    notify,
    refresh,
  }), [notify, refresh]);

  const top = stack[stack.length - 1];

  return (
    <div className="pk-app" data-theme={theme} style={{ position: 'fixed', inset: 0, background: theme === 'dark' ? '#17140F' : '#FBF7F0', display: 'flex', justifyContent: 'center' }}>
      <div className="pk-shell" style={{ width: '100%', maxWidth: 480, height: '100%', position: 'relative', overflow: 'hidden', background: 'var(--cream)', boxShadow: '0 0 60px rgba(40,25,5,0.18)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--cream)', paddingTop: 'var(--safe-top)' }}>
          <PKNavCtx.Provider value={nav}>
            <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {!state.onboarded ? (
                <Onboarding onDone={(patch) => { dispatch({ type: 'ONBOARD_DONE', patch }); setTab('today'); }} />
              ) : (
                <React.Fragment>
                  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    {tab === 'browse' && <Browse />}
                    {tab === 'today' && <Today />}
                    {tab === 'planner' && <Planner />}
                    {tab === 'settings' && <Settings />}
                  </div>
                  <BottomNav tab={tab} go={nav.go} />
                  {stack.map((s, i) => (
                    <div key={i} style={{ position: 'absolute', inset: 0, background: s.name === 'cook' ? '#000' : 'var(--cream)', zIndex: 20 + i, animation: 'pk-fade .18s ease' }}>
                      <Screen name={s.name} props={s} />
                    </div>
                  ))}
                </React.Fragment>
              )}
              <Toast toast={toast} onUndo={() => { if (undoRef.current) undoRef.current(); setToast(null); }} />
            </div>
          </PKNavCtx.Provider>
        </div>
      </div>
    </div>
  );
}
