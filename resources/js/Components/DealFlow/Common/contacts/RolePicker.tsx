import React from 'react';
import { Crown } from 'lucide-react';
import type { ContactRole } from '@/types/dealflow';

const ALL_ROLES: { value: ContactRole; label: string }[] = [
  { value: 'DIRECT_SELLER', label: 'Direct Seller' },
  { value: 'LISTING_AGENT', label: 'Listing Agent' },
  { value: 'BUYER_AGENT', label: "Buyer's Agent" },
  { value: 'CO_AGENT', label: 'Co-Agent' },
  { value: 'CASH_BUYER', label: 'Cash Buyer' },
  { value: 'TITLE_COMPANY', label: 'Title Company' },
  { value: 'ATTORNEY', label: 'Attorney' },
  { value: 'WHOLESALER', label: 'Wholesaler' },
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'MUNICIPALITY', label: 'Municipality' },
  { value: 'OTHER', label: 'Other' },
];

interface RolePickerProps {
  roles: ContactRole[];
  primaryRole?: ContactRole;
  otherLabel?: string; // ✅ the custom OTHER value
  onChange: (roles: ContactRole[], primaryRole: ContactRole) => void;
  onOtherLabelChange?: (label: string) => void; // ✅ fires as they type it
}

export const RolePicker: React.FC<RolePickerProps> = ({
  roles, primaryRole, otherLabel = '', onChange, onOtherLabelChange,
}) => {
  const toggle = (r: ContactRole) => {
    if (roles.includes(r)) {
      if (roles.length === 1) return; // always keep at least one hat
      const next = roles.filter((x) => x !== r);
      onChange(next, primaryRole === r ? next[0] : (primaryRole as ContactRole));
    } else {
      const next = [...roles, r];
      onChange(next, primaryRole ?? r);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {ALL_ROLES.map(({ value, label }) => {
          const selected = roles.includes(value);
          const isPrimary = primaryRole === value;
          return (
            <div key={value} className={`flex items-center rounded-lg border transition-colors ${selected ? 'border-amber-500/60 bg-amber-500/15' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}>
              <button type="button" onClick={() => toggle(value)} className={`px-2.5 py-1.5 text-[11px] font-bold cursor-pointer ${selected ? 'text-amber-300' : 'text-slate-400'}`}>
                {label}
              </button>
              {selected && roles.length > 1 && (
                <button
                  type="button"
                  title={isPrimary ? 'Primary role' : 'Make primary'}
                  onClick={() => onChange(roles, value)}
                  className={`pr-2 cursor-pointer ${isPrimary ? 'text-amber-400' : 'text-slate-600 hover:text-amber-300'}`}
                >
                  <Crown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ NEW: value input appears ONLY when the OTHER hat is on */}
      {roles.includes('OTHER') && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-amber-300 uppercase shrink-0">Other =</span>
          <input
            type="text"
            value={otherLabel}
            onChange={(e) => onOtherLabelChange?.(e.target.value)}
            placeholder="Type the custom role (e.g. Property Manager, Bird-Dog, Mentor)"
            className="flex-1 bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
      )}

      <p className="text-[10px] text-slate-500">
        Tap a role to toggle it.{roles.length > 1 ? ' Tap the crown to set the PRIMARY hat.' : ''}{roles.includes('OTHER') ? ' Give OTHER a custom value above.' : ''}
      </p>
    </div>
  );
};