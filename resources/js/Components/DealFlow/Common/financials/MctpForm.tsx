import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { PipelineType } from '@/types/dealflow';

interface MctpFormProps {
  dealType: PipelineType;
  motivation: string;
  condition: string;
  timeline: string;
  askingPrice: number | '';
  netTarget: number | '';
  isQualified: boolean;
  onMotivationChange: (val: string) => void;
  onConditionChange: (val: string) => void;
  onTimelineChange: (val: string) => void;
  onAskingPriceChange: (val: number | '') => void;
  onNetTargetChange: (val: number | '') => void;
  onQualifiedChange: (val: boolean) => void;
}

export const MctpForm: React.FC<MctpFormProps> = ({
  dealType, motivation, condition, timeline, askingPrice, netTarget, isQualified,
  onMotivationChange, onConditionChange, onTimelineChange, onAskingPriceChange, onNetTargetChange, onQualifiedChange
}) => {
  return (
    <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/40 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5 uppercase tracking-wide">
          <ShieldCheck className="w-4 h-4" /> Rick & Zach Ginn 4-Pillars MCTP
        </span>
        <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isQualified}
            onChange={(e) => onQualifiedChange(e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
          />
          <span>MCTP Qualified Lead</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-amber-300 font-bold mb-1 text-xs">1. Motivation (Why selling?)</label>
          <textarea
            rows={2}
            value={motivation}
            onChange={(e) => onMotivationChange(e.target.value)}
            placeholder={dealType === 'OFF_MARKET_GOV' ? 'Probate heir wants cash split, code fine...' : 'Days on market, expired listing...'}
            className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-amber-300 font-bold mb-1 text-xs">2. Condition (Property Repairs)</label>
          <textarea
            rows={2}
            value={condition}
            onChange={(e) => onConditionChange(e.target.value)}
            placeholder="Needs new roof, HVAC replacement, full trash-out..."
            className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-amber-300 font-bold mb-1 text-xs">3. Timeline (When to close?)</label>
          <input
            type="text"
            value={timeline}
            onChange={(e) => onTimelineChange(e.target.value)}
            placeholder="e.g. 14-30 Days, ASAP"
            className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-amber-300 font-bold mb-1 text-xs">4. Asking Price & Seller Net Target</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={askingPrice}
              onChange={(e) => onAskingPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Asking ($)"
              className="bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-white font-bold font-mono text-xs focus:outline-none focus:border-amber-400"
            />
            <input
              type="number"
              value={netTarget}
              onChange={(e) => onNetTargetChange(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Net Target ($)"
              className="bg-slate-900 border border-emerald-500/50 p-2 rounded-lg text-emerald-300 font-bold font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
