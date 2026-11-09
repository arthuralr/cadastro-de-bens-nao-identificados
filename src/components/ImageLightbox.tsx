import React from 'react';
import { X, ZoomIn, FileText } from 'lucide-react';
import { PhotoAttachment } from '../types';
import { formatBytes } from '../utils/imageUtils';

interface ImageLightboxProps {
  photo: PhotoAttachment | null;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ photo, onClose }) => {
  if (!photo) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-lg w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 text-white">
          <div className="flex items-center gap-2 min-w-0">
            <ZoomIn className="w-4 h-4 text-[#ff7a7a] shrink-0" />
            <span className="text-sm font-medium truncate">{photo.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            aria-label="Fechar visualização"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Imagem Central */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[60vh]">
          <img
            src={photo.base64 || photo.previewUrl}
            alt={photo.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Rodapé com detalhes da foto */}
        <div className="p-4 bg-slate-900 text-xs text-slate-300 flex items-center justify-between border-t border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Otimizada: <strong>{formatBytes(photo.compressedSizeBytes)}</strong></span>
            {photo.originalSizeBytes > 0 && (
              <span className="text-slate-500 line-through">
                {formatBytes(photo.originalSizeBytes)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#ff7a7a] hover:bg-[#f26a6a] active:bg-[#e85a5a] text-white font-medium rounded-xl text-xs transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};
