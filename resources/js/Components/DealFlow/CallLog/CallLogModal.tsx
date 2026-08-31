import React, { useState, useEffect, useMemo } from 'react';
import { X, Phone, Calendar, AlertCircle, Play, Pause, RotateCcw, Sparkles, UserPlus } from 'lucide-react';
import type {
  Lead, Contact, Buyer, TitleCompany, CallDirection, CallOutcome,
  AISummary, Property, Territory, CallLog,
} from '@/types/dealflow';
import { analyzeCallWithAI } from '@/services/dealflow';
import { DealLinkPicker } from '../Common/deals/DealLinkPicker';
import { ContactIntakePicker, emptyContactSnapshot } from '../Common/contacts/ContactIntakePicker';
import type { ContactIntakeSnapshot } from '../Common/contacts/ContactIntakePicker';

interface CallLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  callLogs?: CallLog[];
  properties?: Property[];
  selectedLead?: Lead;
  initialPhone?: string;
  initialContactName?: string;
  contacts?: Contact[];
  buyers?: Buyer[];
  titleCompanies?: TitleCompany[];
  territories?: Territory[];
  selectedTerritoryId?: string | null;
  onSaveCall: (callData: any) => Promise<void>;
  onCreateContact?: (contactData: Partial<Contact>) => Promise<void>;
  onAddBuyer?: (buyerData: Partial<Buyer>) => Promise<void>;
  onAddTitleCompany?: (titleCompanyData: Partial<TitleCompany>) => Promise<void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<void>;
  onSaveLead?: (leadData: Partial<Lead>) => Promise<Lead | void>;
}

