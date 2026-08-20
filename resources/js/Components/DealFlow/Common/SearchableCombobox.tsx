import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronDown, Sparkles } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
}

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  options = [],
  value,
  onChange,
  placeholder = 'Search or select...',
  label,
  required = false,
  className = '',
  disabled = false,
  emptyMessage = 'No matching records found',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const labelMatch = opt.label.toLowerCase().includes(term);
    const sublabelMatch = opt.sublabel ? opt.sublabel.toLowerCase().includes(term) : false;
    const badgeMatch = opt.badge ? opt.badge.toLowerCase().includes(term) : false;
    return labelMatch || sublabelMatch || badgeMatch;
  });

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Main trigger button / display field */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }
        }}
        className={`w-full flex items-center justify-between gap-2 p-2.5 bg-slate-950 border text-xs rounded-xl cursor-pointer transition-all ${
          isOpen
            ? 'border-amber-400 ring-2 ring-amber-400/20 bg-slate-900'
            : value
            ? 'border-amber-500/40 text-amber-300 font-bold'
            : 'border-slate-800 text-slate-400 hover:border-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 overflow-hidden text-left flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              <span className="text-white font-bold truncate">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                  — {selectedOption.sublabel}
                </span>
              )}
              {selectedOption.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                    selectedOption.badgeColor || 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                  }`}
                >
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500 font-medium truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-400' : ''
            }`}
          />
        </div>
      </div>

      {/* Floating Popover Search Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-72 flex flex-col">
          {/* Live Search Input Box */}
          <div className="p-2 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type any character or word to search..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-500 hover:text-white p-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-800/40 flex-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-slate-500 text-xs font-medium italic">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`p-2.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                        : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{opt.label}</span>
                        {opt.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              opt.badgeColor || 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <span className="text-[11px] text-slate-400 truncate mt-0.5">{opt.sublabel}</span>
                      )}
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
