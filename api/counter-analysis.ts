import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { enemyChampion, playerChampion, lane, userNotes, enemyTeam, myLane } = body;

    // Check for user-provided API key or server-side environment key
    const rawApiKey = req.headers['x-gemini-api-key'] || body?.apiKey || process.env.GEMINI_API_KEY;
    const apiKey = typeof rawApiKey === 'string' && rawApiKey.trim().length > 0 ? rawApiKey.trim() : null;

    if (!apiKey) {
      return res.status(401).json({
        error: 'Vui lòng nhập API Key Gemini của bạn để sử dụng tính năng phân tích AI này.',
        requireApiKey: true,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let prompt = '';

    // Case 1: Team Draft Counter Analysis (Multiple enemies + myLane)
    if (Array.isArray(enemyTeam) && enemyTeam.length > 0) {
      const enemiesStr = enemyTeam
        .map((e: any, idx: number) => `${idx + 1}. ${e.name}${e.lane ? ` (${e.lane})` : ''}`)
        .join('\n');

      if (playerChampion) {
        prompt = `Bạn là Huấn luyện viên Challenger LMHT.
Người chơi đang cân nhắc pick: ${playerChampion} ở vị trí ${myLane || lane || 'Tự do'}.
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
Người chơi đi vị trí: ${myLane || lane || 'Tự do'}.
Đội hình địch đã pick:
${enemiesStr}

YÊU CẦU: Trả lời CỰC KỲ NGẮN GỌN, TÓM TẮT DƯỚI 130 TỪ, đề xuất đúng 3 tướng tối ưu nhất cho vị trí ${myLane || lane || 'này'}:
1. [Tên Tướng 1] (🌟 Khắc chế cả Lane & Combat): [Khắc chế ai] - Ưu điểm: [1 câu ngắn] | Mẹo: [1 câu ngắn]
2. [Tên Tướng 2] (⚔️ Đè bẹp cùng Lane): [Khắc chế ai] - Ưu điểm: [1 câu ngắn] | Mẹo: [1 câu ngắn]
3. [Tên Tướng 3] (🛡️ Khắc chế Đội hình địch): [Khắc chế ai] - Ưu điểm: [1 câu ngắn] | Mẹo: [1 câu ngắn]
Chỉ xuất danh sách trên, không dông dài mở bài hay kết bài.`;
      }
    } else if (enemyChampion) {
      // Case 2: Single Matchup Analysis
      prompt = playerChampion
        ? `Bạn là Huấn luyện viên Challenger LMHT.
Kèo đấu: ${playerChampion} vs ${enemyChampion} ở lane ${lane || 'Tự do'}.
${userNotes ? `Ghi chú người chơi: ${userNotes}` : ''}

YÊU CẦU: Trả lời CỰC KỲ TÓM TẮT DƯỚI 100 TỪ:
🎯 TỔNG QUAN: (1 câu kèo có lợi hay khó khăn)
🟢 ƯU ĐIỂM: (1 gạch đầu dòng ngắn)
🔴 RỦI RO: (1 chiêu thức/nguy cơ lớn nhất cần né)
⚡ MẸO LÊN ĐỒ / COMBO: (1 câu chốt)`
        : `Bạn là Huấn luyện viên Challenger LMHT.
Đối thủ pick: ${enemyChampion} ở lane ${lane || 'Chung'}.

YÊU CẦU: Gợi ý đúng 3 tướng khắc chế nhất, DƯỚI 100 TỪ:
1. [Tướng 1]: Khắc chế bằng cơ chế gì, mẹo chốt.
2. [Tướng 2]: Khắc chế bằng cơ chế gì, mẹo chốt.
3. [Tướng 3]: Khắc chế bằng cơ chế gì, mẹo chốt.`;
    } else {
      return res.status(400).json({ error: 'Missing enemyChampion or enemyTeam.' });
    }

    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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
      throw lastError || new Error('Không thể kết nối với dịch vụ Gemini AI, vui lòng thử lại sau.');
    }

    return res.status(200).json({
      success: true,
      analysis: response.text,
      model: usedModel,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Gemini counter-analysis error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate counter analysis.',
    });
  }
}
