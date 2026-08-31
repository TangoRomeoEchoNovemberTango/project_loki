import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import type {
  Contact, ContactRole, ContactMethod, Lead, Property, Territory, CallLog,
} from '@/types/dealflow';
import { RolePicker } from './RolePicker';                         // ✅ NEW (replaces ContactRoleSelector)
import { ContactTimePicker } from './ContactTimePicker';           // ✅ NEW
import { ContactCrmFields } from './ContactCrmFields';
import { DncToggle } from './DncToggle';
import { DealLinkPicker } from '../deals/DealLinkPicker';
import { SectionCard, TextInput, SelectInput, TextArea } from './ContactFieldPrimitives';

interface QuickAddContactFormProps {
  initialRole?: ContactRole;
  initialData?: Partial<Contact>;
  title?: string;
  onSaveContact: (data: Partial<Contact>) => Promise<void>;
  onClose: () => void;
  // ── Deal linking data (optional — powers search & quick-add inside the picker) ──
  availableDeals?: Lead[];
  onCreateDeal?: (dealData: Partial<Lead>) => Promise<Lead | void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<void>;
  territories?: Territory[];
  properties?: Property[];
  callLogs?: CallLog[];
}

export const QuickAddContactForm: React.FC<QuickAddContactFormProps> = ({
  initialRole, initialData, title, onSaveContact, onClose,
  availableDeals = [], onCreateDeal, onCreateProperty,
  territories = [], properties = [], callLogs = [],
}) => {
  const [draft, setDraft] = useState<Partial<Contact>>({ role: initialRole || 'DIRECT_SELLER', ...initialData });
  const [linkedDealIds, setLinkedDealIds] = useState<string[]>(initialData?.dealIds || []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const patch = (u: Partial<Contact>) => setDraft((prev) => ({ ...prev, ...u }));

  const handleSave = async () => {
    if (!draft.firstName?.trim()) { setError('Please enter a First Name.'); return; }
    if (!draft.phone?.trim()) { setError('Please enter a Phone Number.'); return; }
    setError('');
    setIsSaving(true);
    try {
      await onSaveContact({
        ...draft,
        dealIds: linkedDealIds.length > 0 ? linkedDealIds : undefined,
        source: draft.source || 'CUSTOM',
      });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to save contact.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Multi-role helpers — fall back to [legacy role] when roles is empty
  const currentRoles = (draft.roles && draft.roles.length ? draft.roles : [(draft.role as ContactRole) || 'DIRECT_SELLER']) as ContactRole[];
  const currentPrimary = ((draft.primaryRole as ContactRole) || (draft.role as ContactRole) || currentRoles[0] || 'DIRECT_SELLER') as ContactRole;

  return (
    <div className="p-4 bg-slate-900 border-2 border-amber-500/40 rounded-xl space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold"> <User className="w-5 h-5" /> </div>
          <div>
            <h4 className="font-extrabold text-amber-400 text-sm">{title || 'Quick Add Contact (Universal CRM)'}</h4>
            <p className="text-[11px] text-slate-400">Pick role(s) — the form morphs to the primary role's signature. Saves one unified Contact.</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1"> <X className="w-4 h-4" /> </button>
      </div>

      {error && <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 text-xs font-bold">{error}</div>}

      {/* DNC Toggle */}
      <DncToggle
        contact={draft as Contact}
        onToggleDnc={(c) => patch({ dnc: !c.dnc, dncDate: new Date().toISOString() })}
      />

      {/* ── 1. Multi-Role + Shared Identity ── */}
      <SectionCard title="1. Role Classification & Identity">
        {/* ✅ NEW: multi-role picker replaces the old single-role dropdown */}
        <div className="sm:col-span-2 mb-3">
          <label className="block text-slate-300 font-bold mb-1.5 text-xs">Contact Roles <span className="text-amber-400 font-normal">(multi-select • crown = primary hat)</span></label>
          <RolePicker
            roles={currentRoles}
            primaryRole={currentPrimary}
            otherLabel={draft.otherRoleLabel}
            onOtherLabelChange={(v) => patch({ otherRoleLabel: v })}
            onChange={(roles, primary) => patch({ roles, primaryRole: primary, role: primary })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput label="First Name" required value={draft.firstName} onChange={(v) => patch({ firstName: v })} placeholder="e.g. Thomas" />
          <TextInput label="Last Name" value={draft.lastName} onChange={(v) => patch({ lastName: v })} placeholder="e.g. Sterling" />
          <TextInput label="Mobile / Cell Phone" required value={draft.phone} onChange={(v) => patch({ phone: v })} placeholder="(217) 555-0192" mono />
          <TextInput label="Secondary / Office Phone" value={draft.officePhone} onChange={(v) => patch({ officePhone: v })} placeholder="(217) 555-4321" mono />
          <TextInput label="Email" type="email" value={draft.email} onChange={(v) => patch({ email: v })} placeholder="contact@email.com" />
          <SelectInput label="Preferred Contact Method" value={draft.preferredContactMethod} onChange={(v) => patch({ preferredContactMethod: v as ContactMethod })} options={[
            { value: 'CALL', label: 'Phone Call' },
            { value: 'SMS', label: 'Text / SMS' },
            { value: 'MAIL', label: 'Direct Mail' },
          ]} />
        </div>
      </SectionCard>

      {/* ── 1b. Availability (NEW) ── */}
      <ContactTimePicker
        availability={draft.availability || []}
        onAvailabilityChange={(list) => patch({ availability: list })}
        availabilityNotes={draft.availabilityNotes}
        onNotesChange={(v) => patch({ availabilityNotes: v })}
        label="1b. Best Times to Reach"
      />

      {/* ── 2. Mailing / Primary Address ── */}
      <SectionCard title="2. Mailing / Primary Address">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <TextInput label="Street Address" value={draft.streetAddress} onChange={(v) => patch({ streetAddress: v })} placeholder="e.g. 1842 S Grand Ave" className="sm:col-span-2" />
          <TextInput label="Apt / Unit #" value={draft.unit} onChange={(v) => patch({ unit: v })} placeholder="Apt 3B" />
          <TextInput label="City" value={draft.city} onChange={(v) => patch({ city: v })} placeholder="Springfield" />
          <TextInput label="State" value={draft.state} onChange={(v) => patch({ state: v })} placeholder="IL" />
          <TextInput label="Zip" value={draft.zip} onChange={(v) => patch({ zip: v })} placeholder="62703" mono />
        </div>
      </SectionCard>

      {/* ── 3. Deal Associations ── */}
      <DealLinkPicker
        linkedDealIds={linkedDealIds}
        onLinkChange={setLinkedDealIds}
        availableDeals={availableDeals}
        label="Link to Deal (Searchable)"
        onCreateDeal={onCreateDeal}
        onCreateProperty={onCreateProperty}
        territories={territories}
        properties={properties}
        callLogs={callLogs}
        currentContact={{
          firstName: draft.firstName || '',
          lastName: draft.lastName || '',
          phone: draft.phone || '',
          role: currentPrimary,
        }}
      />

      {/* ── 4. Role-Specific Signature (morphs with primary role) ── */}
      <ContactCrmFields role={currentPrimary} contact={draft} onChange={patch} />

      {/* ── 5. Notes ── */}
      <SectionCard title="Notes">
        <TextArea label="General Notes" value={draft.notes} onChange={(v) => patch({ notes: v })} placeholder="Anything else worth remembering about this contact..." />
      </SectionCard>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs">Cancel</button>
        <button type="button" disabled={isSaving} onClick={handleSave} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50">
          <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Contact to CRM'}
        </button>
      </div>
    </div>
  );
};