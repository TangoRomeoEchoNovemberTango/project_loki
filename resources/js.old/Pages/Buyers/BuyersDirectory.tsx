import React, { useState } from 'react';
import { Users, Plus, Building2, Phone, Mail, CheckCircle2, Send, Download, Edit3, Trash2, X, HardHat, TreePine } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

// 1. LOCAL TYPES (Replaces your old ../../types import to prevent errors)
export type BuyerCategory = 'BUILDER' | 'CONSTRUCTION_COMPANY' | 'LAND_DEVELOPER' | 'CASH_FLIPPER' | 'BUY_AND_HOLD' | 'INFILL_BUILDER' | 'RURAL_LAND_BUYER';

export interface Buyer {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  buyerCategory?: BuyerCategory;
  buyBoxType?: string;
  maxBudget?: number;
  targetZipCodes?: string[];
  isLandBuyer?: boolean;
  verifiedFunds?: boolean;
  dealsClosedCount?: number;
}

// 2. MOCK DATA (Replaces backend data for UI testing)
const mockBuyers: Buyer[] = [
  {
    id: '1',
    name: 'John Doe',
    company: 'Apex Custom Builders',
    phone: '555-0192',
    email: 'john@apex.com',
    buyerCategory: 'BUILDER',
    buyBoxType: 'Infill Lots & Single Family',
    maxBudget: 500000,
    targetZipCodes: ['62701', '62702'],
    isLandBuyer: true,
    verifiedFunds: true,
    dealsClosedCount: 12
  },
  {
    id: '2',
    name: 'Jane Smith',
    company: 'Flip Masters LLC',
    phone: '555-0198',
    email: 'jane@flipmasters.com',
    buyerCategory: 'CASH_FLIPPER',
    buyBoxType: 'Single Family Fix & Flip',
    maxBudget: 300000,
    targetZipCodes: ['62704'],
    isLandBuyer: false,
    verifiedFunds: true,
    dealsClosedCount: 5
  }
];

