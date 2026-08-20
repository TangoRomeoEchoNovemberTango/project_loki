import React, { useState } from 'react';
import { X, Save, User, MapPin, FileText } from 'lucide-react';
import type { Contact, ContactRole, ContactMethod } from '@/types/dealflow';
import { ContactRoleSelector } from './ContactRoleSelector';
import { ContactCrmFields } from './ContactCrmFields';
import { SectionCard, TextInput, SelectInput, TextArea } from './ContactFieldPrimitives';

interface QuickAddContactFormProps {
  initialRole?: ContactRole;
  initialData?: Partial<Contact>;
  title?: string;
  onSaveContact: (data: Partial<Contact>) => Promise<void>;
  onClose: () => void;
}

export const QuickAddContactForm: React.FC<QuickAddContactFormProps> = ({
  initialRole, initialData, title, onSaveContact, onClose,
}) => {
  const [draft, setDraft] = useState<Partial<Contact>>({ role: initialRole || 'DIRECT_SELLER', ...initialData });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const patch = (u: Partial<Contact>) => setDraft((prev) => ({ ...prev, ...u }));

  const handleSave = async () => {
    if (!draft.firstName?.trim()) { setError('Please enter a First Name.'); return; }
    if (!draft.phone?.trim()) { setError('Please enter a Phone Number.'); return; }
    setError('');
    setIsSaving(true);
    try {
      await onSaveContact({ ...draft, source: draft.source || 'CUSTOM' });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to save contact.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 bg-slate-900 border-2 border-amber-500/40 rounded-xl space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold"><User className="w-5 h-5" /></div>
          <div>
            <h4 className="font-extrabold text-amber-400 text-sm">{title || 'Quick Add Contact (Universal CRM)'}</h4>
            <p className="text-[11px] text-slate-400">Pick a role — the form morphs to that role's signature. Saves one unified Contact.</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1"><X className="w-4 h-4" /></button>
      </div>

      {error && <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 text-xs font-bold">{error}</div>}

      {/* 1. Role & Shared Identity */}
      <SectionCard title="1. Role Classification & Identity">
        <ContactRoleSelector value={(draft.role as ContactRole) || 'DIRECT_SELLER'} onChange={(r) => patch({ role: r })} />
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
          <TextInput label="Company / LLC / Firm / Dept" value={draft.company} onChange={(v) => patch({ company: v })} placeholder="e.g. Sterling Holdings LLC" className="sm:col-span-2" />
        </div>
      </SectionCard>

      {/* 2. Mailing Address */}
      <SectionCard title="2. Mailing / Primary Address">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <TextInput label="Street Address" value={draft.streetAddress} onChange={(v) => patch({ streetAddress: v })} placeholder="e.g. 1842 S Grand Ave" className="sm:col-span-2" />
          <TextInput label="Apt / Unit #" value={draft.unit} onChange={(v) => patch({ unit: v })} placeholder="Apt 3B" />
          <TextInput label="City" value={draft.city} onChange={(v) => patch({ city: v })} placeholder="Springfield" />
          <TextInput label="State" value={draft.state} onChange={(v) => patch({ state: v })} placeholder="IL" />
          <TextInput label="Zip" value={draft.zip} onChange={(v) => patch({ zip: v })} placeholder="62703" mono />
        </div>
      </SectionCard>

      {/* 3. Role-Specific Signature (morphs with role) */}
      <ContactCrmFields role={draft.role || 'DIRECT_SELLER'} contact={draft} onChange={patch} />

      {/* 4. Notes */}
      <SectionCard title="4. Notes">
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
