import React from 'react';
import { Landmark, Building2, Tag } from 'lucide-react';
import type { PipelineType, GovListType } from '@/types/dealflow';

interface DealTypeSelectorProps {
  dealType: PipelineType;
  govListType: GovListType;
  onDealTypeChange: (type: PipelineType) => void;
  onGovListTypeChange: (type: GovListType) => void;
}

export const DealTypeSelector: React.FC<DealTypeSelectorProps> = ({
  dealType,
  govListType,
  onDealTypeChange,
  onGovListTypeChange,
}) => {
  return (
    <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-amber-400" /> Market Deal Type Selector
      </label>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onDealTypeChange('OFF_MARKET_GOV')}
          className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            dealType === 'OFF_MARKET_GOV'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>🏛️ Off-Market</span>
        </button>
        <button
          type="button"
          onClick={() => onDealTypeChange('ON_MARKET')}
          className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            dealType === 'ON_MARKET'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏢 On-Market</span>
        </button>
      </div>

      {dealType === 'OFF_MARKET_GOV' && (
        <div className="pt-1">
          <label className="block text-amber-300 font-bold text-[11px] mb-1">Government / Off-Market List Category *</label>
          <select
            value={govListType}
            onChange={(e) => onGovListTypeChange(e.target.value as GovListType)}
            className="w-full bg-slate-900 border border-amber-500/50 p-2 rounded-lg text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="PROBATE">PROBATE / INHERITED LIST</option>
            <option value="CODE_VIOLATION">CITY CODE VIOLATIONS</option>
            <option value="TAX_DELINQUENT">TAX DELINQUENT LIST</option>
            <option value="WATER_SHUTOFF">WATER SHUTOFF / UTILITY</option>
            <option value="PRE_FORECLOSURE">PRE-FORECLOSURE / LIS PENDENS</option>
            <option value="EVICTION">EVICTION COURT FILINGS</option>
            <option value="TIRED_LANDLORD">TIRED LANDLORD / VACANT</option>
          </select>
        </div>
      )}
    </div>
  );
};
