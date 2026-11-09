export interface PhotoAttachment {
  id: string;
  file: File;
  name: string;
  type: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  base64: string; // "data:image/jpeg;base64,..."
  previewUrl: string;
}


export interface WebhookPayload {
  localizacao: string;
  descricao: string;
  observacoes: string;
  fotos: string[]; // Array contendo estritamente as strings de dados em Base64
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  localizacao: string;
  descricao: string;
  totalFotos: number;
  status: 'sucesso' | 'erro' | 'simulado';
  respostaWebhook?: string;
  fotosPreviews?: string[];
}
