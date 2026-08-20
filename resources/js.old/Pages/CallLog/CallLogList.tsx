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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// Import our newly created components
import CallCard from '@/Components/CallLog/CallCard';
import CallLogModal from '@/Components/CallLog/CallLogModal';

// --- INLINED TYPES ---
export type ContactRole = 'LISTING_AGENT' | 'CO_AGENT' | 'DIRECT_SELLER' | 'CASH_BUYER' | 'TITLE_COMPANY' | 'CONTRACTOR' | string;
export type CallDirection = 'INBOUND' | 'OUTBOUND';
export type CallOutcome = 'CONNECTED_INTERESTED' | 'CONNECTED_NOT_INTERESTED' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED' | 'SCHEDULED_CALLBACK' | 'LEFT_VOICEMAIL' | 'NO_ANSWER' | 'WRONG_NUMBER';

export interface Lead {
  id: string;
  propertyAddress: string;
  city: string;
  contactName: string;
  contactPhone: string;
  contactRole: ContactRole;
  valuation?: { listPrice?: number };
}

export interface CallLog {
  id: string;
  leadId?: string;
  contactName: string;
  contactPhone: string;
  contactRole: ContactRole;
  direction: CallDirection;
  durationSeconds: number;
  outcome: CallOutcome;
  notes?: string;
  transcript?: string;
  timestamp: string;
  leadAddress?: string;
  nextFollowUpDate?: string;
  aiSummary?: {
    motivationScore: number;
    sentiment: string;
    propertyConditionNotes?: string[];
    agentObjections?: string[];
    recommendedOfferStrategy: string;
  };
}

// --- MOCK DATA FOR UI TESTING ---
const mockLeads: Lead[] = [
  { id: '1', propertyAddress: '123 Main St', city: 'Springfield', contactName: 'John Doe', contactPhone: '555-0101', contactRole: 'DIRECT_SELLER', valuation: { listPrice: 250000 } },
  { id: '2', propertyAddress: '456 Oak Ave', city: 'Springfield', contactName: 'Jane Smith', contactPhone: '555-0102', contactRole: 'LISTING_AGENT', valuation: { listPrice: 320000 } },
];

const mockCallLogs: CallLog[] = [
  {
    id: '101',
    leadId: '1',
    leadAddress: '123 Main St, Springfield',
    contactName: 'John Doe',
    contactPhone: '555-0101',
    contactRole: 'DIRECT_SELLER',
    direction: 'OUTBOUND',
    durationSeconds: 185,
    outcome: 'CONNECTED_INTERESTED',
    notes: 'Seller is motivated. Needs to close in 30 days. Roof is about 15 years old.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  },
  {
    id: '102',
    contactName: 'Jane Smith',
    contactPhone: '555-0102',
    contactRole: 'LISTING_AGENT',
    direction: 'INBOUND',
    durationSeconds: 45,
    outcome: 'LEFT_VOICEMAIL',
    notes: 'Left a brief voicemail introducing our cash buying program.',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
];

// --- COMPONENT ---
export default function CallLogList({ auth }: { auth: any }) {
  // State
  const [callLogs, setCallLogs] = useState<CallLog[]>(mockCallLogs);
  const [leads] = useState<Lead[]>(mockLeads);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<ContactRole | 'ALL'>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadForDialer, setSelectedLeadForDialer] = useState<Lead | undefined>(undefined);

  // Filtered Calls
  const filteredCalls = useMemo(() => {
    return callLogs.filter((c) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        c.contactName.toLowerCase().includes(query) ||
        c.contactPhone.toLowerCase().includes(query) ||
        (c.leadAddress && c.leadAddress.toLowerCase().includes(query)) ||
        (c.notes && c.notes.toLowerCase().includes(query));

      const matchesRole = roleFilter === 'ALL' || c.contactRole === roleFilter;
      const matchesOutcome = outcomeFilter === 'ALL' || c.outcome === outcomeFilter;

      return matchesSearch && matchesRole && matchesOutcome;
    });
  }, [callLogs, searchQuery, roleFilter, outcomeFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Contact Name', 'Phone', 'Role', 'Direction', 'Duration (Sec)', 'Outcome', 'Linked Property', 'Notes'];
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wholesaling_call_register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Modal Handlers
  const handleOpenCallDialer = (lead?: Lead) => {
    setSelectedLeadForDialer(lead);
    setIsModalOpen(true);
  };

  const handleSaveCall = async (callData: any) => {
    // TODO: Replace with Inertia router call:
    // router.post(route('call-logs.store'), callData);

    // Mock UI update for now
    const newCall: CallLog = {
      ...callData,
      id: Date.now().toString(),
    };
    setCallLogs([newCall, ...callLogs]);
    setIsModalOpen(false);
  };

  const handleUpdateCallLog = async (updatedCallLog: CallLog) => {
    // TODO: Replace with Inertia router call:
    // router.put(route('call-logs.update', updatedCallLog.id), updatedCallLog);

    setCallLogs(callLogs.map(c => c.id === updatedCallLog.id ? updatedCallLog : c));
  };

  const handleDeleteCallLog = async (callLogId: string) => {
    // TODO: Replace with Inertia router call:
    // router.delete(route('call-logs.destroy', callLogId));

    setCallLogs(callLogs.filter(c => c.id !== callLogId));
  };

  // Stats
  const totalCallsCount = callLogs.length;
  const connectedCount = callLogs.filter(
    (c) => c.outcome === 'CONNECTED_INTERESTED' || c.outcome === 'OFFER_ACCEPTED' || c.outcome === 'CONNECTED_NOT_INTERESTED'
  ).length;
  const totalTalkTimeSec = callLogs.reduce((acc, c) => acc + c.durationSeconds, 0);
  const totalTalkMins = Math.round(totalTalkTimeSec / 60);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Call Log Register</h2>}
    >
      <Head title="Call Log" />

      <div className="py-12 bg-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6 max-w-5xl mx-auto">

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
                  Complete audit trail of every outbound & inbound phone conversation.
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
                  onClick={() => handleOpenCallDialer()}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>+ Log New Call</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
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
                    onClick={() => handleOpenCallDialer()}
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
                    onOpenLeadDetail={(leadId) => console.log('Open lead detail for:', leadId)} // TODO: Wire up Inertia visit
                    onUpdateCallLog={handleUpdateCallLog}
                    onDeleteCallLog={handleDeleteCallLog}
                  />
                ))
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Call Log Modal */}
      <CallLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leads={leads}
        selectedLead={selectedLeadForDialer}
        onSaveCall={handleSaveCall}
      />
    </AuthenticatedLayout>
  );
}
