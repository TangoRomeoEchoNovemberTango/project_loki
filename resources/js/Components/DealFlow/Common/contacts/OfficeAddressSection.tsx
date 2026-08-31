import React, { useEffect } from 'react';
import type { Contact } from '@/types/dealflow';
import { SectionCard, TextInput, ToggleRow } from './ContactFieldPrimitives';

interface OfficeAddressSectionProps {
  contact: Partial<Contact>;
  onChange: (updates: Partial<Contact>) => void;
  title?: string;    // "Agency Office Address" vs "Branch Office Address"
  accent?: string;   // "text-sky-400" for Title Companies
  children?: React.ReactNode;
}

export const OfficeAddressSection: React.FC<OfficeAddressSectionProps> = ({
  contact, onChange, title = 'Office / Agency Address', accent, children,
}) => {
  const sameAsMailing = !!contact.agencySameAsMailing;

  // Live Mirror: while ON, mailing edits overwrite the office address
  useEffect(() => {
    if (!sameAsMailing) return;
    onChange({
      agencyStreetAddress: contact.streetAddress || '',
      agencyUnit: contact.unit,
      agencyCity: contact.city,
      agencyState: contact.state,
      agencyZip: contact.zip,
    });
  }, [
    sameAsMailing,
    contact.streetAddress, contact.unit, contact.city, contact.state, contact.zip,
  ]);

  return (
    <SectionCard title={title} accent={accent}>
      <ToggleRow
        label="Same as Mailing / Primary Address"
        description="Copies the mailing address from Section 2 so you don't type it twice."
        checked={sameAsMailing}
        onChange={(v) => onChange({ agencySameAsMailing: v })}
      />

      <fieldset
        disabled={sameAsMailing}
        className={`space-y-3 transition-opacity ${sameAsMailing ? 'opacity-50' : ''}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <TextInput label="Street Address" value={contact.agencyStreetAddress} onChange={(v) => onChange({ agencyStreetAddress: v })} placeholder="e.g. 1200 S 6th St" />
          </div>
          <TextInput label="Suite / Ste #" value={contact.agencyUnit} onChange={(v) => onChange({ agencyUnit: v })} placeholder="e.g. Suite 200" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <TextInput label="City" value={contact.agencyCity} onChange={(v) => onChange({ agencyCity: v })} placeholder="Springfield" />
          <TextInput label="State" value={contact.agencyState} onChange={(v) => onChange({ agencyState: v })} placeholder="IL" />
          <TextInput label="Zip" value={contact.agencyZip} onChange={(v) => onChange({ agencyZip: v })} placeholder="62701" mono />
        </div>
      </fieldset>

      {children}
    </SectionCard>
  );
};