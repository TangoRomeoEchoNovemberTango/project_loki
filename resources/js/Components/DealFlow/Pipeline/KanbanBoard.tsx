import React, { useState } from 'react';
import type { Lead, LeadStage, PipelineType, GovListType } from '@/types/dealflow';
import { LeadCard } from './LeadCard';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';
import {
  Kanban,
  Table,
  Plus,
  Search,
  SlidersHorizontal,
  Building2,
  DollarSign,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  Landmark,
  ShieldAlert,
  Flame,
  Droplets,
  UserCheck,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Calculator,
  Phone,
  User,
  Sliders,
} from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onOpenDetail: (lead: Lead) => void;
  onOpenDialer: (lead: Lead) => void;
  onOpenAddLeadModal: () => void;
  onStageChange: (leadId: string, newStage: LeadStage) => void;
  onUpdateLead?: (leadData: Partial<Lead> & { id: string }) => Promise<Lead | void>;
  onDeleteLead?: (leadId: string) => Promise<void>;
}

const ON_MARKET_STAGES: { id: LeadStage; title: string; color: string }[] = [
  { id: 'NEW', title: 'New On-Market', color: 'border-slate-700 bg-slate-900/60' },
  { id: 'CONTACTED', title: 'Agent Contacted', color: 'border-indigo-500/40 bg-indigo-950/20' },
  { id: 'VALUING', title: 'Valuation & MAO', color: 'border-amber-500/40 bg-amber-950/20' },
  { id: 'OFFER_SENT', title: 'Offer Sent (LOI)', color: 'border-sky-500/40 bg-sky-950/20' },
  { id: 'NEGOTIATING', title: 'Negotiating', color: 'border-purple-500/40 bg-purple-950/20' },
  { id: 'UNDER_CONTRACT_ACQ', title: 'Under Contract (Acq)', color: 'border-emerald-500/50 bg-emerald-950/30' },
  { id: 'DISPOSITION', title: 'Disposition (Buyers)', color: 'border-amber-400/50 bg-amber-950/30' },
  { id: 'CLOSED', title: 'Closed / Fee Collected', color: 'border-teal-400/50 bg-teal-950/30' },
];

