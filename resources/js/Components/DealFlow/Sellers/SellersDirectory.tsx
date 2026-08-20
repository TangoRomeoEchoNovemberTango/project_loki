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
  Download,
  Edit3,
  Trash2,
  Filter,
  X,
  Flame,
  FileText,
  AlertTriangle,
  User,
} from 'lucide-react';
import type { Lead, Buyer, CallLog, Territory, TitleCompany, Contact } from '@/types/dealflow';
import { exportToCSV } from '@/utils/exportUtils';
import { QuickAddContactForm } from '../Common/contacts/QuickAddContactForm';

interface SellersDirectoryProps {
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
}

export const SellersDirectory: React.FC<SellersDirectoryProps> = ({
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
}) => {
  // Search & Filter State
  const [firstNameQuery, setFirstNameQuery] = useState('');
  const [lastNameQuery, setLastNameQuery] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [motivationFilter, setMotivationFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Consolidate Sellers from Custom Contacts, Leads (Off-Market & Direct), and Calls
  const sellersList = useMemo(() => {
    const list: Contact[] = [];
    const seenKeys = new Set<string>();

    // 1. Direct Custom Contacts marked as DIRECT_SELLER
    contacts.forEach((c) => {
      const roleUpper = (c.role || '').toUpperCase();
      if (roleUpper.includes('SELLER') || roleUpper.includes('HOMEOWNER') || roleUpper === 'DIRECT_SELLER') {
        list.push(c);
        const phoneKey = c.phone?.replace(/\D/g, '');
        if (phoneKey) seenKeys.add(phoneKey);
        if (c.email) seenKeys.add(c.email.toLowerCase());
      }
    });

    // 2. Sellers from Leads Pipeline (Off-market Gov lists & Direct sellers)
    leads.forEach((l) => {
      const isSellerRole = !l.contactRole || l.contactRole === 'DIRECT_SELLER';
      if (l.contactName && isSellerRole) {
        const phoneKey = l.contactPhone?.replace(/\D/g, '');
        if (!phoneKey || !seenKeys.has(phoneKey)) {
          const nameParts = l.contactName.trim().split(' ');
          const firstName = nameParts[0] || l.contactName;
          const lastName = nameParts.slice(1).join(' ') || '';
          list.push({
            id: `lead-seller-${l.id}`,
            firstName,
            lastName,
            role: 'DIRECT_SELLER',
            phone: l.contactPhone || '',
            email: l.contactEmail || '',
            company: l.govListType ? `Gov List: ${l.govListType}` : 'Direct Property Owner',
            streetAddress: l.propertyAddress,
            unit: '',
            city: l.city,
            state: l.state,
            zip: l.zip,
            associatedPropertyAddress: `${l.propertyAddress}, ${l.city}, ${l.state} ${l.zip}`,
            leadId: l.id,
            notes: `Pipeline Stage: ${l.stage}. ${l.govListType ? 'List: ' + l.govListType + '.' : ''} ${l.notes || ''}`,
            source: 'LEAD',
          });
          if (phoneKey) seenKeys.add(phoneKey);
        }
      }
    });

    // 3. From Call Logs where contact is seller
    callLogs.forEach((c) => {
      const r = (c.contactRole || '').toUpperCase();
      if (c.contactName && (r.includes('SELLER') || r.includes('HOMEOWNER') || !r)) {
        const phoneKey = c.contactPhone?.replace(/\D/g, '');
        if (!phoneKey || !seenKeys.has(phoneKey)) {
          const nameParts = c.contactName.trim().split(' ');
          const firstName = nameParts[0] || c.contactName;
          const lastName = nameParts.slice(1).join(' ') || '';
          list.push({
            id: `call-seller-${c.id}`,
            firstName,
            lastName,
            role: 'DIRECT_SELLER',
            phone: c.contactPhone || '',
            associatedPropertyAddress: c.leadAddress,
            leadId: c.leadId,
            notes: c.notes || 'Seller call log entry',
            source: 'CALL_LOG',
          });
          if (phoneKey) seenKeys.add(phoneKey);
        }
      }
    });

    return list;
  }, [contacts, leads, callLogs]);

  // Filter Sellers List
  const filteredSellers = useMemo(() => {
    return sellersList.filter((s) => {
      const fn = (s.firstName || '').toLowerCase();
      const ln = (s.lastName || '').toLowerCase();
      const addr = (s.associatedPropertyAddress || `${s.streetAddress || ''} ${s.city || ''} ${s.zip || ''}`).toLowerCase();
      const phoneClean = (s.phone || '').replace(/\D/g, '');
      const notes = (s.notes || '').toLowerCase();
      const company = (s.company || '').toLowerCase();

      if (firstNameQuery.trim()) {
        const q = firstNameQuery.trim().toLowerCase();
        if (!fn.includes(q)) return false;
      }
      if (lastNameQuery.trim()) {
        const q = lastNameQuery.trim().toLowerCase();
        if (!ln.includes(q)) return false;
      }
      if (addressQuery.trim()) {
        const q = addressQuery.trim().toLowerCase();
        if (!addr.includes(q)) return false;
      }
      if (phoneQuery.trim()) {
        const q = phoneQuery.trim().replace(/\D/g, '');
        if (!phoneClean.includes(q)) return false;
      }
      if (motivationFilter !== 'ALL') {
        const filterTag = motivationFilter.toLowerCase();
        const matchesNoteOrCompany = notes.includes(filterTag) || company.includes(filterTag);
        if (!matchesNoteOrCompany) return false;
      }
      return true;
    });
  }, [sellersList, firstNameQuery, lastNameQuery, addressQuery, phoneQuery, motivationFilter]);

  const handleCopy = (text: string, id: string) => {
    try {
      if (navigator.clipboard?.writeText) {
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

  const handleEdit = (seller: Contact) => {
    setEditingContact(seller);
    setIsModalOpen(true);
  };

  const handleDelete = async (seller: Contact) => {
    const sellerName = `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Seller';
    if (window.confirm(`Are you sure you want to remove seller "${sellerName}"?`)) {
      await onDeleteContact(seller.id);
    }
  };

  // KPIs
  const totalSellers = sellersList.length;
  const leadLinkedSellers = sellersList.filter((s) => s.leadId).length;
  const phoneCount = sellersList.filter((s) => s.phone && s.phone.length >= 7).length;
  const phonePercentage = totalSellers > 0 ? Math.round((phoneCount / totalSellers) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Sellers Hub & Owner Tracking</span>
              <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded-full border border-amber-500/30">
                Off-Market & Direct
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track direct homeowners, probate heirs, code violation sellers, and skip-traced contacts
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() =>
              exportToCSV('Property_Sellers_Directory', filteredSellers, [
                { key: 'firstName', label: 'First Name' },
                { key: 'lastName', label: 'Last Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'associatedPropertyAddress', label: 'Subject Property Address' },
                { key: 'company', label: 'List Category / Source' },
                { key: 'notes', label: 'Seller Notes & Motivation' },
              ])
            }
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Sellers CSV</span>
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Direct Seller</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Sellers Tracked</span>
          <p className="text-2xl font-black text-white mt-1">{totalSellers}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Active Deal Sellers</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{leadLinkedSellers}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Skip-Traced Phones</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{phoneCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide">Phone Coverage</span>
          <p className="text-2xl font-black text-sky-400 mt-1">{phonePercentage}%</p>
        </div>
      </div>

      {/* Independent Live Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <Filter className="w-4 h-4" /> Live Seller Search & Motivation Filter
          </span>
          {(firstNameQuery || lastNameQuery || addressQuery || phoneQuery || motivationFilter !== 'ALL') && (
            <button
              onClick={() => {
                setFirstNameQuery('');
                setLastNameQuery('');
                setAddressQuery('');
                setPhoneQuery('');
                setMotivationFilter('ALL');
              }}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Seller First Name
            </label>
            <input
              type="text"
              placeholder="e.g. Thomas"
              value={firstNameQuery}
              onChange={(e) => setFirstNameQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Seller Last Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sterling"
              value={lastNameQuery}
              onChange={(e) => setLastNameQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Subject Property Address
            </label>
            <input
              type="text"
              placeholder="e.g. Evergreen or Grand"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Seller Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. 555-0192"
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono font-bold rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
        {/* Motivation Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0 mr-1">
            Motivation / Source:
          </span>
          {[
            { id: 'ALL', label: 'All Sellers' },
            { id: 'PROBATE', label: 'Probate / Heirs' },
            { id: 'TAX_DELINQUENT', label: 'Tax Delinquent' },
            { id: 'PRE_FORECLOSURE', label: 'Pre-Foreclosure' },
            { id: 'EVICTION', label: 'Eviction' },
            { id: 'CODE_VIOLATION', label: 'Code Violation' },
            { id: 'TIRED_LANDLORD', label: 'Tired Landlord' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMotivationFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                motivationFilter === item.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sellers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSellers.map((seller) => {
          const fullName = `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Property Owner';
          const isCustom = seller.source === 'CUSTOM' || !seller.source;
          return (
            <div
              key={seller.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all group relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-white text-base group-hover:text-amber-400 transition-colors">
                        {fullName}
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold rounded-full">
                        Direct Seller
                      </span>
                    </div>
                    {seller.company && (
                      <p className="text-xs text-amber-400/90 font-semibold mt-0.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-amber-400" />
                        {seller.company}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleEdit(seller)}
                      title="Edit Seller Contact"
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {isCustom && (
                      <button
                        onClick={() => handleDelete(seller)}
                        title="Delete Seller Contact"
                        className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Subject Property Address */}
                {(seller.associatedPropertyAddress || seller.streetAddress) && (
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 font-medium flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {seller.associatedPropertyAddress || `${seller.streetAddress || ''} ${seller.city || ''} ${seller.state || ''} ${seller.zip || ''}`}
                    </span>
                  </div>
                )}
                {/* Contact Information */}
                <div className="space-y-1.5 text-xs">
                  {seller.phone ? (
                    <div className="flex items-center justify-between bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {seller.phone}
                      </span>
                      <button
                        onClick={() => handleCopy(seller.phone, `phone-${seller.id}`)}
                        className="text-slate-400 hover:text-white p-1 cursor-pointer"
                      >
                        {copiedId === `phone-${seller.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic block">No Phone Number Recorded</span>
                  )}
                  {seller.email && (
                    <div className="flex items-center justify-between bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-300 font-mono text-[11px] truncate flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        {seller.email}
                      </span>
                    </div>
                  )}
                </div>
                {/* Seller Motivation & Notes */}
                {seller.notes && (
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    <p className="line-clamp-3">{seller.notes}</p>
                  </div>
                )}
              </div>
              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {seller.phone ? (
                  <button
                    onClick={() => onOpenCallDialer(undefined, seller.phone, fullName)}
                    className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-extrabold rounded-xl border border-emerald-500/30 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Seller</span>
                  </button>
                ) : (
                  <div className="flex-1 py-2 text-center text-[11px] text-slate-500 italic">No phone to dial</div>
                )}
                {seller.leadId && (
                  <button
                    onClick={() => onOpenLeadDetail(seller.leadId!)}
                    className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded-xl border border-amber-500/30 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Deal</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredSellers.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
            <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold text-white text-sm">No property sellers found</p>
            <p>Try clearing your live search query or click "Add Direct Seller" to register a new seller.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal (new unified form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="w-full max-w-3xl my-auto max-h-[90vh] overflow-y-auto">
            <QuickAddContactForm
              initialRole="DIRECT_SELLER"
              initialData={editingContact || undefined}
              title={editingContact ? 'Edit Seller Contact Record' : 'Register New Direct Seller'}
              onSaveContact={async (data) => {
                if (editingContact) {
                  await onUpdateContact({ ...data, id: editingContact.id });
                } else {
                  await onCreateContact({ ...data, role: data.role || 'DIRECT_SELLER' });
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
  );
};
