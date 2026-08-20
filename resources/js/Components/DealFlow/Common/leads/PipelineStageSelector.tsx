import React from 'react';
import { Kanban } from 'lucide-react';

export interface PipelineStageOption {
  value: string;
  label: string;
}

const DEFAULT_STAGES: PipelineStageOption[] = [
  { value: 'GOV_LIST_PULLED', label: '1. GOV LIST PULLED (Column 1 - Cold Lead In)' },
  { value: 'SKIP_TRACED', label: '2. SKIP-TRACED (Column 2 - Phone/Email Verified)' },
  { value: 'MCTP_QUALIFIED', label: '3. MCTP QUALIFIED (Column 3 - Motivated Seller)' },
  { value: 'OFFER_SENT', label: '4. OFFER SENT (PDF) (Column 4 - Contract Sent)' },
  { value: 'UNDER_CONTRACT', label: '5. UNDER CONTRACT & TITLE (Column 5)' },
  { value: 'CASH_BUYER_BIDS', label: '6. CASH BUYER BIDS (Column 6)' },
  { value: 'CLOSED', label: '7. CLOSED / WHOLESALE FEE (Column 7)' },
];

interface PipelineStageSelectorProps {
  value: string;
  onChange: (stage: string) => void;
  stages?: PipelineStageOption[];
  label?: string;
  hint?: string;
}

export const PipelineStageSelector: React.FC<PipelineStageSelectorProps> = ({
  value,
  onChange,
  stages = DEFAULT_STAGES,
  label = 'Target Pipeline Stage (Destination Column)',
  hint = 'Defaults to Column 1 (1. Gov List Pulled)',
}) => {
  return (
    <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-amber-300 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
          <Kanban className="w-3.5 h-3.5 text-amber-400" />
          {label}
        </label>
        {hint && (
          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded font-semibold">
            {hint}
          </span>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-2.5 text-xs text-amber-200 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
      >
        {stages.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
};
