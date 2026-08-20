import React from 'react';

interface DealNotesFormProps {
  notes: string;
  onNotesChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export const DealNotesForm: React.FC<DealNotesFormProps> = ({
  notes,
  onNotesChange,
  label = 'Initial Deal Notes',
  placeholder = 'Motivation notes, listing agent comments, government list details...',
  rows = 3,
}) => {
  return (
    <div className="space-y-1 bg-slate-950 p-4 rounded-xl border border-slate-800">
      <label className="text-slate-300 font-bold block text-xs">{label}</label>
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
