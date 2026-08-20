import React, { useState, useMemo } from 'react';
import {
  Building,
  Search,
  MapPin,
  DollarSign,
  Plus,
  PhoneCall,
  Download,
  Edit3,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  ExternalLink,
  User,
  Users,
  Landmark,
  ShieldCheck,
  Kanban,
  Filter,
  X,
  FileText,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Property, Lead, Contact, Buyer, TitleCompany, Territory } from '@/types/dealflow';
import { exportToCSV } from '@/utils/exportUtils';
import { PropertyFormModal } from './PropertyFormModal';

interface PropertiesDirectoryProps {
  properties: Property[];
  leads: Lead[];
  contacts: Contact[];
  buyers: Buyer[];
  titleCompanies: TitleCompany[];
  territories?: Territory[];
  selectedTerritoryId?: string | null;
  onOpenCallDialer: (lead?: Lead, contactPhone?: string, contactName?: string) => void;
  onOpenLeadDetail: (leadOrId: Lead | string) => void;
  onCreateProperty: (propertyData: Partial<Property>) => Promise<void>;
  onUpdateProperty: (propertyData: Partial<Property>) => Promise<void>;
  onDeleteProperty: (propertyId: string) => Promise<void>;
  onSaveLead?: (leadData: Partial<Lead>) => Promise<Lead | void>;
  onCreateContact?: (contactData: Partial<Contact>) => Promise<void>;
}

