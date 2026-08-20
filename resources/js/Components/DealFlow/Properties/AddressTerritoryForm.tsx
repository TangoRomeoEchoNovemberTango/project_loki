import React from 'react';
import { MapPin } from 'lucide-react';
import type { Territory } from '@/types/dealflow';

interface AddressTerritoryFormProps {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  territoryId: string;
  territories?: Territory[];
  onStreetChange: (val: string) => void;
  onUnitChange: (val: string) => void;
  onCityChange: (val: string) => void;
  onStateChange: (val: string) => void;
  onZipChange: (val: string) => void;
  onTerritoryChange: (val: string) => void;
}

export const AddressTerritoryForm: React.FC<AddressTerritoryFormProps> = ({
  street, unit, city, state, zip, territoryId, territories = [],
  onStreetChange, onUnitChange, onCityChange, onStateChange, onZipChange, onTerritoryChange,
}) => {
  return (
    <div className="space-y-2 pt-1 border-t border-slate-800">
      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5 text-amber-400" /> Physical Address & Territory
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div className="sm:col-span-3">
          <span className="text-[10px] text-slate-400 block mb-0.5">Street Address *</span>
          <input type="text" placeholder="e.g. 742 Evergreen Terrace" value={street} onChange={(e) => onStreetChange(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Apt / Unit #</span>
          <input type="text" placeholder="Apt / Unit #" value={unit} onChange={(e) => onUnitChange(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">City</span>
          <input type="text" value={city} onChange={(e) => onCityChange(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">State</span>
          <input type="text" value={state} onChange={(e) => onStateChange(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Zip Code</span>
          <input type="text" value={zip} onChange={(e) => onZipChange(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Territory</span>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-rose-400 absolute left-2 top-1.5 pointer-events-none" />
            <select value={territoryId} onChange={(e) => onTerritoryChange(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-2 py-1.5 text-xs text-amber-300 focus:border-amber-400 focus:outline-none cursor-pointer">
              <option value="">-- No Territory --</option>
              {territories.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
