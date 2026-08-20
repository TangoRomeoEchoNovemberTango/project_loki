import React from 'react';
import { List, CalendarDays } from 'lucide-react';

export type FollowUpView = 'list' | 'calendar';

interface FollowUpViewToggleProps {
  view: FollowUpView;
  onChange: (view: FollowUpView) => void;
  listCount?: number;
}

export const FollowUpViewToggle: React.FC<FollowUpViewToggleProps> = ({ view, onChange, listCount }) => (
  <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
    <button
      type="button"
      onClick={() => onChange('list')}
      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${view === 'list' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}
    >
      <List className="w-3.5 h-3.5" /> Queue List{typeof listCount === 'number' ? ` (${listCount})` : ''}
    </button>
    <button
      type="button"
      onClick={() => onChange('calendar')}
      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${view === 'calendar' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}
    >
      <CalendarDays className="w-3.5 h-3.5" /> 30-Day Calendar
    </button>
  </div>
);
