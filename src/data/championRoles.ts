import { Lane } from '../types';

/**
 * League of Legends Champion Meta Roles
 * Strict, accurate role mapping according to ranked competitive meta.
 * Eliminates inaccurate lane suggestions (e.g. Fiora/Darius in Jungle).
 */

export const CHAMPION_META_ROLES: Record<string, Lane[]> = {
  // --- TOP LANE ---
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
  Quinn: ['TOP'],
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

  // --- JUNGLE ---
  Amumu: ['JGL', 'SUP'],
  Belveth: ['JGL'],
  Briar: ['JGL'],
  Diana: ['JGL', 'MID'],
  Ekko: ['JGL', 'MID'],
  Elise: ['JGL'],
  Evelynn: ['JGL'],
  Fiddlesticks: ['JGL'],
  Gragas: ['TOP', 'JGL', 'MID'],
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
  Nidalee: ['JGL'],
  Nocturne: ['JGL'],
  Nunu: ['JGL'],
  Rammus: ['JGL'],
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
  Wukong: ['JGL', 'TOP'],
  MonkeyKing: ['JGL', 'TOP'],
  XinZhao: ['JGL'],
  Zac: ['JGL', 'TOP', 'SUP'],

  // --- MID LANE ---
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

  // --- ADC / BOT ---
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

  // --- SUPPORT ---
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

/**
 * Resolve authentic meta lanes for a given champion ID or tags.
 */
export function getMetaLanes(championId: string, tags: string[] = []): Lane[] {
  // Direct match in verified meta dictionary
  if (CHAMPION_META_ROLES[championId]) {
    return CHAMPION_META_ROLES[championId];
  }

  // Case-insensitive / slug check
  const cleanId = (championId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  for (const [key, lanes] of Object.entries(CHAMPION_META_ROLES)) {
    if (key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cleanId) {
      return lanes;
    }
  }

  // Fallback for new unlisted champions based on Riot tags
  const fallbackLanes: Lane[] = [];
  if (tags.includes('Marksman')) fallbackLanes.push('ADC');
  if (tags.includes('Support')) fallbackLanes.push('SUP');
  if (tags.includes('Mage')) fallbackLanes.push('MID');
  if (tags.includes('Assassin')) fallbackLanes.push('MID');
  if (tags.includes('Fighter') || tags.includes('Tank')) fallbackLanes.push('TOP');

  return fallbackLanes.length > 0 ? fallbackLanes : ['MID'];
}
