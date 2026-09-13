import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory cache for Riot Data Dragon official champions
interface RiotCache {
  version: string;
  timestamp: number;
  champions: any[];
}

let riotCache: RiotCache | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

// Accurate ranked meta roles dictionary (self-contained for reliable serverless execution)
const CHAMPION_META_ROLES: Record<string, string[]> = {
  // TOP
  Aatrox: ['TOP'],
  Ambessa: ['TOP', 'JGL'],
  Camille: ['TOP'],
  Chogath: ['TOP', 'MID'],
  Darius: ['TOP'],
  DrMundo: ['TOP'],
  Fiora: ['TOP'],
  Gangplank: ['TOP', 'MID'],
  Garen: ['TOP'],
  Gnar: ['TOP'],
  Gwen: ['TOP', 'JGL'],
  Illaoi: ['TOP'],
  Jax: ['TOP', 'JGL'],
  Jayce: ['TOP', 'MID'],
  Kayle: ['TOP', 'MID'],
  Kennen: ['TOP'],
  Kled: ['TOP', 'MID'],
  KSante: ['TOP'],
  Malphite: ['TOP', 'MID', 'SUP'],
  Mordekaiser: ['TOP', 'JGL'],
  Nasus: ['TOP'],
  Olaf: ['TOP', 'JGL'],
  Ornn: ['TOP'],
  Quinn: ['TOP', 'ADC'],
  Renekton: ['TOP'],
  Riven: ['TOP'],
  Rumble: ['TOP', 'MID'],
  Sett: ['TOP', 'MID'],
  Shen: ['TOP', 'SUP'],
  Singed: ['TOP', 'MID'],
  Sion: ['TOP', 'MID'],
  TahmKench: ['TOP', 'SUP'],
  Teemo: ['TOP'],
  Trundle: ['TOP', 'JGL'],
  Tryndamere: ['TOP', 'MID'],
  Urgot: ['TOP'],
  Volibear: ['TOP', 'JGL'],
  Yorick: ['TOP'],
  Zaahen: ['TOP', 'JGL'],

  // JUNGLE
  Amumu: ['JGL', 'SUP'],
  Belveth: ['JGL'],
  Briar: ['JGL'],
  Diana: ['JGL', 'MID'],
  Ekko: ['JGL', 'MID'],
  Elise: ['JGL'],
  Evelynn: ['JGL'],
  Fiddlesticks: ['JGL'],
  Gragas: ['TOP', 'JGL', 'MID', 'SUP'],
  Graves: ['JGL'],
  Hecarim: ['JGL'],
  Ivern: ['JGL', 'SUP'],
  JarvanIV: ['JGL'],
  Karthus: ['JGL', 'ADC'],
  Kayn: ['JGL'],
  Khazix: ['JGL'],
  Kindred: ['JGL'],
  LeeSin: ['JGL'],
  Lillia: ['JGL'],
  MasterYi: ['JGL'],
  MonkeyKing: ['JGL', 'TOP'],
  Nidalee: ['JGL'],
  Nocturne: ['JGL'],
  Nunu: ['JGL'],
  Rammus: ['JGL', 'TOP'],
  RekSai: ['JGL'],
  Rengar: ['JGL', 'TOP'],
  Sejuani: ['JGL', 'TOP'],
  Shaco: ['JGL', 'SUP'],
  Shyvana: ['JGL'],
  Skarner: ['JGL', 'TOP'],
  Taliyah: ['JGL', 'MID'],
  Udyr: ['JGL', 'TOP'],
  Vi: ['JGL'],
  Viego: ['JGL'],
  Warwick: ['JGL', 'TOP'],
  XinZhao: ['JGL'],
  Zac: ['JGL', 'TOP', 'SUP'],

  // MID
  Ahri: ['MID'],
  Akali: ['MID', 'TOP'],
  Akshan: ['MID', 'TOP'],
  Anivia: ['MID'],
  Annie: ['MID', 'SUP'],
  AurelionSol: ['MID'],
  Aurora: ['MID', 'TOP'],
  Azir: ['MID'],
  Cassiopeia: ['MID', 'TOP'],
  Corki: ['MID', 'ADC'],
  Fizz: ['MID'],
  Galio: ['MID', 'SUP'],
  Heimerdinger: ['MID', 'TOP', 'SUP'],
  Hwei: ['MID', 'SUP'],
  Irelia: ['MID', 'TOP'],
  Kassadin: ['MID'],
  Katarina: ['MID'],
  Leblanc: ['MID'],
  Lissandra: ['MID'],
  Locke: ['MID', 'TOP'],
  Lux: ['MID', 'SUP'],
  Malzahar: ['MID'],
  Mel: ['MID', 'SUP'],
  Naafiri: ['MID', 'TOP'],
  Neeko: ['MID', 'SUP'],
  Orianna: ['MID'],
  Pantheon: ['MID', 'SUP', 'TOP'],
  Qiyana: ['MID', 'JGL'],
  Ryze: ['MID', 'TOP'],
  Swain: ['MID', 'SUP', 'ADC'],
  Sylas: ['MID', 'TOP', 'JGL'],
  Syndra: ['MID'],
  Talon: ['MID', 'JGL'],
  TwistedFate: ['MID', 'ADC'],
  Veigar: ['MID', 'ADC'],
  Velkoz: ['MID', 'SUP'],
  Vex: ['MID'],
  Viktor: ['MID'],
  Vladimir: ['MID', 'TOP'],
  Xerath: ['MID', 'SUP'],
  Yasuo: ['MID', 'TOP', 'ADC'],
  Yone: ['MID', 'TOP'],
  Zed: ['MID'],
  Ziggs: ['MID', 'ADC'],
  Zoe: ['MID'],

  // ADC
  Aphelios: ['ADC'],
  Ashe: ['ADC', 'SUP'],
  Caitlyn: ['ADC'],
  Draven: ['ADC'],
  Ezreal: ['ADC'],
  Jhin: ['ADC'],
  Jinx: ['ADC'],
  Kaisa: ['ADC'],
  Kalista: ['ADC'],
  KogMaw: ['ADC'],
  Lucian: ['ADC', 'MID'],
  MissFortune: ['ADC', 'SUP'],
  Nilah: ['ADC'],
  Samira: ['ADC'],
  Sivir: ['ADC'],
  Smolder: ['ADC', 'MID'],
  Tristana: ['ADC', 'MID'],
  Twitch: ['ADC'],
  Varus: ['ADC', 'MID'],
  Vayne: ['ADC', 'TOP'],
  Xayah: ['ADC'],
  Yunara: ['ADC'],
  Zeri: ['ADC'],

  // SUP
  Alistar: ['SUP'],
  Bard: ['SUP'],
  Blitzcrank: ['SUP'],
  Brand: ['SUP', 'MID', 'JGL'],
  Braum: ['SUP'],
  Janna: ['SUP'],
  Karma: ['SUP', 'MID'],
  Leona: ['SUP'],
  Lulu: ['SUP'],
  Maokai: ['SUP', 'TOP', 'JGL'],
  Milio: ['SUP'],
  Morgana: ['SUP', 'MID', 'JGL'],
  Nami: ['SUP'],
  Nautilus: ['SUP'],
  Poppy: ['SUP', 'TOP', 'JGL'],
  Pyke: ['SUP', 'MID'],
  Rakan: ['SUP'],
  Rell: ['SUP'],
  Renata: ['SUP'],
  Senna: ['SUP', 'ADC'],
  Seraphine: ['SUP', 'ADC', 'MID'],
  Sona: ['SUP'],
  Soraka: ['SUP'],
  Taric: ['SUP'],
  Thresh: ['SUP'],
  Yuumi: ['SUP'],
  Zilean: ['SUP', 'MID'],
  Zyra: ['SUP', 'JGL', 'MID'],
};

function getMetaLanes(championId: string, tags: string[] = []): string[] {
  if (CHAMPION_META_ROLES[championId]) {
    return CHAMPION_META_ROLES[championId];
  }
  const cleanId = (championId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  for (const [key, lanes] of Object.entries(CHAMPION_META_ROLES)) {
    if (key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cleanId) {
      return lanes;
    }
  }
  const fallbackLanes: string[] = [];
  if (tags.includes('Marksman')) fallbackLanes.push('ADC');
  if (tags.includes('Support')) fallbackLanes.push('SUP');
  if (tags.includes('Mage')) fallbackLanes.push('MID');
  if (tags.includes('Assassin')) fallbackLanes.push('MID');
  if (tags.includes('Fighter') || tags.includes('Tank')) fallbackLanes.push('TOP');
  return fallbackLanes.length > 0 ? fallbackLanes : ['MID'];
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
    const latestVersion = versions[0] || '16.18.1';

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
      const defaultLanes = getMetaLanes(c.id, c.tags || []);
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
