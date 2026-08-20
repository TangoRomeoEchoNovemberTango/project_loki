import React from 'react';
import { Phone, TrendingUp, Clock } from 'lucide-react';
import type { Lead, CallLog } from '@/types/dealflow';

interface QuickMetricsBarProps {
  leads: Lead[];
  callLogs: CallLog[];
  onNavigate?: (tab: string) => void;
  baselineFees?: number;
}

export const QuickMetricsBar: React.FC<QuickMetricsBarProps> = ({
  leads,
  callLogs,
  onNavigate,
  baselineFees = 15000,
}) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const callsToday = callLogs.filter((c) => new Date(c.timestamp) >= todayStart).length;
  const activeDeals = leads.filter((l) => l.stage !== 'CLOSED' && l.stage !== 'DEAD').length;
  const totalFeesCollected = leads
    .filter((l) => l.stage === 'CLOSED')
    .reduce((acc, l) => acc + (l.valuation?.desiredWholesaleFee || 0), baselineFees);
  const pendingFollowups = leads.filter((l) => {
    if (!l.nextFollowUpDate) return false;
    return new Date(l.nextFollowUpDate) <= new Date(Date.now() + 86400000);
  }).length;

  return (
    <div className="hidden lg:flex items-center space-x-4 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 text-xs">
      <button
        type="button"
        onClick={() => onNavigate?.('calls')}
        className="flex items-center space-x-2 px-3 py-1 bg-slate-900/60 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
      >
        <Phone className="w-4 h-4 text-emerald-400" />
        <div className="text-left">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Calls Today</span>
          <span className="font-bold text-emerald-400 text-sm">{callsToday} calls</span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onNavigate?.('pipeline')}
        className="flex items-center space-x-2 px-3 py-1 bg-slate-900/60 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
      >
        <TrendingUp className="w-4 h-4 text-amber-400" />
        <div className="text-left">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Deals</span>
          <span className="font-bold text-amber-300 text-sm">{activeDeals} leads</span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onNavigate?.('followups')}
        className="flex items-center space-x-2 px-3 py-1 bg-slate-900/60 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
      >
        <Clock className="w-4 h-4 text-sky-400" />
        <div className="text-left">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Follow-ups Due</span>
          <span className="font-bold text-sky-300 text-sm">{pendingFollowups} tasks</span>
        </div>
      </button>
      <div className="flex items-center space-x-2 px-3 py-1 bg-slate-900/60 rounded-lg">
        <div className="text-left">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fees Closed</span>
          <span className="font-bold text-emerald-400 text-sm">${totalFeesCollected.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
