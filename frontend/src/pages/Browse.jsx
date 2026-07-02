// Browse.jsx — Browse: Discover feed + All grid w/ search, filters, sort.
import React from 'react';
import { useStore } from '../store/store.jsx';
import { useNav } from '../nav.jsx';
import { PK_DATA } from '../data/data.js';
import { Icon, Chip, Sheet, EmptyState, PullToRefresh } from '../components/ui.jsx';
import { RecipeCardGrid, FeedCard, RecipeRowMinimal, MEAL_TYPES } from '../components/cards.jsx';

const SORTS = { protein: 'Protein ↓', time: 'Fastest', calories: 'Calories ↑', ppc: 'Protein/cal ↓' };

export function Browse() {
  const { state } = useStore();
  const nav = useNav();
  const recipes = PK_DATA.recipes;
  const [view, setView] = React.useState('discover'); // discover | all
  const [layout, setLayout] = React.useState('grid');  // grid | list
  const [q, setQ] = React.useState('');
  const [dq, setDq] = React.useState(''); // debounced
  const [cats, setCats] = React.useState([]);
  const [diets, setDiets] = React.useState([]);
  const [meals, setMeals] = React.useState([]);
  const [diff, setDiff] = React.useState([]);
  const [maxTime, setMaxTime] = React.useState(null);
  const [tags, setTags] = React.useState([]);
  const [hp, setHp] = React.useState(false);
  const [sort, setSort] = React.useState('protein');
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);

  React.useEffect(() => { const t = setTimeout(() => setDq(q.trim().toLowerCase()), 180); return () => clearTimeout(t); }, [q]);

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  const activeCount = cats.length + diets.length + meals.length + diff.length + tags.length + (maxTime ? 1 : 0) + (hp ? 1 : 0);
  const clearAll = () => { setCats([]); setDiets([]); setMeals([]); setDiff([]); setTags([]); setMaxTime(null); setHp(false); setQ(''); };

  const allCats = [...new Set(recipes.map(r => r.category))];
  const allTags = [...new Set(recipes.flatMap(r => r.tags || []))];

  const ingName = (id) => (PK_DATA.ingredients.find(x => x.id === id) || {}).name || '';
  const filtered = React.useMemo(() => {
    let list = recipes.filter(r => {
      if (state.settings.diet === 'veg' && r.dietType === 'nonveg') return false;
      if (state.settings.diet === 'vegan' && r.dietType !== 'vegan') return false;
      if (hp && r.proteinPerServing < 25) return false;
      if (cats.length && !cats.includes(r.category)) return false;
      if (diets.length && !diets.includes(r.dietType)) return false;
      if (meals.length && !meals.includes(r.mealType)) return false;
      if (diff.length && !diff.includes(r.difficulty)) return false;
      if (maxTime && r.timeMinutes > maxTime) return false;
      if (tags.length && !tags.every(t => (r.tags || []).includes(t))) return false;
      if (dq) {
        const hay = (r.title + ' ' + r.category + ' ' + (r.ingredients || []).map(i => ingName(i.ingredientId)).join(' ')).toLowerCase();
        if (!hay.includes(dq)) return false;
      }
      return true;
    });
    const ppc = r => r.proteinPerServing / (r.caloriesPerServing || 1);
    list.sort((a, b) => sort === 'time' ? a.timeMinutes - b.timeMinutes : sort === 'calories' ? a.caloriesPerServing - b.caloriesPerServing : sort === 'ppc' ? ppc(b) - ppc(a) : b.proteinPerServing - a.proteinPerServing);
    return list;
  }, [recipes, dq, cats, diets, meals, diff, maxTime, tags, hp, sort, state.settings.diet]);

  const topPick = [...recipes].sort((a, b) => b.proteinPerServing - a.proteinPerServing)[0];
  const quick = recipes.filter(r => r.timeMinutes <= 20);
  const vegHi = recipes.filter(r => r.dietType !== 'nonveg' && r.proteinPerServing >= 25);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header view={view} setView={setView} nav={nav} />
      {view === 'discover'
        ? <DiscoverFeed topPick={topPick} quick={quick} vegHi={vegHi} />
        : <AllRecipes {...{ q, setQ, layout, setLayout, hp, setHp, cats, setCats, allCats, toggle, activeCount, clearAll, sort, setSortOpen, filtered, setFiltersOpen }} />}
      <FiltersSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} {...{ diets, setDiets, meals, setMeals, diff, setDiff, maxTime, setMaxTime, tags, setTags, allTags, toggle, clearAll, count: filtered.length }} />
      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        {Object.entries(SORTS).map(([k, v]) => (
          <button key={k} className="pk-press" onClick={() => { setSort(k); setSortOpen(false); }}
            style={{ width: '100%', textAlign: 'left', padding: '14px 4px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: sort === k ? 800 : 500, color: sort === k ? 'var(--saffron-deep)' : 'var(--ink)' }}>
            {v}{sort === k && <Icon name="check" size={18} stroke="var(--saffron-deep)" />}
          </button>
        ))}
      </Sheet>
    </div>
  );
}

