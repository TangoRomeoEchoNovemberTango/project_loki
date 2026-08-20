import React from 'react';
import { Home } from 'lucide-react';
import type { PropertyType, OccupancyStatus } from '@/types/dealflow';

interface PropertySpecsFormProps {
  propertyType: PropertyType;
  beds: number | '';
  baths: number | '';
  sqft: number | '';
  occupancy: OccupancyStatus;
  isLand: boolean;
  acreage: number | '';
  hasMultiStructures: boolean;
  onTypeChange: (val: PropertyType) => void;
  onBedsChange: (val: number | '') => void;
  onBathsChange: (val: number | '') => void;
  onSqftChange: (val: number | '') => void;
  onOccupancyChange: (val: OccupancyStatus) => void;
  onIsLandChange: (val: boolean) => void;
  onAcreageChange: (val: number | '') => void;
  onMultiStructuresChange: (val: boolean) => void;
  acreageLabel?: string;
  hideAcreage?: boolean;
}

export const PropertySpecsForm: React.FC<PropertySpecsFormProps> = ({
  propertyType, beds, baths, sqft, occupancy, isLand, acreage, hasMultiStructures,
  onTypeChange, onBedsChange, onBathsChange, onSqftChange, onOccupancyChange,
  onIsLandChange, onAcreageChange, onMultiStructuresChange,
  acreageLabel = 'Lot Acreage (e.g. 2.5)', hideAcreage = false,
}) => {
  return (
    <div className="space-y-2 pt-1 border-t border-slate-800">
      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
        <Home className="w-3.5 h-3.5 text-amber-400" /> Property Specs & Occupancy
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Property Type</span>
          <select value={propertyType} onChange={(e) => onTypeChange(e.target.value as PropertyType)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none">
            <option value="SINGLE_FAMILY">Single Family</option>
            <option value="MULTI_FAMILY">Multi-Family</option>
            <option value="MOBILE_HOME">Mobile Home</option>
            <option value="LAND">Vacant Land</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Beds</span>
          <input type="number" value={beds} onChange={(e) => onBedsChange(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Baths</span>
          <input type="number" step="0.5" value={baths} onChange={(e) => onBathsChange(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">SqFt</span>
          <input type="number" value={sqft} onChange={(e) => onSqftChange(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Occupancy</span>
          <select value={occupancy} onChange={(e) => onOccupancyChange(e.target.value as OccupancyStatus)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none">
            <option value="VACANT">Vacant</option>
            <option value="OWNER_OCCUPIED">Owner Occupied</option>
            <option value="TENANT_OCCUPIED">Tenant Occupied</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input type="checkbox" checked={hasMultiStructures} onChange={(e) => onMultiStructuresChange(e.target.checked)} className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400" />
          <span>Multiple Structures?</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input type="checkbox" checked={isLand} onChange={(e) => onIsLandChange(e.target.checked)} className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400" />
          <span>Vacant Land / Acreage?</span>
        </label>
        {/* Acreage is ALWAYS captured, regardless of deal type / land toggle */}
        {!hideAcreage && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">{acreageLabel}</span>
            <input type="number" step="0.01" placeholder="e.g. 2.5" value={acreage} onChange={(e) => onAcreageChange(e.target.value === '' ? '' : Number(e.target.value))} className="w-32 bg-slate-950 border border-amber-500/40 rounded-lg px-2 py-1 text-xs text-amber-300 focus:border-amber-400 focus:outline-none" />
          </div>
        )}
      </div>
    </div>
  );
};
