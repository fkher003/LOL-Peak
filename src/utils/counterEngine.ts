import { ChampionData, CounterRecommendation, EnemySlot, Lane, PersonalChampion } from '../types';
import { CHAMPIONS_LIST, COUNTER_DATABASE, getChampionAvatar } from '../data/champions';
import { getChampionProfile } from './championProfiles';

// Heuristic team traits for dynamic synergy matching
const AUTO_ATTACKERS = new Set(['MasterYi', 'Tryndamere', 'Yasuo', 'Yone', 'Viego', 'Belveth', 'Draven', 'Jinx', 'Kaisa', 'Vayne', 'Twitch']);
const ASSASSINS = new Set(['Zed', 'Katarina', 'Leblanc', 'Akali', 'Fizz', 'Talon', 'Khazix', 'Rengar', 'Evelynn', 'Qiyana']);
const HEAVY_TANKS = new Set(['Sion', 'Chogath', 'Ornn', 'TahmKench', 'DrMundo', 'Malphite', 'Rammus', 'Sejuani', 'Zac']);
const DASHERS = new Set(['Irelia', 'Fiora', 'Yasuo', 'Riven', 'Kalista', 'LeeSin', 'Samira', 'Akali', 'Lucian']);
const HOOK_ENGAGE = new Set(['Blitzcrank', 'Thresh', 'Nautilus', 'Leona', 'Pyke', 'Amumu']);

