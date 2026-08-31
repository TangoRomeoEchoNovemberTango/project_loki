import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Phone,
  Mail,
  Building,
  Tag,
  MapPin,
  ExternalLink,
  Plus,
  PhoneCall,
  Copy,
  Check,
  ShieldCheck,
  Download,
  Edit3,
  Trash2,
  SlidersHorizontal,
  X,
  Filter,
} from 'lucide-react';
import type { Lead, Buyer, CallLog, Territory, TitleCompany, Contact, ContactRole, Property } from '@/types/dealflow';
import { exportToCSV } from '@/utils/exportUtils';
import { QuickAddContactForm } from '../Common/contacts/QuickAddContactForm';

interface ContactsDirectoryProps {
  contacts: Contact[];
  leads: Lead[];
  buyers: Buyer[];
  callLogs: CallLog[];
  titleCompanies: TitleCompany[];
  territories: Territory[];
  onOpenCallDialer: (lead?: Lead, contactPhone?: string, contactName?: string) => void;
  onOpenLeadDetail: (leadOrId: Lead | string) => void;
  onCreateContact: (contactData: Partial<Contact>) => Promise<void>;
  onUpdateContact: (contactData: Partial<Contact>) => Promise<void>;
  onDeleteContact: (contactId: string) => Promise<void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<void>;
  onSaveLead?: (leadData: Partial<Lead>) => Promise<Lead | void>;
}

