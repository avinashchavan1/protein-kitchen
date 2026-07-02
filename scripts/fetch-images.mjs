// fetch-images.mjs — download dish + ingredient images from Wikimedia Commons.
// License-safe (CC / public domain). Self-hosts into frontend/public/img.
// Run: node scripts/fetch-images.mjs [--only=id1,id2]
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_RECIPES = path.join(ROOT, 'frontend/public/img/recipes');
const OUT_ING = path.join(ROOT, 'frontend/public/img/ingredients');
const UA = 'ProteinKitchen/1.0 (recipe PWA; contact: avinashchavan1433@gmail.com)';

// term = Commons search query (broad enough to hit a good photo).
const RECIPES = {
  recipe_air_fryer_chicken_tikka: 'Chicken tikka skewers',
  recipe_paneer_bhurji: 'Paneer bhurji',
  recipe_masoor_dal_tadka: 'Dal fry bowl',
  recipe_egg_bhurji: 'Egg bhurji',
  recipe_tandoori_fish_tikka: 'Fish tikka',
  recipe_tofu_tikka_masala: 'Mapo tofu',
  recipe_chana_masala: 'Chana masala',
  recipe_yogurt_raita_bowl: 'Raita',
  recipe_butter_chicken_lite: 'Butter chicken',
  recipe_palak_paneer: 'Palak paneer',
  recipe_egg_curry: 'Egg curry',
  recipe_rajma: 'Rajma masala curry',
  recipe_soya_chunk_curry: 'Soya chunk curry',
  recipe_grilled_fish_curry: 'Fish curry',
  recipe_moong_dal_cheela: 'Moong dal cheela',
  // --- expanded library (+100) ---
  recipe_home_chicken_curry: 'Chicken curry',
  recipe_hariyali_chicken_kebab: 'Green chicken tikka',
  recipe_chicken_65: 'Chicken 65',
  recipe_pepper_chicken: 'Chicken fry dry',
  recipe_chicken_keema_matar: 'Keema matar',
  recipe_chicken_biryani_lite: 'Chicken dum biryani',
  recipe_methi_chicken: 'Methi chicken curry',
  recipe_chilli_chicken: 'Chilli chicken',
  recipe_chicken_seekh_kebab: 'Chicken seekh kebab',
  recipe_grilled_chicken_salad: 'Grilled chicken salad',
  recipe_tandoori_chicken_leg: 'Tandoori chicken',
  recipe_chicken_stew: 'Chicken stew',
  recipe_chicken_shorba: 'Chicken soup Indian',
  recipe_achari_chicken: 'Achari chicken',
  recipe_mutton_curry: 'Mutton curry',
  recipe_mutton_keema_matar: 'Keema curry minced',
  recipe_mutton_seekh_kebab: 'Mutton seekh kebab',
  recipe_mutton_shorba: 'Mutton soup',
  recipe_mustard_fish_curry: 'Bengali fish curry',
  recipe_prawn_masala: 'Prawn masala',
  recipe_prawn_coconut_curry: 'Prawn coconut curry',
  recipe_amritsari_fish: 'Fried fish Amritsari',
  recipe_salmon_tikka: 'Grilled salmon',
  recipe_surmai_tawa_fry: 'Fish fry masala',
  recipe_prawn_stir_fry: 'Prawn stir fry',
  recipe_masala_omelette: 'Masala omelette',
  recipe_egg_white_omelette: 'Omelette eggs',
  recipe_egg_paratha: 'Egg paratha',
  recipe_boiled_egg_chaat: 'Egg salad',
  recipe_egg_white_bhurji: 'Scrambled eggs',
  recipe_indian_shakshuka: 'Shakshuka eggs tomato',
  recipe_paneer_tikka: 'Paneer tikka',
  recipe_paneer_butter_masala_lite: 'Paneer butter masala',
  recipe_matar_paneer: 'Matar paneer',
  recipe_chilli_paneer: 'Chilli paneer',
  recipe_kadai_paneer: 'Kadai paneer',
  recipe_paneer_paratha: 'Paneer paratha',
  recipe_shahi_paneer_lite: 'Shahi paneer',
  recipe_paneer_capsicum_stirfry: 'Kadai paneer capsicum',
  recipe_methi_paneer: 'Methi paneer',
  recipe_paneer_kathi_roll: 'Paneer kathi roll',
  recipe_corn_paneer_sabzi: 'Sweet corn curry',
  recipe_paneer_salad_bowl: 'Vegetable salad bowl healthy',
  recipe_tofu_bhurji: 'Scrambled tofu',
  recipe_tofu_veg_stirfry: 'Tofu vegetable stir fry',
  recipe_tofu_palak: 'Palak tofu',
  recipe_tofu_kathi_roll: 'Tofu wrap',
  recipe_soya_keema_matar: 'Soya chunk curry',
  recipe_soya_pulao: 'Vegetable pulao rice',
  recipe_soya_chilli: 'Chilli soya',
  recipe_dal_fry: 'Dal fry bowl',
  recipe_dal_makhani_lite: 'Dal makhani',
  recipe_chana_dal_tadka: 'Dal tadka lentil',
  recipe_kala_chana_masala: 'Kala chana curry',
  recipe_lobia_masala: 'Black eyed peas curry',
  recipe_moong_sprout_salad: 'Sprout chaat',
  recipe_moong_sprout_chaat: 'Bean salad chaat',
  recipe_green_moong_dal: 'Green moong dal curry',
  recipe_mixed_dal: 'Mixed lentil dal',
  recipe_sambar: 'Sambar idli',
  recipe_urad_dal_tadka: 'Dal bowl rice',
  recipe_chana_dal_lauki: 'Bottle gourd curry',
  recipe_dal_palak: 'Spinach dal',
  recipe_moong_khichdi: 'Khichdi',
  recipe_sprouts_stir_fry: 'Sprouts usal Maharashtra',
  recipe_besan_chilla: 'Besan chilla',
  recipe_oats_chilla: 'Besan chilla',
  recipe_masala_oats: 'Masala oats',
  recipe_sattu_paratha: 'Sattu paratha',
  recipe_sattu_sharbat: 'Sattu drink',
  recipe_vermicelli_upma: 'Vermicelli upma',
  recipe_poha_peanuts: 'Poha',
  recipe_quinoa_veg_pulao: 'Quinoa salad bowl',
  recipe_ragi_dosa: 'Ragi dosa',
  recipe_moong_dal_dosa: 'Pesarattu dosa',
  recipe_chana_chaat: 'Chana chaat',
  recipe_hummus_bowl: 'Hummus',
  recipe_chickpea_sundal: 'Sundal chickpeas',
  recipe_peanut_sundal: 'Boiled peanuts',
  recipe_chia_pudding: 'Chia pudding jar',
  recipe_overnight_oats_pb: 'Overnight oats',
  recipe_protein_smoothie: 'Smoothie glass',
  recipe_mushroom_masala: 'Mushroom masala curry',
  recipe_mushroom_tikka: 'Tandoori mushroom',
  recipe_capsicum_besan_sabzi: 'Capsicum sabzi',
  recipe_cabbage_peas_sabzi: 'Cabbage curry dish',
  recipe_french_beans_thoran: 'Green beans stir fry',
  recipe_baingan_bharta: 'Baingan bharta',
  recipe_mixed_veg_korma: 'Vegetable korma',
  recipe_rajma_salad: 'Kidney bean salad',
  recipe_egg_salad: 'Egg salad',
  recipe_sprout_bhel: 'Bhel puri',
  recipe_hung_curd_dip: 'Raita',
  recipe_soya_cutlet: 'Vegetable cutlet',
  recipe_cheese_omelette: 'Cheese omelette',
  recipe_keema_paratha: 'Keema paratha',
  recipe_fish_cutlet: 'Fish cutlet',
  recipe_chicken_lettuce_wrap: 'Lettuce wrap chicken',
  recipe_methi_thepla: 'Thepla',
  recipe_dahi_chana_chaat: 'Dahi chaat',
  // --- expanded library v2 (+100) ---
  recipe_x2_murgh_tariwala: 'Chicken curry',
  recipe_x2_chicken_chettinad: 'Chettinad chicken',
  recipe_x2_kadai_chicken: 'Kadai chicken',
  recipe_x2_chicken_do_pyaza: 'Chicken do pyaza',
  recipe_x2_methi_murgh: 'Methi chicken',
  recipe_x2_chicken_saagwala: 'Palak chicken',
  recipe_x2_achari_chicken: 'Achari chicken',
  recipe_x2_chicken_korma_lite: 'Chicken korma',
  recipe_x2_lemon_coriander_chicken: 'Chicken soup Indian',
  recipe_x2_tandoori_tangri: 'Tandoori chicken',
  recipe_x2_chicken_sukka: 'Chicken sukka',
  recipe_x2_andhra_chilli_chicken: 'Chilli chicken',
  recipe_x2_chicken_kolhapuri: 'Kombdi vade',
  recipe_x2_schezwan_chicken: 'Chilli chicken',
  recipe_x2_chicken_manchurian_dry: 'Chilli chicken dry',
  recipe_x2_garlic_pepper_chicken: 'Chicken fry dry',
  recipe_x2_reshmi_kebab: 'Chicken tikka',
  recipe_x2_malai_tikka: 'Chicken malai tikka',
  recipe_x2_seekh_kebab: 'Seekh kebab',
  recipe_x2_shami_kebab: 'Shami kebab',
  recipe_x2_keema_matar: 'Keema matar',
  recipe_x2_chicken_stir_fry: 'Chicken vegetable stir fry',
  recipe_x2_grilled_chicken_bowl: 'Grilled chicken salad',
  recipe_x2_chicken_tikka_masala_lite: 'Chicken tikka masala',
  recipe_x2_chicken_jalfrezi: 'Chicken jalfrezi',
  recipe_x2_chicken_bharta: 'Chicken bharta',
  recipe_x2_coconut_chicken_curry: 'Chicken coconut curry',
  recipe_x2_chicken_rara: 'Chicken keema curry',
  recipe_x2_dhaba_chicken: 'Dhaba chicken',
  recipe_x2_chicken_ghee_roast: 'Chicken ghee roast',
  recipe_x2_coriander_mint_chicken: 'Hariyali chicken',
  recipe_x2_chicken_hara_masala: 'Green chicken curry',
  recipe_x2_pahadi_tikka: 'Hariyali chicken tikka',
  recipe_x2_chicken_steak: 'Grilled chicken breast',
  recipe_x2_egg_curry_masala: 'Egg curry',
  recipe_x2_anda_bhurji_deluxe: 'Egg bhurji',
  recipe_x2_egg_paneer_bhurji: 'Egg bhurji',
  recipe_x2_masala_omelette: 'Masala omelette',
  recipe_x2_egg_cheese_omelette: 'Omelette',
  recipe_x2_egg_white_scramble: 'Scrambled eggs',
  recipe_x2_egg_korma: 'Egg curry',
  recipe_x2_deviled_eggs: 'Deviled eggs',
  recipe_x2_egg_frankie_filling: 'Egg bhurji',
  recipe_x2_egg_capsicum_fry: 'Egg bhurji',
  recipe_x2_egg_drop_curry: 'Egg curry',
  recipe_x2_nadan_egg_roast: 'Egg roast Kerala',
  recipe_x2_egg_ghotala: 'Egg bhurji',
  recipe_x2_parsi_akuri: 'Egg bhurji',
  recipe_x2_egg_spinach_frittata: 'Frittata',
  recipe_x2_egg_mushroom_bhurji: 'Egg bhurji',
  recipe_x2_egg_methi_scramble: 'Scrambled eggs',
  recipe_x2_egg_tomato_curry: 'Egg curry',
  recipe_x2_egg_paneer_tikka: 'Paneer tikka',
  recipe_x2_egg_soya_bhurji: 'Egg bhurji',
  recipe_x2_egg_masala_fry: 'Egg roast',
  recipe_x2_boiled_egg_chaat: 'Egg salad',
  recipe_x2_egg_salad_bowl: 'Egg salad',
  recipe_x2_egg_quinoa_bowl: 'Quinoa bowl',
  recipe_x2_pepper_egg_fry: 'Egg roast Kerala',
  recipe_x2_egg_coconut_curry: 'Egg curry',
  recipe_x2_egg_keema: 'Keema',
  recipe_x2_egg_cheese_cups: 'Baked eggs',
  recipe_x2_egg_besan_cheela: 'Besan cheela',
  recipe_x2_egg_oats_omelette: 'Omelette',
  recipe_x2_egg_coriander_fry: 'Egg roast Kerala',
  recipe_x2_egg_palak_bhurji: 'Egg bhurji',
  recipe_x2_paneer_bhurji_masala: 'Paneer bhurji',
  recipe_x2_matar_paneer_lite: 'Matar paneer',
  recipe_x2_kadai_paneer: 'Kadai paneer',
  recipe_x2_paneer_tikka_masala_v2: 'Paneer tikka masala',
  recipe_x2_shahi_paneer_lite: 'Shahi paneer',
  recipe_x2_paneer_lababdar_lite: 'Paneer butter masala',
  recipe_x2_chilli_paneer_dry: 'Chilli paneer',
  recipe_x2_paneer_65: 'Paneer pakora',
  recipe_x2_achari_paneer: 'Paneer curry',
  recipe_x2_paneer_methi_malai: 'Methi malai paneer',
  recipe_x2_soya_keema_matar: 'Soya keema',
  recipe_x2_soya_biryani_bowl: 'Soya biryani',
  recipe_x2_tofu_bhurji: 'Tofu scramble',
  recipe_x2_tofu_tikka: 'Tofu tikka',
  recipe_x2_tofu_schezwan: 'Chilli soya',
  recipe_x2_hara_bhara_soya_kebab: 'Hara bhara kabab',
  recipe_x2_sprout_paneer_salad: 'Sprout chaat',
  recipe_x2_moong_sprout_chaat: 'Sprout chaat',
  recipe_x2_rajma_paneer_bowl: 'Rajma masala curry',
  recipe_x2_chana_paneer_bowl: 'Chana masala',
  recipe_x2_besan_soya_chilla: 'Besan chilla',
  recipe_x2_dal_paneer_tadka: 'Dal fry bowl',
  recipe_x2_greek_yogurt_bowl: 'Yogurt bowl',
  recipe_x2_peanut_paneer_salad: 'Kachumber',
  recipe_x2_mushroom_paneer_masala: 'Mushroom masala curry',
  recipe_x2_palak_tofu: 'Palak paneer',
  recipe_x2_soya_malai_curry: 'Soya chunk curry',
  recipe_x2_paneer_capsicum_stir_fry: 'Paneer capsicum',
  recipe_x2_tofu_peanut_stir_fry: 'Tofu vegetable stir fry',
  recipe_x2_paneer_quinoa_bowl: 'Quinoa bowl',
  recipe_x2_sattu_paneer_paratha: 'Sattu paratha',
  recipe_x2_cottage_cheese_skewers: 'Paneer tikka',
  recipe_x2_mixed_veg_paneer_curry: 'Mixed vegetable curry',
  recipe_x2_paneer_makhani_lite: 'Paneer butter masala',
};
const INGREDIENTS = {
  chicken_breast: 'Raw chicken breast',
  paneer: 'Paneer Indian cheese',
  egg: 'Chicken eggs',
  masoor_dal: 'Masoor lentil',
  moong_dal: 'Moong dal',
  fish_tilapia: 'Raw fish fillet',
  tofu: 'Tofu block',
  chickpeas: 'Cooked chickpeas',
  greek_yogurt: 'Greek yogurt',
  spinach: 'Fresh spinach leaves',
  kidney_beans: 'Red kidney beans',
  soya_chunks: 'Soya chunks',
  besan: 'Gram flour besan',
  onion: 'Onion',
  tomato: 'Tomato',
  ginger_garlic: 'Ginger garlic paste',
  green_chili: 'Green chili pepper',
  yogurt: 'Yogurt bowl',
  cream_lite: 'Pouring cream dairy',
  ghee: 'Clarified butter',
  mustard_oil: 'Mustard oil bottle',
  garam_masala: 'Garam masala powder',
  turmeric: 'Turmeric powder bowl',
  cumin: 'Cumin seeds',
  red_chili_powder: 'Chili powder',
  coriander: 'Coriander leaves',
  lemon: 'Lemon fruit',
  // --- expanded pool ---
  chicken_thigh: 'Raw chicken thigh',
  chicken_keema: 'Ground chicken meat',
  mutton: 'Raw goat meat',
  mutton_keema: 'Ground mutton mince',
  prawns: 'Raw prawns',
  fish_salmon: 'Raw salmon fillet',
  fish_surmai: 'Seer fish',
  egg_white: 'Egg white',
  milk: 'Glass of milk',
  skim_milk: 'Milk glass',
  cheese: 'Cheese block',
  toor_dal: 'Toor dal pigeon pea',
  chana_dal: 'Chana dal split',
  urad_dal: 'Urad dal',
  black_chana: 'Black chickpeas',
  green_moong: 'Green gram',
  moong_sprouts: 'Mung bean sprouts',
  lobia: 'Black eyed peas',
  green_peas: 'Green peas',
  peanuts: 'Peanuts',
  peanut_butter: 'Peanut butter',
  almonds: 'Almonds',
  cashew: 'Cashew nuts',
  sesame: 'Sesame seeds',
  flaxseed: 'Flax seeds',
  chia: 'Chia seeds',
  oats: 'Rolled oats',
  quinoa: 'Quinoa grain',
  brown_rice: 'Brown rice',
  rice: 'Cooked white rice',
  ragi: 'Finger millet flour',
  poha: 'Flattened rice poha',
  vermicelli: 'Vermicelli noodles',
  sattu: 'Roasted gram flour',
  atta: 'Wheat flour',
  cauliflower: 'Cauliflower',
  cabbage: 'Cabbage',
  capsicum: 'Bell pepper capsicum',
  carrot: 'Carrot',
  french_beans: 'Green beans',
  lauki: 'Bottle gourd',
  bhindi: 'Okra',
  brinjal: 'Eggplant brinjal',
  mushroom: 'Button mushrooms',
  sweet_corn: 'Sweet corn',
  methi: 'Fenugreek leaves',
  mint: 'Mint leaves',
  curry_leaves: 'Curry leaves',
  coconut: 'Coconut fruit',
  coconut_milk: 'Coconut milk',
  potato: 'Patatas potato',
  tamarind: 'Tamarind',
  jaggery: 'Jaggery',
  mustard_seeds: 'Mustard seeds',
};

