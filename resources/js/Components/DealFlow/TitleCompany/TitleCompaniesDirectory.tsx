import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  ShieldCheck,
  Star,
  FileCheck,
  DollarSign,
  AlertCircle,
  Landmark,
  Download,
} from 'lucide-react';
import type { TitleCompany, Lead, Contact } from '@/types/dealflow';
import { exportToCSV } from '@/utils/exportUtils';
import { QuickAddContactForm } from '../Common/contacts/QuickAddContactForm';

interface TitleCompaniesDirectoryProps {
  titleCompanies: TitleCompany[];
  leads: Lead[];
  onAddTitleCompany: (data: Partial<TitleCompany>) => Promise<void>;
  onUpdateTitleCompany: (id: string, data: Partial<TitleCompany>) => Promise<void>;
  onDeleteTitleCompany: (id: string) => Promise<void>;
  onOpenLeadDetail?: (leadId: string) => void;
}

export const TitleCompaniesDirectory: React.FC<TitleCompaniesDirectoryProps> = ({
  titleCompanies,
  leads,
  onAddTitleCompany,
  onUpdateTitleCompany,
  onDeleteTitleCompany,
  onOpenLeadDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInvestorFriendly, setFilterInvestorFriendly] = useState(false);
  const [filterDoubleClose, setFilterDoubleClose] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<TitleCompany | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Partial<Contact>>({ role: 'TITLE_COMPANY' });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCompany(null);
    setEditingDraft({ role: 'TITLE_COMPANY' });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (company: TitleCompany) => {
    setEditingCompany(company);
    const parts = company.officerFirstName ? null : (company.officerName || '').split(' ');
    setEditingDraft({
      role: 'TITLE_COMPANY',
      company: company.name,
      officerFirstName: company.officerFirstName || parts?.[0] || '',
      officerLastName: company.officerLastName || (parts ? parts.slice(1).join(' ') : ''),
      phone: company.phone,
      email: company.email,
      agencyStreetAddress: company.address,
      agencyCity: company.city,
      agencyState: company.state,
      agencyZip: company.zip,
      investorFriendly: company.investorFriendly,
      assignmentFeeFriendly: company.assignmentFeeFriendly,
      doubleClosingSupported: company.doubleClosingSupported,
      preferredEMDAmount: company.preferredEMDAmount,
      rating: company.rating,
      notes: company.notes,
    });
    setIsModalOpen(true);
  };

  // Maps the unified Contact draft back to the legacy TitleCompany payload
  const handleSaveDraft = async (draft: Partial<Contact>) => {
    const officer = `${draft.officerFirstName || ''} ${draft.officerLastName || ''}`.trim();
    const payload: Partial<TitleCompany> = {
      name: draft.company || '',
      officerName: officer || `${draft.firstName || ''} ${draft.lastName || ''}`.trim(),
      officerFirstName: draft.officerFirstName,
      officerLastName: draft.officerLastName,
      phone: draft.phone || draft.officePhone || '',
      email: draft.email || '',
      address: draft.agencyStreetAddress || draft.streetAddress,
      city: draft.agencyCity || draft.city || 'Springfield',
      state: draft.agencyState || draft.state || 'IL',
      zip: draft.agencyZip || draft.zip || '62701',
      investorFriendly: !!draft.investorFriendly,
      assignmentFeeFriendly: !!draft.assignmentFeeFriendly,
      doubleClosingSupported: !!draft.doubleClosingSupported,
      preferredEMDAmount: Number(draft.preferredEMDAmount) || 500,
      rating: Number(draft.rating) || 5,
      notes: draft.notes,
    };
    if (editingCompany) {
      await onUpdateTitleCompany(editingCompany.id, payload);
    } else {
      await onAddTitleCompany(payload);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await onDeleteTitleCompany(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete title company:', err);
    }
  };

  // Filtered List
  const filteredCompanies = titleCompanies.filter((tc) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      tc.name.toLowerCase().includes(q) ||
      tc.officerName.toLowerCase().includes(q) ||
      tc.city.toLowerCase().includes(q) ||
      (tc.notes && tc.notes.toLowerCase().includes(q));
    const matchesInvestor = !filterInvestorFriendly || tc.investorFriendly;
    const matchesDouble = !filterDoubleClose || tc.doubleClosingSupported;
    return matchesQuery && matchesInvestor && matchesDouble;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Investor Title Companies & Escrow Partners
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage investor-friendly title companies that handle wholesale assignment fees, double closes, and EMD escrow accounts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() =>
              exportToCSV('Title_Companies_Directory', filteredCompanies, [
                { key: 'name', label: 'Company Name' },
                { key: 'officerName', label: 'Escrow Officer' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'address', label: 'Street Address' },
                { key: 'city', label: 'City' },
                { key: 'state', label: 'State' },
                { key: 'zip', label: 'Zip' },
                { key: 'investorFriendly', label: 'Investor Friendly' },
                { key: 'assignmentFeeFriendly', label: 'Assignment Fee Friendly' },
                { key: 'doubleClosingSupported', label: 'Double Close Supported' },
                { key: 'preferredEMDAmount', label: 'Preferred EMD ($)' },
                { key: 'rating', label: 'Rating' },
                { key: 'notes', label: 'Notes' },
              ])
            }
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Title Company</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company name, officer, city..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          <label className="flex items-center space-x-1.5 text-slate-300 font-semibold cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              checked={filterInvestorFriendly}
              onChange={(e) => setFilterInvestorFriendly(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900"
            />
            <span>Investor-Friendly Only</span>
          </label>
          <label className="flex items-center space-x-1.5 text-slate-300 font-semibold cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              checked={filterDoubleClose}
              onChange={(e) => setFilterDoubleClose(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900"
            />
            <span>Double-Closing Supported</span>
          </label>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.map((tc) => {
          const linkedLeads = leads.filter(
            (l) => l.titleDetail?.companyName.toLowerCase().includes(tc.name.toLowerCase()) || tc.name.toLowerCase().includes(l.titleDetail?.companyName.toLowerCase() || '___')
          );
          return (
            <div
              key={tc.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                {/* Header Title & Rating */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{tc.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{tc.address ? `${tc.address}, ` : ''}{tc.city}, {tc.state} {tc.zip}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-xs font-bold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{tc.rating || 5}.0</span>
                  </div>
                </div>
                {/* Officer & Contact Details */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Escrow Officer:</span>
                    <span className="font-bold text-white">{tc.officerName || 'Staff Officer'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href={`tel:${tc.phone}`}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-mono font-medium"
                    >
                      <Phone className="w-3 h-3 text-amber-400" />
                      <span>{tc.phone}</span>
                    </a>
                    <a
                      href={`mailto:${tc.email}`}
                      className="text-sky-400 hover:underline flex items-center gap-1 truncate max-w-[140px]"
                    >
                      <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">{tc.email}</span>
                    </a>
                  </div>
                </div>
                {/* Badges & Wholesaling Specs */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tc.investorFriendly && (
                    <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md text-[10px] border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Investor Friendly
                    </span>
                  )}
                  {tc.assignmentFeeFriendly && (
                    <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-md text-[10px] border border-amber-500/30 flex items-center gap-1">
                      <FileCheck className="w-3 h-3" />
                      Assignment Fee Friendly
                    </span>
                  )}
                  {tc.doubleClosingSupported && (
                    <span className="bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-md text-[10px] border border-purple-500/30 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Double Close
                    </span>
                  )}
                </div>
                {/* Preferred EMD & Notes */}
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Preferred EMD Deposit:</span>
                    <span className="font-bold text-emerald-400 font-mono">${tc.preferredEMDAmount}</span>
                  </div>
                  {tc.notes && (
                    <p className="text-[11px] text-slate-300 italic line-clamp-2 bg-slate-950/50 p-2 rounded border border-slate-800">
                      "{tc.notes}"
                    </p>
                  )}
                </div>
                {/* Linked Active Deals */}
                {linkedLeads.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Active Escrow Deals ({linkedLeads.length}):
                    </span>
                    <div className="space-y-1">
                      {linkedLeads.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => onOpenLeadDetail && onOpenLeadDetail(l.id)}
                          className="bg-slate-950 hover:bg-slate-800 p-1.5 rounded text-[11px] text-slate-200 flex items-center justify-between cursor-pointer border border-slate-800 transition-colors"
                        >
                          <span className="truncate font-medium">{l.propertyAddress}</span>
                          <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1 rounded font-bold shrink-0">
                            EMD ${l.titleDetail?.emdAmount || 500}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Card Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEdit(tc)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(tc.id)}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-lg text-xs transition-colors border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL (new unified form — auto-selects TITLE_COMPANY) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="w-full max-w-3xl my-auto max-h-[90vh] overflow-y-auto">
            <QuickAddContactForm
              initialRole="TITLE_COMPANY"
              initialData={editingDraft}
              title={editingCompany ? 'Edit Title Company' : 'Add Investor Title Company'}
              onSaveContact={handleSaveDraft}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-base text-white">Delete Title Company?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this title company record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
