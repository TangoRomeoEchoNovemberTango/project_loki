import React, { useState } from 'react';
import { Calculator, Sparkles, Building2, Hammer, DollarSign, TrendingUp } from 'lucide-react';
import { analyzeValuationWithAI } from '@/services/dealflow';

export const ValuationTool: React.FC = () => {
  const [address, setAddress] = useState('1042 West Washington St');
  const [listPrice, setListPrice] = useState(265000);
  const [arv, setArv] = useState(350000);
  const [sqft, setSqft] = useState(1950);
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(2);
  const [repairEstimate, setRepairEstimate] = useState(40000);
  const [discountPercent, setDiscountPercent] = useState(70);
  const [desiredFee, setDesiredFee] = useState(15000);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Calculations
  const calculatedMao = Math.round((arv * (discountPercent / 100)) - repairEstimate - desiredFee);
  const askMaoGap = listPrice - calculatedMao;

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeValuationWithAI({
        propertyAddress: address,
        listPrice,
        estimatedArv: arv,
        repairEstimate,
        sqft,
        beds,
        baths,
      });
      setAiResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            Property Valuation & MAO Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calculate Maximum Allowable Offer (MAO), calculate list price gaps, and generate AI listing agent pitch scripts.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
          <span className="text-[10px] text-amber-400 uppercase font-bold block">Target MAO Offer</span>
          <span className="text-2xl font-extrabold text-amber-300 font-mono">${calculatedMao.toLocaleString()}</span>
        </div>
      </div>

      {/* Input Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        
        <div className="md:col-span-3">
          <label className="block font-semibold text-slate-300 mb-1">Subject Property Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">List Price ($)</label>
          <input
            type="number"
            value={listPrice}
            onChange={(e) => setListPrice(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Estimated ARV ($)</label>
          <input
            type="number"
            value={arv}
            onChange={(e) => setArv(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Discount Rate (%)</label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Estimated Repair Cost ($)</label>
          <input
            type="number"
            value={repairEstimate}
            onChange={(e) => setRepairEstimate(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-rose-300 font-mono font-bold"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Wholesale Fee Goal ($)</label>
          <input
            type="number"
            value={desiredFee}
            onChange={(e) => setDesiredFee(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-300 font-mono font-bold"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Square Feet (sqft)</label>
          <input
            type="number"
            value={sqft}
            onChange={(e) => setSqft(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
          />
        </div>

      </div>

      {/* AI Generator CTA */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Gemini AI Agent Pitch & Offer Strategy Generator</h3>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing Deal...' : 'Generate Pitch Script'}
          </button>
        </div>

        {aiResult && (
          <div className="space-y-4 pt-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">MAO Breakdown:</span>
              <p className="text-slate-300">{aiResult.maoBreakdown}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Listing Agent Pitch Script:</span>
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{aiResult.agentPitchScript}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-sky-400 block mb-1">Creative Finance Option:</span>
              <p className="text-slate-300">{aiResult.creativeFinanceBackup}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
