import React from 'react';
import type {
  Contact, BuyerCategory, BuyBoxCondition, FundingSource, SpeedToClose, ClosingTerms
} from '@/types/dealflow';
import {
  SectionCard, TextInput, NumberInput, SelectInput, TextArea, ToggleRow
} from './ContactFieldPrimitives';

interface BuyerFieldsProps {
  contact: Partial<Contact>;
  onChange: (updates: Partial<Contact>) => void;
}

export const BuyerFields: React.FC<BuyerFieldsProps> = ({ contact, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Buyer Identity & Category */}
      <SectionCard title="Buying Entity & Category" accent="text-purple-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Company / Buying Entity LLC"
            required
            value={contact.company}
            onChange={(v) => onChange({ company: v })}
            placeholder="e.g. Apex Capital Holdings LLC"
          />
          <SelectInput
            label="Buyer Category"
            required
            value={contact.buyerCategory}
            onChange={(v) => onChange({ buyerCategory: v as BuyerCategory })}
            options={[
              { value: 'CASH_FLIPPER', label: 'Fix & Flipper' },
              { value: 'BUY_AND_HOLD', label: 'Buy & Hold (Rental)' },
              { value: 'BUILDER', label: 'Custom / Spec Builder' },
              { value: 'CONSTRUCTION_COMPANY', label: 'Construction Co' },
              { value: 'LAND_DEVELOPER', label: 'Land Developer / Infill' },
              { value: 'INFILL_BUILDER', label: 'Infill Lot Spec Builder' },
              { value: 'RURAL_LAND_BUYER', label: 'Rural Acreage Buyer' },
            ]}
            accent="text-purple-300"
          />
        </div>
        <div className="pt-2">
          <ToggleRow
            label="Actively Buys Vacant Land / Infill Lots"
            hint="Buyer is interested in raw land, tear-downs, or infill lots."
            checked={contact.isLandBuyer}
            onChange={(v) => onChange({ isLandBuyer: v })}
          />
        </div>
      </SectionCard>

      {/* Buy Box Criteria */}
      <SectionCard title="Buy Box Criteria & Target Markets" accent="text-purple-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Property Types"
            value={contact.buyBoxPropertyTypes}
            onChange={(v) => onChange({ buyBoxPropertyTypes: v })}
            placeholder="e.g. Single Family, Duplex, Small Multi"
          />
          <SelectInput
            label="Target Condition"
            value={contact.buyBoxCondition}
            onChange={(v) => onChange({ buyBoxCondition: v as BuyBoxCondition })}
            options={[
              { value: 'TURNKEY', label: 'Turnkey / Light Cosmetic' },
              { value: 'LIGHT_COSMETIC', label: 'Light Cosmetic (Paint/Floors)' },
              { value: 'HEAVY_REHAB', label: 'Heavy Rehab (Gut Job)' },
              { value: 'TEAR_DOWN', label: 'Tear-down / Scraping' },
            ]}
            accent="text-purple-300"
          />
          <TextInput
            label="Target Markets (Cities, Counties, ZIPs)"
            value={contact.targetMarkets}
            onChange={(v) => onChange({ targetMarkets: v })}
            placeholder="e.g. Springfield, Sangamon County, 62701-62704"
          />
          <TextInput
            label="Min ROI / Target Discount"
            value={contact.targetRoi}
            onChange={(v) => onChange({ targetRoi: v })}
            placeholder="e.g. 70% ARV minus repairs, 20% ROI"
          />
        </div>
      </SectionCard>

      {/* Budget & Funding */}
      <SectionCard title="Budget, Funding & Proof of Funds" accent="text-purple-400">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NumberInput
            label="Min Purchase Price ($)"
            value={contact.minPurchasePrice}
            onChange={(v) => onChange({ minPurchasePrice: v })}
            placeholder="e.g. 50000"
          />
          <NumberInput
            label="Max Acquisition Budget ($)"
            required
            value={contact.maxBudget}
            onChange={(v) => onChange({ maxBudget: v })}
            placeholder="e.g. 350000"
          />
          <SelectInput
            label="Funding Source"
            value={contact.fundingSourceType}
            onChange={(v) => onChange({ fundingSourceType: v as FundingSource })}
            options={[
              { value: 'CASH', label: 'Hard Cash' },
              { value: 'HARD_MONEY', label: 'Hard Money Lender' },
              { value: 'PRIVATE_MONEY', label: 'Private Money Lender' },
              { value: 'LINE_OF_CREDIT', label: 'Business Line of Credit' },
              { value: 'CONVENTIONAL', label: 'Conventional / DSCR Loan' },
              { value: 'SDIRA', label: 'Self-Directed IRA' },
            ]}
            accent="text-purple-300"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <ToggleRow
            label="Proof of Funds (POF) Verified"
            hint="We have a valid POF letter on file."
            checked={contact.pofVerified}
            onChange={(v) => onChange({ pofVerified: v })}
          />
          <TextInput
            label="POF Expiration Date"
            type="date"
            value={contact.pofExpirationDate}
            onChange={(v) => onChange({ pofExpirationDate: v })}
          />
        </div>
      </SectionCard>

      {/* Closing Logistics */}
      <SectionCard title="EMD, Speed to Close & Logistics" accent="text-purple-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberInput
            label="Max EMD Capacity ($)"
            value={contact.emdCapacity}
            onChange={(v) => onChange({ emdCapacity: v })}
            placeholder="e.g. 10000"
          />
          <TextInput
            label="EMD Speed to Deposit"
            value={contact.emdSpeedToDeposit}
            onChange={(v) => onChange({ emdSpeedToDeposit: v })}
            placeholder="e.g. $5,000 within 24 hours"
          />
          <SelectInput
            label="Speed to Close"
            value={contact.speedToClose}
            onChange={(v) => onChange({ speedToClose: v as SpeedToClose })}
            options={[
              { value: '3-7', label: '3–7 Days (ASAP)' },
              { value: '7-14', label: '7–14 Days' },
              { value: '14-30', label: '14–30 Days' },
            ]}
            accent="text-purple-300"
          />
          <SelectInput
            label="Inspection Requirement"
            value={contact.inspectionRequirement}
            onChange={(v) => onChange({ inspectionRequirement: v as 'SIGHT_UNSEEN' | 'WALKTHROUGH' })}
            options={[
              { value: 'SIGHT_UNSEEN', label: 'Buys Sight-Unseen (Photos/Video)' },
              { value: 'WALKTHROUGH', label: 'Requires Physical Walkthrough' },
            ]}
            accent="text-purple-300"
          />
        </div>
        <div className="pt-2">
          <SelectInput
            label="Preferred Closing Terms"
            value={contact.preferredClosingTerms}
            onChange={(v) => onChange({ preferredClosingTerms: v as ClosingTerms })}
            options={[
              { value: 'ASSIGNMENT', label: 'Assignment of Contract' },
              { value: 'DOUBLE_CLOSE', label: 'Double Close' },
              { value: 'NOVATION', label: 'Novation' },
              { value: 'SELLER_FINANCING', label: 'Seller Financing / Subject-To' },
              { value: 'PASS_THROUGH', label: 'Pass-Through Title' },
            ]}
            accent="text-purple-300"
          />
        </div>
      </SectionCard>
    </div>
  );
};
