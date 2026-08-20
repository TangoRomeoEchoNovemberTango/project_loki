import React from 'react';
import type { Contact, DepartmentType, DataAccessMethod, ListCadence } from '@/types/dealflow';
import { SectionCard, TextInput, NumberInput, SelectInput } from './ContactFieldPrimitives';

interface Props { contact: Partial<Contact>; onChange: (u: Partial<Contact>) => void; }

export const MunicipalityFields: React.FC<Props> = ({ contact, onChange }) => (
  <div className="space-y-4">
    <SectionCard title="Office / Department" accent="text-indigo-400">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextInput label="Office / Department Name" required value={contact.company} onChange={(v) => onChange({ company: v })} placeholder="e.g. Sangamon County Clerk" />
        <SelectInput label="Department Type" required value={contact.departmentType} onChange={(v) => onChange({ departmentType: v as DepartmentType })} options={[
          { value: 'COUNTY_CLERK', label: 'County Clerk & Recorder' },
          { value: 'TAX_COLLECTOR', label: 'Tax Collector & Treasurer' },
          { value: 'CODE_ENFORCEMENT', label: 'Code Enforcement Department' },
          { value: 'PROBATE_COURT', label: 'Probate Court' },
          { value: 'SHERIFF', label: "Sheriff's Office (Evictions)" },
        ]} accent="text-indigo-300" />
        <TextInput label="Jurisdiction / County & State" required value={contact.jurisdiction} onChange={(v) => onChange({ jurisdiction: v })} placeholder="e.g. Sangamon County, IL" className="sm:col-span-2" />
      </div>
    </SectionCard>
    <SectionCard title="Records & Lead Lists" accent="text-indigo-400">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextInput label="Records / Lead Lists Handled" value={contact.recordsHandled} onChange={(v) => onChange({ recordsHandled: v })} placeholder="e.g. Probate, Tax Delinquent, Evictions" className="sm:col-span-2" />
        <SelectInput label="Data Access Method" value={contact.dataAccessMethod} onChange={(v) => onChange({ dataAccessMethod: v as DataAccessMethod })} options={[
          { value: 'ONLINE_PORTAL', label: 'Online Public Portal' },
          { value: 'FOIA', label: 'FOIA / Public Records Request' },
          { value: 'IN_PERSON', label: 'Physical In-Person Inspection' },
        ]} accent="text-indigo-300" />
        <SelectInput label="List Update Cadence" value={contact.listUpdateCadence} onChange={(v) => onChange({ listUpdateCadence: v as ListCadence })} options={[
          { value: 'DAILY', label: 'Daily' },
          { value: 'WEEKLY', label: 'Weekly' },
          { value: 'MONTHLY', label: 'Monthly' },
        ]} accent="text-indigo-300" />
        <NumberInput label="Cost per Record / Download ($)" value={contact.costPerRecord} onChange={(v) => onChange({ costPerRecord: v })} placeholder="e.g. 0.10" />
      </div>
    </SectionCard>
    <SectionCard title="Key Contact & Office Info" accent="text-indigo-400">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TextInput label="Key Contact / Clerk Name" value={contact.keyContactName} onChange={(v) => onChange({ keyContactName: v })} placeholder="e.g. Mary Johnson" />
        <TextInput label="Direct Extension" value={contact.keyContactExtension} onChange={(v) => onChange({ keyContactExtension: v })} placeholder="e.g. x204" mono />
        <TextInput label="Direct Email" type="email" value={contact.keyContactEmail} onChange={(v) => onChange({ keyContactEmail: v })} placeholder="clerk@co.sangamon.il.us" />
        <TextInput label="Office Main Phone" value={contact.officePhone} onChange={(v) => onChange({ officePhone: v })} placeholder="(217) 555-0000" mono className="sm:col-span-3" />
      </div>
    </SectionCard>
  </div>
);
