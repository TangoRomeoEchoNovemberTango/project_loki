import React, { useState, useEffect } from 'react';
import { X, Landmark, Sparkles } from 'lucide-react';
import type {
  Lead, Contact, ContactRole, LeadStage, Territory,
  PipelineType, GovListType, Property, CallLog,
} from '@/types/dealflow';
import { DealTypeSelector } from '../Common/financials/DealTypeSelector';
import { PipelineStageSelector } from '../Common/leads/PipelineStageSelector';
import { DealIdentitySection } from '../Common/deals/DealIdentitySection';
import { DealNotesForm } from '../Common/leads/DealNotesForm';
import { PropertyLinkPicker } from '../Common/properties/PropertyLinkPicker';
import { ContactIntakePicker, emptyContactSnapshot } from '../Common/contacts/ContactIntakePicker';
import type { ContactIntakeSnapshot } from '../Common/contacts/ContactIntakePicker';

// ── Pipeline stage options (fed into PipelineStageSelector) ──────────────────
const OFF_MARKET_STAGES = [
  { value: 'GOV_LIST_PULLED', label: '1. GOV LIST PULLED (Column 1 - Cold Lead In)' },
  { value: 'SKIP_TRACED', label: '2. SKIP-TRACED (Column 2 - Phone/Email Verified)' },
  { value: 'MCTP_QUALIFIED', label: '3. MCTP QUALIFIED (Column 3 - 4-Pillars Verified)' },
  { value: 'OFFER_SENT_PDF', label: '4. OFFER SENT (PDF) (Column 4 - Purchase Agreement Delivered)' },
  { value: 'TITLE_EMD_SUBMITTED', label: '5. UNDER CONTRACT & TITLE (Column 5 - EMD Deposited)' },
  { value: 'DISPO_BUYER_ASSIGNED', label: '6. CASH BUYER DISPO (Column 6 - Buyer Assigned)' },
  { value: 'CLOSED', label: '7. CLOSED / WHOLESALE FEE (Column 7 - Fee Collected)' },
];