export const ContactsDirectory: React.FC<ContactsDirectoryProps> = ({
  contacts = [],
  leads = [],
  buyers = [],
  callLogs = [],
  titleCompanies = [],
  territories = [],
  onOpenCallDialer,
  onOpenLeadDetail,
  onCreateContact,
  onUpdateContact,
  onDeleteContact,
  onCreateProperty,
  onSaveLead,
}) => {
  // Search state
  const [globalQuery, setGlobalQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [streetQuery, setStreetQuery] = useState('');
  const [unitQuery, setUnitQuery] = useState('');
  const [zipQuery, setZipQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Consolidated Universal List
  const consolidatedContacts = useMemo(() => {
    const list: Contact[] = [];
    const seenKeys = new Set<string>();

    // 1. Direct Custom Contacts (Highest Priority - Editable & Deletable)
    contacts.forEach((c) => {
      list.push(c);
      const phoneKey = c.phone?.replace(/\D/g, '');
      if (phoneKey) seenKeys.add(phoneKey);
      if (c.email) seenKeys.add(c.email.toLowerCase());
    });

    // 2. From Leads (Sellers, Listing Agents, Co-Agents)
    leads.forEach((l) => {
      if (l.contactName) {
        const phoneKey = l.contactPhone?.replace(/\D/g, '');
        if (!phoneKey || !seenKeys.has(phoneKey)) {
          const nameParts = l.contactName.trim().split(' ');
          const firstName = nameParts[0] || l.contactName;
          const lastName = nameParts.slice(1).join(' ') || '';
          list.push({
            id: `lead-contact-${l.id}`,
            firstName,
            lastName,
            role: l.contactRole || 'DIRECT_SELLER',
            phone: l.contactPhone || '',
            email: l.contactEmail || '',
            company: l.contactRole === 'LISTING_AGENT' ? 'Listing Brokerage' : 'Property Seller',
            streetAddress: l.propertyAddress,
            unit: '',
            city: l.city,
            state: l.state,
            zip: l.zip,
            associatedPropertyAddress: `${l.propertyAddress}, ${l.city}, ${l.state} ${l.zip}`,
            leadId: l.id,
            notes: `Lead Stage: ${l.stage}. ${l.notes || ''}`,
            source: 'LEAD',
          });
          if (phoneKey) seenKeys.add(phoneKey);
        }
      }
    });

    // 3. From Cash Buyers
    buyers.forEach((b) => {
      const phoneKey = b.phone?.replace(/\D/g, '');
      if (!phoneKey || !seenKeys.has(phoneKey)) {
        const nameParts = (b.name || '').trim().split(' ');
        const firstName = nameParts[0] || b.name || 'Cash';
        const lastName = nameParts.slice(1).join(' ') || 'Buyer';
        list.push({
          id: `buyer-contact-${b.id}`,
          firstName,
          lastName,
          role: 'CASH_BUYER',
          phone: b.phone || '',
          email: b.email || '',
          company: b.company || 'Cash Investor',
          streetAddress: '',
          unit: '',
          city: '',
          state: '',
          zip: Array.isArray(b.targetZipCodes) ? b.targetZipCodes[0] : '',
          buyerId: b.id,
          notes: `Buy Box: ${b.buyBoxType || 'General'}. Max Budget: $${(b.maxBudget || 0).toLocaleString()}`,
          source: 'BUYER',
        });
        if (phoneKey) seenKeys.add(phoneKey);
      }
    });

    // 4. From Title Companies & Escrow Officers
    titleCompanies.forEach((tc) => {
      const phoneKey = tc.phone?.replace(/\D/g, '');
      if (!phoneKey || !seenKeys.has(phoneKey)) {
        const nameParts = (tc.officerName || tc.name || '').trim().split(' ');
        const firstName = nameParts[0] || 'Title';
        const lastName = nameParts.slice(1).join(' ') || 'Officer';
        list.push({
          id: `title-contact-${tc.id}`,
          firstName,
          lastName,
          role: 'TITLE_COMPANY',
          phone: tc.phone || '',
          email: tc.email || '',
          company: tc.name,
          streetAddress: tc.address || '',
          unit: '',
          city: tc.city || '',
          state: tc.state || '',
          zip: tc.zip || '',
          titleCompanyId: tc.id,
          notes: tc.notes || 'Investor Friendly Title & Escrow Officer',
          source: 'TITLE_COMPANY',
        });
        if (phoneKey) seenKeys.add(phoneKey);
      }
    });

    // 5. From Call Logs (Inbound & Outbound callers)
    callLogs.forEach((c) => {
      if (c.contactName) {
        const phoneKey = c.contactPhone?.replace(/\D/g, '');
        if (!phoneKey || !seenKeys.has(phoneKey)) {
          const nameParts = c.contactName.trim().split(' ');
          const firstName = nameParts[0] || c.contactName;
          const lastName = nameParts.slice(1).join(' ') || '';
          list.push({
            id: `call-contact-${c.id}`,
            firstName,
            lastName,
            role: c.contactRole || 'OTHER',
            phone: c.contactPhone || '',
            associatedPropertyAddress: c.leadAddress,
            leadId: c.leadId,
            notes: c.notes || 'Caller logged in dialer',
            source: 'CALL_LOG',
          });
          if (phoneKey) seenKeys.add(phoneKey);
        }
      }
    });

    return list;
  }, [contacts, leads, buyers, titleCompanies, callLogs]);

  // Multi-Field Search & Filter Engine
  const filteredContacts = useMemo(() => {
    return consolidatedContacts.filter((c) => {
      const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim().toLowerCase();
      const phoneClean = (c.phone || '').replace(/\D/g, '');
      const rawPhone = (c.phone || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const company = (c.company || '').toLowerCase();
      const street = (c.streetAddress || '').toLowerCase();
      const unit = (c.unit || '').toLowerCase();
      const zip = (c.zip || '').toLowerCase();
      const city = (c.city || '').toLowerCase();
      const state = (c.state || '').toLowerCase();
      const assoc = (c.associatedPropertyAddress || '').toLowerCase();
      const notes = (c.notes || '').toLowerCase();

      // 1. Global Search Query
      if (globalQuery.trim()) {
        const q = globalQuery.trim().toLowerCase();
        const qDigits = q.replace(/\D/g, '');
        const matchesGlobal =
          fullName.includes(q) ||
          rawPhone.includes(q) ||
          (qDigits && phoneClean.includes(qDigits)) ||
          email.includes(q) ||
          company.includes(q) ||
          street.includes(q) ||
          unit.includes(q) ||
          zip.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          assoc.includes(q) ||
          notes.includes(q);
        if (!matchesGlobal) return false;
      }
      // 2. Specific First/Last Name Filter
      if (nameQuery.trim()) {
        const nq = nameQuery.trim().toLowerCase();
        if (!fullName.includes(nq)) return false;
      }
      // 3. Specific Street Address Filter
      if (streetQuery.trim()) {
        const sq = streetQuery.trim().toLowerCase();
        if (!street.includes(sq) && !assoc.includes(sq)) return false;
      }
      // 4. Specific Apt/Suite # Filter
      if (unitQuery.trim()) {
        const uq = unitQuery.trim().toLowerCase();
        if (!unit.includes(uq) && !assoc.includes(uq)) return false;
      }
      // 5. Specific Zip Code Filter
      if (zipQuery.trim()) {
        const zq = zipQuery.trim().toLowerCase();
        if (!zip.includes(zq) && !assoc.includes(zq)) return false;
      }
      // 6. Role Classification Filter
      if (selectedRole !== 'ALL') {
        const roleUpper = (c.role || '').toUpperCase();
        if (selectedRole === 'COUNTY_MUNICIPALITY' && !roleUpper.includes('MUNICIPAL') && !roleUpper.includes('COUNTY')) {
          return false;
        }
        if (selectedRole === 'DIRECT_SELLER' && !roleUpper.includes('SELLER') && !roleUpper.includes('HOMEOWNER')) {
          return false;
        }
        if (selectedRole === 'LISTING_AGENT' && !roleUpper.includes('LISTING_AGENT') && !roleUpper.includes('AGENT')) {
          return false;
        }
        if (selectedRole === 'CASH_BUYER' && !roleUpper.includes('BUYER')) {
          return false;
        }
        if (selectedRole === 'TITLE_COMPANY' && !roleUpper.includes('TITLE') && !roleUpper.includes('ESCROW')) {
          return false;
        }
        if (selectedRole === 'ATTORNEY' && !roleUpper.includes('ATTORNEY') && !roleUpper.includes('LEGAL')) {
          return false;
        }
      }
      return true;
    });
  }, [consolidatedContacts, globalQuery, nameQuery, streetQuery, unitQuery, zipQuery, selectedRole]);

  const handleCopy = (text: string, id: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
    } catch (e) {
      console.warn('Clipboard copy error:', e);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateNew = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = async (contact: Contact) => {
    const contactName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.company || 'Contact';
    if (window.confirm(`Are you sure you want to delete "${contactName}" from your CRM directory?`)) {
      await onDeleteContact(contact.id);
    }
  };

  const getRoleBadge = (roleStr: string) => {
    const r = (roleStr || '').toUpperCase();
    if (r.includes('MUNICIPAL') || r.includes('COUNTY') || r.includes('CLERK')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
    if (r.includes('SELLER') || r.includes('HOMEOWNER')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    if (r.includes('AGENT') || r.includes('BROKER')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    if (r.includes('BUYER')) {
      return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    }
    if (r.includes('TITLE') || r.includes('ESCROW')) {
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    }
    if (r.includes('ATTORNEY')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const getRoleLabel = (roleStr: string) => {
    const r = (roleStr || '').toUpperCase();
    if (r.includes('MUNICIPAL') || r.includes('COUNTY')) return 'County / Municipality Clerk';
    if (r.includes('SELLER') || r.includes('HOMEOWNER')) return 'Direct Seller';
    if (r.includes('LISTING_AGENT')) return 'Listing Agent';
    if (r.includes('BUYER_AGENT')) return "Buyer's Agent";
    if (r.includes('BUYER')) return 'Cash Buyer';
    if (r.includes('TITLE')) return 'Title & Escrow Officer';
    if (r.includes('ATTORNEY')) return 'Real Estate Attorney';
    if (r.includes('WHOLESALE')) return 'Co-Wholesaler';
    if (r.includes('CONTRACTOR')) return 'Contractor / Vendor';
    return roleStr || 'Contact';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Universal Contacts Directory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized CRM directory for homeowners, agents, buyers, title companies, attorneys & county municipalities
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold">
            <span className="text-amber-400 font-bold">{filteredContacts.length}</span> / {consolidatedContacts.length} Contacts
          </div>
          <button
            onClick={() =>
              exportToCSV('Universal_Contacts_Directory', filteredContacts, [
                { key: 'firstName', label: 'First Name' },
                { key: 'lastName', label: 'Last Name' },
                { key: 'role', label: 'Role' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'company', label: 'Company / Municipality' },
                { key: 'streetAddress', label: 'Street Address' },
                { key: 'unit', label: 'Apt / Suite #' },
                { key: 'city', label: 'City' },
                { key: 'state', label: 'State' },
                { key: 'zip', label: 'Zip Code' },
                { key: 'associatedPropertyAddress', label: 'Associated Property' },
                { key: 'notes', label: 'Notes' },
              ])
            }
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Multi-Field Independent Search Filters */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <Filter className="w-4 h-4" /> Multi-Field Search Engine
          </span>
          {(globalQuery || nameQuery || streetQuery || unitQuery || zipQuery || selectedRole !== 'ALL') && (
            <button
              onClick={() => {
                setGlobalQuery('');
                setNameQuery('');
                setStreetQuery('');
                setUnitQuery('');
                setZipQuery('');
                setSelectedRole('ALL');
              }}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
        {/* Global Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            placeholder="Universal Search across ALL phone numbers, names, addresses, companies..."
            className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-400 font-medium"
          />
        </div>
        {/* Independent Structured Fields Search Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Search First / Last Name
            </label>
            <input
              type="text"
              placeholder="e.g. Thomas or Jenkins"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Search Street Name / Address
            </label>
            <input
              type="text"
              placeholder="e.g. Evergreen or 200 S 9th"
              value={streetQuery}
              onChange={(e) => setStreetQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Search Apt / Suite #
            </label>
            <input
              type="text"
              placeholder="e.g. Room 101 or Suite A"
              value={unitQuery}
              onChange={(e) => setUnitQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Search Zip Code
            </label>
            <input
              type="text"
              placeholder="e.g. 62701 or 62704"
              value={zipQuery}
              onChange={(e) => setZipQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono font-bold rounded-lg p-2 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
        {/* Role Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0 mr-1">
            Category:
          </span>
          {[
            { id: 'ALL', label: 'All Contacts' },
            { id: 'COUNTY_MUNICIPALITY', label: 'County & Municipalities' },
            { id: 'DIRECT_SELLER', label: 'Direct Sellers' },
            { id: 'LISTING_AGENT', label: 'Listing Agents' },
            { id: 'CASH_BUYER', label: 'Cash Buyers' },
            { id: 'TITLE_COMPANY', label: 'Title & Escrow' },
            { id: 'ATTORNEY', label: 'Attorneys' },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedRole === role.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const fullName =
            `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.company || 'Unnamed Contact';
          const matchedLead = contact.leadId
            ? leads.find((l) => l.id === contact.leadId)
            : undefined;
          return (
            <div
              key={contact.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all p-5 flex flex-col justify-between shadow-xl space-y-4 relative group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-slate-800 text-amber-400 rounded-xl border border-slate-700 font-bold shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white line-clamp-1">
                        {fullName}
                      </h3>
                      {contact.company && (
                        <p className="text-xs text-slate-400 font-medium flex items-center space-x-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{contact.company}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider shrink-0 ${getRoleBadge(
                      contact.role
                    )}`}
                  >
                    {getRoleLabel(contact.role)}
                  </span>
                </div>
                {/* Structured Contact Details */}
                <div className="space-y-2 text-xs bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  {/* Phone */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-slate-200">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {contact.phone || 'No Phone Recorded'}
                      </span>
                    </div>
                    {contact.phone && (
                      <button
                        onClick={() => handleCopy(contact.phone, `${contact.id}-phone`)}
                        className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedId === `${contact.id}-phone` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  {/* Email */}
                  {contact.email && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                      <div className="flex items-center space-x-2 text-slate-300 truncate max-w-[210px]">
                        <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate text-[11px] font-mono">{contact.email}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(contact.email!, `${contact.id}-email`)}
                        className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedId === `${contact.id}-email` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                  {/* Structured Address */}
                  {(contact.streetAddress || contact.city || contact.zip) && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <div className="flex items-start space-x-2 text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          {contact.streetAddress && (
                            <span className="font-bold text-slate-100 block">
                              {contact.streetAddress}{' '}
                              {contact.unit ? <span className="text-amber-400">({contact.unit})</span> : ''}
                            </span>
                          )}
                          {(contact.city || contact.state || contact.zip) && (
                            <span className="text-slate-400 font-medium">
                              {contact.city}
                              {contact.city && contact.state ? `, ${contact.state}` : contact.state}{' '}
                              <span className="text-amber-300 font-mono font-bold">{contact.zip}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Associated Subject Property */}
                  {contact.associatedPropertyAddress && (
                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">
                        Associated Property
                      </span>
                      <span className="text-[11px] font-bold text-amber-300 block line-clamp-1">
                        {contact.associatedPropertyAddress}
                      </span>
                    </div>
                  )}
                </div>
                {/* Notes */}
                {contact.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 line-clamp-2">
                    "{contact.notes}"
                  </p>
                )}
              </div>
              {/* Action Toolbar with Full CRUD */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => onOpenCallDialer(matchedLead, contact.phone, fullName)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </button>
                {/* Edit Contact Button */}
                <button
                  onClick={() => handleEdit(contact)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Edit Contact Record"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {/* Delete Contact Button */}
                <button
                  onClick={() => handleDelete(contact)}
                  className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Delete Contact Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {matchedLead && (
                  <button
                    onClick={() => onOpenLeadDetail(matchedLead)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="View Deal Record"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredContacts.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Contacts Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No contacts matched your search query or address filters. Try searching for a phone number, street name, or zip code.
            </p>
            <button
              onClick={() => {
                setGlobalQuery('');
                setNameQuery('');
                setStreetQuery('');
                setUnitQuery('');
                setZipQuery('');
                setSelectedRole('ALL');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/20 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Contact Form Modal (Create / Edit) — new unified form, defaults to OTHER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="w-full max-w-3xl my-auto max-h-[90vh] overflow-y-auto">
{isModalOpen && (
  <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
    <div className="w-full max-w-3xl my-auto max-h-[90vh] overflow-y-auto">
      <QuickAddContactForm
        initialRole="OTHER"
        initialData={editingContact || undefined}
        title={editingContact ? 'Edit Contact Record' : 'Add New CRM Contact'}
        availableDeals={leads}
        onCreateDeal={onSaveLead}
        onCreateProperty={onCreateProperty}
        territories={territories}
        callLogs={callLogs}
        onSaveContact={async (data) => {
          if (editingContact) {
            await onUpdateContact({ ...data, id: editingContact.id });
          } else {
            await onCreateContact({ ...data, role: data.role || 'OTHER' });
          }
        }}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
      />
    </div>
  </div>
)}
          </div>
        </div>
      )}
    </div>
  );
};
