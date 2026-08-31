import React, { useState, useEffect } from 'react';
import { X, Building, CheckCircle2, Save } from 'lucide-react';
import type {
  Property, Lead, Contact, Buyer, TitleCompany, Territory, CallLog,
} from '@/types/dealflow';
import { QuickAddPropertyForm } from '../Common/properties/QuickAddPropertyForm';
import { DealLinkPicker } from '../Common/deals/DealLinkPicker';

interface PropertyFormModalProps {
  isOpen: boolean;
  propertyToEdit?: Property | null;
  leads: Lead[];
  contacts: Contact[];
  buyers: Buyer[];
  titleCompanies: TitleCompany[];
  properties?: Property[];
  callLogs?: CallLog[];
  territories?: Territory[];
  selectedTerritoryId?: string | null;
  onClose: () => void;
  onSaveProperty: (propertyData: Partial<Property>) => Promise<void>;
  onSaveLead?: (leadData: Partial<Lead>) => Promise<Lead | void>;
  onCreateContact?: (contactData: Partial<Contact>) => Promise<void>;
  onCreateProperty?: (propertyData: Partial<Property>) => Promise<void>;
  onAddBuyer?: (buyerData: Partial<Buyer>) => Promise<void>;
  onAddTitleCompany?: (titleCompanyData: Partial<TitleCompany>) => Promise<void>;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen, propertyToEdit, leads = [], properties = [], callLogs = [], territories = [],
  selectedTerritoryId, onClose, onSaveProperty, onSaveLead, onCreateProperty,
}) => {
  if (!isOpen) return null;

  // ── Mode toggle: standard property link vs deal-linked ────────────────────
  const [linkDealMode, setLinkDealMode] = useState(false);
  const [linkedDealIds, setLinkedDealIds] = useState<string[]>(
    propertyToEdit?.leadId ? [propertyToEdit.leadId] : []
  );

  // ── Property / Lead link state ─────────────────────────────────────────────
  const [leadId, setLeadId] = useState(propertyToEdit?.leadId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [autoFillNotice, setAutoFillNotice] = useState<string | null>(null);

  const selectedLeadObj = leads.find((l) => l.id === leadId);

  // Restore the links when editing an existing property
  useEffect(() => {
    if (propertyToEdit?.leadId) {
      setLeadId(propertyToEdit.leadId);
      setLinkedDealIds([propertyToEdit.leadId]);
    }
  }, [propertyToEdit]);

  const handleLeadSelect = (selectedLeadId: string) => {
    setLeadId(selectedLeadId);
    if (!selectedLeadId) { setAutoFillNotice(null); return; }
    const targetLead = leads.find((l) => l.id === selectedLeadId);
    if (!targetLead) return;
    setAutoFillNotice(`Successfully meshed & auto-filled details from deal: "${targetLead.propertyAddress}"`);
    setTimeout(() => setAutoFillNotice(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true); setErrorMsg('');

      if (propertyToEdit?.id) {
        // Edit mode: persist the property ↔ lead/deal links
        await onSaveProperty({
          id: propertyToEdit.id,
          leadId: linkDealMode ? (linkedDealIds[0] || undefined) : (leadId || undefined),
          dealIds: linkDealMode ? linkedDealIds : undefined,
        });
      } else if (linkDealMode) {
        // Create mode (deal-linked): the picker already created/linked the deal + property
        if (linkedDealIds.length === 0) {
          setErrorMsg('No deal linked yet — search for a deal above or use "+ Quick Add Deal" first.');
          setIsSubmitting(false);
          return;
        }
        if (onSaveLead) await onSaveLead({ id: linkedDealIds[0], dealIds: linkedDealIds });
      } else if (leadId && onSaveLead) {
        // Create mode (standard): sync the link onto the lead
        await onSaveLead({ id: leadId });
      } else {
        setErrorMsg('No property linked yet — use "+ Quick Add Property" to create the property & wholesale lead first, then save.');
        setIsSubmitting(false);
        return;
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{propertyToEdit ? 'Edit Property Record' : 'Add Property & Wholesale Lead'}</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded border border-amber-500/30 font-semibold uppercase">Composed From Sub-Components</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Dossier, quick add & property link — all reusable bricks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-5 text-xs overflow-y-auto flex-1">
            {errorMsg && <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 font-semibold">{errorMsg}</div>}
            {autoFillNotice && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{autoFillNotice}</span>
              </div>
            )}

            {/* ── NEW: Mode Toggle Checkbox ─────────────────────────────────── */}
            <label className="flex items-center gap-3 p-3 bg-slate-900/60 border border-amber-500/30 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
              <input
                type="checkbox"
                checked={linkDealMode}
                onChange={(e) => setLinkDealMode(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0"
              />
              <div>
                <span className="block text-xs font-bold text-amber-400">Add/Link deal + add property</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  {linkDealMode
                    ? 'Deal mode ON — link this property to one or more deals (search or quick-add).'
                    : 'Deal mode OFF — standard link / quick-add a property & wholesale lead.'}
                </span>
              </div>
            </label>

            {/* ── Conditional Pickers ───────────────────────────────────────── */}
            {linkDealMode ? (
              /* DEAL MODE: Deal Link Picker (search + quick add deals) */
              <DealLinkPicker
                linkedDealIds={linkedDealIds}
                onLinkChange={setLinkedDealIds}
                availableDeals={leads}
                label="Link to Deal (Searchable)"
                onCreateDeal={onSaveLead}
                onCreateProperty={onCreateProperty}
                territories={territories}
                properties={properties}
                callLogs={callLogs}
                 forceQuickAddProperty={true}
              />
            ) : (
              /* STANDARD MODE: Property / Lead link + dossier + quick add */
           /* CREATE MODE: Direct Quick Add Property Form */
           <QuickAddPropertyForm
             territories={territories}
             selectedTerritoryId={selectedTerritoryId}
             currentContact={{ firstName: '', lastName: '', phone: '', role: 'DIRECT_SELLER' }}
             onSaveLead={onSaveLead}
             onCreateProperty={onCreateProperty}
             onContactSuggestion={() => {}}
             onLinkedLeadChange={(id) => {
               setLeadId(id);
               setAutoFillNotice(`Successfully created & linked property`);
               setTimeout(() => setAutoFillNotice(null), 4000);
             }}
             onClose={onClose} 
           />
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xl disabled:opacity-50">
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : propertyToEdit ? 'Update Property Record' : 'Save Property & Wholesale Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};