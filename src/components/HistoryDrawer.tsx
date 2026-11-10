import React, { useState } from 'react';
import { History, X, CheckCircle2, AlertCircle, Trash2, Copy, Check } from 'lucide-react';
import { HistoryRecord } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: HistoryRecord[];
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#ff7a7a]/15 text-[#ff7a7a] rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Histórico de Coletas
              </h2>
              <p className="text-xs text-slate-500">
                {records.length === 0
                  ? 'Nenhum item registrado ainda'
                  : `${records.length} item(ns) coletado(s) nesta sessão`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Registros */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[60vh]">
          {records.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">Nenhum bem coletado ainda</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Quando você preencher o formulário e enviar, o histórico ficará listado aqui para conferência.
              </p>
            </div>
          ) : (
            records.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        item.tipo === 'inservivel' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-[#ff7a7a]/15 text-[#ff7a7a] border border-[#ff7a7a]/25'
                      }`}>
                        {item.tipo === 'inservivel' ? 'Inservível' : 'Sobra'}
                      </span>
                      {item.estado_conservacao && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/80 px-1.5 py-0.2 rounded">
                          {item.estado_conservacao}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {item.descricao}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      📍 {item.localizacao || 'Local não especificado'}
                    </p>
                  </div>

                  {item.status === 'sucesso' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Enviado
                    </span>
                  ) : item.status === 'simulado' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full shrink-0">
                      Simulado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full shrink-0">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Falhou
                    </span>
                  )}
                </div>

                {/* Previews de Fotos do Item */}
                {item.fotosPreviews && item.fotosPreviews.length > 0 && (
                  <div className="flex gap-1.5 pt-1">
                    {item.fotosPreviews.map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt={`Preview ${i + 1}`}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {item.totalFotos} foto(s)</span>
                  
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, JSON.stringify(item, null, 2))}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {records.length > 0 ? (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar histórico</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
