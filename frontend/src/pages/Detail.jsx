// Detail.jsx — Recipe detail + cook mode.
import React from 'react';
import { useStore } from '../store/store.jsx';
import { useNav, getRecipe } from '../nav.jsx';
import { PK_DATA } from '../data/data.js';
import { PKLib } from '../lib/lib.js';
import { Thumb, Icon, DietDot, StatBox, MacroBar, Stepper, PullToRefresh } from '../components/ui.jsx';
import { LogSheet } from '../components/cards.jsx';

export function RecipeDetail({ recipeId }) {
  const recipe = getRecipe(recipeId);
  const { state, dispatch } = useStore();
  const nav = useNav();
  const [cookServings, setCookServings] = React.useState(recipe.servings || 1);
  const [checked, setChecked] = React.useState({});
  const [logOpen, setLogOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const fav = state.favorites.includes(recipe.id);
  const ingMap = Object.fromEntries(PK_DATA.ingredients.map(i => [i.id, i]));

  // stat boxes & macro breakdown always show PER-SERVING (matches recipe cards).
  const perServing = { protein: recipe.proteinPerServing, kcal: recipe.caloriesPerServing, carbs: recipe.carbsPerServing, fat: recipe.fatPerServing, fibre: recipe.fibrePerServing };
  // the stepper scales only the ingredient list (for cooking & grocery).
  const ingredientsSorted = [...(recipe.ingredients || [])].map(ref => {
    const ing = ingMap[ref.ingredientId] || { name: ref.ingredientId, proteinPer100g: 0 };
    const grams = PKLib.scaledIngredientGrams(recipe, ref, cookServings);
    const protein = +(grams * (ing.proteinPer100g || 0) / 100).toFixed(1);
    return { ref, ing, grams, protein };
  }).sort((a, b) => b.protein - a.protein);

  const addGrocery = () => {
    const items = (recipe.ingredients || []).map(ref => {
      const ing = ingMap[ref.ingredientId] || {};
      return { ingredientId: ref.ingredientId, name: ing.name || ref.ingredientId, qty: PKLib.scaledIngredientGrams(recipe, ref, cookServings), unit: ing.defaultUnit || 'g', aisle: ing.aisle || 'pantry' };
    });
    dispatch({ type: 'GROCERY_ADD', items });
    nav.notify({ msg: `${items.length} ingredients added to grocery`, icon: 'cart' });
  };
  const share = async () => {
    try { if (navigator.share) await navigator.share({ title: recipe.title, text: `${recipe.title} — ${recipe.proteinPerServing}g protein` }); else nav.notify({ msg: 'Link copied', icon: 'share' }); }
    catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: scrolled ? 'var(--card)' : 'transparent', borderBottom: scrolled ? '1px solid var(--line)' : 'none', transition: 'background .2s' }}>
        <button className="pk-press" onClick={nav.pop} aria-label="Back" style={roundBtn(scrolled)}><Icon name="back" size={20} /></button>
        {scrolled && <span style={{ fontSize: 14, fontWeight: 700, flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0 8px' }}>{recipe.title}</span>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pk-press" onClick={() => dispatch({ type: 'FAV_TOGGLE', recipeId: recipe.id })} aria-label="Favorite" style={roundBtn(scrolled)}><Icon name="heart" size={19} stroke={fav ? 'var(--paprika)' : 'currentColor'} fill={fav ? 'var(--paprika)' : 'none'} /></button>
          <button className="pk-press" onClick={share} aria-label="Share" style={roundBtn(scrolled)}><Icon name="share" size={18} /></button>
        </div>
      </div>

      <PullToRefresh onRefresh={nav.refresh} onScroll={e => setScrolled(e.target.scrollTop > 150)} style={{ flex: 1 }}>
        <Thumb cat={recipe.category} src={recipe.image} alt={recipe.title} style={{ height: 230 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(40,20,5,0.25), transparent 30%, transparent 70%, var(--cream))' }} />
        </Thumb>
        <div style={{ padding: '0 18px 120px', marginTop: -28, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <DietDot type={recipe.dietType} size={14} label />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{recipe.category}</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}><Icon name="star" size={14} stroke="var(--turmeric)" fill="var(--turmeric)" />4.8</span>
          </div>
          <div className="num" style={{ fontSize: 27, lineHeight: 1.05, marginBottom: 8 }}>{recipe.title}</div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 16 }}>{recipe.description}</div>

          {/* key stats — per serving */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <StatBox value={perServing.protein} unit="g" label="Protein" accent="var(--basil)" />
            <StatBox value={perServing.kcal} label="Calories" accent="var(--saffron-deep)" />
            <StatBox value={recipe.timeMinutes} unit="min" label="Time" />
            <StatBox value={recipe.servings} label="Makes" />
          </div>

          {/* macro breakdown — per serving */}
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 11, gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Macro breakdown</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>per serving</span>
            </div>
            <MacroBar protein={perServing.protein} carbs={perServing.carbs} fat={perServing.fat} height={11} showLabels />
            {perServing.fibre != null && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>Dietary fibre</span>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--basil)' }}>{perServing.fibre}g</span>
              </div>
            )}
          </div>

          {/* servings stepper — scales ingredients only */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--cream-2)', borderRadius: 16, padding: '12px 16px', marginBottom: 20 }}>
            <div><div style={{ fontSize: 14, fontWeight: 700 }}>Cooking for</div><div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>Scales the ingredient list</div></div>
            <Stepper value={cookServings} onChange={setCookServings} min={1} max={12} step={1} />
          </div>

          {/* ingredients */}
          <SectionH>Ingredients <span style={{ fontWeight: 600, color: 'var(--ink-3)', fontSize: 13 }}>· for {cookServings} serving{cookServings > 1 ? 's' : ''}</span></SectionH>
          <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)', marginBottom: 22 }}>
            {ingredientsSorted.map(({ ref, ing, grams, protein }, i) => (
              <button key={ref.ingredientId} className="pk-press" onClick={() => setChecked(c => ({ ...c, [ref.ingredientId]: !c[ref.ingredientId] }))}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderTop: i ? '1px solid var(--line)' : 'none', textAlign: 'left' }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, border: '1.8px solid ' + (checked[ref.ingredientId] ? 'var(--basil)' : 'var(--line)'), background: checked[ref.ingredientId] ? 'var(--basil)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                  {checked[ref.ingredientId] && <Icon name="check" size={13} stroke="#fff" sw={2.6} />}
                </span>
                <img src={ing.image} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }}
                  style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', flex: '0 0 auto', background: 'var(--cream-2)', opacity: checked[ref.ingredientId] ? 0.5 : 1 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, textDecoration: checked[ref.ingredientId] ? 'line-through' : 'none', opacity: checked[ref.ingredientId] ? 0.5 : 1 }}>{ing.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>{grams >= 1000 ? (grams / 1000).toFixed(1) + ' kg' : grams + ' g'}</div>
                </div>
                <div style={{ textAlign: 'right', flex: '0 0 auto' }}><span className="num" style={{ fontSize: 15, color: 'var(--basil)' }}>+{protein}</span><div style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>g protein</div></div>
              </button>
            ))}
          </div>

          {/* steps */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <SectionH noMargin>Method <span style={{ fontWeight: 600, color: 'var(--ink-3)', fontSize: 13 }}>· {recipe.steps.length} steps</span></SectionH>
            <button className="pk-press" onClick={() => nav.push({ name: 'cook', recipeId: recipe.id })} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#fff', background: 'var(--ink)', padding: '9px 14px', borderRadius: 12 }}><Icon name="flame" size={15} stroke="var(--turmeric)" />Cook mode</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recipe.steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 13 }}>
                <span className="num" style={{ width: 28, height: 28, borderRadius: 10, background: 'var(--cream-2)', color: 'var(--saffron-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flex: '0 0 auto' }}>{i + 1}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)', paddingTop: 4 }}>{s}</span>
              </div>
            ))}
          </div>

          {/* videos */}
          {recipe.videos && recipe.videos.length > 0 && (
            <div style={{ marginTop: 26 }}>
              <SectionH>Watch how to make it</SectionH>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recipe.videos.map(v => (
                  <a key={v.id} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer"
                    className="pk-press" style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--card)', borderRadius: 14, padding: 8, boxShadow: 'var(--shadow)', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', width: 124, height: 70, borderRadius: 10, overflow: 'hidden', flex: '0 0 auto', background: 'var(--cream-2)' }}>
                      <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt={v.title} loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(20,12,4,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                        </span>
                      </span>
                      {v.length && <span style={{ position: 'absolute', right: 4, bottom: 4, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 4px', borderRadius: 4 }}>{v.length}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.32, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.title}</div>
                      {v.channel && <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.channel}</div>}
                    </div>
                  </a>
                ))}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-3)', marginTop: 10, textAlign: 'center' }}>Videos from YouTube · opens in YouTube</div>
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* sticky action bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px calc(12px + var(--safe-bottom))', background: 'var(--card)', borderTop: '1px solid var(--line)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="pk-press" onClick={addGrocery} aria-label="Add to grocery" style={sqBtn}><Icon name="cart" size={21} /></button>
        <button className="pk-press" onClick={() => dispatch({ type: 'FAV_TOGGLE', recipeId: recipe.id })} aria-label="Favorite" style={sqBtn}><Icon name="heart" size={21} stroke={fav ? 'var(--paprika)' : 'currentColor'} fill={fav ? 'var(--paprika)' : 'none'} /></button>
        <button className="pk-press" onClick={() => setLogOpen(true)} style={{ flex: 1, background: 'var(--saffron)', color: '#fff', fontWeight: 800, fontSize: 15.5, padding: '15px', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap' }}><Icon name="plus" size={19} stroke="#fff" sw={2.4} />Add {perServing.protein}g to log</button>
      </div>

      <LogSheet recipe={recipe} open={logOpen} onClose={() => setLogOpen(false)} defaultServings={1} />

    </div>
  );
}
const roundBtn = (solid) => ({ width: 38, height: 38, borderRadius: 19, background: solid ? 'var(--cream-2)' : 'rgba(255,255,255,0.92)', color: '#221E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: solid ? 'none' : '0 2px 8px rgba(0,0,0,0.12)', flex: '0 0 auto' });
const sqBtn = { width: 50, height: 50, borderRadius: 15, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' };
function SectionH({ children, noMargin }) { return <div style={{ fontSize: 17, fontWeight: 700, marginBottom: noMargin ? 0 : 12 }}>{children}</div>; }

export function CookMode({ recipeId }) {
  const recipe = getRecipe(recipeId);
  const nav = useNav();
  const [i, setI] = React.useState(0);
  const [awake, setAwake] = React.useState(false);
  const lockRef = React.useRef(null);
  React.useEffect(() => {
    let cancelled = false;
    async function lock() { try { if ('wakeLock' in navigator) { lockRef.current = await navigator.wakeLock.request('screen'); if (!cancelled) setAwake(true); } } catch (e) {} }
    lock();
    return () => { cancelled = true; try { lockRef.current && lockRef.current.release(); } catch (e) {} };
  }, []);
  const total = recipe.steps.length;
  const prev = () => setI(x => Math.max(0, x - 1));
  const next = () => { if (i < total - 1) setI(i + 1); else nav.pop(); };
  return (
    <div className="pk-app" data-theme="dark" style={{ height: '100%', background: 'var(--cream)', display: 'flex', flexDirection: 'column', color: 'var(--ink)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
        <button className="pk-press" onClick={nav.pop} aria-label="Close" style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={20} /></button>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{awake && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="awake" size={14} stroke="var(--turmeric)" />Screen on · </span>}Cook mode</span>
        <span className="num" style={{ fontSize: 15 }}>{i + 1}/{total}</span>
      </div>
      <div style={{ display: 'flex', gap: 5, padding: '4px 16px 0' }}>
        {recipe.steps.map((_, k) => <div key={k} style={{ flex: 1, height: 4, borderRadius: 4, background: k <= i ? 'var(--saffron)' : 'var(--cream-2)' }} />)}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 28px' }}>
        <div className="num" style={{ fontSize: 15, color: 'var(--saffron)', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step {i + 1}</div>
        <div style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.32, textWrap: 'pretty' }}>{recipe.steps[i]}</div>
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '16px 20px calc(20px + var(--safe-bottom))' }}>
        <button className="pk-press" onClick={prev} disabled={i === 0} style={{ flex: 1, padding: 17, borderRadius: 16, background: 'var(--cream-2)', fontWeight: 800, fontSize: 15, opacity: i === 0 ? 0.4 : 1 }}>Back</button>
        <button className="pk-press" onClick={next} style={{ flex: 2, padding: 17, borderRadius: 16, background: 'var(--saffron)', color: '#fff', fontWeight: 800, fontSize: 15 }}>{i < total - 1 ? 'Next step' : 'Finish 🎉'}</button>
      </div>
    </div>
  );
}
