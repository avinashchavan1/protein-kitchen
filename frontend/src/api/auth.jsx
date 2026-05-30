// auth.jsx — auth context backed by Google Identity Services + backend JWT.
// Degrades gracefully: if no API or no Google client id, `enabled` is false and
// the app stays in local-only mode.
import React from 'react';
import { api, apiEnabled, getToken, setToken, getStoredUser, setStoredUser } from './client.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const AuthCtx = React.createContext(null);
export function useAuth() { return React.useContext(AuthCtx); }

let gisPromise = null;
function loadGis() {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
  return gisPromise;
}

export function AuthProvider({ children }) {
  const enabled = apiEnabled() && !!GOOGLE_CLIENT_ID;
  const [user, setUser] = React.useState(() => getStoredUser());
  const [ready, setReady] = React.useState(!enabled);

  const handleCredential = React.useCallback(async (resp) => {
    try {
      const out = await api('/api/auth/google', { method: 'POST', auth: false, body: { idToken: resp.credential } });
      setToken(out.token); setStoredUser(out.user); setUser(out.user);
    } catch (e) { console.warn('Google login failed', e); }
  }, []);

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loadGis().then(() => {
      if (cancelled) return;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential });
      setReady(true);
      // refresh profile if we already hold a token
      if (getToken()) api('/api/auth/me').then(u => { setStoredUser(u); setUser(u); }).catch(() => {});
    }).catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [enabled, handleCredential]);

  const login = React.useCallback(() => {
    if (!ready || !window.google?.accounts?.id) return;
    window.google.accounts.id.prompt();
  }, [ready]);

  const renderButton = React.useCallback((el) => {
    if (!ready || !el || !window.google?.accounts?.id) return;
    window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with' });
  }, [ready]);

  const logout = React.useCallback(() => {
    setToken(null); setStoredUser(null); setUser(null);
    try { window.google?.accounts?.id?.disableAutoSelect(); } catch {}
  }, []);

  const value = { enabled, ready, user, login, logout, renderButton };
  return React.createElement(AuthCtx.Provider, { value }, children);
}
