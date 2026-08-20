import React, { useState, useEffect } from 'react';
import { X, Building, CheckCircle2, Save } from 'lucide-react';
import type {
  Property, Lead, Contact, Buyer, TitleCompany, Territory, ContactRole, CallLog,
} from '@/types/dealflow';
import { PropertyLinkPicker } from '../Common/properties/PropertyLinkPicker';
import { ContactIntakePicker, emptyContactSnapshot } from '../Common/contacts/ContactIntakePicker';
import type { ContactIntakeSnapshot } from '../Common/contacts/ContactIntakePicker';
import { PropertyNotesForm } from '../Common/properties/PropertyNotesForm';
import { CrmLinkagesSection } from '../Common/properties/CrmLinkagesSection';

interface PropertyFormModalProps {
  isOpen: boolean;
  propertyToEdit?: Property | null;
  leads: Lead[];
  contacts: Contact[];
  buyers: Buyer[];
  titleCompanies: TitleCompany[];
  properties?: Property[];
  callLogs?: CallLog[];
  territories?: Territory[];
  selectedTerritoryId?: string | null;
  onClose: () => void;
  onSaveProperty: (propertyData: Partial<Property>) => Promise<void>;
  onSaveLead?: (leadData: Partial<Lead>) => Promise<Lead | void>;
  onCreateContact?: (contactData: Partial<Contact>) => Promise<void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<void>;
  onAddBuyer?: (buyerData: Partial<Buyer>) => Promise<void>;
  onAddTitleCompany?: (titleCompanyData: Partial<TitleCompany>) => Promise<void>;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen, propertyToEdit, leads = [], contacts = [], buyers = [], titleCompanies = [],
  properties = [], callLogs = [], territories = [], selectedTerritoryId, onClose,
  onSaveProperty, onSaveLead, onCreateContact, onCreateProperty, onAddBuyer, onAddTitleCompany,
}) => {
  if (!isOpen) return null;

  // ── Property / Lead link state ─────────────────────────────────────────────
  const [leadId, setLeadId] = useState(propertyToEdit?.leadId || '');

  // ── CRM linkages ───────────────────────────────────────────────────────────
  const [sellerContactId, setSellerContactId] = useState(propertyToEdit?.sellerContactId || '');
  const [agentContactId, setAgentContactId] = useState(propertyToEdit?.agentContactId || '');
  const [buyerId, setBuyerId] = useState(propertyToEdit?.buyerId || '');
  const [titleCompanyId, setTitleCompanyId] = useState(propertyToEdit?.titleCompanyId || '');
  const [municipalityContactId, setMunicipalityContactId] = useState(propertyToEdit?.municipalityContactId || '');

  // ── Contact intake: single snapshot owned by ContactIntakePicker ──────────
  const [contactSnapshot, setContactSnapshot] = useState<ContactIntakeSnapshot>(emptyContactSnapshot());

  // Destructure for parity with downstream logic (submit + currentContact)
  const {
    firstName: contactFirstName, lastName: contactLastName, phone: contactPhone,
    email: contactEmail, role: contactRole, company: contactCompany, draft: contactDraft,
  } = contactSnapshot;

  // ── Notes / UI state ───────────────────────────────────────────────────────
  const [notes, setNotes] = useState(propertyToEdit?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [autoFillNotice, setAutoFillNotice] = useState<string | null>(null);

  const selectedLeadObj = leads.find((l) => l.id === leadId);

  // Restore linkages when editing an existing property
  useEffect(() => {
    if (propertyToEdit?.leadId) {
      setLeadId(propertyToEdit.leadId);
      const matched = leads.find((l) => l.id === propertyToEdit.leadId);
      if (matched) populateFromLeadObj(matched);
    }
  }, [propertyToEdit]);

  // Auto-map CRM linkages when the picker links an existing contact/buyer/title
  useEffect(() => {
    const id = contactSnapshot.selectedContactId;
    if (!id) return;
    const rawId = id.replace(/^(contact-|buyer-|title-|lead-)/, '');
    if (id.startsWith('buyer-')) setBuyerId(rawId);
    else if (id.startsWith('title-')) setTitleCompanyId(rawId);
    else if (id.startsWith('contact-')) {
      const roleUpper = String(contactSnapshot.role || '').toUpperCase();
      if (roleUpper.includes('SELLER')) setSellerContactId(rawId);
      else if (roleUpper.includes('AGENT')) setAgentContactId(rawId);
      else if (roleUpper.includes('MUNICIPAL')) setMunicipalityContactId(rawId);
    }
  }, [contactSnapshot.selectedContactId, contactSnapshot.role]);

  const populateFromLeadObj = (targetLead: Lead) => {
    setContactSnapshot((prev) => ({
      ...prev,
      firstName: targetLead.contactFirstName || prev.firstName,
      lastName: targetLead.contactLastName || prev.lastName,
      phone: targetLead.contactPhone || prev.phone,
      email: targetLead.contactEmail || prev.email,
      role: targetLead.contactRole || prev.role,
    }));
    const matchingSeller = contacts.find((c) => (c.leadId === targetLead.id || (c.phone && c.phone === targetLead.contactPhone) || `${c.firstName} ${c.lastName}`.toLowerCase().includes(targetLead.contactName.toLowerCase())) && (c.role || '').toUpperCase().includes('SELLER'));
    if (matchingSeller) setSellerContactId(matchingSeller.id);
    const matchingAgent = contacts.find((c) => (c.leadId === targetLead.id || (c.phone && c.phone === targetLead.contactPhone) || `${c.firstName} ${c.lastName}`.toLowerCase().includes(targetLead.contactName.toLowerCase())) && (c.role || '').toUpperCase().includes('AGENT'));
    if (matchingAgent) setAgentContactId(matchingAgent.id);
    if (targetLead.notes) setNotes((prev) => prev ? `${prev}\n\n[From Wholesale Lead ${targetLead.propertyAddress}]: ${targetLead.notes}` : `[From Wholesale Lead ${targetLead.propertyAddress}]: ${targetLead.notes}`);
  };

  const handleLeadSelect = (selectedLeadId: string) => {
    setLeadId(selectedLeadId);
    if (!selectedLeadId) { setAutoFillNotice(null); return; }
    const targetLead = leads.find((l) => l.id === selectedLeadId);
    if (!targetLead) return;
    populateFromLeadObj(targetLead);
    setAutoFillNotice(`Successfully meshed & auto-filled details from deal: "${targetLead.propertyAddress}"`);
    setTimeout(() => setAutoFillNotice(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true); setErrorMsg('');
      // 1) Persist a brand-new contact intake (picker already saved anything marked existing)
      if (!contactSnapshot.isExistingContactSelected && contactFirstName.trim() && contactPhone.trim() && onCreateContact) {
        await onCreateContact({
          ...contactDraft,
          firstName: contactFirstName, lastName: contactLastName, role: contactRole,
          phone: contactPhone, email: contactEmail, company: contactCompany || contactDraft.company,
          associatedPropertyAddress: selectedLeadObj?.propertyAddress,
          leadId: leadId || undefined,
          notes: contactDraft.notes,
          source: 'PROPERTY_FORM',
        });
      }
      // 2) Persist property-level linkages & notes (edit mode) or sync to linked lead
      if (propertyToEdit?.id) {
        await onSaveProperty({
          id: propertyToEdit.id,
          leadId: leadId || undefined,
          sellerContactId: sellerContactId || undefined,
          agentContactId: agentContactId || undefined,
          buyerId: buyerId || undefined,
          titleCompanyId: titleCompanyId || undefined,
          municipalityContactId: municipalityContactId || undefined,
          notes: notes.trim(),
        });
      } else if (leadId && onSaveLead) {
        await onSaveLead({
          id: leadId,
          contactFirstName: contactFirstName.trim() || undefined,
          contactLastName: contactLastName.trim() || undefined,
          contactPhone: contactPhone.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          contactRole,
          notes: notes.trim() || undefined,
        });
      } else {
        setErrorMsg('No property linked yet — use "+ Quick Add Property" to create the property & wholesale lead first, then save to sync contacts & notes.');
        setIsSubmitting(false);
        return;
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/20"><Building className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{propertyToEdit ? 'Edit Property Record' : 'Add Property & Wholesale Lead'}</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded border border-amber-500/30 font-semibold uppercase">Composed From Sub-Components</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Dossier, quick add, contact CRM, linkages & notes — all reusable bricks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-5 text-xs overflow-y-auto flex-1">
            {errorMsg && <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 font-semibold">{errorMsg}</div>}
            {autoFillNotice && <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>{autoFillNotice}</span></div>}

            {/* SECTION 1: PROPERTY / LEAD LINK + DOSSIER + QUICK ADD (external brick) */}
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

            {/* SECTION 2: CONTACT INTAKE & CRM CLASSIFICATION (external brick) */}
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
            />

            {/* SECTION 3: CRM LINKAGES (external brick) */}
            <CrmLinkagesSection contacts={contacts} buyers={buyers} titleCompanies={titleCompanies} sellerContactId={sellerContactId} agentContactId={agentContactId} buyerId={buyerId} titleCompanyId={titleCompanyId} municipalityContactId={municipalityContactId} onSellerChange={setSellerContactId} onAgentChange={setAgentContactId} onBuyerChange={setBuyerId} onTitleChange={setTitleCompanyId} onMunicipalityChange={setMunicipalityContactId} />

            {/* SECTION 4: NOTES (external brick) */}
            <PropertyNotesForm notes={notes} onNotesChange={setNotes} />
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xl disabled:opacity-50">
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : propertyToEdit ? 'Update Property Record' : 'Save Property & Wholesale Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
