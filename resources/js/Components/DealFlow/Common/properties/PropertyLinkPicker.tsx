import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Home, Plus, X, Search, ChevronDown } from 'lucide-react';
import type { Lead, Property, ContactRole, Territory, CallLog } from '@/types/dealflow';
import { PropertyDossierHUD } from './PropertyDossierHUD';
import { QuickAddPropertyForm } from './QuickAddPropertyForm';

interface PropertyLinkPickerProps {
  leads: Lead[];
  properties?: Property[];
  callLogs?: CallLog[];
  selectedLeadId: string;
  onSelectLead: (id: string) => void;
  onUnlink: () => void;
  territories?: Territory[];
  selectedTerritoryId?: string | null;
  currentContact?: { firstName: string; lastName: string; phone: string; role: ContactRole };
  onSaveLead?: (leadData: Partial<Lead>) => Promise<Lead | void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<void>;
  onContactSuggestion?: (s: { firstName: string; lastName: string; phone: string; role: ContactRole }) => void;
  label?: string;
}

export const PropertyLinkPicker: React.FC<PropertyLinkPickerProps> = ({
  leads, properties = [], callLogs = [], selectedLeadId, onSelectLead, onUnlink,
  territories = [], selectedTerritoryId, currentContact, onSaveLead, onCreateProperty,
  onContactSuggestion, label = 'Link to Property / Lead (Searchable)',
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [isQuickAddPropertyOpen, setIsQuickAddPropertyOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsPropertyDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLeads = useMemo(() => {
    if (!propertySearchQuery.trim()) return leads;
    const q = propertySearchQuery.toLowerCase();
    return leads.filter((l) => l.propertyAddress.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.state.toLowerCase().includes(q) || l.zip.includes(q) || (l.contactName && l.contactName.toLowerCase().includes(q)));
  }, [leads, propertySearchQuery]);

  const selectedLeadObj = leads.find((l) => l.id === selectedLeadId);

  const handlePick = (id: string) => {
    onSelectLead(id);
    setIsPropertyDropdownOpen(false);
    setPropertySearchQuery('');
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
          <Home className="w-4 h-4 text-amber-400" /> {label}
        </label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setIsQuickAddPropertyOpen(!isQuickAddPropertyOpen)} className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${isQuickAddPropertyOpen ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'}`}>
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> {isQuickAddPropertyOpen ? 'Close Property Form' : '+ Quick Add Property'}
          </button>
          {selectedLeadId && (
            <button type="button" onClick={onUnlink} className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer font-semibold"><X className="w-3.5 h-3.5" /> Unlink</button>
          )}
        </div>
      </div>

      {selectedLeadObj ? (
        <PropertyDossierHUD
          lead={selectedLeadObj}
          properties={properties}
          callLogs={callLogs}
          onSaveLead={onSaveLead ?? (async () => undefined)}
          onUnlink={onUnlink}
        />
      ) : (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={propertySearchQuery}
              onFocus={() => setIsPropertyDropdownOpen(true)}
              onChange={(e) => { setPropertySearchQuery(e.target.value); setIsPropertyDropdownOpen(true); }}
              placeholder="Search property address, city, zip code, or lead name..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
            />
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
          </div>
          {isPropertyDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-800">
              <div onClick={() => { onUnlink(); setIsPropertyDropdownOpen(false); }} className="p-2.5 hover:bg-slate-800/80 cursor-pointer text-slate-400 hover:text-white font-medium flex items-center justify-between">
                <span>-- No Linked Property / Lead --</span>
                <X className="w-4 h-4 text-slate-500" />
              </div>
              <div onClick={() => { setIsPropertyDropdownOpen(false); setIsQuickAddPropertyOpen(true); }} className="p-3 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border-y border-amber-500/30 cursor-pointer text-amber-300 font-bold flex items-center justify-between transition-colors group">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg group-hover:scale-105 transition-transform font-black"><Plus className="w-4 h-4 stroke-[3]" /></div>
                  <div>
                    <span className="text-xs text-amber-200">✨ Create & Add New Property & Wholesale Lead</span>
                    <p className="text-[10px] text-amber-400/80 font-normal">Add address, specs, valuation MAO & seller details</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full uppercase">Quick Add</span>
              </div>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((l) => (
                  <div key={l.id} onClick={() => handlePick(l.id)} className="p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors">
                    <div>
                      <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                        <span>{l.propertyAddress}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-amber-300 font-semibold rounded border border-slate-700">{l.city}, {l.state}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">List: ${l.valuation?.listPrice?.toLocaleString() || 'N/A'} • Contact: {l.contactName || 'N/A'} ({l.contactPhone || 'No phone'})</p>
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{l.stage.replace(/_/g, ' ')}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-slate-500 text-center italic">No matching properties found</div>
              )}
            </div>
          )}
        </div>
      )}

      {isQuickAddPropertyOpen && (
        <QuickAddPropertyForm
          territories={territories}
          selectedTerritoryId={selectedTerritoryId}
          currentContact={currentContact}
          onSaveLead={onSaveLead}
          onCreateProperty={onCreateProperty}
          onContactSuggestion={onContactSuggestion}
          onLinkedLeadChange={(id) => handlePick(id)}
          onClose={() => setIsQuickAddPropertyOpen(false)}
        />
      )}
    </div>
  );
};
