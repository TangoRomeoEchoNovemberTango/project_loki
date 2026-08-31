import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserCheck, Plus, X, Search, ChevronDown, Sparkles, MapPin } from 'lucide-react';
import type { Lead, Contact, ContactRole } from '@/types/dealflow';
import { QuickAddContactForm } from './QuickAddContactForm';

export interface ContactIntakeSnapshot {
  selectedContactId: string; // ✅ RAW contacts-table id (no prefix!)
  isExistingContactSelected: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: ContactRole;
  company: string;
  draft: Partial<Contact>;
}

export const emptyContactSnapshot = (role: ContactRole = 'DIRECT_SELLER'): ContactIntakeSnapshot => ({
  selectedContactId: '', isExistingContactSelected: false, firstName: '', lastName: '',
  phone: '', email: '', role, company: '', draft: { role },
});

interface ContactIntakePickerProps {
  contacts: Contact[];
  /** Kept so existing callers that pass `leads` still compile. */
  leads?: Lead[];
  snapshot: ContactIntakeSnapshot;
  onSnapshotChange: (s: ContactIntakeSnapshot) => void;
  onCreateContact?: (contactData: Partial<Contact>) => Promise<Contact | void>;
  associatedPropertyAddress?: string;
  leadId?: string;
  label?: string;
}

