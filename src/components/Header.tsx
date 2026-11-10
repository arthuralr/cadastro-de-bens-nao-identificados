import React, { useState, useEffect } from 'react';
import { PackageSearch, Settings, History, Wifi, WifiOff, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  collectedCount: number;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  isConfigured: boolean;
  currentView?: 'menu' | 'sobra' | 'inservivel';
  onBackToMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  collectedCount,
  onOpenHistory,
  onOpenSettings,
  isConfigured,
  currentView = 'menu',
  onBackToMenu,
}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#1f2937] text-white border-b border-gray-700/70 shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Marca / Identidade Betha Patrimônio */}
        <div className="flex items-center gap-2.5">
          {currentView !== 'menu' && onBackToMenu ? (
            <button
              type="button"
              onClick={onBackToMenu}
              className="w-10 h-10 rounded-xl bg-gray-700/80 hover:bg-gray-700 text-[#ff7a7a] flex items-center justify-center transition-all active:scale-95 border border-gray-600/50 shrink-0"
              title="Voltar ao Menu Inicial"
              aria-label="Voltar ao Menu Inicial"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#ff7a7a] flex items-center justify-center text-white shadow-sm shrink-0">
              <PackageSearch className="w-5 h-5 text-white" />
            </div>
          )}

          <div>
            <h1 className="text-base font-bold tracking-tight leading-none text-white flex items-center gap-2">
              Patrimônio
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-[#ff7a7a]/20 text-[#ff7a7a] border border-[#ff7a7a]/30">
                Cloud
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">
              {currentView === 'menu'
                ? 'Coleta de Inventário em Campo'
                : currentView === 'sobra'
                ? 'Bem Não Cadastrado (Sobra)'
                : 'Registo de Bem Inservível'}
            </p>
          </div>
        </div>

        {/* Ações da Barra Superior */}
        <div className="flex items-center gap-1.5">
          {/* Indicador de Conexão */}
          <div 
            className="flex items-center justify-center w-8 h-8 rounded-xl text-xs"
            title={isOnline ? 'Conexão ativa' : 'Sem conexão com a internet'}
          >
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400" />
            )}
          </div>

          {/* Botão de Histórico da Sessão */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-gray-700/70 hover:bg-gray-700 text-gray-200 transition-colors active:scale-95 border border-gray-600/50"
            title="Ver histórico desta sessão"
            aria-label="Histórico de coletas"
          >
            <History className="w-4 h-4 text-[#ff7a7a]" />
            <span className="hidden xs:inline">Histórico</span>
            {collectedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#ff7a7a] text-[10px] font-bold text-white shadow-xs">
                {collectedCount}
              </span>
            )}
          </button>

          {/* Botão de Configuração de Webhook */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`relative p-2 rounded-xl text-xs font-medium transition-colors active:scale-95 border ${
              !isConfigured
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-gray-700/70 text-gray-300 hover:bg-gray-700 border-gray-600/50'
            }`}
            title="Configurar URL do Webhook"
            aria-label="Configurar Webhook"
          >
            <Settings className="w-4 h-4" />
            {!isConfigured && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff7a7a] rounded-full ring-2 ring-[#1f2937]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