// 3. SIMPLE CSV EXPORT (Replaces your old ../../utils import)
const exportToCSV = (filename: string, data: any[], columns: any[]) => {
  const header = columns.map((c: any) => c.label).join(',');
  const rows = data.map((row: any) => columns.map((c: any) => row[c.key]).join(','));
  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

// 4. MAIN COMPONENT
export default function BuyersDirectory({ auth }: { auth: any }) {
  // Using local state for UI testing. Later, this will come from Laravel via props!
  const [buyers, setBuyers] = useState<Buyer[]>(mockBuyers);

  const [showModal, setShowModal] = useState(false);
  const [editingBuyerId, setEditingBuyerId] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'BUILDER' | 'CONSTRUCTION_COMPANY' | 'LAND_DEVELOPER' | 'CASH_FLIPPER' | 'BUY_AND_HOLD'>('ALL');
  const [landFilterOnly, setLandFilterOnly] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zipCodes, setZipCodes] = useState('62701, 62702, 62704');
  const [buyBox, setBuyBox] = useState('Single Family Fix & Flip');
  const [maxBudget, setMaxBudget] = useState(300000);
  const [buyerCategory, setBuyerCategory] = useState<BuyerCategory>('CASH_FLIPPER');
  const [isLandBuyer, setIsLandBuyer] = useState(false);

  const handleOpenAdd = () => {
    setEditingBuyerId(null);
    setName(''); setCompany(''); setPhone(''); setEmail('');
    setZipCodes('62701, 62702, 62704'); setBuyBox('Single Family Fix & Flip');
    setMaxBudget(300000); setBuyerCategory('CASH_FLIPPER'); setIsLandBuyer(false);
    setShowModal(true);
  };

  const handleOpenEdit = (buyer: Buyer) => {
    setEditingBuyerId(buyer.id);
    setName(buyer.name);
    setCompany(buyer.company || '');
    setPhone(buyer.phone);
    setEmail(buyer.email);
    setZipCodes((buyer.targetZipCodes || []).join(', '));
    setBuyBox(buyer.buyBoxType || 'Single Family Fix & Flip');
    setMaxBudget(buyer.maxBudget || 300000);
    setBuyerCategory(buyer.buyerCategory || 'CASH_FLIPPER');
    setIsLandBuyer(buyer.isLandBuyer || false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name, company, phone, email,
      targetZipCodes: zipCodes.split(',').map((z) => z.trim()).filter(Boolean),
      buyBoxType: buyBox, maxBudget, buyerCategory, isLandBuyer, verifiedFunds: true,
    };

    // TODO: LATER, replace this alert with Inertia router call:
    // if (editingBuyerId) { router.put(route('buyers.update', editingBuyerId), payload); }
    // else { router.post(route('buyers.store'), payload); }

    alert(`UI Test: ${editingBuyerId ? 'Updated' : 'Added'} buyer: ${name}`);

    // Update local state so the UI feels responsive during testing
    if (editingBuyerId) {
        setBuyers(buyers.map(b => b.id === editingBuyerId ? { ...b, ...payload } : b));
    } else {
        setBuyers([...buyers, { id: Date.now().toString(), dealsClosedCount: 0, ...payload } as Buyer]);
    }
    setShowModal(false);
  };

  const handleDelete = (buyer: Buyer) => {
    if (window.confirm(`Are you sure you want to delete cash buyer "${buyer.name}"?`)) {
      // TODO: LATER, replace with: router.delete(route('buyers.destroy', buyer.id));
      setBuyers(buyers.filter(b => b.id !== buyer.id));
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
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Buyers Directory</h2>}
    >
      <Head title="Buyers Directory" />

      <div className="py-12 bg-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

          {/* --- YOUR ORIGINAL UI CODE STARTS HERE --- */}
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

            {/* Add / Edit Buyer Modal */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-white">
                      {editingBuyerId ? 'Edit Buyer / Builder Profile' : 'Register Cash Buyer, Builder or Contractor'}
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Buyer Category *</label>
                      <select
                        value={buyerCategory}
                        onChange={(e) => {
                          const cat = e.target.value as BuyerCategory;
                          setBuyerCategory(cat);
                          if (cat === 'BUILDER' || cat === 'CONSTRUCTION_COMPANY' || cat === 'LAND_DEVELOPER' || cat === 'INFILL_BUILDER') {
                            setIsLandBuyer(true);
                            if (cat === 'BUILDER') setBuyBox('Infill Lots & Single Family Spec Builds');
                            if (cat === 'CONSTRUCTION_COMPANY') setBuyBox('Residential Build Sites & Infill Lots');
                            if (cat === 'LAND_DEVELOPER') setBuyBox('Vacant Land Parcels & Infill Lots');
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-amber-300 font-bold"
                      >
                        <option value="CASH_FLIPPER">Cash House Flipper (Fix & Flip / BRRRR)</option>
                        <option value="BUILDER">Custom / Spec Home Builder</option>
                        <option value="CONSTRUCTION_COMPANY">General Construction Company</option>
                        <option value="LAND_DEVELOPER">Land Developer / Infill Investor</option>
                        <option value="INFILL_BUILDER">Infill Lot Spec Builder</option>
                        <option value="BUY_AND_HOLD">Turnkey Rental Buy & Hold</option>
                        <option value="RURAL_LAND_BUYER">Rural Acreage / Recreational Land Buyer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Buyer / Representative Name *</label>
                      <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Company / Construction LLC</label>
                      <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Apex Custom Builders Inc." className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Phone *</label>
                        <input required type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Email *</label>
                        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Target Buy Box Criteria</label>
                      <input type="text" value={buyBox} onChange={(e) => setBuyBox(e.target.value)} placeholder="e.g. Infill lots with utilities at street, single family zoning" className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Target ZIP Codes (comma separated)</label>
                      <input type="text" value={zipCodes} onChange={(e) => setZipCodes(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white font-mono" />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Max Capital / Acquisition Budget ($)</label>
                      <input type="number" value={maxBudget} onChange={(e) => setMaxBudget(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-amber-300 font-mono font-bold" />
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-white font-semibold flex items-center gap-1.5">
                          <TreePine className="w-4 h-4 text-emerald-400" />
                          Land Wholesaling / Infill Lots Interest
                        </span>
                        <p className="text-[11px] text-slate-400">Buyer actively acquires vacant land, infill lots, or build sites.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isLandBuyer}
                        onChange={(e) => setIsLandBuyer(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                      <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-semibold cursor-pointer">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded cursor-pointer">
                        {editingBuyerId ? 'Save Changes' : 'Register Buyer / Builder'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
          {/* --- YOUR ORIGINAL UI CODE ENDS HERE --- */}

        </div>
      </div>
    </AuthenticatedLayout>
  );
}
