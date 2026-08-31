import React, { useState, useMemo } from 'react';
import { Link2, Search, X, Briefcase, Plus, Sparkles } from 'lucide-react';
import type {
  Lead, Property, CallLog, Territory, ContactRole,
  PipelineType, GovListType, LeadStage,
} from '@/types/dealflow';
import { DealTypeSelector } from '@/Components/DealFlow/Common/financials/DealTypeSelector';
import { PipelineStageSelector } from '@/Components/DealFlow/Common/leads/PipelineStageSelector';
import { PropertyLinkPicker } from '@/Components/DealFlow/Common/properties/PropertyLinkPicker';
import { DealIdentitySection } from '@/Components/DealFlow/Common/deals/DealIdentitySection';
import { QuickAddPropertyForm } from '@/Components/DealFlow/Common/properties/QuickAddPropertyForm';

// ── Pipeline stage options ───────────────────────────────────────────────────
const OFF_MARKET_STAGES = [
  { value: 'GOV_LIST_PULLED', label: '1. GOV LIST PULLED (Column 1 - Cold Lead In)' },
  { value: 'SKIP_TRACED', label: '2. SKIP-TRACED (Column 2 - Phone/Email Verified)' },
  { value: 'MCTP_QUALIFIED', label: '3. MCTP QUALIFIED (Column 3 - 4-Pillars Verified)' },
  { value: 'OFFER_SENT_PDF', label: '4. OFFER SENT (PDF) (Column 4 - Purchase Agreement Delivered)' },
  { value: 'TITLE_EMD_SUBMITTED', label: '5. UNDER CONTRACT & TITLE (Column 5 - EMD Deposited)' },
  { value: 'DISPO_BUYER_ASSIGNED', label: '6. CASH BUYER DISPO (Column 6 - Buyer Assigned)' },
  { value: 'CLOSED', label: '7. CLOSED / WHOLESALE FEE (Column 7 - Fee Collected)' },
];

const ON_MARKET_STAGES = [
  { value: 'NEW', label: 'New On-Market (Column 1)' },
  { value: 'CONTACTED', label: 'Agent Contacted (Column 2)' },
  { value: 'VALUING', label: 'Valuation & MAO (Column 3)' },
  { value: 'OFFER_SENT', label: 'Offer Sent (LOI) (Column 4)' },
  { value: 'NEGOTIATING', label: 'Negotiating (Column 5)' },
  { value: 'UNDER_CONTRACT_ACQ', label: 'Under Contract (Acq) (Column 6)' },
  { value: 'DISPOSITION', label: 'Disposition (Buyers) (Column 7)' },
  { value: 'CLOSED', label: 'Closed / Fee Collected (Column 8)' },
];

interface DealLinkPickerProps {
  // IDs of deals currently linked to this entity
  linkedDealIds: string[];
  onLinkChange: (dealIds: string[]) => void;
  // Database of deals to search
  availableDeals: Lead[];
  label?: string;
  // ── Quick Add dependencies (optional) ──
  onCreateDeal?: (dealData: Partial<Lead>) => Promise<Lead | void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<void>;
  territories?: Territory[];
  properties?: Property[];
  callLogs?: CallLog[];
  currentContact?: { firstName: string; lastName: string; phone: string; role: ContactRole };
  forceQuickAddProperty?: boolean; // <--- ADD THIS LINE
}