export const PropertiesDirectory: React.FC<PropertiesDirectoryProps> = ({
  properties = [],
  leads = [],
  contacts = [],
  buyers = [],
  titleCompanies = [],
  territories = [],
  selectedTerritoryId,
  onOpenCallDialer,
  onOpenLeadDetail,
  onCreateProperty,
  onUpdateProperty,
  onDeleteProperty,
  onSaveLead,
  onCreateContact,
}) => {
  // Search & Filter State
  const [globalQuery, setGlobalQuery] = useState('');
  const [streetQuery, setStreetQuery] = useState('');
  const [unitQuery, setUnitQuery] = useState('');
  const [zipQuery, setZipQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedOccupancy, setSelectedOccupancy] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Gallery Modal
  const [activeGalleryImages, setActiveGalleryImages] = useState<string[] | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Multi-Field Search & Filter Engine
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const street = (p.streetAddress || '').toLowerCase();
      const unit = (p.unit || '').toLowerCase();
      const city = (p.city || '').toLowerCase();
      const state = (p.state || '').toLowerCase();
      const zip = (p.zip || '').toLowerCase();
      const fullAddr = `${p.streetAddress || ''} ${p.unit || ''} ${p.city || ''} ${p.state || ''} ${p.zip || ''}`.toLowerCase();
      const notes = (p.notes || '').toLowerCase();

      // Find linked names
      const seller = contacts.find((c) => c.id === p.sellerContactId);
      const sellerName = seller ? `${seller.firstName} ${seller.lastName}`.toLowerCase() : '';
      const agent = contacts.find((c) => c.id === p.agentContactId);
      const agentName = agent ? `${agent.firstName} ${agent.lastName}`.toLowerCase() : '';
      const buyer = buyers.find((b) => b.id === p.buyerId);
      const buyerName = buyer ? buyer.name.toLowerCase() : '';
      const title = titleCompanies.find((tc) => tc.id === p.titleCompanyId);
      const titleName = title ? title.name.toLowerCase() : '';

      // 1. Global Search
      if (globalQuery.trim()) {
        const q = globalQuery.trim().toLowerCase();
        const matchesGlobal =
          fullAddr.includes(q) ||
          notes.includes(q) ||
          sellerName.includes(q) ||
          agentName.includes(q) ||
          buyerName.includes(q) ||
          titleName.includes(q);

        if (!matchesGlobal) return false;
      }

      // 2. Street Address Search
      if (streetQuery.trim()) {
        if (!street.includes(streetQuery.trim().toLowerCase())) return false;
      }

      // 3. Apt / Suite # Search
      if (unitQuery.trim()) {
        if (!unit.includes(unitQuery.trim().toLowerCase())) return false;
      }

      // 4. Zip Code Search
      if (zipQuery.trim()) {
        if (!zip.includes(zipQuery.trim().toLowerCase())) return false;
      }

      // 5. Property Type Filter
      if (selectedType !== 'ALL' && p.propertyType !== selectedType) {
        return false;
      }

      // 6. Occupancy Status Filter
      if (selectedOccupancy !== 'ALL' && p.occupancyStatus !== selectedOccupancy) {
        return false;
      }

      // 7. Active Territory Filter
      if (selectedTerritoryId && selectedTerritoryId !== 'ALL') {
        const matchesTerritory =
          p.territoryId === selectedTerritoryId ||
          (p.leadId && leads.some((l) => l.id === p.leadId && l.territoryId === selectedTerritoryId));
        if (!matchesTerritory && p.territoryId) {
          return false;
        }
      }

      return true;
    });
  }, [properties, globalQuery, streetQuery, unitQuery, zipQuery, selectedType, selectedOccupancy, selectedTerritoryId, leads, contacts, buyers, titleCompanies]);

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
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleDelete = async (property: Property) => {
    const addr = `${property.streetAddress}${property.unit ? ` (${property.unit})` : ''}`;
    if (window.confirm(`Are you sure you want to delete property record "${addr}"?`)) {
      await onDeleteProperty(property.id);
    }
  };

  const openGallery = (imgs: string[]) => {
    if (imgs.length > 0) {
      setActiveGalleryImages(imgs);
      setActiveImageIndex(0);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/20">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Property Portfolio & Assets Hub
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized real estate directory with photo galleries, document files, and multi-component CRM linkages
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold">
            <span className="text-amber-400 font-bold">{filteredProperties.length}</span> / {properties.length} Properties
          </div>

          <button
            onClick={() =>
              exportToCSV('Properties_Portfolio_Export', filteredProperties, [
                { key: 'streetAddress', label: 'Street Address' },
                { key: 'unit', label: 'Apt / Suite #' },
                { key: 'city', label: 'City' },
                { key: 'state', label: 'State' },
                { key: 'zip', label: 'Zip Code' },
                { key: 'propertyType', label: 'Property Type' },
                { key: 'beds', label: 'Beds' },
                { key: 'baths', label: 'Baths' },
                { key: 'sqft', label: 'Sqft' },
                { key: 'occupancyStatus', label: 'Occupancy' },
                { key: 'askingPrice', label: 'Asking Price' },
                { key: 'estimatedArv', label: 'Estimated ARV' },
                { key: 'estimatedRepairs', label: 'Repairs' },
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
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Multi-Field Search Engine & Filters */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <Filter className="w-4 h-4" /> Property Search Engine
          </span>
          {(globalQuery || streetQuery || unitQuery || zipQuery || selectedType !== 'ALL' || selectedOccupancy !== 'ALL') && (
            <button
              onClick={() => {
                setGlobalQuery('');
                setStreetQuery('');
                setUnitQuery('');
                setZipQuery('');
                setSelectedType('ALL');
                setSelectedOccupancy('ALL');
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
            placeholder="Search across all property addresses, notes, linked sellers, agents, or buyers..."
            className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-400 font-medium"
          />
        </div>

        {/* Structured Field Search Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Search Street Name
            </label>
            <input
              type="text"
              placeholder="e.g. Evergreen or Oakridge"
              value={streetQuery}
              onChange={(e) => setStreetQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Search Apt / Ste #
            </label>
            <input
              type="text"
              placeholder="e.g. Apt B or Ste 100"
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
              placeholder="e.g. 62704"
              value={zipQuery}
              onChange={(e) => setZipQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono font-bold rounded-lg p-2 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Property Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="SINGLE_FAMILY">Single Family</option>
              <option value="MULTI_FAMILY">Multi-Family</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="LAND">Land</option>
              <option value="MOBILE_HOME">Mobile Home</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Occupancy
            </label>
            <select
              value={selectedOccupancy}
              onChange={(e) => setSelectedOccupancy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold rounded-lg p-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">All Occupancy</option>
              <option value="VACANT">Vacant</option>
              <option value="TENANT_OCCUPIED">Tenant Occupied</option>
              <option value="OWNER_OCCUPIED">Owner Occupied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProperties.map((property) => {
          const coverImg = property.images && property.images.length > 0 ? property.images[0] : null;

          // Resolve Associations
          const linkedLead = property.leadId ? leads.find((l) => l.id === property.leadId) : undefined;
          const linkedSeller = property.sellerContactId ? contacts.find((c) => c.id === property.sellerContactId) : undefined;
          const linkedAgent = property.agentContactId ? contacts.find((c) => c.id === property.agentContactId) : undefined;
          const linkedBuyer = property.buyerId ? buyers.find((b) => b.id === property.buyerId) : undefined;
          const linkedTitle = property.titleCompanyId ? titleCompanies.find((tc) => tc.id === property.titleCompanyId) : undefined;
          const linkedMuni = property.municipalityContactId ? contacts.find((c) => c.id === property.municipalityContactId) : undefined;

          // MAO Calculation with Adjustable Formula & Wholesale Fee
          const arv = property.estimatedArv || 0;
          const repairs = property.estimatedRepairs || 0;
          const discountPct = property.maoDiscountPercent ?? 70;
          const wholesaleFee = property.maoWholesaleFee ?? 15000;
          const mao = arv > 0 ? Math.round(arv * (discountPct / 100) - repairs - wholesaleFee) : 0;

          return (
            <div
              key={property.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl space-y-3"
            >
              {/* Card Header Media */}
              <div className="relative h-44 bg-slate-950 overflow-hidden group">
                {coverImg ? (
                  <img
                    src={coverImg}
                    alt={property.streetAddress}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 space-y-1">
                    <Building className="w-10 h-10" />
                    <span className="text-[11px] font-bold">No Photo Uploaded</span>
                  </div>
                )}

                {/* Photo Badge overlay */}
                {property.images && property.images.length > 0 && (
                  <button
                    onClick={() => openGallery(property.images)}
                    className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-400 hover:text-white border border-slate-700/80 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{property.images.length} Photos</span>
                  </button>
                )}

                {/* Property Type Badge overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700/80 rounded text-[10px] font-extrabold uppercase tracking-wide">
                    {property.propertyType?.replace('_', ' ') || 'SINGLE FAMILY'}
                  </span>
                  <span className={`px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-md rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                    property.occupancyStatus === 'VACANT' ? 'text-emerald-400 border-emerald-500/40' : 'text-amber-400 border-amber-500/40'
                  }`}>
                    {property.occupancyStatus || 'VACANT'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-5 space-y-3">
                {/* Property Address */}
                <div>
                  <h3 className="text-base font-extrabold text-white line-clamp-1 flex items-center gap-1.5">
                    <span>{property.streetAddress}</span>
                    {property.unit && (
                      <span className="text-amber-400 font-mono text-xs">({property.unit})</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {property.city}, {property.state} <span className="text-amber-300 font-mono font-bold">{property.zip}</span>
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-4 gap-1 py-2 px-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Beds</span>
                    <span className="font-extrabold text-white">{property.beds ?? '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Baths</span>
                    <span className="font-extrabold text-white">{property.baths ?? '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Sqft</span>
                    <span className="font-extrabold text-white">{property.sqft ? property.sqft.toLocaleString() : '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Built</span>
                    <span className="font-extrabold text-white">{property.yearBuilt ?? '-'}</span>
                  </div>
                </div>

                {/* Multi-Structure Dwellings Badge (if applicable) */}
                {(property.hasMultipleStructures || (property.structures && property.structures.length > 0)) && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-300 flex items-center gap-1.5 text-[11px]">
                      <span>🏘️ {property.structures?.length || 2} Structures on Lot</span>
                    </span>
                    <span className="text-[10px] text-amber-200/80 italic font-medium truncate max-w-[170px]">
                      {property.structures?.map((s: any) => s.name).join(' + ') || '3x2 Trailer + 2x1 House'}
                    </span>
                  </div>
                )}

                {/* Financial Metrics */}
                <div className="grid grid-cols-4 gap-1.5 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Asking</span>
                    <span className="font-extrabold font-mono text-white">
                      ${(property.askingPrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Est. ARV</span>
                    <span className="font-extrabold font-mono text-emerald-400">
                      ${(property.estimatedArv || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Repairs</span>
                    <span className="font-extrabold font-mono text-rose-300">
                      ${(property.estimatedRepairs || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold block">{discountPct}% MAO</span>
                    <span className="font-extrabold font-mono text-amber-300">
                      ${mao.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Linked Component Associations */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider block">
                    Linked CRM Components
                  </span>

                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {/* Linked Pipeline Deal */}
                    {linkedLead && (
                      <button
                        onClick={() => onOpenLeadDetail(linkedLead)}
                        className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Kanban className="w-3 h-3 text-sky-400" />
                        <span>Deal: {linkedLead.stage}</span>
                      </button>
                    )}

                    {/* Linked Direct Seller */}
                    {linkedSeller && (
                      <button
                        onClick={() => onOpenCallDialer(undefined, linkedSeller.phone, `${linkedSeller.firstName} ${linkedSeller.lastName}`)}
                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title={`Seller: ${linkedSeller.firstName} ${linkedSeller.lastName}`}
                      >
                        <User className="w-3 h-3 text-emerald-400" />
                        <span>Seller: {linkedSeller.firstName}</span>
                      </button>
                    )}

                    {/* Linked Agent */}
                    {linkedAgent && (
                      <button
                        onClick={() => onOpenCallDialer(undefined, linkedAgent.phone, `${linkedAgent.firstName} ${linkedAgent.lastName}`)}
                        className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        <span>Agent: {linkedAgent.firstName}</span>
                      </button>
                    )}

                    {/* Linked Cash Buyer */}
                    {linkedBuyer && (
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-lg font-bold flex items-center gap-1">
                        <Users className="w-3 h-3 text-purple-400" />
                        <span>Buyer: {linkedBuyer.name}</span>
                      </span>
                    )}

                    {/* Linked Title Company */}
                    {linkedTitle && (
                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold flex items-center gap-1">
                        <Landmark className="w-3 h-3 text-indigo-400" />
                        <span>Title: {linkedTitle.name}</span>
                      </span>
                    )}

                    {/* Linked Municipality */}
                    {linkedMuni && (
                      <span className="px-2 py-1 bg-pink-500/10 text-pink-300 border border-pink-500/30 rounded-lg font-bold flex items-center gap-1">
                        <Building className="w-3 h-3 text-pink-400" />
                        <span>County Clerk: {linkedMuni.firstName}</span>
                      </span>
                    )}

                    {!linkedLead && !linkedSeller && !linkedAgent && !linkedBuyer && !linkedTitle && !linkedMuni && (
                      <span className="text-slate-500 text-[10px] italic">No components linked yet.</span>
                    )}
                  </div>
                </div>

                {/* File Attachments */}
                {property.attachments && property.attachments.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
                      <Paperclip className="w-3 h-3 text-sky-400" /> Document Attachments ({property.attachments.length})
                    </span>
                    <div className="space-y-1">
                      {property.attachments.map((att: any) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-colors"
                        >
                          <span className="font-bold truncate max-w-[200px]">{att.name}</span>
                          <span className="px-1.5 py-0.2 bg-slate-800 text-sky-300 rounded text-[9px] font-mono">
                            {att.fileType}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {property.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 line-clamp-2">
                    "{property.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer Action Toolbar */}
              <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() =>
                    onOpenCallDialer(
                      linkedLead,
                      linkedSeller?.phone || linkedAgent?.phone,
                      linkedSeller ? `${linkedSeller.firstName} ${linkedSeller.lastName}` : linkedAgent ? `${linkedAgent.firstName} ${linkedAgent.lastName}` : property.streetAddress
                    )
                  }
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Contacts</span>
                </button>

                <button
                  onClick={() => handleEdit(property)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Edit Property"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(property)}
                  className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Delete Property"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredProperties.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <Building className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Properties Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No property records matched your search query or address filters. Try searching for a street name, zip code, or reset filters.
            </p>
            <button
              onClick={() => {
                setGlobalQuery('');
                setStreetQuery('');
                setUnitQuery('');
                setZipQuery('');
                setSelectedType('ALL');
                setSelectedOccupancy('ALL');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/20 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      <PropertyFormModal
        isOpen={isModalOpen}
        propertyToEdit={editingProperty}
        leads={leads}
        contacts={contacts}
        buyers={buyers}
        titleCompanies={titleCompanies}
        territories={territories}
        selectedTerritoryId={selectedTerritoryId}
        onSaveLead={onSaveLead}
        onCreateContact={onCreateContact}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProperty(null);
        }}
        onSaveProperty={async (data) => {
          if (editingProperty) {
            await onUpdateProperty(data);
          } else {
            await onCreateProperty(data);
          }
        }}
      />

      {/* Image Gallery Lightbox Modal */}
      {activeGalleryImages && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <button
              onClick={() => setActiveGalleryImages(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-slate-950/80 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={activeGalleryImages[activeImageIndex]}
                alt="Property Gallery"
                className="max-h-full max-w-full object-contain"
              />

              {activeGalleryImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === 0 ? activeGalleryImages.length - 1 : prev - 1))
                    }
                    className="absolute left-3 p-2 bg-slate-950/80 text-white rounded-full hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === activeGalleryImages.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 p-2 bg-slate-950/80 text-white rounded-full hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-center space-x-2">
              <span className="text-xs font-bold text-amber-400">
                Photo {activeImageIndex + 1} of {activeGalleryImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
