import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2, Eye, Loader2, AlertCircle } from 'lucide-react';
import { PhotoAttachment } from '../types';
import { processImageFile, formatBytes } from '../utils/imageUtils';
import { ImageLightbox } from './ImageLightbox';

interface PhotoUploaderProps {
  photos: PhotoAttachment[];
  onChange: (photos: PhotoAttachment[]) => void;
  maxPhotos?: number;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onChange,
  maxPhotos = 3,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoAttachment | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const remainingSlots = maxPhotos - photos.length;
      if (remainingSlots <= 0) {
        setErrorMessage(`Limite máximo de ${maxPhotos} fotos já atingido.`);
        setIsProcessing(false);
        return;
      }

      const filesToProcess = Array.from(fileList).slice(0, remainingSlots);
      const newAttachments: PhotoAttachment[] = [];

      for (const file of filesToProcess) {
        // Validação simples de tipo
        if (!file.type.startsWith('image/')) {
          continue;
        }
        try {
          const processed = await processImageFile(file);
          newAttachments.push(processed);
        } catch (err) {
          console.error('Falha ao processar imagem:', err);
        }
      }

      if (newAttachments.length === 0 && filesToProcess.length > 0) {
        setErrorMessage('Não foi possível ler as fotos selecionadas.');
      } else {
        onChange([...photos, ...newAttachments]);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao preparar as fotos.');
    } finally {
      setIsProcessing(false);
      // Reset inputs para permitir selecionar o mesmo arquivo novamente se desejar
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = photos.filter((p) => p.id !== id);
    onChange(updated);
  };

  const remaining = maxPhotos - photos.length;

  return (
    <div className="space-y-3">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Botões Grandes de Ação para Celular */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={remaining <= 0 || isProcessing}
          onClick={() => cameraInputRef.current?.click()}
          className={`flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl font-semibold text-sm transition-all shadow-sm active:scale-[0.98] min-h-[52px] ${
            remaining > 0 && !isProcessing
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-blue-600/20'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Camera className="w-5 h-5 shrink-0" />
          )}
          <span>Tirar Foto</span>
        </button>

        <button
          type="button"
          disabled={remaining <= 0 || isProcessing}
          onClick={() => galleryInputRef.current?.click()}
          className={`flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl font-semibold text-sm transition-all border min-h-[52px] active:scale-[0.98] ${
            remaining > 0 && !isProcessing
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <ImagePlus className="w-5 h-5 shrink-0 text-slate-500" />
          <span>Galeria</span>
        </button>
      </div>

      {/* Mensagem de Erro se houver */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid de Previews / Slots de Fotos (máximo 3) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Slots Preenchidos */}
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => setLightboxPhoto(photo)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 transition-all"
          >
            <img
              src={photo.base64 || photo.previewUrl}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Número da foto */}
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold rounded-md">
              #{index + 1}
            </span>

            {/* Tamanho comprimido */}
            <span className="absolute bottom-1.5 left-1.5 right-1.5 px-1 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium rounded text-center truncate">
              {formatBytes(photo.compressedSizeBytes)}
            </span>

            {/* Botão de Excluir */}
            <button
              type="button"
              onClick={(e) => handleRemove(photo.id, e)}
              className="absolute top-1.5 right-1.5 w-8 h-8 flex items-center justify-center rounded-full bg-rose-600/90 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-md"
              title="Remover foto"
              aria-label={`Remover foto ${index + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Ícone de zoom sutil */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
              <Eye className="w-6 h-6 text-white drop-shadow" />
            </div>
          </div>
        ))}

        {/* Slots Vazios Restantes */}
        {Array.from({ length: remaining }).map((_, i) => {
          const slotNumber = photos.length + i + 1;
          return (
            <button
              key={`empty-${slotNumber}`}
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50/30 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-colors p-2 text-center"
            >
              <Camera className="w-5 h-5 mb-1 opacity-60" />
              <span className="text-[11px] font-medium leading-tight">
                Foto {slotNumber}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">
                {slotNumber === 1 ? '(Recomendada)' : '(Opcional)'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Indicador de Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-0.5">
        <span>
          {photos.length === 0
            ? 'Nenhuma foto anexada (até 3)'
            : `${photos.length} de ${maxPhotos} fotos anexadas`}
        </span>
        <span className="text-[11px] text-slate-400">
          Otimização automática para envio rápido
        </span>
      </div>

      {/* Modal Lightbox */}
      <ImageLightbox
        photo={lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
      />
    </div>
  );
};
