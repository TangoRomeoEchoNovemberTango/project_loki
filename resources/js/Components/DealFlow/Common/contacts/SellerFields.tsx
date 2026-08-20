import React from 'react';
import type {
  Contact, DecisionMakerStatus, SellingTimeline, OccupancyStatus
} from '@/types/dealflow';
import {
  SectionCard, Field, TextInput, NumberInput, SelectInput, TextArea, ToggleRow
} from './ContactFieldPrimitives';

interface SellerFieldsProps {
  contact: Partial<Contact>;
  onChange: (updates: Partial<Contact>) => void;
}

export const SellerFields: React.FC<SellerFieldsProps> = ({ contact, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Decision Maker Status */}
      <SectionCard title="Decision Maker Status" accent="text-emerald-400">
        <SelectInput
          label="Ownership Structure"
          required
          value={contact.decisionMakerStatus}
          onChange={(v) => onChange({ decisionMakerStatus: v as DecisionMakerStatus })}
          options={[
            { value: 'SINGLE_OWNER', label: 'Single Owner' },
            { value: 'MARRIED_COUPLE', label: 'Married Couple' },
            { value: 'MULTIPLE_HEIRS', label: 'Multiple Heirs / Estate' },
            { value: 'POA', label: 'Power of Attorney (POA)' },
            { value: 'CORPORATE_ENTITY', label: 'Corporate Entity / LLC / Trust' },
          ]}
          className="sm:col-span-2"
          accent="text-emerald-300"
        />
      </SectionCard>

      {/* Distress / Motivation */}
      <SectionCard title="Distress & Motivation" accent="text-emerald-400">
        <SelectInput
          label="Distress / Motivation Category"
          required
          value={contact.motivationReason}
          onChange={(v) => onChange({ motivationReason: v })}
          options={[
            { value: 'PROBATE', label: 'Probate / Inherited Property' },
            { value: 'TAX_DELINQUENT', label: 'Tax Delinquent / Tax Lien' },
            { value: 'CODE_VIOLATION', label: 'Code Violation / City Citation' },
            { value: 'PRE_FORECLOSURE', label: 'Pre-Foreclosure / Lis Pendens' },
            { value: 'EVICTION', label: 'Eviction / Tired Landlord' },
            { value: 'VACANT', label: 'Vacant Home / Deferred Maintenance' },
            { value: 'RELOCATING', label: 'Relocating / Need Fast Cash' },
            { value: 'STANDARD', label: 'Standard Off-Market Homeowner' },
          ]}
          accent="text-emerald-300"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberInput
            label="Estimated Mortgage Balance ($)"
            value={contact.estimatedMortgageBalance}
            onChange={(v) => onChange({ estimatedMortgageBalance: v })}
            placeholder="e.g. 85000"
          />
          <NumberInput
            label="Back Taxes Owed ($)"
            value={contact.backTaxesOwed}
            onChange={(v) => onChange({ backTaxesOwed: v })}
            placeholder="e.g. 5000"
          />
          <NumberInput
            label="HOA / Mechanics / City Liens ($)"
            value={contact.otherLiens}
            onChange={(v) => onChange({ otherLiens: v })}
            placeholder="e.g. 2500"
          />
          <NumberInput
            label="Target Asking Price Goal ($)"
            required
            value={contact.askingPriceGoal}
            onChange={(v) => onChange({ askingPriceGoal: v })}
            placeholder="e.g. 125000"
          />
        </div>
      </SectionCard>

      {/* Timeline & Occupancy */}
      <SectionCard title="Timeline & Property Status" accent="text-emerald-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Selling Timeline"
            value={contact.sellingTimeline}
            onChange={(v) => onChange({ sellingTimeline: v as SellingTimeline })}
            options={[
              { value: '0-14', label: '0–14 Days (ASAP)' },
              { value: '14-30', label: '14–30 Days' },
              { value: '30-60', label: '30–60 Days' },
              { value: '60+', label: '60+ Days' },
            ]}
            accent="text-emerald-300"
          />
          <SelectInput
            label="Occupancy Status"
            value={contact.occupancyStatus}
            onChange={(v) => onChange({ occupancyStatus: v as OccupancyStatus })}
            options={[
              { value: 'VACANT', label: 'Vacant' },
              { value: 'OWNER_OCCUPIED', label: 'Owner-Occupied' },
              { value: 'TENANT_OCCUPIED', label: 'Tenant-Occupied' },
            ]}
            accent="text-emerald-300"
          />
        </div>
        {contact.occupancyStatus === 'TENANT_OCCUPIED' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <TextInput
              label="Lease End Date"
              value={contact.leaseEndDate}
              onChange={(v) => onChange({ leaseEndDate: v })}
              placeholder="e.g. 2026-12-31"
              type="date"
            />
            <NumberInput
              label="Current Monthly Rent ($)"
              value={contact.currentRent}
              onChange={(v) => onChange({ currentRent: v })}
              placeholder="e.g. 1200"
            />
          </div>
        )}
      </SectionCard>

      {/* Property Access & Notes */}
      <SectionCard title="Property Access & Additional Info" accent="text-emerald-400">
        <TextArea
          label="Property Access / Lockbox Info"
          value={contact.propertyAccessInfo}
          onChange={(v) => onChange({ propertyAccessInfo: v })}
          placeholder="Access instructions, lockbox code, gate code, alarm code..."
          rows={2}
        />
      </SectionCard>
    </div>
  );
};
