import { calculateDraftCounterRecommendations } from '../src/utils/counterEngine.ts';
import { CHAMPIONS_LIST } from '../src/data/champions.ts';
import { getMetaLanes } from '../src/data/championRoles.ts';

console.log('--- TEST 1: Enemy picks Jayce at TOP ---');
const enemyJayce = [
  { lane: 'TOP', champion: CHAMPIONS_LIST.find((c) => c.id === 'Jayce') },
  { lane: 'JGL', champion: null },
  { lane: 'MID', champion: null },
  { lane: 'ADC', champion: null },
  { lane: 'SUP', champion: null },
];

const topRecs = calculateDraftCounterRecommendations('TOP', enemyJayce, [], CHAMPIONS_LIST);
console.log('Top counter recommendations count for Jayce:', topRecs.length);
console.log('Top 5 recommendations against Jayce:');
topRecs.slice(0, 5).forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.championName} (${r.tierLabel}, Điểm: ${r.counterScore})`);
  if (r.winRateStat) {
    console.log(`     Tỷ lệ thắng: ${r.winRateStat.winRate}% (${r.winRateStat.playCount} trận)`);
  }
  if (r.counteredEnemies.length > 0) {
    console.log(`     Lý do: ${r.counteredEnemies[0].reason.slice(0, 100)}...`);
  }
});

const malphiteRec = topRecs.find((r) => r.championId === 'Malphite');
console.log('Malphite recommended against Jayce:', Boolean(malphiteRec));
const poppyRec = topRecs.find((r) => r.championId === 'Poppy');
console.log('Poppy recommended against Jayce:', Boolean(poppyRec));
const ireliaRec = topRecs.find((r) => r.championId === 'Irelia');
console.log('Irelia recommended against Jayce:', Boolean(ireliaRec));

console.log('\n--- TEST 2: myLane is Jungle (JGL) ---');
const enemyMidZed = [
  { lane: 'TOP', champion: null },
  { lane: 'JGL', champion: CHAMPIONS_LIST.find((c) => c.id === 'LeeSin') },
  { lane: 'MID', champion: CHAMPIONS_LIST.find((c) => c.id === 'Zed') },
  { lane: 'ADC', champion: null },
  { lane: 'SUP', champion: null },
];

const jglRecs = calculateDraftCounterRecommendations('JGL', enemyMidZed, [], CHAMPIONS_LIST);
console.log('Jungle recommendations count:', jglRecs.length);

const forbiddenInJungle = ['Fiora', 'Darius', 'Renekton', 'Camille', 'Riven', 'Akali', 'Leblanc', 'Katarina'];
const foundForbidden = jglRecs.filter((r) => forbiddenInJungle.includes(r.championId));
console.log('Forbidden champions found in Jungle suggestions:', foundForbidden.map((r) => r.championName));

console.log('\nSample top Jungle suggestions:');
jglRecs.slice(0, 5).forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.championName} (${r.tierLabel})`);
});

if (topRecs.length > 0 && foundForbidden.length === 0 && malphiteRec) {
  console.log('\n>>> ALL VERIFICATION TESTS PASSED! <<<');
} else {
  console.error('\n>>> TEST FAILED! <<<');
  process.exit(1);
}