// junk-only filter: block non-food / wrong-subject hits. (kebab/sprout/soup/biryani
// intentionally NOT blocked — those are real dishes we want.)
const BAD = /(icon|logo|\bmap\b|diagram|chart|coat of arms|flag|svg|\.svg|stamp|\bsign\b|symbol|honeycomb|cubic|lattice|lamp|pilgrim|norad|font|geograph|skeleton|\bmoth\b|locomotive|\bWAG\b|strap end|agaric|toadstool|\bmenu\b|pork|veal|\blamb\b|\bbeef\b|noodle|linguine|cookies|\bflower|samosa|momos|line arg|sausage|creamer|muesli|Yugoslavia|halwa|sheera|bacteria|coloniz|avocado|\bjhol\b|ilish|bhaat|chips|sweet potato|chimp|monkey|ice cream|mcmuffin|\bmcd\b|mcd-|brussels|soldiers|dishoom|funny|restaurant exterior|storefront|herbarium|mhnt|specimen|festival|paddenstoel|christmas table|hainanese|in the basket|kenya|\\bshrimp\\b|\\bthali\\b)/i;

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': UA } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); return resolve(get(res.headers.location));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode + ' ' + url)); }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function searchCommons(term) {
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search' +
    '&gsrsearch=' + encodeURIComponent(term + ' filetype:bitmap') +
    '&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url%7Cmime%7Csize%7Cextmetadata' +
    '&iiurlwidth=800&format=json';
  const buf = await get(u);
  const j = JSON.parse(buf.toString());
  const pages = j.query ? Object.values(j.query.pages) : [];
  // keep search-result order
  pages.sort((a, b) => (a.index || 0) - (b.index || 0));
  for (const p of pages) {
    if (BAD.test(p.title)) continue;
    const ii = (p.imageinfo || [])[0];
    if (!ii) continue;
    if (!/image\/(jpeg|png)/.test(ii.mime || '')) continue;
    if ((ii.width || 0) < 400) continue;
    if (!ii.thumburl) continue;
    const em = ii.extmetadata || {};
    return {
      title: p.title,
      thumburl: ii.thumburl,
      descUrl: ii.descriptionshorturl || ii.descriptionurl,
      artist: strip((em.Artist || {}).value),
      license: (em.LicenseShortName || {}).value || 'see source',
    };
  }
  return null;
}
function strip(html) { return html ? html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120) : 'Unknown'; }

