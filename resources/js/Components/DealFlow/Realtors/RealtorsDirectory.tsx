import React, { useState, useMemo } from 'react';
import {
  Building2,
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
  Briefcase,
  Award,
  Users,
} from 'lucide-react';
import type { Lead, Buyer, CallLog, Territory, TitleCompany, Contact, Property } from '@/types/dealflow';
import { exportToCSV } from '@/utils/exportUtils';
import { QuickAddContactForm } from '../Common/contacts/QuickAddContactForm';

interface RealtorsDirectoryProps {
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

export const RealtorsDirectory: React.FC<RealtorsDirectoryProps> = ({
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
  // Search & Filter State
  const [firstNameQuery, setFirstNameQuery] = useState('');
  const [lastNameQuery, setLastNameQuery] = useState('');
  const [brokerageQuery, setBrokerageQuery] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [agentRoleFilter, setAgentRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Consolidate Realtors & Agents from Custom Contacts, Leads (On-Market MLS), and Calls
  const realtorsList = useMemo(() => {
    const list: Contact[] = [];
    const seenKeys = new Set<string>();

    // 1. Direct Custom Contacts marked as AGENT, LISTING_AGENT, BUYER_AGENT, or CO_AGENT
    contacts.forEach((c) => {
      const roleUpper = (c.role || '').toUpperCase();
      if (roleUpper.includes('AGENT') || roleUpper.includes('REALTOR') || roleUpper.includes('BROKER')) {
        list.push(c);
        const phoneKey = c.phone?.replace(/\D/g, '');
        if (phoneKey) seenKeys.add(phoneKey);
        if (c.email) seenKeys.add(c.email.toLowerCase());
      }
    });

    // 2. Listing Agents & Co-Agents from Leads Pipeline
    leads.forEach((l) => {
      const isAgentRole = l.contactRole && (l.contactRole.includes('AGENT') || l.contactRole.includes('BROKER') || l.pipelineType === 'ON_MARKET');
      if (l.contactName && isAgentRole) {
        const phoneKey = l.contactPhone?.replace(/\D/g, '');
        if (!phoneKey || !seenKeys.has(phoneKey)) {
          const nameParts = l.contactName.trim().split(' ');
          const firstName = nameParts[0] || l.contactName;
          const lastName = nameParts.slice(1).join(' ') || '';
          list.push({
            id: `lead-realtor-${l.id}`,
            firstName,
            lastName,
            role: l.contactRole || 'LISTING_AGENT',
            phone: l.contactPhone || '',
            email: l.contactEmail || '',
            company: l.contactRole === 'BUYER_AGENT' ? "Buyer's Brokerage" : 'Listing Brokerage',
            streetAddress: l.propertyAddress,
            unit: '',
            city: l.city,
            state: l.state,
            zip: l.zip,
            associatedPropertyAddress: `${l.propertyAddress}, ${l.city}, ${l.state} ${l.zip}`,
            leadId: l.id,
            notes: `MLS Listed Property: ${l.propertyAddress}. Stage: ${l.stage}. ${l.notes || ''}`,
            source: 'LEAD',
          });
          if (phoneKey) seenKeys.add(phoneKey);
        }
      }
    });

    // 3. From Call Logs where contact is Agent / Realtor
    callLogs.forEach((c) => {
      const r = (c.contactRole || '').toUpperCase();
      if (c.contactName && (r.includes('AGENT') || r.includes('BROKER') || r.includes('REALTOR'))) {
        const phoneKey = c.contactPhone?.replace(/\D/g, '');
        if (!phoneKey || !seenKeys.has(phoneKey)) {
          const nameParts = c.contactName.trim().split(' ');
          const firstName = nameParts[0] || c.contactName;
          const lastName = nameParts.slice(1).join(' ') || '';
          list.push({
            id: `call-realtor-${c.id}`,
            firstName,
            lastName,
            role: c.contactRole || 'LISTING_AGENT',
            phone: c.contactPhone || '',
            associatedPropertyAddress: c.leadAddress,
            leadId: c.leadId,
            notes: c.notes || 'Agent call log entry',
            source: 'CALL_LOG',
          });
          if (phoneKey) seenKeys.add(phoneKey);
        }
      }
    });

    return list;
  }, [contacts, leads, callLogs]);

  // Filter Realtors List
  const filteredRealtors = useMemo(() => {
    return realtorsList.filter((r) => {
      const fn = (r.firstName || '').toLowerCase();
      const ln = (r.lastName || '').toLowerCase();
      const brokerage = (r.company || '').toLowerCase();
      const addr = (r.associatedPropertyAddress || `${r.streetAddress || ''} ${r.city || ''} ${r.zip || ''}`).toLowerCase();
      const phoneClean = (r.phone || '').replace(/\D/g, '');
      const roleUpper = (r.role || '').toUpperCase();

      if (firstNameQuery.trim()) {
        const q = firstNameQuery.trim().toLowerCase();
        if (!fn.includes(q)) return false;
      }
      if (lastNameQuery.trim()) {
        const q = lastNameQuery.trim().toLowerCase();
        if (!ln.includes(q)) return false;
      }
      if (brokerageQuery.trim()) {
        const q = brokerageQuery.trim().toLowerCase();
        if (!brokerage.includes(q)) return false;
      }
      if (addressQuery.trim()) {
        const q = addressQuery.trim().toLowerCase();
        if (!addr.includes(q)) return false;
      }
      if (phoneQuery.trim()) {
        const q = phoneQuery.trim().replace(/\D/g, '');
        if (!phoneClean.includes(q)) return false;
      }
      if (agentRoleFilter !== 'ALL') {
        if (agentRoleFilter === 'LISTING_AGENT' && !roleUpper.includes('LISTING')) return false;
        if (agentRoleFilter === 'BUYER_AGENT' && !roleUpper.includes('BUYER')) return false;
        if (agentRoleFilter === 'CO_AGENT' && !roleUpper.includes('CO_AGENT')) return false;
      }
      return true;
    });
  }, [realtorsList, firstNameQuery, lastNameQuery, brokerageQuery, addressQuery, phoneQuery, agentRoleFilter]);

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

  const handleEdit = (realtor: Contact) => {
    setEditingContact(realtor);
    setIsModalOpen(true);
  };

  const handleDelete = async (realtor: Contact) => {
    const realtorName = `${realtor.firstName || ''} ${realtor.lastName || ''}`.trim() || 'Realtor';
    if (window.confirm(`Are you sure you want to remove agent "${realtorName}"?`)) {
      await onDeleteContact(realtor.id);
    }
  };

  // KPIs
  const totalRealtors = realtorsList.length;
  const listingAgentsCount = realtorsList.filter((r) => (r.role || '').toUpperCase().includes('LISTING')).length;
  const buyerAgentsCount = realtorsList.filter((r) => (r.role || '').toUpperCase().includes('BUYER')).length;
  const mlsLinkedCount = realtorsList.filter((r) => r.leadId).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Realtors & Real Estate Agents Hub</span>
              <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded-full border border-amber-500/30">
                On-Market MLS
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track listing agents, buyer's agents, brokerages, and investor-friendly realtors
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() =>
              exportToCSV('Realtors_And_Agents_Directory', filteredRealtors, [
                { key: 'firstName', label: 'First Name' },
                { key: 'lastName', label: 'Last Name' },
                { key: 'role', label: 'Agent Role' },
                { key: 'company', label: 'Brokerage / Agency Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'associatedPropertyAddress', label: 'Listed Property Address' },
                { key: 'notes', label: 'Commission Terms & Agent Notes' },
              ])
            }
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Realtors CSV</span>
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Realtor / Agent</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Realtors Tracked</span>
          <p className="text-2xl font-black text-white mt-1">{totalRealtors}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Listing Agents (MLS)</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{listingAgentsCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide">Buyer's Agents</span>
          <p className="text-2xl font-black text-sky-400 mt-1">{buyerAgentsCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Active MLS Deals</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{mlsLinkedCount}</p>
        </div>
      </div>

      {/* Independent Live Search Engine */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <Filter className="w-4 h-4" /> Live Realtor Search & Brokerage Filter
          </span>
          {(firstNameQuery || lastNameQuery || brokerageQuery || addressQuery || phoneQuery || agentRoleFilter !== 'ALL') && (
            <button
              onClick={() => {
                setFirstNameQuery('');
                setLastNameQuery('');
                setBrokerageQuery('');
                setAddressQuery('');
                setPhoneQuery('');
                setAgentRoleFilter('ALL');
              }}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Agent First Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah"
              value={firstNameQuery}
              onChange={(e) => setFirstNameQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Agent Last Name
            </label>
            <input
              type="text"
              placeholder="e.g. Jenkins"
              value={lastNameQuery}
              onChange={(e) => setLastNameQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Brokerage / Agency
            </label>
            <input
              type="text"
              placeholder="e.g. Re/Max or Keller Williams"
              value={brokerageQuery}
              onChange={(e) => setBrokerageQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Listed Property Address
            </label>
            <input
              type="text"
              placeholder="e.g. Evergreen or 9th"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Agent Phone Number
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
        {/* Role Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0 mr-1">
            Agent Classification:
          </span>
          {[
            { id: 'ALL', label: 'All Realtors & Agents' },
            { id: 'LISTING_AGENT', label: 'Listing Agents (On-Market)' },
            { id: 'BUYER_AGENT', label: "Buyer's Agents" },
            { id: 'CO_AGENT', label: 'Co-Listing Agents' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setAgentRoleFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                agentRoleFilter === item.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Realtors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRealtors.map((realtor) => {
          const fullName = `${realtor.firstName || ''} ${realtor.lastName || ''}`.trim() || 'Real Estate Agent';
          const isCustom = realtor.source === 'CUSTOM' || !realtor.source;
          const roleUpper = (realtor.role || '').toUpperCase();
          const isListing = roleUpper.includes('LISTING');
          return (
            <div
              key={realtor.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all group relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-white text-base group-hover:text-amber-400 transition-colors">
                        {fullName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                          isListing
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        }`}
                      >
                        {isListing ? 'Listing Agent' : "Buyer's Agent"}
                      </span>
                    </div>
                    {realtor.company && (
                      <p className="text-xs text-amber-400/90 font-semibold mt-0.5 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-amber-400" />
                        {realtor.company}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleEdit(realtor)}
                      title="Edit Realtor Record"
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {isCustom && (
                      <button
                        onClick={() => handleDelete(realtor)}
                        title="Delete Realtor Record"
                        className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Associated MLS Listed Property */}
                {(realtor.associatedPropertyAddress || realtor.streetAddress) && (
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 font-medium flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {realtor.associatedPropertyAddress || `${realtor.streetAddress || ''} ${realtor.city || ''} ${realtor.state || ''} ${realtor.zip || ''}`}
                    </span>
                  </div>
                )}
                {/* Contact Information */}
                <div className="space-y-1.5 text-xs">
                  {realtor.phone ? (
                    <div className="flex items-center justify-between bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {realtor.phone}
                      </span>
                      <button
                        onClick={() => handleCopy(realtor.phone, `phone-${realtor.id}`)}
                        className="text-slate-400 hover:text-white p-1 cursor-pointer"
                      >
                        {copiedId === `phone-${realtor.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic block">No Phone Number Recorded</span>
                  )}
                  {realtor.email && (
                    <div className="flex items-center justify-between bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-300 font-mono text-[11px] truncate flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        {realtor.email}
                      </span>
                    </div>
                  )}
                </div>
                {/* Commission / Notes */}
                {realtor.notes && (
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    <p className="line-clamp-3">{realtor.notes}</p>
                  </div>
                )}
              </div>
              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {realtor.phone ? (
                  <button
                    onClick={() => onOpenCallDialer(undefined, realtor.phone, fullName)}
                    className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-extrabold rounded-xl border border-emerald-500/30 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Realtor</span>
                  </button>
                ) : (
                  <div className="flex-1 py-2 text-center text-[11px] text-slate-500 italic">No phone to dial</div>
                )}
                {realtor.leadId && (
                  <button
                    onClick={() => onOpenLeadDetail(realtor.leadId!)}
                    className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded-xl border border-amber-500/30 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>View MLS Deal</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredRealtors.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold text-white text-sm">No realtors or real estate agents found</p>
            <p>Try clearing your live search query or click "Add Realtor / Agent" to register an agent.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal (new unified form — auto-selects LISTING_AGENT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="w-full max-w-3xl my-auto max-h-[90vh] overflow-y-auto">
            <QuickAddContactForm
              initialRole="LISTING_AGENT"
              initialData={editingContact || undefined}
              title={editingContact ? 'Edit Realtor Record' : 'Register New Realtor / Agent'}
              onSaveContact={async (data) => {
                if (editingContact) {
                  await onUpdateContact({ ...data, id: editingContact.id });
                } else {
                  await onCreateContact({ ...data, role: data.role || 'LISTING_AGENT' });
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
