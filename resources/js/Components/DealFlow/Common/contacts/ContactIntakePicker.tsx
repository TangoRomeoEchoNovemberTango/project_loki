import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserCheck, Plus, X, Search, ChevronDown, Sparkles, ShieldCheck, User, Phone, Mail, MapPin } from 'lucide-react';
import type { Lead, Contact, Buyer, TitleCompany, ContactRole } from '@/types/dealflow';
import { ContactRoleSelector } from './ContactRoleSelector';
import { ContactCrmFields } from './ContactCrmFields';

export interface ContactIntakeSnapshot {
  selectedContactId: string;
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
  buyers: Buyer[];
  titleCompanies: TitleCompany[];
  leads: Lead[];
  snapshot: ContactIntakeSnapshot;
  onSnapshotChange: (s: ContactIntakeSnapshot) => void;
  onCreateContact?: (contactData: Partial<Contact>) => Promise<void>;
  onAddBuyer?: (buyerData: Partial<Buyer>) => Promise<void>;
  onAddTitleCompany?: (titleCompanyData: Partial<TitleCompany>) => Promise<void>;
  associatedPropertyAddress?: string;
  leadId?: string;
  label?: string;
}

export const ContactIntakePicker: React.FC<ContactIntakePickerProps> = ({
  contacts, buyers, titleCompanies, leads, snapshot, onSnapshotChange,
  onCreateContact, onAddBuyer, onAddTitleCompany, associatedPropertyAddress, leadId,
  label = 'Contact Intake & CRM Classification',
}) => {
  const contactDropdownRef = useRef<HTMLDivElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [isQuickAddContactOpen, setIsQuickAddContactOpen] = useState(false);
  const [isEditingSelectedContact, setIsEditingSelectedContact] = useState(false);
  const [isSavingQuickContact, setIsSavingQuickContact] = useState(false);

  const patch = (u: Partial<ContactIntakeSnapshot>) => onSnapshotChange({ ...snapshot, ...u });
  const patchDraft = (u: Partial<Contact>) => patch({
    draft: { ...snapshot.draft, ...u },
    company: u.company !== undefined ? u.company : snapshot.company,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(event.target as Node)) setIsContactDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if ((isQuickAddContactOpen || isEditingSelectedContact) && firstNameInputRef.current) {
      setTimeout(() => firstNameInputRef.current?.focus(), 50);
    }
  }, [isQuickAddContactOpen, isEditingSelectedContact]);

  const consolidatedContacts = useMemo(() => {
    const list: Array<{ id: string; sourceType: 'CONTACT' | 'BUYER' | 'TITLE' | 'LEAD'; firstName: string; lastName: string; fullName: string; phone: string; email?: string; role: ContactRole | string; company?: string; originalData: any }> = [];
    const seenKeys = new Set<string>();
    contacts.forEach((c) => {
      const key = `${(c.phone || '').replace(/\D/g, '')}-${c.firstName}-${c.lastName}`.toLowerCase();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        list.push({ id: `contact-${c.id}`, sourceType: 'CONTACT', firstName: c.firstName || '', lastName: c.lastName || '', fullName: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Contact', phone: c.phone || '', email: c.email, role: (c.role as ContactRole) || 'DIRECT_SELLER', company: c.company, originalData: c });
      }
    });
    buyers.forEach((b) => {
      const nameParts = (b.name || '').split(' ');
      const fName = b.firstName || nameParts[0] || '';
      const lName = b.lastName || nameParts.slice(1).join(' ') || '';
      const key = `${(b.phone || '').replace(/\D/g, '')}-${fName}-${lName}`.toLowerCase();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        list.push({ id: `buyer-${b.id}`, sourceType: 'BUYER', firstName: fName, lastName: lName, fullName: b.name || `${fName} ${lName}`.trim(), phone: b.phone || '', email: b.email, role: 'CASH_BUYER', company: b.company, originalData: b });
      }
    });
    titleCompanies.forEach((tc) => {
      const nameParts = (tc.officerName || '').split(' ');
      const fName = tc.officerFirstName || nameParts[0] || '';
      const lName = tc.officerLastName || nameParts.slice(1).join(' ') || '';
      const key = `${(tc.phone || '').replace(/\D/g, '')}-${tc.name}`.toLowerCase();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        list.push({ id: `title-${tc.id}`, sourceType: 'TITLE', firstName: fName, lastName: lName, fullName: `${fName} ${lName}`.trim() || tc.officerName || tc.name, phone: tc.phone || '', email: tc.email, role: 'TITLE_COMPANY', company: tc.name, originalData: tc });
      }
    });
    leads.forEach((l) => {
      if (l.contactName || l.contactPhone) {
        const fName = l.contactFirstName || l.contactName?.split(' ')[0] || '';
        const lName = l.contactLastName || l.contactName?.split(' ').slice(1).join(' ') || '';
        const key = `${(l.contactPhone || '').replace(/\D/g, '')}-${fName}-${lName}`.toLowerCase();
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          list.push({ id: `lead-${l.id}`, sourceType: 'LEAD', firstName: fName, lastName: lName, fullName: l.contactName || `${fName} ${lName}`.trim(), phone: l.contactPhone || '', email: l.contactEmail, role: l.contactRole || 'LISTING_AGENT', company: l.propertyAddress, originalData: l });
        }
      }
    });
    return list;
  }, [contacts, buyers, titleCompanies, leads]);

  const filteredContacts = useMemo(() => {
    if (!contactSearchQuery.trim()) return consolidatedContacts;
    const q = contactSearchQuery.toLowerCase();
    return consolidatedContacts.filter((c) => c.fullName.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q)) || (c.company && c.company.toLowerCase().includes(q)) || String(c.role).toLowerCase().includes(q));
  }, [consolidatedContacts, contactSearchQuery]);

  const handleSelectExistingContact = (item: typeof consolidatedContacts[0]) => {
    let draft: Partial<Contact> = { role: item.role as ContactRole };
    if (item.sourceType === 'BUYER') {
      const b: Buyer = item.originalData;
      draft = { role: 'CASH_BUYER', company: b.company, buyerCategory: b.buyerCategory || 'CASH_FLIPPER', buyBoxPropertyTypes: b.buyBoxType, targetMarkets: (b.targetZipCodes || []).join(', '), maxBudget: b.maxBudget, isLandBuyer: !!b.isLandBuyer, pofVerified: b.verifiedFunds ?? true };
    } else if (item.sourceType === 'TITLE') {
      const tc: TitleCompany = item.originalData;
      draft = { role: 'TITLE_COMPANY', company: tc.name, officerFirstName: tc.officerFirstName, officerLastName: tc.officerLastName, agencyStreetAddress: tc.address, agencyCity: tc.city, agencyState: tc.state, agencyZip: tc.zip, preferredEMDAmount: tc.preferredEMDAmount, investorFriendly: tc.investorFriendly, assignmentFeeFriendly: tc.assignmentFeeFriendly, doubleClosingSupported: tc.doubleClosingSupported, rating: tc.rating };
    } else if (item.sourceType === 'CONTACT') {
      draft = { ...item.originalData };
    }
    patch({
      selectedContactId: item.id, isExistingContactSelected: true,
      firstName: item.firstName, lastName: item.lastName, phone: item.phone,
      email: item.email || snapshot.email, company: item.company || snapshot.company,
      role: item.role as ContactRole, draft,
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

  const handleSaveQuickContactInline = async () => {
    if (!snapshot.firstName.trim() || !snapshot.phone.trim()) {
      alert('Please enter at least a First Name and Phone Number for the contact.');
      return;
    }
    setIsSavingQuickContact(true);
    try {
      const fullContactName = `${snapshot.firstName.trim()} ${snapshot.lastName.trim()}`.trim();
      if (snapshot.role === 'CASH_BUYER' && onAddBuyer) {
        await onAddBuyer({
          name: fullContactName, firstName: snapshot.firstName, lastName: snapshot.lastName,
          company: snapshot.company || snapshot.draft.company, phone: snapshot.phone, email: snapshot.email,
          targetZipCodes: (snapshot.draft.targetMarkets || '').split(',').map((z) => z.trim()).filter(Boolean),
          buyBoxType: snapshot.draft.buyBoxPropertyTypes || 'Single Family Fix & Flip',
          maxBudget: Number(snapshot.draft.maxBudget) || 300000,
          buyerCategory: snapshot.draft.buyerCategory || 'CASH_FLIPPER',
          isLandBuyer: !!snapshot.draft.isLandBuyer, verifiedFunds: !!snapshot.draft.pofVerified,
          dealsClosedCount: 0,
        });
      } else if (snapshot.role === 'TITLE_COMPANY' && onAddTitleCompany) {
        await onAddTitleCompany({
          name: snapshot.draft.company || snapshot.company || `${fullContactName} Escrow`,
          officerName: fullContactName, officerFirstName: snapshot.firstName, officerLastName: snapshot.lastName,
          phone: snapshot.phone, email: snapshot.email,
          address: snapshot.draft.agencyStreetAddress || '', city: snapshot.draft.agencyCity || 'Springfield',
          state: snapshot.draft.agencyState || 'IL', zip: snapshot.draft.agencyZip || '',
          investorFriendly: !!snapshot.draft.investorFriendly, assignmentFeeFriendly: !!snapshot.draft.assignmentFeeFriendly,
          doubleClosingSupported: !!snapshot.draft.doubleClosingSupported,
          preferredEMDAmount: Number(snapshot.draft.preferredEMDAmount) || 2500,
        });
      }
      if (onCreateContact) {
        await onCreateContact({
          ...snapshot.draft,
          firstName: snapshot.firstName, lastName: snapshot.lastName, role: snapshot.role,
          phone: snapshot.phone, email: snapshot.email, company: snapshot.company || snapshot.draft.company,
          associatedPropertyAddress, leadId: leadId || undefined,
          notes: snapshot.draft.notes, source: 'CRM_PICKER',
        });
      }
      patch({ isExistingContactSelected: true });
      setIsEditingSelectedContact(false);
      setIsQuickAddContactOpen(false);
    } catch (err: any) {
      console.error('Error saving quick contact:', err);
      alert('Failed to save contact. Please verify details and try again.');
    } finally {
      setIsSavingQuickContact(false);
    }
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
                <div key={cItem.id} onClick={() => handleSelectExistingContact(cItem)} className="p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors">
                  <div>
                    <p className="font-extrabold text-white text-xs flex items-center gap-2">
                      <span>{cItem.fullName}</span>
                      {cItem.company && <span className="text-[10px] text-slate-400 font-normal">({cItem.company})</span>}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Phone: <span className="text-slate-200 font-mono font-semibold">{cItem.phone || 'N/A'}</span>{cItem.email ? ` • ${cItem.email}` : ''}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${cItem.sourceType === 'BUYER' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : cItem.sourceType === 'TITLE' ? 'bg-sky-500/10 text-sky-300 border-sky-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}`}>
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
          {snapshot.role === 'CASH_BUYER' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-xs">
              <div><span className="text-slate-400 block text-[10px]">BUYER CATEGORY</span> <strong className="text-emerald-300">{String(snapshot.draft.buyerCategory || 'CASH_FLIPPER').replace(/_/g, ' ')}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">BUY BOX</span> <strong className="text-white">{snapshot.draft.buyBoxPropertyTypes || 'N/A'}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">MAX BUDGET</span> <strong className="text-emerald-400 font-mono">${Number(snapshot.draft.maxBudget || 0).toLocaleString()}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">TARGET ZIPS</span> <strong className="text-slate-200 font-mono">{snapshot.draft.targetMarkets || 'N/A'}</strong></div>
            </div>
          )}
          {snapshot.role === 'TITLE_COMPANY' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-sky-500/10 p-2.5 rounded-lg border border-sky-500/20 text-xs">
              <div><span className="text-slate-400 block text-[10px]">TITLE FIRM</span> <strong className="text-sky-300">{snapshot.draft.company || snapshot.company || 'Title Office'}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">PREFERRED EMD</span> <strong className="text-white font-mono">${Number(snapshot.draft.preferredEMDAmount || 0).toLocaleString()}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">INVESTOR FRIENDLY</span> <strong className="text-emerald-400">{snapshot.draft.investorFriendly ? 'Yes ✅' : 'No ❌'}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">ASSIGNMENT FRIENDLY</span> <strong className="text-sky-300">{snapshot.draft.assignmentFeeFriendly ? 'Yes ✅' : 'No ❌'}</strong></div>
            </div>
          )}
          {(snapshot.draft.streetAddress || snapshot.draft.city) && (
            <div className="text-xs text-slate-400 flex items-center gap-1 pt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Address: <strong className="text-slate-200">{snapshot.draft.streetAddress} {snapshot.draft.unit ? `#${snapshot.draft.unit}` : ''}, {snapshot.draft.city}, {snapshot.draft.state} {snapshot.draft.zip}</strong></span>
            </div>
          )}
        </div>
      ) : isQuickAddContactOpen || isEditingSelectedContact ? (
        <div className="mt-3 p-4 bg-slate-900/90 border border-amber-500/30 rounded-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              {isEditingSelectedContact && snapshot.isExistingContactSelected ? 'Edit Contact Info & Classification' : '✨ Quick Add Contact Intake & Table Classification'}
            </h3>
            <button type="button" onClick={() => { setIsQuickAddContactOpen(false); setIsEditingSelectedContact(false); }} className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"><X className="w-3.5 h-3.5" /> Close Form</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact First Name <span className="text-rose-400">*</span></label>
              <div className="relative"><User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" /><input ref={firstNameInputRef} type="text" value={snapshot.firstName} onChange={(e) => patch({ firstName: e.target.value })} placeholder="e.g. Sarah" className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-semibold" /></div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Last Name</label>
              <div className="relative"><User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" /><input type="text" value={snapshot.lastName} onChange={(e) => patch({ lastName: e.target.value })} placeholder="e.g. Jenkins" className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-semibold" /></div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Phone <span className="text-rose-400">*</span></label>
              <div className="relative"><Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" /><input type="text" value={snapshot.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="(555) 000-0000" className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono font-bold" /></div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
              <div className="relative"><Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" /><input type="email" value={snapshot.email} onChange={(e) => patch({ email: e.target.value })} placeholder="contact@company.com" className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400" /></div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1 text-xs">Contact Role / Type Picker <span className="text-amber-400">(form morphs to this role)</span></label>
              <ContactRoleSelector
  value={snapshot.role}
  onChange={(r) => patch({ role: r, draft: { ...snapshot.draft, role: r } })}
/>
            </div>
          </div>
          <ContactCrmFields role={snapshot.role} contact={snapshot.draft} onChange={patchDraft} />
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 italic">{isEditingSelectedContact && snapshot.isExistingContactSelected ? 'Editing details for selected contact' : 'Fill details above to create & link a new contact'}</span>
            <button type="button" disabled={isSavingQuickContact} onClick={handleSaveQuickContactInline} className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-lg text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {isSavingQuickContact ? 'Saving Contact...' : '✨ Save Contact to CRM & Link'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
