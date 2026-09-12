import { ChampionData, CounterRecommendation, EnemySlot, Lane, PersonalChampion, MatchupStat } from '../types';
import { CHAMPIONS_LIST, COUNTER_DATABASE, getChampionAvatar } from '../data/champions';
import { getChampionProfile } from './championProfiles';
import { getMetaLanes } from '../data/championRoles';
import matchupsDataRaw from '../data/matchups.json';

interface MatchupEntry {
  championKey: string;
  championName: string;
  winRate: number;
  playCount: number;
  tier: 'HARD_COUNTER' | 'STRONG_COUNTER' | 'SKILL_MATCHUP';
}

interface MatchupsDatabase {
  version: string;
  patchNotes?: string;
  updatedAt: number;
  matchups: Record<string, {
    championSlug: string;
    lane: string;
    counters: MatchupEntry[];
  }>;
}

const matchupsData = matchupsDataRaw as unknown as MatchupsDatabase;

function toSlug(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Pre-indexed Map for O(1) instantaneous lookup:
// Key: `${enemySlug}_${lane}` -> Map<candidateSlug, MatchupEntry>
const STAT_MATCHUPS_INDEX = new Map<string, Map<string, MatchupEntry>>();

(function initMatchupsIndex() {
  const matchups = matchupsData.matchups || {};
  for (const [key, data] of Object.entries(matchups)) {
    const counterMap = new Map<string, MatchupEntry>();
    if (Array.isArray(data.counters)) {
      for (const c of data.counters) {
        const key1 = toSlug(c.championKey);
        const key2 = toSlug(c.championName);
        if (key1) counterMap.set(key1, c);
        if (key2) counterMap.set(key2, c);
      }
    }
    const normKey = key.toLowerCase();
    STAT_MATCHUPS_INDEX.set(normKey, counterMap);

    // Bidirectional aliases for different lane naming standards
    if (normKey.endsWith('_support')) {
      STAT_MATCHUPS_INDEX.set(normKey.replace(/_support$/, '_sup'), counterMap);
    } else if (normKey.endsWith('_sup')) {
      STAT_MATCHUPS_INDEX.set(normKey.replace(/_sup$/, '_support'), counterMap);
    }

    if (normKey.endsWith('_jungle')) {
      STAT_MATCHUPS_INDEX.set(normKey.replace(/_jungle$/, '_jgl'), counterMap);
    } else if (normKey.endsWith('_jgl')) {
      STAT_MATCHUPS_INDEX.set(normKey.replace(/_jgl$/, '_jungle'), counterMap);
    }

    if (normKey.endsWith('_adc')) {
      STAT_MATCHUPS_INDEX.set(normKey.replace(/_adc$/, '_bot'), counterMap);
    } else if (normKey.endsWith('_bot')) {
      STAT_MATCHUPS_INDEX.set(normKey.replace(/_bot$/, '_adc'), counterMap);
    }
  }
})();

// Heuristic team traits for dynamic synergy matching
const AUTO_ATTACKERS = new Set(['MasterYi', 'Tryndamere', 'Yasuo', 'Yone', 'Viego', 'Belveth', 'Draven', 'Jinx', 'Kaisa', 'Vayne', 'Twitch']);
const ASSASSINS = new Set(['Zed', 'Katarina', 'Leblanc', 'Akali', 'Fizz', 'Talon', 'Khazix', 'Rengar', 'Evelynn', 'Qiyana']);
const HEAVY_TANKS = new Set(['Sion', 'Chogath', 'Ornn', 'TahmKench', 'DrMundo', 'Malphite', 'Rammus', 'Sejuani', 'Zac']);
const DASHERS = new Set(['Irelia', 'Fiora', 'Yasuo', 'Riven', 'Kalista', 'LeeSin', 'Samira', 'Akali', 'Lucian']);
const HOOK_ENGAGE = new Set(['Blitzcrank', 'Thresh', 'Nautilus', 'Leona', 'Pyke', 'Amumu']);

export interface MakeLateProfile {
  reason: string;
}

export const MAKE_LATE_CHAMPIONS: Record<string, MakeLateProfile> = {
  // TOP
  Kayle: {
    reason: 'Càng về late càng biến thành cỗ máy xả sát thương chuẩn diện rộng tầm xa. Đạt cấp 16 kèm chiêu cuối bất tử là điều kiện thắng gần như tuyệt đối.',
  },
  Ornn: {
    reason: 'Nội tại đúc trang bị Huyền Thoại nâng cấp cho cả 5 thành viên về late (gia tăng hàng ngàn vàng giá trị chỉ số), chiêu R mở giao tranh cực đại.',
  },
  Gwen: {
    reason: 'Sương Lam Bất Tử né toàn bộ sát thương ngoài tầm, late game chém % máu tối đa và hồi phục khổng lồ, một mình gánh cả giao tranh mục tiêu lớn.',
  },
  Jax: {
    reason: 'Đầy đủ trang bị về late gần như không đối thủ nào 1v1 lại, chiêu E né đòn đánh tay và chiêu R biến Jax thành cỗ máy công thủ toàn diện.',
  },
  Sion: {
    reason: 'Nội tại W tích máu vô hạn không giới hạn, về late đạt 6000-8000 máu đứng hứng toàn bộ sát thương và chiêu R tông mở combat hoặc backdoor phá nhà chính.',
  },
  Fiora: {
    reason: 'Về late chém 4 điểm yếu Đại Thử Thách gây 70-100% sát thương chuẩn theo máu tối đa, bắt buộc đối phương phải cử 2-3 người kèm.',
  },
  Nasus: {
    reason: 'Tích Q trên 600-800 điểm, gõ 1-2 hit sập trụ hoặc một mạng chủ lực đối phương, cực kỳ uy lực khi team giữ nhịp trận đấu dài.',
  },
  Gangplank: {
    reason: 'Combo thùng thuốc súng chí mạng 1500+ damage diện rộng và R mưa đại bác toàn bản đồ xóa sổ toàn bộ đội hình địch trong 1 giây.',
  },
  DrMundo: {
    reason: 'Kháng hiệu ứng, hồi máu cực đại với R và sát thương vật lý tăng theo máu tối đa biến Mundo thành con quái vật không thể hạ gục ở phút 35+.',
  },
  Chogath: {
    reason: 'Xơi tái tích lũy kích cỡ và máu vô hạn, chiêu R cắn chết ngay lập tức chủ lực địch hoặc tranh chấp Baron/Rồng Ngàn Tuổi hơn cả Trừng Phạt.',
  },

  // JUNGLE
  Karthus: {
    reason: 'Càng về late chiêu R Khúc Cầu Hồn càng gây lượng sát thương khủng khiếp lên cả 5 tướng địch dù ở bất cứ đâu trên bản đồ, chết vẫn xả chiêu.',
  },
  MasterYi: {
    reason: 'Chiêu R miễn nhiễm làm chậm, sát thương chuẩn và Q chém né chiêu, bước vào giao tranh sau khi đối thủ mất khống chế là cầm chắc Quét Sạch.',
  },
  Viego: {
    reason: 'Chỉ cần 1 điểm hạ gục trong giao tranh late game để kích hoạt nội tại đoạt mệnh, biến hình hồi máu liên tục và bất tử từng nhịp.',
  },
  Belveth: {
    reason: 'Nội tại tăng tốc độ đánh không giới hạn, nhặt bọ hư không đẩy sập 3 đường lính siêu cấp đưa trận đấu về thế thắng áp đảo.',
  },
  Amumu: {
    reason: 'Chiêu R Lời Nguyền Xác Ướp trói diện rộng kết hợp nội tại sát thương chuẩn giúp team nổ sát thương xóa sổ giao tranh 5v5 cuối trận.',
  },
  Zac: {
    reason: 'Tầm nhảy E xa nửa màn hình mở combat bất ngờ, phân chia lỏng quấy nhiễu cực mạnh và hồi máu liên tục trong giao tranh tổng.',
  },
  Hecarim: {
    reason: 'Tích đủ đồ đấu sĩ late game, càn quét tốc độ cao và chiêu R hoảng sợ diện rộng chia cắt hoàn toàn đội hình đối phương.',
  },

  // MID
  AurelionSol: {
    reason: 'Tích điểm Bụi Sao không giới hạn, chiêu E hố đen hút cả bản đồ và R Thiên Thạch Tinh Vân làm choáng toàn màn hình phút 30+.',
  },
  Kassadin: {
    reason: 'Mốc cấp 16 chiêu R hồi trong 1.5 giây, sốc chết bất kỳ xạ thủ hay pháp sư nào trong chớp mắt và bay nhảy không thể bắt giữ.',
  },
  Veigar: {
    reason: 'Nội tại tích SMPT vĩnh viễn (dễ dàng đạt 1200+ AP), R một nút bốc hơi đối thủ và lồng E chặn mọi đường lui trong giao tranh then chốt.',
  },
  Smolder: {
    reason: 'Đạt mốc 225 điểm nội tại, chiêu Q thiêu đốt diện rộng kết liễu thẳng kẻ địch dưới ngưỡng máu, đứng xả từ tầm rất an toàn.',
  },
  Viktor: {
    reason: 'Nâng cấp hoàn thiện 3 chiêu thức, xả chiêu liên tục, khống chế diện rộng và R Bão Điện Từ càn quét toàn bộ đội hình địch.',
  },
  Vladimir: {
    reason: 'Nội tại chuyển máu sang AP và ngược lại, W hồ máu outplay mọi chiêu dồn dame, chiêu R khuếch đại sát thương và hồi đầy cây máu.',
  },
  Azir: {
    reason: 'Lính cát chọc sát thương phép theo giây cực mạnh, tầm đánh cực xa công thủ trụ hoàn hảo và chiêu R hất tung bảo vệ hoặc bắt bớ.',
  },
  Orianna: {
    reason: 'Chiêu R Lệnh: Sóng Âm late game gom toàn bộ đội hình đối phương là thắng giao tranh ngay lập tức, cấu rỉa và tạo giáp liên tục.',
  },
  Ryze: {
    reason: 'Tăng tiến sức mạnh theo cả Mana lẫn AP, xả combo lan E-Q dọn sạch đợt lính và sốc chết cả đội hình tụm lại.',
  },
  Cassiopeia: {
    reason: 'Không cần mua giày (tiết kiệm 1 ô trang bị cho item thứ 6), xả E liên tục như súng liên thanh và R Hóa Đá lật ngược giao tranh.',
  },

  // ADC
  Jinx: {
    reason: 'Chỉ cần 1 mạng hạ gục hoặc hỗ trợ là kích hoạt Hưng Phấn bắn tên lửa chí mạng tầm xa điên cuồng, dọn sạch đội hình địch trong vài giây.',
  },
  Vayne: {
    reason: 'Chiêu W gây % máu tối đa sát thương chuẩn không có cách nào chống đỡ, Q tàng hình liên tục trong chiêu R khiến sát thủ địch bất lực.',
  },
  KogMaw: {
    reason: 'Tầm bắn xa ngút ngàn với W, kết hợp bắn theo % máu và sát thương hỗn hợp làm bốc hơi mọi tanker chỉ trong 3 giây đứng xả.',
  },
  Twitch: {
    reason: 'Tàng hình tìm góc đứng bọc lót, mở R Nhắm Mắt Bắn Bừa xuyên thấu toàn bộ đội hình địch kèm chí mạng cực đại phút late.',
  },
  Kaisa: {
    reason: 'Tiến hóa đủ 3 kỹ năng Q-W-E, R bay thẳng vào tuyến sau hoặc tự tạo giáp dày, sát thương dồn đơn mục tiêu vô cùng khủng khiếp.',
  },
  Aphelios: {
    reason: 'Sở hữu lượng đồ đầy đủ cùng súng hỏa ngục hoặc súng thăng hoa, chiêu R diện rộng có thể oneshot 3-4 thành viên địch tụm lại.',
  },
  Zeri: {
    reason: 'Chiêu R Điện Đạt Đỉnh Điểm tăng tốc chạy vô hạn theo thời gian giao tranh, lướt địa hình đào thoát và xả đạn lan diện rộng.',
  },
  Senna: {
    reason: 'Nội tại nhặt linh hồn tăng vô hạn tầm đánh, SMCK và tỉ lệ chí mạng, late game đứng từ ngoài tầm nhìn bắn nát trụ và đối thủ.',
  },

  // SUP
  Sona: {
    reason: 'Càng về late điểm hồi kỹ năng càng chạm trần, spam chiêu liên tục hồi máu, tạo giáp và tăng tốc cho cả 5 thành viên như hồ máu di động.',
  },
  Taric: {
    reason: 'Chiêu R Vũ Trụ Rực Sáng biến cả đội hình thành bất tử trong 2.5 giây, vô hiệu hóa hoàn toàn mọi chiêu dồn sát thương của đối phương ở combat then chốt.',
  },
  Braum: {
    reason: 'Dựng khiên E chặn đứng mọi hỏa lực tầm xa của xạ thủ/pháp sư địch, R hất tung diện rộng bảo kê tuyệt đối cho chủ lực Make Late.',
  },
  Rakan: {
    reason: 'Combo R-W lướt làm mê hoặc và hất tung toàn bộ đội ngũ địch trong chớp mắt, khả năng lật kèo giao tranh tổng phút 30+ đỉnh cao.',
  },
  Thresh: {
    reason: 'Nội tại nhặt linh hồn tăng vô hạn Giáp và SMPT, lồng đèn W giải cứu đồng đội mắc lỗi vị trí và kéo Q bắt lẻ quyết định ván đấu.',
  },
  Lulu: {
    reason: 'Biến Cóc vô hiệu hóa sát thủ địch lao vào, chiêu R Khổng Lồ Hóa tăng máu và hất tung giúp chủ lực late game không thể bị hạ gục.',
  },
  Milio: {
    reason: 'Chiêu W tăng tầm đánh cho xạ thủ bắn từ cực xa, chiêu R giải toàn bộ hiệu ứng khống chế và hồi máu cho cả đội hình.',
  },
};

export function getMakeLateInfo(championId: string, championName: string): MakeLateProfile | undefined {
  const cleanId = (championId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanName = (championName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  for (const [key, profile] of Object.entries(MAKE_LATE_CHAMPIONS)) {
    const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (cleanKey === cleanId || cleanKey === cleanName) {
      return profile;
    }
  }
  return undefined;
}

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
    const naturalSameLane = activeEnemies.find((slot) => {
      if (!slot.champion) return false;
      const verifiedLanes = getMetaLanes(slot.champion.id, slot.champion.tags || []);
      return verifiedLanes.includes(myLane);
    });
    if (naturalSameLane && naturalSameLane.champion) {
      directLaneOpponent = naturalSameLane.champion;
    }
  }

  // Candidate pool: All champions strictly playable in myLane according to meta or personal pool
  const candidateMap = new Map<string, ChampionData>();

  allChampions.forEach((c) => {
    const verifiedLanes = getMetaLanes(c.id, c.tags || []);
    const inPersonalForThisLane = personalPool.some(
      (p) =>
        (p.championId.toLowerCase() === c.id.toLowerCase() ||
          p.championName.toLowerCase() === c.name.toLowerCase()) &&
        p.lanes.includes(myLane)
    );

    if (verifiedLanes.includes(myLane) || inPersonalForThisLane) {
      candidateMap.set(c.id, {
        ...c,
        defaultLanes: verifiedLanes,
      });
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
    let bestWinRateStat: MatchupStat | undefined = undefined;

    const candSlug = toSlug(candidate.id);
    const candNameSlug = toSlug(candidate.name);

    // Evaluate each enemy in the enemy team
    activeEnemies.forEach((enemySlot) => {
      const enemy = enemySlot.champion;
      if (!enemy) return;

      const isSameLane = directLaneOpponent ? directLaneOpponent.id === enemy.id : enemySlot.lane === myLane;

      // 1. Check Statistical Ranked Matchup Data with O(1) Index Map
      let statMatch: MatchupEntry | undefined = undefined;
      const enemyLaneForLookup = enemySlot.lane || (isSameLane ? myLane : (enemy.defaultLanes[0] || 'MID'));
      const enemyLaneStr = enemyLaneForLookup.toLowerCase();
      const myLaneStr = myLane.toLowerCase();

      // Collect lane alias candidates (sup/support, jgl/jungle, adc/bot)
      const enemyLaneVariants = new Set<string>([enemyLaneStr]);
      if (enemyLaneStr === 'sup' || enemyLaneStr === 'support') {
        enemyLaneVariants.add('sup');
        enemyLaneVariants.add('support');
      }
      if (enemyLaneStr === 'jgl' || enemyLaneStr === 'jungle') {
        enemyLaneVariants.add('jgl');
        enemyLaneVariants.add('jungle');
      }
      if (enemyLaneStr === 'adc' || enemyLaneStr === 'bot') {
        enemyLaneVariants.add('adc');
        enemyLaneVariants.add('bot');
      }

      const myLaneVariants = new Set<string>([myLaneStr]);
      if (myLaneStr === 'sup' || myLaneStr === 'support') {
        myLaneVariants.add('sup');
        myLaneVariants.add('support');
      }
      if (myLaneStr === 'jgl' || myLaneStr === 'jungle') {
        myLaneVariants.add('jgl');
        myLaneVariants.add('jungle');
      }
      if (myLaneStr === 'adc' || myLaneStr === 'bot') {
        myLaneVariants.add('adc');
        myLaneVariants.add('bot');
      }

      const enemyIdSlug = toSlug(enemy.id);
      const enemyNameSlug = toSlug(enemy.name);

      const lookupKeys: string[] = [];
      for (const lv of enemyLaneVariants) {
        lookupKeys.push(`${enemyIdSlug}_${lv}`);
        lookupKeys.push(`${enemyNameSlug}_${lv}`);
      }
      for (const mlv of myLaneVariants) {
        lookupKeys.push(`${enemyIdSlug}_${mlv}`);
        lookupKeys.push(`${enemyNameSlug}_${mlv}`);
      }

      for (const key of lookupKeys) {
        const enemyIndex = STAT_MATCHUPS_INDEX.get(key);
        if (enemyIndex) {
          statMatch = enemyIndex.get(candSlug) || enemyIndex.get(candNameSlug);
          if (statMatch) break;
        }
      }

      // If statistical counter is found with favorable winrate
      const isStatisticalAdvantage = statMatch && statMatch.winRate >= 51.5;
      if (isStatisticalAdvantage && statMatch) {
        if (isSameLane) {
          isLaneCounter = true;
          if (!bestWinRateStat || statMatch.winRate > bestWinRateStat.winRate) {
            bestWinRateStat = {
              championKey: statMatch.championKey,
              championName: candidate.name,
              winRate: statMatch.winRate,
              playCount: statMatch.playCount,
              tier: statMatch.tier,
              enemyChampionName: enemy.name,
            };
          }
        }
      }

      // 2. Check Static COUNTER_DATABASE
      const enemyCounters = COUNTER_DATABASE[enemy.id] || [];
      const counterMatch = enemyCounters.find(
        (cnt) => cnt.counterChampionId === candidate.id || cnt.counterChampionName === candidate.name
      );

      // 3. Check Personal Pool targets
      const personalTargets = personalEntry?.counterTargets || [];
      const isPersonalCounter = personalTargets.some(
        (target) =>
          target.toLowerCase().includes(enemy.name.toLowerCase()) ||
          enemy.name.toLowerCase().includes(target.toLowerCase())
      );

      // 4. Check Archetype counter heuristics
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

      if (statMatch && isStatisticalAdvantage) {
        const reason = `Thống kê xếp hạng: Đạt ${statMatch.winRate}% tỷ lệ thắng trước ${enemy.name} (${statMatch.playCount.toLocaleString('vi-VN')} trận). ${counterMatch?.whyPick || ''}`;
        if (counterMatch?.keySkillTip && !specificKeyTip) {
          specificKeyTip = counterMatch.keySkillTip;
        }
        counteredEnemiesList.push({
          championName: enemy.name,
          championId: enemy.id,
          isSameLane: Boolean(isSameLane),
          reason: reason.trim(),
        });
      } else if (counterMatch || isPersonalCounter || heuristicReason) {
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

    // Check if this candidate is a designated Make Late pick
    const makeLateInfo = getMakeLateInfo(candidate.id, candidate.name);
    const isMakeLate = Boolean(makeLateInfo);

    // If candidate does not directly counter any enemy, but is a premier Make Late pick for this lane
    if (counteredEnemiesList.length === 0) {
      if (isMakeLate && makeLateInfo) {
        counteredEnemiesList.push({
          championName: 'Cả Đội Hình Địch',
          championId: candidate.id,
          isSameLane: false,
          reason: makeLateInfo.reason,
        });
      } else {
        return;
      }
    }

    const teamCounterCount = counteredEnemiesList.filter((e) => !e.isSameLane).length;

    // Scope determination:
    // 'BOTH': Counters lane opponent AND counters other enemies in team
    // 'LANE_ONLY': Counters lane opponent only
    // 'TEAM_ONLY': Gợi ý tướng tốt cho đội hình kiểu Make Late hoặc khắc chế tướng khác
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
      score = isMakeLate ? 72 + teamCounterCount * 10 : 50 + teamCounterCount * 15;
      tierLabel = isMakeLate || teamCounterCount >= 2 ? 'S Xuất Sắc' : 'A Khuyên Dùng';
    }

    // Extra priority for champions with premier late-game scaling (Make Late)
    if (isMakeLate) {
      score += 15;
    }

    // Statistical Win Rate Score Bonus
    if (bestWinRateStat) {
      if (bestWinRateStat.winRate >= 54.0) {
        score += Math.round((bestWinRateStat.winRate - 50) * 3.5);
        if (bestWinRateStat.winRate >= 55.0) {
          tierLabel = 'S+ Tối Ưu';
        }
      } else if (bestWinRateStat.winRate >= 51.5) {
        score += Math.round((bestWinRateStat.winRate - 50) * 2);
      }
    }

    // Boost if in personal pool (user is familiar with this champion)
    if (inPersonalPool) {
      score += 25;
      if (isLaneCounter || (bestWinRateStat && bestWinRateStat.winRate >= 52.0)) {
        tierLabel = 'S+ Tối Ưu';
      }
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
      winRateStat: bestWinRateStat,
      isMakeLate,
      // makeLateBadge removed
      makeLateReason: makeLateInfo?.reason,
    });
  });

  // Sort descending by score
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}
