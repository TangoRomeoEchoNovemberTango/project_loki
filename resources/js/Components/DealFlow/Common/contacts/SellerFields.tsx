import React from 'react';
import { Plus, Trash2, ShieldCheck, Users, Building2, FileSignature } from 'lucide-react';
import type {
  Contact, DecisionMakerStatus, CoDecisionMaker
} from '@/types/dealflow';
import {
  SectionCard, TextInput, SelectInput, TextArea
} from './ContactFieldPrimitives';

interface SellerFieldsProps {
  contact: Partial<Contact>;
  onChange: (updates: Partial<Contact>) => void;
}

export const SellerFields: React.FC<SellerFieldsProps> = ({ contact, onChange }) => {
  // Helper to manage the co-decision makers array
  const addCoDecisionMaker = () => {
    const current = contact.coDecisionMakers || [];
    // Updated to initialize firstName and lastName
    onChange({ coDecisionMakers: [...current, { firstName: '', lastName: '', role: '', phone: '', email: '' }] });
  };

  const updateCoDecisionMaker = (index: number, field: keyof CoDecisionMaker, value: string) => {
    const current = [...(contact.coDecisionMakers || [])];
    current[index] = { ...current[index], [field]: value };
    onChange({ coDecisionMakers: current });
  };

  const removeCoDecisionMaker = (index: number) => {
    const current = [...(contact.coDecisionMakers || [])];
    onChange({ coDecisionMakers: current.filter((_, i) => i !== index) });
  };

  // Renders the specific fields based on Ownership Structure
  const renderDynamicSignatoryFields = () => {
    const status = contact.decisionMakerStatus;
    const makers = contact.coDecisionMakers || [];

    if (status === 'SINGLE_OWNER') {
      return (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <p className="text-xs text-emerald-300 font-medium">
            Confirmed: Single owner has full signatory authority. No additional signers required.
          </p>
        </div>
      );
    }

    if (status === 'MARRIED_COUPLE') {
      return (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3 h-3" /> Spouse / Co-Owner Required
          </p>
          {makers.length === 0 && addCoDecisionMaker()}
          {makers.map((maker, idx) => (
            <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput label="Spouse First Name" value={maker.firstName || ''} onChange={(v) => updateCoDecisionMaker(idx, 'firstName', v)} placeholder="e.g. Jane" />
                <TextInput label="Spouse Last Name" value={maker.lastName || ''} onChange={(v) => updateCoDecisionMaker(idx, 'lastName', v)} placeholder="e.g. Doe" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput label="Role / Relationship" value={maker.role || ''} onChange={(v) => updateCoDecisionMaker(idx, 'role', v)} placeholder="Spouse" />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <TextInput label="Phone" value={maker.phone || ''} onChange={(v) => updateCoDecisionMaker(idx, 'phone', v)} placeholder="(555) 123-4567" />
                  </div>
                  <button type="button" onClick={() => removeCoDecisionMaker(idx)} className="mt-5 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <TextInput label="Email" value={maker.email || ''} onChange={(v) => updateCoDecisionMaker(idx, 'email', v)} placeholder="email@example.com" />
            </div>
          ))}
        </div>
      );
    }

    if (status === 'POA') {
      return (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileSignature className="w-3 h-3" /> Power of Attorney Holder Details
          </p>
          {makers.length === 0 && addCoDecisionMaker()}
          {makers.map((maker, idx) => (
            <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput label="POA Holder First Name" value={maker.firstName || ''} onChange={(v) => updateCoDecisionMaker(idx, 'firstName', v)} placeholder="e.g. John" />
                <TextInput label="POA Holder Last Name" value={maker.lastName || ''} onChange={(v) => updateCoDecisionMaker(idx, 'lastName', v)} placeholder="e.g. Smith" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput label="Relationship to Owner" value={maker.role || ''} onChange={(v) => updateCoDecisionMaker(idx, 'role', v)} placeholder="e.g. Son, Attorney" />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <TextInput label="Phone" value={maker.phone || ''} onChange={(v) => updateCoDecisionMaker(idx, 'phone', v)} placeholder="(555) 123-4567" />
                  </div>
                  <button type="button" onClick={() => removeCoDecisionMaker(idx)} className="mt-5 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <TextInput label="Email" value={maker.email || ''} onChange={(v) => updateCoDecisionMaker(idx, 'email', v)} placeholder="email@example.com" />
            </div>
          ))}
        </div>
      );
    }

    if (status === 'MULTIPLE_HEIRS') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3 h-3" /> List of Heirs / Estate Signers
            </p>
            <button type="button" onClick={addCoDecisionMaker} className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-md transition-colors">
              <Plus className="w-3 h-3" /> Add Heir
            </button>
          </div>
          {makers.length === 0 && (
            <p className="text-xs text-slate-500 italic">No heirs added yet. Click "Add Heir" to begin.</p>
          )}
          {makers.map((maker, idx) => (
            <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-3 relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput label={`Heir ${idx + 1} First Name`} value={maker.firstName || ''} onChange={(v) => updateCoDecisionMaker(idx, 'firstName', v)} placeholder="First Name" />
                <TextInput label={`Heir ${idx + 1} Last Name`} value={maker.lastName || ''} onChange={(v) => updateCoDecisionMaker(idx, 'lastName', v)} placeholder="Last Name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectInput 
                  label="Role / Title" 
                  value={maker.role || ''} 
                  onChange={(v) => updateCoDecisionMaker(idx, 'role', v)}
                  options={[
                    { value: 'HEIR', label: 'Heir / Beneficiary' },
                    { value: 'EXECUTOR', label: 'Executor / Administrator' },
                    { value: 'TRUSTEE', label: 'Trustee' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <TextInput label="Phone" value={maker.phone || ''} onChange={(v) => updateCoDecisionMaker(idx, 'phone', v)} placeholder="(555) 123-4567" />
                  </div>
                  <button type="button" onClick={() => removeCoDecisionMaker(idx)} className="mt-5 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <TextInput label="Email" value={maker.email || ''} onChange={(v) => updateCoDecisionMaker(idx, 'email', v)} placeholder="email@example.com" />
            </div>
          ))}
        </div>
      );
    }

    if (status === 'CORPORATE_ENTITY') {
      return (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3 h-3" /> Corporate Entity Signatory Details
          </p>
          <TextInput 
            label="Entity / LLC / Trust Name" 
            value={contact.entityName || ''} 
            onChange={(v) => onChange({ entityName: v })} 
            placeholder="e.g. Bluebird Capital LLC" 
          />
          {makers.length === 0 && addCoDecisionMaker()}
          {makers.map((maker, idx) => (
            <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput label="Authorized Signer First Name" value={maker.firstName || ''} onChange={(v) => updateCoDecisionMaker(idx, 'firstName', v)} placeholder="First Name" />
                <TextInput label="Authorized Signer Last Name" value={maker.lastName || ''} onChange={(v) => updateCoDecisionMaker(idx, 'lastName', v)} placeholder="Last Name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput label="Title / Role" value={maker.role || ''} onChange={(v) => updateCoDecisionMaker(idx, 'role', v)} placeholder="e.g. Managing Member" />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <TextInput label="Phone" value={maker.phone || ''} onChange={(v) => updateCoDecisionMaker(idx, 'phone', v)} placeholder="(555) 123-4567" />
                  </div>
                  <button type="button" onClick={() => removeCoDecisionMaker(idx)} className="mt-5 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <TextInput label="Email" value={maker.email || ''} onChange={(v) => updateCoDecisionMaker(idx, 'email', v)} placeholder="email@example.com" />
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* MERGED: Decision Maker Status & Signatory Authority */}
      <SectionCard title="Decision Maker & Signatory Authority" accent="text-emerald-400">
        <div className="space-y-4">
          <SelectInput
            label="Ownership Structure"
            required
            value={contact.decisionMakerStatus}
            onChange={(v) => {
              if (v === 'SINGLE_OWNER') {
                onChange({ decisionMakerStatus: v as DecisionMakerStatus, coDecisionMakers: [] });
              } else {
                onChange({ decisionMakerStatus: v as DecisionMakerStatus });
              }
            }}
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
          {contact.decisionMakerStatus && (
            <div className="pt-2 border-t border-slate-800">
              {renderDynamicSignatoryFields()}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Rapport & Sensitivities */}
      <SectionCard title="Rapport & Sensitivities" accent="text-amber-400">
        <TextArea 
          label="Rapport / Relationship Notes" 
          description="Personal details mentioned on the call to reference in future follow-ups." 
          value={contact.rapportNotes} 
          onChange={(v) => onChange({ rapportNotes: v })} 
          placeholder="e.g. Veteran, moving to care for grandkids, retired contractor..." 
          rows={2} 
          accent="text-blue-300" 
        />
        <TextArea 
          label="Sensitivities / Red Flags" 
          description="Caution topics to be aware of before the next call." 
          value={contact.sensitivities} 
          onChange={(v) => onChange({ sensitivities: v })} 
          placeholder="e.g. Messy divorce, recent family passing, ongoing legal disputes..." 
          rows={2} 
          accent="text-red-300" 
        />
      </SectionCard>
    </div>
  );
};