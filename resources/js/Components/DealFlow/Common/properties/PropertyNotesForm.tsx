import React from 'react';
import { StickyNote } from 'lucide-react';

interface PropertyNotesFormProps {
  notes: string;
  onNotesChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export const PropertyNotesForm: React.FC<PropertyNotesFormProps> = ({
  notes,
  onNotesChange,
  label = 'Property Notes & Access Instructions',
  placeholder = 'Lockbox code, seller access instructions, lien details, code violation specifics...',
  rows = 3,
}) => {
  return (
    <div className="space-y-1 bg-slate-950 p-4 rounded-xl border border-slate-800">
      <label className="text-slate-300 font-bold flex items-center gap-1.5 text-xs">
        <StickyNote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>{label}</span>
      </label>
      <textarea
        rows={rows}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
      />
    </div>
  );
};
