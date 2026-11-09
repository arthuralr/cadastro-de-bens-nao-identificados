import React from 'react';
import { CheckCircle2, PlusCircle, ArrowRight, Camera } from 'lucide-react';

interface SuccessBannerProps {
  isOpen: boolean;
  onNext: () => void;
  assetDescription: string;
  location: string;
  photosCount: number;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({
  isOpen,
  onNext,
  assetDescription,
  location,
  photosCount,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onNext}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícone de Sucesso */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Título & Mensagem */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Item Registrado com Sucesso!
          </h3>
          <p className="text-xs text-slate-500">
            Os dados e fotos foram convertidos e transmitidos para o webhook.
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
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              {photosCount} foto(s)
            </span>
          </div>
        </div>

        {/* Botão Principal de Próxima Coleta */}
        <button
          type="button"
          onClick={onNext}
          autoFocus
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Registrar Próximo Bem</span>
          <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
        </button>
      </div>
    </div>
  );
};
