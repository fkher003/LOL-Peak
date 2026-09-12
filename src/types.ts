export type Lane = 'TOP' | 'JGL' | 'MID' | 'ADC' | 'SUP';

export interface LaneOption {
  id: Lane;
  name: string;
  shortName: string;
  icon: string;
  description: string;
}

export type CounterScope = 'BOTH' | 'LANE_ONLY' | 'TEAM_ONLY';

export interface CounterInfo {
  counterChampionId: string;
  counterChampionName: string;
  tier: 'HARD_COUNTER' | 'STRONG_COUNTER' | 'SKILL_MATCHUP';
  lane: Lane;
  whyPick: string; // Lý do tại sao pick tướng đó
  keySkillTip: string; // Kỹ năng & mẹo cốt lõi
  recommendedItems: string[]; // Trang bị gợi ý
  synergyOrSpike?: string; // Mốc sức mạnh / thời điểm tỏa sáng
}

export interface ChampionData {
  id: string; // e.g. "Aatrox", "LeeSin"
  key?: string;
  name: string; // "Aatrox", "Lee Sin"
  title: string;
  blurb?: string;
  tags?: string[];
  version?: string;
  defaultLanes: Lane[];
  avatarUrl: string;
  countersAgainst?: CounterInfo[]; // Danh sách các tướng khắc chế đối thủ này
}

export interface LaneCategory {
  id: string;
  lane: Lane;
  name: string;
  description?: string;
  createdAt: number;
}

// Personal Champion Pool Model categorized by Lane and User Custom Sections
export interface PersonalChampion {
  id: string; // unique UUID
  championId: string; // Standard Riot ID or cleaned string
  championName: string;
  lane: Lane; // Lane chính mà thẻ này thuộc về
  lanes: Lane[]; // Tướng này có thể đi những lane nào (để phục vụ Counter Engine)
  categoryId: string; // ID của mục (ví dụ: "cat-mid-counter", "cat-mid-di", ...)
  categoryName?: string; // Tên mục tùy chỉnh (ví dụ: "Tướng dị", "Tướng counter", "Tướng hỗ trợ team tốt")
  counterTargets: string[]; // Danh sách tướng đối thủ mà con này khắc chế (vd: ['Zed', 'Yasuo'])
  notes?: string; // Mẹo chơi, ghi chú cá nhân ngắn gọn
  createdAt: number;
  updatedAt: number;
}

// Enemy Slot in Draft Pick Simulator
export interface EnemySlot {
  slotNumber: number; // 1 to 5
  champion: ChampionData | null;
  lane?: Lane; // Vị trí dự kiến của tướng địch (TOP, JGL, MID, ADC, SUP)
}

// Dynamic Counter Recommendation Result
export interface CounterRecommendation {
  championId: string;
  championName: string;
  avatarUrl: string;
  lanes: Lane[];
  scope: CounterScope; // 'BOTH' (Cả 2), 'LANE_ONLY' (Cùng lane), 'TEAM_ONLY' (Đội hình)
  score: number; // Ranking priority score
  tierLabel: 'S+ Tối Ưu' | 'S Xuất Sắc' | 'A Khuyên Dùng' | 'B Khả Dụng';
  counteredEnemies: {
    championName: string;
    championId: string;
    isSameLane: boolean;
    reason: string;
  }[];
  pros: string[]; // Ưu điểm nổi bật khi pick vào trận này
  cons: string[]; // Nhược điểm & Rủi ro cần dè chừng để người chơi tự cân nhắc
  keyTip: string; // Mẹo then chốt
  inPersonalPool: boolean; // Có nằm trong bể tướng cá nhân không
}
