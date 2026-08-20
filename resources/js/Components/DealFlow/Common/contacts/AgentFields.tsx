import React from 'react';
import type { Contact, AgentSpecialty } from '@/types/dealflow';
import {
  SectionCard, Field, TextInput, SelectInput, TextArea, ToggleRow
} from './ContactFieldPrimitives';

interface AgentFieldsProps {
  contact: Partial<Contact>;
  onChange: (updates: Partial<Contact>) => void;
}

export const AgentFields: React.FC<AgentFieldsProps> = ({ contact, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Brokerage & Agency */}
      <SectionCard title="Brokerage & Agency Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Brokerage / Agency Name"
            required
            value={contact.company}
            onChange={(v) => onChange({ company: v })}
            placeholder="e.g. Re/Max Professionals Springfield"
          />
          <TextInput
            label="MLS Association"
            value={contact.mlsAssociation}
            onChange={(v) => onChange({ mlsAssociation: v })}
            placeholder="e.g. BrightMLS, ARMLS"
          />
          <SelectInput
            label="Agent Specialty / Role"
            value={contact.agentSpecialty}
            onChange={(v) => onChange({ agentSpecialty: v as AgentSpecialty })}
            options={[
              { value: 'LISTING', label: 'Listing Agent' },
              { value: 'BUYERS', label: "Buyer's Agent" },
              { value: 'REO_BANK_OWNED', label: 'REO & Bank-Owned Specialist' },
              { value: 'WHOLESALER_CO_BROKER', label: 'Wholesaler-Friendly Co-Broker' },
            ]}
            accent="text-amber-300"
          />
          <TextInput
            label="Target Markets / Counties / ZIPs"
            value={contact.targetMarkets}
            onChange={(v) => onChange({ targetMarkets: v })}
            placeholder="e.g. Springfield, Sangamon County, 62701-62704"
          />
        </div>
      </SectionCard>

      {/* Agency Office Address */}
      <SectionCard title="Agency Office Address">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <TextInput
              label="Street Address"
              value={contact.agencyStreetAddress}
              onChange={(v) => onChange({ agencyStreetAddress: v })}
              placeholder="e.g. 1200 S 6th St"
            />
          </div>
          <TextInput
            label="Suite / Ste #"
            value={contact.agencyUnit}
            onChange={(v) => onChange({ agencyUnit: v })}
            placeholder="e.g. Suite 200"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <TextInput
            label="City"
            value={contact.agencyCity}
            onChange={(v) => onChange({ agencyCity: v })}
            placeholder="Springfield"
          />
          <TextInput
            label="State"
            value={contact.agencyState}
            onChange={(v) => onChange({ agencyState: v })}
            placeholder="IL"
          />
          <TextInput
            label="Zip Code"
            value={contact.agencyZip}
            onChange={(v) => onChange({ agencyZip: v })}
            placeholder="62701"
          />
        </div>
        <TextInput
          label="Agency Website / Profile URL"
          value={contact.agencyWebsite}
          onChange={(v) => onChange({ agencyWebsite: v })}
          placeholder="https://www.remaxspringfield.com/agents/sarah"
          type="url"
        />
      </SectionCard>

      {/* Wholesaling Capabilities */}
      <SectionCard title="Wholesaling & Investor Capabilities">
        <div className="space-y-2">
          <ToggleRow
            label="Investor-Friendly Agent"
            hint="Experience working with wholesale contracts"
            checked={contact.investorFriendly}
            onChange={(v) => onChange({ investorFriendly: v })}
          />
          <ToggleRow
            label="Open to Dual Representation / Double-Ending"
            hint="Willing to represent you as the buyer to capture both sides of the commission"
            checked={contact.openToDualRepresentation}
            onChange={(v) => onChange({ openToDualRepresentation: v })}
          />
          <ToggleRow
            label="Pocket Listings / Off-Market Inventory Access"
            hint="Has access to off-market or pre-MLS properties"
            checked={contact.pocketListingsAccess}
            onChange={(v) => onChange({ pocketListingsAccess: v })}
          />
          <ToggleRow
            label="Accepts Assignments / Double-Close"
            hint="Explicitly agrees to wholesaling contract structures"
            checked={contact.acceptsAssignments}
            onChange={(v) => onChange({ acceptsAssignments: v })}
          />
        </div>
      </SectionCard>

      {/* Commission Structure */}
      <SectionCard title="Commission Expectations & Structure">
        <SelectInput
          label="Commission Structure / Rate"
          value={contact.commissionExpectation}
          onChange={(v) => onChange({ commissionExpectation: v })}
          options={[
            { value: '2.5% Standard Commission', label: '2.5% Standard Commission' },
            { value: '2.0% Investor Discounted Rate', label: '2.0% Investor Discounted Rate' },
            { value: '3.0% Standard Buyer Agent Rate', label: '3.0% Standard Buyer Agent Rate' },
            { value: 'Flat Fee Wholesale Agent', label: 'Flat Fee Wholesale Agent' },
            { value: 'Dual-End Only', label: 'Dual-End Only (Must Represent Buyer)' },
          ]}
          accent="text-amber-300"
        />
        <TextInput
          label="Linked Property Listing ID / MLS #"
          value={contact.mlsListingId}
          onChange={(v) => onChange({ mlsListingId: v })}
          placeholder="e.g. MLS-1092 or BrightMLS-2025-12345"
          mono
        />
      </SectionCard>
    </div>
  );
};
