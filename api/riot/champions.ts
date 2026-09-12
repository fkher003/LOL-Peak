import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory cache for Riot Data Dragon official champions
interface RiotCache {
  version: string;
  timestamp: number;
  champions: any[];
}

let riotCache: RiotCache | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

// Helper to map Riot champion tags to LoL lanes
function mapRiotTagsToLanes(tags: string[], id: string): string[] {
  const overrides: Record<string, string[]> = {
    Aatrox: ['TOP'],
    Ahri: ['MID'],
    Akali: ['MID', 'TOP'],
    Darius: ['TOP'],
    Garen: ['TOP'],
    LeeSin: ['JGL'],
    Yasuo: ['MID', 'TOP', 'ADC'],
    Yone: ['MID', 'TOP'],
    Zed: ['MID'],
    Lux: ['MID', 'SUP'],
    Morgana: ['SUP', 'MID'],
    Thresh: ['SUP'],
    Blitzcrank: ['SUP'],
    Jinx: ['ADC'],
    Kaisa: ['ADC'],
    Vayne: ['ADC', 'TOP'],
    Caitlyn: ['ADC'],
    Teemo: ['TOP'],
    Malphite: ['TOP', 'MID', 'SUP'],
    Gragas: ['TOP', 'JGL', 'MID', 'SUP'],
    Poppy: ['TOP', 'JGL', 'SUP'],
    Rammus: ['JGL', 'TOP'],
  };

  if (overrides[id]) {
    return overrides[id];
  }

  const lanes: string[] = [];
  if (tags.includes('Marksman')) lanes.push('ADC');
  if (tags.includes('Support')) lanes.push('SUP');
  if (tags.includes('Mage')) {
    if (!lanes.includes('MID')) lanes.push('MID');
  }
  if (tags.includes('Assassin')) {
    if (!lanes.includes('MID')) lanes.push('MID');
    if (!lanes.includes('JGL')) lanes.push('JGL');
  }
  if (tags.includes('Fighter')) {
    if (!lanes.includes('TOP')) lanes.push('TOP');
    if (!lanes.includes('JGL')) lanes.push('JGL');
  }
  if (tags.includes('Tank')) {
    if (!lanes.includes('TOP')) lanes.push('TOP');
    if (!lanes.includes('SUP')) lanes.push('SUP');
    if (!lanes.includes('JGL')) lanes.push('JGL');
  }

  return lanes.length > 0 ? lanes : ['MID'];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check in-memory cache
    if (riotCache && Date.now() - riotCache.timestamp < CACHE_TTL_MS) {
      res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=86400');
      return res.status(200).json({
        success: true,
        cached: true,
        version: riotCache.version,
        total: riotCache.champions.length,
        source: 'Riot Games Data Dragon (Cached)',
        champions: riotCache.champions,
      });
    }

    // 1. Fetch latest Riot version
    const versionsRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (!versionsRes.ok) {
      throw new Error(`Failed to fetch Riot versions: ${versionsRes.statusText}`);
    }
    const versions = (await versionsRes.json()) as string[];
    const latestVersion = versions[0] || '15.5.1';

    // 2. Fetch Vietnamese champion data
    const championsRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/vi_VN/champion.json`
    );
    if (!championsRes.ok) {
      throw new Error(`Failed to fetch Riot champion.json: ${championsRes.statusText}`);
    }
    const champData = (await championsRes.json()) as any;

    // 3. Transform into standardized app format
    const championsList = Object.values(champData.data || {}).map((c: any) => {
      const defaultLanes = mapRiotTagsToLanes(c.tags || [], c.id);
      return {
        id: c.id,
        key: c.key,
        name: c.name,
        title: c.title,
        blurb: c.blurb,
        tags: c.tags || [],
        defaultLanes,
        avatarUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${c.image.full}`,
        version: latestVersion,
      };
    });

    // Sort alphabetically by champion name
    championsList.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    riotCache = {
      version: latestVersion,
      timestamp: Date.now(),
      champions: championsList,
    };

    res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=86400');
    return res.status(200).json({
      success: true,
      cached: false,
      version: latestVersion,
      total: championsList.length,
      source: 'Riot Games Data Dragon (Official)',
      champions: championsList,
    });
  } catch (error: any) {
    console.error('Riot Data Dragon fetch error:', error);
    if (riotCache) {
      return res.status(200).json({
        success: true,
        cached: true,
        stale: true,
        version: riotCache.version,
        total: riotCache.champions.length,
        source: 'Riot Games Data Dragon (Stale Fallback)',
        champions: riotCache.champions,
      });
    }
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch champion data from Riot Games Data Dragon.',
    });
  }
}
