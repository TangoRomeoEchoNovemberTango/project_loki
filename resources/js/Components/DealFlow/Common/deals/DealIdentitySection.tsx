import React from 'react';
import { Hash, Clock } from 'lucide-react';

// 1. Define what this component NEEDS from the parent
interface DealIdentitySectionProps {
  dealNumber: string;
  createdAt: string;
  dealName: string;
  onDealNameChange: (newName: string) => void;
}

// 2. The Component
export const DealIdentitySection: React.FC<DealIdentitySectionProps> = ({
  dealNumber,
  createdAt,
  dealName,
  onDealNameChange,
}) => {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Deal Number Badge */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/10 rounded-lg">
            <Hash className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              System Deal Number
            </span>
            <span className="block font-mono text-sm font-bold text-amber-400 tracking-wide">
              {dealNumber}
            </span>
          </div>
        </div>
        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3 h-3" />
          <span>
            Created: {createdAt ? new Date(createdAt).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit' 
            }) : ''}
          </span>
        </div>
      </div>
      {/* Deal Name Input */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Deal Name / Project Title <span className="text-slate-600 font-normal normal-case">(Optional)</span>
        </label>
        <input
          type="text"
          value={dealName}
          onChange={(e) => onDealNameChange(e.target.value)}
          placeholder="e.g. 123 Main St Flip, Springfield Probate Portfolio..."
          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600"
        />
      </div>
    </div>
  );
};