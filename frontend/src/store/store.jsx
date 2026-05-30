// store.jsx — app state: reducer + context + localStorage persistence.
import React from 'react';
import { PKLib } from '../lib/lib.js';

const PKStoreCtx = React.createContext(null);

export function defaultState() {
  return {
    onboarded: false,
    currentDate: PKLib.todayISO(),
    settings: { goal: 100, calGoal: 2000, units: 'g', theme: 'system', diet: 'all', weight: 70, activity: 'moderate' },
    log: {},          // date -> entries[]
    favorites: [],    // recipeId[]
    grocery: [],      // {id, ingredientId, name, qty, unit, aisle, checked}
    plan: {},         // date -> recipeId[]
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': return { ...defaultState(), ...action.state, settings: { ...defaultState().settings, ...(action.state.settings || {}) } };
    case 'ONBOARD_DONE': return { ...state, onboarded: true, settings: { ...state.settings, ...(action.patch || {}) } };
    case 'SET_DATE': return { ...state, currentDate: action.date };
    case 'LOG_ADD': {
      const d = action.entry.date; const list = state.log[d] || [];
      return { ...state, log: { ...state.log, [d]: [...list, action.entry] } };
    }
    case 'LOG_DELETE': {
      const list = (state.log[action.date] || []).filter(e => e.id !== action.id);
      return { ...state, log: { ...state.log, [action.date]: list } };
    }
    case 'RESET_DAY': { const log = { ...state.log }; delete log[action.date]; return { ...state, log }; }
    case 'FAV_TOGGLE': {
      const has = state.favorites.includes(action.recipeId);
      return { ...state, favorites: has ? state.favorites.filter(x => x !== action.recipeId) : [action.recipeId, ...state.favorites] };
    }
    case 'GROCERY_ADD': {
      let g = [...state.grocery];
      action.items.forEach(it => {
        const i = g.findIndex(x => x.ingredientId === it.ingredientId);
        if (i >= 0) g[i] = { ...g[i], qty: g[i].qty + it.qty };
        else g.push({ id: PKLib.uid(), checked: false, ...it });
      });
      return { ...state, grocery: g };
    }
    case 'GROCERY_TOGGLE': return { ...state, grocery: state.grocery.map(x => x.id === action.id ? { ...x, checked: !x.checked } : x) };
    case 'GROCERY_CLEAR_CHECKED': return { ...state, grocery: state.grocery.filter(x => !x.checked) };
    case 'GROCERY_CLEAR_ALL': return { ...state, grocery: [] };
    case 'PLAN_TOGGLE': {
      const list = state.plan[action.date] || [];
      const has = list.includes(action.recipeId);
      const next = has ? list.filter(x => x !== action.recipeId) : [...list, action.recipeId];
      return { ...state, plan: { ...state.plan, [action.date]: next } };
    }
    case 'SETTINGS_SET': return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'CLEAR_ALL': { const s = defaultState(); s.onboarded = true; return s; }
    case 'IMPORT': return { ...defaultState(), ...action.state };
    default: return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, null, () => {
    const saved = PKLib.load();
    return saved ? { ...defaultState(), ...saved, settings: { ...defaultState().settings, ...(saved.settings || {}) } } : defaultState();
  });
  React.useEffect(() => { PKLib.save(state); }, [state]);
  return React.createElement(PKStoreCtx.Provider, { value: { state, dispatch } }, children);
}

export function useStore() { return React.useContext(PKStoreCtx); }

// ---- selectors ----
export function dayTotals(state, date) {
  const list = state.log[date] || [];
  return list.reduce((a, e) => ({ protein: a.protein + (e.protein || 0), kcal: a.kcal + (e.kcal || 0), carbs: a.carbs + (e.carbs || 0), fat: a.fat + (e.fat || 0) }), { protein: 0, kcal: 0, carbs: 0, fat: 0 });
}
export function metGoalDays(state) {
  return Object.keys(state.log).filter(d => dayTotals(state, d).protein >= state.settings.goal);
}
export function streak(state) {
  const met = new Set(metGoalDays(state));
  let cur = 0, best = 0, run = 0;
  // best: scan all met days consecutively
  const all = [...met].sort();
  // current streak ending today/yesterday
  let d = PKLib.todayISO();
  if (!met.has(d)) d = PKLib.addDays(d, -1); // allow yesterday
  while (met.has(d)) { cur++; d = PKLib.addDays(d, -1); }
  // best streak
  for (let i = 0; i < all.length; i++) {
    if (i > 0 && all[i] === PKLib.addDays(all[i - 1], 1)) run++; else run = 1;
    best = Math.max(best, run);
  }
  return { current: cur, best: Math.max(best, cur) };
}