function Header({ view, setView, nav }) {
  return (
    <div style={{ padding: '4px 16px 10px', flex: '0 0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="num" style={{ fontSize: 26 }}>Browse</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pk-press" onClick={() => nav.push({ name: 'favorites' })} aria-label="Favorites" style={iconBtn}><Icon name="heart" size={20} /></button>
          <button className="pk-press" onClick={() => nav.push({ name: 'grocery' })} aria-label="Grocery" style={iconBtn}><Icon name="cart" size={20} /></button>
        </div>
      </div>
      <div style={{ display: 'flex', background: 'var(--cream-2)', borderRadius: 13, padding: 4, gap: 4 }}>
        {[['discover', 'Discover'], ['all', 'All recipes']].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} className="pk-press" style={{ flex: 1, padding: '9px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, background: view === k ? 'var(--card)' : 'transparent', color: view === k ? 'var(--ink)' : 'var(--ink-3)', boxShadow: view === k ? 'var(--shadow)' : 'none' }}>{l}</button>
        ))}
      </div>
    </div>
  );
}
const iconBtn = { width: 38, height: 38, borderRadius: 12, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' };

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--saffron-deep)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sub}</div>
      <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{children}</div>
    </div>
  );
}

function DiscoverFeed({ topPick, quick, vegHi }) {
  const nav = useNav();
  return (
    <PullToRefresh onRefresh={nav.refresh} style={{ flex: 1, padding: '4px 16px 16px' }}>
      <SectionTitle sub="Chef's pick · most protein">Today's hero</SectionTitle>
      <FeedCard recipe={topPick} eyebrow={topPick.category + ' · ' + topPick.proteinPerServing + 'g protein'} />
      <div style={{ height: 24 }} />
      <SectionTitle sub="Under 20 minutes">Quick & high-protein</SectionTitle>
      <div className="pk-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, margin: '0 -16px', padding: '0 16px 4px' }}>
        {quick.map(r => <div key={r.id} style={{ width: 150, flex: '0 0 auto' }}><RecipeCardGrid recipe={r} /></div>)}
      </div>
      <div style={{ height: 24 }} />
      <SectionTitle sub="Veg & vegan power">Meat-free, 25g+ protein</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {vegHi.slice(0, 3).map((r, i) => <FeedCard key={r.id} recipe={r} />)}
      </div>
    </PullToRefresh>
  );
}

