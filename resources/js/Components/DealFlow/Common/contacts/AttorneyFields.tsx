import React from 'react';
import type { Contact } from '@/types/dealflow';
import { SectionCard, TextInput, NumberInput, SelectInput, ToggleRow } from './ContactFieldPrimitives';

interface Props { contact: Partial<Contact>; onChange: (u: Partial<Contact>) => void; }

export const AttorneyFields: React.FC<Props> = ({ contact, onChange }) => (
  <div className="space-y-4">
    <SectionCard title="Firm & Attorney Details" accent="text-violet-400">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextInput label="Firm Name" required value={contact.company} onChange={(v) => onChange({ company: v })} placeholder="e.g. Sterling & Associates LLC" />
        <TextInput label="Firm Website" type="url" value={contact.agencyWebsite} onChange={(v) => onChange({ agencyWebsite: v })} placeholder="https://..." />
        <SelectInput label="Primary Practice Area" required value={contact.practiceAreas} onChange={(v) => onChange({ practiceAreas: v })} options={[
          { value: 'PROBATE_ESTATE', label: 'Probate & Estate' },
          { value: 'FORECLOSURE_DEFENSE', label: 'Foreclosure Defense' },
          { value: 'QUIET_TITLE', label: 'Quiet Title' },
          { value: 'TAX_SALES', label: 'Tax Sales' },
          { value: 'CLOSINGS', label: 'Closings' },
          { value: 'LLC_SETUP', label: 'Entity / LLC Setup' },
          { value: 'EVICTIONS', label: 'Evictions' },
        ]} accent="text-violet-300" />
        <TextInput label="Jurisdiction / Counties Covered" required value={contact.jurisdiction} onChange={(v) => onChange({ jurisdiction: v })} placeholder="e.g. Sangamon & Morgan County (IL)" />
        <SelectInput label="Closing State Role" value={contact.closingStateRole} onChange={(v) => onChange({ closingStateRole: v as 'CLOSING_ATTORNEY' | 'ADVISORY_ONLY' })} options={[
          { value: 'CLOSING_ATTORNEY', label: 'Closing Attorney (Attorney-Closing State)' },
          { value: 'ADVISORY_ONLY', label: 'Legal Advisory Only' },
        ]} accent="text-violet-300" />
      </div>
    </SectionCard>
    <SectionCard title="Paralegal / Case Manager" accent="text-violet-400">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TextInput label="Name" value={contact.paralegalName} onChange={(v) => onChange({ paralegalName: v })} placeholder="e.g. Dana White" />
        <TextInput label="Direct Phone" value={contact.paralegalPhone} onChange={(v) => onChange({ paralegalPhone: v })} placeholder="(217) 555-0100" mono />
        <TextInput label="Email" type="email" value={contact.paralegalEmail} onChange={(v) => onChange({ paralegalEmail: v })} placeholder="dana@sterlinglaw.com" />
      </div>
    </SectionCard>
    <SectionCard title="Wholesale & Creative Capabilities" accent="text-violet-400">
      <div className="space-y-2">
        <ToggleRow label="Investor-Friendly" hint="Comfortable representing wholesalers & investors." checked={contact.investorFriendly} onChange={(v) => onChange({ investorFriendly: v })} />
        <ToggleRow label="Novation & Creative Contract Drafting" hint="Drafts novations, subject-to & wrap agreements." checked={contact.novationDrafting} onChange={(v) => onChange({ novationDrafting: v })} />
        <ToggleRow label="Eviction / Litigation Handling" hint="Handles evictions & quiet-title litigation." checked={contact.evictionLitigation} onChange={(v) => onChange({ evictionLitigation: v })} />
      </div>
    </SectionCard>
    <SectionCard title="Fee Structure" accent="text-violet-400">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectInput label="Fee Structure" value={contact.feeStructure} onChange={(v) => onChange({ feeStructure: v })} options={[
          { value: 'FLAT_PER_CLOSING', label: 'Flat Fee per Closing' },
          { value: 'HOURLY', label: 'Hourly Rate' },
          { value: 'RETAINER', label: 'Retainer Required' },
        ]} accent="text-violet-300" />
        <NumberInput label="Fee Amount ($)" value={contact.feeAmount} onChange={(v) => onChange({ feeAmount: v })} placeholder="e.g. 1500" />
      </div>
    </SectionCard>
  </div>
);
