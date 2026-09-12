import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MATCHUPS_FILE = path.join(__dirname, '..', 'src', 'data', 'matchups.json');
const ROLES_FILE = path.join(__dirname, '..', 'src', 'data', 'championRoles.ts');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchChampionCounters(champSlug, opggLane) {
  const url = `https://op.gg/champions/${champSlug}/counters/${opggLane}`;
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      return null;
    }
    const html = await res.text();
    const pushes = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
    for (const p of pushes) {
      const unescaped = p[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      if (unescaped.includes('"data":[{') && unescaped.includes('"win_rate"')) {
        const match = unescaped.match(/"data":(\[\{.*?\}\])/s);
        if (match) {
          try {
            const rawList = JSON.parse(match[1]);
            const counters = rawList
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

            return counters;
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function main() {
  const matchupsData = JSON.parse(fs.readFileSync(MATCHUPS_FILE, 'utf8'));
  const matchups = matchupsData.matchups || {};

  // Build existing keys set
  const existingKeys = new Set(Object.keys(matchups));

  // Parse meta roles
  const rolesContent = fs.readFileSync(ROLES_FILE, 'utf8');
  const metaMatches = [...rolesContent.matchAll(/([a-zA-Z0-9_]+):\s*\[([^\]]+)\]/g)];

  const targets = [];
  for (const m of metaMatches) {
    const champId = m[1];
    const lanes = m[2].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);

    let slug = champId.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (slug.startsWith('nunu')) slug = 'nunu';
    if (slug.startsWith('renata')) slug = 'renata';

    for (const lane of lanes) {
      const shortLane = lane.toLowerCase();
      const opggLane = shortLane === 'jgl' ? 'jungle' : shortLane === 'sup' ? 'support' : shortLane;

      const keysToCheck = [`${slug}_${shortLane}`, `${slug}_${opggLane}`];
      if (shortLane === 'sup') keysToCheck.push(`${slug}_support`);
      if (shortLane === 'jgl') keysToCheck.push(`${slug}_jungle`);
      if (shortLane === 'adc') keysToCheck.push(`${slug}_bot`);

      const alreadyExists = keysToCheck.some(k => existingKeys.has(k));
      if (!alreadyExists) {
        targets.push({
          champId,
          slug,
          lane,
          shortLane,
          opggLane,
        });
      }
    }
  }

  console.log(`Found ${targets.length} missing champion matchups to fetch from OP.GG.`);

  let addedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const primaryKey = `${t.slug}_${t.shortLane}`;
    process.stdout.write(`[${i + 1}/${targets.length}] ${t.champId} (${t.slug}) in ${t.opggLane}... `);

    const counters = await fetchChampionCounters(t.slug, t.opggLane);

    if (counters && counters.length > 0) {
      const entry = {
        championSlug: t.slug,
        lane: t.lane.toUpperCase(),
        counters,
      };

      // Set primary key
      matchups[primaryKey] = entry;
      existingKeys.add(primaryKey);

      // Set aliases
      if (t.shortLane === 'sup') {
        matchups[`${t.slug}_support`] = entry;
        existingKeys.add(`${t.slug}_support`);
      } else if (t.shortLane === 'jgl') {
        matchups[`${t.slug}_jungle`] = entry;
        existingKeys.add(`${t.slug}_jungle`);
      } else if (t.shortLane === 'adc') {
        matchups[`${t.slug}_bot`] = entry;
        existingKeys.add(`${t.slug}_bot`);
      }

      console.log(`✓ (${counters.length} counters)`);
      addedCount++;

      // Save every 5 added entries
      if (addedCount % 5 === 0) {
        matchupsData.totalEntries = Object.keys(matchups).length;
        matchupsData.updatedAt = Date.now();
        fs.writeFileSync(MATCHUPS_FILE, JSON.stringify(matchupsData, null, 2), 'utf8');
      }
    } else {
      console.log(`✗ (No data on OP.GG)`);
      skippedCount++;
    }

    // Polite delay
    await sleep(350);
  }

  // Final save
  matchupsData.totalEntries = Object.keys(matchups).length;
  matchupsData.updatedAt = Date.now();
  fs.writeFileSync(MATCHUPS_FILE, JSON.stringify(matchupsData, null, 2), 'utf8');

  console.log(`\n=== Crawl Complete ===`);
  console.log(`Successfully added: ${addedCount}`);
  console.log(`Skipped / Not enough data: ${skippedCount}`);
  console.log(`Total entries in database: ${matchupsData.totalEntries}`);
}

main();
