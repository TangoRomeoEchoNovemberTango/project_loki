import React from 'react';

// ── SECTION CARD ─────────────────────────────────────────────────────────────
interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  accent?: string;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  accent = 'text-amber-400',
  className = '',
}) => {
  return (
    <div className={`p-4 bg-slate-900/60 border border-amber-500/20 rounded-xl space-y-3 ${className}`}>
      <h4 className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-2 ${accent}`}>
        {title}
      </h4>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

// ── FIELD WRAPPER ────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({ label, required, description, children, className }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className || ''}`}>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {description && <p className="text-[10px] text-slate-500">{description}</p>}
    </div>
  );
};

// ── TEXT INPUT ───────────────────────────────────────────────────────────────
interface TextInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  mono?: boolean;
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label, value, onChange, placeholder, type = 'text', required, mono, className,
}) => {
  return (
    <Field label={label} required={required} className={className}>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600 ${mono ? 'font-mono' : ''}`}
      />
    </Field>
  );
};

// ── NUMBER INPUT ─────────────────────────────────────────────────────────────
interface NumberInputProps {
  label: string;
  value?: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label, value, onChange, placeholder, required, className,
}) => {
  return (
    <Field label={label} required={required} className={className}>
      <input
        type="number"
        value={value === '' ? '' : value}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600"
      />
    </Field>
  );
};

// ── SELECT INPUT ─────────────────────────────────────────────────────────────
interface SelectInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  accent?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label, value, onChange, options, placeholder, required, className,
}) => {
  return (
    <Field label={label} required={required} className={className}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </Field>
  );
};

// ── TEXT AREA ────────────────────────────────────────────────────────────────
interface TextAreaProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  description?: string;
  accent?: string;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label, value, onChange, placeholder, rows = 3, description, className,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      </div>
      {description && <p className="text-[10px] text-slate-500 -mt-1">{description}</p>}
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600 resize-none"
      />
    </div>
  );
};

// ── TOGGLE ROW ───────────────────────────────────────────────────────────────
interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, checked, onChange }) => {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer group">
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{label}</p>
        {description && <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
          checked ? 'bg-amber-500' : 'bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
};