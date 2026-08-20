import React from 'react';
import type { Contact, JvRole, PartnerStatus } from '@/types/dealflow';
import { SectionCard, TextInput, NumberInput, SelectInput, ToggleRow } from './ContactFieldPrimitives';

interface Props { contact: Partial<Contact>; onChange: (u: Partial<Contact>) => void; }

export const WholesalerFields: React.FC<Props> = ({ contact, onChange }) => (
  <div className="space-y-4">
    <SectionCard title="JV Partner Profile" accent="text-orange-400">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextInput label="Company Name" value={contact.company} onChange={(v) => onChange({ company: v })} placeholder="e.g. Apex Deal Flow LLC" />
        <SelectInput label="JV Partner Role / Primary Strength" value={contact.jvRole} onChange={(v) => onChange({ jvRole: v as JvRole })} options={[
          { value: 'ACQUISITIONS', label: 'Acquisitions Partner (Has Contract / Deal)' },
          { value: 'DISPOSITIONS', label: 'Dispositions Partner (Has Cash Buyers)' },
          { value: 'JOINT_MARKETING', label: 'Joint Marketing Partner (Co-Funds Lead Gen)' },
        ]} accent="text-orange-300" />
        <TextInput label="Active Operating Markets" value={contact.targetMarkets} onChange={(v) => onChange({ targetMarkets: v })} placeholder="e.g. Springfield, Chatham, 62702" />
        <NumberInput label="Buyer Network Size / Reach" value={contact.buyerNetworkSize} onChange={(v) => onChange({ buyerNetworkSize: v })} placeholder="e.g. 250" />
      </div>
    </SectionCard>
    <SectionCard title="Split Agreement & Partner Status" accent="text-orange-400">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectInput label="Standard JV Split" value={contact.standardJvSplit} onChange={(v) => onChange({ standardJvSplit: v })} options={[
          { value: '50/50', label: '50/50 Split' },
          { value: '60/40', label: '60/40 Split' },
          { value: 'CUSTOM', label: 'Custom Flat Fee' },
        ]} accent="text-orange-300" />
        <SelectInput label="Partner Status / Rating" value={contact.partnerStatus} onChange={(v) => onChange({ partnerStatus: v as PartnerStatus })} options={[
          { value: 'ACTIVE', label: 'Active' },
          { value: 'VETTED', label: 'Vetted' },
          { value: 'ON_HOLD', label: 'On Hold' },
          { value: 'BLACKLISTED', label: 'Blacklisted' },
        ]} accent="text-orange-300" />
      </div>
      <div className="pt-2">
        <ToggleRow label="JV Agreement Signed" hint="Standard Joint Venture agreement on file." checked={contact.jvAgreementSigned} onChange={(v) => onChange({ jvAgreementSigned: v })} />
      </div>
    </SectionCard>
  </div>
);
