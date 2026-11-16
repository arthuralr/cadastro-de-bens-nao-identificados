import React from 'react';
import { Smartphone, ExternalLink } from 'lucide-react';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.betha.patrimonio&hl=pt_BR';

export const AppBethaBanner: React.FC = () => {
  const handleOpenPlayStore = () => {
    window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-[#1f2937] text-[#ff7a7a] flex items-center justify-center shrink-0 shadow-2xs border border-gray-700/60">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Betha Patrimônio
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#ff7a7a]/15 text-[#ff7a7a] border border-[#ff7a7a]/30">
              App Oficial
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            Google Play · com.betha.patrimonio
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleOpenPlayStore}
        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#ff7a7a] hover:bg-[#f26a6a] active:bg-[#e85a5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs shadow-[#ff7a7a]/20 transition-all active:scale-[0.98] shrink-0 cursor-pointer"
      >
        <span>Abrir na Play Store</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
