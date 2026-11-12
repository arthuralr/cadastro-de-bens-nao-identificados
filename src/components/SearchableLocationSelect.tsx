import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, ChevronDown, Check, X, Search } from 'lucide-react';

interface SearchableLocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | string[];
  hasError?: boolean;
  id?: string;
  placeholder?: string;
  required?: boolean;
}

// Remove acentos e converte para minúsculas para busca flexível
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export const SearchableLocationSelect: React.FC<SearchableLocationSelectProps> = ({
  value,
  onChange,
  options,
  hasError = false,
  id = 'localizacao-searchable-select',
  placeholder = 'Pesquisar ou selecionar localização...',
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filtra as opções com base no termo de busca sem diferenciar acentos e maiúsculas
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options;
    }
    const normalizedQuery = normalizeText(searchTerm);
    return options.filter((loc) => normalizeText(loc).includes(normalizedQuery));
  }, [options, searchTerm]);

  // Fecha o dropdown ao clicar fora do componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Se fechou sem selecionar e havia busca parcial, restaura o texto da opção selecionada
        setSearchTerm(value || '');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [value]);

  // Sincroniza o input com o valor externo quando ele mudar
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Mantém o item destacado visível na rolagem
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (selectedOption: string) => {
    onChange(selectedOption);
    setSearchTerm(selectedOption);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (filteredOptions.length === 1) {
          handleSelect(filteredOptions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm(value || '');
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchTerm(value || '');
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Campo oculto com validação nativa HTML5 para garantir requisito de formulário */}
      <input
        type="text"
        tabIndex={-1}
        required={required}
        value={value}
        onChange={() => {}}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Caixa do Campo de Pesquisa / Seleção */}
      <div
        className="relative flex items-center cursor-pointer"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* Ícone fixo de Localização à esquerda */}
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <MapPin className="w-5 h-5 text-[#ff7a7a]" />
        </div>

        {/* Input de texto pesquisável */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          className={`w-full pl-11 pr-16 py-3.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 text-sm shadow-2xs transition-all font-medium ${
            hasError && !value
              ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
              : 'border-slate-300 focus:ring-[#ff7a7a] focus:border-[#ff7a7a]'
          }`}
        />

        {/* Ações à direita (Limpar + Indicador de Seta) */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Limpar seleção"
              aria-label="Limpar localização selecionada"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div
            className={`text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#ff7a7a]' : ''
            }`}
          >
            <ChevronDown className="w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Dropdown com Lista de Opções Pesquisáveis */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Cabeçalho informativo da busca */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filteredOptions.length === options.length
                  ? `Exibindo todas as ${options.length} localizações`
                  : `${filteredOptions.length} de ${options.length} localizações encontradas`}
              </span>
            </span>
            {searchTerm && (
              <span className="text-[10px] text-slate-400">
                Filtro ativo
              </span>
            )}
          </div>

          {/* Lista com scroll tátil para celular */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-64 overflow-y-auto divide-y divide-slate-100/70 overscroll-contain"
          >
            {filteredOptions.length === 0 ? (
              <li className="p-4 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-600">Nenhuma localização encontrada</p>
                <p className="text-[11px]">Não há setores que correspondam a "{searchTerm}".</p>
              </li>
            ) : (
              filteredOptions.map((loc, index) => {
                const isSelected = loc === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={loc}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(loc)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3.5 py-3 cursor-pointer text-xs font-medium flex items-center justify-between transition-colors select-none ${
                      isSelected
                        ? 'bg-[#ff7a7a]/15 text-[#ff7a7a] font-bold'
                        : isHighlighted
                        ? 'bg-slate-100/90 text-slate-900'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">{loc}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#ff7a7a] shrink-0" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
