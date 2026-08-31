import React, { useState } from 'react';
import {
  DollarSign, Calculator, TrendingDown, AlertTriangle,
  Settings2, Sliders, HelpCircle, X,
} from 'lucide-react';

interface MaoFinancialsFormProps {
  askingPrice: number | '';
  arv: number | '';
  repairs: number | '';
  fee: number | '';
  onAskingPriceChange: (v: number | '') => void;
  onArvChange: (v: number | '') => void;
  onRepairsChange: (v: number | '') => void;
  onFeeChange: (v: number | '') => void;
}

/* ── Design tokens: ONE spacing/typography system ─────────────────────────── */
const LABEL_ROW = 'flex items-center h-5 mb-1.5';                       // fixed label height = perfect input alignment
const LABEL_TXT = 'text-[10px] uppercase tracking-wider font-bold leading-none';
const INPUT_BASE = 'w-full border rounded-lg font-mono tabular-nums focus:outline-none focus:ring-1 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
const INPUT_HERO = `${INPUT_BASE} bg-slate-900 border-slate-700 p-3 font-black focus:border-amber-400 focus:ring-amber-400`;
const INPUT_TUNING = `${INPUT_BASE} p-2.5 text-sm focus:border-amber-400 focus:ring-amber-400`;
const STAT_ROW = 'flex justify-between items-center gap-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800';
const STAT_LABEL = 'text-slate-400 text-xs font-semibold min-w-0 truncate';
const STAT_VALUE = 'shrink-0 font-mono tabular-nums';

/* ── Static copy, hoisted (never rebuilt per render) ──────────────────────── */
const TOOLTIPS: Record<string, { title: string; body: string }> = {
  askingPrice: { title: 'Asking Price', body: 'The current seller price. Compare against calculated MAO to gauge deal margin.' },
  arv: { title: 'After Repair Value (ARV)', body: 'Estimated market value after full renovation based on recent comps.' },
  repairs: { title: 'Estimated Repairs', body: 'Estimated rehab cost breakdown: Light (<$30k), Medium ($30k-$50k), Heavy (>$50k).' },
  fee: { title: 'Wholesale Fee', body: 'Your targeted assignment profit built into the contract structure.' },
  rapidOffer: { title: 'Rapid Offer System', body: 'Scales ARV discount percentage dynamically based on target price tier.' },
  buyerFocused: { title: 'Buyer-Focused Profit', body: 'Calculates MAO based on buyer profit margin and closing cost allowances.' },
  goForNo: { title: 'Go For No Offer', body: 'Lowball opening anchor designed to elicit bottom-line seller counters.' },
  laoFactor: { title: 'LAO Factor', body: 'Lowest Allowable Offer percentage relative to final MAO calculation.' },
};

/* ── Tooltip alignment: keeps the popover inside the viewport ─────────────── */
type TipAlign = 'left' | 'center' | 'right';

const POPOVER_POSITION: Record<TipAlign, string> = {
  left: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-0',
};
const ARROW_POSITION: Record<TipAlign, string> = {
  left: 'left-3',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-3',
};

/* ── Hoisted tooltip (stable identity → no remount flicker) ───────────────── */
const TooltipTrigger: React.FC<{
  id: string; isOpen: boolean; onToggle: (id: string) => void; onClose: () => void; align?: TipAlign;
}> = ({ id, isOpen, onToggle, onClose, align = 'center' }) => {
  const info = TOOLTIPS[id];
  return (
    // No overflow-hidden/truncate may ever be applied to an ancestor of this span up to the
    // nearest scroll container, or the popover below gets clipped instead of floating free.
    <span className="relative inline-flex items-center justify-center ml-1">
      <button type="button" onClick={() => onToggle(id)} aria-label={`Info about ${info.title}`}
        className="text-slate-500 hover:text-amber-400 focus:text-amber-400 transition-colors">
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <span
          className={`absolute z-50 bottom-full mb-2 w-64 max-w-[85vw] bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 shadow-2xl ${POPOVER_POSITION[align]}`}
        >
          <span className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="font-bold text-amber-400 text-[10px] uppercase tracking-wide">{info.title}</span>
            <button type="button" onClick={onClose} aria-label="Close"
              className="text-slate-500 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
          <span className="block text-[11px] leading-relaxed text-slate-300">{info.body}</span>
          <span className={`absolute top-full -mt-1 h-2 w-2 rotate-45 bg-slate-900 border-r border-b border-slate-700 ${ARROW_POSITION[align]}`} />
        </span>
      )}
    </span>
  );
};

