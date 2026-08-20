import React, { useState } from 'react';

// Property bricks
import { DealTypeSelector } from '@/Components/DealFlow/Common/financials/DealTypeSelector';
import { MctpForm } from '@/Components/DealFlow/Common/financials/MctpForm';
import { MaoFinancialsForm } from '@/Components/DealFlow/Common/financials/MaoFinancialsForm';
import { AddressTerritoryForm } from '@/Components/DealFlow/Common/properties/AddressTerritoryForm';
import { PropertySpecsForm } from '@/Components/DealFlow/Common/properties/PropertySpecsForm';
import { PhotoAttachmentManager } from '@/Components/DealFlow/Common/properties/PhotoAttachmentManager';
import { PipelineSyncSection } from '@/Components/DealFlow/Common/properties/PipelineSyncSection';
import { QuickAddPropertyForm } from '@/Components/DealFlow/Common/properties/QuickAddPropertyForm';
import { PropertyLinkPicker } from '@/Components/DealFlow/Common/properties/PropertyLinkPicker';
import { MultiStructureEditor } from '@/Components/DealFlow/Common/properties/MultiStructureEditor';
import type { StructureEntry } from '@/Components/DealFlow/Common/properties/MultiStructureEditor';
import { VacantLandForm } from '@/Components/DealFlow/Common/properties/VacantLandForm';
import type { VacantLandDetails } from '@/Components/DealFlow/Common/properties/VacantLandForm';

// Contact bricks
import { SellerFields } from '@/Components/DealFlow/Common/contacts/SellerFields';
import { AgentFields } from '@/Components/DealFlow/Common/contacts/AgentFields';
import { BuyerFields } from '@/Components/DealFlow/Common/contacts/BuyerFields';
import { TitleFields } from '@/Components/DealFlow/Common/contacts/TitleFields';
import { AttorneyFields } from '@/Components/DealFlow/Common/contacts/AttorneyFields';
import { WholesalerFields } from '@/Components/DealFlow/Common/contacts/WholesalerFields';
import { ContractorFields } from '@/Components/DealFlow/Common/contacts/ContractorFields';
import { MunicipalityFields } from '@/Components/DealFlow/Common/contacts/MunicipalityFields';
import { QuickAddContactForm } from '@/Components/DealFlow/Common/contacts/QuickAddContactForm';
import { ContactIntakePicker, emptyContactSnapshot } from '@/Components/DealFlow/Common/contacts/ContactIntakePicker';
import { DncToggle } from '@/Components/DealFlow/Common/contacts/DncToggle';

// Lead bricks
import { FollowUpCalendar } from '@/Components/DealFlow/Common/leads/FollowUpCalendar';

import type { Contact, Buyer, TitleCompany, Lead, PipelineType, GovListType, PropertyType, OccupancyStatus, PropertyAttachment, LeadStage, Territory } from '@/types/dealflow';

// ── Mock CRM data so the pickers have rows to search ─────────────────────────
const mockLeads = [
    { id: 'lead-1', propertyAddress: '742 Evergreen Terrace', city: 'Springfield', state: 'IL', zip: '62704', stage: 'GOV_LIST_PULLED', dealType: 'OFF_MARKET_GOV', contactName: 'Sarah Jenkins', contactFirstName: 'Sarah', contactLastName: 'Jenkins', contactPhone: '(555) 123-4567', contactEmail: 'sarah.j@example.com', contactRole: 'DIRECT_SELLER', valuation: { listPrice: 120000, estimatedArv: 210000 } },
    { id: 'lead-2', propertyAddress: '1985 Maplewood Lane', city: 'Springfield', state: 'IL', zip: '62703', stage: 'MCTP_QUALIFIED', dealType: 'OFF_MARKET_GOV', contactName: 'Marcus Reed', contactFirstName: 'Marcus', contactLastName: 'Reed', contactPhone: '(555) 987-6543', contactRole: 'DIRECT_SELLER', valuation: { listPrice: 95000, estimatedArv: 180000 } },
] as Lead[];

