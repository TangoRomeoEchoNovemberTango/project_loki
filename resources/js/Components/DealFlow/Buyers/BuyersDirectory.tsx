import React, { useState } from 'react';
import { Users, Plus, Building2, Phone, Mail, CheckCircle2, Send, Download, Edit3, Trash2, X, HardHat, TreePine, Filter } from 'lucide-react';
import type { Buyer, BuyerCategory, Contact } from '@/types/dealflow';
import { exportToCSV } from '@/utils/exportUtils';
import { QuickAddContactForm } from '../Common/contacts/QuickAddContactForm';

interface BuyersDirectoryProps {
  buyers: Buyer[];
  onAddBuyer: (newBuyer: Partial<Buyer>) => Promise<void>;
  onUpdateBuyer?: (id: string, updatedBuyer: Partial<Buyer>) => Promise<void>;
  onDeleteBuyer?: (id: string) => Promise<void>;
}

export const BuyersDirectory: React.FC<BuyersDirectoryProps> = ({
  buyers,
  onAddBuyer,
  onUpdateBuyer,
  onDeleteBuyer,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingBuyerId, setEditingBuyerId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Partial<Contact>>({ role: 'CASH_BUYER' });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'BUILDER' | 'CONSTRUCTION_COMPANY' | 'LAND_DEVELOPER' | 'CASH_FLIPPER' | 'BUY_AND_HOLD'>('ALL');
  const [landFilterOnly, setLandFilterOnly] = useState(false);

  const handleOpenAdd = () => {
    setEditingBuyerId(null);
    setEditingDraft({ role: 'CASH_BUYER' });
    setShowModal(true);
  };

  const handleOpenEdit = (buyer: Buyer) => {
    setEditingBuyerId(buyer.id);
    const parts = buyer.firstName ? null : (buyer.name || '').split(' ');
    setEditingDraft({
      role: 'CASH_BUYER',
      firstName: buyer.firstName || parts?.[0] || '',
      lastName: buyer.lastName || (parts ? parts.slice(1).join(' ') : ''),
      company: buyer.company,
      phone: buyer.phone,
      email: buyer.email,
      buyerCategory: buyer.buyerCategory || 'CASH_FLIPPER',
      isLandBuyer: !!buyer.isLandBuyer,
      maxBudget: buyer.maxBudget,
      pofVerified: buyer.verifiedFunds,
      targetMarkets: (buyer.targetZipCodes || []).join(', '),
      buyBoxPropertyTypes: buyer.buyBoxType,
    });
    setShowModal(true);
  };

  // Maps the unified Contact draft back to the legacy Buyer payload (until we migrate persistence)
  const handleSaveDraft = async (draft: Partial<Contact>) => {
    const payload: Partial<Buyer> = {
      name: `${draft.firstName || ''} ${draft.lastName || ''}`.trim(),
      firstName: draft.firstName,
      lastName: draft.lastName,
      company: draft.company || '',
      phone: draft.phone || '',
      email: draft.email || '',
      targetZipCodes: (draft.targetMarkets || '').split(',').map((z) => z.trim()).filter(Boolean),
      buyBoxType: draft.buyBoxPropertyTypes || 'Single Family Fix & Flip',
      maxBudget: Number(draft.maxBudget) || 300000,
      buyerCategory: draft.buyerCategory || 'CASH_FLIPPER',
      isLandBuyer: !!draft.isLandBuyer,
      verifiedFunds: !!draft.pofVerified,
    };
    if (editingBuyerId && onUpdateBuyer) {
      await onUpdateBuyer(editingBuyerId, payload);
    } else {
      await onAddBuyer({ ...payload, dealsClosedCount: 0 });
    }
  };

  const handleDelete = async (buyer: Buyer) => {
    if (window.confirm(`Are you sure you want to delete cash buyer "${buyer.name}"?`)) {
      if (onDeleteBuyer) {
        await onDeleteBuyer(buyer.id);
      }
    }
  };

  const filteredBuyers = buyers.filter((buyer) => {
    if (categoryFilter !== 'ALL') {
      if (categoryFilter === 'BUILDER' && buyer.buyerCategory !== 'BUILDER' && buyer.buyerCategory !== 'INFILL_BUILDER') return false;
      if (categoryFilter === 'CONSTRUCTION_COMPANY' && buyer.buyerCategory !== 'CONSTRUCTION_COMPANY') return false;
      if (categoryFilter === 'LAND_DEVELOPER' && buyer.buyerCategory !== 'LAND_DEVELOPER' && buyer.buyerCategory !== 'RURAL_LAND_BUYER') return false;
      if (categoryFilter === 'CASH_FLIPPER' && buyer.buyerCategory !== 'CASH_FLIPPER') return false;
      if (categoryFilter === 'BUY_AND_HOLD' && buyer.buyerCategory !== 'BUY_AND_HOLD') return false;
    }
    if (landFilterOnly && !buyer.isLandBuyer && buyer.buyerCategory !== 'BUILDER' && buyer.buyerCategory !== 'CONSTRUCTION_COMPANY' && buyer.buyerCategory !== 'LAND_DEVELOPER') {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Disposition, Cash Buyers & Builders Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            VIP list of Cash House Flippers, Custom Home Builders, Construction Companies, and Land Developers for assigning contracts.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() =>
              exportToCSV('Cash_Buyers_Directory', buyers, [
                { key: 'name', label: 'Buyer Name' },
                { key: 'company', label: 'Company' },
                { key: 'buyerCategory', label: 'Category' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'buyBoxType', label: 'Buy Box Criteria' },
                { key: 'maxBudget', label: 'Max Budget ($)' },
                { key: 'isLandBuyer', label: 'Buys Land/Infill Lots' },
                { key: 'dealsClosedCount', label: 'Deals Closed' },
                { key: 'verifiedFunds', label: 'Proof of Funds Verified' },
              ])
            }
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Register Buyer / Builder</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Buyers ({buyers.length})
          </button>
          <button
            onClick={() => setCategoryFilter('BUILDER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              categoryFilter === 'BUILDER'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" /> Home Builders
          </button>
          <button
            onClick={() => setCategoryFilter('CONSTRUCTION_COMPANY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              categoryFilter === 'CONSTRUCTION_COMPANY'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Construction Cos
          </button>
          <button
            onClick={() => setCategoryFilter('LAND_DEVELOPER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              categoryFilter === 'LAND_DEVELOPER'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <TreePine className="w-3.5 h-3.5" /> Land Developers
          </button>
          <button
            onClick={() => setCategoryFilter('CASH_FLIPPER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              categoryFilter === 'CASH_FLIPPER'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Fix & Flippers
          </button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-amber-300 font-semibold select-none">
          <input
            type="checkbox"
            checked={landFilterOnly}
            onChange={(e) => setLandFilterOnly(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
          />
          <TreePine className="w-3.5 h-3.5 text-amber-400" />
          <span>Vacant Land / Infill Buyers Only</span>
        </label>
      </div>

      {/* Buyer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBuyers.map((buyer) => {
          const isBuilderCat = buyer.buyerCategory === 'BUILDER' || buyer.buyerCategory === 'CONSTRUCTION_COMPANY' || buyer.buyerCategory === 'INFILL_BUILDER';
          const isLandCat = buyer.buyerCategory === 'LAND_DEVELOPER' || buyer.isLandBuyer;
          return (
            <div key={buyer.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-3 relative group hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-white text-base">{buyer.name}</h3>
                    {isBuilderCat && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded flex items-center gap-1">
                        <HardHat className="w-3 h-3 text-amber-400" /> Builder / Contractor
                      </span>
                    )}
                    {isLandCat && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded flex items-center gap-1">
                        <TreePine className="w-3 h-3 text-emerald-400" /> Land Buyer
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">{buyer.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> POF Verified
                  </span>
                  <button
                    onClick={() => handleOpenEdit(buyer)}
                    title="Edit Buyer"
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(buyer)}
                    title="Delete Buyer"
                    className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <div><span className="text-slate-400">Category: </span><span className="text-amber-300 font-bold">{buyer.buyerCategory || 'CASH_FLIPPER'}</span></div>
                <div><span className="text-slate-400">Target Buy Box: </span><span className="text-slate-200 font-semibold">{buyer.buyBoxType}</span></div>
                <div><span className="text-slate-400">Max Budget: </span><span className="text-amber-300 font-bold font-mono">${(buyer.maxBudget || 0).toLocaleString()}</span></div>
                <div><span className="text-slate-400">Target ZIPs: </span><span className="text-slate-300 font-mono">{(buyer.targetZipCodes || []).join(', ')}</span></div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="space-y-0.5">
                  <p className="text-emerald-400 font-mono flex items-center gap-1"><Phone className="w-3 h-3" /> {buyer.phone}</p>
                  <p className="text-slate-400 font-mono flex items-center gap-1"><Mail className="w-3 h-3" /> {buyer.email}</p>
                </div>
                <button
                  onClick={() => alert(`Deal blast notification sent to ${buyer.email} for ${buyer.company}!`)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Blast Deal</span>
                </button>
              </div>
            </div>
          );
        })}
        {filteredBuyers.length === 0 && (
          <div className="md:col-span-2 text-center py-12 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No cash buyers or builders found matching selected filters.
          </div>
        )}
      </div>

      {/* Add / Edit Buyer Modal (new unified form — auto-selects CASH_BUYER) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <QuickAddContactForm
              initialRole="CASH_BUYER"
              initialData={editingDraft}
              title={editingBuyerId ? 'Edit Buyer / Builder Profile' : 'Register Cash Buyer, Builder or Contractor'}
              onSaveContact={handleSaveDraft}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
