# ⚔️ LOL Counter Pick & Personal Champion Pool (Huấn Luyện Viên Cấm Chọn LMHT)

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-3.8_Flash-orange.svg)](https://ai.google.dev/)
[![Riot Games](https://img.shields.io/badge/Riot_Games-Data_Dragon-red.svg)](https://developer.riotgames.com/)

Ứng dụng hỗ trợ cấm chọn (Draft Pick) thông minh, đề xuất tướng khắc chế theo thời gian thực và quản lý bể tướng cá nhân chuẩn thi đấu cho người chơi Liên Minh Huyền Thoại.

---

## ✨ Tính Năng Nổi Bật

- 🎯 **Gợi Ý Khắc Chế Thời Gian Thực (Real-time Draft Counter)**:
  - Chọn tối đa 5 vị trí đối thủ (Top, Rừng, Mid, AD, Sp).
  - Tự động tính toán điểm khắc chế dựa trên tương tác chất tướng và bộ kỹ năng.
  - Phân loại trực quan: Tướng thuộc bể cá nhân (có huy hiệu ⭐), tướng khắc chế cứng, tướng an toàn.

- 🤖 **Huấn Luyện Viên AI (Gemini 3.8 Flash)**:
  - Phân tích sâu điều kiện thắng, điểm mạnh, rủi ro cần né (chiêu thức then chốt của đối thủ) và mẹo lên đồ/combo.
  - Tóm tắt súc tích dạng gạch đầu dòng dưới 120 từ, tối ưu cho giai đoạn cấm chọn nhanh.

- 📂 **Bể Tướng Cá Nhân Linh Hoạt (Personal Pool Builder)**:
  - Phân loại rõ ràng theo từng Lane (TOP, JGL, MID, ADC, SUP).
  - Tự do tạo các danh mục tùy chỉnh: *Tướng tủ leo rank, Tướng dị out meta, Tướng counter cứng, Tướng hỗ trợ giao tranh...*
  - Gắn nhãn đối thủ bị khắc chế và ghi chú mẹo combo cho từng tướng.

- 🔒 **Bảo Mật Dữ Liệu Tuyệt Đối (Privacy-First)**:
  - Bể tướng lưu trữ 100% trên thiết bị của người dùng thông qua `localStorage`. Không gửi dữ liệu cá nhân lên máy chủ.
  - Cơ chế **BYO-Key (Bring Your Own Key)**: Người dùng tự quản lý Gemini API Key của mình.

- 🎮 **Dữ Liệu Chuẩn Riot Games Data Dragon**:
  - Tự động đồng bộ danh sách tướng, ảnh đại diện và tên tiếng Việt chính thức theo phiên bản mới nhất từ Riot Games.

---

## 🚀 Cài Đặt & Chạy Dự Án

### Yêu cầu
- Node.js 18+ trở lên
- npm hoặc pnpm / yarn

### Các bước cài đặt
```bash
# 1. Clone repository
git clone https://github.com/fkher003/LOL-Peak.git
cd LOL-Peak

# 2. Cài đặt dependencies
npm install

# 3. Khởi chạy môi trường phát triển
npm run dev
```

Mở trình duyệt tại: `http://localhost:3000`

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js, Express, Vite middleware.
- **AI SDK**: `@google/genai` (Google Gen AI SDK).
- **Build Tool**: Vite & esbuild.

---

⭐ **Nếu bạn thấy dự án hữu ích, hãy để lại 1 Star trên GitHub nhé!**
