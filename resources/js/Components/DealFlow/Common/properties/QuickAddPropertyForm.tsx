import React, { useState, useMemo, useEffect } from 'react';
import { X, Building2, Sparkles } from 'lucide-react';
import type {
  Lead, Property, Territory, ContactRole, PropertyType, PropertyAttachment,
  OccupancyStatus, LeadStage, PipelineType, GovListType,
} from '@/types/dealflow';
import { MctpForm } from '@/Components/DealFlow/Common/financials/MctpForm';
import { MaoFinancialsForm } from '@/Components/DealFlow/Common/financials/MaoFinancialsForm';
import { AddressTerritoryForm } from '@/Components/DealFlow/Common/properties/AddressTerritoryForm';
import { PropertySpecsForm } from '@/Components/DealFlow/Common/properties/PropertySpecsForm';
import { MultiStructureEditor } from '@/Components/DealFlow/Common/properties/MultiStructureEditor';
import type { StructureEntry } from '@/Components/DealFlow/Common/properties/MultiStructureEditor';
import { VacantLandForm, type VacantLandDetails } from '@/Components/DealFlow/Common/properties/VacantLandForm';
import { PhotoAttachmentManager } from '@/Components/DealFlow/Common/properties/PhotoAttachmentManager';
import { PipelineSyncSection } from '@/Components/DealFlow/Common/properties/PipelineSyncSection';
import { PropertyNotesForm } from '@/Components/DealFlow/Common/properties/PropertyNotesForm';

export interface ContactSuggestion {
  firstName: string; lastName: string; phone: string; email?: string; role: ContactRole;
}

interface QuickAddPropertyFormProps {
  territories: Territory[];
  selectedTerritoryId?: string | null;
  currentContact: { firstName: string; lastName: string; phone: string; role: ContactRole };
  onSaveLead?: (leadData: Partial<Lead>) => Promise<Lead | void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<Property | void>;
  onContactSuggestion?: (s: ContactSuggestion) => void;
  onLinkedLeadChange?: (leadId: string) => void;
  onClose: () => void;
}