export const CallLogModal: React.FC<CallLogModalProps> = ({
  isOpen, onClose, leads = [], callLogs = [], properties = [], selectedLead,
  initialPhone, initialContactName, contacts = [], buyers = [], titleCompanies = [],
  territories = [], selectedTerritoryId, onSaveCall, onCreateContact, onAddBuyer,
  onAddTitleCompany, onCreateProperty, onSaveLead,
}) => {
  if (!isOpen) return null;

  // ── Deal-link mode toggle (checkbox) ──────────────────────────────────────
  const [linkDealMode, setLinkDealMode] = useState<boolean>(!!selectedLead);
  const [linkedDealIds, setLinkedDealIds] = useState<string[]>(
    selectedLead ? [selectedLead.id] : []
  );

  // ── NEW: attach this call's contact to the linked deal(s) ─────────────────
  const [attachContactToDeal, setAttachContactToDeal] = useState(false);

  // Primary deal = first linked deal (only counts when checkbox is ON)
  const associatedLeadId = linkDealMode ? (linkedDealIds[0] || '') : '';

  // ── Contact intake: single snapshot owned by ContactIntakePicker ──────────
  const [contactSnapshot, setContactSnapshot] = useState<ContactIntakeSnapshot>(() => {
    if (selectedLead) {
      return {
        selectedContactId: '',
        isExistingContactSelected: !!(selectedLead.contactFirstName || selectedLead.contactName || selectedLead.contactPhone),
        firstName: selectedLead.contactFirstName || (selectedLead.contactName || '').split(' ')[0] || '',
        lastName: selectedLead.contactLastName || (selectedLead.contactName || '').split(' ').slice(1).join(' ') || '',
        phone: selectedLead.contactPhone || '',
        email: selectedLead.contactEmail || '',
        role: selectedLead.contactRole || 'LISTING_AGENT',
        company: '',
        draft: { role: selectedLead.contactRole || 'LISTING_AGENT' },
      };
    }
    const snap = emptyContactSnapshot('LISTING_AGENT');
    if (initialContactName) {
      const parts = initialContactName.split(' ');
      snap.firstName = parts[0] || '';
      snap.lastName = parts.slice(1).join(' ') || '';
    }
    if (initialPhone) snap.phone = initialPhone;
    return snap;
  });

  const {
    firstName: contactFirstName, lastName: contactLastName, phone: contactPhone,
    email: contactEmail, role: contactRole, company: contactCompany, draft: contactDraft,
  } = contactSnapshot;

  // ── Call attributes ────────────────────────────────────────────────────────
  const [direction, setDirection] = useState<CallDirection>('OUTBOUND');
  const [outcome, setOutcome] = useState<CallOutcome>('CONNECTED_INTERESTED');
  const [notes, setNotes] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  // ── AI ─────────────────────────────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AISummary | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync snapshot when a selectedLead is passed in (or changes)
  useEffect(() => {
    if (selectedLead) {
      setLinkDealMode(true);
      setLinkedDealIds((prev) => (prev.includes(selectedLead.id) ? prev : [selectedLead.id, ...prev]));
      setContactSnapshot((prev) => ({
        ...prev,
        firstName: selectedLead.contactFirstName || (selectedLead.contactName || '').split(' ')[0] || prev.firstName,
        lastName: selectedLead.contactLastName || (selectedLead.contactName || '').split(' ').slice(1).join(' ') || prev.lastName,
        phone: selectedLead.contactPhone || prev.phone,
        email: selectedLead.contactEmail || prev.email,
        role: selectedLead.contactRole || prev.role,
        isExistingContactSelected: prev.isExistingContactSelected || !!(selectedLead.contactFirstName || selectedLead.contactName || selectedLead.contactPhone),
      }));
    }
  }, [selectedLead]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => setDurationSeconds((prev) => prev + 1), 1000);
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

  const selectedPropertyLead = useMemo(
    () => leads.find((l) => l.id === associatedLeadId),
    [leads, associatedLeadId]
  );

  // DealLinkPicker change handler: update links + auto-fill contact if empty
  const handleLinkChange = (ids: string[]) => {
    setLinkedDealIds(ids);
    const newest = ids[ids.length - 1];
    const lead = leads.find((l) => l.id === newest);
    if (!lead) return;
    setContactSnapshot((prev) => {
      if (prev.firstName || prev.phone) return prev;
      return {
        ...prev,
        firstName: lead.contactFirstName || (lead.contactName || '').split(' ')[0] || '',
        lastName: lead.contactLastName || (lead.contactName || '').split(' ').slice(1).join(' ') || '',
        phone: lead.contactPhone || '',
        email: lead.contactEmail || prev.email,
        role: lead.contactRole || prev.role,
      };
    });
  };

  const handleRunAIAnalysis = async () => {
    if (!notes && !transcript) {
      setAiError('Please enter some call notes or transcript before running AI analysis.');
      return;
    }
    setAiError(null);
    setIsAnalyzing(true);
    try {
      const summary = await analyzeCallWithAI({
        transcript, notes,
        contactName: `${contactFirstName} ${contactLastName}`.trim(),
        contactRole,
        propertyAddress: selectedPropertyLead ? selectedPropertyLead.propertyAddress : 'On-Market Lead',
      });
      setAiResult(summary);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'AI Call analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactFirstName.trim() || !contactPhone.trim()) return;
    setIsSaving(true);
    try {
      const fullContactName = `${contactFirstName.trim()} ${contactLastName.trim()}`.trim();
      const shouldAttachContact = linkDealMode && attachContactToDeal && linkedDealIds.length > 0;

      // Only create CRM records for brand-new (unsaved) contacts
      if (!contactSnapshot.isExistingContactSelected) {
        if (contactRole === 'CASH_BUYER' && onAddBuyer) {
          try {
            await onAddBuyer({
              name: fullContactName, firstName: contactFirstName, lastName: contactLastName,
              company: contactCompany || contactDraft.company, phone: contactPhone, email: contactEmail,
              targetZipCodes: (contactDraft.targetMarkets || '').split(',').map((z) => z.trim()).filter(Boolean),
              buyBoxType: contactDraft.buyBoxPropertyTypes || 'Single Family Fix & Flip',
              maxBudget: Number(contactDraft.maxBudget) || 300000,
              buyerCategory: contactDraft.buyerCategory || 'CASH_FLIPPER',
              isLandBuyer: !!contactDraft.isLandBuyer, verifiedFunds: !!contactDraft.pofVerified,
              dealsClosedCount: 0,
            });
          } catch (err) { console.error('Failed to create cash buyer:', err); }
        } else if (contactRole === 'TITLE_COMPANY' && onAddTitleCompany) {
          try {
            await onAddTitleCompany({
              name: contactDraft.company || contactCompany || `${fullContactName} Escrow`,
              officerName: fullContactName, officerFirstName: contactFirstName, officerLastName: contactLastName,
              phone: contactPhone, email: contactEmail,
              address: contactDraft.agencyStreetAddress || '', city: contactDraft.agencyCity || 'Springfield',
              state: contactDraft.agencyState || 'IL', zip: contactDraft.agencyZip || '',
              investorFriendly: !!contactDraft.investorFriendly, assignmentFeeFriendly: !!contactDraft.assignmentFeeFriendly,
              doubleClosingSupported: !!contactDraft.doubleClosingSupported,
              preferredEMDAmount: Number(contactDraft.preferredEMDAmount) || 2500,
            });
          } catch (err) { console.error('Failed to create title company:', err); }
        }
        if (onCreateContact) {
          try {
            await onCreateContact({
              ...contactDraft,
              firstName: contactFirstName, lastName: contactLastName, role: contactRole,
              phone: contactPhone, email: contactEmail, company: contactCompany || contactDraft.company,
              associatedPropertyAddress: selectedPropertyLead ? selectedPropertyLead.propertyAddress : undefined,
              leadId: associatedLeadId || undefined,
              // NEW: stamp the linked deal(s) onto the brand-new contact record
              dealIds: shouldAttachContact ? linkedDealIds : undefined,
              notes: contactDraft.notes,
              source: 'CALL_LOG',
            });
          } catch (err) { console.error('Failed to create CRM contact:', err); }
        }
      }

      await onSaveCall({
        leadId: associatedLeadId || undefined,
        leadAddress: selectedPropertyLead ? selectedPropertyLead.propertyAddress : undefined,
        dealIds: linkDealMode ? linkedDealIds : undefined,
        // NEW: tells the parent to sync an EXISTING contact onto the deal too
        attachContactToDeal: shouldAttachContact,
        contactDealIds: shouldAttachContact ? linkedDealIds : undefined,
        contactName: fullContactName, contactFirstName, contactLastName, contactPhone, contactRole,
        timestamp: new Date().toISOString(),
        durationSeconds: durationSeconds || 120,
        direction, outcome, notes, transcript,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Log / Track Phone Call
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-semibold rounded-full border border-emerald-500/30 uppercase">Wholesaling Dialer</span>
              </h2>
              <p className="text-xs text-slate-400">Track calls to listing agents, sellers, title companies, contractors, or cash buyers.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-xs">
            {/* Live Call Timer & Direction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between sm:justify-start space-x-3">
                <div className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">{formatTimer(durationSeconds)}</div>
                <div className="flex items-center space-x-1.5">
                  {!timerActive ? (
                    <button type="button" onClick={() => setTimerActive(true)} className="p-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1 cursor-pointer">
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Call
                    </button>
                  ) : (
                    <button type="button" onClick={() => setTimerActive(false)} className="p-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer">
                      <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                    </button>
                  )}
                  <button type="button" onClick={() => { setTimerActive(false); setDurationSeconds(0); }} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition-colors cursor-pointer" title="Reset Timer">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <span className="text-xs text-slate-400 font-medium">Direction:</span>
                <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                  <button type="button" onClick={() => setDirection('OUTBOUND')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${direction === 'OUTBOUND' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}>Outbound</button>
                  <button type="button" onClick={() => setDirection('INBOUND')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${direction === 'INBOUND' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}>Inbound</button>
                </div>
              </div>
            </div>

            {/* ── Mode Toggle Checkbox ──────────────────────────────────────── */}
            <label className="flex items-center gap-3 p-3 bg-slate-900/60 border border-amber-500/30 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
              <input
                type="checkbox"
                checked={linkDealMode}
                onChange={(e) => {
                  setLinkDealMode(e.target.checked);
                  // No linked deal = no reason to attach the contact to a deal
                  if (!e.target.checked) setAttachContactToDeal(false);
                }}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0"
              />
              <div>
                <span className="block text-xs font-bold text-amber-400">Add/Link deal + add/link property</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  {linkDealMode
                    ? 'Deal mode ON — attach this call to a deal (search or quick-add) + property.'
                    : 'Deal mode OFF — log this call against a contact only.'}
                </span>
              </div>
            </label>

            {/* 1. Deal Link Picker (ONLY when checkbox is checked) */}
            {linkDealMode && (
              <DealLinkPicker
                linkedDealIds={linkedDealIds}
                onLinkChange={handleLinkChange}
                availableDeals={leads}
                label="Link to Deal (Searchable)"
                onCreateDeal={onSaveLead}
                onCreateProperty={onCreateProperty}
                territories={territories}
                properties={properties}
                callLogs={callLogs}
                currentContact={{ firstName: contactFirstName, lastName: contactLastName, phone: contactPhone, role: contactRole }}
              />
            )}

            {/* ── NEW: Attach-contact-to-deal checkbox (ONLY when deal mode is ON) ── */}
            {linkDealMode && (
              <label className="flex items-start gap-3 p-3 bg-slate-900/60 border border-emerald-500/30 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={attachContactToDeal}
                  onChange={(e) => setAttachContactToDeal(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer shrink-0 mt-0.5"
                />
                <div>
                  <span className="block text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" /> Add this contact to the linked deal
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    {attachContactToDeal
                      ? `This call's contact will also be attached as a stakeholder on ${
                          selectedPropertyLead
                            ? `"${selectedPropertyLead.dealName || selectedPropertyLead.propertyAddress}"`
                            : 'the linked deal'
                        }.`
                      : 'Leave unchecked to save the contact only to this call log.'}
                  </span>
                </div>
              </label>
            )}

            {/* 2. Contacts (external brick — always visible) */}
            <ContactIntakePicker
              contacts={contacts}
              buyers={buyers}
              titleCompanies={titleCompanies}
              leads={leads}
              snapshot={contactSnapshot}
              onSnapshotChange={setContactSnapshot}
              onCreateContact={onCreateContact}
              onAddBuyer={onAddBuyer}
              onAddTitleCompany={onAddTitleCompany}
              associatedPropertyAddress={selectedPropertyLead?.propertyAddress}
              leadId={associatedLeadId || undefined}
              label="Search Existing Contacts or Add New"
            />

            {/* 3. Outcome / Notes / AI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Call Outcome *</label>
                <select value={outcome} onChange={(e) => setOutcome(e.target.value as CallOutcome)} className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-semibold">
                  <option value="CONNECTED_INTERESTED">Connected — Interested / Open to Offer</option>
                  <option value="CONNECTED_NOT_INTERESTED">Connected — Not Interested / Too High</option>
                  <option value="OFFER_ACCEPTED">Offer Accepted!</option>
                  <option value="OFFER_REJECTED">Offer Rejected</option>
                  <option value="SCHEDULED_CALLBACK">Scheduled Callback</option>
                  <option value="LEFT_VOICEMAIL">Left Voicemail</option>
                  <option value="NO_ANSWER">No Answer</option>
                  <option value="WRONG_NUMBER">Wrong Number</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Next Follow-up Task Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input type="date" value={nextFollowUpDate} onChange={(e) => setNextFollowUpDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Call Bullet Points & Agent Notes</span>
                <span className="text-[10px] text-slate-500">Motivation, roof condition, timeline...</span>
              </label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Key conversation takeaways, motivation level, roof/HVAC condition, seller timeline..." className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Raw Call Transcript / Audio Transcript Notes (Optional)</span>
                <span className="text-[10px] text-slate-500">Paste verbatim call audio dictation for AI</span>
              </label>
              <textarea rows={2} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste verbatim agent dialogue or dictation transcript here for AI analysis..." className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400" />
            </div>
            <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
                  <span>Gemini Wholesaling AI Call Analyzer</span>
                </div>
                <button type="button" onClick={handleRunAIAnalysis} disabled={isAnalyzing} className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-xs hover:bg-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                  {isAnalyzing ? (<><Sparkles className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>) : (<><Sparkles className="w-3.5 h-3.5" /> Extract Wholesaling Insights</>)}
                </button>
              </div>
              {aiError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}
              {aiResult && (
                <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Motivation Score:</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">{aiResult.motivationScore} / 10</span>
                  </div>
                  {aiResult.askingPriceMentioned && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Asking Price Mentioned:</span>
                      <span className="font-bold text-emerald-400 font-mono">${aiResult.askingPriceMentioned.toLocaleString()}</span>
                    </div>
                  )}
                  {aiResult.recommendedOfferStrategy && (
                    <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20 text-amber-200">
                      <strong>Recommended Strategy:</strong> {aiResult.recommendedOfferStrategy}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-4 bg-slate-950/90 border-t border-slate-800 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSaving || !contactFirstName.trim() || !contactPhone.trim()} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50">
              {isSaving ? 'Saving Call Record...' : 'Save Call Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};