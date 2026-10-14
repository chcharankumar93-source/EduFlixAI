import { useState } from 'react';
import { Key, X } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

type ApiKeyModalProps = {
  currentKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
};

export function ApiKeyModal({ currentKey, onSave, onClose }: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState(currentKey);
  useEscapeKey(onClose);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-title"
    >
      <div className="bg-[#181818] rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 id="api-key-title" className="font-bold text-lg flex items-center gap-2">
            <Key className="w-5 h-5 text-[#E50914]" /> Gemini API Key
          </h3>
          <button onClick={onClose} aria-label="Close API key dialog" className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Enter a free Google Gemini API key for real AI-generated courses. Without a key, courses are generated locally.
        </p>
        <input
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          placeholder="AIza..."
          aria-label="Gemini API key"
          className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded text-sm focus:border-[#E50914] outline-none mb-3"
        />
        <div className="flex gap-2">
          <button
            onClick={() => { onSave(keyInput.trim()); onClose(); }}
            className="flex-1 py-2.5 bg-[#E50914] rounded font-bold text-sm hover:bg-[#f6121d] transition"
          >
            Save Key
          </button>
          {currentKey && (
            <button
              onClick={() => { onSave(''); setKeyInput(''); }}
              className="px-4 py-2.5 bg-white/10 rounded text-sm font-bold hover:bg-white/20 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
