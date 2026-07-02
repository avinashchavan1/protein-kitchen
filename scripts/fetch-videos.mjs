// fetch-videos.mjs — scrape YouTube search results (no API key) for top recipe
// videos per dish. Parses ytInitialData from the results HTML, extracts the first
// few videoRenderer entries (real videos, not Shorts/playlists/ads), and writes
// frontend/src/data/videos.json keyed by recipe id -> [{ id, title, channel, length }].
//
// Usage:
//   node scripts/fetch-videos.mjs
//   node scripts/fetch-videos.mjs --only=recipe_paneer_tikka,recipe_dal_fry
//   node scripts/fetch-videos.mjs --count=4
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'frontend/src/data/data.js');
const OUT = path.join(ROOT, 'frontend/src/data/videos.json');

const args = process.argv.slice(2);
const onlyArg = args.find(a => a.startsWith('--only='));
const ONLY = onlyArg ? onlyArg.split('=')[1].split(',').filter(Boolean) : null;
const countArg = args.find(a => a.startsWith('--count='));
const WANT = countArg ? Math.max(3, +countArg.split('=')[1]) : 4;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// build a focused search query for a recipe
function queryFor(r) {
  const t = r.title.replace(/\([^)]*\)/g, '').trim();
  const indian = r.cuisine === 'indian' && !/indian/i.test(t);
  return `${t} recipe${indian ? ' indian' : ''}`;
}

// pull videoRenderer nodes out of ytInitialData
function extractVideos(json, want) {
  const out = [];
  const seen = new Set();
  const walk = (node) => {
    if (out.length >= want || !node || typeof node !== 'object') return;
    if (node.videoRenderer) {
      const v = node.videoRenderer;
      const id = v.videoId;
      const title = v.title?.runs?.[0]?.text || v.title?.simpleText || '';
      const channel = v.ownerText?.runs?.[0]?.text || v.longBylineText?.runs?.[0]?.text || '';
      const length = v.lengthText?.simpleText || '';
      // require a length (filters out live/Shorts/upcoming) and a real title
      if (id && !seen.has(id) && title && length) {
        seen.add(id);
        out.push({ id, title, channel, length });
      }
    }
    if (Array.isArray(node)) { for (const x of node) walk(x); }
    else { for (const k in node) walk(node[k]); }
  };
  walk(json);
  return out.slice(0, want);
}

async function searchYouTube(query, want) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en&gl=US`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const html = await res.text();
  const m = html.match(/var ytInitialData\s*=\s*(\{.+?\});<\/script>/s)
    || html.match(/ytInitialData"\]\s*=\s*(\{.+?\});/s)
    || html.match(/ytInitialData\s*=\s*(\{.+?\});/s);
  if (!m) throw new Error('no ytInitialData');
  const json = JSON.parse(m[1]);
  return extractVideos(json, want);
}

async function main() {
  const mod = await import(pathToFileURL(DATA).href);
  let recipes = mod.PK_DATA.recipes;
  if (ONLY) recipes = recipes.filter(r => ONLY.includes(r.id));

  const store = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  let ok = 0, fail = 0;

  for (const r of recipes) {
    const q = queryFor(r);
    try {
      let vids = await searchYouTube(q, WANT);
      if (vids.length < 3) {
        // retry once with a looser query
        await sleep(400);
        vids = await searchYouTube(r.title + ' recipe', WANT);
      }
      if (vids.length >= 1) {
        store[r.id] = vids;
        ok++;
        console.log(`OK    ${r.id.padEnd(34)} ${vids.length} vids | ${vids.map(v => v.id).join(',')}`);
      } else {
        fail++;
        console.log(`EMPTY ${r.id.padEnd(34)} «${q}»`);
      }
    } catch (e) {
      fail++;
      console.log(`ERR   ${r.id.padEnd(34)} ${e.message} «${q}»`);
    }
    await sleep(350 + Math.random() * 300);
  }

  // sort keys for stable diffs
  const sorted = {};
  Object.keys(store).sort().forEach(k => { sorted[k] = store[k]; });
  fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n');
  console.log(`\nDone. ${ok} ok, ${fail} failed. -> ${path.relative(ROOT, OUT)} (${Object.keys(sorted).length} recipes total)`);
}

main().catch(e => { console.error(e); process.exit(1); });
