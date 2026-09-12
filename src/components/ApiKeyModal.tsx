import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, ExternalLink, X, ShieldCheck, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  onRemoveKey: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  onRemoveKey,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  useEffect(() => {
    setInputKey(apiKey || '');
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (trimmed) {
      onSaveKey(trimmed);
      setCopiedSuccess(true);
      setTimeout(() => {
        setCopiedSuccess(false);
        onClose();
      }, 700);
    }
  };

  const handleClear = () => {
    onRemoveKey();
    setInputKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cài Đặt API Key Gemini</h2>
              <p className="text-xs text-slate-400">Sử dụng để phân tích kèo đấu & gợi ý cấm chọn bằng AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-3 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span>API Key của bạn được lưu <strong>100% cục bộ trên trình duyệt (Local Storage)</strong> và chỉ dùng để gọi trực tiếp tới mô hình Gemini khi bạn yêu cầu phân tích.</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
              Gemini API Key của bạn <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                required
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 pr-10 text-xs font-mono text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title={showKey ? 'Ẩn key' : 'Hiện key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Guide link */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Chưa có API key?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold hover:underline"
            >
              <span>Lấy key miễn phí tại Google AI Studio</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {copiedSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Đã lưu API Key thành công!</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {apiKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa Key</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={!inputKey.trim()}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 shadow-md shadow-amber-500/20"
              >
                Lưu API Key
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
