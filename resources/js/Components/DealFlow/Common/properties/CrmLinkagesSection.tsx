import React, { useMemo } from 'react';
import { Kanban } from 'lucide-react';
import type { Contact, Buyer, TitleCompany } from '@/types/dealflow';
import { SearchableCombobox, ComboboxOption } from '../SearchableCombobox';

interface CrmLinkagesSectionProps {
  contacts: Contact[];
  buyers: Buyer[];
  titleCompanies: TitleCompany[];
  sellerContactId: string;
  agentContactId: string;
  buyerId: string;
  titleCompanyId: string;
  municipalityContactId: string;
  onSellerChange: (id: string) => void;
  onAgentChange: (id: string) => void;
  onBuyerChange: (id: string) => void;
  onTitleChange: (id: string) => void;
  onMunicipalityChange: (id: string) => void;
}

export const CrmLinkagesSection: React.FC<CrmLinkagesSectionProps> = ({
  contacts, buyers, titleCompanies,
  sellerContactId, agentContactId, buyerId, titleCompanyId, municipalityContactId,
  onSellerChange, onAgentChange, onBuyerChange, onTitleChange, onMunicipalityChange,
}) => {
  const sellers = useMemo(() => contacts.filter((c) => (c.role || '').toUpperCase().includes('SELLER')), [contacts]);
  const agents = useMemo(() => contacts.filter((c) => (c.role || '').toUpperCase().includes('AGENT')), [contacts]);
  const municipalities = useMemo(() => contacts.filter((c) => (c.role || '').toUpperCase().includes('MUNICIPAL') || (c.role || '').toUpperCase().includes('COUNTY')), [contacts]);

  const sellerOptions: ComboboxOption[] = sellers.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}`, sublabel: `${c.phone || ''} ${c.email ? '• ' + c.email : ''}`, badge: c.role || 'DIRECT_SELLER', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }));
  const agentOptions: ComboboxOption[] = agents.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}`, sublabel: `${c.company ? c.company + ' • ' : ''}${c.phone || ''}`, badge: c.role || 'AGENT', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }));
  const buyerOptions: ComboboxOption[] = buyers.map((b) => ({ value: b.id, label: b.name, sublabel: `${b.company ? b.company + ' • ' : ''}Criteria: ${b.targetMarkets?.join(', ') || 'All Markets'} • ${b.phone || ''}`, badge: b.tier ? `${b.tier} BUYER` : 'CASH BUYER', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }));
  const titleCompanyOptions: ComboboxOption[] = titleCompanies.map((tc) => ({ value: tc.id, label: tc.name, sublabel: `Officer: ${tc.officerName} • ${tc.phone} • ${tc.email}`, badge: 'TITLE CO', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' }));
  const municipalityOptions: ComboboxOption[] = municipalities.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}`, sublabel: `${c.company || 'County Clerk'} • ${c.phone || ''}`, badge: 'GOV MUNICIPAL', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }));

  return (
    <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
      <div>
        <h3 className="font-extrabold text-white text-xs uppercase tracking-wide flex items-center gap-2 text-amber-400">
          <Kanban className="w-4 h-4" /> Live Search CRM Component Linkages
        </h3>
        <p className="text-[11px] text-slate-400">Search and link this property to sellers, agents, cash buyers, title companies, or municipal contacts.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SearchableCombobox options={sellerOptions} value={sellerContactId} onChange={onSellerChange} placeholder="🔍 Search Direct Seller by name or phone..." label="Linked Direct Seller" emptyMessage="No matching direct sellers found" />
        <SearchableCombobox options={agentOptions} value={agentContactId} onChange={onAgentChange} placeholder="🔍 Search Listing / Buyer Agent by name..." label="Linked Listing / Buyer Agent" emptyMessage="No matching agents found" />
        <SearchableCombobox options={buyerOptions} value={buyerId} onChange={onBuyerChange} placeholder="🔍 Search Cash Buyer by name or criteria..." label="Linked Cash Buyer / Builder" emptyMessage="No matching cash buyers found" />
        <SearchableCombobox options={titleCompanyOptions} value={titleCompanyId} onChange={onTitleChange} placeholder="🔍 Search Title Company by name or officer..." label="Linked Title Company" emptyMessage="No matching title companies found" />
        <div className="sm:col-span-2">
          <SearchableCombobox options={municipalityOptions} value={municipalityContactId} onChange={onMunicipalityChange} placeholder="🔍 Search County / City Municipality Contact..." label="Linked County / City Code Enforcement Contact" emptyMessage="No matching municipality contacts found" />
        </div>
      </div>
    </div>
  );
};
