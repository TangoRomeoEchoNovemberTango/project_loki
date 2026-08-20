import React from 'react';
import { Building2, MapPin } from 'lucide-react';
import type { Lead, CallLog, Territory } from '@/types/dealflow';
import { QuickMetricsBar } from './Common/leads/QuickMetricsBar';

interface HeaderProps {
  leads: Lead[];
  callLogs: CallLog[];
  territories?: Territory[];
  selectedTerritoryId?: string | null;
  onSelectTerritoryFilter?: (id: string | null) => void;
  onOpenCallDialer: (lead?: Lead) => void;
  onOpenAddLeadModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  leads,
  callLogs,
  territories = [],
  selectedTerritoryId = null,
  onSelectTerritoryFilter,
  onOpenCallDialer,
  onOpenAddLeadModal,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          {/* Logo & Identity */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-xl shadow-inner text-slate-950 font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-white">
                    DealFlow <span className="text-amber-400 font-semibold text-sm px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">On-Market CRM</span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400">
                  Wholesaling Pipeline • Valuation Tools • Call Tracking Hub
                </p>
              </div>
            </div>
            {/* Territory Quick Switcher */}
            {onSelectTerritoryFilter && territories.length > 0 && (
              <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-xl text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <select
                  value={selectedTerritoryId || ''}
                  onChange={(e) => onSelectTerritoryFilter(e.target.value || null)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer max-w-[150px] truncate"
                >
                  <option value="" className="bg-slate-900 text-slate-300">
                    All Territories ({territories.length})
                  </option>
                  {territories.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.name} ({t.state})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Quick Metrics Bar (external brick) */}
          <QuickMetricsBar leads={leads} callLogs={callLogs} onNavigate={setActiveTab} />
        </div>
      </div>
    </header>
  );
};