export function calculateDraftCounterRecommendations(
  myLane: Lane,
  enemyTeam: EnemySlot[],
  personalPool: PersonalChampion[],
  allChampions: ChampionData[] = CHAMPIONS_LIST
): CounterRecommendation[] {
  // Filter active picked enemies
  const activeEnemies = enemyTeam.filter((slot) => slot.champion !== null);
  if (activeEnemies.length === 0) {
    return [];
  }

  // Identify direct lane opponent:
  // 1. Explicitly assigned slot with lane === myLane
  // 2. OR an enemy whose default lanes include myLane
  let directLaneOpponent: ChampionData | null = null;
  const explicitSameLane = activeEnemies.find((slot) => slot.lane === myLane);
  if (explicitSameLane && explicitSameLane.champion) {
    directLaneOpponent = explicitSameLane.champion;
  } else {
    // Check if any enemy is naturally from this lane
    const naturalSameLane = activeEnemies.find(
      (slot) => slot.champion && slot.champion.defaultLanes.includes(myLane)
    );
    if (naturalSameLane && naturalSameLane.champion) {
      directLaneOpponent = naturalSameLane.champion;
    }
  }

  // Personal pool champions map for rapid lookup
  const personalPoolMap = new Map<string, PersonalChampion>();
  personalPool.forEach((p) => {
    personalPoolMap.set(p.championName.toLowerCase(), p);
    personalPoolMap.set(p.championId.toLowerCase(), p);
  });

  // Candidate pool: All champions playable in myLane (either standard or in personal pool)
  const candidateMap = new Map<string, ChampionData>();

  allChampions.forEach((c) => {
    const inPersonalForThisLane = personalPool.some(
      (p) =>
        (p.championId.toLowerCase() === c.id.toLowerCase() ||
          p.championName.toLowerCase() === c.name.toLowerCase()) &&
        p.lanes.includes(myLane)
    );

    if (c.defaultLanes.includes(myLane) || inPersonalForThisLane) {
      candidateMap.set(c.id, c);
    }
  });

  const recommendations: CounterRecommendation[] = [];

  candidateMap.forEach((candidate) => {
    // Do not recommend a champion that is already picked by the enemy
    const isAlreadyEnemy = activeEnemies.some(
      (slot) => slot.champion?.id === candidate.id || slot.champion?.name === candidate.name
    );
    if (isAlreadyEnemy) return;

    const inPersonalPool = personalPool.some(
      (p) =>
        (p.championId.toLowerCase() === candidate.id.toLowerCase() ||
          p.championName.toLowerCase() === candidate.name.toLowerCase()) &&
        p.lanes.includes(myLane)
    );

    const personalEntry = personalPool.find(
      (p) =>
        p.championId.toLowerCase() === candidate.id.toLowerCase() ||
        p.championName.toLowerCase() === candidate.name.toLowerCase()
    );

    const counteredEnemiesList: {
      championName: string;
      championId: string;
      isSameLane: boolean;
      reason: string;
    }[] = [];

    let isLaneCounter = false;
    let specificKeyTip = '';

    // Evaluate each enemy in the enemy team
    activeEnemies.forEach((enemySlot) => {
      const enemy = enemySlot.champion;
      if (!enemy) return;

      const isSameLane = directLaneOpponent ? directLaneOpponent.id === enemy.id : enemySlot.lane === myLane;

      // 1. Check COUNTER_DATABASE
      const enemyCounters = COUNTER_DATABASE[enemy.id] || [];
      const counterMatch = enemyCounters.find(
        (cnt) => cnt.counterChampionId === candidate.id || cnt.counterChampionName === candidate.name
      );

      // 2. Check Personal Pool targets
      const personalTargets = personalEntry?.counterTargets || [];
      const isPersonalCounter = personalTargets.some(
        (target) =>
          target.toLowerCase().includes(enemy.name.toLowerCase()) ||
          enemy.name.toLowerCase().includes(target.toLowerCase())
      );

      // 3. Check Archetype counter heuristics
      let heuristicReason = '';
      if (['Malphite', 'Rammus', 'Jax', 'Poppy'].includes(candidate.id) && AUTO_ATTACKERS.has(enemy.id)) {
        heuristicReason = `Khắc chế mạnh chất tướng đánh thường tốc độ cao của ${enemy.name} nhờ giảm tốc đánh, né đòn hoặc phản sát thương vật lý.`;
      } else if (['Lissandra', 'Vex', 'Malzahar', 'Galio'].includes(candidate.id) && ASSASSINS.has(enemy.id)) {
        heuristicReason = `Khống chế cứng khóa chết ${enemy.name}, chặn đứng hoàn toàn khả năng lướt và dồn sát thương sốc.`;
      } else if (['Vayne', 'Fiora', 'Gwen'].includes(candidate.id) && HEAVY_TANKS.has(enemy.id)) {
        heuristicReason = `Sát thương chuẩn và đánh theo % máu tối đa vô hiệu hóa lớp giáp dày của ${enemy.name}.`;
      } else if (['Poppy', 'Vex', 'Gragas'].includes(candidate.id) && DASHERS.has(enemy.id)) {
        heuristicReason = `Kỹ năng chặn lướt ngắt đứng các nhịp di chuyển bay nhảy của ${enemy.name}.`;
      } else if (['Morgana', 'Braum', 'Janna'].includes(candidate.id) && HOOK_ENGAGE.has(enemy.id)) {
        heuristicReason = `Khiên đen hoặc kỹ năng chặn đạn đạo vô hiệu hóa hoàn toàn cú mở kéo của ${enemy.name}.`;
      }

      if (counterMatch || isPersonalCounter || heuristicReason) {
        const reason =
          counterMatch?.whyPick ||
          heuristicReason ||
          (personalEntry?.notes
            ? `(Bể tướng cá nhân) ${personalEntry.notes}`
            : `Khắc chế hiệu quả cơ chế kỹ năng của ${enemy.name}.`);

        if (counterMatch?.keySkillTip && !specificKeyTip) {
          specificKeyTip = counterMatch.keySkillTip;
        }

        counteredEnemiesList.push({
          championName: enemy.name,
          championId: enemy.id,
          isSameLane: Boolean(isSameLane),
          reason,
        });

        if (isSameLane) {
          isLaneCounter = true;
        }
      }
    });

    // Only include if it counters at least one enemy in the draft
    if (counteredEnemiesList.length === 0) {
      return;
    }

    const teamCounterCount = counteredEnemiesList.filter((e) => !e.isSameLane).length;

    // Scope determination:
    // 'BOTH': Counters lane opponent AND counters other enemies in team
    // 'LANE_ONLY': Counters lane opponent only
    // 'TEAM_ONLY': Counters team members, but not lane opponent
    let scope: 'BOTH' | 'LANE_ONLY' | 'TEAM_ONLY' = 'TEAM_ONLY';
    let score = 0;
    let tierLabel: 'S+ Tối Ưu' | 'S Xuất Sắc' | 'A Khuyên Dùng' | 'B Khả Dụng' = 'A Khuyên Dùng';

    if (isLaneCounter && teamCounterCount > 0) {
      scope = 'BOTH';
      score = 90 + teamCounterCount * 15;
      tierLabel = 'S+ Tối Ưu';
    } else if (isLaneCounter) {
      scope = 'LANE_ONLY';
      score = 75 + teamCounterCount * 10;
      tierLabel = 'S Xuất Sắc';
    } else {
      scope = 'TEAM_ONLY';
      score = 50 + teamCounterCount * 15;
      tierLabel = teamCounterCount >= 2 ? 'S Xuất Sắc' : 'A Khuyên Dùng';
    }

    // Boost if in personal pool (user is familiar with this champion)
    if (inPersonalPool) {
      score += 20;
    }

    const profile = getChampionProfile(candidate.id, candidate.name);

    recommendations.push({
      championId: candidate.id,
      championName: candidate.name,
      avatarUrl: candidate.avatarUrl || getChampionAvatar(candidate.id),
      lanes: candidate.defaultLanes,
      scope,
      score,
      tierLabel,
      counteredEnemies: counteredEnemiesList,
      pros: profile.pros,
      cons: profile.cons,
      keyTip: specificKeyTip || personalEntry?.notes || profile.keyTip,
      inPersonalPool,
    });
  });

  // Sort descending by score
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}
