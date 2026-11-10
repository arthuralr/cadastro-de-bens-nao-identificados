import React from 'react';
import { CheckCircle2, PlusCircle, ArrowRight, Camera, CloudOff } from 'lucide-react';

interface SuccessBannerProps {
  isOpen: boolean;
  onNext: () => void;
  onBackToMenu?: () => void;
  assetDescription: string;
  location: string;
  photosCount: number;
  isOfflineSaved?: boolean;
  customMessage?: string;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({
  isOpen,
  onNext,
  onBackToMenu,
  assetDescription,
  location,
  photosCount,
  isOfflineSaved = false,
  customMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onNext}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícone de Sucesso */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner ${
          isOfflineSaved ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          {isOfflineSaved ? (
            <CloudOff className="w-9 h-9" />
          ) : (
            <CheckCircle2 className="w-9 h-9" />
          )}
        </div>

        {/* Título & Mensagem */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {isOfflineSaved ? 'Salvo Offline com Sucesso!' : 'Item Registrado com Sucesso!'}
          </h3>
          <p className="text-xs text-slate-600">
            {customMessage || (
              isOfflineSaved
                ? 'Salvo offline. Será sincronizado quando houver ligação.'
                : 'Os dados e fotos foram convertidos e transmitidos para o webhook.'
            )}
          </p>
        </div>

        {/* Card Resumo do que foi coletado */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-1.5">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Último Registro
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {assetDescription || 'Item sem descrição'}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
            <span>📍 {location || 'Sem local informado'}</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Camera className="w-3.5 h-3.5 text-[#ff7a7a]" />
              {photosCount} foto(s)
            </span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onNext}
            autoFocus
            className="w-full py-3.5 px-5 bg-[#ff7a7a] hover:bg-[#f26a6a] active:bg-[#e85a5a] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#ff7a7a]/25 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Próximo Bem</span>
            <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
          </button>

          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="w-full py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Voltar ao Menu Inicial</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