function AllRecipes({ q, setQ, layout, setLayout, hp, setHp, cats, setCats, allCats, toggle, activeCount, clearAll, sort, setSortOpen, filtered, setFiltersOpen }) {
  const nav = useNav();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ padding: '0 16px', flex: '0 0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1.5px solid var(--line)', borderRadius: 13, padding: '10px 13px', background: 'var(--card)' }}>
          <Icon name="search" size={17} stroke="var(--ink-3)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search recipes or ingredients" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', width: '100%', fontFamily: 'inherit' }} />
          {q && <button onClick={() => setQ('')} className="pk-press"><Icon name="x" size={16} stroke="var(--ink-3)" /></button>}
        </div>
        <div className="pk-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0 4px' }}>
          <Chip active={hp} onClick={() => setHp(!hp)} color="var(--basil)">⚡ High protein</Chip>
          <button className="pk-press" onClick={() => setFiltersOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, padding: '8px 13px', borderRadius: 20, background: activeCount ? 'var(--ink)' : 'var(--card)', color: activeCount ? 'var(--cream)' : 'var(--ink-2)', border: '1.5px solid ' + (activeCount ? 'var(--ink)' : 'var(--line)'), flex: '0 0 auto' }}>
            <Icon name="sliders2" size={15} />Filters{activeCount ? ' · ' + activeCount : ''}
          </button>
          {allCats.map(c => <Chip key={c} active={cats.includes(c)} onClick={() => toggle(cats, setCats, c)}>{c[0].toUpperCase() + c.slice(1)}</Chip>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 10px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>{filtered.length} recipe{filtered.length !== 1 ? 's' : ''}{activeCount > 0 && <button onClick={clearAll} style={{ marginLeft: 10, color: 'var(--saffron-deep)', fontWeight: 800 }}>Clear all</button>}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="pk-press" onClick={() => setLayout(layout === 'grid' ? 'list' : 'grid')} aria-label="Layout" style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={layout === 'grid' ? 'browse' : 'planner'} size={16} /></button>
            <button className="pk-press" onClick={() => setSortOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', padding: '7px 11px', borderRadius: 10, background: 'var(--cream-2)' }}>{SORTS[sort]}<Icon name="chevDown" size={14} /></button>
          </div>
        </div>
      </div>
      <PullToRefresh onRefresh={nav.refresh} style={{ flex: 1, padding: '0 16px 16px' }}>
        {filtered.length === 0
          ? <EmptyState icon="search" title="No recipes match" body="Try removing a filter or searching something else." cta="Clear all" onCta={clearAll} />
          : layout === 'grid'
            ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{filtered.map(r => <RecipeCardGrid key={r.id} recipe={r} />)}</div>
            : <div>{filtered.map((r, i) => <RecipeRowMinimal key={r.id} recipe={r} divider={i > 0} />)}</div>}
      </PullToRefresh>
    </div>
  );
}

function FiltersSheet({ open, onClose, diets, setDiets, meals, setMeals, diff, setDiff, maxTime, setMaxTime, tags, setTags, allTags, toggle, clearAll, count }) {
  const Row = ({ label, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 9 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  );
  return (
    <Sheet open={open} onClose={onClose} title="Filters">
      <Row label="Diet">{['veg', 'nonveg', 'egg', 'vegan'].map(d => <Chip key={d} active={diets.includes(d)} onClick={() => toggle(diets, setDiets, d)}>{d[0].toUpperCase() + d.slice(1)}</Chip>)}</Row>
      <Row label="Meal">{MEAL_TYPES.map(m => <Chip key={m} active={meals.includes(m)} onClick={() => toggle(meals, setMeals, m)}>{m[0].toUpperCase() + m.slice(1)}</Chip>)}</Row>
      <Row label="Difficulty">{['easy', 'medium'].map(d => <Chip key={d} active={diff.includes(d)} onClick={() => toggle(diff, setDiff, d)}>{d[0].toUpperCase() + d.slice(1)}</Chip>)}</Row>
      <Row label="Max time">{[15, 30, 45].map(t => <Chip key={t} active={maxTime === t} onClick={() => setMaxTime(maxTime === t ? null : t)}>Under {t} min</Chip>)}</Row>
      <Row label="Tags">{allTags.map(t => <Chip key={t} active={tags.includes(t)} onClick={() => toggle(tags, setTags, t)}>{t}</Chip>)}</Row>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button className="pk-press" onClick={clearAll} style={{ flex: 1, padding: 14, borderRadius: 14, background: 'var(--cream-2)', fontWeight: 700, fontSize: 14 }}>Clear all</button>
        <button className="pk-press" onClick={onClose} style={{ flex: 2, padding: 14, borderRadius: 14, background: 'var(--saffron)', color: '#fff', fontWeight: 800, fontSize: 14 }}>Show {count} recipes</button>
      </div>
    </Sheet>
  );
}
