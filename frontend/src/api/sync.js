// sync.js — per-user cloud sync hook. Pull on login, debounced push on change.
import React from 'react';
import { api, apiEnabled, getToken } from './client.js';

const SYNCED_KEYS = ['onboarded', 'settings', 'log', 'favorites', 'grocery', 'plan'];
function pick(state) { const o = {}; SYNCED_KEYS.forEach(k => { o[k] = state[k]; }); return o; }
function isEmptyDoc(d) {
  if (!d || typeof d !== 'object') return true;
  return !d.log && !d.favorites && !d.grocery && !d.plan && d.onboarded === undefined;
}

export function useCloudSync(state, dispatch, user) {
  const active = apiEnabled() && !!user && !!getToken();
  const pulledRef = React.useRef(false);
  const timerRef = React.useRef(null);
  const lastSentRef = React.useRef('');

  // pull once when a user becomes active
  React.useEffect(() => {
    if (!active) { pulledRef.current = false; return; }
    let cancelled = false;
    (async () => {
      try {
        const out = await api('/api/sync');
        if (cancelled) return;
        if (isEmptyDoc(out.data)) {
          // fresh account — seed server from current local state
          const payload = pick(state);
          lastSentRef.current = JSON.stringify(payload);
          await api('/api/sync', { method: 'PUT', body: payload });
        } else {
          lastSentRef.current = JSON.stringify(out.data);
          dispatch({ type: 'IMPORT', state: out.data });
        }
      } catch (e) { console.warn('sync pull failed', e); }
      finally { pulledRef.current = true; }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // debounced push on state change
  React.useEffect(() => {
    if (!active || !pulledRef.current) return;
    const payload = pick(state);
    const serialized = JSON.stringify(payload);
    if (serialized === lastSentRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try { await api('/api/sync', { method: 'PUT', body: payload }); lastSentRef.current = serialized; }
      catch (e) { console.warn('sync push failed', e); }
    }, 1200);
    return () => clearTimeout(timerRef.current);
  }, [active, state]);
}
