import React, { useState } from 'react';
import { CloudUpload, Loader2, AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';
import { PendingRecord, removePendingRecord } from '../utils/offlineDb';
import { getActiveWebhookUrl } from '../config';

interface PendingSyncBannerProps {
  pendingRecords: PendingRecord[];
  isOnline: boolean;
  onSyncComplete: () => void;
  onRecordSynced?: (id: string) => void;
}

export const PendingSyncBanner: React.FC<PendingSyncBannerProps> = ({
  pendingRecords,
  isOnline,
  onSyncComplete,
  onRecordSynced,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (pendingRecords.length === 0) {
    return null;
  }

  const handleSyncNow = async () => {
    if (!isOnline) {
      setSyncFeedback({
        type: 'error',
        message: 'Dispositivo sem ligação à internet. Conecte-se para sincronizar.',
      });
      setTimeout(() => setSyncFeedback(null), 4000);
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(null);
    const total = pendingRecords.length;
    const webhookUrl = getActiveWebhookUrl();
    let sucessos = 0;
    let falhas = 0;

    for (let i = 0; i < total; i++) {
      const record = pendingRecords[i];
      setSyncProgress({ current: i + 1, total });

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(record.payload),
        });

        // Verificação compatível com preflight no-cors (opaque / status 0)
        if (response.ok || response.type === 'opaque' || response.status === 0 || response.status === 200) {
          await removePendingRecord(record.id);
          sucessos++;
          if (onRecordSynced) {
            onRecordSynced(record.id);
          }
        } else {
          falhas++;
        }
      } catch (err) {
        console.error(`Falha ao sincronizar registro ${record.id}:`, err);
        falhas++;
      }
    }

    setIsSyncing(false);
    setSyncProgress(null);
    onSyncComplete();

    if (falhas === 0) {
      setSyncFeedback({
        type: 'success',
        message: `Todos os ${sucessos} registo(s) foram sincronizados com sucesso!`,
      });
    } else {
      setSyncFeedback({
        type: 'error',
        message: `${sucessos} registo(s) sincronizado(s). ${falhas} falha(s). Verifique a conexão e tente novamente.`,
      });
    }

    setTimeout(() => {
      setSyncFeedback(null);
    }, 5000);
  };

  const count = pendingRecords.length;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <span>{count} {count === 1 ? 'registo pendente de envio' : 'registos pendentes de envio'}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300">
                IndexedDB
              </span>
            </h3>
            <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
              Coletados enquanto o dispositivo estava offline com fotos em Base64 armazenadas no aparelho.
            </p>
          </div>
        </div>
      </div>

      {syncFeedback && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}
        >
          {syncFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <WifiOff className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span className="font-medium">{syncFeedback.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 border-t border-amber-200/60">
        <div className="text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{isOnline ? 'Pronto para transmitir' : 'Aguardando conexão com a internet'}</span>
        </div>

        <button
          type="button"
          onClick={handleSyncNow}
          disabled={isSyncing || (!isOnline && false)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98] ${
            isSyncing
              ? 'bg-amber-600 text-white cursor-wait'
              : !isOnline
              ? 'bg-amber-200 text-amber-800 hover:bg-amber-300 cursor-pointer'
              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 cursor-pointer'
          }`}
          title={!isOnline ? 'Conecte-se à internet para sincronizar' : 'Enviar todos os registros pendentes ao Webhook'}
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>
                {syncProgress
                  ? `Sincronizando ${syncProgress.current} de ${syncProgress.total}...`
                  : 'Sincronizando...'}
              </span>
            </>
          ) : (
            <>
              <CloudUpload className="w-4 h-4 shrink-0" />
              <span>Sincronizar Agora</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
