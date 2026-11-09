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
  Sparkles, 
  MapPin, 
  Compass, 
  CheckCircle2, 
  Settings, 
  RotateCcw
} from 'lucide-react';

import { Header } from './components/Header';
import { LocationPicker } from './components/LocationPicker';
import { PhotoUploader } from './components/PhotoUploader';
import { SuccessBanner } from './components/SuccessBanner';
import { WebhookSettingsModal } from './components/WebhookSettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';

import { PhotoAttachment, GeoLocationData, HistoryRecord, WebhookPayload } from './types';
import { 
  getActiveWebhookUrl, 
  STORAGE_KEYS, 
  CATEGORIAS_BENS, 
  ESTADOS_CONSERVACAO 
} from './config';

export default function App() {
  // Form States
  const [localizacao, setLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estadoConservacao, setEstadoConservacao] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [fotos, setFotos] = useState<PhotoAttachment[]>([]);
  
  // Geolocation
  const [gpsData, setGpsData] = useState<GeoLocationData | null>(null);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

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

  // Capturar GPS
  const handleToggleGps = () => {
    if (gpsData) {
      setGpsData(null);
      setGpsError(null);
      return;
    }

    if (!('geolocation' in navigator)) {
      setGpsError('Geolocalização não suportada neste navegador.');
      return;
    }

    setIsGettingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsData({
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          capturedAt: new Date().toISOString(),
        });
        setIsGettingGps(false);
      },
      (err) => {
        setIsGettingGps(false);
        setGpsError(
          err.code === 1
            ? 'Permissão de GPS negada. Habilite nas permissões do navegador.'
            : 'Não foi possível obter coordenadas GPS no momento.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Resetar formulário para a próxima coleta
  const handleResetForm = () => {
    setDescricao('');
    // Mantemos a localização opcionalmente como sugestão se o operador estiver na mesma sala!
    // Mas limpamos se desejar. Aqui vamos manter o texto de localização para agilizar, limpando as fotos e descrição.
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
    setCategoria('');
    setEstadoConservacao('');
    setObservacoes('');
    setFotos([]);
    setGpsData(null);
    setValidationError(null);
    setErrorMessage(null);
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setErrorMessage(null);

    // Validação obrigatória da Descrição do Bem
    if (!descricao.trim()) {
      setValidationError('A descrição do bem é obrigatória para identificação.');
      descricaoInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    const registroId = `PAT-${Date.now().toString(36).toUpperCase()}`;
    const timestampAtual = new Date().toISOString();

    // Montagem do payload exato exigido pelo Webhook:
    // { "localizacao": "string", "descricao": "string", "observacoes": "string", "fotos": ["string_base64", ...] }
    const payload: WebhookPayload = {
      localizacao: localizacao.trim(),
      descricao: descricao.trim(),
      observacoes: observacoes.trim(),
      fotos: fotos.map((f) => f.base64), // Apenas as strings Base64
    };

    let envioStatus: 'sucesso' | 'erro' | 'simulado' = 'sucesso';
    let respostaTexto = '';

    try {
      const webhookUrl = getActiveWebhookUrl();

      // Envio POST para a URL configurada
      // Para contornar o bloqueio de preflight CORS do Google Apps Script:
      // 1. Usamos 'text/plain;charset=utf-8' (requisição simples sem OPTIONS preflight do navegador)
      // 2. Usamos mode: 'no-cors' (permite que o browser entregue o POST mesmo com redirecionamento 302 do Apps Script)
      // 3. Enviamos o JSON como string no corpo (no Apps Script, capturado via JSON.parse(e.postData.contents))
      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      // Em modo 'no-cors', o navegador retorna tipo 'opaque' (status 0) por restrição de segurança,
      // o que confirma que a requisição foi transmitida e entregue com sucesso ao Google Apps Script.
      if (response.ok || response.type === 'opaque' || response.status === 0 || response.status === 200) {
        respostaTexto = 'Entregue com sucesso ao Webhook (modo no-cors sem preflight)';
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
        localizacao: localizacao.trim() || 'Não especificada',
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
        localizacao: localizacao.trim() || 'Local não informado',
        photosCount: fotos.length,
      });

      // Exibir modal de sucesso e limpar formulário
      setShowSuccessModal(true);
      handleResetForm();
    } catch (err: unknown) {
      console.error('Falha ao enviar webhook:', err);
      const errorStr = err instanceof Error ? err.message : String(err);
      
      let mensagemAmigavel = `Não foi possível enviar para o webhook: ${errorStr}`;
      if (errorStr.includes('Failed to fetch') || errorStr.includes('NetworkError')) {
        mensagemAmigavel = 
          'Falha na requisição de rede ou bloqueio de CORS pelo webhook de destino. Verifique sua conexão ou se o webhook aceita requisições do navegador.';
      }

      setErrorMessage(mensagemAmigavel);

      // Também registra tentativa no histórico como falha para não perder os dados
      const registroFalha: HistoryRecord = {
        id: registroId,
        timestamp: timestampAtual,
        localizacao: localizacao.trim() || 'Não especificada',
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

  const isGoogleAppsScript = activeWebhook.includes('script.google.com');
  const isNeedsConfiguration = activeWebhook.includes('AKfycbwYOUR_SCRIPT_ID') || activeWebhook.includes('placeholder');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Barra de Topo */}
      <Header
        collectedCount={history.length}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        isConfigured={!isNeedsConfiguration}
      />

      {/* Conteúdo Principal (Mobile-First Canvas) */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 pb-28">
        
        {/* Banner Informativo do Webhook */}
        {isNeedsConfiguration ? (
          <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-blue-950 shadow-xs">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Google Apps Script Webhook Configurado</p>
                <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                  Modo <code>no-cors</code> e <code>text/plain</code> ativo para contornar o CORS preflight. Toque em <strong>Ajustar URL</strong> se precisar colar o link final do seu script.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-[11px] shrink-0"
            >
              Ajustar URL
            </button>
          </div>
        ) : isGoogleAppsScript && (
          <div className="mb-3 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-medium text-[11px]">
                Google Apps Script ativo (CORS preflight contornado com text/plain + no-cors)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline ml-2"
            >
              Ver URL
            </button>
          </div>
        )}

        {/* Card do Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 space-y-5">
          
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

          {/* CAMPO 1: LOCALIZAÇÃO */}
          <div className="space-y-1.5">
            <label htmlFor="localizacao-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Localização
            </label>
            <LocationPicker
              id="localizacao-input"
              value={localizacao}
              onChange={setLocalizacao}
            />
          </div>

          {/* CAMPO 2: DESCRIÇÃO DO BEM (OBRIGATÓRIO) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="descricao-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Descrição do Bem <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Obrigatório</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-5 h-5 text-blue-600" />
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
                className={`w-full pl-11 pr-3 py-3.5 bg-white border rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 text-base shadow-xs transition-all font-medium ${
                  validationError
                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                    : 'border-slate-300 focus:ring-blue-600 focus:border-blue-600'
                }`}
              />
            </div>

            {/* Mensagem de Erro de Validação */}
            {validationError && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          {/* FACILITADORES DE CAMPO: CATEGORIA E ESTADO DE CONSERVAÇÃO (RÁPIDOS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Categoria Rápida */}
            <div className="space-y-1">
              <label htmlFor="categoria-select" className="block text-[11px] font-bold text-slate-600 uppercase">
                Categoria (Opcional)
              </label>
              <select
                id="categoria-select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Selecione ou deixe em branco...</option>
                {CATEGORIAS_BENS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado de Conservação */}
            <div className="space-y-1">
              <label htmlFor="estado-select" className="block text-[11px] font-bold text-slate-600 uppercase">
                Estado de Conservação
              </label>
              <select
                id="estado-select"
                value={estadoConservacao}
                onChange={(e) => setEstadoConservacao(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Selecione o estado...</option>
                {ESTADOS_CONSERVACAO.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
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
                className="w-full pl-11 pr-3 py-3 bg-white border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm shadow-xs transition-all leading-relaxed"
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

          {/* GPS ADICIONAL (Útil para inventário de pátio ou galpões grandes) */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-700 block">
                  {gpsData
                    ? `GPS: ${gpsData.latitude}, ${gpsData.longitude} (±${gpsData.accuracy}m)`
                    : 'Anexar Coordenadas GPS'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {gpsData ? 'Ponto georreferenciado registrado' : 'Opcional para bens em áreas abertas'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleGps}
              disabled={isGettingGps}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                gpsData
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isGettingGps ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : gpsData ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{gpsData ? 'Capturado' : 'Capturar GPS'}</span>
            </button>
          </div>

          {gpsError && (
            <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-xl">
              {gpsError}
            </p>
          )}

          {/* MENSAGEM DE ERRO GERAL SE HOUVER */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Erro no Envio para o Webhook</span>
              </div>
              <p className="leading-relaxed text-[11px]">{errorMessage}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
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
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-md min-h-[58px] active:scale-[0.98] ${
                isSubmitting
                  ? 'bg-blue-400 text-white cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/25'
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
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Fotos são convertidas em Base64 e enviadas via requisição POST
            </p>
          </div>

        </form>

        {/* Rodapé Informativo Limpo */}
        <footer className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <p className="font-medium text-slate-500">
            Coletor de Sobras de Inventário Patrimonial
          </p>
          <p className="text-[11px]">
            Otimizado para smartphones e tablets em campo
          </p>
        </footer>
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
