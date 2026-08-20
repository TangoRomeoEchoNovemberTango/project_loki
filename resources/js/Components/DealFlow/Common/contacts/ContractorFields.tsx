import React from 'react';
import type { Contact, PricingGrade } from '@/types/dealflow';
import { SectionCard, TextInput, SelectInput, ToggleRow } from './ContactFieldPrimitives';

interface Props { contact: Partial<Contact>; onChange: (u: Partial<Contact>) => void; }

export const ContractorFields: React.FC<Props> = ({ contact, onChange }) => (
  <div className="space-y-4">
    <SectionCard title="Company & Trades" accent="text-lime-400">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextInput label="Company Name" required value={contact.company} onChange={(v) => onChange({ company: v })} placeholder="e.g. Apex Rehab & Roofing" />
        <TextInput label="Trades / Services Offered" value={contact.trades} onChange={(v) => onChange({ trades: v })} placeholder="e.g. Full Rehab, Roofing, HVAC" />
        <TextInput label="Service Area (Counties / ZIPs)" value={contact.serviceArea} onChange={(v) => onChange({ serviceArea: v })} placeholder="e.g. Sangamon County, 62701-62704" className="sm:col-span-2" />
      </div>
    </SectionCard>
    <SectionCard title="Licensing & Compliance" accent="text-lime-400">
      <div className="space-y-2">
        <ToggleRow label="Licensed & Insured" hint="Certificate of insurance on file." checked={contact.licensedInsured} onChange={(v) => onChange({ licensedInsured: v })} />
        {contact.licensedInsured && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput label="License #" value={contact.licenseNumber} onChange={(v) => onChange({ licenseNumber: v })} placeholder="e.g. IL-104-882" mono />
            <TextInput label="License Expiration" type="date" value={contact.licenseExpiration} onChange={(v) => onChange({ licenseExpiration: v })} />
          </div>
        )}
        <ToggleRow label="Pulls City Permits" hint="Willing to pull official building / rehab permits." checked={contact.pullsPermits} onChange={(v) => onChange({ pullsPermits: v })} />
      </div>
    </SectionCard>
    <SectionCard title="Pricing, Turnaround & Payment Terms" accent="text-lime-400">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectInput label="Pricing Grade" value={contact.pricingGrade} onChange={(v) => onChange({ pricingGrade: v as PricingGrade })} options={[
          { value: 'INVESTOR', label: 'Investor / Budget Grade' },
          { value: 'RETAIL', label: 'Retail Homeowner Pricing' },
        ]} accent="text-lime-300" />
        <SelectInput label="Estimate Turnaround Speed" value={contact.estimateTurnaround} onChange={(v) => onChange({ estimateTurnaround: v as '24-48' | '3-5' })} options={[
          { value: '24-48', label: '24–48 Hours' },
          { value: '3-5', label: '3–5 Days' },
        ]} accent="text-lime-300" />
        <TextInput label="Draw & Payment Terms" value={contact.paymentTerms} onChange={(v) => onChange({ paymentTerms: v })} placeholder="e.g. 10% upfront, weekly draws" className="sm:col-span-2" />
      </div>
    </SectionCard>
  </div>
);