export const DealLinkPicker: React.FC<DealLinkPickerProps> = ({
  linkedDealIds, onLinkChange, availableDeals, label = 'Link to Deal (Searchable)',
  onCreateDeal, onCreateProperty, territories = [], properties = [], callLogs = [],
  currentContact = { firstName: '', lastName: '', phone: '', role: 'DIRECT_SELLER' },
  forceQuickAddProperty = false, // <--- ADD THIS LINE
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // ── Quick Add state ──
  const [dealNumber, setDealNumber] = useState('');
  const [dealName, setDealName] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [dealType, setDealType] = useState<PipelineType>('OFF_MARKET_GOV');
  const [govListType, setGovListType] = useState<GovListType>('PROBATE');
  const [stage, setStage] = useState<LeadStage>('GOV_LIST_PULLED');
  const [newDealLeadId, setNewDealLeadId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const openQuickAdd = () => {
    if (!dealNumber) {
      const year = new Date().getFullYear();
      setDealNumber(`DEAL-${year}-${Math.floor(1000 + Math.random() * 9000)}`);
      setCreatedAt(new Date().toISOString());
    }
    setShowQuickAdd((prev) => !prev);
  };

  const handleDealTypeChange = (newType: PipelineType) => {
    setDealType(newType);
    setStage(newType === 'OFF_MARKET_GOV' ? 'GOV_LIST_PULLED' : 'NEW');
  };

  const toggleDeal = (dealId: string) => {
    if (linkedDealIds.includes(dealId)) onLinkChange(linkedDealIds.filter((id) => id !== dealId));
    else onLinkChange([...linkedDealIds, dealId]);
  };

  const handleCreateDeal = async () => {
    if (!onCreateDeal) return;
    if (!newDealLeadId) {
      setCreateError('A deal needs a property — link or quick-add one below first.');
      return;
    }
    setCreateError('');
    setIsCreating(true);
    try {
      const created = await onCreateDeal({
        id: newDealLeadId,
        dealNumber,
        dealName: dealName || undefined,
        createdAt,
        dealType,
        govListType: dealType === 'OFF_MARKET_GOV' ? govListType : undefined,
        stage,
      });
      const id = (created as Lead)?.id || newDealLeadId;
      if (id && !linkedDealIds.includes(id)) onLinkChange([...linkedDealIds, id]);
      // Reset + collapse
      setShowQuickAdd(false);
      setDealName(''); setDealNumber(''); setCreatedAt(''); setNewDealLeadId('');
    } catch (e) {
      console.error(e);
      setCreateError('Failed to create deal.');
    } finally {
      setIsCreating(false);
    }
  };

  // ── Live search (excludes already-linked deals) ──
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return availableDeals
      .filter((d) => !linkedDealIds.includes(d.id))
      .filter((d) =>
        (d.dealNumber || '').toLowerCase().includes(q) ||
        (d.dealName || '').toLowerCase().includes(q) ||
        (d.propertyAddress || '').toLowerCase().includes(q) ||
        (d.contactName || '').toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, availableDeals, linkedDealIds]);

  const linkedDeals = availableDeals.filter((d) => linkedDealIds.includes(d.id));

  return (
    <div className="p-4 bg-slate-900/60 border border-amber-500/30 rounded-xl space-y-3">
      {/* ── Header: title + Quick Add button (matches Property/Contact bricks) ── */}
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Link2 className="w-4 h-4" /> {label}
        </h4>
        <button
          type="button"
          onClick={openQuickAdd}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors shrink-0 ${
            showQuickAdd
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
          }`}
        >
          <Plus className="w-3 h-3" /> {showQuickAdd ? 'Close Quick Add' : '+ Quick Add Deal'}
        </button>
      </div>

      {/* ── Live Search Bar ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search deal #, name, address, or contact..."
          className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600"
        />
      </div>

      {/* ── Live Search Results ── */}
      {searchQuery.trim() !== '' && (
        <div className="space-y-1.5">
          {searchResults.length === 0 ? (
            <div className="text-xs text-slate-600 italic py-2 text-center bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
              No deals match "{searchQuery}". Use "+ Quick Add Deal" to create it.
            </div>
          ) : (
            searchResults.map((deal) => (
              <button
                key={deal.id}
                type="button"
                onClick={() => { toggleDeal(deal.id); setSearchQuery(''); }}
                className="w-full flex items-center gap-2.5 p-2 bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 rounded-lg transition-colors text-left group"
              >
                <div className="p-1 bg-slate-800 group-hover:bg-amber-500/20 rounded transition-colors">
                  <Hash className="w-3 h-3 text-slate-400 group-hover:text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-300 truncate">{deal.dealName || deal.propertyAddress || 'Untitled Deal'}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{deal.dealNumber || deal.id}</p>
                </div>
                <span className="text-[10px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">+ Link</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* ── Currently Linked Deals ── */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Currently Linked ({linkedDeals.length})
        </p>
        {linkedDeals.length === 0 ? (
          <div className="text-xs text-slate-600 italic py-2 bg-slate-950/40 rounded-lg border border-dashed border-slate-800 text-center">
            No deals linked yet. Search above or quick-add a new one.
          </div>
        ) : (
          <div className="space-y-1.5">
            {linkedDeals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-emerald-500/20 rounded-lg group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1 bg-emerald-500/20 rounded"><Briefcase className="w-3 h-3 text-emerald-400" /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-300 truncate">{deal.dealName || deal.propertyAddress || 'Untitled Deal'}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{deal.dealNumber || deal.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDeal(deal.id)}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Unlink Deal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Inline Quick Add Deal Form ── */}
      {showQuickAdd && (
        <div className="p-4 bg-slate-950/60 border border-amber-500/30 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg"><Sparkles className="w-3.5 h-3.5" /></div>
            <div>
              <h5 className="font-extrabold text-amber-400 text-xs">Quick Add Deal</h5>
              <p className="text-[10px] text-slate-500">Create a brand-new deal and link it instantly.</p>
            </div>
          </div>


       {/* 1. Deal Identity */}
       <DealIdentitySection 
         dealNumber={dealNumber}
         createdAt={createdAt}
         dealName={dealName}
         onDealNameChange={setDealName}
       />

          {/* 2. Market Deal Type */}
          <DealTypeSelector dealType={dealType} govListType={govListType} onDealTypeChange={handleDealTypeChange} onGovListTypeChange={setGovListType} />

          {/* 3. Target Pipeline Stage */}
          <PipelineStageSelector
            value={stage}
            onChange={(s) => setStage(s as LeadStage)}
            stages={dealType === 'OFF_MARKET_GOV' ? OFF_MARKET_STAGES : ON_MARKET_STAGES}
            hint={`Defaults to Column 1 (${dealType === 'OFF_MARKET_GOV' ? '1. Gov List Pulled' : 'New On-Market'})`}
          />

          {/* 4. Property Quick Picker */}
       {/* 4. Property Section (Context-Aware) */}
       {forceQuickAddProperty ? (
         <QuickAddPropertyForm
           territories={territories}
           selectedTerritoryId={territories[0]?.id || 'terr-1'}
           currentContact={currentContact}
           onSaveLead={onCreateDeal}
           onCreateProperty={onCreateProperty}
           onContactSuggestion={() => {}}
           onLinkedLeadChange={(id) => setNewDealLeadId(id)}
           onClose={() => {}}
         />
       ) : (
         <PropertyLinkPicker
           leads={availableDeals}
           properties={properties}
           callLogs={callLogs}
           selectedLeadId={newDealLeadId}
           onSelectLead={setNewDealLeadId}
           onUnlink={() => setNewDealLeadId('')}
           territories={territories}
           selectedTerritoryId={territories[0]?.id || 'terr-1'}
           currentContact={currentContact}
           onSaveLead={onCreateDeal}
           onCreateProperty={onCreateProperty}
           onContactSuggestion={() => {}}
         />
       )}

          {createError && (
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 text-xs font-bold">{createError}</div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isCreating}
              onClick={handleCreateDeal}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isCreating ? 'Creating...' : 'Save & Link Deal'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};