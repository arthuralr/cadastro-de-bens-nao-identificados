import React, { useState } from 'react';
import { MapPin, ChevronDown, Check, X } from 'lucide-react';
import { LOCAIS_FREQUENTES } from '../config';

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  id = 'localizacao-input',
}) => {
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const handleSelectPreset = (preset: string) => {
    onChange(preset);
    setShowQuickSelect(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>

        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: Almoxarifado Central, Sala 102..."
          className="w-full pl-11 pr-20 py-3.5 bg-white border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-base shadow-xs transition-all font-medium"
        />

        <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              aria-label="Limpar localização"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowQuickSelect(!showQuickSelect)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
              showQuickSelect
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Escolher da lista padrão"
          >
            <span>Lista</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showQuickSelect ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sugestões Rápidas em formato de Chips / Tags */}
      {showQuickSelect ? (
        <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-lg space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Selecione um local frequente:</span>
            <button
              type="button"
              onClick={() => setShowQuickSelect(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              Fechar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {LOCAIS_FREQUENTES.map((loc) => {
              const isSelected = value === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleSelectPreset(loc)}
                  className={`text-left px-3 py-2 text-xs rounded-xl font-medium flex items-center justify-between border transition-all active:scale-[0.99] ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{loc}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-blue-600 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Top 3 sugestões visíveis para 1 toque imediato */
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-slate-500 font-medium mr-0.5">Sugestões:</span>
          {LOCAIS_FREQUENTES.slice(0, 4).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => onChange(loc)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                value === loc
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
