# Antigravity Agent Guidelines: LOL Counter Pick & Champion Pool

This project is a high-performance, full-stack League of Legends (LOL) counter-picking engine and personalized champion pool management application.

## 🏗️ Tech Stack & Architecture
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Motion.
- **Backend**: Express (Node.js) mounted alongside Vite in development, bundled via `esbuild` for production.
- **AI Integration**: Official `@google/genai` TypeScript SDK invoking `gemini-3.8-flash`.
- **Game Data**: Riot Games Data Dragon API (`/api/riot/champions`) caching Vietnamese champion data (`vi_VN`).
- **Data Persistence**: 
  - **100% Client-Side Privacy**: Personal champion pool and custom categories are saved strictly in `localStorage`. No user data is sent to external databases.
  - **BYO-Key (Bring Your Own Key)**: Users can enter their personal Gemini API Key in the UI, stored locally in `localStorage` (`gemini_user_api_key`) and sent per-request via `x-gemini-api-key` header.

## 📂 Project Structure
- `/server.ts`: Express backend server handling `/api/riot/champions` (Riot CDN proxy & 12h cache) and `/api/counter-analysis` (Gemini AI Coach).
- `/src/App.tsx`: Main state coordinator (syncs categories, champions, API key, Riot data with localStorage and sub-views).
- `/src/types.ts`: Core data structures (`Lane`, `PersonalChampion`, `LaneCategory`, `ChampionData`, `CounterRecommendation`, etc.).
- `/src/data/champions.ts`: Base champion list, lanes metadata, avatar resolvers, and default category templates.
- `/src/components/`:
  - `Navbar.tsx`: Sticky navigation, tab switcher, version tag, and API key management modal trigger.
  - `CounterPickerView.tsx`: Real-time 5-lane enemy draft selector, counter calculation engine, and AI Coach analysis modal.
  - `PersonalPoolView.tsx`: Lane-categorized personal champion pool management with custom category creation/renaming.
  - `ChampionModal.tsx`: Modal for adding/editing a champion into personal pool with autocomplete from full Riot roster.
  - `ApiKeyModal.tsx`: User Gemini API key input modal with security disclaimer and eye toggle.

## ⚙️ Development & Scripts
- Start dev server: `npm run dev` (Runs `tsx server.ts` on port 3000).
- Build for production: `npm run build` (Vite build + esbuild bundling `server.ts` to `dist/server.cjs`).
- Type check: `npm run lint` (runs `tsc --noEmit`).

## 🎯 Development Principles for Antigravity
1. **Respect Privacy**: Never introduce server-side database storage for personal pools unless explicitly asked. Always keep `localStorage` as the source of truth for user pools.
2. **Vietnamese Localization**: Keep all player-facing text, champion titles, lane advice, and AI prompts in idiomatic Vietnamese.
3. **AI Conciseness**: The Gemini AI Coach must produce concise, structured, bulleted advice under 120 words focusing on lane match-up, risks to dodge, and key combos.
4. **Icons**: Always import icons from `lucide-react`.
