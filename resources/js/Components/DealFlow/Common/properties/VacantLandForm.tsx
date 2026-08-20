import React from 'react';
import { MapPin, Trees, Droplets, DollarSign } from 'lucide-react';

export interface VacantLandDetails {
  parcelId?: string;
  legalDescription?: string;
  zoning?: string;
  topography?: string;
  floodZone?: string;
  accessType?: string;
  roadFrontage?: string;
  waterAccess?: string;
  sewerAccess?: string;
  powerAccess?: string;
  percTest?: string;
  annualTaxes?: number | '';
  backTaxes?: number | '';
  liensOwed?: number | '';
  hasHoaPoa?: boolean;
  hoaDues?: number | '';
  mineralRightsConvey?: boolean;
  surveyAvailable?: boolean;
}

interface VacantLandFormProps {
  land: VacantLandDetails;
  onChange: (u: Partial<VacantLandDetails>) => void;
}

const inputCls = 'w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none';
const selectCls = 'w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <span className="text-[10px] text-slate-400 block mb-0.5">{label}</span>
    {children}
  </div>
);

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">{icon}{title}</span>
    {children}
  </div>
);

export const VacantLandForm: React.FC<VacantLandFormProps> = ({ land, onChange }) => (
  <div className="space-y-2 pt-1">
    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
      <Trees className="w-3.5 h-3.5 text-amber-400" /> Vacant Land Deal Details
    </label>

    <Section icon={<MapPin className="w-3.5 h-3.5 text-emerald-400" />} title="Parcel & Legal">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Parcel ID / APN">
          <input type="text" placeholder="e.g. 14-22-301-005" value={land.parcelId || ''} onChange={(e) => onChange({ parcelId: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Flood Zone (FEMA)">
          <select value={land.floodZone || ''} onChange={(e) => onChange({ floodZone: e.target.value })} className={selectCls}>
            <option value="">-- Select --</option>
            <option value="ZONE_X">Zone X (Minimal Risk)</option>
            <option value="ZONE_A">Zone A (100-Yr Flood)</option>
            <option value="ZONE_AE">Zone AE (100-Yr w/ BFE)</option>
            <option value="ZONE_VE">Zone VE (Coastal)</option>
            <option value="UNKNOWN">Unknown / Verify</option>
          </select>
        </Field>
      </div>
      <Field label="Legal Description">
        <textarea rows={2} placeholder="LOT 12, BLOCK 3, PRAIRIE HEIGHTS SUBDIVISION..." value={land.legalDescription || ''} onChange={(e) => onChange({ legalDescription: e.target.value })} className={inputCls} />
      </Field>
      <div className="flex flex-wrap gap-4 text-xs text-slate-300">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!land.surveyAvailable} onChange={(e) => onChange({ surveyAvailable: e.target.checked })} className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400" />
          <span>Survey Available?</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!land.mineralRightsConvey} onChange={(e) => onChange({ mineralRightsConvey: e.target.checked })} className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400" />
          <span>Mineral Rights Convey?</span>
        </label>
      </div>
    </Section>

    <Section icon={<Trees className="w-3.5 h-3.5 text-emerald-400" />} title="Zoning & Site Conditions">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Field label="Zoning / Land Use">
          <select value={land.zoning || ''} onChange={(e) => onChange({ zoning: e.target.value })} className={selectCls}>
            <option value="">-- Select --</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="AGRICULTURAL">Agricultural</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="INDUSTRIAL">Industrial</option>
            <option value="RECREATIONAL">Recreational</option>
            <option value="MIXED_USE">Mixed Use</option>
            <option value="UNKNOWN">Unknown / Verify</option>
          </select>
        </Field>
        <Field label="Topography / Vegetation">
          <select value={land.topography || ''} onChange={(e) => onChange({ topography: e.target.value })} className={selectCls}>
            <option value="">-- Select --</option>
            <option value="FLAT_CLEARED">Flat / Cleared</option>
            <option value="WOODED">Wooded</option>
            <option value="SLOPED">Sloped</option>
            <option value="HILLY">Hilly</option>
            <option value="MIXED">Mixed</option>
          </select>
        </Field>
        <Field label="Perc / Septic Test">
          <select value={land.percTest || ''} onChange={(e) => onChange({ percTest: e.target.value })} className={selectCls}>
            <option value="">-- Select --</option>
            <option value="PASSED">Perc Passed</option>
            <option value="FAILED">Perc Failed</option>
            <option value="NOT_PERFORMED">Not Performed</option>
            <option value="NOT_REQUIRED">Not Required (City Sewer)</option>
          </select>
        </Field>
      </div>
    </Section>

    <Section icon={<Droplets className="w-3.5 h-3.5 text-emerald-400" />} title="Access & Utilities">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Field label="Access Type">
          <select value={land.accessType || ''} onChange={(e) => onChange({ accessType: e.target.value })} className={selectCls}>
            <option value="">-- Select --</option>
            <option value="DEEDED_ACCESS">Deeded Access</option>
            <option value="RECORDED_EASEMENT">Recorded Easement</option>
            <option value="RIGHT_OF_WAY">Right of Way</option>
            <option value="LANDLOCKED">Landlocked ⚠️</option>
          </select>
        </Field>
        <Field label="Road Frontage">
          <select value={land.roadFrontage || ''} onChange={(e) => onChange({ roadFrontage: e.target.value })} className={selectCls}>
            <option value="">-- Select --</option>
            <option value="PAVED">Paved Road</option>
            <option value="GRAVEL">Gravel Road</option>
            <option value="DIRT">Dirt Road</option>
            <option value="NO_FRONTAGE">No Frontage</option>
          </select>
        </Field>
        <Field label="Water">
          <select value={land.waterAccess || ''} onChange={(e) => onChange({ waterAccess: e.target.value })} className={selectCls}>
            <option value="">-- Select --</option>
            <option value="CITY_WATER">City / Rural Water</option>
            <option value="WELL_REQUIRED">Well Required</option>
            <option value="CISTERN_HAUL">Cistern / Haul</option>
            <option value="NONE">None</option>
          </select>
        </Field>
        <Field label="Sewer">
          <select value={land.sewerAccess || ''} onChange={(e) => onChange({ sewerAccess: e.target.value })} className={selectCls}>
            <option value="">-- Select --</option>
            <option value="CITY_SEWER">City Sewer</option>
            <option value="SEPTIC_REQUIRED">Septic Required</option>
            <option value="NONE">None</option>
          </select>
        </Field>
        <Field label="Power / Electric">
          <select value={land.powerAccess || ''} onChange={(e) => onChange({ powerAccess: e.target.value })} className={selectCls}>
            <option value="">-- Select --</option>
            <option value="AT_LOT">At Lot</option>
            <option value="NEARBY_POLE">Nearby Pole</option>
            <option value="SOLAR_OFFGRID">Solar / Off-Grid</option>
            <option value="NONE">None</option>
          </select>
        </Field>
      </div>
    </Section>

    <Section icon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />} title="Taxes & Encumbrances">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Field label="Annual Taxes ($)">
          <input type="number" placeholder="e.g. 350" value={land.annualTaxes ?? ''} onChange={(e) => onChange({ annualTaxes: e.target.value === '' ? '' : Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="Back Taxes Owed ($)">
          <input type="number" placeholder="e.g. 0" value={land.backTaxes ?? ''} onChange={(e) => onChange({ backTaxes: e.target.value === '' ? '' : Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="Liens Owed ($)">
          <input type="number" placeholder="e.g. 0" value={land.liensOwed ?? ''} onChange={(e) => onChange({ liensOwed: e.target.value === '' ? '' : Number(e.target.value) })} className={inputCls} />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!land.hasHoaPoa} onChange={(e) => onChange({ hasHoaPoa: e.target.checked })} className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400" />
          <span>HOA / POA Restrictions?</span>
        </label>
        {land.hasHoaPoa && (
          <Field label="Annual HOA/POA Dues ($)">
            <input type="number" placeholder="e.g. 250" value={land.hoaDues ?? ''} onChange={(e) => onChange({ hoaDues: e.target.value === '' ? '' : Number(e.target.value) })} className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 focus:border-amber-400 focus:outline-none" />
          </Field>
        )}
      </div>
    </Section>
  </div>
);