const ON_MARKET_STAGES = [
  { value: 'NEW', label: 'New On-Market (Column 1)' },
  { value: 'CONTACTED', label: 'Agent Contacted (Column 2)' },
  { value: 'VALUING', label: 'Valuation & MAO (Column 3)' },
  { value: 'OFFER_SENT', label: 'Offer Sent (LOI) (Column 4)' },
  { value: 'NEGOTIATING', label: 'Negotiating (Column 5)' },
  { value: 'UNDER_CONTRACT_ACQ', label: 'Under Contract (Acq) (Column 6)' },
  { value: 'DISPOSITION', label: 'Disposition (Buyers) (Column 7)' },
  { value: 'CLOSED', label: 'Closed / Fee Collected (Column 8)' },
];

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ✅ UPDATED: return the created object so we can grab its database ID
  onSaveLead: (leadData: Partial<Lead>) => Promise<Lead | void>;
  onCreateContact?: (contactData: Partial<Contact>) => Promise<Contact | void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<Property | void>;
  territories?: Territory[];
  contacts?: Contact[];
  properties?: Property[];
  leads?: Lead[];
  callLogs?: CallLog[];
  selectedTerritoryId?: string | null;
  // ❌ REMOVED: buyers, titleCompanies, onAddBuyer, onAddTitleCompany (ghost tables!)
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen, onClose, onSaveLead, onCreateContact, onCreateProperty,
  territories = [], contacts = [], properties = [], leads = [], callLogs = [],
  selectedTerritoryId,
}) => {
  // ── Deal Identity State ───────────────────────────────────────────────────
  const [dealNumber, setDealNumber] = useState('');
  const [dealName, setDealName] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  // Auto-generate Deal Number and Timestamp when modal opens
  useEffect(() => {
    if (isOpen) {
      const year = new Date().getFullYear();
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setDealNumber(`DEAL-${year}-${randomId}`);
      setCreatedAt(new Date().toISOString());
    }
  }, [isOpen]);

  // ── Deal type / stage ─────────────────────────────────────────────────────
  const [dealType, setDealType] = useState<PipelineType>('OFF_MARKET_GOV');
  const [govListType, setGovListType] = useState<GovListType>('PROBATE');
  const [stage, setStage] = useState<LeadStage>('GOV_LIST_PULLED');

  // ── Property / lead link (owned by PropertyLinkPicker) ────────────────────
  // Holds whatever ID the picker hands back (property id or legacy lead id).
  const [leadId, setLeadId] = useState('');

  // ── Contact intake (single snapshot owned by ContactIntakePicker) ─────────
  const [contactSnapshot, setContactSnapshot] = useState<ContactIntakeSnapshot>(emptyContactSnapshot());
  const {
    firstName: contactFirstName, lastName: contactLastName, phone: contactPhone,
    email: contactEmail, role: contactRole, company: contactCompany, draft: contactDraft,
  } = contactSnapshot;

  // ── Notes / UI ────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ✅ Lookups: the picker may hand back a property id OR a legacy lead id
  const selectedPropertyObj = properties.find((p) => p.id === leadId);
  const selectedLeadObj = leads.find((l) => l.id === leadId);

  // ⚠️ FIX: early return moved AFTER all hooks (hooks must run in the same
  // order every render — the old placement was a latent crash bug).
  if (!isOpen) return null;

  const handleDealTypeChange = (newType: PipelineType) => {
    setDealType(newType);
    const defaultRole: ContactRole = newType === 'OFF_MARKET_GOV' ? 'DIRECT_SELLER' : 'LISTING_AGENT';
    setStage(newType === 'OFF_MARKET_GOV' ? 'GOV_LIST_PULLED' : 'NEW');
    setContactSnapshot((prev) => ({ ...prev, role: defaultRole, draft: { ...prev.draft, role: defaultRole } }));
  };

  const handleLeadSelect = (selectedId: string) => {
    setLeadId(selectedId);
    // Normalized auto-fill: walk lead → contactId → contacts table
    const lead = leads.find((l) => l.id === selectedId);
    const linkedContact = lead?.contactId ? contacts.find((c) => c.id === lead.contactId) : undefined;
    if (!linkedContact) return;
    setContactSnapshot((prev) => {
      if (prev.firstName || prev.phone) return prev;
      return {
        ...prev,
        isExistingContactSelected: true,
        selectedContactId: linkedContact.id,
        firstName: linkedContact.firstName || '',
        lastName: linkedContact.lastName || '',
        phone: linkedContact.phone || '',
        email: linkedContact.email || prev.email,
        role: (linkedContact.primaryRole || linkedContact.role || prev.role) as ContactRole,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      // ════════════════════════════════════════════════════════════════════
      // STEP 1: Resolve the CONTACT ID (optional linking!)
      // ════════════════════════════════════════════════════════════════════
      let finalContactId: string | null =
        contactSnapshot.selectedContactId || selectedLeadObj?.contactId || null;

      if (!contactSnapshot.isExistingContactSelected && contactFirstName.trim() && contactPhone.trim() && onCreateContact) {
        // Create the contact FIRST, catch the receipt, grab the new ID
        const newContact = await onCreateContact({
          ...contactDraft,
          firstName: contactFirstName,
          lastName: contactLastName,
          phone: contactPhone,
          email: contactEmail,
          company: contactCompany || contactDraft.company,
          roles: [contactRole],          // ✅ NEW multi-role array
          primaryRole: contactRole,      // ✅ NEW primary hat
          role: contactRole,             // legacy bridge until picker migrates
          associatedPropertyAddress: selectedPropertyObj?.streetAddress,
          leadId: leadId || undefined,
          notes: contactDraft.notes,
          source: 'ADD_LEAD',
        });
        if (newContact && newContact.id) finalContactId = newContact.id;
      }

      // ════════════════════════════════════════════════════════════════════
      // STEP 2: Resolve the PROPERTY ID (optional linking!)
      // ════════════════════════════════════════════════════════════════════
      const finalPropertyId =
        selectedPropertyObj?.id ?? selectedLeadObj?.propertyId ?? null;

      // ════════════════════════════════════════════════════════════════════
      // STEP 3: Save the NORMALIZED LEAD (IDs only — no raw text!)
      // ════════════════════════════════════════════════════════════════════
      await onSaveLead({
        id: selectedLeadObj?.id, // set only when updating an existing lead
        dealNumber,
        dealName,
        createdAt,
        dealType,
        govListType: dealType === 'OFF_MARKET_GOV' ? govListType : undefined,
        stage,
        propertyId: finalPropertyId,
        contactId: finalContactId,
        notes: notes.trim() || undefined,
        nextFollowUpDate: new Date(Date.now() + 86400000).toISOString(),
      });

      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create deal in pipeline.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-hidden">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 shrink-0 bg-slate-900">
          <div>
            <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Wholesaling CRM Intake Engine
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-400" /> Create New Wholesale Deal in Pipeline
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
            {errorMsg && <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 font-semibold">{errorMsg}</div>}

            {/* ── Deal Identity Section ───────────────────────────────────── */}
            <DealIdentitySection
              dealNumber={dealNumber}
              createdAt={createdAt}
              dealName={dealName}
              onDealNameChange={setDealName}
            />

            {/* 1. Market Deal Type */}
            <DealTypeSelector
              dealType={dealType}
              govListType={govListType}
              onDealTypeChange={handleDealTypeChange}
              onGovListTypeChange={setGovListType}
            />

            {/* 2. Target Pipeline Stage */}
            <PipelineStageSelector
              value={stage}
              onChange={(s) => setStage(s as LeadStage)}
              stages={dealType === 'OFF_MARKET_GOV' ? OFF_MARKET_STAGES : ON_MARKET_STAGES}
              hint={`Defaults to Column 1 (${dealType === 'OFF_MARKET_GOV' ? '1. Gov List Pulled' : 'New On-Market'})`}
            />

            {/* 3. Property / Lead link + quick add */}
            <PropertyLinkPicker
              leads={leads}
              properties={properties}
              callLogs={callLogs}
              selectedLeadId={leadId}
              onSelectLead={handleLeadSelect}
              onUnlink={() => setLeadId('')}
              territories={territories}
              selectedTerritoryId={selectedTerritoryId}
              currentContact={{ firstName: contactFirstName, lastName: contactLastName, phone: contactPhone, role: contactRole }}
              onSaveLead={onSaveLead}
              onCreateProperty={onCreateProperty}
              onContactSuggestion={(s) => setContactSnapshot((prev) => ({ ...prev, firstName: s.firstName, lastName: s.lastName, phone: s.phone, role: s.role, draft: { ...prev.draft, role: s.role } }))}
            />

            {/* 4. Contact intake (ghost-table props removed) */}
            <ContactIntakePicker
              contacts={contacts}
              leads={leads}
              snapshot={contactSnapshot}
              onSnapshotChange={setContactSnapshot}
              onCreateContact={onCreateContact}
              associatedPropertyAddress={selectedPropertyObj?.streetAddress}
              leadId={leadId || undefined}
              label="Search Existing Contacts or Add New"
            />

            {/* 5. Initial Deal Notes */}
            <DealNotesForm notes={notes} onNotesChange={setNotes} rows={2} />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 p-4 bg-slate-950/90 border-t border-slate-800 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg text-xs cursor-pointer hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50">
              <Sparkles className="w-4 h-4" />
              {isSaving ? 'Saving...' : '✨ Create Deal in Pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};