export const ContactIntakePicker: React.FC<ContactIntakePickerProps> = ({
  contacts, leads = [], snapshot, onSnapshotChange,
  onCreateContact, associatedPropertyAddress, leadId,
  label = 'Contact Intake & CRM Classification',
}) => {
  const contactDropdownRef = useRef<HTMLDivElement>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [isQuickAddContactOpen, setIsQuickAddContactOpen] = useState(false);
  const [isEditingSelectedContact, setIsEditingSelectedContact] = useState(false);

  const patch = (u: Partial<ContactIntakeSnapshot>) => onSnapshotChange({ ...snapshot, ...u });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(event.target as Node)) setIsContactDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const consolidatedContacts = useMemo(() => {
    return contacts.map((c) => ({
      key: `contact-${c.id}`,
      rawContactId: c.id,
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      fullName: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Contact',
      phone: c.phone || '',
      email: c.email,
      role: (c.primaryRole || c.role || 'DIRECT_SELLER') as ContactRole,
      company: c.company,
      originalData: c,
    }));
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    if (!contactSearchQuery.trim()) return consolidatedContacts;
    const q = contactSearchQuery.toLowerCase();
    return consolidatedContacts.filter((c) => c.fullName.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q)) || (c.company && c.company.toLowerCase().includes(q)) || String(c.role).toLowerCase().includes(q));
  }, [consolidatedContacts, contactSearchQuery]);

  const handleSelectExistingContact = (item: typeof consolidatedContacts[0]) => {
    patch({
      selectedContactId: item.rawContactId,
      isExistingContactSelected: true,
      firstName: item.firstName, lastName: item.lastName, phone: item.phone,
      email: item.email || snapshot.email, company: item.company || snapshot.company,
      role: item.role as ContactRole,
      draft: { ...item.originalData },
    });
    setIsContactDropdownOpen(false);
    setContactSearchQuery('');
    setIsQuickAddContactOpen(false);
    setIsEditingSelectedContact(false);
  };

  const handleClearSelectedContact = () => {
    onSnapshotChange(emptyContactSnapshot());
    setIsQuickAddContactOpen(false);
    setIsEditingSelectedContact(false);
  };

  // ✅ NEW: the embedded QuickAddContactForm's save handler.
  // Saves the person FIRST, catches the receipt, then marks the snapshot "selected"
  // so AddLeadModal links the deal via contactId.
  const handleEmbeddedSave = async (data: Partial<Contact>) => {
    if (onCreateContact) {
      const created = await onCreateContact({
        ...data,
        associatedPropertyAddress,
        leadId: leadId || undefined,
        source: data.source || 'CRM_PICKER',
      });
      if (created && created.id) {
        patch({
          isExistingContactSelected: true,
          selectedContactId: created.id,
          firstName: created.firstName || data.firstName || '',
          lastName: created.lastName || data.lastName || '',
          phone: created.phone || data.phone || '',
          email: created.email || data.email,
          company: created.company || data.company || snapshot.company,
          role: (created.primaryRole || created.role || data.role || snapshot.role) as ContactRole,
          draft: { ...data, id: created.id },
        });
        setIsQuickAddContactOpen(false);
        setIsEditingSelectedContact(false);
        return;
      }
    }
    // Fallback (no receipt): reflect typed data in the snapshot anyway
    patch({
      isExistingContactSelected: true,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      email: data.email,
      company: data.company || snapshot.company,
      role: (data.role || snapshot.role) as ContactRole,
      draft: { ...data },
    });
    setIsQuickAddContactOpen(false);
    setIsEditingSelectedContact(false);
  };

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-amber-400" /> {label}
        </label>
        <button type="button" onClick={() => { if (isQuickAddContactOpen) { setIsQuickAddContactOpen(false); setIsEditingSelectedContact(false); } else { handleClearSelectedContact(); setIsQuickAddContactOpen(true); setIsEditingSelectedContact(true); } }} className={`text-[11px] transition-colors flex items-center gap-1 cursor-pointer font-bold px-2.5 py-1 rounded-lg border ${isQuickAddContactOpen ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'}`}>
          <Plus className="w-3.5 h-3.5" /> {isQuickAddContactOpen ? 'Close Quick Add' : '✨ + Quick Add New Contact'}
        </button>
      </div>

      <div className="relative" ref={contactDropdownRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={contactSearchQuery}
            onFocus={() => setIsContactDropdownOpen(true)}
            onChange={(e) => { setContactSearchQuery(e.target.value); setIsContactDropdownOpen(true); }}
            placeholder="Search existing contacts by name, phone, email, company, or role..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
          />
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        {isContactDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-800">
            <div onClick={() => { handleClearSelectedContact(); setIsContactDropdownOpen(false); setIsQuickAddContactOpen(true); setIsEditingSelectedContact(true); }} className="p-2.5 hover:bg-slate-800/80 cursor-pointer text-amber-400 font-bold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>-- ✨ Quick Add a Brand New Contact --</span>
            </div>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((cItem) => (
                <div key={cItem.key} onClick={() => handleSelectExistingContact(cItem)} className="p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors">
                  <div>
                    <p className="font-extrabold text-white text-xs flex items-center gap-2">
                      <span>{cItem.fullName}</span>
                      {cItem.company && <span className="text-[10px] text-slate-400 font-normal">({cItem.company})</span>}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Phone: <span className="text-slate-200 font-mono font-semibold">{cItem.phone || 'N/A'}</span>{cItem.email ? ` • ${cItem.email}` : ''}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-amber-500/10 text-amber-300 border-amber-500/30">
                    {String(cItem.role).replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-slate-500 text-center italic">No matching existing contacts found. Click "+ Quick Add New Contact" to create one!</div>
            )}
          </div>
        )}
      </div>

      {snapshot.isExistingContactSelected && !isEditingSelectedContact ? (
        <div className="mt-3 p-3 bg-slate-900/90 border border-amber-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                {snapshot.firstName ? snapshot.firstName[0]?.toUpperCase() : 'C'}{snapshot.lastName ? snapshot.lastName[0]?.toUpperCase() : ''}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>{snapshot.firstName} {snapshot.lastName}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 uppercase font-mono font-bold">{snapshot.role.replace(/_/g, ' ')}</span>
                </h3>
                <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 mt-0.5">
                  {snapshot.phone && <span>📞 <strong className="text-slate-200 font-mono">{snapshot.phone}</strong></span>}
                  {snapshot.email && <span>✉️ <span className="text-slate-300">{snapshot.email}</span></span>}
                  {snapshot.company && <span>🏢 <span className="text-amber-300 font-semibold">{snapshot.company}</span></span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setIsEditingSelectedContact(true)} className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5" /> Edit Contact Info
              </button>
              <button type="button" onClick={handleClearSelectedContact} className="px-2.5 py-1.5 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-bold transition-all border border-slate-800 flex items-center gap-1 cursor-pointer">
                <X className="w-3.5 h-3.5" /> Unlink
              </button>
            </div>
          </div>
          {(snapshot.draft.streetAddress || snapshot.draft.city) && (
            <div className="text-xs text-slate-400 flex items-center gap-1 pt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Address: <strong className="text-slate-200">{snapshot.draft.streetAddress} {snapshot.draft.unit ? `#${snapshot.draft.unit}` : ''}, {snapshot.draft.city}, {snapshot.draft.state} {snapshot.draft.zip}</strong></span>
            </div>
          )}
        </div>
      ) : isQuickAddContactOpen || isEditingSelectedContact ? (
        /* ✅ THE ONE TRUE EDITOR — the old hand-rolled fieldset is gone. */
        <QuickAddContactForm
          title={isEditingSelectedContact && snapshot.isExistingContactSelected ? 'Edit Contact Info & Classification' : '✨ Quick Add Contact'}
          initialRole={(snapshot.role as ContactRole) || 'DIRECT_SELLER'}
          initialData={snapshot.draft}
          availableDeals={leads}
          onSaveContact={handleEmbeddedSave}
          onClose={() => { setIsQuickAddContactOpen(false); setIsEditingSelectedContact(false); }}
        />
      ) : null}
    </div>
  );
};