export const QuickAddPropertyForm: React.FC<QuickAddPropertyFormProps> = ({
  territories, selectedTerritoryId, currentContact, onSaveLead, onCreateProperty,
  onContactSuggestion, onLinkedLeadChange, onClose,
}) => {
  const dealType: PipelineType = 'OFF_MARKET_GOV';
  const govListType: GovListType = 'PROBATE';

  const [mctpMotivation, setMctpMotivation] = useState('');
  const [mctpCondition, setMctpCondition] = useState('');
  const [mctpTimeline, setMctpTimeline] = useState('14-30 Days');
  const [mctpAskingPrice, setMctpAskingPrice] = useState<number | ''>(120000);
  const [mctpNetTarget, setMctpNetTarget] = useState<number | ''>(95000);
  const [mctpIsQualified, setMctpIsQualified] = useState(true);

  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('Springfield');
  const [state, setState] = useState('IL');
  const [zip, setZip] = useState('62704');
  const [territoryId, setTerritoryId] = useState(selectedTerritoryId && selectedTerritoryId !== 'ALL' ? selectedTerritoryId : territories[0]?.id || '');
  const [propertyType, setPropertyType] = useState<PropertyType>('SINGLE_FAMILY');
  const [beds, setBeds] = useState<number | ''>(3);
  const [baths, setBaths] = useState<number | ''>(2);
  const [sqft, setSqft] = useState<number | ''>(1800);
  const [occupancy, setOccupancy] = useState<OccupancyStatus>('VACANT');
  const [isLand, setIsLand] = useState(false);
  const [acreage, setAcreage] = useState<number | ''>('');
  const [hasMultiStructures, setHasMultiStructures] = useState(false);
  const [structures, setStructures] = useState<StructureEntry[]>([]);
  const [landDetails, setLandDetails] = useState<VacantLandDetails>({});

  const [maoAskingPrice, setMaoAskingPrice] = useState<number | ''>(120000);
  const [maoArv, setMaoArv] = useState<number | ''>(220000);
  const [maoRepairs, setMaoRepairs] = useState<number | ''>(35000);
  const [maoFee, setMaoFee] = useState<number | ''>(15000);
  const [syncPipeline, setSyncPipeline] = useState(true);
  const [pipelineStage, setPipelineStage] = useState<LeadStage>('NEW');

  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState<ContactRole>('DIRECT_SELLER');

  const [images, setImages] = useState<string[]>(['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80']);
  const [attachments, setAttachments] = useState<PropertyAttachment[]>([{ id: `att-${Date.now()}-1`, name: 'Report.pdf', url: '#', fileType: 'PDF', uploadedAt: new Date().toISOString().split('T')[0] }]);
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!contactFirstName && currentContact.firstName) setContactFirstName(currentContact.firstName);
    if (!contactLastName && currentContact.lastName) setContactLastName(currentContact.lastName);
    if (!contactPhone && currentContact.phone) setContactPhone(currentContact.phone);
    if (currentContact.role) setContactRole(currentContact.role);
  }, [currentContact, contactFirstName, contactLastName, contactPhone]);

  const calculatedMao = useMemo(() => {
    const arv = Number(maoArv) || 0;
    const repairs = Number(maoRepairs) || 0;
    const fee = Number(maoFee) || 15000;
    if (!arv) return 0;
    return Math.max(0, Math.round((arv * 0.70) - repairs - fee));
  }, [maoArv, maoRepairs, maoFee]);

  const handleSave = async () => {
    if (!street.trim() || !zip.trim()) { alert('Please enter a valid street address and zip code.'); return; }
    setIsCreating(true);
    try {
      let createdLead: Lead | void | null = null;

      // 1) LEAD = pipeline record ONLY (normalized!)
      if (syncPipeline && onSaveLead) {
        createdLead = await onSaveLead({
          dealType,
          govListType: dealType === 'OFF_MARKET_GOV' ? govListType : undefined,
          stage: pipelineStage || (dealType === 'OFF_MARKET_GOV' ? (mctpIsQualified ? 'MCTP_QUALIFIED' : 'NEW') : 'NEW'),
          notes: notes.trim() || undefined,
        });
      }

      // 2) PROPERTY owns address, specs, financials, MCTP & detail blocks
      if (onCreateProperty) {
        await onCreateProperty({
          streetAddress: street.trim(),
          unit: unit.trim() || undefined,
          city: city || 'Springfield',
          state: state || 'IL',
          zip: zip || '62704',
          territoryId: territoryId || undefined,
          propertyType,
          beds: Number(beds) || 0,
          baths: Number(baths) || 0,
          sqft: Number(sqft) || 0,
          occupancyStatus: occupancy,
          askingPrice: Number(maoAskingPrice) || 0,
          estimatedArv: Number(maoArv) || 0,
          estimatedRepairs: Number(maoRepairs) || 0,
          isLandDeal: isLand,
          acreage: Number(acreage) || undefined,
          hasMultipleStructures: hasMultiStructures,
          landDetails: isLand ? landDetails : undefined,
          structures: hasMultiStructures ? structures : undefined,
          valuation: {
            listPrice: Number(maoAskingPrice) || 0,
            estimatedArv: Number(maoArv) || 0,
            repairEstimate: Number(maoRepairs) || 0,
            calculatedMao,
            askingMaoGap: (Number(maoAskingPrice) || 0) - calculatedMao,
          },
          mctp: {
            motivation: mctpMotivation || 'Phone Call Intake',
            condition: mctpCondition || 'Repairs needed',
            timeline: mctpTimeline || 'Immediate',
            askingPrice: Number(maoAskingPrice) || 0,
            sellerNetTarget: Number(mctpNetTarget) || 0,
            qualifiedDate: new Date().toISOString(),
            isQualified: mctpIsQualified,
          },
          notes,
          leadId: createdLead ? (createdLead as Lead).id : undefined,
          images,
          attachments,
        });
      }

      if (createdLead && (createdLead as Lead).id && onLinkedLeadChange) onLinkedLeadChange((createdLead as Lead).id);
      if ((contactFirstName || contactPhone) && onContactSuggestion) onContactSuggestion({ firstName: contactFirstName, lastName: contactLastName, phone: contactPhone, role: contactRole });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create property.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mt-3 p-4 bg-slate-900 border-2 border-amber-500/40 rounded-xl space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold"><Building2 className="w-5 h-5" /></div>
          <div>
            <h4 className="font-extrabold text-amber-400 text-sm">Quick Add Property & Wholesale Lead</h4>
            <p className="text-[11px] text-slate-400">Enter address, specs, MCTP pillars & valuation MAO.</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1"><X className="w-4 h-4" /></button>
      </div>

      <MctpForm dealType={dealType} motivation={mctpMotivation} condition={mctpCondition} timeline={mctpTimeline} askingPrice={mctpAskingPrice} netTarget={mctpNetTarget} isQualified={mctpIsQualified} onMotivationChange={setMctpMotivation} onConditionChange={setMctpCondition} onTimelineChange={setMctpTimeline} onAskingPriceChange={setMctpAskingPrice} onNetTargetChange={setMctpNetTarget} onQualifiedChange={setMctpIsQualified} />
      <AddressTerritoryForm street={street} unit={unit} city={city} state={state} zip={zip} territoryId={territoryId} territories={territories} onStreetChange={setStreet} onUnitChange={setUnit} onCityChange={setCity} onStateChange={setState} onZipChange={setZip} onTerritoryChange={setTerritoryId} />
      <PropertySpecsForm
        propertyType={propertyType} beds={beds} baths={baths} sqft={sqft} occupancy={occupancy}
        isLand={isLand} acreage={acreage} hasMultiStructures={hasMultiStructures}
        onTypeChange={setPropertyType} onBedsChange={setBeds} onBathsChange={setBaths} onSqftChange={setSqft} onOccupancyChange={setOccupancy}
        onIsLandChange={setIsLand} onAcreageChange={setAcreage} onMultiStructuresChange={setHasMultiStructures}
      />
      {isLand && (
        <VacantLandForm land={landDetails} onChange={(u) => setLandDetails((prev) => ({ ...prev, ...u }))} />
      )}
      {hasMultiStructures && (
        <MultiStructureEditor structures={structures} onStructuresChange={setStructures} territories={territories} />
      )}
      <MaoFinancialsForm askingPrice={maoAskingPrice} arv={maoArv} repairs={maoRepairs} fee={maoFee} onAskingPriceChange={setMaoAskingPrice} onArvChange={setMaoArv} onRepairsChange={setMaoRepairs} onFeeChange={setMaoFee} />
      <PipelineSyncSection syncPipeline={syncPipeline} pipelineStage={pipelineStage} onSyncChange={setSyncPipeline} onStageChange={setPipelineStage} />
      <PhotoAttachmentManager images={images} attachments={attachments} onAddImage={(url) => setImages([...images, url])} onRemoveImage={(idx) => setImages(images.filter((_, i) => i !== idx))} onAddAttachment={(name, url) => setAttachments([...attachments, { id: Date.now().toString(), name, fileType: 'PDF', url, uploadedAt: new Date().toISOString().split('T')[0] }])} onRemoveAttachment={(id) => setAttachments(attachments.filter(a => a.id !== id))} />
      <PropertyNotesForm notes={notes} onNotesChange={setNotes} />
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs">Cancel</button>
        <button type="button" disabled={isCreating} onClick={handleSave} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50">
          <Sparkles className="w-3.5 h-3.5 fill-current" /> {isCreating ? 'Creating...' : 'Save & Auto-Link'}
        </button>
      </div>
    </div>
  );
};