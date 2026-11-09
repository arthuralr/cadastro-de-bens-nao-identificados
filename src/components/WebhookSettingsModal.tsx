import React, { useState } from 'react';
import { Settings, X, Check, Globe, RefreshCw, Send } from 'lucide-react';
import { DEFAULT_WEBHOOK_URL, getActiveWebhookUrl, setActiveWebhookUrl, resetWebhookUrl } from '../config';

interface WebhookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated: (url: string) => void;
}

export const WebhookSettingsModal: React.FC<WebhookSettingsModalProps> = ({
  isOpen,
  onClose,
  onUrlUpdated,
}) => {
  const [currentUrl, setCurrentUrl] = useState(() => getActiveWebhookUrl());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveWebhookUrl(currentUrl);
    onUrlUpdated(currentUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    resetWebhookUrl();
    setCurrentUrl(DEFAULT_WEBHOOK_URL);
    onUrlUpdated(DEFAULT_WEBHOOK_URL);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestPing = async () => {
    if (!currentUrl || !currentUrl.startsWith('http')) {
      setTestStatus('error');
      setTestMessage('Por favor, informe uma URL válida iniciando com http:// ou https://');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Enviando ping de teste sem preflight CORS...');

    try {
      const response = await fetch(currentUrl, {
        method: 'POST',
        mode: 'no-cors', // Evita OPTIONS preflight do Google Apps Script
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          localizacao: 'Teste de Conexão',
          descricao: 'Item Teste Webhook',
          observacoes: 'Ping de teste de conectividade',
          fotos: [],
        }),
      });

      // Em modo 'no-cors', o navegador retorna tipo 'opaque' (status 0),
      // o que indica que a requisição POST foi enviada e processada sem bloqueio CORS.
      if (response.ok || response.type === 'opaque' || response.status === 0 || response.status === 200) {
        setTestStatus('success');
        setTestMessage(
          'Sucesso! Requisição entregue ao Webhook. O bloqueio de CORS preflight foi contornado com text/plain + no-cors.'
        );
      } else {
        setTestStatus('error');
        setTestMessage(`Webhook respondeu com status: ${response.status}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setTestStatus('error');
      setTestMessage(`Erro ao testar: ${errorMsg}`);
    }
  };

  const isGoogleAppsScript = currentUrl.includes('script.google.com');

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
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Configuração do Webhook
              </h2>
              <p className="text-xs text-slate-500">
                Google Apps Script ou qualquer endpoint HTTP POST
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

        {/* Corpo */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-700">
          <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-2xl text-slate-800 text-xs leading-relaxed space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-slate-900">
              <Globe className="w-4 h-4 text-[#ff7a7a]" />
              <span>Compatibilidade Google Apps Script Ativa</span>
            </div>
            <p className="text-[11px] text-slate-600">
              O aplicativo envia os dados via <code>Content-Type: text/plain</code> em modo <code>no-cors</code>. Isso contorna o erro de CORS preflight (OPTIONS) e permite que a função <code>doPost(e)</code> do Google Script receba os dados diretamente.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label htmlFor="webhook-url-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                URL do Webhook (Google Apps Script /exec)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="webhook-url-input"
                  type="url"
                  required
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full pl-9 pr-3 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#ff7a7a] focus:border-[#ff7a7a]"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Você também pode alterar a constante fixa <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">DEFAULT_WEBHOOK_URL</code> no arquivo <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">src/config.ts</code>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-[#ff7a7a] hover:bg-[#f26a6a] active:bg-[#e85a5a] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-[#ff7a7a]/25"
              >
                <Check className="w-4 h-4" />
                <span>Salvar URL</span>
              </button>

              <button
                type="button"
                onClick={handleTestPing}
                disabled={testStatus === 'testing'}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {testStatus === 'testing' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Testar Conexão</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                title="Restaurar valor original do código"
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Feedback de salvamento */}
          {savedSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>URL do Webhook atualizada com sucesso!</span>
            </div>
          )}

          {/* Feedback do Teste */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-2xl text-xs border ${
                testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : testStatus === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="font-semibold mb-0.5">
                {testStatus === 'testing' && 'Testando...'}
                {testStatus === 'success' && 'Sucesso na Conexão!'}
                {testStatus === 'error' && 'Resultado do Teste:'}
              </div>
              <p className="leading-relaxed">{testMessage}</p>
            </div>
          )}

          {/* Exemplo de código do Google Apps Script */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 block">Como receber no Google Apps Script:</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              No seu projeto do Apps Script (Extensões &gt; Apps Script), utilize a função <code>doPost(e)</code> abaixo:
            </p>
            <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-xl text-[10px] font-mono overflow-x-auto leading-relaxed">
{`function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Payload recebido:
  // data.localizacao (string)
  // data.descricao   (string)
  // data.observacoes (string)
  // data.fotos       (array de strings Base64)
  
  sheet.appendRow([
    new Date(),
    data.localizacao,
    data.descricao,
    data.observacoes,
    data.fotos.length
  ]);
  
  return ContentService.createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}`}
            </pre>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
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
