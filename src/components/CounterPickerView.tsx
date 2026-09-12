import React, { useState, useMemo } from 'react';
import {
  Search,
  Swords,
  Shield,
  Compass,
  Flame,
  Crosshair,
  HeartHandshake,
  Sparkles,
  RotateCcw,
  X,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Loader2,
  Filter,
  UserPlus,
  Star,
  Key,
  TrendingUp,
  Crown,
  Zap,
} from 'lucide-react';
import {
  ChampionData,
  CounterRecommendation,
  CounterScope,
  EnemySlot,
  Lane,
  PersonalChampion,
} from '../types';
import {
  CHAMPIONS_LIST,
  LANES,
  getChampionAvatar,
} from '../data/champions';
import { calculateDraftCounterRecommendations } from '../utils/counterEngine';

interface CounterPickerViewProps {
  personalChampions: PersonalChampion[];
  userApiKey: string;
  onOpenApiKeyModal: () => void;
  allChampions?: ChampionData[];
  onAddFromCounter: (
    counterChampionId: string,
    counterChampionName: string,
    lanes: Lane[],
    enemyName: string,
    whyPick: string,
    tips: string
  ) => void;
  onSelectChampionForPool?: (champ: PersonalChampion) => void;
}

export const CounterPickerView: React.FC<CounterPickerViewProps> = ({
  personalChampions,
  userApiKey,
  onOpenApiKeyModal,
  allChampions = CHAMPIONS_LIST,
  onAddFromCounter,
}) => {
  // 1. Player's Lane Selection
  const [myLane, setMyLane] = useState<Lane>('MID');

  // 2. Enemy Team (up to 5 picks) - Clean & empty by default!
  const [enemySlots, setEnemySlots] = useState<EnemySlot[]>([
    { slotNumber: 1, champion: null, lane: 'TOP' },
    { slotNumber: 2, champion: null, lane: 'JGL' },
    { slotNumber: 3, champion: null, lane: 'MID' },
    { slotNumber: 4, champion: null, lane: 'ADC' },
    { slotNumber: 5, champion: null, lane: 'SUP' },
  ]);

  // Track expanded champion detail cards
  const [expandedChampIds, setExpandedChampIds] = useState<Set<string>>(new Set());

  const toggleExpand = (champId: string) => {
    setExpandedChampIds((prev) => {
      const next = new Set(prev);
      if (next.has(champId)) {
        next.delete(champId);
      } else {
        next.add(champId);
      }
      return next;
    });
  };

  // Active slot being edited (or null)
  const [activeSlotModal, setActiveSlotModal] = useState<number | null>(null);

  // Search champion to add to enemy team
  const [enemySearch, setEnemySearch] = useState('');
  const [isEnemySearchOpen, setIsEnemySearchOpen] = useState(false);

  // Scope filter: 'ALL' | 'BOTH' | 'LANE_ONLY' | 'TEAM_ONLY' | 'MY_POOL' | 'HIGH_WINRATE'
  const [scopeFilter, setScopeFilter] = useState<'ALL' | CounterScope | 'MY_POOL' | 'HIGH_WINRATE'>('ALL');

  // AI Analysis State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiTargetChamp, setAiTargetChamp] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Active enemies list
  const activeEnemies = useMemo(() => {
    return enemySlots.filter((slot) => slot.champion !== null);
  }, [enemySlots]);

  // Calculate counter recommendations in real time as enemies are entered
  const recommendations: CounterRecommendation[] = useMemo(() => {
    return calculateDraftCounterRecommendations(myLane, enemySlots, personalChampions, allChampions);
  }, [myLane, enemySlots, personalChampions, allChampions]);

  // Filter recommendations based on tab
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((rec) => {
      if (scopeFilter === 'ALL') return true;
      if (scopeFilter === 'MY_POOL') return rec.inPersonalPool;
      if (scopeFilter === 'HIGH_WINRATE') return Boolean(rec.winRateStat && rec.winRateStat.winRate >= 52.0);
      return rec.scope === scopeFilter;
    });
  }, [recommendations, scopeFilter]);

  const isAllExpanded = filteredRecommendations.length > 0 && expandedChampIds.size >= filteredRecommendations.length;
  const toggleAllExpand = () => {
    if (expandedChampIds.size > 0) {
      setExpandedChampIds(new Set());
    } else {
      setExpandedChampIds(new Set(filteredRecommendations.map((r) => r.championId)));
    }
  };

  // Quick champion suggestions for searching enemy
  const searchEnemyOptions = useMemo(() => {
    const pickedIds = new Set(activeEnemies.map((s) => s.champion?.id));
    const q = enemySearch.toLowerCase().trim();
    return allChampions.filter(
      (c) =>
        !pickedIds.has(c.id) &&
        (!q ||
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.title && c.title.toLowerCase().includes(q)))
    ).slice(0, 20);
  }, [enemySearch, activeEnemies, allChampions]);

  // Add champion to first available enemy slot or designated slot
  const handleAddEnemyChampion = (champ: ChampionData, targetSlotIndex?: number) => {
    setEnemySlots((prev) => {
      const next = [...prev];
      if (targetSlotIndex !== undefined && targetSlotIndex >= 0 && targetSlotIndex < 5) {
        next[targetSlotIndex] = {
          ...next[targetSlotIndex],
          champion: champ,
          lane: champ.defaultLanes[0],
        };
      } else {
        const emptyIdx = next.findIndex((slot) => slot.champion === null);
        if (emptyIdx !== -1) {
          next[emptyIdx] = {
            ...next[emptyIdx],
            champion: champ,
            lane: champ.defaultLanes[0],
          };
        }
      }
      return next;
    });
    setEnemySearch('');
    setIsEnemySearchOpen(false);
    setActiveSlotModal(null);
  };

  // Remove champion from an enemy slot
  const handleRemoveEnemySlot = (slotNumber: number) => {
    setEnemySlots((prev) =>
      prev.map((slot) =>
        slot.slotNumber === slotNumber ? { ...slot, champion: null, lane: undefined } : slot
      )
    );
  };

  // Change lane assignment for an enemy slot
  const handleChangeEnemySlotLane = (slotNumber: number, lane: Lane) => {
    setEnemySlots((prev) =>
      prev.map((slot) =>
        slot.slotNumber === slotNumber ? { ...slot, lane } : slot
      )
    );
  };

  // Reset all enemy slots
  const handleResetDraft = () => {
    setEnemySlots([
      { slotNumber: 1, champion: null },
      { slotNumber: 2, champion: null },
      { slotNumber: 3, champion: null },
      { slotNumber: 4, champion: null },
      { slotNumber: 5, champion: null },
    ]);
  };

  // Trigger Gemini AI Coach Analysis
  const handleRunAiAnalysis = async (candidateChampion?: string) => {
    if (activeEnemies.length === 0) return;

    setAiTargetChamp(candidateChampion || null);
    setIsAiModalOpen(true);

    if (!userApiKey || !userApiKey.trim()) {
      setAiAnalysis('NEED_API_KEY');
      return;
    }

    setIsAiLoading(true);
    setAiAnalysis(null);

    try {
      const payload = {
        myLane,
        enemyTeam: activeEnemies.map((slot) => ({
          name: slot.champion?.name,
          lane: slot.lane || slot.champion?.defaultLanes[0],
        })),
        playerChampion: candidateChampion,
      };

      const res = await fetch('/api/counter-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': userApiKey.trim(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.status === 401 || data.requireApiKey) {
        setAiAnalysis('INVALID_KEY');
      } else if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        setAiAnalysis(data.error || 'Không thể tạo phân tích lúc này. Vui lòng thử lại sau.');
      }
    } catch (err: any) {
      setAiAnalysis('Lỗi kết nối tới máy chủ phân tích AI. Vui lòng kiểm tra đường truyền.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const getLaneIcon = (lane: Lane) => {
    switch (lane) {
      case 'TOP':
        return <Shield className="h-4 w-4" />;
      case 'JGL':
        return <Compass className="h-4 w-4" />;
      case 'MID':
        return <Flame className="h-4 w-4" />;
      case 'ADC':
        return <Crosshair className="h-4 w-4" />;
      case 'SUP':
        return <HeartHandshake className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: DRAFT SETUP (Lane Selection & Turn-by-turn Enemy Team Input) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-5">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Swords className="h-6 w-6 text-amber-400" />
              Counter Picker
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDraft}
              title="Xóa đội hình để bắt đầu ván mới"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Xóa Đội Hình</span>
            </button>

            {activeEnemies.length > 0 && (
              <button
                onClick={() => handleRunAiAnalysis()}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Coach Phân Tích</span>
              </button>
            )}
          </div>
        </div>

        {/* Lane Selection of Player */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
              Vị Trí Của Bạn
            </label>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {LANES.map((l) => {
              const isActive = myLane === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setMyLane(l.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 rounded-xl p-2.5 sm:py-3 border transition-all ${
                    isActive
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/10 scale-[1.02]'
                      : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className={isActive ? 'text-amber-400' : 'text-slate-500'}>
                    {getLaneIcon(l.id)}
                  </div>
                  <span className="text-xs sm:text-sm font-bold">{l.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Turn-by-Turn Enemy Team Input (5 Slots) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
              Đội Hình Địch ({activeEnemies.length}/5)
            </label>
          </div>

          {/* 5 Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {enemySlots.map((slot, idx) => {
              const hasChamp = slot.champion !== null;
              const isDirectLaneOpponent = slot.lane === myLane;

              return (
                <div
                  key={slot.slotNumber}
                  className={`relative flex flex-col justify-between rounded-xl border p-2.5 transition-all ${
                    hasChamp
                      ? isDirectLaneOpponent
                        ? 'border-red-500/80 bg-red-950/20 shadow-md shadow-red-500/10'
                        : 'border-slate-700 bg-slate-800/80'
                      : 'border-dashed border-slate-700/80 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  {hasChamp && slot.champion ? (
                    <div className="space-y-2">
                      {/* Top slot header: Avatar + Name + Remove Button */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={slot.champion.avatarUrl || getChampionAvatar(slot.champion.id)}
                            alt={slot.champion.name}
                            className="h-10 w-10 rounded-lg border border-red-500/40 object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-white truncate">
                              {slot.champion.name}
                            </span>
                            {isDirectLaneOpponent && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                <Swords className="h-2.5 w-2.5" />
                                Lane
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveEnemySlot(slot.slotNumber)}
                          title="Gỡ tướng này"
                          className="rounded-md p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Lane selector for this enemy */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[11px]">
                        <span className="text-slate-400">Lane:</span>
                        <select
                          value={slot.lane || slot.champion.defaultLanes[0] || 'MID'}
                          onChange={(e) => handleChangeEnemySlotLane(slot.slotNumber, e.target.value as Lane)}
                          className="rounded-md border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-xs font-medium text-amber-300 focus:outline-none"
                        >
                          {LANES.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.shortName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    /* Empty slot: Click to add */
                    <button
                      onClick={() => setActiveSlotModal(idx)}
                      className="flex h-20 flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <Plus className="h-5 w-5 text-slate-400" />
                      <span className="text-xs font-medium">Slot {slot.slotNumber}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Champion Picker / Search Bar for Enemy Draft */}
          <div className="relative pt-1">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 focus-within:border-amber-500">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm tướng địch..."
                value={enemySearch}
                onChange={(e) => {
                  setEnemySearch(e.target.value);
                  setIsEnemySearchOpen(true);
                }}
                onFocus={() => setIsEnemySearchOpen(true)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {enemySearch && (
                <button
                  onClick={() => setEnemySearch('')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {isEnemySearchOpen && searchEnemyOptions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1">
                  {searchEnemyOptions.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleAddEnemyChampion(c, activeSlotModal ?? undefined)}
                      className="flex items-center gap-2 rounded-lg p-2 text-left hover:bg-slate-800 transition-colors"
                    >
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="h-7 w-7 rounded-md object-cover border border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{c.defaultLanes.join('/')}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: REAL-TIME COUNTER RECOMMENDATIONS */}
      <div className="space-y-4">
        {/* Section title & Filters bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Gợi Ý Nên Pick Cho {LANES.find((l) => l.id === myLane)?.name}
              </h2>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 font-mono">
                {filteredRecommendations.length} tướng
              </span>
              {filteredRecommendations.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAllExpand}
                  className="ml-auto sm:ml-2 text-xs font-semibold text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
                >
                  {isAllExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  <span>{isAllExpanded ? 'Thu gọn tất cả' : 'Mở rộng chi tiết'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Scope Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setScopeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                scopeFilter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Tất cả ({recommendations.length})
            </button>
            <button
              onClick={() => setScopeFilter('BOTH')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                scopeFilter === 'BOTH'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
              }`}
            >
              <Star className="h-3 w-3" />
              <span>{myLane === 'JGL' ? 'Đè Rừng & Team' : 'Đè Lane & Team'}</span>
              <span>({recommendations.filter((r) => r.scope === 'BOTH').length})</span>
            </button>
            <button
              onClick={() => setScopeFilter('LANE_ONLY')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                scopeFilter === 'LANE_ONLY'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'bg-slate-800 text-red-300 hover:bg-slate-700'
              }`}
            >
              <Swords className="h-3 w-3" />
              <span>{myLane === 'JGL' ? 'Kèo Rừng' : 'Cùng Lane'}</span>
              <span>({recommendations.filter((r) => r.scope === 'LANE_ONLY').length})</span>
            </button>
            <button
              onClick={() => setScopeFilter('TEAM_ONLY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                scopeFilter === 'TEAM_ONLY'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
              <span>Make Late</span>
              <span>({recommendations.filter((r) => r.scope === 'TEAM_ONLY').length})</span>
            </button>
            <button
              onClick={() => setScopeFilter('MY_POOL')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                scopeFilter === 'MY_POOL'
                  ? 'bg-purple-500 text-white shadow-xs'
                  : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
              }`}
            >
              <Star className="h-3 w-3 fill-current" />
              <span>Bể Tướng ({recommendations.filter((r) => r.inPersonalPool).length})</span>
            </button>
            <button
              onClick={() => setScopeFilter('HIGH_WINRATE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                scopeFilter === 'HIGH_WINRATE'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>WR &gt;52% ({recommendations.filter((r) => r.winRateStat && r.winRateStat.winRate >= 52.0).length})</span>
            </button>
          </div>
        </div>

        {/* Empty State when no enemies picked yet */}
        {activeEnemies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2.5">
              <Swords className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Chưa có tướng địch</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Chọn ô hoặc tìm tướng để bắt đầu
            </p>
            {/* Quick picks */}
            <div className="mt-3.5 flex flex-wrap justify-center gap-2">
              <span className="text-xs text-slate-500 self-center">Pick nhanh:</span>
              {['Zed', 'Yasuo', 'Darius', 'Aatrox', 'LeeSin', 'Blitzcrank'].map((id) => {
                const champ = CHAMPIONS_LIST.find((c) => c.id === id);
                if (!champ) return null;
                return (
                  <button
                    key={id}
                    onClick={() => handleAddEnemyChampion(champ)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-amber-500 hover:text-white transition-colors"
                  >
                    <img
                      src={champ.avatarUrl}
                      alt={champ.name}
                      className="h-4 w-4 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span>{champ.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : filteredRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5">
            {filteredRecommendations.map((rec) => {
              const isTopPick = rec.scope === 'BOTH';
              const isExpanded = expandedChampIds.has(rec.championId);
              const laneEnemy = rec.counteredEnemies.find((e) => e.isSameLane);
              const otherEnemies = rec.counteredEnemies.filter(
                (e) => !e.isSameLane && e.championName !== 'Cả Đội Hình Địch'
              );
              const realEnemies = rec.counteredEnemies.filter((e) => e.championName !== 'Cả Đội Hình Địch');

              return (
                <div
                  key={rec.championId}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isTopPick
                      ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 shadow-md shadow-amber-500/5'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 shadow-xs'
                  }`}
                >
                  {/* CLEAN COMPACT ROW */}
                  <div className="p-3 sm:p-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left Block: Avatar + Info */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <img
                            src={rec.avatarUrl}
                            alt={rec.championName}
                            className={`h-12 w-12 rounded-2xl border-2 object-cover ${
                              isTopPick
                                ? 'border-amber-400 shadow-sm shadow-amber-500/20'
                                : rec.tierLabel === 'S Xuất Sắc'
                                ? 'border-red-500/70'
                                : 'border-slate-700'
                            }`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          {rec.inPersonalPool && (
                            <span
                              className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-white shadow-xs"
                              title="Tướng trong bể của bạn"
                            >
                              <Star className="h-2.5 w-2.5 fill-current" />
                            </span>
                          )}
                        </div>

                        {/* Text / Chips Info */}
                        <div className="min-w-0 flex-1 space-y-1">
                          {/* Line 1: Name + Tier + Scope Badge + Win Rate */}
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-black text-white tracking-tight">{rec.championName}</h3>

                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                rec.tierLabel === 'S+ Tối Ưu'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : rec.tierLabel === 'S Xuất Sắc'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {rec.tierLabel}
                            </span>

                            {/* Scope Badge */}
                            {rec.scope === 'BOTH' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/35 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                                <Star className="h-3 w-3 text-amber-400" />
                                <span>{myLane === 'JGL' ? 'Đè Rừng & Team' : 'Đè Lane & Team'}</span>
                                {otherEnemies.length > 0 && (
                                  <span className="bg-amber-400/25 px-1.5 py-0.2 rounded-full text-[10px]">
                                    +{otherEnemies.length}
                                  </span>
                                )}
                              </span>
                            )}
                            {rec.scope === 'LANE_ONLY' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/35 px-2 py-0.5 text-[11px] font-bold text-red-300">
                                <Swords className="h-3 w-3 text-red-400" />
                                <span>{myLane === 'JGL' ? 'Kèo Rừng' : 'Cùng Lane'}</span>
                              </span>
                            )}
                            {rec.scope === 'TEAM_ONLY' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                                <Crown className="h-3 w-3 text-emerald-400" />
                                <span>{rec.isMakeLate ? 'Make Late' : 'Đội Hình'}</span>
                              </span>
                            )}
                            {rec.isMakeLate && rec.scope !== 'TEAM_ONLY' && (
                              <span
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300"
                                title="Chất tướng thăng tiến sức mạnh late game"
                              >
                                <Crown className="h-2.5 w-2.5 text-emerald-400" />
                                <span>Make Late</span>
                              </span>
                            )}

                            {/* Win Rate Stat Badge */}
                            {rec.winRateStat && (
                              <span
                                className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/35 px-2 py-0.5 text-[11px] font-mono font-bold text-cyan-300"
                                title={`Tỷ lệ thắng ${rec.winRateStat.winRate}% trước ${rec.winRateStat.enemyChampionName} (${rec.winRateStat.playCount.toLocaleString('vi-VN')} trận)`}
                              >
                                <TrendingUp className="h-3 w-3 text-cyan-400" />
                                <span>{rec.winRateStat.winRate}% WR</span>
                              </span>
                            )}
                          </div>

                          {/* Line 2: Tactical Preview with Mini-Avatars */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            {rec.scope === 'BOTH' ? (
                              <>
                                {laneEnemy && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-red-950/40 border border-red-500/30 px-1.5 py-0.5 text-[11px] font-bold text-red-200">
                                    <img
                                      src={getChampionAvatar(laneEnemy.championId)}
                                      alt={laneEnemy.championName}
                                      className="h-3.5 w-3.5 rounded-full object-cover shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                    <span>{laneEnemy.championName}</span>
                                  </span>
                                )}
                                {otherEnemies.length > 0 && (
                                  <>
                                    <span className="text-slate-600 mx-0.5">•</span>
                                    <div className="flex flex-wrap items-center gap-1">
                                      {otherEnemies.map((e) => (
                                        <span
                                          key={e.championId}
                                          className="inline-flex items-center gap-1 rounded-md bg-slate-800/90 border border-slate-700/80 px-1.5 py-0.5 text-[11px] font-medium text-slate-200"
                                        >
                                          <img
                                            src={getChampionAvatar(e.championId)}
                                            alt={e.championName}
                                            className="h-3.5 w-3.5 rounded-full object-cover shrink-0"
                                            referrerPolicy="no-referrer"
                                          />
                                          <span>{e.championName}</span>
                                        </span>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </>
                            ) : rec.scope === 'LANE_ONLY' ? (
                              <div className="flex flex-wrap items-center gap-1">
                                {rec.counteredEnemies.map((e) => (
                                  <span
                                    key={e.championId}
                                    className="inline-flex items-center gap-1 rounded-md bg-red-950/40 border border-red-500/30 px-1.5 py-0.5 text-[11px] font-bold text-red-200"
                                  >
                                    <img
                                      src={getChampionAvatar(e.championId)}
                                      alt={e.championName}
                                      className="h-3.5 w-3.5 rounded-full object-cover shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                    <span>{e.championName}</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <>
                                {rec.isMakeLate && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 text-[11px] font-medium text-emerald-300">
                                    <Crown className="h-3 w-3 text-emerald-400" />
                                    <span>{rec.makeLateBadge || 'Make Late'}</span>
                                  </span>
                                )}
                                {realEnemies.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1">
                                    {realEnemies.map((e) => (
                                      <span
                                        key={e.championId}
                                        className="inline-flex items-center gap-1 rounded-md bg-slate-800/90 border border-slate-700/80 px-1.5 py-0.5 text-[11px] font-medium text-slate-200"
                                      >
                                        <img
                                          src={getChampionAvatar(e.championId)}
                                          alt={e.championName}
                                          className="h-3.5 w-3.5 rounded-full object-cover shrink-0"
                                          referrerPolicy="no-referrer"
                                        />
                                        <span>{e.championName}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleRunAiAnalysis(rec.championName)}
                          title="Hỏi AI phân tích kèo pick này"
                          className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Hỏi AI</span>
                        </button>

                        <button
                          onClick={() => {
                            const enemyNames = rec.counteredEnemies.map((e) => e.championName).join(', ');
                            const why = rec.counteredEnemies.map((e) => `${e.championName}: ${e.reason}`).join('\n');
                            onAddFromCounter(
                              rec.championId,
                              rec.championName,
                              rec.lanes,
                              enemyNames,
                              why,
                              rec.keyTip
                            );
                          }}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                            rec.inPersonalPool
                              ? 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400'
                          }`}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>{rec.inPersonalPool ? 'Đã Có' : 'Lưu Bể'}</span>
                        </button>

                        <button
                          onClick={() => toggleExpand(rec.championId)}
                          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          title={isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết ưu/nhược điểm & mẹo'}
                        >
                          <span>{isExpanded ? 'Thu Gọn' : 'Chi Tiết'}</span>
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDABLE SECTION: BALANCED 2-COLUMN GRID */}
                  {isExpanded && (
                    <div className="border-t border-slate-800 bg-slate-950/70 p-4 space-y-3">
                      {/* Make Late Tactical Banner */}
                      {rec.isMakeLate && rec.makeLateReason && (
                        <div className="rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-2.5 text-xs text-slate-200 flex items-start gap-2.5 shadow-xs">
                          <div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-400 shrink-0 mt-0.5">
                            <Crown className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-bold text-emerald-300 block">
                              {rec.makeLateBadge || 'Make Late'}
                            </span>
                            <p className="text-slate-300 text-xs leading-relaxed">{rec.makeLateReason}</p>
                          </div>
                        </div>
                      )}

                      {/* 2-Column Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {/* Column 1: Counter Matchups */}
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Swords className="h-3.5 w-3.5 text-amber-400" />
                            <span>Đối đầu:</span>
                          </div>
                          <div className="space-y-1.5">
                            {rec.counteredEnemies.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5 rounded-lg bg-slate-900/90 border border-slate-800/90 p-2.5 text-xs"
                              >
                                <img
                                  src={getChampionAvatar(item.championId)}
                                  alt={item.championName}
                                  className="h-6 w-6 rounded-md object-cover border border-slate-700 shrink-0 mt-0.5"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-white">{item.championName}</span>
                                    {item.isSameLane ? (
                                      <span className="rounded bg-red-500/20 text-red-300 text-[9px] font-bold px-1.5 py-0.5">
                                        {myLane === 'JGL' ? 'KÈO RỪNG' : 'CÙNG LANE'}
                                      </span>
                                    ) : item.championName === 'Cả Đội Hình Địch' ? (
                                      <span className="rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5">
                                        MAKE LATE
                                      </span>
                                    ) : (
                                      <span className="rounded bg-slate-800 text-slate-400 text-[9px] font-medium px-1.5 py-0.5">
                                        ĐỘI HÌNH
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">{item.reason}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Column 2: Pros & Cons + Key Tip */}
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Pros */}
                            <div className="rounded-lg border border-emerald-500/25 bg-emerald-950/15 p-2.5 space-y-1.5">
                              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Ưu điểm</span>
                              </div>
                              <ul className="space-y-1 text-xs text-slate-200">
                                {rec.pros.map((pro, pIdx) => (
                                  <li key={pIdx} className="flex items-start gap-1.5">
                                    <span className="text-emerald-400 font-bold">•</span>
                                    <span className="leading-snug">{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Cons */}
                            <div className="rounded-lg border border-red-500/25 bg-red-950/15 p-2.5 space-y-1.5">
                              <div className="flex items-center gap-1 text-[11px] font-bold text-red-400 uppercase">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>Rủi ro</span>
                              </div>
                              <ul className="space-y-1 text-xs text-slate-200">
                                {rec.cons.map((con, cIdx) => (
                                  <li key={cIdx} className="flex items-start gap-1.5">
                                    <span className="text-red-400 font-bold">•</span>
                                    <span className="leading-snug">{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Key Tip */}
                          <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-2.5 text-xs text-slate-200 flex items-start gap-2">
                            <span className="font-bold text-amber-300 shrink-0 flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5 text-amber-400" />
                              <span>Mẹo:</span>
                            </span>
                            <span className="leading-relaxed text-slate-300">{rec.keyTip}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
            Không tìm thấy tướng nào trong bộ lọc này. Hãy chuyển sang tab "Tất cả" để xem các lựa chọn khả thi khác.
          </div>
        )}
      </div>

      {/* AI COACH DEEP ANALYSIS MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {aiTargetChamp
                    ? `AI Coach: Phân Tích ${aiTargetChamp}`
                    : 'AI Coach: Đánh Giá Đội Hình'}
                </h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                  <p className="text-sm text-slate-300 font-medium">
                    Đang phân tích...
                  </p>
                </div>
              ) : aiAnalysis === 'NEED_API_KEY' ? (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Key className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Cần API Key</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Nhập API Key để sử dụng AI Coach.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsAiModalOpen(false);
                        onOpenApiKeyModal();
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                    >
                      <Key className="h-4 w-4" />
                      <span>Nhập API Key</span>
                    </button>
                  </div>
                </div>
              ) : aiAnalysis === 'INVALID_KEY' ? (
                <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">API Key Không Hợp Lệ</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    API Key không hợp lệ. Kiểm tra hoặc tạo key mới.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsAiModalOpen(false);
                        onOpenApiKeyModal();
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                    >
                      <Key className="h-4 w-4" />
                      <span>Đổi API Key</span>
                    </button>
                  </div>
                </div>
              ) : aiAnalysis ? (
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-2 font-sans bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                  {aiAnalysis}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Chưa có dữ liệu phân tích.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3 bg-slate-900/90 shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                Model: gemini-3.7-flash • Key: {userApiKey ? 'Cá nhân' : 'Chưa có'}
              </span>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