const mockContacts = [
    { id: 'c-1', firstName: 'Sarah', lastName: 'Jenkins', phone: '(555) 123-4567', email: 'sarah.j@example.com', role: 'DIRECT_SELLER' },
    { id: 'c-2', firstName: 'Alicia', lastName: 'Grant', phone: '(555) 222-8899', email: 'alicia@remax.example.com', role: 'LISTING_AGENT', company: 'RE/MAX Professionals' },
] as Contact[];

const mockBuyers = [
    { id: 'b-1', name: 'Bluebird Capital LLC', firstName: 'Dmitri', lastName: 'Kovacs', phone: '(555) 300-1111', email: 'deals@bluebird.example.com', buyerCategory: 'CASH_FLIPPER', maxBudget: 350000 },
] as Buyer[];

const mockTitleCompanies = [
    { id: 't-1', name: 'Prairie Title Co.', officerName: 'Elena Ruiz', officerFirstName: 'Elena', officerLastName: 'Ruiz', phone: '(555) 400-2222', email: 'elena@prairietitle.example.com', investorFriendly: true },
] as TitleCompany[];

// ── Mock follow-ups spread across today / this month for the calendar ───────
const atOffset = (days: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
};

const mockFollowUpLeads = [
    { ...mockLeads[0], nextFollowUpDate: atOffset(0, 9) },
    { ...mockLeads[1], nextFollowUpDate: atOffset(0, 14) },
    { id: 'lead-3', propertyAddress: '410 Birchwood Ct', city: 'Springfield', state: 'IL', zip: '62702', stage: 'OFFER_SENT_PDF', dealType: 'OFF_MARKET_GOV', contactName: 'Dana Whitfield', contactPhone: '(555) 444-7788', nextFollowUpDate: atOffset(1, 11) },
    { id: 'lead-4', propertyAddress: '77 Route 66', city: 'Chatham', state: 'IL', zip: '62629', stage: 'SKIP_TRACED', dealType: 'OFF_MARKET_GOV', contactName: 'Leo Marsh', contactPhone: '(555) 210-9911', nextFollowUpDate: atOffset(3, 16) },
    { id: 'lead-5', propertyAddress: '1200 Sangamon Ave', city: 'Springfield', state: 'IL', zip: '62703', stage: 'MCTP_QUALIFIED', dealType: 'OFF_MARKET_GOV', contactName: 'Priya Patel', contactPhone: '(555) 666-0303', nextFollowUpDate: atOffset(9, 10) },
    { id: 'lead-6', propertyAddress: '88 Lakeshore Dr', city: 'Pawnee', state: 'IL', zip: '62557', stage: 'GOV_LIST_PULLED', dealType: 'OFF_MARKET_GOV', contactName: 'Gus Romano', contactPhone: '(555) 888-1212', nextFollowUpDate: atOffset(17, 13) },
    { id: 'lead-7', propertyAddress: '301 Prairie Ln', city: 'Riverton', state: 'IL', zip: '62561', stage: 'OFFER_SENT_PDF', dealType: 'OFF_MARKET_GOV', contactName: 'Mia Chen', contactPhone: '(555) 313-2020', nextFollowUpDate: atOffset(26, 15) },
] as Lead[];