export const MaoFinancialsForm: React.FC<MaoFinancialsFormProps> = ({
  askingPrice, arv, repairs, fee,
  onAskingPriceChange, onArvChange, onRepairsChange, onFeeChange,
}) => {
  const arvNum = Number(arv) || 0;
  const repairsNum = Number(repairs) || 0;
  const feeNum = Number(fee) || 0;

  const [laoPercent, setLaoPercent] = useState(70);
  const [closingCostPercent, setClosingCostPercent] = useState(10);
  const [goForNoPercent, setGoForNoPercent] = useState(50);
  const [manualMultiplier, setManualMultiplier] = useState<number | ''>('');
  const [manualProfit, setManualProfit] = useState<number | ''>('');
  const [manualMao, setManualMao] = useState<number | ''>('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const toggleTooltip = (id: string) => setActiveTooltip((p) => (p === id ? null : id));
  const closeTooltip = () => setActiveTooltip(null);
  const tip = (id: string, align?: 'left' | 'center' | 'right') => (
    <TooltipTrigger id={id} isOpen={activeTooltip === id} onToggle={toggleTooltip} onClose={closeTooltip} align={align} />
  );

  const getDynamicMultiplier = (v: number) => {
    if (v === 0) return 0;
    if (v < 120000) return 0.70;
    if (v < 220000) return 0.80;
    if (v < 300000) return 0.815;
    if (v < 400000) return 0.829;
    return 0.849;
  };

  const activeMultiplier = manualMultiplier !== '' ? Number(manualMultiplier) / 100 : getDynamicMultiplier(arvNum);
  const displayMultiplier = (activeMultiplier * 100).toFixed(1);

  const calculatedRapidMao = Math.max(0, Math.round(arvNum * activeMultiplier - repairsNum - feeNum));
  const finalRapidMao = manualMao !== '' ? Number(manualMao) : calculatedRapidMao;
  const initialOfferLao = Math.round(finalRapidMao * (laoPercent / 100));

  const getRequiredBuyerProfit = (r: number) => {
    if (r === 0) return 0;
    if (r < 30000) return 30000;
    if (r <= 50000) return r;
    return 50000;
  };
  const buyerProfit = manualProfit !== '' ? Number(manualProfit) : getRequiredBuyerProfit(repairsNum);
  const closingCosts = Math.round(arvNum * (closingCostPercent / 100));
  const calculatedBuyerMao = Math.max(0, Math.round(arvNum - repairsNum - closingCosts - buyerProfit - feeNum));
  const finalBuyerMao = manualMao !== '' ? Number(manualMao) : calculatedBuyerMao;
  const instantOffer = Math.round(arvNum * (goForNoPercent / 100));

  return (
    <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl w-full font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <h3 className="font-extrabold text-amber-400 text-sm uppercase tracking-wide flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" /> Deal Analysis Engine
        </h3>
        <span className="hidden sm:inline-flex shrink-0 text-xs text-amber-300 font-bold items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 whitespace-nowrap">
          <Calculator className="w-4 h-4 text-amber-400" /> Interactive Wholesaling Calculator
        </span>
      </div>

      {/* Primary Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div className={LABEL_ROW}>
            <label htmlFor="mao-asking-price" className={`${LABEL_TXT} text-slate-400 inline-flex items-center`}>Asking Price ($){tip('askingPrice', 'left')}</label>
          </div>
          <input id="mao-asking-price" type="number" value={askingPrice} onChange={(e) => onAskingPriceChange(e.target.value === '' ? '' : Number(e.target.value))} className={`${INPUT_HERO} text-white`} />
        </div>
        <div>
          <div className={LABEL_ROW}>
            <label htmlFor="mao-arv" className={`${LABEL_TXT} text-slate-400 inline-flex items-center`}>Est. ARV ($){tip('arv', 'right')}</label>
          </div>
          <input id="mao-arv" type="number" value={arv} onChange={(e) => onArvChange(e.target.value === '' ? '' : Number(e.target.value))} className={`${INPUT_HERO} text-emerald-400`} />
        </div>
        <div>
          <div className={LABEL_ROW}>
            <label htmlFor="mao-repairs" className={`${LABEL_TXT} text-slate-400 inline-flex items-center`}>Repairs ($){tip('repairs', 'left')}</label>
          </div>
          <input id="mao-repairs" type="number" value={repairs} onChange={(e) => onRepairsChange(e.target.value === '' ? '' : Number(e.target.value))} className={`${INPUT_HERO} text-rose-400`} />
        </div>
        <div>
          <div className={LABEL_ROW}>
            <label htmlFor="mao-fee" className={`${LABEL_TXT} text-slate-400 inline-flex items-center`}>Your Fee ($){tip('fee', 'right')}</label>
          </div>
          <input id="mao-fee" type="number" value={fee} onChange={(e) => onFeeChange(e.target.value === '' ? '' : Number(e.target.value))} className={`${INPUT_HERO} text-amber-300`} />
        </div>
      </div>

      {/* Tuning / Overrides */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className={`${LABEL_TXT} text-slate-300 flex items-center gap-1.5`}>
            <Settings2 className="w-4 h-4 text-slate-400" /> Formula Variables & Manual Overrides
          </h4>
          {manualMao !== '' && (
            <span className="shrink-0 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30 inline-flex items-center gap-1 whitespace-nowrap">
              <Sliders className="w-3 h-3" /> Custom MAO Active
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <div className={LABEL_ROW}><label htmlFor="mao-override-mao" className={`${LABEL_TXT} text-amber-400`}>Override MAO ($)</label></div>
            <input id="mao-override-mao" type="number" placeholder="Auto" value={manualMao} onChange={(e) => setManualMao(e.target.value === '' ? '' : Number(e.target.value))} className={`${INPUT_TUNING} bg-amber-950/30 border-amber-500/50 text-amber-300 placeholder:text-slate-600`} />
          </div>
          <div>
            <div className={LABEL_ROW}><label htmlFor="mao-lao-percent" className={`${LABEL_TXT} text-slate-500 inline-flex items-center`}>LAO Factor (%){tip('laoFactor', 'left')}</label></div>
            <input id="mao-lao-percent" type="number" value={laoPercent} onChange={(e) => setLaoPercent(Number(e.target.value))} className={`${INPUT_TUNING} bg-slate-950 border-slate-700 text-slate-200`} />
          </div>
          <div>
            <div className={LABEL_ROW}><label htmlFor="mao-closing-cost" className={`${LABEL_TXT} text-slate-500`}>Closing Cost (%)</label></div>
            <input id="mao-closing-cost" type="number" value={closingCostPercent} onChange={(e) => setClosingCostPercent(Number(e.target.value))} className={`${INPUT_TUNING} bg-slate-950 border-slate-700 text-slate-200`} />
          </div>
          <div>
            <div className={LABEL_ROW}><label htmlFor="mao-go-for-no" className={`${LABEL_TXT} text-slate-500`}>Go For No (%)</label></div>
            <input id="mao-go-for-no" type="number" value={goForNoPercent} onChange={(e) => setGoForNoPercent(Number(e.target.value))} className={`${INPUT_TUNING} bg-slate-950 border-slate-700 text-slate-200`} />
          </div>
          <div>
            <div className={LABEL_ROW}><label htmlFor="mao-override-mult" className={`${LABEL_TXT} text-emerald-400/80`}>Override ARV Mult.</label></div>
            <input id="mao-override-mult" type="number" placeholder="Auto" value={manualMultiplier} onChange={(e) => setManualMultiplier(e.target.value === '' ? '' : Number(e.target.value))} className={`${INPUT_TUNING} bg-emerald-950/20 border-emerald-900/50 text-emerald-300 placeholder:text-slate-600 focus:border-emerald-400 focus:ring-emerald-400`} />
          </div>
          <div>
            <div className={LABEL_ROW}><label htmlFor="mao-override-profit" className={`${LABEL_TXT} text-blue-400/80`}>Override Profit ($)</label></div>
            <input id="mao-override-profit" type="number" placeholder="Auto" value={manualProfit} onChange={(e) => setManualProfit(e.target.value === '' ? '' : Number(e.target.value))} className={`${INPUT_TUNING} bg-blue-950/20 border-blue-900/50 text-blue-300 placeholder:text-slate-600 focus:border-blue-400 focus:ring-blue-400`} />
          </div>
        </div>
      </div>

      {/* Result Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Rapid Offer */}
        <div className="relative bg-slate-900/80 rounded-2xl border border-emerald-500/30 p-4">
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <TrendingDown className="absolute -right-4 -bottom-4 w-28 h-28 text-emerald-400 opacity-5" />
          </div>
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
              <div className="min-w-[11rem] flex-1">
                <h4 className="font-extrabold text-emerald-400 text-sm uppercase flex items-center gap-1.5">
                  <span>Rapid Offer System</span>{tip('rapidOffer', 'left')}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Multiplier logic applied to ARV</p>
              </div>
              <span className="shrink-0 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-500/30 whitespace-nowrap tabular-nums">
                {manualMao !== '' ? 'Custom MAO' : arvNum === 0 ? 'Awaiting ARV' : `${manualMultiplier !== '' ? 'Manual' : 'Auto'}: ${displayMultiplier}%`}
              </span>
            </div>
            <div className="space-y-2.5">
              <div className={STAT_ROW}>
                <span className={STAT_LABEL}>Max Offer (MAO)</span>
                <span className={`${STAT_VALUE} text-emerald-400 font-black text-lg`}>${finalRapidMao.toLocaleString()}</span>
              </div>
              <div className={STAT_ROW}>
                <span className={STAT_LABEL}>Initial Offer (LAO - {laoPercent}%)</span>
                <span className={`${STAT_VALUE} text-amber-400 font-bold`}>${initialOfferLao.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/50">
              <span className="block text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-wider">
                {manualMao !== '' ? 'Manual Override Applied' : 'Calculation Math'}
              </span>
              <div className="text-[11px] text-slate-400 font-mono leading-relaxed tabular-nums">
                {manualMao !== '' ? (
                  <>Explicit Target MAO set to <span className="text-amber-400 font-bold">${Number(manualMao).toLocaleString()}</span> (Calculated: ${calculatedRapidMao.toLocaleString()})</>
                ) : (
                  <>({arvNum.toLocaleString()} × {displayMultiplier}%) − {repairsNum.toLocaleString()} − {feeNum.toLocaleString()} = <span className="text-emerald-400 font-semibold">${calculatedRapidMao.toLocaleString()}</span></>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Buyer-Focused */}
        <div className="relative bg-slate-900/80 rounded-2xl border border-blue-500/30 p-4">
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <AlertTriangle className="absolute -right-4 -bottom-4 w-28 h-28 text-blue-400 opacity-5" />
          </div>
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
              <div className="min-w-[11rem] flex-1">
                <h4 className="font-extrabold text-blue-400 text-sm uppercase flex items-center gap-1.5">
                  <span>Buyer-Focused Profit</span>{tip('buyerFocused', 'right')}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Validates margin against repair intensity</p>
              </div>
              <span className="shrink-0 bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-blue-500/30 whitespace-nowrap tabular-nums">
                Closing: {closingCostPercent}%
              </span>
            </div>
            <div className="space-y-2.5">
              <div className={STAT_ROW}>
                <span className={STAT_LABEL}>Validation MAO</span>
                <span className={`${STAT_VALUE} text-blue-400 font-black text-lg`}>${finalBuyerMao.toLocaleString()}</span>
              </div>
              <div className={STAT_ROW}>
                <span className={STAT_LABEL}>Req. Buyer Profit ({manualProfit !== '' ? 'Manual' : 'Tiered'})</span>
                <span className={`${STAT_VALUE} text-rose-400 font-bold`}>${buyerProfit.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/50">
              <span className="block text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-wider">
                {manualMao !== '' ? 'Manual Override Applied' : 'Calculation Math'}
              </span>
              <div className="text-[11px] text-slate-400 font-mono leading-relaxed tabular-nums">
                {manualMao !== '' ? (
                  <>Explicit Target MAO set to <span className="text-amber-400 font-bold">${Number(manualMao).toLocaleString()}</span> (Calculated: ${calculatedBuyerMao.toLocaleString()})</>
                ) : (
                  <>{arvNum.toLocaleString()} − {repairsNum.toLocaleString()} − {closingCosts.toLocaleString()} (CC) − {buyerProfit.toLocaleString()} − {feeNum.toLocaleString()} = <span className="text-blue-400 font-semibold">${calculatedBuyerMao.toLocaleString()}</span></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Go For No */}
      <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-amber-400 font-extrabold text-sm uppercase tracking-wide flex items-center gap-1.5">
            The “Go For No” Offer ({goForNoPercent}%){tip('goForNo')}
          </span>
          <span className="text-slate-400 text-xs mt-1">Pulls the bottom line counter out of sellers</span>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <div className="text-2xl font-black text-amber-400 font-mono tracking-tight tabular-nums">${instantOffer.toLocaleString()}</div>
          <span className="text-[10px] text-amber-500/60 font-mono mt-0.5 tabular-nums">{arvNum.toLocaleString()} × {goForNoPercent}%</span>
        </div>
      </div>
    </div>
  );
};