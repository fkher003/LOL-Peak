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
    const { enemyChampion, playerChampion, lane, userNotes, enemyTeam, myLane, topCandidates } = body;

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
        prompt = `Bạn là Huấn luyện viên Challenger LMHT hàng đầu.
Người chơi đang cân nhắc pick: ${playerChampion} ở vị trí ${myLane || lane || 'Tự do'}.
Đội hình địch đã pick:
${enemiesStr}

YÊU CẦU: Trả lời CỰC KỲ SÚC TÍCH DƯỚI 130 TỪ, đúng cấu trúc 5 mục sau:
🎯 ĐÁNH GIÁ KÈO: (1-2 câu: lợi thế đi lane và vai trò trong giao tranh tổng)
🟢 ƯU ĐIỂM KHẮC CHẾ:
• (Ưu điểm 1 - ngắn gọn)
• (Ưu điểm 2 - ngắn gọn)
🔴 RỦI RO CẦN TRÁNH:
• (1-2 chiêu thức/nguy cơ lớn nhất từ tướng địch cần né)
💎 BẢNG NGỌC CORE: [Tên Ngọc Siêu Cấp] • [Tên 1 Nhánh Phụ then chốt] (Giải thích ngắn)
⚔️ TRANG BỊ CORE: [Món 1] • [Món 2] • [Món 3] (2-3 trang bị trấn phái khắc chế tốt nhất trận này)`;
      } else {
        const candidatesHint = Array.isArray(topCandidates) && topCandidates.length > 0
          ? `Ứng viên khắc chế tiềm năng từ dữ liệu xếp hạng: ${topCandidates.join(', ')}.`
          : '';

        prompt = `Bạn là Huấn luyện viên Challenger LMHT hàng đầu.
Người chơi đi vị trí: ${myLane || lane || 'Tự do'}.
Đội hình địch đã pick:
${enemiesStr}
${candidatesHint}

YÊU CẦU: Trả lời CỰC KỲ SÚC TÍCH DƯỚI 140 TỪ, đề xuất đúng 3 tướng tối ưu nhất cho vị trí ${myLane || lane || 'này'}. Đa dạng hóa các lựa chọn, phân tích cụ thể dựa vào đội hình địch, tránh gợi ý lặp lại rập khuôn:
1. [Tên Tướng 1] (🌟 Khắc chế cả Lane & Combat): Khắc chế ai, ưu điểm then chốt & 1 mẹo combat.
2. [Tên Tướng 2] (⚔️ Đè bẹp cùng Lane): Khắc chế ai, ưu điểm then chốt & 1 mẹo combat.
3. [Tên Tướng 3] (🛡️ Khắc chế Đội hình địch): Khắc chế ai, ưu điểm then chốt & 1 mẹo combat.
Chỉ xuất danh sách trên, không dông dài mở bài hay kết bài.`;
      }
    } else if (enemyChampion) {
      // Case 2: Single Matchup Analysis
      prompt = playerChampion
        ? `Bạn là Huấn luyện viên Challenger LMHT hàng đầu.
Kèo đấu: ${playerChampion} vs ${enemyChampion} ở lane ${lane || 'Tự do'}.
${userNotes ? `Ghi chú người chơi: ${userNotes}` : ''}

YÊU CẦU: Trả lời CỰC KỲ SÚC TÍCH DƯỚI 120 TỪ, đúng cấu trúc 5 mục:
🎯 TỔNG QUAN KÈO: (1 câu đánh giá lợi thế)
🟢 ƯU ĐIỂM: (1 gạch đầu dòng ngắn)
🔴 RỦI RO: (1 chiêu thức/nguy cơ lớn nhất cần né)
💎 BẢNG NGỌC CORE: [Tên Ngọc Siêu Cấp] • [Tên Nhánh Phụ]
⚔️ TRANG BỊ CORE: [Món 1] • [Món 2] • [Món 3]`
        : `Bạn là Huấn luyện viên Challenger LMHT hàng đầu.
Đối thủ pick: ${enemyChampion} ở lane ${lane || 'Chung'}.

YÊU CẦU: Gợi ý đúng 3 tướng khắc chế nhất, DƯỚI 110 TỪ:
1. [Tướng 1]: Khắc chế bằng cơ chế gì, mẹo chốt.
2. [Tướng 2]: Khắc chế bằng cơ chế gì, mẹo chốt.
3. [Tướng 3]: Khắc chế bằng cơ chế gì, mẹo chốt.`;
    } else {
      return res.status(400).json({ error: 'Missing enemyChampion or enemyTeam.' });
    }

    const candidateModels = ['gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3-flash'];
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