async function run() {
  const onlyArg = (process.argv.find((a) => a.startsWith('--only=')) || '').replace('--only=', '');
  const only = onlyArg ? new Set(onlyArg.split(',')) : null;
  fs.mkdirSync(OUT_RECIPES, { recursive: true });
  fs.mkdirSync(OUT_ING, { recursive: true });

  const credits = [];
  const jobs = [
    ...Object.entries(RECIPES).map(([id, term]) => ({ id, term, dir: OUT_RECIPES, kind: 'recipe' })),
    ...Object.entries(INGREDIENTS).map(([id, term]) => ({ id, term, dir: OUT_ING, kind: 'ingredient' })),
  ].filter((j) => !only || only.has(j.id));

  for (const job of jobs) {
    try {
      const hit = await searchCommons(job.term);
      if (!hit) { console.log('MISS  ', job.id, '«' + job.term + '»'); continue; }
      const img = await get(hit.thumburl);
      const file = path.join(job.dir, job.id + '.jpg');
      fs.writeFileSync(file, img);
      credits.push({ id: job.id, kind: job.kind, term: job.term, source: hit.descUrl, title: hit.title, artist: hit.artist, license: hit.license, bytes: img.length });
      console.log('OK    ', job.id.padEnd(34), (img.length / 1024).toFixed(0) + 'KB', '|', hit.license, '|', hit.title.replace('File:', ''));
    } catch (e) {
      console.log('ERROR ', job.id, e.message);
    }
    await new Promise((r) => setTimeout(r, 350)); // be polite to Commons
  }

  const creditsPath = path.join(ROOT, 'frontend/public/img/CREDITS.json');
  // merge with existing so partial runs don't lose prior credits
  let prev = [];
  try { prev = JSON.parse(fs.readFileSync(creditsPath, 'utf8')); } catch {}
  const byId = Object.fromEntries(prev.map((c) => [c.id, c]));
  credits.forEach((c) => { byId[c.id] = c; });
  fs.writeFileSync(creditsPath, JSON.stringify(Object.values(byId), null, 2));
  console.log('\nWrote', credits.length, 'images. Credits ->', path.relative(ROOT, creditsPath));
}
run();
