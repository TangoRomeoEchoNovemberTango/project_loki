import React, { useState } from 'react';
import {
  X,
  Building2,
  PhoneCall,
  Calculator,
  CalendarClock,
  Sparkles,
  FileText,
  User,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Hammer,
  CheckCircle2,
  Send,
  Users,
  Landmark,
  Download,
  Copy,
  ShieldAlert,
  FileCheck,
  Trash2,
  Edit3,
  Save,
} from 'lucide-react';
import type { Lead, CallLog, Buyer, PropertyValuation, ItemizedRepairs, MCTPQualification, TitleCompanyDetail, LeadStage } from '@/types/dealflow';
import { analyzeValuationWithAI, generateFollowUpMessage } from '@/services/dealflow';
import { downloadFile } from '@/utils/exportUtils';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  callLogs: CallLog[];
  buyers: Buyer[];
  onUpdateLead: (updatedLead: Lead) => Promise<void>;
  onDeleteLead?: (leadId: string) => Promise<void>;
  onOpenDialer: (lead: Lead) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  callLogs,
  buyers,
  onUpdateLead,
  onDeleteLead,
  onOpenDialer,
}) => {
  if (!isOpen || !lead) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'valuation' | 'calls' | 'followup' | 'dispo' | 'offmarket'>(
    lead.dealType === 'OFF_MARKET_GOV' ? 'offmarket' : 'overview'
  );

  // Valuation State
  const [listPrice, setListPrice] = useState<number>(lead.valuation?.listPrice || 250000);
  const [estimatedArv, setEstimatedArv] = useState<number>(lead.valuation?.estimatedArv || 320000);
  const [repairLevel, setRepairLevel] = useState<'LIGHT' | 'MEDIUM' | 'HEAVY' | 'CUSTOM'>(
    lead.valuation?.repairLevel || 'MEDIUM'
  );
  const [repairEstimate, setRepairEstimate] = useState<number>(
    lead.valuation?.repairEstimate || 35000
  );
  const [discountRate, setDiscountRate] = useState<number>(
    lead.valuation?.discountRatePercent || 70
  );
  const [wholesaleFee, setWholesaleFee] = useState<number>(
    lead.valuation?.desiredWholesaleFee || 15000
  );

  // Off-Market MCTP State
  const [mctpMotivation, setMctpMotivation] = useState<string>(
    lead.mctp?.motivation || ''
  );
  const [mctpCondition, setMctpCondition] = useState<string>(
    lead.mctp?.condition || ''
  );
  const [mctpTimeline, setMctpTimeline] = useState<string>(
    lead.mctp?.timeline || ''
  );
  const [mctpAskingPrice, setMctpAskingPrice] = useState<number>(
    lead.mctp?.askingPrice || listPrice
  );
  const [mctpNetTarget, setMctpNetTarget] = useState<number>(
    lead.mctp?.sellerNetTarget || 0
  );
  const [isMctpQualified, setIsMctpQualified] = useState<boolean>(
    lead.mctp?.isQualified ?? true
  );

  // Title Company State
  const [titleCompany, setTitleCompany] = useState<string>(
    lead.titleDetail?.companyName || 'Capital Title & Escrow Co.'
  );
  const [titleOfficer, setTitleOfficer] = useState<string>(
    lead.titleDetail?.officerName || 'Jennifer Hayes'
  );
  const [titleOfficerPhone, setTitleOfficerPhone] = useState<string>(
    lead.titleDetail?.officerPhone || '(217) 555-9900'
  );
  const [emdAmount, setEmdAmount] = useState<number>(
    lead.titleDetail?.emdAmount || 500
  );
  const [emdStatus, setEmdStatus] = useState<'PENDING' | 'DEPOSITED' | 'REFUNDED'>(
    lead.titleDetail?.emdStatus || 'DEPOSITED'
  );
  const [titleStatus, setTitleStatus] = useState<'NOT_STARTED' | 'ORDERED' | 'CLEAR_TITLE' | 'LIEN_ISSUES'>(
    lead.titleDetail?.titleSearchStatus || 'CLEAR_TITLE'
  );

  // Editable Overview State
  const [editAddress, setEditAddress] = useState(lead.propertyAddress);
  const [editCity, setEditCity] = useState(lead.city);
  const [editState, setEditState] = useState(lead.state);
  const [editZip, setEditZip] = useState(lead.zip);
  const [editBeds, setEditBeds] = useState(lead.beds);
  const [editBaths, setEditBaths] = useState(lead.baths);
  const [editSqft, setEditSqft] = useState(lead.sqft);
  const [editYearBuilt, setEditYearBuilt] = useState(lead.yearBuilt);
  const [editContactName, setEditContactName] = useState(lead.contactName);
  const [editContactRole, setEditContactRole] = useState(lead.contactRole);
  const [editContactPhone, setEditContactPhone] = useState(lead.contactPhone);
  const [editContactEmail, setEditContactEmail] = useState(lead.contactEmail);
  const [editStage, setEditStage] = useState<LeadStage>(lead.stage);
  const [editNotes, setEditNotes] = useState(lead.notes || '');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSaveOverviewDetails = async () => {
    const updatedLead: Lead = {
      ...lead,
      propertyAddress: editAddress,
      city: editCity,
      state: editState,
      zip: editZip,
      beds: Number(editBeds),
      baths: Number(editBaths),
      sqft: Number(editSqft),
      yearBuilt: Number(editYearBuilt),
      contactName: editContactName,
      contactRole: editContactRole,
      contactPhone: editContactPhone,
      contactEmail: editContactEmail,
      stage: editStage,
      notes: editNotes,
    };
    await onUpdateLead(updatedLead);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  // Contract PDF Modal
  const [showContractPdf, setShowContractPdf] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  // Recalculate MAO: (ARV * discountRate%) - Repairs - Wholesale Fee
  const calculatedMao = Math.round((estimatedArv * (discountRate / 100)) - repairEstimate - wholesaleFee);
  const askingGap = listPrice - calculatedMao;

  // AI Valuation Analysis State
  const [isAnalyzingValuation, setIsAnalyzingValuation] = useState(false);
  const [aiValuationResult, setAiValuationResult] = useState<any>(null);

  // AI Follow-up Message Generator State
  const [msgFormat, setMsgFormat] = useState<'SMS' | 'EMAIL' | 'LOI' | 'SCRIPT'>('EMAIL');
  const [isGeneratingMsg, setIsGeneratingMsg] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState<string>('');

  // Filter calls linked to this lead
  const leadCalls = callLogs.filter((c) => c.leadId === lead.id);

  // Filter matching buyers for ZIP
  const matchingBuyers = buyers.filter((b) =>
    b.targetZipCodes.includes(lead.zip)
  );

  // Handle saving updated valuation & off-market details
  const handleSaveOffMarketDetails = async () => {
    const updatedMctp: MCTPQualification = {
      motivation: mctpMotivation,
      condition: mctpCondition,
      timeline: mctpTimeline,
      askingPrice: mctpAskingPrice,
      sellerNetTarget: mctpNetTarget,
      isQualified: isMctpQualified,
      qualifiedDate: new Date().toISOString(),
    };

    const updatedTitle: TitleCompanyDetail = {
      companyName: titleCompany,
      officerName: titleOfficer,
      officerPhone: titleOfficerPhone,
      emdAmount,
      emdStatus,
      titleSearchStatus: titleStatus,
    };

    const updatedLead: Lead = {
      ...lead,
      mctp: updatedMctp,
      titleDetail: updatedTitle,
      stage: lead.stage === 'GOV_LIST_PULLED' && isMctpQualified ? 'MCTP_QUALIFIED' : lead.stage,
    };

    await onUpdateLead(updatedLead);
  };

  // Handle saving updated valuation back to lead
  const handleSaveValuation = async () => {
    const updatedValuation: PropertyValuation = {
      listPrice,
      estimatedArv,
      sqft: lead.sqft,
      repairLevel,
      repairEstimate,
      discountRatePercent: discountRate,
      desiredWholesaleFee: wholesaleFee,
      calculatedMao,
      askingMaoGap: askingGap,
    };

    const updatedLead: Lead = {
      ...lead,
      valuation: updatedValuation,
    };

    await onUpdateLead(updatedLead);
  };

  // Run AI Valuation Analysis
  const handleRunAIValuation = async () => {
    setIsAnalyzingValuation(true);
    try {
      const res = await analyzeValuationWithAI({
        propertyAddress: lead.propertyAddress,
        listPrice,
        estimatedArv,
        repairEstimate,
        sqft: lead.sqft,
        beds: lead.beds,
        baths: lead.baths,
        notes: lead.notes,
      });
      setAiValuationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingValuation(false);
    }
  };

  // Generate Followup Msg with AI
  const handleGenerateMsg = async () => {
    setIsGeneratingMsg(true);
    try {
      const msg = await generateFollowUpMessage({
        lead,
        format: msgFormat,
      });
      setGeneratedMsg(msg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingMsg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col overflow-hidden">
        
        {/* Drawer Top Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <img
              src={lead.imageUrl}
              alt={lead.propertyAddress}
              className="w-20 h-20 rounded-xl object-cover border border-slate-800 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">
                  {lead.propertyAddress}
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-full">
                  {lead.stage.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lead.city}, {lead.state} {lead.zip} • {lead.beds} Bed / {lead.baths} Bath • {lead.sqft.toLocaleString()} sqft
              </p>

              <div className="flex items-center space-x-4 mt-2 text-xs">
                <div>
                  <span className="text-slate-400">List: </span>
                  <span className="font-bold text-slate-200">${lead.valuation?.listPrice?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-amber-400 font-semibold">Target MAO: </span>
                  <span className="font-extrabold text-amber-300">${calculatedMao.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenDialer(lead)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-lg text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Log Call</span>
            </button>

            {onDeleteLead && (
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete deal "${lead.propertyAddress}" from your pipeline?`)) {
                    await onDeleteLead(lead.id);
                    onClose();
                  }
                }}
                title="Delete this deal from pipeline"
                className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete Deal</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Tabs Header */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6 overflow-x-auto text-xs font-semibold">
          {lead.dealType === 'OFF_MARKET_GOV' && (
            <button
              onClick={() => setActiveTab('offmarket')}
              className={`py-3 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'offmarket'
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-transparent text-amber-300/80 hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
              <span>🏛️ MCTP & Purchase Contract PDF</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Property & Contact
          </button>
          <button
            onClick={() => setActiveTab('valuation')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'valuation'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Valuation & MAO</span>
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'calls'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Audit Log ({leadCalls.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('followup')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'followup'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>AI Follow-ups & Drip</span>
          </button>
          <button
            onClick={() => setActiveTab('dispo')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dispo'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Dispo Buyers ({matchingBuyers.length})</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB: OFF-MARKET MCTP & PURCHASE AGREEMENT */}
          {activeTab === 'offmarket' && (
            <div className="space-y-6 text-xs">
              
              {/* 1. Rick & Zach Ginn 4-Pillars (MCTP) Qualification Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Landmark className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white">Rick & Zach Ginn 4-Pillars Qualification (MCTP)</h3>
                      <p className="text-[11px] text-slate-400">Qualify the Direct Seller before making a cash offer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMctpQualified}
                        onChange={(e) => setIsMctpQualified(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
                      />
                      <span>Mark MCTP Qualified</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pillar 1: Motivation */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <label className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                      <span>1. Motivation (Why are they selling?)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={mctpMotivation}
                      onChange={(e) => setMctpMotivation(e.target.value)}
                      placeholder="e.g. Probate heir wants quick split, back taxes owed, code violation fine $100/day..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Pillar 2: Condition */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <label className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                      <span>2. Condition (Property Repairs)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={mctpCondition}
                      onChange={(e) => setMctpCondition(e.target.value)}
                      placeholder="e.g. Needs roof ($8k), outdated HVAC, original oak cabinets, trash-out needed..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Pillar 3: Timeline */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <label className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                      <span>3. Timeline (When do they need cash?)</span>
                    </label>
                    <input
                      type="text"
                      value={mctpTimeline}
                      onChange={(e) => setMctpTimeline(e.target.value)}
                      placeholder="e.g. Needs close within 14 days before tax deed sale..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Pillar 4: Price & Net Target */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <label className="font-bold text-amber-400 text-xs flex items-center justify-between">
                      <span>4. Asking Price & Seller Net Target</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400">Asking Price ($)</span>
                        <input
                          type="number"
                          value={mctpAskingPrice}
                          onChange={(e) => setMctpAskingPrice(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400">Seller Net Target ($)</span>
                        <input
                          type="number"
                          value={mctpNetTarget}
                          onChange={(e) => setMctpNetTarget(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveOffMarketDetails}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save MCTP Qualification</span>
                  </button>
                </div>
              </div>

              {/* 2. Rick & Zach Ginn 1-Page Direct Seller Purchase Agreement (PDF Generator) */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-sky-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-sky-400" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white">1-Page Direct Cash Purchase Agreement (FreeWholesaling Model)</h3>
                      <p className="text-[11px] text-slate-400">Rick & Zach Ginn standard 1-page agreement for off-market direct sellers</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowContractPdf(!showContractPdf)}
                    className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{showContractPdf ? 'Hide Agreement PDF' : 'Generate Contract PDF'}</span>
                  </button>
                </div>

                {showContractPdf && (
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 text-slate-200 font-mono text-xs leading-relaxed">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] font-sans">
                      <span className="text-amber-400 font-bold">PDF CONTRACT PREVIEW • READY FOR E-SIGN</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const contractText = `AGREEMENT TO PURCHASE REAL ESTATE\n\nBUYER: Mid-Illinois Property Group LLC and/or assigns\nSELLER: ${lead.contactName}\nPROPERTY ADDRESS: ${lead.propertyAddress}, ${lead.city}, ${lead.state} ${lead.zip}\n\n1. PURCHASE PRICE: Buyer agrees to pay $${calculatedMao.toLocaleString()} cash at closing.\n2. EARNEST MONEY DEPOSIT: $${emdAmount} to be deposited with ${titleCompany} within 3 business days of mutual acceptance.\n3. INSPECTION PERIOD: Buyer shall have a 10-business-day inspection period to perform due diligence, property walkthroughs, and contractor partner reviews.\n4. CLOSING DATE: Closing shall occur on or before ${new Date(Date.now() + 86400000 * 14).toLocaleDateString()} at ${titleCompany}.\n5. TITLE & ESCROW: Seller shall convey marketable title free and clear of all liens, mortgages, and encumbrances.`;
                            downloadFile(contractText, `Purchase_Agreement_${lead.propertyAddress.replace(/[^a-zA-Z0-9]/g, '_')}.txt`, 'text/plain');
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-950" />
                          <span>Download (.txt)</span>
                        </button>

                        <button
                          onClick={() => {
                            const contractText = `AGREEMENT TO PURCHASE REAL ESTATE\n\nBuyer: Mid-Illinois Property Group LLC and/or assigns\nSeller: ${lead.contactName}\nProperty Address: ${lead.propertyAddress}, ${lead.city}, ${lead.state} ${lead.zip}\n\n1. PURCHASE PRICE: Buyer agrees to pay $${calculatedMao.toLocaleString()} cash at closing.\n2. EARNEST MONEY DEPOSIT: $${emdAmount} to be deposited with ${titleCompany} within 3 business days of mutual acceptance.\n3. INSPECTION PERIOD: Buyer shall have a 10-business-day inspection period to perform due diligence, property walkthroughs, and contractor partner reviews.\n4. CLOSING DATE: Closing shall occur on or before ${new Date(Date.now() + 86400000 * 14).toLocaleDateString()} at ${titleCompany}.\n5. TITLE & ESCROW: Seller shall convey marketable title free and clear of all liens, mortgages, and encumbrances.`;
                            navigator.clipboard.writeText(contractText);
                            setCopiedContract(true);
                            setTimeout(() => setCopiedContract(false), 2000);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedContract ? 'Copied to Clipboard!' : 'Copy Agreement Text'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-[11px] text-slate-300">
                      <p className="font-bold text-center text-white text-sm tracking-wide uppercase">AGREEMENT TO PURCHASE REAL ESTATE</p>
                      <p><strong>BUYER:</strong> Mid-Illinois Property Group LLC and/or assigns</p>
                      <p><strong>SELLER:</strong> {lead.contactName}</p>
                      <p><strong>PROPERTY ADDRESS:</strong> {lead.propertyAddress}, {lead.city}, {lead.state} {lead.zip}</p>
                      <p><strong>1. PURCHASE PRICE:</strong> Buyer agrees to pay <strong>${calculatedMao.toLocaleString()}</strong> Cash at Closing.</p>
                      <p><strong>2. EARNEST MONEY:</strong> $${emdAmount} to be deposited with <strong>{titleCompany}</strong> within 3 business days of acceptance.</p>
                      <p><strong>3. INSPECTION PERIOD:</strong> Buyer shall have a 10-business-day inspection period to perform property due diligence and partner access.</p>
                      <p><strong>4. CLOSING & TITLE:</strong> Closing on or before 14 calendar days. Seller to convey clear marketable title free of liens.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Title Company & Escrow Tracker */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white">Investor Title Company & Escrow Setup</h3>
                      <p className="text-[11px] text-slate-400">Track EMD deposit, title commitment search, and closing escrow officer</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block mb-1">Title Company Name</span>
                    <input
                      type="text"
                      value={titleCompany}
                      onChange={(e) => setTitleCompany(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Escrow Officer Name</span>
                    <input
                      type="text"
                      value={titleOfficer}
                      onChange={(e) => setTitleOfficer(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Escrow Officer Phone</span>
                    <input
                      type="text"
                      value={titleOfficerPhone}
                      onChange={(e) => setTitleOfficerPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">EMD Deposit Amount ($)</span>
                    <input
                      type="number"
                      value={emdAmount}
                      onChange={(e) => setEmdAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">EMD Status</span>
                    <select
                      value={emdStatus}
                      onChange={(e) => setEmdStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-emerald-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="PENDING">PENDING DEPOSIT</option>
                      <option value="DEPOSITED">DEPOSITED & CONFIRMED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Title Search Status</span>
                    <select
                      value={titleStatus}
                      onChange={(e) => setTitleStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-sky-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="NOT_STARTED">NOT STARTED</option>
                      <option value="ORDERED">ORDERED AT TITLE CO</option>
                      <option value="CLEAR_TITLE">CLEAR TITLE COMMITMENT</option>
                      <option value="LIEN_ISSUES">LIENS / TAX PAYOFF NEEDED</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveOffMarketDetails}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Title & Escrow Details</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 1: OVERVIEW & EDIT DEAL */}
          {activeTab === 'overview' && (
            <div className="space-y-6 text-xs">
              
              {/* Header Save Notification */}
              {isSavedNotice && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Deal and contact details updated successfully!</span>
                </div>
              )}

              {/* Property Details Edit Form */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" /> Property Specifications
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Edit Property Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-slate-300 block font-semibold mb-1">Street Address</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">City</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-300 block font-semibold mb-1">State</label>
                      <input
                        type="text"
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white uppercase focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block font-semibold mb-1">Zip Code</label>
                      <input
                        type="text"
                        value={editZip}
                        onChange={(e) => setEditZip(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 sm:col-span-2">
                    <div>
                      <label className="text-slate-400 block text-[10px] mb-1 font-semibold">Beds</label>
                      <input
                        type="number"
                        value={editBeds}
                        onChange={(e) => setEditBeds(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block text-[10px] mb-1 font-semibold">Baths</label>
                      <input
                        type="number"
                        value={editBaths}
                        onChange={(e) => setEditBaths(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block text-[10px] mb-1 font-semibold">SqFt</label>
                      <input
                        type="number"
                        value={editSqft}
                        onChange={(e) => setEditSqft(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block text-[10px] mb-1 font-semibold">Year Built</label>
                      <input
                        type="number"
                        value={editYearBuilt}
                        onChange={(e) => setEditYearBuilt(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Card Edit Form */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" /> Contact Details
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Edit Associated Contact</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={editContactName}
                      onChange={(e) => setEditContactName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Contact Role</label>
                    <select
                      value={editContactRole}
                      onChange={(e) => setEditContactRole(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="LISTING_AGENT">LISTING AGENT</option>
                      <option value="DIRECT_SELLER">DIRECT SELLER</option>
                      <option value="WHOLESALER">WHOLESALER</option>
                      <option value="ATTORNEY">ATTORNEY / TITLE OFFICER</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editContactPhone}
                      onChange={(e) => setEditContactPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editContactEmail}
                      onChange={(e) => setEditContactEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-slate-300 block font-semibold mb-1">Pipeline Stage</label>
                    <select
                      value={editStage}
                      onChange={(e) => setEditStage(e.target.value as LeadStage)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="GOV_LIST_PULLED">1. Off-Market Gov Lead / Pulled</option>
                      <option value="MCTP_QUALIFIED">2. MCTP Qualified Seller</option>
                      <option value="UNDER_CONTRACT_ACQ">3. Acquisition Under Contract</option>
                      <option value="TITLE_SEARCH_EMD">4. Title Search & EMD Deposited</option>
                      <option value="ASSIGNED_DISPO">5. Assigned to Cash Buyer</option>
                      <option value="CLOSED_PROFIT">6. Closed & Wire Received 🎉</option>
                      <option value="LOST_REJECTED">7. Lost / Passed / Unresponsive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Deal Notes */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
                <h3 className="font-bold text-sm text-white">Deal Notes & Seller Motivation</h3>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record property condition, seller motivation details, repair estimates, or agent feedback..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Save All Overview Changes */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveOverviewDetails}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xl"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Deal & Contact Updates</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: VALUATION & MAO CALCULATOR */}
          {activeTab === 'valuation' && (
            <div className="space-y-6 text-xs">
              
              {/* Interactive Wholesaling Calculator */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-400" />
                    Wholesaling MAO & Discount Calculator
                  </h3>
                  <button
                    onClick={handleSaveValuation}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Save Valuation
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      List Price ($)
                    </label>
                    <input
                      type="number"
                      value={listPrice}
                      onChange={(e) => setListPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Estimated ARV ($)
                    </label>
                    <input
                      type="number"
                      value={estimatedArv}
                      onChange={(e) => setEstimatedArv(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Discount Formula (%)
                    </label>
                    <input
                      type="number"
                      value={discountRate}
                      onChange={(e) => setDiscountRate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-amber-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Repair Estimate ($)
                    </label>
                    <input
                      type="number"
                      value={repairEstimate}
                      onChange={(e) => setRepairEstimate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-rose-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Desired Wholesale Fee ($)
                    </label>
                    <input
                      type="number"
                      value={wholesaleFee}
                      onChange={(e) => setWholesaleFee(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-emerald-300 font-mono font-bold"
                    />
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-amber-500/30 flex flex-col justify-center">
                    <span className="text-[10px] text-amber-400 uppercase font-extrabold">Calculated MAO</span>
                    <span className="text-xl font-extrabold text-amber-300">${calculatedMao.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">Ask-MAO Gap: ${askingGap.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Gemini AI Deal Analyzer Trigger */}
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-300 text-sm">Gemini AI Deal Analyzer & Pitch Generator</span>
                  </div>
                  <button
                    onClick={handleRunAIValuation}
                    disabled={isAnalyzingValuation}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAnalyzingValuation ? 'Generating Pitch...' : 'Run Deal Analysis'}
                  </button>
                </div>

                {aiValuationResult && (
                  <div className="space-y-3 pt-2 text-slate-300">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-amber-400 block mb-1">MAO Analysis:</span>
                      <p>{aiValuationResult.maoBreakdown}</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-emerald-400 block mb-1">Listing Agent Pitch Script:</span>
                      <p className="whitespace-pre-wrap font-sans leading-relaxed">{aiValuationResult.agentPitchScript}</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-sky-400 block mb-1">Creative Finance Option (Seller Financing / Sub-To):</span>
                      <p>{aiValuationResult.creativeFinanceBackup}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: CALL AUDIT LOG */}
          {activeTab === 'calls' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">
                  Call Audit Log for {lead.propertyAddress}
                </h3>
                <button
                  onClick={() => onOpenDialer(lead)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  + Log Call Now
                </button>
              </div>

              {leadCalls.length === 0 ? (
                <p className="text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-xl">
                  No calls logged yet for this lead. Click "Log Call Now" to record your conversation.
                </p>
              ) : (
                leadCalls.map((call) => (
                  <div key={call.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-bold text-white">{call.contactName} ({call.contactRole})</span>
                      <span className="font-mono text-emerald-400">{call.contactPhone}</span>
                    </div>
                    <p className="text-slate-300">{call.notes}</p>
                    <div className="text-[10px] text-slate-500">Logged on {new Date(call.timestamp).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: AUTOMATED FOLLOW-UPS & AI MESSAGES */}
          {activeTab === 'followup' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white">Generate AI Follow-up Message or Formal LOI</h3>
                
                <div className="flex items-center space-x-2">
                  {(['SMS', 'EMAIL', 'LOI', 'SCRIPT'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setMsgFormat(fmt)}
                      className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                        msgFormat === fmt
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}

                  <button
                    onClick={handleGenerateMsg}
                    disabled={isGeneratingMsg}
                    className="ml-auto px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingMsg ? 'Generating...' : 'Generate with Gemini'}
                  </button>
                </div>

                {generatedMsg && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-amber-400 block">Generated {msgFormat} Draft:</span>
                    <textarea
                      rows={8}
                      readOnly
                      value={generatedMsg}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-slate-200 font-sans"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DISPOSITION & BUYERS */}
          {activeTab === 'dispo' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-white">Matching Cash Buyers for ZIP {lead.zip}</h3>

              {matchingBuyers.length === 0 ? (
                <p className="text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-xl">
                  No cash buyers specifically tagged for ZIP {lead.zip}. Register new buyers in the Dispo tab.
                </p>
              ) : (
                matchingBuyers.map((buyer) => (
                  <div key={buyer.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{buyer.name} ({buyer.company})</h4>
                      <p className="text-slate-400">{buyer.buyBoxType} • Max Budget: ${buyer.maxBudget.toLocaleString()}</p>
                      <p className="text-emerald-400 font-mono mt-1">{buyer.phone} • {buyer.email}</p>
                    </div>

                    <button
                      onClick={() => alert(`Deal flyer draft prepared for ${buyer.email}!`)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                    >
                      Send Deal Flyer
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
