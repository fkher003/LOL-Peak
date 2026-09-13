import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { getMetaLanes } from "./src/data/championRoles.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for Riot Data Dragon official champions
interface RiotCache {
  version: string;
  timestamp: number;
  champions: any[];
}

let riotCache: RiotCache | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours cache

// Helper to map Riot champion tags to LoL lanes
function mapRiotTagsToLanes(tags: string[], id: string): string[] {
  // Common specific overrides for popular multi-lane or iconic champs
  const overrides: Record<string, string[]> = {
    Aatrox: ["TOP"],
    Ahri: ["MID"],
    Akali: ["MID", "TOP"],
    Darius: ["TOP"],
    Garen: ["TOP"],
    LeeSin: ["JGL"],
    Yasuo: ["MID", "TOP", "ADC"],
    Yone: ["MID", "TOP"],
    Zed: ["MID"],
    Lux: ["MID", "SUP"],
    Morgana: ["SUP", "MID"],
    Thresh: ["SUP"],
    Blitzcrank: ["SUP"],
    Jinx: ["ADC"],
    Kaisa: ["ADC"],
    Vayne: ["ADC", "TOP"],
    Caitlyn: ["ADC"],
    Teemo: ["TOP"],
    Malphite: ["TOP", "MID", "SUP"],
    Gragas: ["TOP", "JGL", "MID", "SUP"],
    Poppy: ["TOP", "JGL", "SUP"],
    Rammus: ["JGL", "TOP"],
  };

  if (overrides[id]) {
    return overrides[id];
  }

  const lanes: string[] = [];
  if (tags.includes("Marksman")) lanes.push("ADC");
  if (tags.includes("Support")) lanes.push("SUP");
  if (tags.includes("Mage")) {
    if (!lanes.includes("MID")) lanes.push("MID");
  }
  if (tags.includes("Assassin")) {
    if (!lanes.includes("MID")) lanes.push("MID");
    if (!lanes.includes("JGL")) lanes.push("JGL");
  }
  if (tags.includes("Fighter")) {
    if (!lanes.includes("TOP")) lanes.push("TOP");
    if (!lanes.includes("JGL")) lanes.push("JGL");
  }
  if (tags.includes("Tank")) {
    if (!lanes.includes("TOP")) lanes.push("TOP");
    if (!lanes.includes("SUP")) lanes.push("SUP");
    if (!lanes.includes("JGL")) lanes.push("JGL");
  }

  return lanes.length > 0 ? lanes : ["MID"];
}

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Official Riot Games Data Dragon API: Fetch current patch and Vietnamese champion list
app.get("/api/riot/champions", async (_req, res) => {
  try {
    // Check cache
    if (riotCache && Date.now() - riotCache.timestamp < CACHE_TTL_MS) {
      return res.json({
        success: true,
        cached: true,
        version: riotCache.version,
        total: riotCache.champions.length,
        source: "Riot Games Data Dragon (Cached)",
        champions: riotCache.champions,
      });
    }

    // 1. Fetch latest Riot version from official versions API
    const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    if (!versionsRes.ok) {
      throw new Error(`Failed to fetch Riot versions: ${versionsRes.statusText}`);
    }
    const versions = (await versionsRes.json()) as string[];
    const latestVersion = versions[0] || "16.18.1";

    // 2. Fetch official Vietnamese champion data
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
        name: c.name, // e.g. "Aatrox", "Lee Sin", "Ngộ Không"
        title: c.title, // e.g. "Quỷ Kiếm Darkin"
        blurb: c.blurb,
        tags: c.tags || [],
        defaultLanes,
        avatarUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${c.image.full}`,
        version: latestVersion,
      };
    });

    // Sort alphabetically by champion name
    championsList.sort((a, b) => a.name.localeCompare(b.name, "vi"));

    // Update in-memory cache
    riotCache = {
      version: latestVersion,
      timestamp: Date.now(),
      champions: championsList,
    };

    return res.json({
      success: true,
      cached: false,
      version: latestVersion,
      total: championsList.length,
      source: "Riot Games Data Dragon (Official)",
      champions: championsList,
    });
  } catch (error: any) {
    console.error("Riot Data Dragon fetch error:", error);
    // If cache exists even if expired, return it as fallback
    if (riotCache) {
      return res.json({
        success: true,
        cached: true,
        stale: true,
        version: riotCache.version,
        total: riotCache.champions.length,
        source: "Riot Games Data Dragon (Stale Fallback)",
        champions: riotCache.champions,
      });
    }
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch champion data from Riot Games Data Dragon.",
    });
  }
});

// AI Counter Matchup & Draft Analysis API
// REQUIRES: User-provided Gemini API key (sent via header 'x-gemini-api-key' or request body 'apiKey')
app.post("/api/counter-analysis", async (req, res) => {
  try {
    const { enemyChampion, playerChampion, lane, userNotes, enemyTeam, myLane } = req.body;

    // Check for user-provided API key or server-side environment key
    const rawApiKey = req.headers["x-gemini-api-key"] || req.body?.apiKey || process.env.GEMINI_API_KEY;
    const apiKey = typeof rawApiKey === "string" && rawApiKey.trim().length > 0 ? rawApiKey.trim() : null;

    if (!apiKey) {
      return res.status(401).json({
        error: "Vui lòng nhập API Key Gemini của bạn để sử dụng tính năng phân tích AI này.",
        requireApiKey: true,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    let prompt = "";

    // Case 1: Team Draft Counter Analysis (Multiple enemies + myLane)
    if (Array.isArray(enemyTeam) && enemyTeam.length > 0) {
      const enemiesStr = enemyTeam
        .map((e: any, idx: number) => `${idx + 1}. ${e.name}${e.lane ? ` (${e.lane})` : ""}`)
        .join("\n");

      if (playerChampion) {
        prompt = `Bạn là Huấn luyện viên Challenger LMHT.
Người chơi đang cân nhắc pick: ${playerChampion} ở vị trí ${myLane || lane || "Tự do"}.
Đội hình địch đã pick:
${enemiesStr}

YÊU CẦU: Trả lời CỰC KỲ NGẮN GỌN, TÓM TẮT DƯỚI 120 TỪ, gạch đầu dòng súc tích:
🎯 ĐÁNH GIÁ: (1 câu ngắn: Nên pick hay không, khắc chế ai trong team địch)
🟢 ƯU ĐIỂM: 
• (Ưu điểm 1 - dưới 10 chữ)
• (Ưu điểm 2 - dưới 10 chữ)
🔴 RỦI RO CẦN TRÁNH: 
• (Chiêu thức cần né hoặc tướng địch có thể outplay bạn)
⚡ MẸO CHỐT: (1 trang bị hoặc combo mấu chốt)`;
      } else {
        prompt = `Bạn là Huấn luyện viên Challenger LMHT.
Người chơi đi vị trí: ${myLane || lane || "Tự do"}.
Đội hình địch đã pick:
${enemiesStr}

YÊU CẦU: Trả lời CỰC KỲ NGẮN GỌN, TÓM TẮT DƯỚI 130 TỪ, đề xuất đúng 3 tướng tối ưu nhất cho vị trí ${myLane || lane || "này"}:
1. [Tên Tướng 1] (🌟 Khắc chế cả Lane & Combat): [Khắc chế ai] - Ưu điểm: [1 câu ngắn] | Mẹo: [1 câu ngắn]
2. [Tên Tướng 2] (⚔️ Đè bẹp cùng Lane): [Khắc chế ai] - Ưu điểm: [1 câu ngắn] | Mẹo: [1 câu ngắn]
3. [Tên Tướng 3] (🛡️ Khắc chế Đội hình địch): [Khắc chế ai] - Ưu điểm: [1 câu ngắn] | Mẹo: [1 câu ngắn]
Chỉ xuất danh sách trên, không dông dài mở bài hay kết bài.`;
      }
    } else if (enemyChampion) {
      // Case 2: Single Matchup Analysis
      prompt = playerChampion
        ? `Bạn là Huấn luyện viên Challenger LMHT.
Kèo đấu: ${playerChampion} vs ${enemyChampion} ở lane ${lane || "Tự do"}.
${userNotes ? `Ghi chú người chơi: ${userNotes}` : ""}

YÊU CẦU: Trả lời CỰC KỲ TÓM TẮT DƯỚI 100 TỪ:
🎯 TỔNG QUAN: (1 câu kèo có lợi hay khó khăn)
🟢 ƯU ĐIỂM: (1 gạch đầu dòng ngắn)
🔴 RỦI RO: (1 chiêu thức/nguy cơ lớn nhất cần né)
⚡ MẸO LÊN ĐỒ / COMBO: (1 câu chốt)`
        : `Bạn là Huấn luyện viên Challenger LMHT.
Đối thủ pick: ${enemyChampion} ở lane ${lane || "Chung"}.

YÊU CẦU: Gợi ý đúng 3 tướng khắc chế nhất, DƯỚI 100 TỪ:
1. [Tướng 1]: Khắc chế bằng cơ chế gì, mẹo chốt.
2. [Tướng 2]: Khắc chế bằng cơ chế gì, mẹo chốt.
3. [Tướng 3]: Khắc chế bằng cơ chế gì, mẹo chốt.`;
    } else {
      return res.status(400).json({ error: "Missing enemyChampion or enemyTeam." });
    }

    const candidateModels = ["gemini-3.7-flash", "gemini-3.8-flash", "gemini-3-flash"];
    let response: any = null;
    let usedModel = candidateModels[0];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        usedModel = model;
        response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        console.warn(`Gemini model ${model} failed, trying fallback:`, err?.message || err);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Không thể kết nối với dịch vụ Gemini AI, vui lòng thử lại sau.");
    }

    return res.json({
      success: true,
      analysis: response.text,
      model: usedModel,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Gemini counter-analysis error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate counter analysis.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
