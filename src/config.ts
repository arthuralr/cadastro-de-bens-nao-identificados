/**
 * CONFIGURAÇÃO DO WEBHOOK DO GOOGLE APPS SCRIPT
 * 
 * Cole aqui a URL do seu Webhook do Google Apps Script (geralmente terminando em /exec).
 * Você também pode definir a variável de ambiente VITE_WEBHOOK_URL no arquivo .env
 * ou alterar diretamente na interface pelo botão de Configurações ⚙️.
 */
export const DEFAULT_WEBHOOK_URL = 
  import.meta.env.VITE_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbwYOUR_SCRIPT_ID/exec';

// Chave para armazenar a URL customizada no navegador (se o usuário mudar pela interface)
const STORAGE_KEY_WEBHOOK = 'patrimonio_webhook_url';
const STORAGE_KEY_HISTORY = 'patrimonio_historico_registros';

export function getActiveWebhookUrl(): string {
  const customUrl = localStorage.getItem(STORAGE_KEY_WEBHOOK);
  // Se houver URL salva no localStorage que não seja o link antigo de teste do webhook.site
  if (
    customUrl &&
    customUrl.trim().length > 0 &&
    !customUrl.includes('placeholder-troque-pela-sua-url') &&
    !customUrl.includes('webhook.site')
  ) {
    return customUrl.trim();
  }
  return DEFAULT_WEBHOOK_URL;
}

export function setActiveWebhookUrl(url: string): void {
  if (!url || url.trim() === '' || url.trim() === DEFAULT_WEBHOOK_URL) {
    localStorage.removeItem(STORAGE_KEY_WEBHOOK);
  } else {
    localStorage.setItem(STORAGE_KEY_WEBHOOK, url.trim());
  }
}

export function resetWebhookUrl(): void {
  localStorage.removeItem(STORAGE_KEY_WEBHOOK);
}


export const STORAGE_KEYS = {
  WEBHOOK: STORAGE_KEY_WEBHOOK,
  HISTORY: STORAGE_KEY_HISTORY,
};

// Sugestões rápidas de locais frequentes para inventário de campo
export const LOCAIS_FREQUENTES = [
  'Almoxarifado Central',
  'Depósito Geral',
  'Prédio Adm - 1º Andar',
  'Prédio Adm - 2º Andar',
  'Oficina de Manutenção',
  'Galpão de Máquinas',
  'Pátio Externo',
  'Sala de Servidores / TI',
  'Arquivo Morto',
  'Recepção Principal',
  'Refeitório / Copa',
];

// Categorias padrão para facilitar a classificação das sobras
export const CATEGORIAS_BENS = [
  'Mobiliário (Mesa, Cadeira, Armário)',
  'Equipamento de TI & Periféricos',
  'Eletrodoméstico & Climatização',
  'Ferramenta & Máquina Operacional',
  'Veículo ou Componente Automotivo',
  'Instrumento ou Equipamento Técnico',
  'Outros / Não Especificado',
];

export const ESTADOS_CONSERVACAO = [
  'Bom (Em uso ou pronto para uso)',
  'Regular (Com avarias estéticas, funcional)',
  'Danificado / Sucata (Inoperante)',
  'Aguardando Avaliação Técnica',
];