const OFF_MARKET_STAGES: { id: LeadStage; title: string; color: string; desc: string }[] = [
  {
    id: 'GOV_LIST_PULLED',
    title: '1. Gov List Pulled',
    color: 'border-amber-600/40 bg-amber-950/20',
    desc: 'Probate, Tax, Code, Water Shutoff',
  },
  {
    id: 'SKIP_TRACED',
    title: '2. Skip-Traced',
    color: 'border-indigo-500/40 bg-indigo-950/20',
    desc: 'Phone/Email verified for seller',
  },
  {
    id: 'MCTP_QUALIFIED',
    title: '3. MCTP Qualified',
    color: 'border-purple-500/40 bg-purple-950/20',
    desc: 'Motivation, Condition, Timeline, Price',
  },
  {
    id: 'OFFER_SENT_PDF',
    title: '4. Offer Sent (PDF)',
    color: 'border-sky-500/40 bg-sky-950/20',
    desc: '1-Page Direct Contract Sent',
  },
  {
    id: 'TITLE_EMD_SUBMITTED',
    title: '5. Under Contract & Title',
    color: 'border-emerald-500/50 bg-emerald-950/30',
    desc: 'EMD Deposited at Title Company',
  },
  {
    id: 'DISPO_BUYER_ASSIGNED',
    title: '6. Cash Buyer Dispo',
    color: 'border-amber-400/50 bg-amber-950/30',
    desc: 'Assignment Contract & Buyer Deposit',
  },
  {
    id: 'CLOSED',
    title: '7. Closed / Wholesale Fee',
    color: 'border-teal-400/50 bg-teal-950/30',
    desc: 'Title Payoff & Fee Check Collected',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onOpenDetail,
  onOpenDialer,
  onOpenAddLeadModal,
  onStageChange,
  onUpdateLead,
  onDeleteLead,
}) => {
  const [activePipeline, setActivePipeline] = useState<PipelineType>('OFF_MARKET_GOV');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedGovList, setSelectedGovList] = useState<string>('ALL');
  const [showStageGuide, setShowStageGuide] = useState<boolean>(false);

  // Quick Deal Edit Modal State
  const [quickEditLead, setQuickEditLead] = useState<Lead | null>(null);
  const [editListPrice, setEditListPrice] = useState<number>(0);
  const [editArv, setEditArv] = useState<number>(0);
  const [editRepairs, setEditRepairs] = useState<number>(0);
  const [editFee, setEditFee] = useState<number>(15000);
  const [editStage, setEditStage] = useState<LeadStage>('NEW');
  const [editContactName, setEditContactName] = useState<string>('');
  const [editContactPhone, setEditContactPhone] = useState<string>('');
  const [editContactEmail, setEditContactEmail] = useState<string>('');
  const [editMctpMotivation, setEditMctpMotivation] = useState<string>('');
  const [editMctpCondition, setEditMctpCondition] = useState<string>('');
  const [editMctpTimeline, setEditMctpTimeline] = useState<string>('14-30 Days');
  const [editPdfUrl, setPdfUrl] = useState<string>('');
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState<boolean>(false);

  const handleOpenQuickEdit = (lead: Lead) => {
    setQuickEditLead(lead);
    setEditListPrice(lead.valuation?.listPrice || 0);
    setEditArv(lead.valuation?.estimatedArv || 0);
    setEditRepairs(lead.valuation?.repairEstimate || 0);
    setEditFee(lead.valuation?.desiredWholesaleFee || 15000);
    setEditStage(lead.stage);
    setEditContactName(lead.contactName || '');
    setEditContactPhone(lead.contactPhone || '');
    setEditContactEmail(lead.contactEmail || '');
    setEditMctpMotivation(lead.mctp?.motivation || '');
    setEditMctpCondition(lead.mctp?.condition || '');
    setEditMctpTimeline(lead.mctp?.timeline || '14-30 Days');
    setPdfUrl(lead.pdfAgreementUrl || '');
  };

  const handleSaveQuickEdit = async () => {
    if (!quickEditLead || !onUpdateLead) return;
    setIsSavingQuickEdit(true);
    try {
      const calcMao = Math.round((editArv * 0.70) - editRepairs - editFee);
      await onUpdateLead({
        id: quickEditLead.id,
        stage: editStage,
        contactName: editContactName,
        contactPhone: editContactPhone,
        contactEmail: editContactEmail,
        pdfAgreementUrl: editPdfUrl.trim() || undefined,
        valuation: {
          ...quickEditLead.valuation,
          listPrice: editListPrice,
          estimatedArv: editArv,
          repairEstimate: editRepairs,
          desiredWholesaleFee: editFee,
          calculatedMao: calcMao,
          askingMaoGap: editListPrice - calcMao,
        },
        mctp: {
          ...quickEditLead.mctp,
          motivation: editMctpMotivation,
          condition: editMctpCondition,
          timeline: editMctpTimeline,
          askingPrice: editListPrice,
        },
      });
      setQuickEditLead(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingQuickEdit(false);
    }
  };

  const currentStages = activePipeline === 'OFF_MARKET_GOV' ? OFF_MARKET_STAGES : ON_MARKET_STAGES;

  // Filter leads by active pipeline type
  const pipelineLeads = leads.filter((l) => {
    if (activePipeline === 'OFF_MARKET_GOV') {
      return l.dealType === 'OFF_MARKET_GOV';
    } else {
      return l.dealType !== 'OFF_MARKET_GOV';
    }
  });

  // Filter leads by search & options
  const filteredLeads = pipelineLeads.filter((l) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      l.propertyAddress.toLowerCase().includes(query) ||
      l.city.toLowerCase().includes(query) ||
      l.contactName.toLowerCase().includes(query);

    const matchesTag =
      selectedTag === 'ALL' || (l.tags && l.tags.includes(selectedTag));

    const matchesGovList =
      selectedGovList === 'ALL' || l.govListType === selectedGovList;

    return matchesSearch && matchesTag && matchesGovList;
  });

  const handleExportLeadsCSV = () => {
    const rows = filteredLeads.map((l) => ({
      ID: l.id,
      PropertyAddress: l.propertyAddress,
      City: l.city,
      State: l.state,
      Zip: l.zip,
      Beds: l.beds,
      Baths: l.baths,
      SqFt: l.sqft,
      YearBuilt: l.yearBuilt,
      DealType: l.dealType || 'ON_MARKET',
      GovListType: l.govListType || '',
      Stage: l.stage,
      ContactName: l.contactName,
      ContactRole: l.contactRole,
      ContactPhone: l.contactPhone,
      ContactEmail: l.contactEmail,
      AskingPrice: l.valuation?.listPrice || 0,
      EstimatedARV: l.valuation?.estimatedArv || 0,
      RepairEstimate: l.valuation?.repairEstimate || 0,
      CalculatedMAO: l.valuation?.calculatedMao || 0,
      MCTP_Motivation: l.mctp?.motivation || '',
      MCTP_Condition: l.mctp?.condition || '',
      MCTP_Timeline: l.mctp?.timeline || '',
      MCTP_AskingPrice: l.mctp?.askingPrice || 0,
      MCTP_NetTarget: l.mctp?.sellerNetTarget || 0,
      MCTP_Qualified: l.mctp?.isQualified ? 'YES' : 'NO',
      TitleCompany: l.titleDetail?.companyName || '',
      BuyerName: l.buyerDetail?.buyerName || '',
      WholesaleFee: l.valuation?.desiredWholesaleFee || 15000,
      Tags: (l.tags || []).join('; '),
    }));

    exportToCSV(`Wholesale_Leads_${activePipeline}`, rows);
  };

  const handleExportLeadsJSON = () => {
    exportToJSON(`Wholesale_Leads_${activePipeline}`, filteredLeads);
  };

  return (
    <div className="space-y-4">
      
      {/* Stage Explainer Banner Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowStageGuide(!showStageGuide)}
            className="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
          >
            <Info className="w-4 h-4 text-amber-400" />
            <span>💡 How Wholesale Pipeline Stages Work (Rick & Zach Off-Market Model)</span>
            {showStageGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <span className="text-[10px] text-slate-400">
            {showStageGuide ? 'Click to collapse guide' : 'Click to view stage definitions'}
          </span>
        </div>

        {showStageGuide && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <span className="font-extrabold text-amber-400 text-[11px] block">1. Gov List Pulled</span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Distressed seller records (Probate, Water Shutoff, Tax Delinquent, Code Violations) pulled into your CRM. Awaiting skip trace.
              </p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <span className="font-extrabold text-indigo-400 text-[11px] block">2. Skip-Traced</span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Phone numbers and emails verified for home owner. Ready for phone call outreach or SMS drips.
              </p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <span className="font-extrabold text-purple-400 text-[11px] block">3. MCTP Qualified</span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Seller interview completed & 4-Pillars verified: Motivation, Condition, Timeline, and Asking Price.
              </p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <span className="font-extrabold text-sky-400 text-[11px] block">4. Offer Sent (PDF)</span>
              <p className="text-[11px] text-slate-300 leading-snug">
                1-Page Wholesale Purchase Contract or LOI delivered to seller for signature.
              </p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <span className="font-extrabold text-emerald-400 text-[11px] block">5. Under Contract & Title</span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Seller executed contract! Earnest Money Deposit (EMD) sent to Title/Escrow Company to start title search.
              </p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <span className="font-extrabold text-amber-300 text-[11px] block">6. Cash Buyer Dispo</span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Assigned to cash buyer! Assignment agreement executed and non-refundable buyer deposit secured.
              </p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 col-span-1 md:col-span-2">
              <span className="font-extrabold text-teal-300 text-[11px] block">7. Closed / Wholesale Fee</span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Escrow closed successfully! Wholesale assignment fee check ($15,000+) wired directly to business account.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Type Switcher Header */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActivePipeline('OFF_MARKET_GOV')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activePipeline === 'OFF_MARKET_GOV'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Off-Market / Gov Lists (Rick & Zach Model)</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-amber-300 border border-amber-500/30">
              {leads.filter((l) => l.dealType === 'OFF_MARKET_GOV').length}
            </span>
          </button>

          <button
            onClick={() => setActivePipeline('ON_MARKET')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activePipeline === 'ON_MARKET'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>On-Market MLS / Agent Deals</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-amber-300 border border-amber-500/30">
              {leads.filter((l) => l.dealType !== 'OFF_MARKET_GOV').length}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Active Pipeline: <strong className="text-white">{activePipeline === 'OFF_MARKET_GOV' ? 'Off-Market Direct Seller' : 'On-Market Agent MLS'}</strong></span>
        </div>
      </div>

      {/* Top Filter & View Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-md">
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, seller name, city..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {activePipeline === 'OFF_MARKET_GOV' && (
            <select
              value={selectedGovList}
              onChange={(e) => setSelectedGovList(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">🏛️ All Government Lists</option>
              <option value="PROBATE">Probate / Inherited</option>
              <option value="CODE_VIOLATION">Code Violations</option>
              <option value="TAX_DELINQUENT">Tax Delinquent</option>
              <option value="WATER_SHUTOFF">Water Shutoff / Utility</option>
              <option value="PRE_FORECLOSURE">Pre-Foreclosure / Lis Pendens</option>
              <option value="EVICTION">Eviction List</option>
            </select>
          )}

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Deal Tags</option>
            <option value="Probate List">Probate List</option>
            <option value="Code Violation">Code Violation</option>
            <option value="Tax Delinquent">Tax Delinquent</option>
            <option value="Water Shutoff List">Water Shutoff</option>
            <option value="MCTP High Motivation">MCTP Qualified</option>
            <option value="PDF E-Sign Sent">PDF Sent</option>
            <option value="On-Market">On-Market Listings</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportLeadsCSV}
            title="Export pipeline leads to CSV"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportLeadsJSON}
            title="Export pipeline leads to JSON backup"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={onOpenAddLeadModal}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Deal</span>
          </button>
        </div>

      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-6">
        {currentStages.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);
          const totalFeesInStage = stageLeads.reduce(
            (acc, l) => acc + (l.valuation?.desiredWholesaleFee || 15000),
            0
          );

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border ${stage.color} p-3.5 flex flex-col min-h-[500px] shadow-lg`}
            >
              
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-800 mb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    {stage.title}
                  </h3>
                  <span className="px-2 py-0.5 bg-slate-950 text-amber-400 font-extrabold text-[10px] rounded-full border border-slate-800">
                    {stageLeads.length}
                  </span>
                </div>
                {'desc' in stage && (
                  <p className="text-[10px] text-slate-400 line-clamp-1">{String(stage.desc)}</p>
                )}
                <div className="text-[10px] text-amber-300 font-semibold font-mono text-right">
                  ${(totalFeesInStage / 1000).toFixed(0)}k pipeline fees
                </div>
              </div>

              {/* Column Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 border border-dashed border-slate-800/80 rounded-xl p-4">
                    <p className="text-xs">No deals in {stage.title}</p>
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onOpenDetail={onOpenDetail}
                      onOpenDialer={onOpenDialer}
                      onStageChange={onStageChange}
                      onQuickEditDeal={handleOpenQuickEdit}
                      onDeleteLead={onDeleteLead}
                    />
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* QUICK DEAL & FINANCIALS MANAGER MODAL */}
      {quickEditLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">            
            <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 shrink-0 bg-slate-900">
              <div>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block">
                  ⚡ Pipeline Deal Manager
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {quickEditLead.propertyAddress} ({quickEditLead.city}, {quickEditLead.state})
                </h3>
              </div>
              <button
                onClick={() => setQuickEditLead(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* 1. Stage Selector */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wide block">
                  Pipeline Stage
                </label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value as LeadStage)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-extrabold text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  {quickEditLead.dealType === 'OFF_MARKET_GOV' ? (
                    <>
                      <option value="GOV_LIST_PULLED">1. Gov List Pulled</option>
                      <option value="SKIP_TRACED">2. Skip-Traced</option>
                      <option value="MCTP_QUALIFIED">3. MCTP Qualified</option>
                      <option value="OFFER_SENT_PDF">4. Offer Sent (PDF)</option>
                      <option value="TITLE_EMD_SUBMITTED">5. Under Contract & Title</option>
                      <option value="DISPO_BUYER_ASSIGNED">6. Cash Buyer Dispo</option>
                      <option value="CLOSED">7. Closed / Wholesale Fee</option>
                    </>
                  ) : (
                    <>
                      <option value="NEW">New On-Market</option>
                      <option value="CONTACTED">Agent Contacted</option>
                      <option value="VALUING">Valuation & MAO</option>
                      <option value="OFFER_SENT">Offer Sent (LOI)</option>
                      <option value="NEGOTIATING">Negotiating</option>
                      <option value="UNDER_CONTRACT_ACQ">Under Contract (Acq)</option>
                      <option value="DISPOSITION">Disposition (Buyers)</option>
                      <option value="CLOSED">Closed / Fee Collected</option>
                    </>
                  )}
                </select>
              </div>

              {/* 2. Financials & MAO Engine */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-400" /> Deal Financials & Live 70% MAO
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Asking / List ($)</span>
                    <input
                      type="number"
                      value={editListPrice}
                      onChange={(e) => setEditListPrice(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white font-bold font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Estimated ARV ($)</span>
                    <input
                      type="number"
                      value={editArv}
                      onChange={(e) => setEditArv(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white font-bold font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Repairs ($)</span>
                    <input
                      type="number"
                      value={editRepairs}
                      onChange={(e) => setEditRepairs(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white font-bold font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Target Fee ($)</span>
                    <input
                      type="number"
                      value={editFee}
                      onChange={(e) => setEditFee(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white font-bold font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-amber-500/30 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    Target 70% MAO: <strong className="text-amber-400 font-mono font-extrabold text-sm">${Math.round((editArv * 0.70) - editRepairs - editFee).toLocaleString()}</strong>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (ARV × 70%) - Repairs - Fee
                  </span>
                </div>
              </div>

              {/* 3. Seller Contact Info & Contract Link */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Seller Contact & Purchase Agreement PDF
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Contact Name</span>
                    <input
                      type="text"
                      value={editContactName}
                      onChange={(e) => setEditContactName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Contact Phone</span>
                    <input
                      type="text"
                      value={editContactPhone}
                      onChange={(e) => setEditContactPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Contact Email</span>
                    <input
                      type="email"
                      value={editContactEmail}
                      onChange={(e) => setEditContactEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Purchase Contract / LOI PDF URL</span>
                  <input
                    type="text"
                    value={editPdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://.../Purchase_Agreement.pdf"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-emerald-300 font-mono"
                  />
                </div>
              </div>

              {/* 4. MCTP Motivation Notes */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" /> MCTP Motivation & Condition Notes
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Seller Motivation</span>
                    <input
                      type="text"
                      value={editMctpMotivation}
                      onChange={(e) => setEditMctpMotivation(e.target.value)}
                      placeholder="e.g. Inherited property, out of state owner"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Property Condition Notes</span>
                    <input
                      type="text"
                      value={editMctpCondition}
                      onChange={(e) => setEditMctpCondition(e.target.value)}
                      placeholder="e.g. Needs new roof & HVAC repair"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            

            <div className="flex items-center justify-end gap-2 p-4 bg-slate-950/90 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setQuickEditLead(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs cursor-pointer hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingQuickEdit}
                onClick={handleSaveQuickEdit}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isSavingQuickEdit ? 'Saving...' : '✨ Save & Apply Deal Changes'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
