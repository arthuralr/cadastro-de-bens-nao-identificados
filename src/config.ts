/**
 * CONFIGURAÇÃO DO WEBHOOK DO GOOGLE APPS SCRIPT
 * 
 * A URL é lida exclusivamente a partir da variável de ambiente VITE_WEBHOOK_URL.
 */
export const DEFAULT_WEBHOOK_URL: string = 
  (import.meta.env.VITE_WEBHOOK_URL as string | undefined)?.trim() || 
  'https://script.google.com/macros/s/AKfycbwYOUR_SCRIPT_ID/exec';

const STORAGE_KEY_HISTORY = 'patrimonio_historico_registros';

/**
 * Retorna exclusivamente a URL configurada no ambiente (VITE_WEBHOOK_URL)
 */
export function getActiveWebhookUrl(): string {
  return DEFAULT_WEBHOOK_URL;
}

export const STORAGE_KEYS = {
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

