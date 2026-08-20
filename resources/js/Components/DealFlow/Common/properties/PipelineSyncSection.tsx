import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { LeadStage } from '@/types/dealflow';

interface PipelineSyncSectionProps {
  syncPipeline: boolean;
  pipelineStage: LeadStage;
  onSyncChange: (val: boolean) => void;
  onStageChange: (val: LeadStage) => void;
}

export const PipelineSyncSection: React.FC<PipelineSyncSectionProps> = ({
  syncPipeline,
  pipelineStage,
  onSyncChange,
  onStageChange
}) => {
  return (
    <div className="space-y-2 pt-1 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-400">
          <input
            type="checkbox"
            checked={syncPipeline}
            onChange={(e) => onSyncChange(e.target.checked)}
            className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-400"
          />
          <CheckCircle className="w-4 h-4" />
          <span>Sync & Create Wholesale Lead in Pipeline</span>
        </label>
        {syncPipeline && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Stage:</span>
            <select
              value={pipelineStage}
              onChange={(e) => onStageChange(e.target.value as LeadStage)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
            >
              <option value="NEW">New Lead In</option>
              <option value="CONTACTED">Contacted</option>
              <option value="VALUING">Valuing / MCTP</option>
              <option value="OFFER_SENT">Offer Sent</option>
              <option value="UNDER_CONTRACT_ACQ">Under Contract</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
