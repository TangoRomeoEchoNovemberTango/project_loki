import React, { useState } from 'react';
import { X, Landmark, Sparkles } from 'lucide-react';
import type {
  Lead, Contact, Buyer, TitleCompany, ContactRole, LeadStage, Territory,
  PipelineType, GovListType, Property, CallLog,
} from '@/types/dealflow';
import { DealTypeSelector } from '../Common/financials/DealTypeSelector';
import { PipelineStageSelector } from '../Common/leads/PipelineStageSelector';
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
  onSaveLead: (leadData: Partial<Lead>) => Promise<void>;
  territories?: Territory[];
  contacts?: Contact[];
  properties?: Property[];
  leads?: Lead[];
  callLogs?: CallLog[];
  buyers?: Buyer[];
  titleCompanies?: TitleCompany[];
  selectedTerritoryId?: string | null;
  onCreateContact?: (contactData: Partial<Contact>) => Promise<void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<void>;
  onAddBuyer?: (buyerData: Partial<Buyer>) => Promise<void>;
  onAddTitleCompany?: (titleCompanyData: Partial<TitleCompany>) => Promise<void>;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen, onClose, onSaveLead, territories = [], contacts = [], properties = [],
  leads = [], callLogs = [], buyers = [], titleCompanies = [], selectedTerritoryId,
  onCreateContact, onCreateProperty, onAddBuyer, onAddTitleCompany,
}) => {
  if (!isOpen) return null;

  // ── Deal type / stage ──────────────────────────────────────────────────────
  const [dealType, setDealType] = useState<PipelineType>('OFF_MARKET_GOV');
  const [govListType, setGovListType] = useState<GovListType>('PROBATE');
  const [stage, setStage] = useState<LeadStage>('GOV_LIST_PULLED');

  // ── Property / lead link (owned by PropertyLinkPicker) ────────────────────
  const [leadId, setLeadId] = useState('');

  // ── Contact intake (single snapshot owned by ContactIntakePicker) ─────────
  const [contactSnapshot, setContactSnapshot] = useState<ContactIntakeSnapshot>(emptyContactSnapshot());

  // Destructure for parity with downstream logic (currentContact + submit)
  const {
    firstName: contactFirstName, lastName: contactLastName, phone: contactPhone,
    email: contactEmail, role: contactRole, company: contactCompany, draft: contactDraft,
  } = contactSnapshot;

  // ── Notes / UI ─────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedLeadObj = leads.find((l) => l.id === leadId);

  const handleDealTypeChange = (newType: PipelineType) => {
    setDealType(newType);
    const defaultRole: ContactRole = newType === 'OFF_MARKET_GOV' ? 'DIRECT_SELLER' : 'LISTING_AGENT';
    setStage(newType === 'OFF_MARKET_GOV' ? 'GOV_LIST_PULLED' : 'NEW');
    setContactSnapshot((prev) => ({ ...prev, role: defaultRole, draft: { ...prev.draft, role: defaultRole } }));
  };

  // PropertyLinkPicker selection: link the lead + auto-fill contact only if empty
  const handleLeadSelect = (selectedLeadId: string) => {
    setLeadId(selectedLeadId);
    const lead = leads.find((l) => l.id === selectedLeadId);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true); setErrorMsg('');
      if (!leadId) {
        setErrorMsg('No property linked yet — use "+ Quick Add Property" in the Property Link section to create the property & wholesale lead first, then save.');
        setIsSaving(false);
        return;
      }
      // 1) Persist a brand-new contact intake (picker already saved anything marked existing)
      if (!contactSnapshot.isExistingContactSelected && contactFirstName.trim() && contactPhone.trim() && onCreateContact) {
        await onCreateContact({
          ...contactDraft,
          firstName: contactFirstName, lastName: contactLastName, role: contactRole,
          phone: contactPhone, email: contactEmail, company: contactCompany || contactDraft.company,
          associatedPropertyAddress: selectedLeadObj?.propertyAddress,
          leadId: leadId || undefined,
          notes: contactDraft.notes,
          source: 'ADD_LEAD',
        });
      }
      // 2) Sync the deal: stage, deal type, contact & notes onto the linked lead
      await onSaveLead({
        id: leadId,
        dealType,
        govListType: dealType === 'OFF_MARKET_GOV' ? govListType : undefined,
        stage,
        contactName: `${contactFirstName} ${contactLastName}`.trim() || undefined,
        contactFirstName: contactFirstName || undefined,
        contactLastName: contactLastName || undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
        contactRole,
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

            {/* 1. Market Deal Type (external brick) */}
            <DealTypeSelector dealType={dealType} govListType={govListType} onDealTypeChange={handleDealTypeChange} onGovListTypeChange={setGovListType} />

            {/* 2. Target Pipeline Stage (external brick) */}
            <PipelineStageSelector
              value={stage}
              onChange={(s) => setStage(s as LeadStage)}
              stages={dealType === 'OFF_MARKET_GOV' ? OFF_MARKET_STAGES : ON_MARKET_STAGES}
              hint={`Defaults to Column 1 (${dealType === 'OFF_MARKET_GOV' ? '1. Gov List Pulled' : 'New On-Market'})`}
            />

            {/* 3. Property / Lead link + quick add (external brick) */}
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

            {/* 4. Contact intake + quick add (external brick) */}
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
              associatedPropertyAddress={selectedLeadObj?.propertyAddress}
              leadId={leadId || undefined}
              label="Search Existing Contacts or Add New"
            />

            {/* 5. Initial Deal Notes (external brick) */}
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
