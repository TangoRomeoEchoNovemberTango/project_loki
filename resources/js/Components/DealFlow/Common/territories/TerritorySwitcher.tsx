import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import type { Territory } from '@/types/dealflow';

interface TerritorySwitcherProps {
  territories: Territory[];
  selectedTerritoryId?: string | null;
  onSelect: (id: string | null) => void;
}

export const TerritorySwitcher: React.FC<TerritorySwitcherProps> = ({
  territories,
  selectedTerritoryId = null,
  onSelect,
}) => {
  // Nothing to switch between yet — stay hidden until the first territory exists
  if (territories.length === 0) return null;

  const active = territories.find((t) => t.id === selectedTerritoryId) || null;

  return (
    <div
      className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-xl text-xs"
      title={active ? `Niched to ${active.name} (${active.state})` : 'Viewing all territories (global view)'}
    >
      {active ? (
        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      ) : (
        <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      )}
      <select
        value={selectedTerritoryId || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer max-w-[150px] truncate"
      >
        <option value="" className="bg-slate-900 text-slate-300">
          All Territories ({territories.length})
        </option>
        {territories.map((t) => (
          <option key={t.id} value={t.id} className="bg-slate-900 text-white">
            {t.name} ({t.state})
          </option>
        ))}
      </select>
    </div>
  );
};
