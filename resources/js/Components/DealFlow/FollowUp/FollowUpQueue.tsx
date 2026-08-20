import React, { useState } from 'react';
import { CalendarClock, PhoneCall, CheckCircle2 } from 'lucide-react';
import type { Lead } from '@/types/dealflow';
import { FollowUpCalendar } from '@/Components/DealFlow/Common/leads/FollowUpCalendar';
import { FollowUpViewToggle } from '@/Components/DealFlow/Common/leads/FollowUpViewToggle';
import type { FollowUpView } from '@/Components/DealFlow/Common/leads/FollowUpViewToggle';

interface FollowUpQueueProps {
  leads: Lead[];
  onOpenDialer: (lead: Lead) => void;
  onOpenDetail: (lead: Lead) => void;
}

export const FollowUpQueue: React.FC<FollowUpQueueProps> = ({
  leads,
  onOpenDialer,
  onOpenDetail,
}) => {
  const [filter, setFilter] = useState<'DUE' | 'ALL'>('DUE');
  const [view, setView] = useState<FollowUpView>('list');

  const now = new Date();
  const dueLeads = leads.filter((l) => {
    if (!l.nextFollowUpDate) return false;
    const fDate = new Date(l.nextFollowUpDate);
    return fDate <= new Date(now.getTime() + 86400000); // due today or past
  });
  const displayLeads = filter === 'DUE' ? dueLeads : leads;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header: title + filters + view toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-400" />
            Follow-up Queue & Action Items
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Stay on top of every listing agent touchpoint and direct seller callback.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {view === 'list' && (
            <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilter('DUE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${filter === 'DUE' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Due Today ({dueLeads.length})
              </button>
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${filter === 'ALL' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
              >
                All Scheduled ({leads.length})
              </button>
            </div>
          )}
          <FollowUpViewToggle view={view} onChange={setView} listCount={displayLeads.length} />
        </div>
      </div>

      {/* Body: calendar view OR list view */}
      {view === 'calendar' ? (
        <FollowUpCalendar
          leads={leads}
          onOpenDialer={onOpenDialer}
          onOpenDetail={onOpenDetail}
        />
      ) : displayLeads.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">All caught up! No follow-ups due today.</h3>
          <p className="text-xs text-slate-400 mt-1">Keep calling new on-market listings to fill your pipeline.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h3
                    onClick={() => onOpenDetail(lead)}
                    className="font-bold text-white text-sm hover:text-amber-400 cursor-pointer"
                  >
                    {lead.propertyAddress}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 font-bold rounded">
                    {lead.stage}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Contact: <span className="text-white font-semibold">{lead.contactName}</span> ({lead.contactRole}) •{' '}
                  <span className="font-mono text-emerald-400">{lead.contactPhone}</span>
                </p>
                <p className="text-xs text-slate-300 italic mt-2 bg-slate-950 p-2 rounded border border-slate-800">
                  "{lead.notes}"
                </p>
              </div>
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => onOpenDialer(lead)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Now</span>
                </button>
                <button
                  onClick={() => onOpenDetail(lead)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs cursor-pointer"
                >
                  View Deal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
