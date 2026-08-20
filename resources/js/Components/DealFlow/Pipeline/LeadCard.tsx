import React from 'react';
import {
  Building2,
  PhoneCall,
  Calculator,
  Calendar,
  AlertTriangle,
  User,
  ArrowRight,
  Sparkles,
  Trash2,
  Sliders,
  ChevronRight,
  FileText,
  DollarSign,
} from 'lucide-react';
import type { Lead, LeadStage } from '@/types/dealflow';

interface LeadCardProps {
  lead: Lead;
  onOpenDetail: (lead: Lead) => void;
  onOpenDialer: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: LeadStage) => void;
  onQuickEditDeal?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const OFF_MARKET_ORDER: LeadStage[] = [
  'GOV_LIST_PULLED',
  'SKIP_TRACED',
  'MCTP_QUALIFIED',
  'OFFER_SENT_PDF',
  'TITLE_EMD_SUBMITTED',
  'DISPO_BUYER_ASSIGNED',
  'CLOSED',
];

const ON_MARKET_ORDER: LeadStage[] = [
  'NEW',
  'CONTACTED',
  'VALUING',
  'OFFER_SENT',
  'NEGOTIATING',
  'UNDER_CONTRACT_ACQ',
  'DISPOSITION',
  'CLOSED',
];

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onOpenDetail,
  onOpenDialer,
  onStageChange,
  onQuickEditDeal,
  onDeleteLead,
}) => {
  const mao = lead.valuation?.calculatedMao || 0;
  const listPrice = lead.valuation?.listPrice || 0;
  const isOffMarket = lead.dealType === 'OFF_MARKET_GOV';

  const orderArray = isOffMarket ? OFF_MARKET_ORDER : ON_MARKET_ORDER;
  const currentIdx = orderArray.indexOf(lead.stage as LeadStage);
  const nextStage = currentIdx >= 0 && currentIdx < orderArray.length - 1 ? orderArray[currentIdx + 1] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 shadow-lg transition-all space-y-3 group relative">
      
      {/* Property Thumbnail & Address */}
      <div className="flex items-start space-x-3">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 relative border border-slate-800">
          <img
            src={lead.imageUrl || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'}
            alt={lead.propertyAddress}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-center font-bold text-amber-300 py-0.5">
            {lead.beds}B / {lead.baths}B
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4
            onClick={() => onOpenDetail(lead)}
            className="text-sm font-bold text-white hover:text-amber-400 transition-colors truncate cursor-pointer"
          >
            {lead.propertyAddress}
          </h4>
          <p className="text-xs text-slate-400 truncate">
            {lead.city}, {lead.state} {lead.zip}
          </p>

          <div className="flex items-center space-x-2 text-[11px] mt-1 text-slate-400">
            <span>{lead.sqft ? lead.sqft.toLocaleString() : 0} sqft</span>
            <span>•</span>
            <span>Built {lead.yearBuilt || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Financial Numbers Bar */}
      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Asking / List</span>
          <span className="font-bold text-slate-200">${listPrice.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-amber-400 uppercase font-bold block">Target MAO (70%)</span>
          <span className="font-extrabold text-amber-300">${mao.toLocaleString()}</span>
        </div>
      </div>

      {/* Quick Stage Controls Bar */}
      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-bold uppercase">Current Stage:</span>
          {nextStage && (
            <button
              onClick={() => onStageChange(lead.id, nextStage)}
              className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold rounded text-[10px] hover:from-amber-400 hover:to-amber-300 transition-all flex items-center gap-0.5 cursor-pointer shadow"
              title={`Advance to ${nextStage.replace(/_/g, ' ')}`}
            >
              <span>Advance Stage</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <select
          value={lead.stage}
          onChange={(e) => onStageChange(lead.id, e.target.value as LeadStage)}
          className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
        >
          {isOffMarket ? (
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

      {/* Contact & Last Action */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
        <div className="flex items-center space-x-1.5 text-slate-300 truncate max-w-[130px]">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium">{lead.contactName || 'No Contact'}</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onOpenDialer(lead)}
            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Log phone call with this seller/agent"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call</span>
          </button>

          {onQuickEditDeal ? (
            <button
              onClick={() => onQuickEditDeal(lead)}
              className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Quick Manage Deal, MAO & Info"
            >
              <Sliders className="w-3 h-3 text-amber-400" />
              <span>Manage</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenDetail(lead)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
            >
              View Deal
            </button>
          )}

          {onDeleteLead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete "${lead.propertyAddress}" from your pipeline?`)) {
                  onDeleteLead(lead.id);
                }
              }}
              title="Delete deal"
              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Off-Market / Gov List & MCTP Badges */}
      {isOffMarket && (
        <div className="bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              🏛️ {lead.govListType ? lead.govListType.replace(/_/g, ' ') : 'Gov List'}
            </span>
            {lead.mctp?.isQualified ? (
              <span className="bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/40">
                MCTP Qualified
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                Unqualified
              </span>
            )}
          </div>

          {lead.pdfAgreementUrl && (
            <div className="text-[10px] text-emerald-300 font-medium flex items-center gap-1 pt-0.5">
              <FileText className="w-3 h-3 text-emerald-400" />
              <a href={lead.pdfAgreementUrl} target="_blank" rel="noreferrer" className="underline hover:text-emerald-200">
                Purchase Agreement Attached
              </a>
            </div>
          )}

          {lead.titleDetail && (
            <div className="text-[10px] text-sky-300 font-medium flex items-center justify-between pt-1 border-t border-amber-500/20">
              <span>Escrow: {lead.titleDetail.companyName}</span>
              <span className="bg-sky-500/20 px-1 rounded text-sky-200">
                EMD: ${lead.titleDetail.emdAmount} ({lead.titleDetail.emdStatus})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {lead.tags.slice(0, 3).map((tag: any, idx: number) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 bg-slate-950 text-slate-400 rounded border border-slate-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

    </div>
  );
};
