import React from 'react';

const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400';

export const SectionCard: React.FC<{ title: string; accent?: string; children: React.ReactNode }> = ({ title, accent = 'text-amber-400', children }) => (
  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
    <h4 className={`font-extrabold text-xs uppercase tracking-wider ${accent}`}>{title}</h4>
    {children}
  </div>
);

export const Field: React.FC<{ label: string; required?: boolean; className?: string; children: React.ReactNode }> = ({ label, required, className, children }) => (
  <div className={className}>
    <label className="block text-slate-300 font-bold mb-1 text-xs">{label} {required && <span className="text-rose-400">*</span>}</label>
    {children}
  </div>
);

export const TextInput: React.FC<{ label: string; required?: boolean; value?: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; className?: string; type?: string }> = ({ label, required, value, onChange, placeholder, mono, className, type = 'text' }) => (
  <Field label={label} required={required} className={className}>
    <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} ${mono ? 'font-mono' : ''}`} />
  </Field>
);

export const NumberInput: React.FC<{ label: string; required?: boolean; value?: number | ''; onChange: (v: number | '') => void; placeholder?: string; className?: string }> = ({ label, required, value, onChange, placeholder, className }) => (
  <Field label={label} required={required} className={className}>
    <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} placeholder={placeholder} className={`${inputCls} font-mono`} />
  </Field>
);

export const SelectInput: React.FC<{ label: string; required?: boolean; value?: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string; accent?: string }> = ({ label, required, value, onChange, options, className, accent = 'text-amber-300' }) => (
  <Field label={label} required={required} className={className}>
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-amber-400 cursor-pointer ${accent}`}>
      <option value="">-- Select --</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </Field>
);

export const TextArea: React.FC<{ label: string; value?: string; onChange: (v: string) => void; placeholder?: string; rows?: number; className?: string }> = ({ label, value, onChange, placeholder, rows = 2, className }) => (
  <Field label={label} className={className}>
    <textarea rows={rows} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
  </Field>
);

export const ToggleRow: React.FC<{ label: string; hint?: string; checked?: boolean; onChange: (v: boolean) => void }> = ({ label, hint, checked, onChange }) => (
  <label className="flex items-center justify-between gap-3 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 cursor-pointer">
    <span className="text-xs text-slate-200 font-semibold">
      {label}
      {hint && <span className="block text-[10px] text-slate-500 font-normal">{hint}</span>}
    </span>
    <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400" />
  </label>
);
