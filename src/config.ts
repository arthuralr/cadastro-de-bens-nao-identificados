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
  'Centro Adminsitrativo',
  'Centro de Eventos Dorothea Coswig Buss',
  'Colonia Progresso',
  'COMPRAS',
  'CONSELHO TUTELAR',
  'Consultório Médico',
  'CONTABILIDADE',
  'Controle Interno',
  'Corredor Agricultura',
  'CRAS',
  'CRAS - ALMOXARIFADO',
  'CRAS - ALMOXARIFADO MENOR 2',
  'CRAS - BANHEIROS',
  'CRAS - CORREDOR ENTRE SALAS PRINCIPAL',
  'CRAS - COZINHA',
  'CRAS - HALL DE ENTRADA',
  'CRAS - SALA DA COORDENADORIA',
  'CRAS - SALA DAS TÉCNICAS',
  'CRAS - SALÃO DE RECREAÇÃO/REUNIÕES',
  'Divisão De Trânsito',
  'EDUCAÇÃO - BIBLIOTECA PÚBLICA MUNICIPAL',
  'EDUCAÇÃO - COORDENAÇÃO PEDAGÓGICA',
  'EDUCAÇÃO - NUTRICIONISTA',
  'EDUCAÇÃO - SALA DE REUNIÕES',
  'EDUCAÇÃO - SALA DE SERVIÇOS GERAIS',
  'EMEF BARÃO DO RIO BRANCO',
  'EMEF BENJAMIN CONSTANT',
  'EMEFI Jose de Alencar',
  'EMEF MAJOR WALDEMAR COSWIG',
  'EMEF SILVEIRA MARTINS',
  'EMEI VISCONDE DE OURO PRETO',
  'Engenheiro Agrônomo',
  'Engenheiro Civil',
  'Farmácia Posto.',
  'Fisioterapia',
  'Frota',
  'GABINETE PREFEITO',
  'Gabinete vice-prefeita',
  'GALPÃO COOPAP, Secador de Grãos',
  'GALPÃO DE INSUMOS',
  'GALPÃO DE OBRAS',
  'JUNTA MILITAR',
  'Marcação Posto Saúde.',
  'Oficina',
  'PATRIMÔNIO I',
  'POSTO DE SAÚDE',
  'POSTO DE SAÚDE 2º ANDAR - DEPÓSITO FARMÁCIA 01',
  'POSTO DE SAÚDE 2º ANDAR - DEPÓSITO FARMÁCIA 02',
  'POSTO DE SAÚDE 2º ANDAR - SALA ESTRATÉGIA SAÚDE DA FAMÍLIA (ACS)',
  'POSTO DE SAÚDE 2º ANDAR - SALA PIM (PRIMEIRA INFÂNCIA MELHOR)',
  'POSTO DE SAÚDE 2º ANDAR - SALA SECRETÁRIO DE SAÚDE',
  'POSTO DE SAÚDE 2º ANDAR - SALA SETOR ADM 2',
  'POSTO DE SAÚDE 2º ANDAR - SETOR DE ADM.',
  'POSTO DE SAÚDE - ALMOXARIFADO ENFERMAGEM 01',
  'POSTO DE SAÚDE - ALMOXARIFADO ENFERMAGEM 02',
  'POSTO DE SAÚDE - ALMOXARIFADO GERAL',
  'POSTO DE SAÚDE - BRINQUEDOTECA',
  'POSTO DE SAÚDE - CONSULTÓRIO 01',
  'POSTO DE SAÚDE - CONSULTÓRIO 02',
  'POSTO DE SAÚDE - CONSULTÓRIO ESF',
  'POSTO DE SAÚDE - COPA.',
  'POSTO DE SAÚDE - CORREDOR',
  'POSTO DE SAÚDE - CORREDOR ENFERMAGEM.',
  'POSTO DE SAÚDE - ENFERMAGEM.',
  'POSTO DE SAÚDE - ENFERMAGEM/TRIAGEM.',
  'POSTO DE SAÚDE - FARMÁCIA.',
  'POSTO DE SAÚDE - RECEPÇÃO/SALA DE ESPERA',
  'POSTO DE SAÚDE - REFEITÓRIO',
  'POSTO DE SAÚDE - SALA 01 - PRÉDIO NOVO.',
  'POSTO DE SAÚDE - SALA 02 - PRÉDIO NOVO.',
  'POSTO DE SAÚDE - SALA ALMOXARIFADO ODONTO.',
  'POSTO DE SAÚDE - SALA CONFORTO ENFERMAGEM.',
  'POSTO DE SAÚDE - SALA DE HIGIENIZAÇÃO',
  'POSTO DE SAÚDE - SALA DE INFORMÁTICA.',
  'POSTO DE SAÚDE - SALA DE MARCAÇÃO - PRÉDIO NOVO',
  'POSTO DE SAÚDE - SALA DE VACINAÇÃO.',
  'POSTO DE SAÚDE - SALA FUNDOS',
  'POSTO DE SAÚDE - Sala Médico Clínico Geral/Plantão.',
  'POSTO DE SAÚDE - SALA NUTRICIONISTA',
  'POSTO DE SAÚDE - SALA PEDIATRA',
  'POSTO DE SAÚDE - SALA PSICÓLOGO/PSIQUIATRA.',
  'POSTO DE SAÚDE - VIGILÂNCIA EM SAÚDE',
  'RECEPÇÃO',
  'Recursos Humanos',
  'Refeitório',
  'Sala Administrativa 1',
  'Sala Administrativa 2',
  'SALA COORDENADORIA VIGILÂNCIA - ENFERMEIROS',
  'SALA DA ARQUITETURA',
  'Sala De Espera',
  'SALA DE ESTERILIZAÇÃO.',
  'Sala de Raio-X',
  'Sala do Secretário de Agricultura',
  'SALA DO SWITCH',
  'SALA ODONTOLÓGICA 01.',
  'SALA ODONTOLÓGICA 02.',
  'Sec. de Adm. Planejamento, Finanças, Gestão e Tributos',
  'Sec. de Agricultura, Meio Ambiente e Desenvolvimento',
  'Sec. de Educação, Cultura, Esporte e Turismo',
  'Sec.de Obras e Infraestrutura',
  'Sec. de Saúde e Desenvolvimento Social',
  'SEDE PREFEITURA MUNICIPAL',
  'Serviço De Inspeção Municipal - Sim',
  'SETOR DE EMPENHOS',
  'SETOR DE FISCALIZAÇÃO',
  'Tele Centro',
  'Tesouraria',
  'Tributos',
  'Veterinária',
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

