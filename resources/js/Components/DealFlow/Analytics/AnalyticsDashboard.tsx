import React from 'react';
import { BarChart2, PhoneCall, TrendingUp, DollarSign, Award, Target } from 'lucide-react';
import type { Lead, CallLog } from '@/types/dealflow';

interface AnalyticsDashboardProps {
  leads: Lead[];
  callLogs: CallLog[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ leads, callLogs }) => {
  const totalCalls = callLogs.length;
  const connectedCalls = callLogs.filter(
    (c) =>
      c.outcome === 'CONNECTED_INTERESTED' ||
      c.outcome === 'OFFER_ACCEPTED' ||
      c.outcome === 'CONNECTED_NOT_INTERESTED'
  ).length;

  const totalTalkSec = callLogs.reduce((acc, c) => acc + c.durationSeconds, 0);
  const totalTalkHours = (totalTalkSec / 3600).toFixed(1);

  const closedLeads = leads.filter((l) => l.stage === 'CLOSED');
  const activeOffers = leads.filter((l) => l.stage === 'OFFER_SENT' || l.stage === 'NEGOTIATING');

  const projectedFees = leads.reduce((acc, l) => {
    if (l.stage === 'CLOSED') return acc + (l.valuation?.desiredWholesaleFee || 15000);
    if (l.stage === 'UNDER_CONTRACT_ACQ' || l.stage === 'DISPOSITION') {
      return acc + (l.valuation?.desiredWholesaleFee || 15000);
    }
    return acc;
  }, 15000);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-amber-400" />
          Wholesaling Performance Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Track call volume, offer conversion ratios, and assignment fee projections.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md space-y-1">
          <span className="text-slate-400 font-semibold block uppercase text-[10px]">Total Calls Logged</span>
          <span className="text-2xl font-extrabold text-white">{totalCalls} Calls</span>
          <p className="text-[10px] text-emerald-400 font-medium">{connectedCalls} connected conversations</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md space-y-1">
          <span className="text-slate-400 font-semibold block uppercase text-[10px]">Total Talk Time</span>
          <span className="text-2xl font-extrabold text-amber-300">{totalTalkHours} Hours</span>
          <p className="text-[10px] text-slate-400 font-medium">Outbound & Inbound</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md space-y-1">
          <span className="text-slate-400 font-semibold block uppercase text-[10px]">Offers Under Negotiation</span>
          <span className="text-2xl font-extrabold text-sky-300">{activeOffers.length} Deals</span>
          <p className="text-[10px] text-slate-400 font-medium">LOIs & Cash Offers</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md space-y-1">
          <span className="text-slate-400 font-semibold block uppercase text-[10px]">Closed + Pipeline Fees</span>
          <span className="text-2xl font-extrabold text-emerald-400">${projectedFees.toLocaleString()}</span>
          <p className="text-[10px] text-emerald-400 font-medium">Wholesale Fee Revenue</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="font-extrabold text-white text-sm">Pipeline Stage Distribution</h3>
        <div className="space-y-3 text-xs">
          {['NEW', 'CONTACTED', 'VALUING', 'OFFER_SENT', 'UNDER_CONTRACT_ACQ', 'DISPOSITION', 'CLOSED'].map((stg) => {
            const count = leads.filter((l) => l.stage === stg).length;
            const pct = leads.length ? Math.round((count / leads.length) * 100) : 0;

            return (
              <div key={stg} className="space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-300">
                  <span>{stg.replace('_', ' ')}</span>
                  <span className="text-amber-400">{count} deals ({pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
