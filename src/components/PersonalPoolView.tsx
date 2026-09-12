import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  Compass,
  Flame,
  Crosshair,
  HeartHandshake,
  ArrowRightLeft,
  Check,
  X,
  Sparkles,
  FolderPlus,
  Layers,
} from 'lucide-react';
import { PersonalChampion, Lane, LaneCategory } from '../types';
import { LANES, getChampionAvatar } from '../data/champions';

interface PersonalPoolViewProps {
  personalChampions: PersonalChampion[];
  categories: LaneCategory[];
  onAddNewToCategory: (lane: Lane, categoryId: string) => void;
  onAddNewGeneral: (lane: Lane) => void;
  onEdit: (champ: PersonalChampion) => void;
  onDelete: (id: string) => void;
  onMoveCategory: (champId: string, targetCategoryId: string, targetCategoryName: string) => void;
  onAddCategory: (lane: Lane, name: string) => void;
  onRenameCategory: (categoryId: string, newName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onInspectCounter: (championName: string) => void;
}

export const PersonalPoolView: React.FC<PersonalPoolViewProps> = ({
  personalChampions,
  categories,
  onAddNewToCategory,
  onAddNewGeneral,
  onEdit,
  onDelete,
  onMoveCategory,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onInspectCounter,
}) => {
  // 1. Current Active Lane (TOP, JGL, MID, ADC, SUP)
  const [selectedLane, setSelectedLane] = useState<Lane>('MID');

  // 2. Search query within this lane
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 3. Category Creation State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // 4. Inline Category Rename State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // 5. Move Champion Category State
  const [movingChampId, setMovingChampId] = useState<string | null>(null);

  // Get categories belonging to current selected lane
  const currentLaneCategories = useMemo(() => {
    return categories.filter((cat) => cat.lane === selectedLane);
  }, [categories, selectedLane]);

  // Filter champions belonging to current selected lane
  const championsInCurrentLane = useMemo(() => {
    return personalChampions.filter((item) => {
      // Check if champion is assigned to this lane directly or in lanes list
      const matchesLane =
        item.lane === selectedLane ||
        (Array.isArray(item.lanes) && item.lanes.includes(selectedLane));

      if (!matchesLane) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const matchName =
        item.championName.toLowerCase().includes(q) ||
        item.championId.toLowerCase().includes(q);

      const matchTargets = Array.isArray(item.counterTargets)
        ? item.counterTargets.some((target) => target.toLowerCase().includes(q))
        : false;

      const matchNotes = item.notes ? item.notes.toLowerCase().includes(q) : false;
      const matchCat = item.categoryName ? item.categoryName.toLowerCase().includes(q) : false;

      return matchName || matchTargets || matchNotes || matchCat;
    });
  }, [personalChampions, selectedLane, searchQuery]);

  // Count champions per lane for badges
  const laneCounts = useMemo(() => {
    const counts: Record<Lane, number> = { TOP: 0, JGL: 0, MID: 0, ADC: 0, SUP: 0 };
    personalChampions.forEach((champ) => {
      if (champ.lane && counts[champ.lane] !== undefined) {
        counts[champ.lane]++;
      } else if (Array.isArray(champ.lanes)) {
        champ.lanes.forEach((l) => {
          if (counts[l] !== undefined) counts[l]++;
        });
      }
    });
    return counts;
  }, [personalChampions]);

  // Helper: Get icon for lane
  const getLaneIcon = (lane: Lane, className = 'h-4 w-4') => {
    switch (lane) {
      case 'TOP':
        return <Shield className={className} />;
      case 'JGL':
        return <Compass className={className} />;
      case 'MID':
        return <Flame className={className} />;
      case 'ADC':
        return <Crosshair className={className} />;
      case 'SUP':
        return <HeartHandshake className={className} />;
    }
  };

  // Handle adding new custom category
  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    onAddCategory(selectedLane, trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  // Handle saving renamed category
  const handleSaveRename = (catId: string) => {
    const trimmed = editingCategoryName.trim();
    if (trimmed) {
      onRenameCategory(catId, trimmed);
    }
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const activeLaneMeta = LANES.find((l) => l.id === selectedLane) || LANES[0];

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Lane Navigation */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Bể Tướng Cá Nhân
              </h1>
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 text-xs font-bold text-amber-400 font-mono">
                {personalChampions.length} tướng đã lưu
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                🔒 Lưu 100% trên máy của bạn
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Phân loại theo từng Lane. Tự do tạo các mục riêng (tướng dị, tướng counter, tướng hỗ trợ team...). Dữ liệu lưu cục bộ trong trình duyệt của riêng bạn.
            </p>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => onAddNewGeneral(selectedLane)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Tướng Mới</span>
          </button>
        </div>

        {/* 2. Lane Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {LANES.map((lane) => {
            const isActive = selectedLane === lane.id;
            const count = laneCounts[lane.id] || 0;
            return (
              <button
                key={lane.id}
                onClick={() => {
                  setSelectedLane(lane.id);
                  setSearchQuery('');
                  setIsAddingCategory(false);
                }}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {getLaneIcon(lane.id, 'h-4 w-4')}
                <span>{lane.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-mono ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sub-bar: Search & Create Category */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Tìm tướng trong ${activeLaneMeta.name} (theo tên tướng, tướng khắc chế, hoặc mẹo)...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action: Add Custom Category */}
        <div className="flex items-center gap-2">
          {!isAddingCategory ? (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors shrink-0"
            >
              <FolderPlus className="h-4 w-4" />
              <span>+ Tạo mục mới cho {activeLaneMeta.shortName}</span>
            </button>
          ) : (
            <form onSubmit={handleCreateCategorySubmit} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="Nhập tên mục (vd: Tướng dị, Tướng dồn dame...)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="rounded-xl border border-amber-500 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 w-56"
              />
              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                Tạo
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                className="rounded-xl bg-slate-800 px-2 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Hủy
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 4. Display Categories for Selected Lane */}
      <div className="space-y-6">
        {currentLaneCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
            <Layers className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-300">Chưa có mục nào cho {activeLaneMeta.name}</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Hãy bấm vào "Tạo mục mới" để thêm các nhóm như Tướng counter, Tướng dị, Tướng hỗ trợ team tốt...
            </p>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" /> Tạo Mục Đầu Tiên
            </button>
          </div>
        ) : (
          currentLaneCategories.map((category) => {
            // Get champions in this category
            const categoryChampions = championsInCurrentLane.filter(
              (c) =>
                c.categoryId === category.id ||
                (c.categoryName && c.categoryName.toLowerCase() === category.name.toLowerCase())
            );

            const isEditingThisCat = editingCategoryId === category.id;

            return (
              <section
                key={category.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 shadow-xs transition-all hover:border-slate-700/80"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>

                    {/* Category Name or Inline Edit */}
                    {isEditingThisCat ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="rounded-lg border border-amber-500 bg-slate-950 px-2.5 py-1 text-sm font-bold text-white focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(category.id);
                            if (e.key === 'Escape') setEditingCategoryId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(category.id)}
                          className="rounded-lg bg-amber-500 p-1 text-slate-950 hover:bg-amber-400"
                          title="Lưu tên"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          className="rounded-lg bg-slate-800 p-1 text-slate-400 hover:text-white"
                          title="Hủy"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white tracking-tight">
                          {category.name}
                        </h2>
                        <button
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setEditingCategoryName(category.name);
                          }}
                          className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
                          title="Đổi tên mục"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-400">
                      {categoryChampions.length} tướng
                    </span>
                  </div>

                  {/* Actions for this category */}
                  <div className="flex items-center gap-2">
                    {/* Add champion directly to this category */}
                    <button
                      onClick={() => onAddNewToCategory(selectedLane, category.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-slate-700 hover:text-amber-300 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Thêm tướng vào mục</span>
                    </button>

                    {/* Delete Category Button */}
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Bạn có chắc muốn xóa mục "${category.name}" của lane ${activeLaneMeta.shortName}?`
                          )
                        ) {
                          onDeleteCategory(category.id);
                        }
                      }}
                      className="rounded-xl p-1.5 text-slate-500 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                      title="Xóa mục này"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Category Champions Grid */}
                {categoryChampions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-800/80 bg-slate-950/30 p-6 text-center">
                    <p className="text-xs text-slate-400">
                      Chưa có tướng nào trong mục <strong className="text-slate-300">{category.name}</strong>.
                    </p>
                    <button
                      onClick={() => onAddNewToCategory(selectedLane, category.id)}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      <Plus className="h-3.5 w-3.5" /> Thêm tướng ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {categoryChampions.map((champ) => {
                      const isMovingThis = movingChampId === champ.id;

                      return (
                        <div
                          key={champ.id}
                          className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 transition-all hover:border-slate-700 hover:bg-slate-900/80 shadow-xs"
                        >
                          {/* Top: Avatar, Name & Action buttons */}
                          <div>
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={getChampionAvatar(champ.championId)}
                                  alt={champ.championName}
                                  className="h-11 w-11 rounded-xl object-cover border border-amber-500/40 shadow-xs"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <div>
                                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                                    {champ.championName}
                                  </h3>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {activeLaneMeta.shortName}
                                    </span>
                                    {champ.lanes && champ.lanes.length > 1 && (
                                      <span className="text-[9px] text-slate-500">
                                        (+{champ.lanes.filter((l) => l !== selectedLane).join('/')})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-1 shrink-0">
                                {/* Move category */}
                                <button
                                  onClick={() =>
                                    setMovingChampId(isMovingThis ? null : champ.id)
                                  }
                                  title="Chuyển sang mục khác"
                                  className={`rounded-lg p-1.5 transition-colors ${
                                    isMovingThis
                                      ? 'bg-amber-500 text-slate-950'
                                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                  }`}
                                >
                                  <ArrowRightLeft className="h-3.5 w-3.5" />
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => onEdit(champ)}
                                  title="Chỉnh sửa tướng"
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Bạn có chắc muốn xóa ${champ.championName} khỏi mục này?`
                                      )
                                    ) {
                                      onDelete(champ.id);
                                    }
                                  }}
                                  title="Xóa khỏi mục"
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Inline Move Category Dropdown */}
                            {isMovingThis && (
                              <div className="mt-2.5 rounded-lg border border-amber-500/40 bg-slate-900 p-2 text-xs">
                                <span className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                                  Chuyển sang mục:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {currentLaneCategories
                                    .filter((c) => c.id !== category.id)
                                    .map((targetCat) => (
                                      <button
                                        key={targetCat.id}
                                        onClick={() => {
                                          onMoveCategory(champ.id, targetCat.id, targetCat.name);
                                          setMovingChampId(null);
                                        }}
                                        className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-amber-500 hover:text-slate-950 transition-colors font-medium"
                                      >
                                        📁 {targetCat.name}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Counter Targets */}
                            <div className="mt-3">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                Khắc chế đối thủ:
                              </span>
                              {champ.counterTargets && champ.counterTargets.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {champ.counterTargets.map((target, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="inline-flex items-center gap-1 rounded-md border border-red-500/25 bg-red-950/30 px-1.5 py-0.5 text-[11px] font-medium text-red-300"
                                    >
                                      <img
                                        src={getChampionAvatar(target)}
                                        alt={target}
                                        className="h-3 w-3 rounded object-cover"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                      <span>{target}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-500 italic">
                                  Tướng đa dụng / pick an toàn
                                </span>
                              )}
                            </div>

                            {/* Notes / Tips */}
                            {champ.notes && (
                              <div className="mt-2.5 rounded-lg bg-slate-900/60 p-2 text-[11px] text-slate-300 border border-slate-800/60 leading-relaxed">
                                <span className="font-semibold text-amber-400 mr-1">Mẹo:</span>
                                {champ.notes}
                              </div>
                            )}
                          </div>

                          {/* Footer: Quick link to inspect in Draft Picker */}
                          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Thêm lúc: {new Date(champ.createdAt).toLocaleDateString('vi-VN')}</span>
                            <button
                              onClick={() => onInspectCounter(champ.championName)}
                              className="text-amber-400 hover:text-amber-300 font-semibold"
                            >
                              Thử Kèo Cấm Chọn →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};
