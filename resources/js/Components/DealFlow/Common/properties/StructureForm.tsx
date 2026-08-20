import React from 'react';
import { Home, MapPin } from 'lucide-react';
import type { PropertyType, OccupancyStatus } from '@/types/dealflow';

interface StructureFormProps {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  propertyType: PropertyType;
  beds: number | '';
  baths: number | '';
  sqft: number | '';
  occupancy: OccupancyStatus;
  onStreetChange: (val: string) => void;
  onUnitChange: (val: string) => void;
  onCityChange: (val: string) => void;
  onStateChange: (val: string) => void;
  onZipChange: (val: string) => void;
  onTypeChange: (val: PropertyType) => void;
  onBedsChange: (val: number | '') => void;
  onBathsChange: (val: number | '') => void;
  onSqftChange: (val: number | '') => void;
  onOccupancyChange: (val: OccupancyStatus) => void;
}

/** Lean address + specs form for secondary structure cards.
 *  Same look as AddressTerritoryForm + PropertySpecsForm, minus the
 *  territory picker and the multi/vacant-land/acreage toggle row. */
export const StructureForm: React.FC<StructureFormProps> = ({
  street, unit, city, state, zip,
  propertyType, beds, baths, sqft, occupancy,
  onStreetChange, onUnitChange, onCityChange, onStateChange, onZipChange,
  onTypeChange, onBedsChange, onBathsChange, onSqftChange, onOccupancyChange,
}) => {
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-amber-400" /> Physical Address
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <input type="text" required placeholder="Street Address * (e.g. 742 Evergreen Terrace)" value={street}
              onChange={(e) => onStreetChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none" />
          </div>
          <div>
            <input type="text" placeholder="Apt / Unit #" value={unit}
              onChange={(e) => onUnitChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input type="text" placeholder="City" value={city} onChange={(e) => onCityChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
          <input type="text" placeholder="State" value={state} onChange={(e) => onStateChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
          <input type="text" placeholder="Zip Code *" value={zip} onChange={(e) => onZipChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-800">
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
          <Home className="w-3.5 h-3.5 text-amber-400" /> Property Specs & Occupancy
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Property Type</span>
            <select value={propertyType} onChange={(e) => onTypeChange(e.target.value as PropertyType)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none">
              <option value="SINGLE_FAMILY">Single Family</option>
              <option value="MULTI_FAMILY">Multi-Family</option>
              <option value="MOBILE_HOME">Mobile Home</option>
              <option value="LAND">Vacant Land</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Beds</span>
            <input type="number" value={beds} onChange={(e) => onBedsChange(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Baths</span>
            <input type="number" step="0.5" value={baths} onChange={(e) => onBathsChange(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">SqFt</span>
            <input type="number" value={sqft} onChange={(e) => onSqftChange(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Occupancy</span>
            <select value={occupancy} onChange={(e) => onOccupancyChange(e.target.value as OccupancyStatus)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none">
              <option value="VACANT">Vacant</option>
              <option value="OWNER_OCCUPIED">Owner Occupied</option>
              <option value="TENANT_OCCUPIED">Tenant Occupied</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
