import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Plus, Shield, Compass, Flame, Crosshair, HeartHandshake } from 'lucide-react';
import { Lane, PersonalChampion, LaneCategory, ChampionData } from '../types';
import { LANES, CHAMPIONS_LIST, getChampionAvatar } from '../data/champions';

interface ChampionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    championData: {
      championId: string;
      championName: string;
      lane: Lane;
      lanes: Lane[];
      categoryId: string;
      categoryName: string;
      counterTargets: string[];
      notes?: string;
    },
    editId?: string
  ) => void;
  editingChampion: PersonalChampion | null;
  currentLane?: Lane;
  currentCategoryId?: string;
  categories: LaneCategory[];
  allChampions?: ChampionData[];
  onAddCategory?: (lane: Lane, name: string) => LaneCategory;
  prefilledData?: {
    championId: string;
    championName: string;
    lane?: Lane;
    lanes?: Lane[];
    categoryId?: string;
    categoryName?: string;
    counterTargets: string[];
    notes?: string;
  } | null;
}

export const ChampionModal: React.FC<ChampionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingChampion,
  currentLane = 'MID',
  currentCategoryId,
  categories,
  allChampions = CHAMPIONS_LIST,
  onAddCategory,
  prefilledData,
}) => {
  const [selectedLane, setSelectedLane] = useState<Lane>(currentLane);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [championName, setChampionName] = useState('');
  const [championId, setChampionId] = useState('');
  const [allPlayableLanes, setAllPlayableLanes] = useState<Lane[]>([currentLane]);
  const [counterTargets, setCounterTargets] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Champion search & selection
  const [champSearch, setChampSearch] = useState('');
  const [isChampDropdownOpen, setIsChampDropdownOpen] = useState(false);

  // Counter target search
  const [targetSearch, setTargetSearch] = useState('');
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);

  // New category creation inline
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Filter categories available for the selected lane
  const laneCategories = useMemo(() => {
    return categories.filter((c) => c.lane === selectedLane);
  }, [categories, selectedLane]);

  // Sync state when modal opens or champion changes
  useEffect(() => {
    if (editingChampion) {
      const champLane = editingChampion.lane || (editingChampion.lanes && editingChampion.lanes[0]) || 'MID';
      setSelectedLane(champLane);
      setSelectedCategoryId(editingChampion.categoryId || '');
      setChampionName(editingChampion.championName);
      setChampionId(editingChampion.championId);
      setAllPlayableLanes(editingChampion.lanes?.length ? editingChampion.lanes : [champLane]);
      setCounterTargets(editingChampion.counterTargets || []);
      setNotes(editingChampion.notes || '');
      setChampSearch(editingChampion.championName);
    } else if (prefilledData) {
      const prefLane = prefilledData.lane || currentLane;
      setSelectedLane(prefLane);
      setSelectedCategoryId(prefilledData.categoryId || currentCategoryId || '');
      setChampionName(prefilledData.championName);
      setChampionId(prefilledData.championId);
      setAllPlayableLanes(prefilledData.lanes?.length ? prefilledData.lanes : [prefLane]);
      setCounterTargets(prefilledData.counterTargets || []);
      setNotes(prefilledData.notes || '');
      setChampSearch(prefilledData.championName);
    } else {
      setSelectedLane(currentLane);
      setSelectedCategoryId(currentCategoryId || '');
      setChampionName('');
      setChampionId('');
      setAllPlayableLanes([currentLane]);
      setCounterTargets([]);
      setNotes('');
      setChampSearch('');
    }
    setIsCreatingCategory(false);
    setNewCategoryName('');
  }, [editingChampion, prefilledData, currentLane, currentCategoryId, isOpen]);

  // Ensure a category is selected if available
  useEffect(() => {
    if (laneCategories.length > 0 && (!selectedCategoryId || !laneCategories.some((c) => c.id === selectedCategoryId))) {
      setSelectedCategoryId(laneCategories[0].id);
    }
  }, [laneCategories, selectedCategoryId]);

  // Autocomplete suggestions for your champion
  const filteredChampions = useMemo(() => {
    if (!champSearch.trim()) return allChampions.slice(0, 16);
    const q = champSearch.toLowerCase().trim();
    return allChampions
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.title && c.title.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [champSearch, allChampions]);

  // Autocomplete suggestions for enemy counter target
  const filteredTargetOptions = useMemo(() => {
    if (!targetSearch.trim()) return allChampions.slice(0, 12);
    const q = targetSearch.toLowerCase().trim();
    return allChampions
      .filter(
        (c) =>
          (c.name.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            (c.title && c.title.toLowerCase().includes(q))) &&
          !counterTargets.includes(c.name)
      )
      .slice(0, 15);
  }, [targetSearch, counterTargets, allChampions]);

  if (!isOpen) return null;

  const handleSelectChampion = (champ: ChampionData) => {
    setChampionName(champ.name);
    setChampionId(champ.id);
    setChampSearch(champ.name);
    // Include the current lane and any natural lanes
    const mergedLanes = Array.from(new Set([selectedLane, ...(champ.defaultLanes || [])]));
    setAllPlayableLanes(mergedLanes);
    setIsChampDropdownOpen(false);
  };

  const handleAddCounterTarget = (targetName: string) => {
    const trimmed = targetName.trim();
    if (!trimmed) return;
    if (!counterTargets.includes(trimmed)) {
      setCounterTargets((prev) => [...prev, trimmed]);
    }
    setTargetSearch('');
    setIsTargetDropdownOpen(false);
  };

  const handleRemoveCounterTarget = (targetName: string) => {
    setCounterTargets((prev) => prev.filter((t) => t !== targetName));
  };

  const handleCreateNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || !onAddCategory) return;
    const created = onAddCategory(selectedLane, trimmed);
    setSelectedCategoryId(created.id);
    setIsCreatingCategory(false);
    setNewCategoryName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!championName.trim()) return;

    const matchedCat = laneCategories.find((c) => c.id === selectedCategoryId);
    const categoryName = matchedCat ? matchedCat.name : 'Tướng Counter';

    onSave(
      {
        championId: championId || championName.trim(),
        championName: championName.trim(),
        lane: selectedLane,
        lanes: allPlayableLanes.length > 0 ? allPlayableLanes : [selectedLane],
        categoryId: selectedCategoryId || (matchedCat ? matchedCat.id : `cat-${selectedLane.toLowerCase()}-counter`),
        categoryName,
        counterTargets,
        notes: notes.trim(),
      },
      editingChampion ? editingChampion.id : undefined
    );
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingChampion ? 'Chỉnh Sửa Tướng Trong Bể' : 'Thêm Tướng Vào Bể Cá Nhân'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân loại theo Lane và Mục riêng để tra cứu nhanh khi cấm chọn.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* 1. Chọn Lane & Chọn Mục */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lane */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Vị Trí (Lane) <span className="text-amber-400">*</span>
              </label>
              <div className="grid grid-cols-5 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
                {LANES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setSelectedLane(l.id);
                      if (!allPlayableLanes.includes(l.id)) {
                        setAllPlayableLanes((prev) => [...prev, l.id]);
                      }
                    }}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedLane === l.id
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {getLaneIcon(l.id)}
                    <span className="text-[10px] mt-0.5">{l.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category / Mục */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Mục Phân Loại <span className="text-amber-400">*</span>
                </label>
                {!isCreatingCategory && onAddCategory && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" /> Mục mới
                  </button>
                )}
              </div>

              {isCreatingCategory ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Tên mục (vd: Tướng dị)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full rounded-xl border border-amber-500/50 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewCategory}
                    className="rounded-xl bg-amber-500 px-2.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(false)}
                    className="rounded-xl bg-slate-800 px-2 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2.5 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
                >
                  {laneCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      📁 {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 2. Champion Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Tên Tướng Bạn Chơi <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
                {championId ? (
                  <img
                    src={getChampionAvatar(championId)}
                    alt={championName}
                    className="h-7 w-7 rounded-lg object-cover mr-2.5 border border-slate-600"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Search className="h-5 w-5 text-slate-400 mr-2.5" />
                )}
                <input
                  type="text"
                  required
                  placeholder="Gõ tìm tên tướng (vd: Malphite, Lissandra...)"
                  value={champSearch}
                  onChange={(e) => {
                    setChampSearch(e.target.value);
                    setChampionName(e.target.value);
                    setIsChampDropdownOpen(true);
                  }}
                  onFocus={() => setIsChampDropdownOpen(true)}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>

              {/* Suggestions Dropdown */}
              {isChampDropdownOpen && (
                <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
                  {filteredChampions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectChampion(c)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-700/70 transition-colors border-b border-slate-700/40 last:border-0"
                    >
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="h-7 w-7 rounded-md object-cover border border-slate-600"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div>
                        <span className="text-sm font-semibold text-white">{c.name}</span>
                        <span className="ml-2 text-xs text-slate-400">({c.title})</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Counter Targets (Tướng đối thủ mà con này khắc chế) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Tướng Đối Thủ Mà Bạn Dùng Con Này Khắc Chế
              </label>
              <span className="text-[11px] text-slate-400">Tùy chọn</span>
            </div>
            <div className="relative">
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs">
                <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Gõ tên tướng đối thủ để thêm vào danh sách khắc chế..."
                  value={targetSearch}
                  onChange={(e) => {
                    setTargetSearch(e.target.value);
                    setIsTargetDropdownOpen(true);
                  }}
                  onFocus={() => setIsTargetDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCounterTarget(targetSearch);
                    }
                  }}
                  className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              {isTargetDropdownOpen && targetSearch.trim() && (
                <div className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
                  {filteredTargetOptions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleAddCounterTarget(c.name)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-700 text-xs text-slate-200"
                    >
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="h-5 w-5 rounded object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Added Target Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {counterTargets.map((target) => (
                <span
                  key={target}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/40 px-2.5 py-1 text-xs font-medium text-red-300"
                >
                  <img
                    src={getChampionAvatar(target)}
                    alt={target}
                    className="h-3.5 w-3.5 rounded object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span>Khắc chế: {target}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCounterTarget(target)}
                    className="text-red-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {counterTargets.length === 0 && (
                <span className="text-[11px] text-slate-500 italic">
                  Chưa gán tướng khắc chế cụ thể (con này có thể là tướng pick an toàn hoặc pick dị).
                </span>
              )}
            </div>
          </div>

          {/* 4. Notes / Mẹo chơi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Ghi Chú / Mẹo Chơi Cốt Lõi
            </label>
            <textarea
              rows={2}
              placeholder="Vd: Max E trước giảm tốc đánh Jax, lên Giáp Gai sớm, combat R thẳng vào chủ lực..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!championName.trim()}
              className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50 shadow-md shadow-amber-500/20"
            >
              {editingChampion ? 'Lưu Thay Đổi' : 'Thêm Vào Bể Tướng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
