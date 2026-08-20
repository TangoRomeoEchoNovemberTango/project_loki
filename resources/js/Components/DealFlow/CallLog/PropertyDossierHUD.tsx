import React, { useState, useMemo } from 'react';
import {
  X, Clock, Sparkles, FileText, DollarSign, Home, ShieldCheck, Maximize2,
  ChevronLeft, ChevronRight, Edit2,
} from 'lucide-react';
import type { Lead, Property, CallLog, PipelineType, GovListType, LeadStage, OccupancyStatus } from '@/types/dealflow';

interface PropertyDossierHUDProps {
  lead: Lead;
  properties: Property[];
  callLogs: CallLog[];
  onSaveLead?: (leadData: Partial<Lead>) => Promise<Lead | void>;
  onUnlink?: () => void;
}

export const PropertyDossierHUD: React.FC<PropertyDossierHUDProps> = ({ lead, properties, callLogs, onSaveLead, onUnlink }) => {
  const [activeTab, setActiveTab] = useState<'mctp' | 'financials' | 'specs' | 'photos' | 'docs' | 'calls'>('mctp');
  const [isExpanded, setIsExpanded] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editStreet, setEditStreet] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZip, setEditZip] = useState('');
  const [editDealType, setEditDealType] = useState<PipelineType>('OFF_MARKET_GOV');
  const [editGovListType, setEditGovListType] = useState<GovListType>('PROBATE');
  const [editBeds, setEditBeds] = useState<number | ''>(3);
  const [editBaths, setEditBaths] = useState<number | ''>(2);
  const [editSqft, setEditSqft] = useState<number | ''>(1800);
  const [editYearBuilt, setEditYearBuilt] = useState<number | ''>(1985);
  const [editOccupancy, setEditOccupancy] = useState<OccupancyStatus>('VACANT');
  const [editAskingPrice, setEditAskingPrice] = useState<number | ''>(120000);
  const [editArv, setEditArv] = useState<number | ''>(220000);
  const [editRepairs, setEditRepairs] = useState<number | ''>(35000);
  const [editFee, setEditFee] = useState<number>(15000);
  const [editMotivation, setEditMotivation] = useState('');
  const [editCondition, setEditCondition] = useState('');
  const [editTimeline, setEditTimeline] = useState('14-30 Days');
  const [editNetTarget, setEditNetTarget] = useState<number | ''>(95000);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPdfUrl, setEditPdfUrl] = useState('');
  const [editStage, setEditStage] = useState<LeadStage>('NEW');

  const startEditing = () => {
    setEditStreet(lead.propertyAddress || '');
    setEditCity(lead.city || '');
    setEditState(lead.state || '');
    setEditZip(lead.zip || '');
    setEditDealType(lead.dealType || 'OFF_MARKET_GOV');
    setEditGovListType(lead.govListType || 'PROBATE');
    setEditBeds(lead.beds || 3);
    setEditBaths(lead.baths || 2);
    setEditSqft(lead.sqft || 1800);
    setEditYearBuilt(lead.yearBuilt || 1985);
    setEditOccupancy(lead.occupancyStatus || 'VACANT');
    setEditAskingPrice(lead.valuation?.listPrice || lead.mctp?.askingPrice || 0);
    setEditArv(lead.valuation?.estimatedArv || 220000);
    setEditRepairs(lead.valuation?.repairEstimate || 35000);
    setEditFee(lead.valuation?.desiredWholesaleFee || 15000);
    setEditMotivation(lead.mctp?.motivation || lead.notes || '');
    setEditCondition(lead.mctp?.condition || '');
    setEditTimeline(lead.mctp?.timeline || '14-30 Days');
    setEditNetTarget(lead.mctp?.sellerNetTarget || 0);
    setEditImageUrl(lead.imageUrl || '');
    setEditPdfUrl(lead.pdfAgreementUrl || '');
    setEditStage(lead.stage || 'NEW');
    setIsEditing(true);
  };

  const saveEdits = async () => {
    if (!onSaveLead) return;
    setIsSaving(true);
    try {
      const calcMao = Math.round((Number(editArv) * 0.70) - Number(editRepairs) - Number(editFee));
      await onSaveLead({
        id: lead.id,
        propertyAddress: editStreet,
        city: editCity,
        state: editState,
        zip: editZip,
        dealType: editDealType,
        govListType: editDealType === 'OFF_MARKET_GOV' ? editGovListType : undefined,
        beds: Number(editBeds) || 0,
        baths: Number(editBaths) || 0,
        sqft: Number(editSqft) || 0,
        yearBuilt: Number(editYearBuilt) || undefined,
        occupancyStatus: editOccupancy,
        imageUrl: editImageUrl.trim() || lead.imageUrl,
        pdfAgreementUrl: editPdfUrl.trim() || undefined,
        stage: editStage,
        valuation: {
          ...lead.valuation,
          listPrice: Number(editAskingPrice) || 0,
          estimatedArv: Number(editArv) || 0,
          repairEstimate: Number(editRepairs) || 0,
          desiredWholesaleFee: Number(editFee) || 15000,
          calculatedMao: calcMao,
          askingMaoGap: (Number(editAskingPrice) || 0) - calcMao,
        },
        mctp: {
          ...lead.mctp,
          motivation: editMotivation,
          condition: editCondition,
          timeline: editTimeline,
          askingPrice: Number(editAskingPrice) || 0,
          sellerNetTarget: Number(editNetTarget) || 0,
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const displayPhotos = useMemo(() => {
    const matchingProp = properties.find(
      (p) => p.leadId === lead.id || (p.streetAddress && p.streetAddress.toLowerCase() === lead.propertyAddress?.toLowerCase())
    );
    if (matchingProp?.images && matchingProp.images.length > 0) return matchingProp.images;
    const base = lead.imageUrl || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80';
    return [
      base,
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=800&q=80',
    ];
  }, [lead, properties]);

  const displayAttachments = useMemo(() => {
    const matchingProp = properties.find(
      (p) => p.leadId === lead.id || (p.streetAddress && p.streetAddress.toLowerCase() === lead.propertyAddress?.toLowerCase())
    );
    if (matchingProp?.attachments && matchingProp.attachments.length > 0) return matchingProp.attachments;
    return [
      ...(lead.pdfAgreementUrl ? [{ id: 'pdf-1', name: 'Purchase_and_Sale_Agreement.pdf', url: lead.pdfAgreementUrl, fileType: 'PDF' as const, uploadedAt: 'Recent' }] : []),
      { id: 'att-1', name: 'Skip_Trace_Contact_Report.pdf', url: '#', fileType: 'PDF' as const, uploadedAt: '2026-08-01' },
      { id: 'att-2', name: 'Property_Inspection_Overview.pdf', url: '#', fileType: 'PDF' as const, uploadedAt: '2026-07-28' },
      { id: 'att-3', name: 'Title_Search_EMD_Receipt.pdf', url: '#', fileType: 'CONTRACT' as const, uploadedAt: '2026-07-25' },
    ];
  }, [lead, properties]);

  const displayCallLogs = useMemo(() => {
    return callLogs.filter(
      (c) => c.leadId === lead.id || (c.leadAddress && lead.propertyAddress && c.leadAddress.toLowerCase().includes(lead.propertyAddress.toLowerCase()))
    );
  }, [lead, callLogs]);

  return (
    <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl overflow-hidden shadow-2xl transition-all">
      {/* TOP HEADER BANNER */}
      <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-[280px]">
          <div
            onClick={() => { setLightboxIndex(0); setLightboxUrl(displayPhotos[0]); }}
            className="relative w-14 h-14 rounded-lg overflow-hidden border border-amber-500/40 cursor-pointer group shadow-md shrink-0"
          >
            <img src={displayPhotos[0] || lead.imageUrl} alt={lead.propertyAddress} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Maximize2 className="w-4 h-4 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </div>
            <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[9px] font-bold text-amber-300 px-1 rounded font-mono">📷 {displayPhotos.length}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-white text-sm">{lead.propertyAddress}</h4>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{lead.stage.replace(/_/g, ' ')}</span>
              {lead.dealType && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {lead.dealType === 'OFF_MARKET_GOV' ? '🏛️ Off-Market' : '🏢 On-Market'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-2">
              <span>{lead.city}, {lead.state} {lead.zip}</span>
              <span>•</span>
              <span>Asking: <strong className="text-emerald-400 font-mono">${(lead.mctp?.askingPrice || lead.valuation?.listPrice || 0).toLocaleString()}</strong></span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 font-medium">🛏️ {lead.beds || 3}b / 🛁 {lead.baths || 2}ba</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 font-mono">📐 {(lead.sqft || 1800).toLocaleString()} sqft</span>
              {lead.yearBuilt && <span className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 font-mono">🔨 {lead.yearBuilt}</span>}
              {lead.isLandDeal && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/30 font-bold">🌳 {lead.acreage || 1} Acres</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => (isEditing ? setIsEditing(false) : startEditing())}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isEditing ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/20' : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Close Edit' : 'Edit Property Info'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide Dossier' : '🔍 View Property Dossier HUD'}</span>
          </button>
          {onUnlink && (
            <button type="button" onClick={onUnlink} className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-950 rounded-lg border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer" title="Unlink Property">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* INLINE PROPERTY INFO EDIT FORM */}
      {isEditing && (
        <div className="p-4 bg-slate-950 border-t border-amber-500/40 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Edit Property Details & Wholesale Financials
            </span>
            <span className="text-[10px] text-slate-400">Updating Live Lead Database</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <div className="sm:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Property Street Address</span>
              <input type="text" value={editStreet} onChange={(e) => setEditStreet(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">City</span>
              <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">State & Zip</span>
              <div className="flex gap-1">
                <input type="text" value={editState} onChange={(e) => setEditState(e.target.value)} className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none" />
                <input type="text" value={editZip} onChange={(e) => setEditZip(e.target.value)} className="w-2/3 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase block mb-0.5">Deal Type</span>
              <select value={editDealType} onChange={(e) => setEditDealType(e.target.value as PipelineType)} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-amber-300 font-bold focus:outline-none">
                <option value="OFF_MARKET_GOV">🏛️ Off-Market (Direct / Gov / Distressed)</option>
                <option value="ON_MARKET">🏢 On-Market (MLS Listed Agent Deal)</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase block mb-0.5">Pipeline Stage</span>
              <select value={editStage} onChange={(e) => setEditStage(e.target.value as LeadStage)} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-emerald-300 font-bold focus:outline-none">
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
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block">📊 Specs, Financials & Live 70% MAO</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Beds / Baths</span>
                <div className="flex gap-1">
                  <input type="number" value={editBeds} onChange={(e) => setEditBeds(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Beds" className="w-1/2 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-bold" />
                  <input type="number" value={editBaths} onChange={(e) => setEditBaths(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Baths" className="w-1/2 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-bold" />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Asking / List Price ($)</span>
                <input type="number" value={editAskingPrice} onChange={(e) => setEditAskingPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-mono font-bold" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Estimated ARV ($)</span>
                <input type="number" value={editArv} onChange={(e) => setEditArv(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-mono font-bold" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Repair Estimate ($)</span>
                <input type="number" value={editRepairs} onChange={(e) => setEditRepairs(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-mono font-bold" />
              </div>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-amber-500/30 flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-300">Calculated 70% MAO: <strong className="text-amber-400 font-extrabold">${Math.round(((Number(editArv) || 0) * 0.70) - (Number(editRepairs) || 0) - editFee).toLocaleString()}</strong></span>
              <span className="text-slate-400 text-[10px]">(ARV × 70%) - Repairs - ${editFee.toLocaleString()} Fee</span>
            </div>
          </div>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block">🔥 MCTP Motivation & Condition</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Seller Motivation Notes</span>
                <input type="text" value={editMotivation} onChange={(e) => setEditMotivation(e.target.value)} placeholder="Why selling?" className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Condition Notes</span>
                <input type="text" value={editCondition} onChange={(e) => setEditCondition(e.target.value)} placeholder="Roof, HVAC, repairs..." className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Purchase Contract / LOI PDF URL</span>
                <input type="text" value={editPdfUrl} onChange={(e) => setEditPdfUrl(e.target.value)} placeholder="https://.../Agreement.pdf" className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-emerald-300 font-mono" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Main Property Photo URL</span>
                <input type="text" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-sky-300 font-mono" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer">Cancel</button>
            <button type="button" disabled={isSaving} onClick={saveEdits} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {isSaving ? 'Saving...' : '✨ Save Property Updates'}
            </button>
          </div>
        </div>
      )}

      {/* EXPANDABLE DOSSIER HUB */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 bg-slate-950">
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-800 pb-2">
            {([
              { id: 'mctp', icon: <ShieldCheck className="w-3.5 h-3.5" />, label: '🔥 MCTP 4-Pillars' },
              { id: 'financials', icon: <DollarSign className="w-3.5 h-3.5" />, label: '💰 MAO & Valuation' },
              { id: 'specs', icon: <Home className="w-3.5 h-3.5" />, label: '🏡 Specs & Details' },
              { id: 'photos', icon: <Maximize2 className="w-3.5 h-3.5" />, label: `📸 Photos (${displayPhotos.length})` },
              { id: 'docs', icon: <FileText className="w-3.5 h-3.5" />, label: `📄 Files & Contracts (${displayAttachments.length})` },
              { id: 'calls', icon: <Clock className="w-3.5 h-3.5" />, label: `📞 Call History (${displayCallLogs.length})` },
            ] as { id: 'mctp' | 'financials' | 'specs' | 'photos' | 'docs' | 'calls'; icon: React.ReactNode; label: string }[]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === t.id ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'mctp' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block mb-1">1. Motivation (Why Selling?)</span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{lead.mctp?.motivation || lead.notes || 'No motivation notes recorded yet. Ask the seller on this call!'}</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block mb-1">2. Property Condition & Repairs Needed</span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{lead.mctp?.condition || `Estimated Repairs: $${(lead.valuation?.repairEstimate || 25000).toLocaleString()}`}</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block mb-1">3. Seller Timeline to Close</span>
                <p className="text-xs text-slate-200 font-bold font-mono">⏱️ {lead.mctp?.timeline || '14 - 30 Days (Flexible)'}</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide block mb-1">4. Price & Seller Net Target</span>
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Asking Price</span>
                    <span className="text-white font-mono font-extrabold">${(lead.mctp?.askingPrice || lead.valuation?.listPrice || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Seller Net Target</span>
                    <span className="text-emerald-300 font-mono font-extrabold">${(lead.mctp?.sellerNetTarget || lead.valuation?.calculatedMao || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-3 animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Asking / List Price</span>
                  <strong className="text-white font-mono font-bold text-sm">${(lead.valuation?.listPrice || lead.mctp?.askingPrice || 0).toLocaleString()}</strong>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">After Repair Value (ARV)</span>
                  <strong className="text-amber-300 font-mono font-bold text-sm">${(lead.valuation?.estimatedArv || 250000).toLocaleString()}</strong>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Est. Repair Cost</span>
                  <strong className="text-rose-400 font-mono font-bold text-sm">-${(lead.valuation?.repairEstimate || 30000).toLocaleString()}</strong>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-emerald-500/40 bg-emerald-500/10">
                  <span className="text-[10px] text-emerald-400 font-bold block">Calculated Wholesale MAO</span>
                  <strong className="text-emerald-300 font-mono font-extrabold text-sm">${(lead.valuation?.calculatedMao || 130000).toLocaleString()}</strong>
                </div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span>Formula: (<strong className="text-amber-300">${(lead.valuation?.estimatedArv || 250000).toLocaleString()}</strong> × 70%) - <strong className="text-rose-400">${(lead.valuation?.repairEstimate || 30000).toLocaleString()}</strong> - <strong className="text-amber-400">$15,000 Fee</strong></span>
                <span className="text-emerald-400 font-bold">= ${(lead.valuation?.calculatedMao || 130000).toLocaleString()}</span>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-fadeIn">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Beds & Baths</span>
                <strong className="text-white font-semibold">{lead.beds || 3} Beds / {lead.baths || 2} Baths</strong>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Living Area</span>
                <strong className="text-white font-mono font-semibold">{(lead.sqft || 1800).toLocaleString()} SqFt</strong>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Year Built</span>
                <strong className="text-white font-mono font-semibold">{lead.yearBuilt || '1985'}</strong>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Occupancy Status</span>
                <strong className="text-amber-300 font-semibold">Vacant / Ready</strong>
              </div>
              {lead.apn && (
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">APN / Parcel ID</span>
                  <strong className="text-slate-200 font-mono">{lead.apn}</strong>
                </div>
              )}
              {lead.zoning && (
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Zoning</span>
                  <strong className="text-slate-200">{lead.zoning}</strong>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {displayPhotos.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setLightboxIndex(idx); setLightboxUrl(imgUrl); }}
                    className="relative h-24 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-400 cursor-pointer group transition-all shadow-md"
                  >
                    <img src={imgUrl} alt={`Property photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-slate-200 px-1 rounded font-mono">#{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-2 animate-fadeIn">
              {displayAttachments.map((fileItem) => (
                <div key={fileItem.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded"><FileText className="w-4 h-4" /></div>
                    <div>
                      <p className="font-bold text-white">{fileItem.name}</p>
                      <p className="text-[10px] text-slate-400">{fileItem.fileType} • Uploaded: {fileItem.uploadedAt}</p>
                    </div>
                  </div>
                  <a
                    href={fileItem.url !== '#' ? fileItem.url : undefined}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => { if (fileItem.url === '#') { e.preventDefault(); alert(`Opening document viewer for ${fileItem.name}`); } }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    View PDF
                  </a>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="space-y-2 animate-fadeIn max-h-52 overflow-y-auto">
              {displayCallLogs.length > 0 ? (
                displayCallLogs.map((cLog) => (
                  <div key={cLog.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-300">📞 {cLog.contactName} ({cLog.contactRole?.replace(/_/g, ' ')})</span>
                      <span className="text-slate-400 font-mono">{new Date(cLog.timestamp).toLocaleDateString()} • {cLog.durationSeconds}s</span>
                    </div>
                    <p className="text-slate-300 text-[11px] italic bg-slate-950 p-2 rounded border border-slate-800">"{cLog.notes || 'No call notes entered.'}"</p>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-slate-500 text-xs italic">No previous calls logged for this property. This call will be saved as the first log entry!</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button type="button" onClick={() => setLightboxUrl(null)} className="absolute top-4 right-4 p-2.5 bg-slate-800 text-white hover:bg-rose-500 hover:text-white rounded-full transition-colors cursor-pointer shadow-lg">
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center space-y-3">
            <img src={lightboxUrl} alt="Property detail photo inspection" className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-amber-500/40" referrerPolicy="no-referrer" />
            <div className="flex items-center gap-4 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-800 shadow-xl">
              <button
                type="button"
                onClick={() => { const n = (lightboxIndex - 1 + displayPhotos.length) % displayPhotos.length; setLightboxIndex(n); setLightboxUrl(displayPhotos[n]); }}
                className="p-1.5 bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-950 rounded-full transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold text-amber-300">Photo {lightboxIndex + 1} of {displayPhotos.length}</span>
              <button
                type="button"
                onClick={() => { const n = (lightboxIndex + 1) % displayPhotos.length; setLightboxIndex(n); setLightboxUrl(displayPhotos[n]); }}
                className="p-1.5 bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-950 rounded-full transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