export default function Lab({ component }: { component: string }) {
    // ── Property state ──
    const [dealType, setDealType] = useState<PipelineType>('OFF_MARKET_GOV');
    const [govListType, setGovListType] = useState<GovListType>('PROBATE');
    const [motivation, setMotivation] = useState('');
    const [condition, setCondition] = useState('');
    const [timeline, setTimeline] = useState('14-30 Days');
    const [asking, setAsking] = useState<number | ''>(120000);
    const [netTarget, setNetTarget] = useState<number | ''>(95000);
    const [isQualified, setIsQualified] = useState(true);
    const [arv, setArv] = useState<number | ''>(220000);
    const [repairs, setRepairs] = useState<number | ''>(35000);
    const [fee, setFee] = useState<number | ''>(15000);
    const [street, setStreet] = useState('');
    const [unit, setUnit] = useState('');
    const [city, setCity] = useState('Springfield');
    const [state, setState] = useState('IL');
    const [zip, setZip] = useState('62704');
    const [territoryId, setTerritoryId] = useState('terr-1');
    const [propType, setPropType] = useState<PropertyType>('SINGLE_FAMILY');
    const [beds, setBeds] = useState<number | ''>(3);
    const [baths, setBaths] = useState<number | ''>(2);
    const [sqft, setSqft] = useState<number | ''>(1800);
    const [occupancy, setOccupancy] = useState<OccupancyStatus>('VACANT');
    const [isLand, setIsLand] = useState(false);
    const [acreage, setAcreage] = useState<number | ''>('');
    const [multi, setMulti] = useState(false);
    const [structures, setStructures] = useState<StructureEntry[]>([]);
    const [landDetails, setLandDetails] = useState<VacantLandDetails>({});
    const [images, setImages] = useState<string[]>([]);
    const [attachments, setAttachments] = useState<PropertyAttachment[]>([]);
    const [sync, setSync] = useState(true);
    const [stage, setStage] = useState<LeadStage>('NEW');
    const [linkedLeadId, setLinkedLeadId] = useState('');

    // ── Contact state (shared draft for sub-components) ──
    const [contactDraft, setContactDraft] = useState<Partial<Contact>>({ role: 'DIRECT_SELLER' });
    const [lastSavedContact, setLastSavedContact] = useState<Partial<Contact> | null>(null);
    const [contactSnapshot, setContactSnapshot] = useState(emptyContactSnapshot());
    const patchContact = (u: Partial<Contact>) => setContactDraft((prev) => ({ ...prev, ...u }));

    const territories: Territory[] = [
        { id: 'terr-1', name: 'Springfield Central', state: 'IL', countiesOrCities: ['Sangamon'], zipCodes: ['62704'], targetDiscountRate: 70, avgWholesaleFee: 15000, status: 'ACTIVE' },
    ];

    const propertyMenu = [
        { slug: 'prop-quick-add', label: '✨ QuickAddPropertyForm (Full)' },
        { slug: 'prop-link-picker', label: '🔗 PropertyLinkPicker (Full)' },
        { slug: 'deal-type', label: 'DealTypeSelector' },
        { slug: 'mctp', label: 'MctpForm' },
        { slug: 'mao', label: 'MaoFinancialsForm' },
        { slug: 'address', label: 'AddressTerritoryForm' },
        { slug: 'specs', label: 'PropertySpecsForm' },
        { slug: 'multi-structure', label: '🏘️ MultiStructureEditor' },
        { slug: 'vacant-land', label: '🌲 VacantLandForm' },
        { slug: 'photos', label: 'PhotoAttachmentManager' },
        { slug: 'pipeline', label: 'PipelineSyncSection' },
    ];

    const contactMenu = [
        { slug: 'contact-quick-add', label: '✨ QuickAddContactForm (Full)' },
        { slug: 'contact-intake-picker', label: '🔗 ContactIntakePicker (Full)' },
        { slug: 'dnc-toggle', label: '🚫 DncToggle' },
        { slug: 'seller-fields', label: 'SellerFields' },
        { slug: 'agent-fields', label: 'AgentFields' },
        { slug: 'buyer-fields', label: 'BuyerFields' },
        { slug: 'title-fields', label: 'TitleFields' },
        { slug: 'attorney-fields', label: 'AttorneyFields' },
        { slug: 'wholesaler-fields', label: 'WholesalerFields' },
        { slug: 'contractor-fields', label: 'ContractorFields' },
        { slug: 'municipality-fields', label: 'MunicipalityFields' },
    ];

    const leadMenu = [
        { slug: 'followup-calendar', label: '📅 FollowUpCalendar (Full)' },
    ];

    const isContactView = contactMenu.some((m) => m.slug === component);
    const isLeadView = leadMenu.some((m) => m.slug === component);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 space-y-5">
            <div>
                <h1 className="text-lg font-extrabold text-amber-400">🧪 Component Lab</h1>
                <p className="text-xs text-slate-400 mt-1">Property + Contact + Lead sub-component benches. Pick one on the left.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div>
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">🏠 Property Set</p>
                        <div className="flex flex-col gap-1.5">
                            {propertyMenu.map((m) => (
                                <a key={m.slug} href={`/lab/${m.slug}`} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${component === m.slug ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'}`}>{m.label}</a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">👤 Contact Set</p>
                        <div className="flex flex-col gap-1.5">
                            {contactMenu.map((m) => (
                                <a key={m.slug} href={`/lab/${m.slug}`} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${component === m.slug ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'}`}>{m.label}</a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1.5">📅 Lead Set</p>
                        <div className="flex flex-col gap-1.5">
                            {leadMenu.map((m) => (
                                <a key={m.slug} href={`/lab/${m.slug}`} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${component === m.slug ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'}`}>{m.label}</a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main bench */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-h-[400px]">
                        {/* Property components */}
                        {component === 'prop-quick-add' && (
                            <QuickAddPropertyForm territories={territories} currentContact={{ firstName: '', lastName: '', phone: '', role: 'DIRECT_SELLER' }} onClose={() => alert('onClose fired')} onSaveLead={async (d) => { console.log('onSaveLead:', d); return { id: 'lead-new', ...d } as any; }} onCreateProperty={async (d) => console.log('onCreateProperty:', d)} onContactSuggestion={(s) => console.log('onContactSuggestion:', s)} onLinkedLeadChange={(id) => console.log('onLinkedLeadChange:', id)} />
                        )}
                        {component === 'prop-link-picker' && (
                            <PropertyLinkPicker
                                leads={mockLeads}
                                properties={[]}
                                callLogs={[]}
                                selectedLeadId={linkedLeadId}
                                onSelectLead={(id) => { setLinkedLeadId(id); console.log('onSelectLead:', id); }}
                                onUnlink={() => { setLinkedLeadId(''); console.log('onUnlink fired'); }}
                                territories={territories}
                                selectedTerritoryId="terr-1"
                                currentContact={{ firstName: contactSnapshot.firstName, lastName: contactSnapshot.lastName, phone: contactSnapshot.phone, role: contactSnapshot.role }}
                                onSaveLead={async (d) => { console.log('onSaveLead:', d); return { id: 'lead-new', ...d } as any; }}
                                onCreateProperty={async (d) => console.log('onCreateProperty:', d)}
                                onContactSuggestion={(s) => console.log('onContactSuggestion:', s)}
                            />
                        )}
                        {component === 'deal-type' && <DealTypeSelector dealType={dealType} govListType={govListType} onDealTypeChange={setDealType} onGovListTypeChange={setGovListType} />}
                        {component === 'mctp' && <MctpForm dealType={dealType} motivation={motivation} condition={condition} timeline={timeline} askingPrice={asking} netTarget={netTarget} isQualified={isQualified} onMotivationChange={setMotivation} onConditionChange={setCondition} onTimelineChange={setTimeline} onAskingPriceChange={setAsking} onNetTargetChange={setNetTarget} onQualifiedChange={setIsQualified} />}
                        {component === 'mao' && <MaoFinancialsForm askingPrice={asking} arv={arv} repairs={repairs} fee={fee} onAskingPriceChange={setAsking} onArvChange={setArv} onRepairsChange={setRepairs} onFeeChange={setFee} />}
                        {component === 'address' && <AddressTerritoryForm street={street} unit={unit} city={city} state={state} zip={zip} territoryId={territoryId} territories={territories} onStreetChange={setStreet} onUnitChange={setUnit} onCityChange={setCity} onStateChange={setState} onZipChange={setZip} onTerritoryChange={setTerritoryId} />}
                        {component === 'specs' && <PropertySpecsForm propertyType={propType} beds={beds} baths={baths} sqft={sqft} occupancy={occupancy} isLand={isLand} acreage={acreage} hasMultiStructures={multi} onTypeChange={setPropType} onBedsChange={setBeds} onBathsChange={setBaths} onSqftChange={setSqft} onOccupancyChange={setOccupancy} onIsLandChange={setIsLand} onAcreageChange={setAcreage} onMultiStructuresChange={setMulti} />}
                        {component === 'multi-structure' && (
                            <MultiStructureEditor structures={structures} onStructuresChange={setStructures} territories={territories} />
                        )}
                        {component === 'vacant-land' && (
                            <VacantLandForm land={landDetails} onChange={(u) => setLandDetails((prev) => ({ ...prev, ...u }))} />
                        )}
                        {component === 'photos' && <PhotoAttachmentManager images={images} attachments={attachments} onAddImage={(url) => setImages([...images, url])} onRemoveImage={(i) => setImages(images.filter((_, idx) => idx !== i))} onAddAttachment={(name, url) => setAttachments([...attachments, { id: `att-${Date.now()}`, name, url, fileType: 'PDF', uploadedAt: new Date().toISOString().split('T')[0] }])} onRemoveAttachment={(id) => setAttachments(attachments.filter((a) => a.id !== id))} />}
                        {component === 'pipeline' && <PipelineSyncSection syncPipeline={sync} pipelineStage={stage} onSyncChange={setSync} onStageChange={setStage} />}

                        {/* Contact components */}
                        {component === 'contact-quick-add' && (
                            <QuickAddContactForm
                                onSaveContact={async (d) => { console.log('💾 SAVED CONTACT:', d); setLastSavedContact(d); }}
                                onClose={() => alert('onClose fired')}
                            />
                        )}
                        {component === 'contact-intake-picker' && (
                            <ContactIntakePicker
                                contacts={mockContacts}
                                buyers={mockBuyers}
                                titleCompanies={mockTitleCompanies}
                                leads={mockLeads}
                                snapshot={contactSnapshot}
                                onSnapshotChange={setContactSnapshot}
                                onCreateContact={async (d) => { console.log('💾 onCreateContact:', d); setLastSavedContact(d); }}
                                onAddBuyer={async (d) => console.log('onAddBuyer:', d)}
                                onAddTitleCompany={async (d) => console.log('onAddTitleCompany:', d)}
                                leadId={linkedLeadId || undefined}
                            />
                        )}
                        {component === 'dnc-toggle' && (
                            <div className="space-y-3">
                                <DncToggle
                                    contact={{ ...mockContacts[0], ...contactDraft } as Contact}
                                    onToggleDnc={(c) => patchContact({ dnc: !c.dnc, dncDate: new Date().toISOString() })}
                                />
                                <p className="text-[11px] text-slate-400">
                                    Click the badge to toggle Do-Not-Call on the draft contact. Red = DNC active.
                                </p>
                            </div>
                        )}
                        {component === 'seller-fields' && <SellerFields contact={contactDraft} onChange={patchContact} />}
                        {component === 'agent-fields' && <AgentFields contact={contactDraft} onChange={patchContact} />}
                        {component === 'buyer-fields' && <BuyerFields contact={contactDraft} onChange={patchContact} />}
                        {component === 'title-fields' && <TitleFields contact={contactDraft} onChange={patchContact} />}
                        {component === 'attorney-fields' && <AttorneyFields contact={contactDraft} onChange={patchContact} />}
                        {component === 'wholesaler-fields' && <WholesalerFields contact={contactDraft} onChange={patchContact} />}
                        {component === 'contractor-fields' && <ContractorFields contact={contactDraft} onChange={patchContact} />}
                        {component === 'municipality-fields' && <MunicipalityFields contact={contactDraft} onChange={patchContact} />}

                        {/* Lead components */}
                        {component === 'followup-calendar' && (
                            <FollowUpCalendar
                                leads={mockFollowUpLeads}
                                onOpenDialer={(l) => alert(`📞 onOpenDialer: ${l.propertyAddress}`)}
                                onOpenDetail={(l) => alert(`📄 onOpenDetail: ${l.propertyAddress}`)}
                            />
                        )}
                        {!propertyMenu.some((m) => m.slug === component) && !isContactView && !isLeadView && (
                            <p className="text-slate-500 text-sm italic">Pick a component from the menu to preview it.</p>
                        )}
                    </div>

                    {/* Live JSON reporter */}
                    <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-emerald-300 overflow-auto max-h-80 font-mono">
                        {JSON.stringify(
                            isContactView
                                ? { activeComponent: component, linkedLeadId, contactSnapshot, contactDraft, lastSavedContact }
                                : isLeadView
                                    ? { activeComponent: component, scheduledFollowUps: mockFollowUpLeads.length }
                                    : { activeComponent: component, linkedLeadId, dealType, govListType, asking, arv, repairs, street, zip, sync, stage, isLand, acreage, multi, structures, landDetails },
                            null, 2
                        )}
                    </pre>
                </div>
            </div>
        </div>
    );
}
