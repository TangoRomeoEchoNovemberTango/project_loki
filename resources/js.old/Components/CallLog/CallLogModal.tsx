import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Clock,
  Sparkles,
  User,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

// --- INLINED TYPES ---
export type ContactRole = 'LISTING_AGENT' | 'CO_AGENT' | 'DIRECT_SELLER' | 'CASH_BUYER' | 'TITLE_COMPANY' | 'CONTRACTOR' | string;
export type CallDirection = 'INBOUND' | 'OUTBOUND';
export type CallOutcome = 'CONNECTED_INTERESTED' | 'CONNECTED_NOT_INTERESTED' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED' | 'SCHEDULED_CALLBACK' | 'LEFT_VOICEMAIL' | 'NO_ANSWER' | 'WRONG_NUMBER';

export interface AISummary {
  motivationScore: number;
  sentiment: 'VERY_POSITIVE' | 'HESITANT' | 'NEGATIVE' | string;
  propertyConditionNotes?: string[];
  agentObjections?: string[];
  recommendedOfferStrategy: string;
}

export interface Lead {
  id: string;
  propertyAddress: string;
  city: string;
  contactName: string;
  contactPhone: string;
  contactRole: ContactRole;
  valuation?: {
    listPrice?: number;
  };
}

interface CallLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  selectedLead?: Lead;
  initialPhone?: string;
  initialContactName?: string;
  onSaveCall: (callData: any) => Promise<void>;
}

