// cards.jsx — shared recipe cards (grid / minimal / feed) + LogSheet.
import React from 'react';
import { useStore } from '../store/store.jsx';
import { useNav } from '../nav.jsx';
import { PKLib } from '../lib/lib.js';
import { Thumb, Icon, DietDot, Spice, MacroBar, Chip, Stepper, Sheet } from './ui.jsx';

// data-rich grid card (E1 + D2). Big protein, macro bar, badges.
export function RecipeCardGrid({ recipe }) {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const fav = state.favorites.includes(recipe.id);
  return (
    <div className="pk-press" onClick={() => nav.push({ name: 'detail', recipeId: recipe.id })}
      style={{ background: 'var(--card)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
      <Thumb cat={recipe.category} style={{ height: 96 }}>
        <button className="pk-press" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'FAV_TOGGLE', recipeId: recipe.id }); }}
          aria-label="Favorite" style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="heart" size={16} stroke={fav ? 'var(--paprika)' : 'var(--ink-3)'} fill={fav ? 'var(--paprika)' : 'none'} />
        </button>
        <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: '3px 8px', display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span className="num" style={{ fontSize: 17, color: 'var(--saffron-deep)' }}>{recipe.proteinPerServing}</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--ink-2)' }}>g</span>
        </div>
      </Thumb>
      <div style={{ padding: '9px 11px 11px', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <DietDot type={recipe.dietType} size={11} />
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{recipe.category}</span>
          <span style={{ marginLeft: 'auto' }}><Spice level={recipe.spiceLevel} /></span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.18, minHeight: 30 }}>{recipe.title}</div>
        <MacroBar protein={recipe.proteinPerServing} carbs={recipe.carbsPerServing} fat={recipe.fatPerServing} height={6} />
        <div style={{ display: 'flex', gap: 10, fontSize: 10.5, fontWeight: 700, color: 'var(--ink-3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="clock" size={12} stroke="var(--ink-3)" />{recipe.timeMinutes}m</span>
          <span>{recipe.caloriesPerServing} cal</span>
          <span style={{ textTransform: 'capitalize' }}>{recipe.difficulty}</span>
        </div>
      </div>
    </div>
  );
}

// editorial feed card (E3 + C2 rich photographic)
export function FeedCard({ recipe, eyebrow }) {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const fav = state.favorites.includes(recipe.id);
  return (
    <div className="pk-press" onClick={() => nav.push({ name: 'detail', recipeId: recipe.id })} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
        <DietDot type={recipe.dietType} size={12} />
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--saffron-deep)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{eyebrow || (recipe.category + ' · ' + recipe.difficulty)}</span>
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.12, marginBottom: 9, textWrap: 'pretty' }}>{recipe.title}</div>
      <Thumb cat={recipe.category} style={{ height: 150, borderRadius: 18 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(40,20,5,0.4), transparent 55%)' }} />
        <button className="pk-press" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'FAV_TOGGLE', recipeId: recipe.id }); }}
          aria-label="Favorite" style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="heart" size={18} stroke={fav ? 'var(--paprika)' : 'var(--ink-2)'} fill={fav ? 'var(--paprika)' : 'none'} />
        </button>
        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.94)', borderRadius: 13, padding: '6px 12px', display: 'flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap' }}>
          <span className="num" style={{ fontSize: 22, color: 'var(--saffron-deep)' }}>{recipe.proteinPerServing}</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--ink-2)' }}>g protein</span>
        </div>
      </Thumb>
      <div style={{ display: 'flex', gap: 16, marginTop: 11, fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={13} stroke="var(--ink-3)" />{recipe.timeMinutes} min</span>
        <span>{recipe.caloriesPerServing} cal</span>
        <span style={{ textTransform: 'capitalize' }}>{recipe.difficulty}</span>
      </div>
    </div>
  );
}

// clean minimal row (C1) — used in search results / compact list
export function RecipeRowMinimal({ recipe, divider }) {
  const nav = useNav();
  return (
    <div className="pk-press" onClick={() => nav.push({ name: 'detail', recipeId: recipe.id })}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: divider ? '1px solid var(--line)' : 'none', cursor: 'pointer' }}>
      <Thumb cat={recipe.category} style={{ width: 52, height: 52, borderRadius: 14, flex: '0 0 auto' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <DietDot type={recipe.dietType} size={11} />
          <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase' }}>{recipe.category}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>{recipe.title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{recipe.timeMinutes} min · {recipe.caloriesPerServing} cal</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span className="num" style={{ fontSize: 23 }}>{recipe.proteinPerServing}</span>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>g protein</div>
      </div>
    </div>
  );
}

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

// LogSheet — pick servings + meal, add to today's (or current) log
export function LogSheet({ recipe, open, onClose, defaultServings = 1 }) {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const [servings, setServings] = React.useState(defaultServings);
  const [meal, setMeal] = React.useState(recipe ? recipe.mealType : 'lunch');
  React.useEffect(() => { if (open && recipe) { setServings(defaultServings); setMeal(recipe.mealType || 'lunch'); } }, [open, recipe]);
  if (!recipe) return null;
  const m = PKLib.macrosForServings(recipe, servings);
  const add = () => {
    dispatch({ type: 'LOG_ADD', entry: { id: PKLib.uid(), date: state.currentDate, recipeId: recipe.id, name: recipe.title, cat: recipe.category, servings, meal, ...m } });
    if (navigator.vibrate) navigator.vibrate(12);
    onClose();
    nav.notify({ msg: `Logged ${m.protein}g protein`, icon: 'check' });
  };
  return (
    <Sheet open={open} onClose={onClose} title="Add to log">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Thumb cat={recipe.category} style={{ width: 52, height: 52, borderRadius: 14 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{recipe.title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{recipe.proteinPerServing}g protein / serving</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Servings</span>
        <Stepper value={servings} onChange={setServings} min={0.5} max={10} step={0.5} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 8 }}>Meal</div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 18 }}>
        {MEAL_TYPES.map(mt => <Chip key={mt} active={meal === mt} onClick={() => setMeal(mt)}>{mt[0].toUpperCase() + mt.slice(1)}</Chip>)}
      </div>
      <div style={{ display: 'flex', gap: 8, background: 'var(--cream-2)', borderRadius: 16, padding: 14, marginBottom: 16 }}>
        {[['Protein', m.protein + 'g', 'var(--basil)'], ['Calories', m.kcal, 'var(--saffron-deep)'], ['Carbs', m.carbs + 'g', 'var(--teal)'], ['Fat', m.fat + 'g', 'var(--egg)']].map(([l, v, c]) => (
          <div key={l} style={{ flex: 1, textAlign: 'center' }}>
            <div className="num" style={{ fontSize: 18, color: c }}>{v}</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--ink-3)', marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>
      <button className="pk-press" onClick={add} style={{ width: '100%', background: 'var(--saffron)', color: '#fff', fontWeight: 800, fontSize: 15.5, padding: '15px', borderRadius: 16 }}>
        Add {m.protein}g to {PKLib.relDay(state.currentDate)}
      </button>
    </Sheet>
  );
}
