// main.jsx — entry: mount App + StoreProvider, register PWA service worker.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from './store/store.jsx';
import { AuthProvider } from './api/auth.jsx';
import { App } from './App.jsx';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  React.createElement(StoreProvider, null,
    React.createElement(AuthProvider, null,
      React.createElement(App)))
);
