import React, { useState, useMemo } from 'react';
import {
  PhoneCall,
  Search,
  Filter,
  Download,
  Plus,
  UserCheck,
  CheckCircle2,
  PhoneIncoming,
  PhoneOutgoing,
} from 'lucide-react';
import type { CallLog, ContactRole, Lead } from '@/types/dealflow';
import { CallCard } from './CallCard';

interface CallLogListProps {
  callLogs: CallLog[];
  leads: Lead[];
  onOpenCallDialer: (lead?: Lead) => void;
  onOpenLeadDetail?: (leadId: string) => void;
  onUpdateCallLog?: (updatedCallLog: CallLog) => Promise<void>;
  onDeleteCallLog?: (callLogId: string) => Promise<void>;
}

export const CallLogList: React.FC<CallLogListProps> = ({
  callLogs,
  leads,
  onOpenCallDialer,
  onOpenLeadDetail,
  onUpdateCallLog,
  onDeleteCallLog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<ContactRole | 'ALL'>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');

  // Filtered Calls
  const filteredCalls = useMemo(() => {
    return callLogs.filter((c) => {
      // Search
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        c.contactName.toLowerCase().includes(query) ||
        c.contactPhone.toLowerCase().includes(query) ||
        (c.leadAddress && c.leadAddress.toLowerCase().includes(query)) ||
        (c.notes && c.notes.toLowerCase().includes(query));

      // Role filter
      const matchesRole = roleFilter === 'ALL' || c.contactRole === roleFilter;

      // Outcome filter
      const matchesOutcome =
        outcomeFilter === 'ALL' || c.outcome === outcomeFilter;

      return matchesSearch && matchesRole && matchesOutcome;
    });
  }, [callLogs, searchQuery, roleFilter, outcomeFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Contact Name',
      'Phone',
      'Role',
      'Direction',
      'Duration (Sec)',
      'Outcome',
      'Linked Property',
      'Notes',
    ];

    const rows = filteredCalls.map((c) => [
      `"${new Date(c.timestamp).toLocaleString()}"`,
      `"${c.contactName}"`,
      `"${c.contactPhone}"`,
      `"${c.contactRole}"`,
      `"${c.direction}"`,
      c.durationSeconds,
      `"${c.outcome}"`,
      `"${c.leadAddress || ''}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `wholesaling_call_register_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
  const totalCallsCount = callLogs.length;
  const connectedCount = callLogs.filter(
    (c) =>
      c.outcome === 'CONNECTED_INTERESTED' ||
      c.outcome === 'OFFER_ACCEPTED' ||
      c.outcome === 'CONNECTED_NOT_INTERESTED'
  ).length;
  const totalTalkTimeSec = callLogs.reduce((acc, c) => acc + c.durationSeconds, 0);
  const totalTalkMins = Math.round(totalTalkTimeSec / 60);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white">Call Log Register</h2>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">
              {totalCallsCount} Total Calls
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of every outbound & inbound phone conversation with listing agents, sellers, title companies, and buyers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Total Talk Time</span>
            <span className="font-extrabold text-amber-400 text-sm">{totalTalkMins} Minutes</span>
          </div>

          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Connect Rate</span>
            <span className="font-extrabold text-emerald-400 text-sm">
              {totalCallsCount ? Math.round((connectedCount / totalCallsCount) * 100) : 0}%
            </span>
          </div>

          <button
            onClick={() => onOpenCallDialer()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>+ Log New Call</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by contact name, phone, or address..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Role Filter & Outcome Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="LISTING_AGENT">Listing Agents</option>
            <option value="DIRECT_SELLER">Direct Sellers</option>
            <option value="CASH_BUYER">Cash Buyers</option>
            <option value="TITLE_COMPANY">Title Company</option>
            <option value="CONTRACTOR">Contractors</option>
          </select>

          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Call Outcomes</option>
            <option value="CONNECTED_INTERESTED">Spoke — Interested</option>
            <option value="OFFER_ACCEPTED">Offer Accepted</option>
            <option value="OFFER_REJECTED">Offer Rejected</option>
            <option value="SCHEDULED_CALLBACK">Callback Scheduled</option>
            <option value="LEFT_VOICEMAIL">Left Voicemail</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
            title="Export call logs to CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>
        </div>

      </div>

      {/* Call Cards List */}
      <div className="space-y-4">
        {filteredCalls.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <PhoneCall className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No calls found matching your filter</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Track every call to listing agents or sellers by clicking the "+ Log New Call" button above.
            </p>
            <button
              onClick={() => onOpenCallDialer()}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Log First Phone Call
            </button>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <CallCard
              key={call.id}
              call={call}
              onOpenLeadDetail={onOpenLeadDetail}
              onUpdateCallLog={onUpdateCallLog}
              onDeleteCallLog={onDeleteCallLog}
            />
          ))
        )}
      </div>

    </div>
  );
};
