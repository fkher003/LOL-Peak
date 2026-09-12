import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MATCHUPS_FILE = path.join(__dirname, '..', 'src', 'data', 'matchups.json');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const TARGET_LIST = [
  // TOP
  { slug: 'jayce', lane: 'top' },
  { slug: 'nasus', lane: 'top' },
  { slug: 'chogath', lane: 'top' },
  { slug: 'kennen', lane: 'top' },
  { slug: 'rumble', lane: 'top' },
  { slug: 'sion', lane: 'top' },
  { slug: 'warwick', lane: 'top' },
  { slug: 'illaoi', lane: 'top' },
  { slug: 'gangplank', lane: 'top' },
  { slug: 'gwen', lane: 'top' },
  { slug: 'kled', lane: 'top' },
  { slug: 'olaf', lane: 'top' },
  { slug: 'pantheon', lane: 'top' },
  { slug: 'quinn', lane: 'top' },
  { slug: 'singed', lane: 'top' },
  { slug: 'trundle', lane: 'top' },
  { slug: 'urgot', lane: 'top' },
  { slug: 'vladimir', lane: 'top' },
  { slug: 'wukong', lane: 'top' },
  { slug: 'kayle', lane: 'top' },
  { slug: 'tryndamere', lane: 'top' },

  // JUNGLE
  { slug: 'belveth', lane: 'jungle' },
  { slug: 'fiddlesticks', lane: 'jungle' },
  { slug: 'ivern', lane: 'jungle' },
  { slug: 'karthus', lane: 'jungle' },
  { slug: 'kindred', lane: 'jungle' },
  { slug: 'lillia', lane: 'jungle' },
  { slug: 'nidalee', lane: 'jungle' },
  { slug: 'nunu', lane: 'jungle' },
  { slug: 'reksai', lane: 'jungle' },
  { slug: 'rengar', lane: 'jungle' },
  { slug: 'shyvana', lane: 'jungle' },
  { slug: 'skarner', lane: 'jungle' },
  { slug: 'taliyah', lane: 'jungle' },
  { slug: 'trundle', lane: 'jungle' },
  { slug: 'udyr', lane: 'jungle' },
  { slug: 'warwick', lane: 'jungle' },
  { slug: 'wukong', lane: 'jungle' },

  // MID
  { slug: 'jayce', lane: 'mid' },
  { slug: 'akshan', lane: 'mid' },
  { slug: 'annie', lane: 'mid' },
  { slug: 'aurelionsol', lane: 'mid' },
  { slug: 'azir', lane: 'mid' },
  { slug: 'brand', lane: 'mid' },
  { slug: 'cassiopeia', lane: 'mid' },
  { slug: 'corki', lane: 'mid' },
  { slug: 'naafiri', lane: 'mid' },
  { slug: 'neeko', lane: 'mid' },
  { slug: 'qiyana', lane: 'mid' },
  { slug: 'ryze', lane: 'mid' },
  { slug: 'swain', lane: 'mid' },
  { slug: 'vladimir', lane: 'mid' },
  { slug: 'xerath', lane: 'mid' },
  { slug: 'ziggs', lane: 'mid' },
  { slug: 'zoe', lane: 'mid' },

  // ADC
  { slug: 'kogmaw', lane: 'adc' },
  { slug: 'nilah', lane: 'adc' },
  { slug: 'twitch', lane: 'adc' },
  { slug: 'kalista', lane: 'adc' },
  { slug: 'smolder', lane: 'adc' },

  // SUPPORT
  { slug: 'braum', lane: 'support' },
  { slug: 'brand', lane: 'support' },
  { slug: 'maokai', lane: 'support' },
  { slug: 'rell', lane: 'support' },
  { slug: 'renata', lane: 'support' },
  { slug: 'sona', lane: 'support' },
  { slug: 'taric', lane: 'support' },
  { slug: 'velkoz', lane: 'support' },
  { slug: 'xerath', lane: 'support' },
  { slug: 'yuumi', lane: 'support' },
  { slug: 'zilean', lane: 'support' },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCounters(slug, lane) {
  const url = `https://op.gg/champions/${slug}/counters/${lane}`;
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    const html = await res.text();
    const pushes = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
    for (const p of pushes) {
      const unescaped = p[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      if (unescaped.includes('"data":[{') && unescaped.includes('"win_rate"')) {
        const match = unescaped.match(/"data":(\[\{.*?\}\])/s);
        if (match) {
          const rawList = JSON.parse(match[1]);
          return rawList
            .filter((item) => item.play >= 25)
            .map((item) => {
              const counterWinRate = parseFloat((100 - item.win_rate).toFixed(2));
              let tier = 'SKILL_MATCHUP';
              if (counterWinRate >= 54.0) tier = 'HARD_COUNTER';
              else if (counterWinRate >= 51.5) tier = 'STRONG_COUNTER';

              return {
                championKey: item.champion.key,
                championName: item.champion.name,
                winRate: counterWinRate,
                playCount: item.play,
                tier,
              };
            })
            .sort((a, b) => b.winRate - a.winRate);
        }
      }
    }
  } catch (err) {
    console.error(`Error fetching ${slug} (${lane}):`, err.message);
  }
  return null;
}

async function run() {
  console.log('Loading existing matchups.json...');
  const data = JSON.parse(fs.readFileSync(MATCHUPS_FILE, 'utf8'));
  const matchups = data.matchups || {};

  let added = 0;
  for (const { slug, lane } of TARGET_LIST) {
    const key = `${slug}_${lane}`.toLowerCase();
    if (matchups[key] && matchups[key].counters && matchups[key].counters.length > 5) {
      // Already exists with solid data
      continue;
    }

    process.stdout.write(`Fetching ${slug} (${lane})... `);
    const counters = await fetchCounters(slug, lane);
    if (counters && counters.length > 0) {
      matchups[key] = {
        championSlug: slug,
        lane: lane.toUpperCase(),
        counters,
      };
      added++;
      console.log(`✓ ${counters.length} counters`);
    } else {
      console.log(`x (no data)`);
    }
    await sleep(250);
  }

  data.totalEntries = Object.keys(matchups).length;
  data.updatedAt = Date.now();
  data.matchups = matchups;

  fs.writeFileSync(MATCHUPS_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\nDone! Added ${added} new matchups. Total entries in database: ${data.totalEntries}`);
}

run();
