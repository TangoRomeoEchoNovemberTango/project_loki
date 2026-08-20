import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Sparkles,
  Search,
  Building2,
  MapPin,
  ChevronDown,
  DollarSign,
  ShieldCheck,
  Plus,
  Home,
  Tag,
  Landmark,
  Maximize2,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit2,
} from 'lucide-react';
import type {
  Lead,
  Property,
  CallLog,
  Territory,
  ContactRole,
  PropertyType,
  PropertyAttachment,
  OccupancyStatus,
  LeadStage,
  PipelineType,
  GovListType,
} from '@/types/dealflow';

export interface ContactSuggestion {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  role: ContactRole;
}

interface PropertySectionProps {
  leads: Lead[];
  properties?: Property[];
  callLogs?: CallLog[];
  territories?: Territory[];
  selectedTerritoryId?: string | null;
  selectedLead?: Lead;
  currentContact: { firstName: string; lastName: string; phone: string; role: ContactRole };
  onLinkedLeadChange: (leadId: string) => void;
  onContactSuggestion: (s: ContactSuggestion) => void;
  onSaveLead?: (leadData: Partial<Lead>) => Promise<Lead | void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<void>;
}

export const PropertySection: React.FC<PropertySectionProps> = ({
  leads,
  properties = [],
  callLogs = [],
  territories = [],
  selectedTerritoryId,
  selectedLead,
  currentContact,
  onLinkedLeadChange,
  onContactSuggestion,
  onSaveLead,
  onCreateProperty,
}) => {
  // Searchable Property Link State
  const [associatedLeadId, setAssociatedLeadId] = useState<string>(selectedLead?.id || '');
  const [propertySearchQuery, setPropertySearchQuery] = useState<string>('');
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState<boolean>(false);
  // Property Intelligence & Live Dossier HUD State
  const [activePropertyTab, setActivePropertyTab] = useState<'mctp' | 'financials' | 'specs' | 'photos' | 'docs' | 'calls'>('mctp');
  const [isPropertyDossierExpanded, setIsPropertyDossierExpanded] = useState<boolean>(true);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number>(0);
  // Quick Add Property Inline Form State
  const [isQuickAddPropertyOpen, setIsQuickAddPropertyOpen] = useState<boolean>(false);
  const [quickPropertyDealType, setQuickPropertyDealType] = useState<PipelineType>('OFF_MARKET_GOV');
  const [quickPropertyGovListType, setQuickPropertyGovListType] = useState<GovListType>('PROBATE');
  const [quickPropertyStreet, setQuickPropertyStreet] = useState<string>('');
  const [quickPropertyUnit, setQuickPropertyUnit] = useState<string>('');
  const [quickPropertyCity, setQuickPropertyCity] = useState<string>('Springfield');
  const [quickPropertyState, setQuickPropertyState] = useState<string>('IL');
  const [quickPropertyZip, setQuickPropertyZip] = useState<string>('62704');
  const [quickPropertyTerritoryId, setQuickPropertyTerritoryId] = useState<string>(
    selectedTerritoryId && selectedTerritoryId !== 'ALL'
      ? selectedTerritoryId
      : territories[0]?.id || ''
  );
  const [quickPropertyType, setQuickPropertyType] = useState<PropertyType>('SINGLE_FAMILY');
  const [quickPropertyBeds, setQuickPropertyBeds] = useState<number | ''>(3);
  const [quickPropertyBaths, setQuickPropertyBaths] = useState<number | ''>(2);
  const [quickPropertySqft, setQuickPropertySqft] = useState<number | ''>(1800);
  const [quickPropertyYearBuilt, setQuickPropertyYearBuilt] = useState<number | ''>(1985);
  const [quickPropertyOccupancy, setQuickPropertyOccupancy] = useState<OccupancyStatus>('VACANT');
  const [quickPropertyAskingPrice, setQuickPropertyAskingPrice] = useState<number | ''>(120000);
  const [quickPropertyArv, setQuickPropertyArv] = useState<number | ''>(220000);
  const [quickPropertyRepairs, setQuickPropertyRepairs] = useState<number | ''>(35000);
  const [quickPropertyDiscountPct, setQuickPropertyDiscountPct] = useState<number>(70);
  const [quickPropertyFee, setQuickPropertyFee] = useState<number>(15000);
  // MCTP 4-Pillars Engine State for Quick Property Intake
  const [quickPropertyMctpMotivation, setQuickPropertyMctpMotivation] = useState<string>('');
  const [quickPropertyMctpCondition, setQuickPropertyMctpCondition] = useState<string>('');
  const [quickPropertyMctpTimeline, setQuickPropertyMctpTimeline] = useState<string>('14-30 Days');
  const [quickPropertyMctpNetTarget, setQuickPropertyMctpNetTarget] = useState<number | ''>(95000);
  const [quickPropertyIsMctpQualified, setQuickPropertyIsMctpQualified] = useState<boolean>(true);
  const [quickPropertySyncPipeline, setQuickPropertySyncPipeline] = useState<boolean>(true);
  const [quickPropertyPipelineStage, setQuickPropertyPipelineStage] = useState<LeadStage>('NEW');
  const [quickPropertyContactFirstName, setQuickPropertyContactFirstName] = useState<string>('');
  const [quickPropertyContactLastName, setQuickPropertyContactLastName] = useState<string>('');
  const [quickPropertyContactPhone, setQuickPropertyContactPhone] = useState<string>('');
  const [quickPropertyContactRole, setQuickPropertyContactRole] = useState<ContactRole>('DIRECT_SELLER');
  const [quickPropertyIsLand, setQuickPropertyIsLand] = useState<boolean>(false);
  const [quickPropertyAcreage, setQuickPropertyAcreage] = useState<number | ''>('');
  const [quickPropertyHasMultiStructures, setQuickPropertyHasMultiStructures] = useState<boolean>(false);
  // Property Images & File Attachments State for Quick Add
  const [quickPropertyImages, setQuickPropertyImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
  ]);
  const [newQuickImageUrl, setNewQuickImageUrl] = useState<string>('');
  const [quickPropertyAttachments, setQuickPropertyAttachments] = useState<PropertyAttachment[]>([
    {
      id: `att-${Date.now()}-1`,
      name: 'Skip_Trace_Contact_Report.pdf',
      url: '#',
      fileType: 'PDF',
      uploadedAt: new Date().toISOString().split('T')[0],
    },
  ]);
  const [newQuickDocName, setNewQuickDocName] = useState<string>('');
  const [newQuickDocUrl, setNewQuickDocUrl] = useState<string>('');
  const [isCreatingQuickProperty, setIsCreatingQuickProperty] = useState<boolean>(false);
  // Property Info Edit State for Linked Selected Property
  const [isEditingSelectedProperty, setIsEditingSelectedProperty] = useState<boolean>(false);
  const [editPropStreet, setEditPropStreet] = useState<string>('');
  const [editPropCity, setEditPropCity] = useState<string>('');
  const [editPropState, setEditPropState] = useState<string>('');
  const [editPropZip, setEditPropZip] = useState<string>('');
  const [editPropDealType, setEditPropDealType] = useState<PipelineType>('OFF_MARKET_GOV');
  const [editPropGovListType, setEditPropGovListType] = useState<GovListType>('PROBATE');
  const [editPropBeds, setEditPropBeds] = useState<number | ''>(3);
  const [editPropBaths, setEditPropBaths] = useState<number | ''>(2);
  const [editPropSqft, setEditPropSqft] = useState<number | ''>(1800);
  const [editPropYearBuilt, setEditPropYearBuilt] = useState<number | ''>(1985);
  const [editPropOccupancy, setEditPropOccupancy] = useState<OccupancyStatus>('VACANT');
  const [editPropAskingPrice, setEditPropAskingPrice] = useState<number | ''>(120000);
  const [editPropArv, setEditPropArv] = useState<number | ''>(220000);
  const [editPropRepairs, setEditPropRepairs] = useState<number | ''>(35000);
  const [editPropFee, setEditPropFee] = useState<number>(15000);
  const [editPropMotivation, setEditPropMotivation] = useState<string>('');
  const [editPropCondition, setEditPropCondition] = useState<string>('');
  const [editPropTimeline, setEditPropTimeline] = useState<string>('14-30 Days');
  const [editPropNetTarget, setEditPropNetTarget] = useState<number | ''>(95000);
  const [editPropImageUrl, setEditPropImageUrl] = useState<string>('');
  const [editPropPdfUrl, setEditPropPdfUrl] = useState<string>('');
  const [editPropStage, setEditPropStage] = useState<LeadStage>('NEW');
  const [isSavingPropertyEdits, setIsSavingPropertyEdits] = useState<boolean>(false);

  const propertyDropdownRef = useRef<HTMLDivElement>(null);

  // Sync selectedLead prop into the linked lead
  useEffect(() => {
    if (selectedLead) setAssociatedLeadId(selectedLead.id);
  }, [selectedLead]);

  // Report the linked lead upward whenever it changes (this is what the form submits)
  useEffect(() => {
    onLinkedLeadChange(associatedLeadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associatedLeadId]);

  // Close property dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target as Node)) {
        setIsPropertyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync quick property contact fields from the parent's contact draft when opening quick add
  useEffect(() => {
    if (isQuickAddPropertyOpen) {
      if (!quickPropertyContactFirstName && currentContact.firstName) {
        setQuickPropertyContactFirstName(currentContact.firstName);
        setQuickPropertyContactLastName(currentContact.lastName);
      }
      if (!quickPropertyContactPhone && currentContact.phone) {
        setQuickPropertyContactPhone(currentContact.phone);
      }
      if (currentContact.role) {
        setQuickPropertyContactRole(currentContact.role);
      }
    }
  }, [isQuickAddPropertyOpen, currentContact]);

  const handleStartEditingProperty = (lead: Lead) => {
    setEditPropStreet(lead.propertyAddress || '');
    setEditPropCity(lead.city || '');
    setEditPropState(lead.state || '');
    setEditPropZip(lead.zip || '');
    setEditPropDealType(lead.dealType || 'OFF_MARKET_GOV');
    setEditPropGovListType(lead.govListType || 'PROBATE');
    setEditPropBeds(lead.beds || 3);
    setEditPropBaths(lead.baths || 2);
    setEditPropSqft(lead.sqft || 1800);
    setEditPropYearBuilt(lead.yearBuilt || 1985);
    setEditPropOccupancy(lead.occupancyStatus || 'VACANT');
    setEditPropAskingPrice(lead.valuation?.listPrice || lead.mctp?.askingPrice || 0);
    setEditPropArv(lead.valuation?.estimatedArv || 220000);
    setEditPropRepairs(lead.valuation?.repairEstimate || 35000);
    setEditPropFee(lead.valuation?.desiredWholesaleFee || 15000);
    setEditPropMotivation(lead.mctp?.motivation || lead.notes || '');
    setEditPropCondition(lead.mctp?.condition || '');
    setEditPropTimeline(lead.mctp?.timeline || '14-30 Days');
    setEditPropNetTarget(lead.mctp?.sellerNetTarget || 0);
    setEditPropImageUrl(lead.imageUrl || '');
    setEditPropPdfUrl(lead.pdfAgreementUrl || '');
    setEditPropStage(lead.stage || 'NEW');
    setIsEditingSelectedProperty(true);
  };

  const handleSavePropertyEdits = async () => {
    if (!selectedPropertyLead || !onSaveLead) return;
    setIsSavingPropertyEdits(true);
    try {
      const calcMao = Math.round((Number(editPropArv) * 0.70) - Number(editPropRepairs) - Number(editPropFee));
      await onSaveLead({
        id: selectedPropertyLead.id,
        propertyAddress: editPropStreet,
        city: editPropCity,
        state: editPropState,
        zip: editPropZip,
        dealType: editPropDealType,
        govListType: editPropDealType === 'OFF_MARKET_GOV' ? editPropGovListType : undefined,
        beds: Number(editPropBeds) || 0,
        baths: Number(editPropBaths) || 0,
        sqft: Number(editPropSqft) || 0,
        yearBuilt: Number(editPropYearBuilt) || undefined,
        occupancyStatus: editPropOccupancy,
        imageUrl: editPropImageUrl.trim() || selectedPropertyLead.imageUrl,
        pdfAgreementUrl: editPropPdfUrl.trim() || undefined,
        stage: editPropStage,
        valuation: {
          ...selectedPropertyLead.valuation,
          listPrice: Number(editPropAskingPrice) || 0,
          estimatedArv: Number(editPropArv) || 0,
          repairEstimate: Number(editPropRepairs) || 0,
          desiredWholesaleFee: Number(editPropFee) || 15000,
          calculatedMao: calcMao,
          askingMaoGap: (Number(editPropAskingPrice) || 0) - calcMao,
        },
        mctp: {
          ...selectedPropertyLead.mctp,
          motivation: editPropMotivation,
          condition: editPropCondition,
          timeline: editPropTimeline,
          askingPrice: Number(editPropAskingPrice) || 0,
          sellerNetTarget: Number(editPropNetTarget) || 0,
        },
      });
      setIsEditingSelectedProperty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPropertyEdits(false);
    }
  };

  // Calculate live MAO for Quick Property form
  const calculatedQuickMao = useMemo(() => {
    const arv = Number(quickPropertyArv) || 0;
    const repairs = Number(quickPropertyRepairs) || 0;
    const discountPct = (Number(quickPropertyDiscountPct) || 70) / 100;
    const fee = Number(quickPropertyFee) || 15000;
    if (!arv) return 0;
    return Math.max(0, Math.round(arv * discountPct - repairs - fee));
  }, [quickPropertyArv, quickPropertyRepairs, quickPropertyDiscountPct, quickPropertyFee]);

  const handleSaveQuickProperty = async () => {
    if (!quickPropertyStreet.trim()) {
      alert('Please enter a street address for the new property.');
      return;
    }
    if (!quickPropertyZip.trim()) {
      alert('Please enter a zip code.');
      return;
    }
    setIsCreatingQuickProperty(true);
    try {
      const fullStreetAddress = quickPropertyStreet.trim();
      const fullAddress = `${fullStreetAddress}${
        quickPropertyUnit.trim() ? ' ' + quickPropertyUnit.trim() : ''
      }`;
      let createdLead: Lead | void | null = null;
      const askingPriceVal = Number(quickPropertyAskingPrice) || 0;
      if (quickPropertySyncPipeline && onSaveLead) {
        createdLead = await onSaveLead({
          dealType: quickPropertyDealType,
          govListType: quickPropertyDealType === 'OFF_MARKET_GOV' ? quickPropertyGovListType : undefined,
          propertyAddress: fullAddress,
          city: quickPropertyCity || 'Springfield',
          state: quickPropertyState || 'IL',
          zip: quickPropertyZip || '62704',
          territoryId: quickPropertyTerritoryId || undefined,
          stage: quickPropertyPipelineStage || (quickPropertyDealType === 'OFF_MARKET_GOV' ? (quickPropertyIsMctpQualified ? 'MCTP_QUALIFIED' : 'NEW') : 'NEW'),
          contactName: `${quickPropertyContactFirstName} ${quickPropertyContactLastName}`.trim() || 'Unspecified Seller',
          contactFirstName: quickPropertyContactFirstName || '',
          contactLastName: quickPropertyContactLastName || '',
          contactPhone: quickPropertyContactPhone || currentContact.phone || '',
          contactRole: quickPropertyContactRole || currentContact.role || (quickPropertyDealType === 'OFF_MARKET_GOV' ? 'DIRECT_SELLER' : 'LISTING_AGENT'),
          valuation: {
            listPrice: askingPriceVal,
            estimatedArv: Number(quickPropertyArv) || 0,
            repairEstimate: Number(quickPropertyRepairs) || 0,
            calculatedMao: calculatedQuickMao,
            askingMaoGap: askingPriceVal - calculatedQuickMao,
          },
          mctp: {
            motivation: quickPropertyMctpMotivation || 'Phone Call Intake',
            condition: quickPropertyMctpCondition || `Repairs estimated at $${(Number(quickPropertyRepairs) || 0).toLocaleString()}`,
            timeline: quickPropertyMctpTimeline || 'Immediate',
            askingPrice: askingPriceVal,
            sellerNetTarget: Number(quickPropertyMctpNetTarget) || 0,
            qualifiedDate: new Date().toISOString(),
            isQualified: quickPropertyIsMctpQualified,
          },
          imageUrl: quickPropertyImages[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
          pdfAgreementUrl: quickPropertyAttachments.find(a => a.fileType === 'CONTRACT' || a.name.toLowerCase().includes('contract') || a.name.toLowerCase().includes('agreement'))?.url || undefined,
          createdDate: new Date().toISOString().split('T')[0],
        });
      }
      if (onCreateProperty) {
        await onCreateProperty({
          streetAddress: fullStreetAddress,
          unit: quickPropertyUnit.trim() || undefined,
          city: quickPropertyCity || 'Springfield',
          state: quickPropertyState || 'IL',
          zip: quickPropertyZip || '62704',
          territoryId: quickPropertyTerritoryId || undefined,
          propertyType: quickPropertyType,
          beds: Number(quickPropertyBeds) || 0,
          baths: Number(quickPropertyBaths) || 0,
          sqft: Number(quickPropertySqft) || 0,
          yearBuilt: Number(quickPropertyYearBuilt) || 0,
          occupancyStatus: quickPropertyOccupancy,
          askingPrice: Number(quickPropertyAskingPrice) || 0,
          estimatedArv: Number(quickPropertyArv) || 0,
          estimatedRepairs: Number(quickPropertyRepairs) || 0,
          maoDiscountPercent: quickPropertyDiscountPct,
          maoWholesaleFee: quickPropertyFee,
          isLandDeal: quickPropertyIsLand,
          acreage: Number(quickPropertyAcreage) || undefined,
          hasMultipleStructures: quickPropertyHasMultiStructures,
          leadId: createdLead ? (createdLead as Lead).id : undefined,
          images: quickPropertyImages.length > 0 ? quickPropertyImages : ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'],
          attachments: quickPropertyAttachments,
        });
      }
      if (createdLead && (createdLead as Lead).id) {
        setAssociatedLeadId((createdLead as Lead).id);
      }
      // Suggest the contact upward instead of setting parent state directly
      if (quickPropertyContactFirstName || quickPropertyContactPhone) {
        onContactSuggestion({
          firstName: quickPropertyContactFirstName,
          lastName: quickPropertyContactLastName,
          phone: quickPropertyContactPhone,
          role: quickPropertyContactRole,
        });
      }
      setIsQuickAddPropertyOpen(false);
      setPropertySearchQuery('');
    } catch (err: any) {
      console.error('Error creating property in call log:', err);
      alert('Failed to create property. Please check inputs and try again.');
    } finally {
      setIsCreatingQuickProperty(false);
    }
  };

  // Filter leads/properties based on user search query
  const filteredLeads = useMemo(() => {
    if (!propertySearchQuery.trim()) return leads;
    const q = propertySearchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        l.propertyAddress.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        l.zip.includes(q) ||
        (l.contactName && l.contactName.toLowerCase().includes(q))
    );
  }, [leads, propertySearchQuery]);

  // Selected Lead object
  const selectedPropertyLead = useMemo(() => {
    return leads.find((l) => l.id === associatedLeadId);
  }, [leads, associatedLeadId]);

  // Derived Property Images for Gallery & Lightbox
  const displayPhotos = useMemo(() => {
    if (!selectedPropertyLead) return [];
    const matchingProp = properties.find(
      (p) =>
        p.leadId === selectedPropertyLead.id ||
        (p.streetAddress && p.streetAddress.toLowerCase() === selectedPropertyLead.propertyAddress?.toLowerCase())
    );
    if (matchingProp?.images && matchingProp.images.length > 0) {
      return matchingProp.images;
    }
    const baseImage = selectedPropertyLead.imageUrl || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80';
    return [
      baseImage,
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=800&q=80',
    ];
  }, [selectedPropertyLead, properties]);

  // Derived Property Attachments / Documents
  const displayAttachments = useMemo(() => {
    if (!selectedPropertyLead) return [];
    const matchingProp = properties.find(
      (p) =>
        p.leadId === selectedPropertyLead.id ||
        (p.streetAddress && p.streetAddress.toLowerCase() === selectedPropertyLead.propertyAddress?.toLowerCase())
    );
    if (matchingProp?.attachments && matchingProp.attachments.length > 0) {
      return matchingProp.attachments;
    }
    return [
      ...(selectedPropertyLead.pdfAgreementUrl
        ? [
            {
              id: 'pdf-1',
              name: 'Purchase_and_Sale_Agreement.pdf',
              url: selectedPropertyLead.pdfAgreementUrl,
              fileType: 'PDF' as const,
              uploadedAt: 'Recent',
            },
          ]
        : []),
      {
        id: 'att-1',
        name: 'Skip_Trace_Contact_Report.pdf',
        url: '#',
        fileType: 'PDF' as const,
        uploadedAt: '2026-08-01',
      },
      {
        id: 'att-2',
        name: 'Property_Inspection_Overview.pdf',
        url: '#',
        fileType: 'PDF' as const,
        uploadedAt: '2026-07-28',
      },
      {
        id: 'att-3',
        name: 'Title_Search_EMD_Receipt.pdf',
        url: '#',
        fileType: 'CONTRACT' as const,
        uploadedAt: '2026-07-25',
      },
    ];
  }, [selectedPropertyLead, properties]);

  // Derived Call Logs for this specific Property
  const displayCallLogs = useMemo(() => {
    if (!selectedPropertyLead) return [];
    return callLogs.filter(
      (c) =>
        c.leadId === selectedPropertyLead.id ||
        (c.leadAddress &&
          selectedPropertyLead.propertyAddress &&
          c.leadAddress.toLowerCase().includes(selectedPropertyLead.propertyAddress.toLowerCase()))
    );
  }, [selectedPropertyLead, callLogs]);

  return (
    <>
      {/* 1. SEARCHABLE LINK TO PROPERTY / LEAD */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <Home className="w-4 h-4 text-amber-400" /> Link to Property / Lead (Searchable)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsQuickAddPropertyOpen(!isQuickAddPropertyOpen)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                isQuickAddPropertyOpen
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              {isQuickAddPropertyOpen ? 'Close Property Form' : '+ Quick Add Property'}
            </button>
            {associatedLeadId && (
              <button
                type="button"
                onClick={() => {
                  setAssociatedLeadId('');
                  setPropertySearchQuery('');
                }}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
              >
                <X className="w-3.5 h-3.5" /> Unlink
              </button>
            )}
          </div>
        </div>
        {/* Selected Property Display Badge & Live Property Dossier HUD */}
        {selectedPropertyLead ? (
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl overflow-hidden shadow-2xl transition-all">
            {/* 1. TOP HEADER BANNER */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-[280px]">
                {/* Thumbnail Image with Photo Counter */}
                <div
                  onClick={() => {
                    setLightboxImageIndex(0);
                    setLightboxImageUrl(displayPhotos[0]);
                  }}
                  className="relative w-14 h-14 rounded-lg overflow-hidden border border-amber-500/40 cursor-pointer group shadow-md shrink-0"
                >
                  <img
                    src={displayPhotos[0] || selectedPropertyLead.imageUrl}
                    alt={selectedPropertyLead.propertyAddress}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[9px] font-bold text-amber-300 px-1 rounded font-mono">
                    📷 {displayPhotos.length}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-white text-sm">
                      {selectedPropertyLead.propertyAddress}
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedPropertyLead.stage.replace(/_/g, ' ')}
                    </span>
                    {selectedPropertyLead.dealType && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        {selectedPropertyLead.dealType === 'OFF_MARKET_GOV' ? '🏛️ Off-Market' : '🏢 On-Market'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-2">
                    <span>{selectedPropertyLead.city}, {selectedPropertyLead.state} {selectedPropertyLead.zip}</span>
                    <span>•</span>
                    <span>Asking: <strong className="text-emerald-400 font-mono">${(selectedPropertyLead.mctp?.askingPrice || selectedPropertyLead.valuation?.listPrice || 0).toLocaleString()}</strong></span>
                  </p>
                  {/* Specs Pill Summary */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 font-medium">
                      🛏️ {selectedPropertyLead.beds || 3}b / 🛁 {selectedPropertyLead.baths || 2}ba
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 font-mono">
                      📐 {(selectedPropertyLead.sqft || 1800).toLocaleString()} sqft
                    </span>
                    {selectedPropertyLead.yearBuilt && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 font-mono">
                        🔨 {selectedPropertyLead.yearBuilt}
                      </span>
                    )}
                    {selectedPropertyLead.isLandDeal && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/30 font-bold">
                        🌳 {selectedPropertyLead.acreage || 1} Acres
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Top Right Action Controls */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingSelectedProperty) {
                      setIsEditingSelectedProperty(false);
                    } else {
                      handleStartEditingProperty(selectedPropertyLead);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isEditingSelectedProperty
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingSelectedProperty ? 'Close Edit' : 'Edit Property Info'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPropertyDossierExpanded(!isPropertyDossierExpanded)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isPropertyDossierExpanded ? 'Hide Dossier' : '🔍 View Property Dossier HUD'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssociatedLeadId('');
                    setPropertySearchQuery('');
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-950 rounded-lg border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer"
                  title="Unlink Property"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* INLINE PROPERTY INFO EDIT FORM */}
            {isEditingSelectedProperty && (
              <div className="p-4 bg-slate-950 border-t border-amber-500/40 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Edit Property Details & Wholesale Financials
                  </span>
                  <span className="text-[10px] text-slate-400">Updating Live Lead Database</span>
                </div>
                {/* Street & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Property Street Address</span>
                    <input
                      type="text"
                      value={editPropStreet}
                      onChange={(e) => setEditPropStreet(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">City</span>
                    <input
                      type="text"
                      value={editPropCity}
                      onChange={(e) => setEditPropCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">State & Zip</span>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={editPropState}
                        onChange={(e) => setEditPropState(e.target.value)}
                        className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editPropZip}
                        onChange={(e) => setEditPropZip(e.target.value)}
                        className="w-2/3 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                {/* Market Type & Pipeline Stage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 uppercase block mb-0.5">Deal Type</span>
                    <select
                      value={editPropDealType}
                      onChange={(e) => setEditPropDealType(e.target.value as PipelineType)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-amber-300 font-bold focus:outline-none"
                    >
                      <option value="OFF_MARKET_GOV">🏛️ Off-Market (Direct / Gov / Distressed)</option>
                      <option value="ON_MARKET">🏢 On-Market (MLS Listed Agent Deal)</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 uppercase block mb-0.5">Pipeline Stage</span>
                    <select
                      value={editPropStage}
                      onChange={(e) => setEditPropStage(e.target.value as LeadStage)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-emerald-300 font-bold focus:outline-none"
                    >
                      <option value="GOV_LIST_PULLED">Gov List Pulled</option>
                      <option value="SKIP_TRACED">Skip-Traced</option>
                      <option value="NEW">New On-Market</option>
                      <option value="CONTACTED">Contacted / Working</option>
                      <option value="MCTP_QUALIFIED">MCTP Qualified</option>
                      <option value="VALUING">Valuation & MAO</option>
                      <option value="OFFER_SENT_PDF">Offer Sent (PDF / LOI)</option>
                      <option value="TITLE_EMD_SUBMITTED">Under Contract & Title</option>
                      <option value="DISPO_BUYER_ASSIGNED">Cash Buyer Dispo</option>
                      <option value="CLOSED">Closed / Fee Collected</option>
                    </select>
                  </div>
                </div>
                {/* Specs & Financials */}
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block">
                    📊 Specs, Financials & Live 70% MAO
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Beds / Baths</span>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={editPropBeds}
                          onChange={(e) => setEditPropBeds(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Beds"
                          className="w-1/2 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-bold"
                        />
                        <input
                          type="number"
                          value={editPropBaths}
                          onChange={(e) => setEditPropBaths(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Baths"
                          className="w-1/2 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Asking / List Price ($)</span>
                      <input
                        type="number"
                        value={editPropAskingPrice}
                        onChange={(e) => setEditPropAskingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Estimated ARV ($)</span>
                      <input
                        type="number"
                        value={editPropArv}
                        onChange={(e) => setEditPropArv(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Repair Estimate ($)</span>
                      <input
                        type="number"
                        value={editPropRepairs}
                        onChange={(e) => setEditPropRepairs(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-amber-500/30 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-300">
                      Calculated 70% MAO: <strong className="text-amber-400 font-extrabold">${Math.round(((Number(editPropArv) || 0) * 0.70) - (Number(editPropRepairs) || 0) - editPropFee).toLocaleString()}</strong>
                    </span>
                    <span className="text-slate-400 text-[10px]">(ARV × 70%) - Repairs - ${editPropFee.toLocaleString()} Fee</span>
                  </div>
                </div>
                {/* MCTP Motivation & Notes */}
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block">
                    🔥 MCTP Motivation & Condition
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Seller Motivation Notes</span>
                      <input
                        type="text"
                        value={editPropMotivation}
                        onChange={(e) => setEditPropMotivation(e.target.value)}
                        placeholder="Why selling?"
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Condition Notes</span>
                      <input
                        type="text"
                        value={editPropCondition}
                        onChange={(e) => setEditPropCondition(e.target.value)}
                        placeholder="Roof, HVAC, repairs..."
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Purchase Contract / LOI PDF URL</span>
                      <input
                        type="text"
                        value={editPropPdfUrl}
                        onChange={(e) => setEditPropPdfUrl(e.target.value)}
                        placeholder="https://.../Agreement.pdf"
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-emerald-300 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Main Property Photo URL</span>
                      <input
                        type="text"
                        value={editPropImageUrl}
                        onChange={(e) => setEditPropImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-sky-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingSelectedProperty(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSavingPropertyEdits}
                    onClick={handleSavePropertyEdits}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    {isSavingPropertyEdits ? 'Saving...' : '✨ Save Property Updates'}
                  </button>
                </div>
              </div>
            )}
            {/* 2. EXPANDABLE PROPERTY DOSSIER HUB WITH 1-CLICK TABS */}
            {isPropertyDossierExpanded && (
              <div className="p-3.5 space-y-3 bg-slate-950">
                {/* Navigation Tabs Bar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setActivePropertyTab('mctp')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePropertyTab === 'mctp'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>🔥 MCTP 4-Pillars</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePropertyTab('financials')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePropertyTab === 'financials'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>💰 MAO & Valuation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePropertyTab('specs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePropertyTab === 'specs'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>🏡 Specs & Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePropertyTab('photos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePropertyTab === 'photos'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>📸 Photos ({displayPhotos.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePropertyTab('docs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePropertyTab === 'docs'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>📄 Files & Contracts ({displayAttachments.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePropertyTab('calls')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePropertyTab === 'calls'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>📞 Call History ({displayCallLogs.length})</span>
                  </button>
                </div>
                {/* TAB 1: MCTP 4-PILLARS */}
                {activePropertyTab === 'mctp' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block mb-1">
                        1. Motivation (Why Selling?)
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {selectedPropertyLead.mctp?.motivation || selectedPropertyLead.notes || 'No motivation notes recorded yet. Ask the seller on this call!'}
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block mb-1">
                        2. Property Condition & Repairs Needed
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {selectedPropertyLead.mctp?.condition || `Estimated Repairs: $${(selectedPropertyLead.valuation?.repairEstimate || 25000).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block mb-1">
                        3. Seller Timeline to Close
                      </span>
                      <p className="text-xs text-slate-200 font-bold font-mono">
                        ⏱️ {selectedPropertyLead.mctp?.timeline || '14 - 30 Days (Flexible)'}
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block mb-1">
                        4. Price & Seller Net Target
                      </span>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Asking Price</span>
                          <span className="text-white font-mono font-extrabold">
                            ${(selectedPropertyLead.mctp?.askingPrice || selectedPropertyLead.valuation?.listPrice || 0).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Seller Net Target</span>
                          <span className="text-emerald-300 font-mono font-extrabold">
                            ${(selectedPropertyLead.mctp?.sellerNetTarget || selectedPropertyLead.valuation?.calculatedMao || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* TAB 2: FINANCIALS & MAO CALCULATOR */}
                {activePropertyTab === 'financials' && (
                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-slate-950 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Asking / List Price</span>
                        <strong className="text-white font-mono font-bold text-sm">
                          ${(selectedPropertyLead.valuation?.listPrice || selectedPropertyLead.mctp?.askingPrice || 0).toLocaleString()}
                        </strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">After Repair Value (ARV)</span>
                        <strong className="text-amber-300 font-mono font-bold text-sm">
                          ${(selectedPropertyLead.valuation?.estimatedArv || 250000).toLocaleString()}
                        </strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Est. Repair Cost</span>
                        <strong className="text-rose-400 font-mono font-bold text-sm">
                          -${(selectedPropertyLead.valuation?.repairEstimate || 30000).toLocaleString()}
                        </strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-emerald-500/40 bg-emerald-500/10">
                        <span className="text-[10px] text-emerald-400 font-bold block">Calculated Wholesale MAO</span>
                        <strong className="text-emerald-300 font-mono font-extrabold text-sm">
                          ${(selectedPropertyLead.valuation?.calculatedMao || 130000).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                    {/* MAO Formula Display */}
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span>
                        Formula: (<strong className="text-amber-300">${(selectedPropertyLead.valuation?.estimatedArv || 250000).toLocaleString()}</strong> × 70%) - <strong className="text-rose-400">${(selectedPropertyLead.valuation?.repairEstimate || 30000).toLocaleString()}</strong> - <strong className="text-amber-400">$15,000 Fee</strong>
                      </span>
                      <span className="text-emerald-400 font-bold">
                        = ${(selectedPropertyLead.valuation?.calculatedMao || 130000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
                {/* TAB 3: SPECS & DETAILS */}
                {activePropertyTab === 'specs' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-fadeIn">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Beds & Baths</span>
                      <strong className="text-white font-semibold">{selectedPropertyLead.beds || 3} Beds / {selectedPropertyLead.baths || 2} Baths</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Living Area</span>
                      <strong className="text-white font-mono font-semibold">{(selectedPropertyLead.sqft || 1800).toLocaleString()} SqFt</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Year Built</span>
                      <strong className="text-white font-mono font-semibold">{selectedPropertyLead.yearBuilt || '1985'}</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Occupancy Status</span>
                      <strong className="text-amber-300 font-semibold">Vacant / Ready</strong>
                    </div>
                    {selectedPropertyLead.apn && (
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">APN / Parcel ID</span>
                        <strong className="text-slate-200 font-mono">{selectedPropertyLead.apn}</strong>
                      </div>
                    )}
                    {selectedPropertyLead.zoning && (
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Zoning</span>
                        <strong className="text-slate-200">{selectedPropertyLead.zoning}</strong>
                      </div>
                    )}
                  </div>
                )}
                {/* TAB 4: PHOTOS GALLERY */}
                {activePropertyTab === 'photos' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {displayPhotos.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setLightboxImageIndex(idx);
                            setLightboxImageUrl(imgUrl);
                          }}
                          className="relative h-24 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-400 cursor-pointer group transition-all shadow-md"
                        >
                          <img
                            src={imgUrl}
                            alt={`Property photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                            <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-slate-200 px-1 rounded font-mono">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* TAB 5: FILES & CONTRACTS */}
                {activePropertyTab === 'docs' && (
                  <div className="space-y-2 animate-fadeIn">
                    {displayAttachments.map((fileItem) => (
                      <div
                        key={fileItem.id}
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{fileItem.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {fileItem.fileType} • Uploaded: {fileItem.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <a
                          href={fileItem.url !== '#' ? fileItem.url : undefined}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            if (fileItem.url === '#') {
                              e.preventDefault();
                              alert(`Opening document viewer for ${fileItem.name}`);
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          View PDF
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                {/* TAB 6: CALL HISTORY & NOTES */}
                {activePropertyTab === 'calls' && (
                  <div className="space-y-2 animate-fadeIn max-h-52 overflow-y-auto">
                    {displayCallLogs.length > 0 ? (
                      displayCallLogs.map((cLog) => (
                        <div key={cLog.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-amber-300">
                              📞 {cLog.contactName} ({cLog.contactRole?.replace(/_/g, ' ')})
                            </span>
                            <span className="text-slate-400 font-mono">
                              {new Date(cLog.timestamp).toLocaleDateString()} • {cLog.durationSeconds}s
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] italic bg-slate-950 p-2 rounded border border-slate-800">
                            "{cLog.notes || 'No call notes entered.'}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-slate-500 text-xs italic">
                        No previous calls logged for this property. This call will be saved as the first log entry!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Search Input Combobox for Property */
          <div className="relative" ref={propertyDropdownRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={propertySearchQuery}
                onFocus={() => setIsPropertyDropdownOpen(true)}
                onChange={(e) => {
                  setPropertySearchQuery(e.target.value);
                  setIsPropertyDropdownOpen(true);
                }}
                placeholder="Search property address, city, zip code, or lead name..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
              />
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            {/* Property Dropdown List */}
            {isPropertyDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-800">
                <div
                  onClick={() => {
                    setAssociatedLeadId('');
                    setIsPropertyDropdownOpen(false);
                  }}
                  className="p-2.5 hover:bg-slate-800/80 cursor-pointer text-slate-400 hover:text-white font-medium flex items-center justify-between"
                >
                  <span>-- General / Unlinked Contact Call --</span>
                  <X className="w-4 h-4 text-slate-500" />
                </div>
                {/* Prominent Quick Add Option in Dropdown */}
                <div
                  onClick={() => {
                    setIsPropertyDropdownOpen(false);
                    setIsQuickAddPropertyOpen(true);
                  }}
                  className="p-3 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border-y border-amber-500/30 cursor-pointer text-amber-300 font-bold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg group-hover:scale-105 transition-transform font-black">
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs text-amber-200">✨ Create & Add New Property & Wholesale Lead</span>
                      <p className="text-[10px] text-amber-400/80 font-normal">Add address, specs, valuation MAO & seller details on this call</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full uppercase">Quick Add</span>
                </div>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => {
                        setAssociatedLeadId(l.id);
                        setIsPropertyDropdownOpen(false);
                        setPropertySearchQuery('');
                        if (!currentContact.firstName && !currentContact.phone) {
                          let fName = l.contactFirstName || '';
                          let lName = l.contactLastName || '';
                          if (!fName && l.contactName) {
                            const parts = (l.contactName || '').split(' ');
                            fName = parts[0] || '';
                            lName = parts.slice(1).join(' ') || '';
                          }
                          onContactSuggestion({
                            firstName: fName,
                            lastName: lName,
                            phone: l.contactPhone || '',
                            email: l.contactEmail,
                            role: l.contactRole || 'LISTING_AGENT',
                          });
                        }
                      }}
                      className="p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                          <span>{l.propertyAddress}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-amber-300 font-semibold rounded border border-slate-700">
                            {l.city}, {l.state}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          List: ${l.valuation?.listPrice?.toLocaleString() || 'N/A'} • Contact:{' '}
                          {l.contactName || 'N/A'} ({l.contactPhone || 'No phone'})
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        {l.stage.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-500 text-center italic">
                    No matching properties found
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* INLINE QUICK ADD PROPERTY & WHOLESALE LEAD FORM */}
        {isQuickAddPropertyOpen && (
          <div className="mt-3 p-4 bg-slate-900 border-2 border-amber-500/40 rounded-xl space-y-4 shadow-2xl animate-fadeIn">
            {/* Header Banner */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-400 text-sm flex items-center gap-2">
                    Quick Add Property & Wholesale Lead
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 uppercase font-mono">
                      Live Call Intake
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Select market type, enter address, specs, MCTP pillars & valuation MAO to auto-link to call log.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddPropertyOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Deal Type Switcher (Off-Market / On-Market) */}
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Market Deal Type Selector
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuickPropertyDealType('OFF_MARKET_GOV');
                    setQuickPropertyContactRole('DIRECT_SELLER');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    quickPropertyDealType === 'OFF_MARKET_GOV'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  <span>🏛️ Off-Market (Direct / Gov / Distressed)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickPropertyDealType('ON_MARKET');
                    setQuickPropertyContactRole('LISTING_AGENT');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    quickPropertyDealType === 'ON_MARKET'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>🏢 On-Market (MLS Listed Agent Deal)</span>
                </button>
              </div>
              {quickPropertyDealType === 'OFF_MARKET_GOV' && (
                <div className="pt-2">
                  <label className="block text-amber-300 font-bold text-[11px] mb-1">Government / Off-Market List Category *</label>
                  <select
                    value={quickPropertyGovListType}
                    onChange={(e) => setQuickPropertyGovListType(e.target.value as GovListType)}
                    className="w-full bg-slate-900 border border-amber-500/50 p-2 rounded-lg text-amber-300 font-bold text-xs focus:outline-none"
                  >
                    <option value="PROBATE">PROBATE / INHERITED LIST</option>
                    <option value="CODE_VIOLATION">CITY CODE VIOLATIONS</option>
                    <option value="TAX_DELINQUENT">TAX DELINQUENT LIST</option>
                    <option value="WATER_SHUTOFF">WATER SHUTOFF / UTILITY</option>
                    <option value="PRE_FORECLOSURE">PRE-FORECLOSURE / LIS PENDENS</option>
                    <option value="EVICTION">EVICTION COURT FILINGS</option>
                  </select>
                </div>
              )}
            </div>
            {/* 4-Pillars MCTP Engine */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <span>🏛️ Rick & Zach Ginn 4-Pillars MCTP Qualification Engine</span>
                </span>
                <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quickPropertyIsMctpQualified}
                    onChange={(e) => setQuickPropertyIsMctpQualified(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
                  />
                  <span>MCTP Qualified Lead</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-300 font-bold mb-1">1. Motivation (Why selling?)</label>
                  <textarea
                    rows={2}
                    value={quickPropertyMctpMotivation}
                    onChange={(e) => setQuickPropertyMctpMotivation(e.target.value)}
                    placeholder={
                      quickPropertyDealType === 'OFF_MARKET_GOV'
                        ? 'Probate heir wants cash split, code fine, back taxes owed...'
                        : 'Days on market, seller relocating, expired listing, price reduction history...'
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-amber-300 font-bold mb-1">2. Condition (Property Repairs)</label>
                  <textarea
                    rows={2}
                    value={quickPropertyMctpCondition}
                    onChange={(e) => setQuickPropertyMctpCondition(e.target.value)}
                    placeholder="Needs new roof, HVAC replacement, kitchen update, full trash-out..."
                    className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-amber-300 font-bold mb-1">3. Timeline (When do they need to close?)</label>
                  <input
                    type="text"
                    value={quickPropertyMctpTimeline}
                    onChange={(e) => setQuickPropertyMctpTimeline(e.target.value)}
                    placeholder="e.g. 14-30 Days, ASAP, or 60 Days"
                    className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-amber-300 font-bold mb-1">4. Asking Price & Seller Net Target</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={quickPropertyAskingPrice}
                      onChange={(e) => setQuickPropertyAskingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Asking Price ($)"
                      className="bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-white font-bold font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="number"
                      value={quickPropertyMctpNetTarget}
                      onChange={(e) => setQuickPropertyMctpNetTarget(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Net Target ($)"
                      className="bg-slate-900 border border-emerald-500/50 p-2 rounded-lg text-emerald-300 font-bold font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Section 1: Physical Address & Territory */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Physical Address & Territory
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Street Address * (e.g. 742 Evergreen Terrace)"
                    value={quickPropertyStreet}
                    onChange={(e) => setQuickPropertyStreet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Apt / Unit #"
                    value={quickPropertyUnit}
                    onChange={(e) => setQuickPropertyUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={quickPropertyCity}
                  onChange={(e) => setQuickPropertyCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={quickPropertyState}
                  onChange={(e) => setQuickPropertyState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Zip Code *"
                  value={quickPropertyZip}
                  onChange={(e) => setQuickPropertyZip(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                {territories.length > 0 && (
                  <select
                    value={quickPropertyTerritoryId}
                    onChange={(e) => setQuickPropertyTerritoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-300 font-semibold focus:border-amber-400 focus:outline-none col-span-3 sm:col-span-1"
                  >
                    {territories.map((t) => (
                      <option key={t.id} value={t.id}>
                        📍 {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            {/* Section 2: Property Specs & Occupancy */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-amber-400" /> Property Specs & Occupancy
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Property Type</span>
                  <select
                    value={quickPropertyType}
                    onChange={(e) => setQuickPropertyType(e.target.value as PropertyType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="SINGLE_FAMILY">Single Family</option>
                    <option value="MULTI_FAMILY">Multi-Family</option>
                    <option value="MOBILE_HOME">Mobile Home</option>
                    <option value="LAND">Vacant Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Beds</span>
                  <input
                    type="number"
                    value={quickPropertyBeds}
                    onChange={(e) => setQuickPropertyBeds(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Baths</span>
                  <input
                    type="number"
                    step="0.5"
                    value={quickPropertyBaths}
                    onChange={(e) => setQuickPropertyBaths(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">SqFt</span>
                  <input
                    type="number"
                    value={quickPropertySqft}
                    onChange={(e) => setQuickPropertySqft(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Occupancy</span>
                  <select
                    value={quickPropertyOccupancy}
                    onChange={(e) => setQuickPropertyOccupancy(e.target.value as OccupancyStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="VACANT">Vacant</option>
                    <option value="OWNER_OCCUPIED">Owner Occupied</option>
                    <option value="TENANT_OCCUPIED">Tenant Occupied</option>
                  </select>
                </div>
              </div>
              {/* Extra Toggles: Multi-Structure / Vacant Land */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={quickPropertyHasMultiStructures}
                    onChange={(e) => setQuickPropertyHasMultiStructures(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Multiple Structures / Homes on Single Lot?</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={quickPropertyIsLand}
                    onChange={(e) => setQuickPropertyIsLand(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Vacant Land / Acreage?</span>
                </label>
                {quickPropertyIsLand && (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Acreage (e.g. 2.5)"
                    value={quickPropertyAcreage}
                    onChange={(e) => setQuickPropertyAcreage(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 focus:border-amber-400 focus:outline-none"
                  />
                )}
              </div>
            </div>
            {/* Section 3: Financials & MAO Valuation Engine */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Financials & Wholesale MAO Engine
                </label>
                <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Calculated MAO: ${calculatedQuickMao.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Asking Price ($)</span>
                  <input
                    type="number"
                    placeholder="Asking Price"
                    value={quickPropertyAskingPrice}
                    onChange={(e) => setQuickPropertyAskingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Estimated ARV ($)</span>
                  <input
                    type="number"
                    placeholder="ARV"
                    value={quickPropertyArv}
                    onChange={(e) => setQuickPropertyArv(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Estimated Repairs ($)</span>
                  <input
                    type="number"
                    placeholder="Repairs"
                    value={quickPropertyRepairs}
                    onChange={(e) => setQuickPropertyRepairs(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Wholesale Fee ($)</span>
                  <input
                    type="number"
                    value={quickPropertyFee}
                    onChange={(e) => setQuickPropertyFee(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            {/* Section 4: Pipeline Sync */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-400">
                  <input
                    type="checkbox"
                    checked={quickPropertySyncPipeline}
                    onChange={(e) => setQuickPropertySyncPipeline(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span>Sync & Create Wholesale Lead in Pipeline</span>
                </label>
                {quickPropertySyncPipeline && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Stage:</span>
                    <select
                      value={quickPropertyPipelineStage}
                      onChange={(e) => setQuickPropertyPipelineStage(e.target.value as LeadStage)}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                    >
                      <option value="NEW">New Lead In</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="VALUING">Valuing / MCTP</option>
                      <option value="OFFER_SENT">Offer Sent</option>
                      <option value="UNDER_CONTRACT_ACQ">Under Contract</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            {/* Section 5: Property Photos & File Attachments */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" /> 📸 Photos &  Document Attachments
                </label>
                <span className="text-[10px] text-slate-400">
                  {quickPropertyImages.length} Photos • {quickPropertyAttachments.length} Documents
                </span>
              </div>
              {/* 1. Property Images Uploader / URL Manager */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Property Photos (URLs or Sample Gallery)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                    value={newQuickImageUrl}
                    onChange={(e) => setNewQuickImageUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newQuickImageUrl.trim()) {
                        setQuickPropertyImages([...quickPropertyImages, newQuickImageUrl.trim()]);
                        setNewQuickImageUrl('');
                      }
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    + Add Photo
                  </button>
                </div>
                {/* Quick Preset Photo Selectors */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickPropertyImages([
                        ...quickPropertyImages,
                        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
                      ])
                    }
                    className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-700 cursor-pointer"
                  >
                    🏡 Front Exterior
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickPropertyImages([
                        ...quickPropertyImages,
                        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
                      ])
                    }
                    className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-700 cursor-pointer"
                  >
                    🍳 Kitchen
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickPropertyImages([
                        ...quickPropertyImages,
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                      ])
                    }
                    className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-700 cursor-pointer"
                  >
                    🛋️ Living Room
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickPropertyImages([
                        ...quickPropertyImages,
                        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
                      ])
                    }
                    className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-700 cursor-pointer"
                  >
                    🛏️ Bedroom
                  </button>
                </div>
                {/* Image Thumbnails Preview List */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {quickPropertyImages.map((img, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded border border-slate-700 overflow-hidden group shrink-0">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setQuickPropertyImages(quickPropertyImages.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/70 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        title="Remove Photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* 2. File & Document Attachments */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">2. Property Documents & Contracts (PDFs)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Document Name (e.g. Purchase_Agreement.pdf)"
                    value={newQuickDocName}
                    onChange={(e) => setNewQuickDocName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Document URL or Link"
                      value={newQuickDocUrl}
                      onChange={(e) => setNewQuickDocUrl(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newQuickDocName.trim()) {
                          setQuickPropertyAttachments([
                            ...quickPropertyAttachments,
                            {
                              id: `att-${Date.now()}`,
                              name: newQuickDocName.trim(),
                              url: newQuickDocUrl.trim() || '#',
                              fileType: newQuickDocName.toLowerCase().includes('contract') || newQuickDocName.toLowerCase().includes('agreement') ? 'CONTRACT' : 'PDF',
                              uploadedAt: new Date().toISOString().split('T')[0],
                            },
                          ]);
                          setNewQuickDocName('');
                          setNewQuickDocUrl('');
                        }
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      + Attach
                    </button>
                  </div>
                </div>
                {/* Quick Document Templates */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Quick Templates:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickPropertyAttachments([
                        ...quickPropertyAttachments,
                        {
                          id: `att-${Date.now()}`,
                          name: 'Purchase_and_Sale_Agreement.pdf',
                          url: '#',
                          fileType: 'CONTRACT',
                          uploadedAt: new Date().toISOString().split('T')[0],
                        },
                      ])
                    }
                    className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded text-[10px] border border-slate-700 cursor-pointer"
                  >
                    📜 Purchase Contract PDF
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickPropertyAttachments([
                        ...quickPropertyAttachments,
                        {
                          id: `att-${Date.now()}`,
                          name: 'Inspection_Overview_Report.pdf',
                          url: '#',
                          fileType: 'PDF',
                          uploadedAt: new Date().toISOString().split('T')[0],
                        },
                      ])
                    }
                    className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded text-[10px] border border-slate-700 cursor-pointer"
                  >
                    🔍 Inspection Report PDF
                  </button>
                </div>
                {/* Attached Files List */}
                <div className="space-y-1 pt-1">
                  {quickPropertyAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="px-2.5 py-1 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-slate-200 text-[11px] truncate">
                        📄 {att.name} <span className="text-[9px] text-amber-400 font-bold">({att.fileType})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuickPropertyAttachments(quickPropertyAttachments.filter((a) => a.id !== att.id))}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsQuickAddPropertyOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCreatingQuickProperty}
                onClick={handleSaveQuickProperty}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-lg text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                {isCreatingQuickProperty ? 'Creating...' : '✨ Save & Auto-Link Property to Call Log'}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Property Photo Lightbox Modal Overlay */}
      {lightboxImageUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setLightboxImageUrl(null)}
            className="absolute top-4 right-4 p-2.5 bg-slate-800 text-white hover:bg-rose-500 hover:text-white rounded-full transition-colors cursor-pointer shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center space-y-3">
            <img
              src={lightboxImageUrl}
              alt="Property detail photo inspection"
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-amber-500/40"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-4 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-800 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  const newIdx = (lightboxImageIndex - 1 + displayPhotos.length) % displayPhotos.length;
                  setLightboxImageIndex(newIdx);
                  setLightboxImageUrl(displayPhotos[newIdx]);
                }}
                className="p-1.5 bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-950 rounded-full transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold text-amber-300">
                Photo {lightboxImageIndex + 1} of {displayPhotos.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  const newIdx = (lightboxImageIndex + 1) % displayPhotos.length;
                  setLightboxImageIndex(newIdx);
                  setLightboxImageUrl(displayPhotos[newIdx]);
                }}
                className="p-1.5 bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-950 rounded-full transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
