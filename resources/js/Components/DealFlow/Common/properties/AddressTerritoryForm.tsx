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
  territories: Territory[];
  onStreetChange: (val: string) => void;
  onUnitChange: (val: string) => void;
  onCityChange: (val: string) => void;
  onStateChange: (val: string) => void;
  onZipChange: (val: string) => void;
  onTerritoryChange: (val: string) => void;
}

export const AddressTerritoryForm: React.FC<AddressTerritoryFormProps> = ({
  street, unit, city, state, zip, territoryId, territories,
  onStreetChange, onUnitChange, onCityChange, onStateChange, onZipChange, onTerritoryChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5 text-amber-400" /> Physical Address & Territory
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2">
          <input
            type="text"
            required
            placeholder="Street Address * (e.g. 742 Evergreen Terrace)"
            value={street}
            onChange={(e) => onStreetChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Apt / Unit #"
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Zip Code *"
          value={zip}
          onChange={(e) => onZipChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
        />
        {territories.length > 0 && (
          <select
            value={territoryId}
            onChange={(e) => onTerritoryChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-300 font-semibold focus:border-amber-400 focus:outline-none col-span-3 sm:col-span-1"
          >
            <option value="">(None)</option>
            {territories.map((t) => (
              <option key={t.id} value={t.id}>📍 {t.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
