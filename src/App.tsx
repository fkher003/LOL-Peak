import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CounterPickerView } from './components/CounterPickerView';
import { PersonalPoolView } from './components/PersonalPoolView';
import { ChampionModal } from './components/ChampionModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PersonalChampion, Lane, LaneCategory, ChampionData } from './types';
import { INITIAL_PERSONAL_CHAMPIONS, DEFAULT_LANE_CATEGORIES, CHAMPIONS_LIST } from './data/champions';

const STORAGE_KEY_CHAMPIONS = 'lol_personal_pool_champions_v4';
const STORAGE_KEY_CATEGORIES = 'lol_lane_categories_v3';
const STORAGE_KEY_API_KEY = 'gemini_user_api_key';

// Normalizer to guarantee smooth compatibility with any saved localStorage schema
function normalizeChampion(item: any, availableCategories: LaneCategory[]): PersonalChampion {
  const lane: Lane = item.lane || (Array.isArray(item.lanes) && item.lanes[0]) || 'MID';
  const lanes: Lane[] = Array.isArray(item.lanes) && item.lanes.length > 0 ? item.lanes : [lane];

  let counterTargets: string[] = [];
  if (Array.isArray(item.counterTargets)) {
    counterTargets = item.counterTargets;
  } else if (typeof item.counterTargets === 'string') {
    counterTargets = item.counterTargets
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  // Map or fallback to category
  let categoryId = item.categoryId;
  let categoryName = item.categoryName;
  if (!categoryId) {
    const defaultCat =
      availableCategories.find((c) => c.lane === lane && c.name.toLowerCase().includes('counter')) ||
      availableCategories.find((c) => c.lane === lane) ||
      DEFAULT_LANE_CATEGORIES.find((c) => c.lane === lane);
    categoryId = defaultCat ? defaultCat.id : `cat-${lane.toLowerCase()}-counter`;
    categoryName = defaultCat ? defaultCat.name : 'Tướng Counter';
  }

  return {
    id: item.id || 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    championId: item.championId || item.championName || 'Malphite',
    championName: item.championName || item.championId || 'Malphite',
    lane,
    lanes,
    categoryId,
    categoryName: categoryName || 'Tướng Counter',
    counterTargets,
    notes: item.notes || '',
    createdAt: item.createdAt || Date.now(),
    updatedAt: item.updatedAt || Date.now(),
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'counter' | 'personal'>('counter');

  // 1. Categories State (Organized by Lane)
  const [categories, setCategories] = useState<LaneCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load categories from localStorage', e);
    }
    return DEFAULT_LANE_CATEGORIES;
  });

  // Persist categories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage', e);
    }
  }, [categories]);

  // 2. Personal Champions State (Defaults to clean empty list)
  const [personalChampions, setPersonalChampions] = useState<PersonalChampion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAMPIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => normalizeChampion(item, DEFAULT_LANE_CATEGORIES));
        }
      }
    } catch (e) {
      console.error('Failed to load champions from localStorage', e);
    }
    return [];
  });

  // Persist champions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHAMPIONS, JSON.stringify(personalChampions));
    } catch (e) {
      console.error('Failed to save champions to localStorage', e);
    }
  }, [personalChampions]);

  // 3. User Gemini API Key State (Stored 100% locally in user's browser)
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
    } catch {
      return '';
    }
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const handleSaveApiKey = (newKey: string) => {
    const trimmed = newKey.trim();
    setApiKey(trimmed);
    try {
      localStorage.setItem(STORAGE_KEY_API_KEY, trimmed);
    } catch (e) {
      console.error('Failed to save API key to localStorage', e);
    }
  };

  const handleRemoveApiKey = () => {
    setApiKey('');
    try {
      localStorage.removeItem(STORAGE_KEY_API_KEY);
    } catch (e) {
      console.error('Failed to remove API key from localStorage', e);
    }
  };

  // 4. Riot Games Official Data Dragon State
  const [riotChampions, setRiotChampions] = useState<ChampionData[]>([]);
  const [riotVersion, setRiotVersion] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    fetch('/api/riot/champions')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.champions)) {
          setRiotChampions(data.champions);
          if (data.version) {
            setRiotVersion(data.version);
          }
        }
      })
      .catch((err) => {
        console.warn('Cannot connect to Riot Data endpoint, using fallback list', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Combined Champion Catalog: Prioritize Riot Official Vietnamese Data Dragon
  const allChampions: ChampionData[] = useMemo(() => {
    if (riotChampions.length > 0) {
      return riotChampions;
    }
    return CHAMPIONS_LIST;
  }, [riotChampions]);

  // Champion Modal State
  const [isChampionModalOpen, setIsChampionModalOpen] = useState(false);
  const [editingChampion, setEditingChampion] = useState<PersonalChampion | null>(null);
  const [modalTargetLane, setModalTargetLane] = useState<Lane>('MID');
  const [modalTargetCategoryId, setModalTargetCategoryId] = useState<string | undefined>(undefined);
  const [prefilledData, setPrefilledData] = useState<{
    championId: string;
    championName: string;
    lane?: Lane;
    lanes?: Lane[];
    categoryId?: string;
    categoryName?: string;
    counterTargets: string[];
    notes?: string;
  } | null>(null);

  // Category Handlers
  const handleAddCategory = (lane: Lane, name: string): LaneCategory => {
    const newCategory: LaneCategory = {
      id: `cat-${lane.toLowerCase()}-${Date.now()}`,
      lane,
      name,
      createdAt: Date.now(),
    };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const handleRenameCategory = (categoryId: string, newName: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, name: newName } : c))
    );
    // Also update champions that have this category
    setPersonalChampions((prev) =>
      prev.map((champ) =>
        champ.categoryId === categoryId ? { ...champ, categoryName: newName } : champ
      )
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Delete category
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    // Remove champions in this category or migrate them
    setPersonalChampions((prev) => prev.filter((champ) => champ.categoryId !== categoryId));
  };

  // Champion Handlers
  const handleSaveChampion = (
    champData: {
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
  ) => {
    if (editId) {
      // Edit existing
      setPersonalChampions((prev) =>
        prev.map((item) =>
          item.id === editId
            ? { ...item, ...champData, updatedAt: Date.now() }
            : item
        )
      );
    } else {
      // Add new
      const newChamp: PersonalChampion = {
        ...champData,
        id: 'champ-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setPersonalChampions((prev) => [newChamp, ...prev]);
    }
  };

  const handleDeleteChampion = (id: string) => {
    setPersonalChampions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMoveChampionCategory = (
    champId: string,
    targetCategoryId: string,
    targetCategoryName: string
  ) => {
    setPersonalChampions((prev) =>
      prev.map((champ) =>
        champ.id === champId
          ? {
              ...champ,
              categoryId: targetCategoryId,
              categoryName: targetCategoryName,
              updatedAt: Date.now(),
            }
          : champ
      )
    );
  };

  // Open modal targeting specific category in a lane
  const handleAddNewToCategory = (lane: Lane, categoryId: string) => {
    setEditingChampion(null);
    setPrefilledData(null);
    setModalTargetLane(lane);
    setModalTargetCategoryId(categoryId);
    setIsChampionModalOpen(true);
  };

  // Open modal general for a lane
  const handleAddNewGeneral = (lane: Lane) => {
    setEditingChampion(null);
    setPrefilledData(null);
    setModalTargetLane(lane);
    setModalTargetCategoryId(undefined);
    setIsChampionModalOpen(true);
  };

  // Handler: Quick add from Counter recommendations
  const handleAddFromCounter = (
    counterChampionId: string,
    counterChampionName: string,
    lanes: Lane[],
    enemyName: string,
    whyPick: string,
    tips: string
  ) => {
    const targetLane = lanes[0] || 'MID';

    // Find category for this lane (default to Counter category)
    const laneCat =
      categories.find((c) => c.lane === targetLane && c.name.toLowerCase().includes('counter')) ||
      categories.find((c) => c.lane === targetLane);

    const categoryId = laneCat ? laneCat.id : `cat-${targetLane.toLowerCase()}-counter`;
    const categoryName = laneCat ? laneCat.name : 'Tướng Counter';

    // Check if already in pool
    const existing = personalChampions.find(
      (c) =>
        c.championName.toLowerCase() === counterChampionName.toLowerCase() ||
        c.championId.toLowerCase() === counterChampionId.toLowerCase()
    );

    const enemyList = enemyName
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (existing) {
      // Merge counter targets without duplicates
      const mergedTargets = Array.from(new Set([...existing.counterTargets, ...enemyList]));
      setEditingChampion(existing);
      setModalTargetLane(existing.lane || targetLane);
      setModalTargetCategoryId(existing.categoryId || categoryId);
      setPrefilledData({
        championId: existing.championId,
        championName: existing.championName,
        lane: existing.lane || targetLane,
        lanes: existing.lanes || lanes,
        categoryId: existing.categoryId || categoryId,
        categoryName: existing.categoryName || categoryName,
        counterTargets: mergedTargets,
        notes: existing.notes || tips,
      });
    } else {
      setEditingChampion(null);
      setModalTargetLane(targetLane);
      setModalTargetCategoryId(categoryId);
      setPrefilledData({
        championId: counterChampionId,
        championName: counterChampionName,
        lane: targetLane,
        lanes,
        categoryId,
        categoryName,
        counterTargets: enemyList,
        notes: `${whyPick}\n\n[Mẹo]: ${tips}`,
      });
    }
    setIsChampionModalOpen(true);
  };

  // Handler: Inspect Counter for Champion
  const handleInspectCounter = (_championName: string) => {
    setActiveTab('counter');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        personalCount={personalChampions.length}
        hasApiKey={Boolean(apiKey && apiKey.trim())}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        riotVersion={riotVersion}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'counter' ? (
          <CounterPickerView
            personalChampions={personalChampions}
            userApiKey={apiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            allChampions={allChampions}
            onAddFromCounter={handleAddFromCounter}
            onSelectChampionForPool={(champ) => {
              setEditingChampion(champ);
              setModalTargetLane(champ.lane || 'MID');
              setModalTargetCategoryId(champ.categoryId);
              setIsChampionModalOpen(true);
            }}
          />
        ) : (
          <PersonalPoolView
            personalChampions={personalChampions}
            categories={categories}
            onAddNewToCategory={handleAddNewToCategory}
            onAddNewGeneral={handleAddNewGeneral}
            onEdit={(champ) => {
              setEditingChampion(champ);
              setModalTargetLane(champ.lane || 'MID');
              setModalTargetCategoryId(champ.categoryId);
              setPrefilledData(null);
              setIsChampionModalOpen(true);
            }}
            onDelete={handleDeleteChampion}
            onMoveCategory={handleMoveChampionCategory}
            onAddCategory={handleAddCategory}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
            onInspectCounter={handleInspectCounter}
          />
        )}
      </main>

      {/* Champion Add/Edit Modal */}
      <ChampionModal
        isOpen={isChampionModalOpen}
        onClose={() => {
          setIsChampionModalOpen(false);
          setEditingChampion(null);
          setPrefilledData(null);
        }}
        onSave={handleSaveChampion}
        editingChampion={editingChampion}
        currentLane={modalTargetLane}
        currentCategoryId={modalTargetCategoryId}
        categories={categories}
        allChampions={allChampions}
        onAddCategory={handleAddCategory}
        prefilledData={prefilledData}
      />

      {/* Gemini API Key Modal (100% Client-Side Persistence) */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
        onRemoveKey={handleRemoveApiKey}
      />
    </div>
  );
}
