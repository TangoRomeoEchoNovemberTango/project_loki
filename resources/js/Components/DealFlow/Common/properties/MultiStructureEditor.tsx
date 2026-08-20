import React from 'react';
import { Home, Layers, Plus, Trash2 } from 'lucide-react';
import type { PropertyType, OccupancyStatus, Territory } from '@/types/dealflow';
import { StructureForm } from './StructureForm';

export interface StructureEntry {
  id: string;
  label: string;
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
}

export const emptyStructureEntry = (label: string, defaults?: Partial<StructureEntry>): StructureEntry => ({
  id: `struct-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  label,
  street: '', unit: '', city: 'Springfield', state: 'IL', zip: '62704',
  propertyType: 'MOBILE_HOME', beds: 3, baths: 2, sqft: 1000,
  occupancy: 'VACANT',
  ...defaults,
});

interface MultiStructureEditorProps {
  structures: StructureEntry[];
  onStructuresChange: (list: StructureEntry[]) => void;
  /** Kept so existing callers that pass `territories` still compile — no longer rendered. */
  territories?: Territory[];
}

export const MultiStructureEditor: React.FC<MultiStructureEditorProps> = ({
  structures, onStructuresChange,
}) => {
  const update = (id: string, patch: Partial<StructureEntry>) =>
    onStructuresChange(structures.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const remove = (id: string) => onStructuresChange(structures.filter((s) => s.id !== id));

  const add = () =>
    onStructuresChange([...structures, emptyStructureEntry(`Secondary ${structures.length + 1}: Additional Structure on Lot`)]);

  return (
    <div className="space-y-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
      <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
        <Home className="w-4 h-4" /> Individual Structures Breakdown ({structures.length})
      </span>

      {structures.map((st, idx) => (
        <div key={st.id} className="p-3 bg-slate-950 rounded-xl border border-sky-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-sky-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" /> #{idx + 1} — {st.label}
            </span>
            <button type="button" onClick={() => remove(st.id)} className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer" title="Remove Structure">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Lean combined form — no territory picker, no toggle row */}
          <StructureForm
            street={st.street} unit={st.unit} city={st.city} state={st.state} zip={st.zip}
            propertyType={st.propertyType} beds={st.beds} baths={st.baths} sqft={st.sqft}
            occupancy={st.occupancy}
            onStreetChange={(v) => update(st.id, { street: v })}
            onUnitChange={(v) => update(st.id, { unit: v })}
            onCityChange={(v) => update(st.id, { city: v })}
            onStateChange={(v) => update(st.id, { state: v })}
            onZipChange={(v) => update(st.id, { zip: v })}
            onTypeChange={(v) => update(st.id, { propertyType: v })}
            onBedsChange={(v) => update(st.id, { beds: v })}
            onBathsChange={(v) => update(st.id, { baths: v })}
            onSqftChange={(v) => update(st.id, { sqft: v })}
            onOccupancyChange={(v) => update(st.id, { occupancy: v })}
          />
        </div>
      ))}

      <button type="button" onClick={add} className="w-full py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
        <Plus className="w-4 h-4" /> Add Secondary Property (Address + Specs)
      </button>
    </div>
  );
};