// --- COMPONENT ---
export default function CallLogModal({
  isOpen,
  onClose,
  leads,
  selectedLead,
  initialPhone,
  initialContactName,
  onSaveCall,
}: CallLogModalProps) {
  if (!isOpen) return null;

  // Form State
  const [associatedLeadId, setAssociatedLeadId] = useState<string>(selectedLead?.id || '');
  const [contactName, setContactName] = useState<string>(
    selectedLead?.contactName || initialContactName || ''
  );
  const [contactPhone, setContactPhone] = useState<string>(
    selectedLead?.contactPhone || initialPhone || ''
  );
  const [contactRole, setContactRole] = useState<ContactRole>(
    selectedLead?.contactRole || 'LISTING_AGENT'
  );
  const [direction, setDirection] = useState<CallDirection>('OUTBOUND');
  const [outcome, setOutcome] = useState<CallOutcome>('CONNECTED_INTERESTED');
  const [notes, setNotes] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  // Timer State
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AISummary | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync selectedLead or initial contact info when changed
  useEffect(() => {
    if (selectedLead) {
      setAssociatedLeadId(selectedLead.id);
      setContactName(selectedLead.contactName);
      setContactPhone(selectedLead.contactPhone);
      setContactRole(selectedLead.contactRole);
    } else {
      if (initialContactName) setContactName(initialContactName);
      if (initialPhone) setContactPhone(initialPhone);
    }
  }, [selectedLead, initialContactName, initialPhone]);

  // Handle lead selection dropdown
  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lId = e.target.value;
    setAssociatedLeadId(lId);
    const found = leads.find((l) => l.id === lId);
    if (found) {
      setContactName(found.contactName);
      setContactPhone(found.contactPhone);
      setContactRole(found.contactRole);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!timerActive && durationSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, durationSeconds]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  // AI Call Breakdown (MOCKED for UI testing)
  const handleRunAIAnalysis = async () => {
    if (!notes && !transcript) {
      setAiError('Please enter some call notes or transcript before running AI analysis.');
      return;
    }
    setAiError(null);
    setIsAnalyzing(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockSummary: AISummary = {
        motivationScore: 8,
        sentiment: 'VERY_POSITIVE',
        propertyConditionNotes: ['Roof needs minor repairs', 'HVAC is 10+ years old'],
        agentObjections: ['Seller wants to wait until spring to list'],
        recommendedOfferStrategy: 'Offer 70% ARV minus repairs. Emphasize quick close and no contingencies to overcome spring timeline objection.',
      };

      setAiResult(mockSummary);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'AI Call analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save Call Log
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;

    setIsSaving(true);
    try {
      const currentLead = leads.find((l) => l.id === associatedLeadId);
      await onSaveCall({
        leadId: associatedLeadId || undefined,
        leadAddress: currentLead ? currentLead.propertyAddress : undefined,
        contactName,
        contactPhone,
        contactRole,
        timestamp: new Date().toISOString(),
        durationSeconds: durationSeconds || 120, // default 2m if untimed
        direction,
        outcome,
        notes,
        transcript,
        aiSummary: aiResult || undefined,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined,
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">

        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Log / Track Phone Call
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-semibold rounded-full border border-emerald-500/30 uppercase">
                  Wholesaling Dialer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Track every call to listing agents, sellers, title companies, or buyers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* Top Timer Bar & Direction Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            {/* Live Call Timer */}
            <div className="flex items-center justify-between sm:justify-start space-x-3">
              <div className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">
                {formatTimer(durationSeconds)}
              </div>
              <div className="flex items-center space-x-1.5">
                {!timerActive ? (
                  <button
                    type="button"
                    onClick={() => setTimerActive(true)}
                    className="p-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Start Call
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTimerActive(false)}
                    className="p-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTimerActive(false);
                    setDurationSeconds(0);
                  }}
                  className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inbound / Outbound Direction */}
            <div className="flex items-center justify-end space-x-2">
              <span className="text-xs text-slate-400 font-medium">Direction:</span>
              <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDirection('OUTBOUND')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    direction === 'OUTBOUND'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Outbound
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('INBOUND')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    direction === 'INBOUND'
                      ? 'bg-sky-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Inbound
                </button>
              </div>
            </div>
          </div>

          {/* Lead & Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Associated Property Lead */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link to Property / Lead (Optional)
              </label>
              <select
                value={associatedLeadId}
                onChange={handleLeadChange}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">-- General / Unlinked Contact Call --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.propertyAddress} ({l.city}) — ${l.valuation?.listPrice?.toLocaleString()} list
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contact Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contact Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Contact Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contact Role
              </label>
              <select
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value as ContactRole)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="LISTING_AGENT">Listing Agent (On-Market)</option>
                <option value="CO_AGENT">Co-Listing Agent</option>
                <option value="DIRECT_SELLER">Direct Seller (FSBO / Off-Market)</option>
                <option value="CASH_BUYER">Cash Buyer / Investor</option>
                <option value="TITLE_COMPANY">Title / Escrow Officer</option>
                <option value="CONTRACTOR">Contractor / Repair Estimator</option>
              </select>
            </div>

            {/* Call Outcome */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Call Outcome *
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as CallOutcome)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="CONNECTED_INTERESTED">Spoke — Interested / Open to Offer</option>
                <option value="CONNECTED_NOT_INTERESTED">Spoke — Not Interested / Firm Price</option>
                <option value="OFFER_ACCEPTED">🎉 Cash Offer Accepted!</option>
                <option value="OFFER_REJECTED">Offer Rejected</option>
                <option value="SCHEDULED_CALLBACK">Scheduled Callback</option>
                <option value="LEFT_VOICEMAIL">Left Voicemail</option>
                <option value="NO_ANSWER">No Answer</option>
                <option value="WRONG_NUMBER">Wrong Number</option>
              </select>
            </div>
          </div>

          {/* Call Notes & Transcript */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Call Bullet Points & Agent Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key conversation takeaways, motivation level, roof/HVAC condition, seller timeline..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Raw Call Transcript / Audio Transcript Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste verbatim agent dialogue or dictation transcript here for AI analysis..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* AI Call Breakdown Trigger */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-xs font-bold text-amber-300">
                  Gemini Wholesaling AI Call Analyzer
                </span>
              </div>
              <button
                type="button"
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold rounded-lg text-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract Wholesaling Insights</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800/50 mb-2">
                {aiError}
              </p>
            )}

            {/* AI Result Card */}
            {aiResult && (
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Motivation Score:</span>
                    <span className="px-2 py-0.5 font-extrabold rounded bg-amber-400 text-slate-950 text-xs">
                      {aiResult.motivationScore}/10
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Sentiment:</span>
                    <span
                      className={`px-2 py-0.5 font-bold rounded ${
                        aiResult.sentiment === 'VERY_POSITIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : aiResult.sentiment === 'HESITANT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {aiResult.sentiment}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-slate-300 block mb-1">
                      Property Condition Notes:
                    </span>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                      {aiResult.propertyConditionNotes?.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300 block mb-1">
                      Agent Objections:
                    </span>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                      {aiResult.agentObjections && aiResult.agentObjections.length > 0 ? (
                        aiResult.agentObjections.map((o, idx) => <li key={idx}>{o}</li>)
                      ) : (
                        <li className="text-slate-500 italic">No objections raised</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-1">
                    Recommended Offer Strategy:
                  </span>
                  <p className="text-slate-300">{aiResult.recommendedOfferStrategy}</p>
                </div>
              </div>
            )}
          </div>

          {/* Next Follow Up Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Next Follow-up Task Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-lg text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving Call Record...' : 'Save Call Record'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
