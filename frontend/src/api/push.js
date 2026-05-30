// push.js — browser Web Push subscription against the backend VAPID key.
import { api, apiEnabled } from './client.js';

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSupported() {
  return apiEnabled() && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function enablePush() {
  if (!pushSupported()) throw new Error('Push not supported');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Permission denied');

  const { publicKey, configured } = await api('/api/push/key', { auth: false });
  if (!configured || !publicKey) throw new Error('Push not configured on server');

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }
  const json = sub.toJSON();
  await api('/api/push/subscribe', { method: 'POST', body: {
    endpoint: sub.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth,
  } });
  return true;
}

export async function disablePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await api('/api/push/unsubscribe', { method: 'POST', body: { endpoint: sub.endpoint } }).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
}

export async function sendTestPush() { return api('/api/push/test', { method: 'POST' }); }
