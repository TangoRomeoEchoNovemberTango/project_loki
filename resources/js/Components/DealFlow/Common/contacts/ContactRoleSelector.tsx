import React from 'react';
import type { ContactRole } from '@/types/dealflow';

const ROLE_OPTIONS: { value: ContactRole; label: string }[] = [
  { value: 'DIRECT_SELLER', label: '🏠 Direct Seller / Homeowner (Off-Market)' },
  { value: 'LISTING_AGENT', label: '🏢 Listing Agent (MLS On-Market)' },
  { value: 'BUYER_AGENT', label: "🏢 Buyer's Agent (Investor Friendly)" },
  { value: 'CO_AGENT', label: '🏢 Co-Listing / Dual Agent' },
  { value: 'CASH_BUYER', label: '💰 Cash Buyer / Investor / Builder' },
  { value: 'TITLE_COMPANY', label: '🏦 Title & Escrow' },
  { value: 'ATTORNEY', label: '⚖️ Real Estate Attorney' },
  { value: 'WHOLESALER', label: '🤝 Co-Wholesaler / JV Partner' },
  { value: 'CONTRACTOR', label: '🔨 Contractor / Inspector' },
  { value: 'MUNICIPALITY', label: '🏛️ County & Municipalities' },
  { value: 'OTHER', label: '👤 Other Professional' },
];

export const ContactRoleSelector: React.FC<{ value: ContactRole; onChange: (r: ContactRole) => void }> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as ContactRole)}
    className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2.5 text-xs font-extrabold text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
  >
    {ROLE_OPTIONS.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);
