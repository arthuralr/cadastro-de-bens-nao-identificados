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
  ChevronRight, 
  RotateCcw,
  ArrowLeft,
  PackagePlus,
  PackageX,
  History,
  AlertTriangle,
  Download
} from 'lucide-react';

import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { SuccessBanner } from './components/SuccessBanner';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PendingSyncBanner } from './components/PendingSyncBanner';

import { PhotoAttachment, HistoryRecord, WebhookPayload, BeforeInstallPromptEvent } from './types';
import { 
  getActiveWebhookUrl, 
  STORAGE_KEYS, 
  LOCAIS_PREDEFINIDOS,
  ESTADOS_CONSERVACAO,
  CLASSIFICACOES_INSERVIVEL
} from './config';
import { useOnlineStatus } from './utils/useOnlineStatus';
import { 
  savePendingRecord, 
  getPendingRecords, 
  PendingRecord 
} from './utils/offlineDb';

type AppView = 'menu' | 'sobra' | 'inservivel';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<AppView>('menu');

  // Form States
  const [localizacao, setLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [estadoConservacao, setEstadoConservacao] = useState<string>('');
  const [classificacaoEstado, setClassificacaoEstado] = useState<string>('');
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

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Conexão e armazenamento offline
  const isOnline = useOnlineStatus();
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

  // Estado e captura do evento de instalação PWA (beforeinstallprompt)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  // Escuta o evento beforeinstallprompt do navegador
  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(standalone);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      // Impede o banner padrão automático e armazena o evento
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Ação de instalação chamada ao clicar no botão de destaque
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
      }
    } catch (err) {
      console.error('Erro ao acionar prompt de instalação:', err);
    } finally {
      // Esconde o botão após a interação do utilizador
      setDeferredPrompt(null);
    }
  };

  // Carregar e sincronizar contagem de registros pendentes no IndexedDB
  const refreshPending = async () => {
    try {
      const records = await getPendingRecords();
      setPendingRecords(records);
    } catch (e) {
      console.warn('Erro ao atualizar lista de pendentes:', e);
    }
  };

  useEffect(() => {
    refreshPending();
  }, []);

  // Quando um registro pendente é sincronizado com o Webhook
  const handleRecordSynced = (syncedId: string) => {
    setHistory((prev) =>
      prev.map((rec) =>
        rec.id === syncedId
          ? { ...rec, status: 'sucesso', respostaWebhook: 'Entregue com sucesso após sincronização' }
          : rec
      )
    );
  };

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

  // Resetar formulário para a próxima coleta mantendo a visualização atual
  const handleResetForm = () => {
    setLocalizacao('');
    setDescricao('');
    setObservacoes('');
    setFotos([]);
    setValidationError(null);
    setErrorMessage(null);
    setEstadoConservacao('');
    setClassificacaoEstado('');
    
    // Foco imediato no campo de descrição para a próxima coleta
    setTimeout(() => {
      descricaoInputRef.current?.focus();
    }, 150);
  };

  // Limpeza total dos campos
  const handleClearAll = () => {
    setLocalizacao('');
    setDescricao('');
    setEstadoConservacao('');
    setClassificacaoEstado('');
    setObservacoes('');
    setFotos([]);
    setValidationError(null);
    setErrorMessage(null);
  };

  // Trocar de tela
  const handleNavigate = (view: AppView) => {
    setValidationError(null);
    setErrorMessage(null);
    setCurrentView(view);
    if (view !== 'menu') {
      setTimeout(() => {
        descricaoInputRef.current?.focus();
      }, 200);
    }
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

    // Validação obrigatória específica para Bem Inservível
    if (currentView === 'inservivel' && !classificacaoEstado.trim()) {
      setValidationError('Por favor, selecione a Classificação do Estado do bem inservível.');
      return;
    }

    setIsSubmitting(true);

    const registroId = `PAT-${Date.now().toString(36).toUpperCase()}`;
    const timestampAtual = new Date().toISOString();

    // Montagem do payload de acordo com o tipo escolhido
    let payload: WebhookPayload;

    if (currentView === 'inservivel') {
      payload = {
        tipo: 'inservivel',
        localizacao: localizacao.trim(),
        descricao: descricao.trim(),
        estado_conservacao: classificacaoEstado.trim(),
        observacoes: observacoes.trim(),
        fotos: fotos.map((f) => f.base64),
      };
    } else {
      // Tipo 'sobra'
      const observacoesFinais = [
        estadoConservacao ? `[Estado: ${estadoConservacao}]` : '',
        observacoes.trim()
      ].filter(Boolean).join('\n');

      payload = {
        tipo: 'sobra',
        localizacao: localizacao.trim(),
        descricao: descricao.trim(),
        observacoes: observacoesFinais,
        fotos: fotos.map((f) => f.base64),
      };
    }

    // ========================================================
    // INTERCEPTAÇÃO OFFLINE: Se sem rede, guarda no IndexedDB
    // ========================================================
    if (!isOnline) {
      try {
        const savedOffline = await savePendingRecord(
          payload,
          fotos.map((f) => f.base64 || f.previewUrl)
        );

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch {
            // ignore
          }
        }

        const registroOffline: HistoryRecord = {
          id: savedOffline.id,
          tipo: currentView === 'inservivel' ? 'inservivel' : 'sobra',
          timestamp: timestampAtual,
          localizacao: localizacao.trim(),
          descricao: descricao.trim(),
          estado_conservacao: currentView === 'inservivel' ? classificacaoEstado.trim() : undefined,
          totalFotos: fotos.length,
          status: 'offline',
          respostaWebhook: 'Salvo offline no IndexedDB',
          fotosPreviews: fotos.map((f) => f.base64 || f.previewUrl),
        };

        setHistory((prev) => [registroOffline, ...prev]);

        setLastSubmitted({
          descricao: descricao.trim(),
          localizacao: localizacao.trim(),
          photosCount: fotos.length,
        });

        setIsOfflineSaved(true);
        setShowSuccessModal(true);
        handleResetForm();
        await refreshPending();
      } catch (errOffline) {
        console.error('Falha ao salvar offline:', errOffline);
        setErrorMessage('Não foi possível gravar os dados localmente no IndexedDB.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsOfflineSaved(false);

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
        tipo: currentView === 'inservivel' ? 'inservivel' : 'sobra',
        timestamp: timestampAtual,
        localizacao: localizacao.trim(),
        descricao: descricao.trim(),
        estado_conservacao: currentView === 'inservivel' ? classificacaoEstado.trim() : undefined,
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
        tipo: currentView === 'inservivel' ? 'inservivel' : 'sobra',
        timestamp: timestampAtual,
        localizacao: localizacao.trim(),
        descricao: descricao.trim(),
        estado_conservacao: currentView === 'inservivel' ? classificacaoEstado.trim() : undefined,
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

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col text-slate-800">
      {/* Barra de Topo */}
      <Header
        collectedCount={history.length}
        onOpenHistory={() => setShowHistoryModal(true)}
        currentView={currentView}
        onBackToMenu={() => handleNavigate('menu')}
        isOnline={isOnline}
      />

      {/* Conteúdo Principal (Mobile-First Canvas) */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 pb-20">
        
        {/* ======================================================== */}
        {/* TELA DE MENU INICIAL                                     */}
        {/* ======================================================== */}
        {currentView === 'menu' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Botão de Destaque: Instalar Aplicativo (PWA) */}
            {deferredPrompt && !isStandalone && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="w-full p-4 bg-[#1f2937] hover:bg-slate-800 text-white rounded-2xl border-2 border-[#ff7a7a] shadow-md transition-all active:scale-[0.98] text-left flex items-center justify-between group cursor-pointer animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-12 h-12 rounded-xl bg-[#ff7a7a] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-[#ff7a7a] transition-colors leading-snug">
                        Instalar Aplicativo
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#ff7a7a]/25 text-[#ff7a7a] border border-[#ff7a7a]/40">
                        PWA
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                      Instale no seu telemóvel para acesso rápido em tela cheia e coleta offline
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gray-700/70 group-hover:bg-[#ff7a7a] text-gray-300 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Download className="w-4 h-4" />
                </div>
              </button>
            )}

            {/* Banner de Sincronização de Registros Offline (IndexedDB) */}
            <PendingSyncBanner
              pendingRecords={pendingRecords}
              isOnline={isOnline}
              onSyncComplete={refreshPending}
              onRecordSynced={handleRecordSynced}
            />

            {/* Título de Boas-Vindas */}
            <div className="space-y-1 text-center sm:text-left py-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Selecione o Tipo de Registro
              </h2>
              <p className="text-xs text-slate-500">
                Escolha a operação patrimonial para iniciar a coleta em campo
              </p>
            </div>

            {/* BOTÃO 1: REGISTAR BEM NÃO CADASTRADO (SOBRA FÍSICA) */}
            <button
              type="button"
              onClick={() => handleNavigate('sobra')}
              className="w-full p-5 bg-white rounded-2xl border-2 border-slate-200/90 hover:border-[#ff7a7a] shadow-xs hover:shadow-md transition-all active:scale-[0.98] text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-start gap-3.5 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-xl bg-[#ff7a7a]/15 text-[#ff7a7a] group-hover:bg-[#ff7a7a] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                  <PackagePlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#ff7a7a] transition-colors leading-snug">
                    Registar Bem Não Cadastrado (Sobra Física)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Itens patrimoniais encontrados sem plaqueta de tombamento para inventário.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#ff7a7a] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* BOTÃO 2: REGISTAR BEM INSERVÍVEL */}
            <button
              type="button"
              onClick={() => handleNavigate('inservivel')}
              className="w-full p-5 bg-white rounded-2xl border-2 border-slate-200/90 hover:border-[#ff7a7a] shadow-xs hover:shadow-md transition-all active:scale-[0.98] text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-start gap-3.5 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                  <PackageX className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                    Registar Bem Inservível
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Classificação de bens ociosos, recuperáveis, antieconômicos ou sucata.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Resumo da Sessão */}
            <div className="p-4 bg-white/70 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#ff7a7a]" />
                <span>
                  {history.length === 0
                    ? 'Nenhum registro efetuado hoje'
                    : `${history.length} registro(s) efetuado(s) nesta sessão`}
                </span>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="font-semibold text-[#ff7a7a] hover:underline"
                >
                  Consultar
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* FORMULÁRIO (SOBRA FÍSICA OU BEM INSERVÍVEL)              */}
        {/* ======================================================== */}
        {currentView !== 'menu' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 space-y-5 animate-in fade-in duration-150">
            
            {/* Cabeçalho do Formulário com Botão 'Voltar ao Menu' */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => handleNavigate('menu')}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all active:scale-95 shrink-0"
                title="Voltar ao Menu Inicial"
              >
                <ArrowLeft className="w-4 h-4 text-[#ff7a7a]" />
                <span>Voltar ao Menu</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Limpar todos os campos"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            </div>

            {/* Título do Tipo de Formulário */}
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {currentView === 'sobra' ? (
                  <>
                    <PackagePlus className="w-5 h-5 text-[#ff7a7a] shrink-0" />
                    <span>Registro de Bem Não Cadastrado</span>
                  </>
                ) : (
                  <>
                    <PackageX className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Registro de Bem Inservível</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                {currentView === 'sobra'
                  ? 'Sobra física encontrada sem plaqueta de tombamento'
                  : 'Identificação e classificação do estado para baixa patrimonial'}
              </p>
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
                  placeholder={
                    currentView === 'sobra'
                      ? 'Ex: Cadeira giratória estofada preta, Monitor Dell 24...'
                      : 'Ex: Impressora HP LaserJet danificada, Mesa quebrada...'
                  }
                  className={`w-full pl-11 pr-3 py-3.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 text-base shadow-2xs transition-all font-medium ${
                    validationError && !descricao.trim()
                      ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-[#ff7a7a] focus:border-[#ff7a7a]'
                  }`}
                />
              </div>
            </div>

            {/* NOVO CAMPO OBRIGATÓRIO EXCLUSIVO DO BEM INSERVÍVEL: CLASSIFICAÇÃO DO ESTADO */}
            {currentView === 'inservivel' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="classificacao-estado-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Classificação do Estado <span className="text-[#ff7a7a]">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Obrigatório</span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>

                  <select
                    id="classificacao-estado-select"
                    required
                    value={classificacaoEstado}
                    onChange={(e) => {
                      setClassificacaoEstado(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    className={`w-full pl-11 pr-10 py-3.5 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm shadow-2xs transition-all font-medium appearance-none cursor-pointer ${
                      !classificacaoEstado ? 'text-slate-400' : 'text-slate-900 font-semibold'
                    } ${
                      validationError && !classificacaoEstado
                        ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-slate-300 focus:ring-[#ff7a7a] focus:border-[#ff7a7a]'
                    }`}
                  >
                    <option value="" disabled>
                      Selecione a classificação do bem...
                    </option>
                    {CLASSIFICACOES_INSERVIVEL.map((cl) => (
                      <option key={cl} value={cl} className="text-slate-900">
                        {cl}
                      </option>
                    ))}
                  </select>

                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}

            {/* ESTADO DE CONSERVAÇÃO (OPCIONAL, PRESENTE NO FORMULÁRIO DE SOBRA) */}
            {currentView === 'sobra' && (
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
            )}

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
                  placeholder={
                    currentView === 'inservivel'
                      ? 'Ex: Equipamento sem conserto econômico viável, peças oxidadas, placa danificada.'
                      : 'Ex: Marca HP, número de série gravado no chassi: SN-84920. Sem plaqueta de patrimônio metálica visível.'
                  }
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
              </div>
            )}

            {/* BOTÃO PRINCIPAL DE SALVAR/ENVIAR (GRANDE, TÁTIL PARA CAMPO) */}
            <div className="pt-3 space-y-2">
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
                    <span>
                      {currentView === 'inservivel'
                        ? 'Salvar e Enviar Bem Inservível'
                        : 'Salvar e Enviar Bem'}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('menu')}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancelar e voltar ao menu</span>
              </button>
            </div>

          </form>
        )}
      </main>

      {/* Modal de Sucesso */}
      <SuccessBanner
        isOpen={showSuccessModal}
        onNext={() => setShowSuccessModal(false)}
        onBackToMenu={() => {
          setShowSuccessModal(false);
          handleNavigate('menu');
        }}
        assetDescription={lastSubmitted.descricao}
        location={lastSubmitted.localizacao}
        photosCount={lastSubmitted.photosCount}
        isOfflineSaved={isOfflineSaved}
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
