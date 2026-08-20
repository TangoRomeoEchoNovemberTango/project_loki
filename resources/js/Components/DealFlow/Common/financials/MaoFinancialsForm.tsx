import React from 'react';
import { DollarSign, Calculator, Percent } from 'lucide-react';

interface MaoFinancialsFormProps {
  askingPrice: number | '';
  arv: number | '';
  repairs: number | '';
  fee: number | '';
  discountPercent?: number;
  onAskingPriceChange: (v: number | '') => void;
  onArvChange: (v: number | '') => void;
  onRepairsChange: (v: number | '') => void;
  onFeeChange: (v: number | '') => void;
  onDiscountPercentChange?: (v: number) => void;
}

export const MaoFinancialsForm: React.FC<MaoFinancialsFormProps> = ({
  askingPrice, arv, repairs, fee, discountPercent = 70,
  onAskingPriceChange, onArvChange, onRepairsChange, onFeeChange, onDiscountPercentChange,
}) => {
  const arvNum = Number(arv) || 0;
  const repairsNum = Number(repairs) || 0;
  const feeNum = Number(fee) || 0;
  const factor = (Number(discountPercent) || 70) / 100;
  const calculatedMao = Math.max(0, Math.round(arvNum * factor - repairsNum - feeNum));

  return (
    <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <h3 className="font-extrabold text-white text-xs uppercase tracking-wide flex items-center gap-2 text-amber-400">
          <DollarSign className="w-4 h-4 text-emerald-400" /> Financials & Wholesale MAO Valuation Engine
        </h3>
        <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
          <Calculator className="w-3.5 h-3.5 text-amber-400" /> Fully Customizable Formula & Fee
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-slate-300 block font-semibold mb-1">Asking Price ($)</label>
          <input type="number" placeholder="150000" value={askingPrice} onChange={(e) => onAskingPriceChange(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold font-mono focus:outline-none focus:border-amber-400" />
        </div>
        <div>
          <label className="text-slate-300 block font-semibold mb-1">Estimated ARV ($)</label>
          <input type="number" placeholder="220000" value={arv} onChange={(e) => onArvChange(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-bold font-mono focus:outline-none focus:border-amber-400" />
        </div>
        <div>
          <label className="text-slate-300 block font-semibold mb-1">Estimated Repairs ($)</label>
          <input type="number" placeholder="25000" value={repairs} onChange={(e) => onRepairsChange(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-rose-300 font-bold font-mono focus:outline-none focus:border-amber-400" />
        </div>
      </div>

      {/* Adjustable Formula Controls */}
      <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <span className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5 uppercase">
            <Percent className="w-3.5 h-3.5 text-amber-400" /> Adjust MAO Formula Rule & Assignment Fee
          </span>
          <span className="text-[10px] text-slate-400">Custom percentage or wholesale assignment fee</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-amber-300 block font-semibold mb-1">MAO Rule Discount Rate (%)</label>
            <div className="flex items-center gap-1.5">
              {[65, 70, 75, 80].map((pct) => (
                <button key={pct} type="button" onClick={() => onDiscountPercentChange?.(pct)} className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${discountPercent === pct ? 'bg-amber-500 text-slate-950 border-amber-400 shadow' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}`}>
                  {pct}%
                </button>
              ))}
              <input type="number" value={discountPercent} onChange={(e) => onDiscountPercentChange?.(Number(e.target.value))} className="w-16 bg-slate-950 border border-amber-500/50 p-1.5 rounded-lg text-center text-amber-300 font-bold font-mono text-xs focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-amber-300 block font-semibold mb-1">Wholesale / Assignment Fee ($)</label>
            <input type="number" value={fee} onChange={(e) => onFeeChange(e.target.value === '' ? '' : Number(e.target.value))} placeholder="15000" className="w-full bg-slate-950 border border-amber-500/50 p-2 rounded-xl text-emerald-300 font-bold font-mono text-xs focus:outline-none focus:border-amber-400" />
          </div>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-slate-400 text-xs">Calculated MAO Target:</span>
            <div className="text-lg font-black text-amber-400 font-mono">${calculatedMao.toLocaleString()}</div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono text-right">
            <span>Formula: (ARV × {discountPercent}%) - Repairs - Fee</span>
            <div className="text-slate-500 text-[10px]">(${arvNum.toLocaleString()} × {factor}) - ${repairsNum.toLocaleString()} - ${feeNum.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
