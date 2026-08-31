import React from 'react';
import type { Contact } from '@/types/dealflow';
import {
  SectionCard, TextInput, NumberInput, SelectInput, ToggleRow
} from './ContactFieldPrimitives';
import { OfficeAddressSection } from './OfficeAddressSection';

interface TitleFieldsProps {
  contact: Partial<Contact>;
  onChange: (updates: Partial<Contact>) => void;
}

export const TitleFields: React.FC<TitleFieldsProps> = ({ contact, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Company & Escrow Officer */}
      <SectionCard title="Title Company & Primary Officer" accent="text-sky-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Company Name"
            required
            value={contact.company}
            onChange={(v) => onChange({ company: v })}
            placeholder="e.g. Capital Title & Escrow Co."
          />
          <NumberInput
            label="Office Phone"
            required
            value={contact.officePhone ? Number(contact.officePhone.replace(/\D/g, '')) : ''}
            onChange={(v) => onChange({ officePhone: v === '' ? '' : String(v) })}
            placeholder="e.g. 2175559900"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 mt-3">
          <TextInput
            label="Officer First Name"
            required
            value={contact.officerFirstName}
            onChange={(v) => onChange({ officerFirstName: v })}
            placeholder="e.g. Jennifer"
          />
          <TextInput
            label="Officer Last Name"
            required
            value={contact.officerLastName}
            onChange={(v) => onChange({ officerLastName: v })}
            placeholder="e.g. Hayes"
          />
          <TextInput
            label="Direct Extension"
            value={contact.officerExtension}
            onChange={(v) => onChange({ officerExtension: v })}
            placeholder="e.g. x104"
            mono
          />
        </div>
      </SectionCard>

      {/* ── Branch Office Address (with the slider) ── */}
      <OfficeAddressSection
        contact={contact}
        onChange={onChange}
        title="Branch Office Address"
        accent="text-sky-400"
      >
        {/* Role-specific extra passed as children */}
        <TextInput
          label="Counties & States Served"
          value={contact.countiesServed}
          onChange={(v) => onChange({ countiesServed: v })}
          placeholder="e.g. Sangamon, Morgan, Menard (IL)"
        />
      </OfficeAddressSection>

      {/* Escrow Assistant */}
      <SectionCard title="Escrow Assistant / Paralegal" accent="text-sky-400">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInput
            label="Assistant Name"
            value={contact.assistantName}
            onChange={(v) => onChange({ assistantName: v })}
            placeholder="e.g. Sarah Jenkins"
          />
          <TextInput
            label="Assistant Phone"
            value={contact.assistantPhone}
            onChange={(v) => onChange({ assistantPhone: v })}
            placeholder="e.g. (217) 555-9901"
            mono
          />
          <TextInput
            label="Assistant Email"
            type="email"
            value={contact.assistantEmail}
            onChange={(v) => onChange({ assistantEmail: v })}
            placeholder="sarah@capitaltitle.com"
          />
        </div>
      </SectionCard>

      {/* Wholesale Capabilities */}
      <SectionCard title="Wholesale & Creative Capabilities" accent="text-sky-400">
        <div className="space-y-2">
          <ToggleRow
            label="Investor-Friendly"
            hint="Understands wholesale assignments and investor timelines."
            checked={contact.investorFriendly}
            onChange={(v) => onChange({ investorFriendly: v })}
          />
          <ToggleRow
            label="Assignment-Fee Friendly"
            hint="Handles assignment agreements without fee caps or seller friction."
            checked={contact.assignmentFeeFriendly}
            onChange={(v) => onChange({ assignmentFeeFriendly: v })}
          />
          <ToggleRow
            label="Double-Close / Pass-Through Supported"
            hint="Allows back-to-back closing transactions on the same day."
            checked={contact.doubleClosingSupported}
            onChange={(v) => onChange({ doubleClosingSupported: v })}
          />
          <ToggleRow
            label="Creative Finance Friendly"
            hint="Experienced with Subject-To, Novations, and Wrap Mortgages."
            checked={contact.creativeFinanceFriendly}
            onChange={(v) => onChange({ creativeFinanceFriendly: v })}
          />
        </div>
      </SectionCard>

      {/* EMD & Rating */}
      <SectionCard title="EMD Requirements & Rating" accent="text-sky-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberInput
            label="Preferred EMD ($)"
            value={contact.preferredEMDAmount}
            onChange={(v) => onChange({ preferredEMDAmount: v })}
            placeholder="e.g. 1000"
          />
          <TextInput
            label="Accepted EMD Deposit Methods"
            value={contact.emdDepositMethods}
            onChange={(v) => onChange({ emdDepositMethods: v })}
            placeholder="e.g. Wire, Mobile Deposit, Check"
          />
        </div>
        <div className="pt-2">
          <SelectInput
            label="Company Rating (Internal Team)"
            value={contact.rating ? String(contact.rating) : ''}
            onChange={(v) => onChange({ rating: v === '' ? undefined : Number(v) })}
            options={[
              { value: '5', label: '⭐⭐⭐⭐⭐ Excellent (Preferred Partner)' },
              { value: '4', label: '⭐⭐⭐⭐ Good' },
              { value: '3', label: '⭐⭐⭐ Average' },
              { value: '2', label: '⭐⭐ Poor Communication' },
              { value: '1', label: '⭐ Do Not Use' },
            ]}
            accent="text-sky-300"
          />
        </div>
      </SectionCard>
    </div>
  );
};