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

// Lista exata de localizações predefinidas para o menu suspenso (select)
export const LOCAIS_PREDEFINIDOS = [
  'Administrativo',
  'Agrícola',
  'ALMOXARIFADO',
  'Auditório',
  'bairro Brasil para Cristo',
  'Camara de vereadores',
  'Capela Mortuária',
  'Centro Administrativo',
  'Centro de Eventos Dorothea Coswig Buss',
  'Colonia Progresso',
  'CONSELHO TUTELAR',
  'Consultório Médico',
  'CONTABILIDADE',
  'Controle Interno',
  'Corredor Agricultura',
  'CRAS',
  'Divisão De Trânsito',
  'EMEF BARÃO DO RIO BRANCO',
  'EMEF BENJAMIN CONSTANT',
  'EMEFI Jose de Alencar',
  'EMEF MAJOR WALDEMAR COSWIG',
  'EMEF SILVEIRA MARTINS',
  'EMEI VISCONDE DE OURO PRETO',
  'Engenheiro Agrônomo',
  'Engenheiro Civil',
  'Farmácia Posto',
  'Fisioterapia',
  'Frota',
  'GABINETE PREFEITO',
  'Gabinete vice-prefeita',
  'GALPÃO COOPAP, Secador de Grãos',
  'GALPÃO DE INSUMOS',
  'GALPÃO DE OBRAS',
  'JUNTA MILITAR',
  'Marcação Posto Saúde',
  'Oficina',
  'PATRIMÔNIO I',
  'POSTO DE SAÚDE',
  'RECEPÇÃO',
  'Recursos Humanos',
  'Refeitório',
  'Sala Administrativa 1',
  'Sala Administrativa 2',
  'Sala De Espera',
  'Sala de Raio-X',
  'Sala do Secretário de Agricultura',
  'SALA DO SWITCH',
  'Sec. de Adm. Planejamento, Finanças, Gestão e Tributos',
  'Sec. de Agricultura, Meio Ambiente e Desenvolvimento',
  'Sec. de Educação, Cultura, Esporte e Turismo',
  'Sec. de Obras e Infraestrutura',
  'Sec. de Saúde e Desenvolvimento Social',
  'SEDE PREFEITURA MUNICIPAL',
  'Serviço De Inspeção Municipal - Sim',
  'SETOR DE EMPENHOS',
] as const;

export const ESTADOS_CONSERVACAO = [
  'Bom (Em uso ou pronto para uso)',
  'Regular (Com avarias estéticas, funcional)',
  'Danificado / Sucata (Inoperante)',
  'Aguardando Avaliação Técnica',
];

// Opções obrigatórias para o formulário de Bem Inservível
export const CLASSIFICACOES_INSERVIVEL = [
  'Ocioso',
  'Recuperável',
  'Antieconômico',
  'Irrecuperável (Sucata)',
] as const;

