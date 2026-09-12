# ⚔️ LOL Counter Pick & Personal Champion Pool (Huấn Luyện Viên Cấm Chọn LMHT)

<div align="center">

![GitHub repo size](https://img.shields.io/github/repo-size/fkher003/LOL-Peak?color=blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-3.8_Flash-orange.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![Riot Games](https://img.shields.io/badge/Riot_Games-Data_Dragon-red.svg?logo=riotgames&logoColor=white)](https://developer.riotgames.com/)
[![GitHub stars](https://img.shields.io/github/stars/fkher003/LOL-Peak?style=social)](https://github.com/fkher003/LOL-Peak)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/fkher003/LOL-Peak/pulls)

**Ứng dụng hỗ trợ cấm chọn (Draft Pick) thông minh, phân tích tỷ lệ thắng xếp hạng thực tế theo thời gian thực, đề xuất đội hình "Make Late" và quản lý bể tướng cá nhân chuẩn thi đấu cho người chơi Liên Minh Huyền Thoại.**

[Tính Năng Nổi Bật](#-tính-năng-nổi-bật) • [Cài Đặt & Chạy](#-cài-đặt--khởi-chạy) • [Kiến Trúc Dự Án](#-kiến-trúc-dự-án) • [Cập Nhật Dữ Liệu](#-cập-nhật-dữ-liệu-bản-vá-mới) • [Đóng Góp](#-hướng-dẫn-đóng-góp-contributing) • [Giấy Phép](#-giấy-phép-license)

</div>

---

## 🌟 Giới Thiệu Dự Án

**LOL Counter Pick & Champion Pool** được xây dựng nhằm giải quyết bài toán khó khăn nhất trong các trận đấu Xếp Hạng: **Giai đoạn Cấm Chọn (Draft Phase)**. Một lượt pick khắc chế chuẩn xác hoặc một lựa chọn phù hợp với điều kiện thắng của đội hình có thể định đoạt 60% kết quả trận đấu ngay từ phút 0.

Dự án kết hợp giữa **Dữ liệu đối đầu Xếp Hạng thực tế (Ranked Emerald+)**, **Thuật toán chấm điểm khắc chế tức thì $O(1)$**, **Chiến lược đội hình Make Late** và **Trí tuệ nhân tạo Google Gemini 3.8 Flash** để cung cấp cho bạn những lời khuyên cấm chọn chất lượng cao nhất trong thời gian thực.

---

## ✨ Tính Năng Nổi Bật

### 1. 🎯 Gợi Ý Khắc Chế Thời Gian Thực (Real-Time Counter Engine)
- **Pick tới đâu gợi ý tới đó**: Không cần đối thủ pick đủ 5 tướng, chỉ cần 1 tướng địch lộ diện là hệ thống lập tức tính toán và đề xuất ngay.
- **Phân loại chiến thuật trực quan**:
  - `🌟 Đè Lane & Thêm Team Địch`: Vừa thắng đường trực tiếp, vừa khắc chế thêm các thành viên khác trong đội hình đối phương.
  - `⚔️ Đè Cùng Lane` / `⚔️ Đè Trực Diện Rừng`: Thắng kèo đối đầu tay đôi trực tiếp 1v1.
  - `👑 Gợi Ý Đội Hình (Make Late)`: Các vị tướng sở hữu chất tướng late game cực mạnh, tăng tiến vô hạn hoặc mở giao tranh lật kèo.
- **Thống kê Xếp Hạng thực tế**: Hiển thị rõ **Tỷ Lệ Thắng (% Win Rate)** và **Số Trận Mẫu** (được tổng hợp từ bậc Xếp Hạng Lục Bảo trở lên).
- **Giao diện Clean & Hiện đại**: Trực quan hóa danh sách đối thủ bị đè bẹp bằng các **chip tag ảnh chân dung tròn (mini-avatars)** thay vì chữ viết dài dòng.

### 2. 👑 Chiến Lược Đội Hình "Make Late" (Late-Game Hyper-Carries)
- Đề xuất các lựa chọn gánh đội cực mạnh khi ván đấu kéo dài quá phút 30:
  - **Tăng tiến vô hạn**: Smolder (225 Long Hỏa), Aurelion Sol (Bụi Sao), Veigar (SMPT), Senna (Linh Hồn), Sion / Cho'Gath (Máu vô hạn), Nasus (Q gõ sập trụ).
  - **Hyper-Carries cuối trận**: Kayle (Cấp 16 Thần Thánh), Kassadin (Cấp 16 Lữ Khách Hư Không), Jinx (Hưng Phấn Quét Sạch), Vayne, Gwen, Master Yi...
  - **Mở giao tranh & Nâng cấp toàn đội**: Ornn (đúc đồ Huyền Thoại nâng cấp cho cả 5 người), Amumu, Zac, Taric (2.5s bất tử toàn đội), Sona...

### 3. 🌲 Tối Ưu Hóa Chuyên Biệt Cho Vị Trí Đi Rừng (Jungle Meta)
- Dữ liệu đối đầu chi tiết cho **hơn 40 tướng Đi Rừng meta** (Lee Sin, Viego, Kha'Zix, Warwick, Xin Zhao, Bel'Veth, Lillia, Trundle, Amumu, Zac, Olaf...).
- Tự động chuyển đổi sang thuật ngữ rừng chuẩn xác: *Đè Trực Diện Rừng*, *Kèo Rừng Đối Đầu*, *Xâm Lăng Cướp Rừng*.

### 4. 🤖 Huấn Luyện Viên AI Gemini (Gemini 3.8 Flash Coach)
- Tích hợp mô hình AI mới nhất của Google qua SDK chính thức `@google/genai`.
- Đưa ra lời khuyên chiến thuật ngắn gọn, súc tích dưới 120 từ:
  - Phân tích kèo đấu & điều kiện thắng.
  - Kỹ năng then chốt của đối thủ cần phải né.
  - Mẹo combo và trang bị khắc chế tối ưu.

### 5. 📂 Quản Lý Bể Tướng Cá Nhân (Personal Champion Pool)
- Quản lý danh sách tướng thuận tay theo từng vị trí (TOP, JGL, MID, ADC, SUP).
- Tự do tạo và đổi tên các danh mục tùy biến: *Tướng tủ leo rank, Bài dị out meta, Tướng counter cứng, Tướng mở giao tranh...*
- Tướng trong bể cá nhân sẽ được gắn huy hiệu ngôi sao tím ⭐ và tự động ưu tiên điểm số đề xuất khi vào trận cấm chọn.

### 6. 🔒 Bảo Mật Tuyệt Đối & Tôn Trọng Quyền Riêng Tư (Privacy-First)
- **100% Client-side**: Toàn bộ bể tướng cá nhân và cài đặt danh mục được lưu trữ hoàn toàn trong `localStorage` của trình duyệt. Không gửi dữ liệu cá nhân lên máy chủ database.
- **BYO-Key (Bring Your Own Key)**: Người dùng có thể tự nhập Gemini API Key của mình, lưu trữ an toàn tại máy cá nhân và gọi API trực tiếp.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Lĩnh Vực | Công Nghệ / Thư Viện |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 5.8, Tailwind CSS v4, Lucide React, Motion |
| **Backend** | Node.js, Express (proxy API Riot & Gemini an toàn, cache 12 giờ) |
| **Trí Tuệ Nhân Tạo (AI)** | Google Gen AI SDK (`@google/genai`), Gemini 3.8 Flash |
| **Dữ Liệu Game** | Riot Games Data Dragon (Tiếng Việt vi_VN), Ranked Emerald+ Datasets |
| **Đóng Gói & Tối Ưu** | Vite 6, esbuild (bundle server CJS) |

---

## 🚀 Cài Đặt & Khởi Chạy

### Yêu cầu tiên quyết
- **Node.js**: Phiên bản 18.0.0 trở lên
- **npm** (hoặc pnpm / yarn)

### Các bước khởi chạy
```bash
# 1. Clone mã nguồn về máy
git clone https://github.com/fkher003/LOL-Peak.git
cd LOL-Peak

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```

Ứng dụng sẽ chạy tại địa chỉ: **`http://localhost:3000`**

### Các lệnh npm hữu ích
- `npm run dev`: Chạy dev server với HMR (Hot Module Replacement) trên cổng 3000.
- `npm run build`: Đóng gói ứng dụng cho môi trường production (Vite build client + esbuild bundle server ra `dist/`).
- `npm run lint`: Kiểm tra kiểu tĩnh TypeScript toàn bộ dự án (`tsc --noEmit`).
- `npm run update-counters`: Chạy script tự động cào và cập nhật dữ liệu winrate đối đầu xếp hạng mới nhất.

---

## 🔄 Cập Nhật Dữ Liệu Bản Vá Mới

Mỗi khi Riot Games ra mắt một bản cập nhật lớn (Patch mới), bạn chỉ cần chạy lệnh sau để làm mới dữ liệu thống kê đối đầu:

```bash
# Cập nhật toàn bộ các đường
npm run update-counters

# Hoặc chỉ cập nhật riêng vị trí Đi Rừng
node scripts/update-matchups.mjs --lane=jungle
```

Hệ thống sẽ tự động tổng hợp tỷ lệ thắng, số trận mẫu và ghi đè vào file `src/data/matchups.json`.

---

## 📂 Kiến Trúc Thư Mục

```
LOL-Peak/
├── scripts/
│   └── update-matchups.mjs        # Script cào dữ liệu đối đầu xếp hạng
├── src/
│   ├── components/
│   │   ├── ApiKeyModal.tsx        # Modal quản lý API Key Gemini
│   │   ├── ChampionModal.tsx      # Modal thêm/sửa tướng vào bể cá nhân
│   │   ├── CounterPickerView.tsx  # Giao diện chính cấm chọn & thẻ gợi ý
│   │   ├── Navbar.tsx             # Thanh điều hướng, chuyển tab & nút Star
│   │   └── PersonalPoolView.tsx   # Quản lý bể tướng cá nhân theo từng lane
│   ├── data/
│   │   ├── champions.ts           # Dữ liệu tướng cơ bản, avatar CDN & counter tĩnh
│   │   └── matchups.json          # Cơ sở dữ liệu tỷ lệ thắng đối đầu thực tế
│   ├── utils/
│   │   ├── championProfiles.ts    # Ưu điểm, nhược điểm và mẹo của từng vị tướng
│   │   └── counterEngine.ts       # Động cơ tính điểm khắc chế O(1) & Make Late
│   ├── App.tsx                    # State tổng, đồng bộ LocalStorage & Riot API
│   ├── types.ts                   # Định nghĩa các interface TypeScript
│   └── main.tsx                   # Điểm khởi chạy React
├── server.ts                      # Máy chủ Express (Proxy Riot CDN & AI Endpoint)
├── package.json                   # Cấu hình scripts & dependencies
├── tsconfig.json                  # Cấu hình TypeScript
└── vite.config.ts                 # Cấu hình Vite bundler
```

---

## 🤝 Hướng Dẫn Đóng Góp (Contributing)

Dự án là **mã nguồn mở 100%**, chúng tôi rất hoan nghênh mọi đóng góp từ cộng đồng người chơi và lập trình viên:

1. **Fork** repository này về tài khoản GitHub của bạn.
2. Tạo một nhánh tính năng mới (`git checkout -b feature/AmazingFeature`).
3. Commit các thay đổi của bạn (`git commit -m 'feat: Add some AmazingFeature'`).
4. Push lên nhánh của bạn (`git push origin feature/AmazingFeature`).
5. Mở một **Pull Request** trên GitHub.

Nếu bạn phát hiện lỗi hoặc có ý tưởng cải tiến chiến thuật, đừng ngần ngại [mở Issue](https://github.com/fkher003/LOL-Peak/issues) nhé!

---

## ⚖️ Tuyên Bố Miễn Trừ Trách Nhiệm (Disclaimer)

**LOL Counter Pick & Champion Pool** tuân thủ chính sách của Riot Games về việc phát triển ứng dụng bên thứ ba:

> *LOL Counter Pick & Champion Pool isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.*

---

## 📄 Giấy Phép (License)

Dự án được phát hành theo giấy phép mã nguồn mở **[MIT License](LICENSE)**. Bạn hoàn toàn có quyền sử dụng, sửa đổi và phân phối lại mã nguồn cho mục đích cá nhân hoặc phi thương mại.

---

<div align="center">

⭐ **Nếu dự án giúp bạn leo rank tốt hơn, hãy tặng 1 Star để ủng hộ tác giả nhé!** ⭐

Được phát triển với đam mê LMHT bởi **[fkher003](https://github.com/fkher003)**

</div>
