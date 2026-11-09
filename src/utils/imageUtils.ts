import { PhotoAttachment } from '../types';

/**
 * Redimensiona e comprime uma imagem no navegador antes de converter para Base64.
 * Reduz fotos de câmeras de celular de 8-15 MB para ~150-350 KB,
 * garantindo que requisições POST para Webhooks (N8N, Zapier, Make, etc.)
 * não falhem por limite de tamanho de payload (HTTP 413).
 */
export async function processImageFile(
  file: File,
  maxDimension = 1400,
  quality = 0.82
): Promise<PhotoAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calcular novas dimensões mantendo proporção
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter contexto do canvas'));
          return;
        }

        // Fundo branco para imagens transparentes convertidas em JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Suavização de alta qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const base64 = canvas.toDataURL(mimeType, quality);

        // Estimar tamanho em bytes a partir da string base64
        const base64Data = base64.split(',')[1] || '';
        const compressedSizeBytes = Math.round((base64Data.length * 3) / 4);

        const previewUrl = URL.createObjectURL(file);

        resolve({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          name: file.name.replace(/\.[^/.]+$/, '') + '.jpg',
          type: mimeType,
          originalSizeBytes: file.size,
          compressedSizeBytes,
          base64,
          previewUrl,
        });
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar a imagem'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('Falha ao ler o arquivo'));
      }
    };

    reader.onerror = () => reject(new Error('Erro no leitor de arquivos'));
    reader.readAsDataURL(file);
  });
}

/**
 * Formata bytes para exibição legível (ex: "245 KB")
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
