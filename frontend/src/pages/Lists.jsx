// Lists.jsx — Favorites + Grocery overlay pages.
import React from 'react';
import { useStore } from '../store/store.jsx';
import { useNav, getRecipe } from '../nav.jsx';
import { PK_DATA } from '../data/data.js';
import { Icon, EmptyState, PullToRefresh } from '../components/ui.jsx';
import { RecipeCardGrid } from '../components/cards.jsx';

function OverlayHeader({ title, onBack, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 10px', flex: '0 0 auto' }}>
      <button className="pk-press" onClick={onBack} aria-label="Back" style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={20} /></button>
      <div className="num" style={{ fontSize: 22, flex: 1 }}>{title}</div>
      {right}
    </div>
  );
}

export function Favorites() {
  const { state } = useStore();
  const nav = useNav();
  const favs = state.favorites.map(getRecipe).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <OverlayHeader title={`Favorites${favs.length ? ' · ' + favs.length : ''}`} onBack={nav.pop} />
      <PullToRefresh onRefresh={nav.refresh} style={{ flex: 1, padding: '0 16px 16px' }}>
        {favs.length === 0
          ? <EmptyState icon="heart" title="No favorites yet" body="Tap the heart on any recipe to save it here for quick access." cta="Browse recipes" onCta={() => nav.go('browse')} />
          : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{favs.map(r => <RecipeCardGrid key={r.id} recipe={r} />)}</div>}
      </PullToRefresh>
    </div>
  );
}

const AISLE_LABEL = { produce: 'Produce', dairy: 'Dairy & eggs', meat: 'Meat & fish', pantry: 'Pantry', spices: 'Spices' };

export function Grocery() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const items = state.grocery;
  const checkedCount = items.filter(i => i.checked).length;
  const byAisle = PK_DATA.aisles.map(a => ({ aisle: a, items: items.filter(i => i.aisle === a) })).filter(g => g.items.length);

  const fmtQty = (it) => it.unit === 'piece' ? `${Math.round(it.qty / 50) || 1} pcs` : it.unit === 'ml' ? `${it.qty} ml` : it.qty >= 1000 ? `${(it.qty / 1000).toFixed(1)} kg` : `${it.qty} g`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <OverlayHeader title={`Grocery${items.length ? ' · ' + items.length : ''}`} onBack={nav.pop}
        right={items.length > 0 && <button className="pk-press" onClick={() => dispatch({ type: 'GROCERY_CLEAR_ALL' })} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--paprika)', padding: '8px 10px' }}>Clear</button>} />
      <PullToRefresh onRefresh={nav.refresh} style={{ flex: 1, padding: '0 16px 16px' }}>
        {items.length === 0
          ? <EmptyState icon="cart" title="Grocery list is empty" body="Add ingredients from any recipe or send a week from the planner." cta="Browse recipes" onCta={() => nav.go('browse')} />
          : (
            <React.Fragment>
              {byAisle.map(g => (
                <div key={g.aisle} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 9 }}>{AISLE_LABEL[g.aisle] || g.aisle}</div>
                  <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                    {g.items.map((it, i) => (
                      <button key={it.id} className="pk-press" onClick={() => dispatch({ type: 'GROCERY_TOGGLE', id: it.id })}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? '1px solid var(--line)' : 'none', textAlign: 'left' }}>
                        <span style={{ width: 22, height: 22, borderRadius: 7, border: '1.8px solid ' + (it.checked ? 'var(--basil)' : 'var(--line)'), background: it.checked ? 'var(--basil)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                          {it.checked && <Icon name="check" size={13} stroke="#fff" sw={2.6} />}
                        </span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, textDecoration: it.checked ? 'line-through' : 'none', opacity: it.checked ? 0.45 : 1 }}>{it.name}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', opacity: it.checked ? 0.45 : 1 }}>{fmtQty(it)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {checkedCount > 0 && (
                <button className="pk-press" onClick={() => dispatch({ type: 'GROCERY_CLEAR_CHECKED' })} style={{ width: '100%', padding: 14, borderRadius: 14, background: 'var(--cream-2)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)' }}>Clear {checkedCount} checked item{checkedCount > 1 ? 's' : ''}</button>
              )}
            </React.Fragment>
          )}
      </PullToRefresh>
    </div>
  );
}
