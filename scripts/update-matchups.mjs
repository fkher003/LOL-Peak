/**
 * League of Legends Matchup Data Updater
 * Usage:
 *   node scripts/update-matchups.mjs             (Full update of major lane champions)
 *   node scripts/update-matchups.mjs --sample    (Quick sample test of top champions)
 *   node scripts/update-matchups.mjs --lane=top  (Update only specific lane)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'matchups.json');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Key champions per lane to fetch (ensuring high coverage across competitive meta)
const LANE_CHAMPIONS = {
  top: [
    'aatrox', 'darius', 'fiora', 'garen', 'jax', 'camille', 'mordekaiser',
    'renekton', 'riven', 'sett', 'malphite', 'shen', 'ornn', 'ksante',
    'teemo', 'vayne', 'gnar', 'irelia', 'yorick', 'poppy', 'tahmkench', 'dr-mundo', 'volibear'
  ],
  jungle: [
    'leesin', 'viego', 'khazix', 'jarvaniv', 'kayn', 'ekko', 'graves',
    'masteryi', 'nocturne', 'amumu', 'vi', 'hecarim', 'zac', 'elise',
    'evelynn', 'diana', 'rammus', 'shaco', 'briar', 'sejuani', 'xin-zhao'
  ],
  mid: [
    'ahri', 'zed', 'yasuo', 'yone', 'syndra', 'akali', 'lux', 'veigar',
    'katarina', 'viktor', 'vex', 'leblanc', 'talon', 'orianna', 'anivia',
    'fizz', 'galio', 'kassadin', 'lissandra', 'malzahar', 'twistedfate', 'sylas', 'hwei'
  ],
  adc: [
    'jinx', 'kaisa', 'caitlyn', 'ezreal', 'jhin', 'vayne', 'samira',
    'ashe', 'varus', 'lucian', 'draven', 'tristana', 'sivir', 'missfortune', 'zeri', 'aphelios'
  ],
  support: [
    'blitzcrank', 'thresh', 'nautilus', 'leona', 'lulu', 'nami', 'pyke',
    'morgana', 'senna', 'lux', 'karma', 'alistar', 'janna', 'rakan', 'soraka', 'bard', 'zyra', 'milio'
  ],
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Convert champion ID/name to OP.GG URL slug
export function toOpggSlug(nameOrId) {
  return nameOrId
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Fetch counter matchups for a single champion at a specific lane
 */
async function fetchChampionCounters(champSlug, lane) {
  const url = `https://op.gg/champions/${champSlug}/counters/${lane}`;
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      console.warn(`[!] Fetch failed for ${champSlug} (${lane}): ${res.status}`);
      return null;
    }
    const html = await res.text();

    // Extract next_f pushes
    const pushes = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
    for (const p of pushes) {
      const unescaped = p[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      if (unescaped.includes('"data":[{') && unescaped.includes('"win_rate"')) {
        const match = unescaped.match(/"data":(\[\{.*?\}\])/s);
        if (match) {
          try {
            const rawList = JSON.parse(match[1]);
            // Raw item: { play: 746, win: 381, win_rate: 51.07, champion: { name: "Garen", key: "garen" } }
            // Note: raw.win_rate is the target champ's win rate against this opponent.
            // Therefore, opponent's win rate against target champ is (100 - raw.win_rate).
            const counters = rawList
              .filter((item) => item.play >= 30) // Filter statistically valid sample size
              .map((item) => {
                const counterWinRate = parseFloat((100 - item.win_rate).toFixed(2));
                let tier = 'SKILL_MATCHUP';
                if (counterWinRate >= 54.0) tier = 'HARD_COUNTER';
                else if (counterWinRate >= 51.5) tier = 'STRONG_COUNTER';

                return {
                  championKey: item.champion.key,
                  championName: item.champion.name,
                  winRate: counterWinRate, // % Win rate of the counter pick against this champion
                  playCount: item.play,
                  tier,
                };
              })
              // Sort by highest counter win rate first
              .sort((a, b) => b.winRate - a.winRate);

            return counters;
          } catch (e) {
            console.error(`Error parsing JSON for ${champSlug}:`, e.message);
          }
        }
      }
    }
    return null;
  } catch (err) {
    console.error(`Network error for ${champSlug} (${lane}):`, err.message);
    return null;
  }
}

async function main() {
  const isSample = process.argv.includes('--sample');
  const laneArg = process.argv.find((arg) => arg.startsWith('--lane='));
  const targetLane = laneArg ? laneArg.split('=')[1].toLowerCase() : null;

  console.log('=== LEAGUE OF LEGENDS MATCHUP DATA UPDATER ===');
  console.log(`Mode: ${isSample ? 'SAMPLE (Quick)' : 'FULL'}`);
  if (targetLane) console.log(`Lane Filter: ${targetLane.toUpperCase()}`);

  let existingData = { version: '15.5', updatedAt: Date.now(), matchups: {} };
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    } catch {
      // Ignore
    }
  }

  const matchups = existingData.matchups || {};
  let totalSuccess = 0;

  const lanesToProcess = targetLane ? [targetLane] : Object.keys(LANE_CHAMPIONS);

  for (const lane of lanesToProcess) {
    const list = LANE_CHAMPIONS[lane] || [];
    const champs = isSample ? list.slice(0, 3) : list;
    const laneUpper = lane.toUpperCase() === 'JUNGLE' ? 'JGL' : lane.toUpperCase();

    console.log(`\nProcessing ${lane.toUpperCase()} (${champs.length} champions)...`);

    for (const champ of champs) {
      process.stdout.write(`Fetching ${champ}... `);
      const counters = await fetchChampionCounters(champ, lane);
      if (counters && counters.length > 0) {
        const key = `${champ}_${laneUpper}`.toLowerCase();
        matchups[key] = {
          championSlug: champ,
          lane: laneUpper,
          counters,
        };
        console.log(`✓ (${counters.length} matchups)`);
        totalSuccess++;
      } else {
        console.log(`✗ (No data or skipped)`);
      }
      // Polite rate-limit delay
      await sleep(400);
    }
  }

  const result = {
    version: '15.5',
    patchNotes: 'Ranked Emerald+ Global Matchup Statistics',
    updatedAt: Date.now(),
    totalEntries: Object.keys(matchups).length,
    matchups,
  };

  // Ensure target directory exists
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');

  console.log(`\n==============================================`);
  console.log(`✓ Successfully updated ${totalSuccess} champions!`);
  console.log(`✓ Saved to: ${OUTPUT_FILE}`);
  console.log(`✓ Total entries in database: ${Object.keys(matchups).length}`);
  console.log(`==============================================\n`);
}

main();
