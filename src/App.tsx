/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Loader2, 
  FileText, 
  Tag, 
  AlertCircle, 
  MapPin, 
  ChevronDown, 
  Settings, 
  RotateCcw
} from 'lucide-react';

import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { SuccessBanner } from './components/SuccessBanner';
import { WebhookSettingsModal } from './components/WebhookSettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';

import { PhotoAttachment, HistoryRecord, WebhookPayload } from './types';
import { 
  getActiveWebhookUrl, 
  STORAGE_KEYS, 
  LOCAIS_PREDEFINIDOS,
  ESTADOS_CONSERVACAO 
} from './config';

export default function App() {
  // Form States
  const [localizacao, setLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [estadoConservacao, setEstadoConservacao] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [fotos, setFotos] = useState<PhotoAttachment[]>([]);

  // App UI & Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<{
    descricao: string;
    localizacao: string;
    photosCount: number;
  }>({ descricao: '', localizacao: '', photosCount: 0 });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeWebhook, setActiveWebhook] = useState(() => getActiveWebhookUrl());

  // History stored in localStorage
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const descricaoInputRef = useRef<HTMLInputElement>(null);

  // Persist history changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Erro ao salvar histórico localmente:', e);
    }
  }, [history]);

  // Resetar formulário para a próxima coleta
  const handleResetForm = () => {
    setLocalizacao('');
    setDescricao('');
    setObservacoes('');
    setFotos([]);
    setValidationError(null);
    setErrorMessage(null);
    setEstadoConservacao('');
    
    // Foco imediato no campo de descrição para a próxima coleta
    setTimeout(() => {
      descricaoInputRef.current?.focus();
    }, 150);
  };

  // Limpeza total de todos os campos
  const handleClearAll = () => {
    setLocalizacao('');
    setDescricao('');
    setEstadoConservacao('');
    setObservacoes('');
    setFotos([]);
    setValidationError(null);
    setErrorMessage(null);
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setErrorMessage(null);

    // Validação obrigatória da Localização (select)
    if (!localizacao.trim()) {
      setValidationError('Por favor, selecione uma localização obrigatória.');
      return;
    }

    // Validação obrigatória da Descrição do Bem
    if (!descricao.trim()) {
      setValidationError('A descrição do bem é obrigatória para identificação.');
      descricaoInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    const registroId = `PAT-${Date.now().toString(36).toUpperCase()}`;
    const timestampAtual = new Date().toISOString();

    // Se houver estado de conservação selecionado, concatena suavemente nas observações
    const observacoesFinais = [
      estadoConservacao ? `[Estado: ${estadoConservacao}]` : '',
      observacoes.trim()
    ].filter(Boolean).join('\n');

    // Montagem do payload exato exigido pelo Webhook:
    // { "localizacao": "string", "descricao": "string", "observacoes": "string", "fotos": ["string_base64", ...] }
    const payload: WebhookPayload = {
      localizacao: localizacao.trim(),
      descricao: descricao.trim(),
      observacoes: observacoesFinais,
      fotos: fotos.map((f) => f.base64), // Apenas as strings Base64
    };

    let envioStatus: 'sucesso' | 'erro' | 'simulado' = 'sucesso';
    let respostaTexto = '';

    try {
      const webhookUrl = getActiveWebhookUrl();

      // Envio POST para a URL configurada
      // 1. 'text/plain;charset=utf-8' evita preflight OPTIONS de CORS no navegador
      // 2. 'no-cors' permite entrega segura no Google Apps Script
      // 3. O corpo é a string JSON que o script lê via JSON.parse(e.postData.contents)
      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      // Em modo no-cors, o navegador retorna tipo 'opaque' com status 0 por segurança
      if (response.ok || response.type === 'opaque' || response.status === 0 || response.status === 200) {
        respostaTexto = 'Entregue com sucesso ao Webhook';
        envioStatus = 'sucesso';
      } else {
        throw new Error(`Servidor respondeu com status ${response.status}`);
      }

      // Haptic feedback no celular se disponível
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {
          // ignore
        }
      }

      // Gravar no histórico
      const novoRegistro: HistoryRecord = {
        id: registroId,
        timestamp: timestampAtual,
        localizacao: localizacao.trim(),
        descricao: descricao.trim(),
        totalFotos: fotos.length,
        status: envioStatus,
        respostaWebhook: respostaTexto,
        fotosPreviews: fotos.map((f) => f.base64 || f.previewUrl),
      };

      setHistory((prev) => [novoRegistro, ...prev]);

      // Guardar resumo para o banner
      setLastSubmitted({
        descricao: descricao.trim(),
        localizacao: localizacao.trim(),
        photosCount: fotos.length,
      });

      // Exibir modal de sucesso e limpar formulário
      setShowSuccessModal(true);
      handleResetForm();
    } catch (err: unknown) {
      console.error('Falha ao enviar webhook:', err);
      const errorStr = err instanceof Error ? err.message : String(err);
      
      const mensagemAmigavel = `Não foi possível enviar para o webhook: ${errorStr}`;
      setErrorMessage(mensagemAmigavel);

      // Também registra tentativa no histórico como falha
      const registroFalha: HistoryRecord = {
        id: registroId,
        timestamp: timestampAtual,
        localizacao: localizacao.trim(),
        descricao: descricao.trim(),
        totalFotos: fotos.length,
        status: 'erro',
        respostaWebhook: errorStr,
        fotosPreviews: fotos.map((f) => f.base64 || f.previewUrl),
      };
      setHistory((prev) => [registroFalha, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfigured = !activeWebhook.includes('YOUR_SCRIPT_ID') && !activeWebhook.includes('placeholder');

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col text-slate-800">
      {/* Barra de Topo */}
      <Header
        collectedCount={history.length}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        isConfigured={isConfigured}
      />

      {/* Conteúdo Principal (Mobile-First Canvas) */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 pb-20">
        
        {/* Card do Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 space-y-5">
          
          {/* Título de Seção & Ação de Limpar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Nova Coleta de Bem
              </h2>
              <p className="text-xs text-slate-500">
                Item encontrado sem identificação patrimonial
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              title="Limpar todos os campos"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          </div>

          {/* CAMPO 1: LOCALIZAÇÃO (MENU PENDENTE SELECT OBRIGATÓRIO) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="localizacao-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Localização <span className="text-[#ff7a7a]">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Obrigatório</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-5 h-5 text-[#ff7a7a]" />
              </div>

              <select
                id="localizacao-select"
                required
                value={localizacao}
                onChange={(e) => {
                  setLocalizacao(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className={`w-full pl-11 pr-10 py-3.5 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm shadow-2xs transition-all font-medium appearance-none cursor-pointer ${
                  !localizacao ? 'text-slate-400' : 'text-slate-900'
                } ${
                  validationError && !localizacao
                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                    : 'border-slate-300 focus:ring-[#ff7a7a] focus:border-[#ff7a7a]'
                }`}
              >
                <option value="" disabled>
                  Selecione a localização...
                </option>
                {LOCAIS_PREDEFINIDOS.map((loc) => (
                  <option key={loc} value={loc} className="text-slate-900">
                    {loc}
                  </option>
                ))}
              </select>

              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* CAMPO 2: DESCRIÇÃO DO BEM (OBRIGATÓRIO) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="descricao-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Descrição do Bem <span className="text-[#ff7a7a]">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Obrigatório</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-5 h-5 text-[#ff7a7a]" />
              </div>
              <input
                id="descricao-input"
                ref={descricaoInputRef}
                type="text"
                required
                value={descricao}
                onChange={(e) => {
                  setDescricao(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Ex: Cadeira giratória estofada preta, Monitor Dell 24..."
                className={`w-full pl-11 pr-3 py-3.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 text-base shadow-2xs transition-all font-medium ${
                  validationError && !descricao.trim()
                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                    : 'border-slate-300 focus:ring-[#ff7a7a] focus:border-[#ff7a7a]'
                }`}
              />
            </div>
          </div>

          {/* ESTADO DE CONSERVAÇÃO (OPCIONAL) */}
          <div className="space-y-1">
            <label htmlFor="estado-select" className="block text-[11px] font-bold text-slate-600 uppercase">
              Estado de Conservação (Opcional)
            </label>
            <div className="relative">
              <select
                id="estado-select"
                value={estadoConservacao}
                onChange={(e) => setEstadoConservacao(e.target.value)}
                className="w-full py-2.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#ff7a7a] focus:border-[#ff7a7a] appearance-none cursor-pointer"
              >
                <option value="">Selecione o estado...</option>
                {ESTADOS_CONSERVACAO.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* CAMPO 3: OBSERVAÇÕES */}
          <div className="space-y-1.5">
            <label htmlFor="observacoes-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>3. Observações</span>
              <span className="text-[11px] text-slate-400 font-normal">Opcional</span>
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-400">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <textarea
                id="observacoes-input"
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Marca HP, número de série gravado no chassi: SN-84920. Sem plaqueta de patrimônio metálica visível."
                className="w-full pl-11 pr-3 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7a7a] focus:border-[#ff7a7a] text-sm shadow-2xs transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* CAMPO 4: FOTOS (CÂMERA / GALERIA - ATÉ 3 FOTOS COM PREVIEW) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Fotos do Bem (Até 3)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {fotos.length}/3 fotos
              </span>
            </div>

            <PhotoUploader
              photos={fotos}
              onChange={setFotos}
              maxPhotos={3}
            />
          </div>

          {/* Mensagem de Erro de Validação */}
          {validationError && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </p>
          )}

          {/* MENSAGEM DE ERRO GERAL SE HOUVER */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Erro no Envio para o Webhook</span>
              </div>
              <p className="leading-relaxed text-[11px]">{errorMessage}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="px-3 py-1.5 bg-[#ff7a7a] hover:bg-[#f26a6a] text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Ajustar URL do Webhook</span>
                </button>
              </div>
            </div>
          )}

          {/* BOTÃO PRINCIPAL DE SALVAR/ENVIAR (GRANDE, TÁTIL PARA CAMPO) */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-sm min-h-[56px] active:scale-[0.98] ${
                isSubmitting
                  ? 'bg-[#ff7a7a]/60 text-white cursor-wait'
                  : 'bg-[#ff7a7a] hover:bg-[#f26a6a] active:bg-[#e85a5a] text-white shadow-[#ff7a7a]/25'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin shrink-0" />
                  <span>Convertendo fotos e enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 shrink-0" />
                  <span>Salvar e Enviar Bem</span>
                </>
              )}
            </button>
          </div>

        </form>
      </main>

      {/* Modal de Sucesso */}
      <SuccessBanner
        isOpen={showSuccessModal}
        onNext={() => setShowSuccessModal(false)}
        assetDescription={lastSubmitted.descricao}
        location={lastSubmitted.localizacao}
        photosCount={lastSubmitted.photosCount}
      />

      {/* Modal de Configuração do Webhook */}
      <WebhookSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onUrlUpdated={(url) => setActiveWebhook(url)}
      />

      {/* Drawer de Histórico de Coletas */}
      <HistoryDrawer
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        records={history}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
}
