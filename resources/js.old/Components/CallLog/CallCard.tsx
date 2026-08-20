import React, { useState } from 'react';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  User,
  Building2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Trash2,
  Edit3,
  Save,
  X,
} from 'lucide-react';

// --- INLINED TYPES (Replaces ../../types) ---
export type CallOutcome =
  | 'OFFER_ACCEPTED'
  | 'CONNECTED_INTERESTED'
  | 'CONNECTED_NOT_INTERESTED'
  | 'OFFER_REJECTED'
  | 'SCHEDULED_CALLBACK'
  | 'LEFT_VOICEMAIL';

export type ContactRole =
  | 'LISTING_AGENT'
  | 'CO_AGENT'
  | 'DIRECT_SELLER'
  | 'CASH_BUYER'
  | string;

export interface CallLog {
  id: string;
  leadId?: string;
  contactName: string;
  contactPhone: string;
  contactRole: ContactRole;
  direction: 'INBOUND' | 'OUTBOUND';
  durationSeconds: number;
  outcome: CallOutcome;
  notes?: string;
  transcript?: string;
  timestamp: string;
  leadAddress?: string;
  nextFollowUpDate?: string;
  aiSummary?: {
    motivationScore: number;
    recommendedOfferStrategy: string;
    propertyConditionNotes?: string[];
  };
}

interface CallCardProps {
  call: CallLog;
  onOpenLeadDetail?: (leadId: string) => void;
  onUpdateCallLog?: (updatedCallLog: CallLog) => Promise<void>;
  onDeleteCallLog?: (callLogId: string) => Promise<void>;
}

// --- COMPONENT ---
export default function CallCard({
  call,
  onOpenLeadDetail,
  onUpdateCallLog,
  onDeleteCallLog,
}: CallCardProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(call.notes || '');
  const [editOutcome, setEditOutcome] = useState<CallOutcome>(call.outcome || 'CONNECTED_INTERESTED');

  const handleSave = async () => {
    if (onUpdateCallLog) {
      await onUpdateCallLog({
        ...call,
        notes: editNotes,
        outcome: editOutcome,
      });
    }
    setIsEditing(false);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}m ${remainingSec}s`;
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'OFFER_ACCEPTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Offer Accepted
          </span>
        );
      case 'CONNECTED_INTERESTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Spoke — Interested
          </span>
        );
      case 'CONNECTED_NOT_INTERESTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Spoke — Not Interested
          </span>
        );
      case 'OFFER_REJECTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Offer Rejected
          </span>
        );
      case 'SCHEDULED_CALLBACK':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Callback Scheduled
          </span>
        );
      case 'LEFT_VOICEMAIL':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Left Voicemail
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {outcome.replace('_', ' ')}
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'LISTING_AGENT':
        return <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Listing Agent</span>;
      case 'CO_AGENT':
        return <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded">Co-Agent</span>;
      case 'DIRECT_SELLER':
        return <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Direct Seller</span>;
      case 'CASH_BUYER':
        return <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded">Cash Buyer</span>;
      default:
        return <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{role}</span>;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all shadow-md space-y-3">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl border ${
              call.direction === 'INBOUND'
                ? 'bg-sky-500/20 border-sky-500/30 text-sky-400'
                : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
            }`}
          >
            {call.direction === 'INBOUND' ? (
              <PhoneIncoming className="w-4 h-4" />
            ) : (
              <PhoneOutgoing className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {call.contactName}
              </h3>
              {getRoleBadge(call.contactRole)}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {call.contactPhone}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getOutcomeBadge(call.outcome)}
          <div className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            {formatDuration(call.durationSeconds)}
          </div>

          {onUpdateCallLog && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              title="Edit Call Log Notes & Outcome"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          {onDeleteCallLog && (
            <button
              onClick={async () => {
                if (window.confirm(`Are you sure you want to delete this call log with ${call.contactName}?`)) {
                  await onDeleteCallLog!(call.id);
                }
              }}
              title="Delete Call Log"
              className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Edit Form */}
      {isEditing && (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-amber-400">Edit Call Log Record</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Call Outcome</label>
            <select
              value={editOutcome}
              onChange={(e) => setEditOutcome(e.target.value as CallOutcome)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="CONNECTED_INTERESTED">Spoke — Interested Seller</option>
              <option value="OFFER_ACCEPTED">Offer Accepted</option>
              <option value="OFFER_REJECTED">Offer Rejected</option>
              <option value="SCHEDULED_CALLBACK">Callback Scheduled</option>
              <option value="LEFT_VOICEMAIL">Left Voicemail</option>
              <option value="CONNECTED_NOT_INTERESTED">Spoke — Not Interested</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Call Notes & Conversation Summary</label>
            <textarea
              rows={3}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* Linked Lead Address */}
      {call.leadAddress && (
        <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">{call.leadAddress}</span>
          </div>
          {call.leadId && onOpenLeadDetail && (
            <button
              onClick={() => onOpenLeadDetail(call.leadId!)}
              className="text-amber-400 hover:text-amber-300 text-[11px] font-bold underline cursor-pointer"
            >
              View Lead Deal Card →
            </button>
          )}
        </div>
      )}

      {/* Call Notes & Bullet Points */}
      {call.notes && (
        <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
          <span className="font-semibold text-slate-400 block mb-1">Call Notes:</span>
          <p className="whitespace-pre-wrap">{call.notes}</p>
        </div>
      )}

      {/* Gemini AI Wholesaling Summary Pill */}
      {call.aiSummary && (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-amber-300">Gemini Wholesaling Insights</span>
            </div>
            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-extrabold text-[11px] rounded">
              Seller Motivation: {call.aiSummary.motivationScore}/10
            </span>
          </div>

          <p className="text-slate-300 italic">
            "{call.aiSummary.recommendedOfferStrategy}"
          </p>

          {call.aiSummary.propertyConditionNotes && call.aiSummary.propertyConditionNotes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {call.aiSummary.propertyConditionNotes.map((note, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded text-[10px]"
                >
                  • {note}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transcript Collapsible Drawer */}
      {call.transcript && (
        <div className="pt-1">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>{showTranscript ? 'Hide Raw Call Transcript' : 'Show Raw Call Transcript'}</span>
            {showTranscript ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showTranscript && (
            <div className="mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
              {call.transcript}
            </div>
          )}
        </div>
      )}

      {/* Footer Timestamp */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>Logged at: {new Date(call.timestamp).toLocaleString()}</span>
        {call.nextFollowUpDate && (
          <span className="flex items-center gap-1 text-sky-400 font-semibold">
            <Calendar className="w-3 h-3" /> Next Follow-up: {new Date(call.nextFollowUpDate).toLocaleDateString()}
          </span>
        )}
      </div>

    </div>
  );
}
