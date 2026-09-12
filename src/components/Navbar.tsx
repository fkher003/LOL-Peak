import React from 'react';
import { Shield, Swords, BookOpen, Key, Github, Star } from 'lucide-react';

interface NavbarProps {
  activeTab: 'counter' | 'personal';
  setActiveTab: (tab: 'counter' | 'personal') => void;
  personalCount: number;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  riotVersion?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  personalCount,
  hasApiKey,
  onOpenApiKeyModal,
  riotVersion,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40">
            <Swords className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                LOL Counter &amp; Pool
              </span>
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                PRO
              </span>
              {riotVersion && (
                <span className="hidden md:inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                  Riot Data v{riotVersion}
                </span>
              )}
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Dữ liệu tướng từ Riot Games • Bể tướng lưu cục bộ • Phân tích AI Gemini
            </p>
          </div>
        </div>

        {/* Right section: Tabs & API Key Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('counter')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm sm:px-3.5 sm:py-2 ${
                activeTab === 'counter'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Gợi Ý Khắc Chế</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm sm:px-3.5 sm:py-2 ${
                activeTab === 'personal'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Bể Tướng Cá Nhân</span>
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                  activeTab === 'personal'
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {personalCount}
              </span>
            </button>
          </nav>

          {/* GitHub Star Button */}
          <a
            href="https://github.com/fkher003/LOL-Peak"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-amber-500/50 hover:bg-slate-700 hover:text-white transition-all shadow-xs group"
            title="Ủng hộ dự án 1 Star trên GitHub!"
          >
            <Github className="h-4 w-4 text-slate-300 group-hover:text-white transition-colors" />
            <span className="hidden sm:inline font-bold">GitHub</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-300 shadow-xs">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              Star
            </span>
          </a>

          {/* User API Key Button */}
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              hasApiKey
                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30'
                : 'border-amber-500/40 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30 animate-pulse'
            }`}
            title={hasApiKey ? 'API Key đã lưu (Click để đổi)' : 'Nhập API Key Gemini để dùng AI'}
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{hasApiKey ? 'API Key: Đã lưu' : 'Nhập API Key'}</span>
            <span
              className={`h-2 w-2 rounded-full ${
                hasApiKey ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

