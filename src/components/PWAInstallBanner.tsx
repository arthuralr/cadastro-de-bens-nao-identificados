import React, { useState } from 'react';
import { Download, Smartphone, X, Share2, Check } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  if (isInstalled || isDismissed) {
    return null;
  }

  // If not installable and not iOS, we can still provide a helpful install hint or suppress
  const canShow = isInstallable || isIOS;
  if (!canShow) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1f2937] to-slate-800 rounded-2xl border border-gray-700/80 p-4 text-white shadow-md animate-in fade-in duration-200">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
          title="Ocultar aviso de instalação"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-10 h-10 rounded-xl bg-[#ff7a7a] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Smartphone className="w-5 h-5 text-white" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white leading-tight">
                Instalar a Aplicação
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PWA Offline
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Adicione ao ecrã inicial do seu telemóvel para aceder em tela cheia e coletar bens em campo mesmo sem sinal de rede.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff7a7a] hover:bg-[#f26a6a] active:bg-[#e85a5a] text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instalar a Aplicação</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guia de Instalação para iOS Safari */}
      {showIOSGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ff7a7a]/15 text-[#ff7a7a] flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                Como Instalar no iPhone / iPad
              </h4>
              <p className="text-xs text-slate-500">
                Siga os dois passos simples no navegador Safari:
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#ff7a7a] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="leading-snug pt-0.5">
                  Toque no botão de <strong>Partilhar</strong> (<Share2 className="w-3.5 h-3.5 inline text-blue-600 -mt-0.5" />) na barra inferior do Safari.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#ff7a7a] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <p className="leading-snug pt-0.5">
                  Role para baixo na lista e selecione <strong>Adicionar ao Ecrã Principal</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 bg-[#ff7a7a] hover:bg-[#f26a6a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Entendido</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
