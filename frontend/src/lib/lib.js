// lib.js — pure helpers: dates, macro math, storage. Exports PKLib

export const PKLib = (function () {
  // ---- dates (all UTC-consistent so keys never drift across timezones) ----
  function toISO(d) { return d.toISOString().slice(0, 10); }
  function todayISO() { return toISO(new Date()); }
  function parseISO(iso) { return new Date(iso + 'T00:00:00Z'); }
  function addDays(iso, n) { const d = parseISO(iso); d.setUTCDate(d.getUTCDate() + n); return toISO(d); }
  function fmtDate(iso) {
    return parseISO(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }
  function relDay(iso) {
    const t = todayISO();
    if (iso === t) return 'Today';
    if (iso === addDays(t, -1)) return 'Yesterday';
    if (iso === addDays(t, 1)) return 'Tomorrow';
    return parseISO(iso).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  }
  function weekStart(iso) { // Monday-start
    const day = (parseISO(iso).getUTCDay() + 6) % 7;
    return addDays(iso, -day);
  }

  // ---- macro scaling ----
  function scaleRecipe(recipe, servings) {
    const f = servings / (recipe.servings || 1);
    return {
      protein: Math.round(recipe.proteinPerServing * (servings)),
      kcal: Math.round((recipe.caloriesPerServing || 0) * servings),
      carbs: Math.round((recipe.carbsPerServing || 0) * servings),
      fat: Math.round((recipe.fatPerServing || 0) * servings),
    };
  }
  // per-serving macros multiplied by qty servings (recipe macros are already per-serving)
  function macrosForServings(recipe, servings) {
    return {
      protein: +(recipe.proteinPerServing * servings).toFixed(0),
      kcal: Math.round((recipe.caloriesPerServing || 0) * servings),
      carbs: +((recipe.carbsPerServing || 0) * servings).toFixed(0),
      fat: +((recipe.fatPerServing || 0) * servings).toFixed(0),
    };
  }
  // scale an ingredient quantity when servings change from the recipe default
  function scaledIngredientGrams(recipe, ingredientRef, servings) {
    const f = servings / (recipe.servings || 1);
    return Math.round(ingredientRef.quantityGrams * f);
  }
  function ingredientProteinContribution(ingredientRef, ingredient, recipe, servings) {
    const grams = scaledIngredientGrams(recipe, ingredientRef, servings);
    return +(grams * (ingredient.proteinPer100g || 0) / 100).toFixed(1);
  }

  // ---- units ----
  function gToOz(g) { return +(g / 28.3495).toFixed(1); }
  function fmtProtein(g, units) { return units === 'oz' ? gToOz(g) + 'oz' : Math.round(g) + 'g'; }

  // ---- weight helper ----
  function suggestGoal(weightKg, activity) {
    const perKg = { low: 1.6, moderate: 1.9, high: 2.2 }[activity] || 1.8;
    return Math.round(weightKg * perKg / 5) * 5;
  }

  // ---- storage ----
  const KEY = 'protein_kitchen_v1';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function clearAll() { try { localStorage.removeItem(KEY); } catch (e) {} }

  function uid() { return Math.random().toString(36).slice(2, 9); }

  return { toISO, todayISO, parseISO, addDays, fmtDate, relDay, weekStart, scaleRecipe, macrosForServings, scaledIngredientGrams, ingredientProteinContribution, gToOz, fmtProtein, suggestGoal, load, save, clearAll, uid };
})();
