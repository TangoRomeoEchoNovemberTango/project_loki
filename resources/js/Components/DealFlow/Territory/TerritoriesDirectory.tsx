import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Building,
  Users,
  PhoneCall,
  DollarSign,
  Percent,
  Edit2,
  Trash2,
  CheckCircle2,
  Globe,
  Tag,
  ChevronRight,
  ShieldCheck,
  X,
  AlertCircle,
} from 'lucide-react';
import type { Territory, TerritoryStatus, Lead, CallLog, Buyer } from '@/types/dealflow';

interface TerritoriesDirectoryProps {
  territories: Territory[];
  leads: Lead[];
  callLogs: CallLog[];
  buyers: Buyer[];
  selectedTerritoryId: string | null;
  onSelectTerritoryFilter: (id: string | null) => void;
  onAddTerritory: (territoryData: Partial<Territory>) => Promise<void>;
  onUpdateTerritory: (id: string, territoryData: Partial<Territory>) => Promise<void>;
  onDeleteTerritory: (id: string) => Promise<void>;
}

export const TerritoriesDirectory: React.FC<TerritoriesDirectoryProps> = ({
  territories,
  leads,
  callLogs,
  buyers,
  selectedTerritoryId,
  onSelectTerritoryFilter,
  onAddTerritory,
  onUpdateTerritory,
  onDeleteTerritory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TerritoryStatus | 'ALL'>('ALL');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null);
  const [deletingTerritoryId, setDeletingTerritoryId] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    state: string;
    countiesOrCities: string;
    zipCodes: string;
    targetDiscountRate: number;
    avgWholesaleFee: number;
    status: TerritoryStatus;
    notes: string;
  }>({
    name: '',
    state: 'IL',
    countiesOrCities: '',
    zipCodes: '',
    targetDiscountRate: 70,
    avgWholesaleFee: 15000,
    status: 'ACTIVE',
    notes: '',
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      state: 'IL',
      countiesOrCities: '',
      zipCodes: '',
      targetDiscountRate: 70,
      avgWholesaleFee: 15000,
      status: 'ACTIVE',
      notes: '',
    });
    setErrorMessage('');
  };

  // Open Edit Modal
  const handleOpenEdit = (t: Territory) => {
    setEditingTerritory(t);
    setFormData({
      name: t.name,
      state: t.state,
      countiesOrCities: t.countiesOrCities.join(', '),
      zipCodes: t.zipCodes.join(', '),
      targetDiscountRate: t.targetDiscountRate,
      avgWholesaleFee: t.avgWholesaleFee,
      status: t.status,
      notes: t.notes || '',
    });
    setErrorMessage('');
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Territory name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload: Partial<Territory> = {
        name: formData.name.trim(),
        state: formData.state.trim().toUpperCase() || 'IL',
        countiesOrCities: formData.countiesOrCities
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        zipCodes: formData.zipCodes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        targetDiscountRate: Number(formData.targetDiscountRate) || 70,
        avgWholesaleFee: Number(formData.avgWholesaleFee) || 15000,
        status: formData.status,
        notes: formData.notes.trim(),
      };

      if (editingTerritory) {
        await onUpdateTerritory(editingTerritory.id, payload);
        setEditingTerritory(null);
      } else {
        await onAddTerritory(payload);
        setIsAddModalOpen(false);
      }
      resetForm();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save territory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const confirmDelete = async () => {
    if (!deletingTerritoryId) return;
    try {
      await onDeleteTerritory(deletingTerritoryId);
      if (selectedTerritoryId === deletingTerritoryId) {
        onSelectTerritoryFilter(null);
      }
      setDeletingTerritoryId(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete territory');
    }
  };

  // Helper metrics per territory
  const getTerritoryMetrics = (territory: Territory) => {
    // Match leads by territoryId OR by ZIP code
    const territoryLeads = leads.filter(
      (l) =>
        l.territoryId === territory.id ||
        territory.zipCodes.includes(l.zip) ||
        territory.countiesOrCities.some(
          (c: any) => c.toLowerCase() === l.city?.toLowerCase()
        )
    );

    const leadIds = new Set(territoryLeads.map((l) => l.id));

    const territoryCalls = callLogs.filter(
      (c) =>
        (c.leadId && leadIds.has(c.leadId)) ||
        territoryLeads.some((l) => l.propertyAddress === c.leadAddress)
    );

    const matchedBuyers = buyers.filter((b) =>
      b.targetZipCodes.some((z: any) => territory.zipCodes.includes(z))
    );

    return {
      totalLeads: territoryLeads.length,
      activeLeads: territoryLeads.filter(
        (l) => l.stage !== 'CLOSED' && l.stage !== 'DEAD'
      ).length,
      underContract: territoryLeads.filter(
        (l) => l.stage === 'UNDER_CONTRACT_ACQ' || l.stage === 'DISPOSITION'
      ).length,
      totalCalls: territoryCalls.length,
      matchedBuyersCount: matchedBuyers.length,
    };
  };

  // Filtered Territories
  const filteredTerritories = territories.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.countiesOrCities.some((c: any) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      t.zipCodes.some((z: any) => z.includes(searchQuery));

    const matchesStatus =
      statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Overall Portfolio Stats
  const totalZipCodesCount = new Set(territories.flatMap((t) => t.zipCodes)).size;
  const primaryTerritory = territories.find((t) => t.status === 'PRIMARY');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Wholesaling Territory Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Define target counties, cities, and ZIP codes. Configure MAO discount targets, average wholesale fees, and track active buyer density for each territory.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedTerritoryId && (
            <button
              onClick={() => onSelectTerritoryFilter(null)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold border border-amber-500/30 transition-colors"
            >
              <X className="w-4 h-4 text-amber-400" />
              <span>Clear Active Territory Filter</span>
            </button>
          )}

          <button
            id="btn-add-territory"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-950/40 text-xs sm:text-sm cursor-pointer transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Add Target Territory</span>
          </button>
        </div>
      </div>

      {/* Quick Portfolio Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-medium block">Total Territories</span>
            <span className="text-lg font-bold text-white">{territories.length} Active Markets</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-medium block">Primary Core Market</span>
            <span className="text-sm font-bold text-emerald-300 truncate block max-w-[150px]">
              {primaryTerritory ? primaryTerritory.name : 'Not set'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-medium block">ZIP Codes Targeted</span>
            <span className="text-lg font-bold text-sky-300">{totalZipCodesCount} Target ZIPs</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-medium block">Cash Buyer Network</span>
            <span className="text-lg font-bold text-purple-300">{buyers.length} Verified Buyers</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, state, name, or ZIP code..."
            className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">Status Filter:</span>
          {(['ALL', 'PRIMARY', 'ACTIVE', 'EXPANDING', 'INACTIVE'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status === 'ALL' ? 'All Territories' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Territory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTerritories.map((territory) => {
          const metrics = getTerritoryMetrics(territory);
          const isFilterActive = selectedTerritoryId === territory.id;

          const statusBadges: Record<TerritoryStatus, { color: string; label: string }> = {
            PRIMARY: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', label: 'PRIMARY MARKET' },
            ACTIVE: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'ACTIVE' },
            EXPANDING: { color: 'bg-sky-500/20 text-sky-400 border-sky-500/40', label: 'EXPANDING' },
            INACTIVE: { color: 'bg-slate-800 text-slate-400 border-slate-700', label: 'INACTIVE' },
          };

          return (
            <div
              key={territory.id}
              className={`bg-slate-900/90 rounded-2xl border transition-all hover:border-amber-500/40 flex flex-col justify-between overflow-hidden relative shadow-lg ${
                isFilterActive
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-slate-900'
                  : 'border-slate-800'
              }`}
            >
              {/* Top Accent bar */}
              <div
                className={`h-1.5 w-full ${
                  territory.status === 'PRIMARY'
                    ? 'bg-emerald-500'
                    : territory.status === 'EXPANDING'
                    ? 'bg-sky-500'
                    : territory.status === 'ACTIVE'
                    ? 'bg-amber-500'
                    : 'bg-slate-700'
                }`}
              />

              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {territory.state}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          statusBadges[territory.status].color
                        }`}
                      >
                        {statusBadges[territory.status].label}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5 line-clamp-1">
                      {territory.name}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(territory)}
                      title="Edit Territory"
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTerritoryId(territory.id)}
                      title="Delete Territory"
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cities & ZIPs tags */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px] mb-1 uppercase tracking-wide">
                      Counties / Cities Covered:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {territory.countiesOrCities.map((city: any) => (
                        <span
                          key={city}
                          className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] border border-slate-700/60"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block text-[11px] mb-1 uppercase tracking-wide">
                      Target ZIP Codes ({territory.zipCodes.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {territory.zipCodes.map((zip: any) => (
                        <span
                          key={zip}
                          className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded font-mono text-[11px] border border-amber-500/20"
                        >
                          {zip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target Strategy Parameters */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                      <Percent className="w-3.5 h-3.5 text-amber-400" />
                      <span>Target Discount</span>
                    </div>
                    <span className="font-bold text-amber-300 text-sm block mt-0.5">
                      {territory.targetDiscountRate}% ARV Rule
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Avg Wholesale Fee</span>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm block mt-0.5">
                      ${territory.avgWholesaleFee.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Live Territory Activity Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-center text-xs">
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">Deals</span>
                    <span className="font-extrabold text-white text-sm">{metrics.totalLeads}</span>
                    {metrics.underContract > 0 && (
                      <span className="text-[10px] text-emerald-400 block font-semibold">
                        ({metrics.underContract} contracted)
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">Calls</span>
                    <span className="font-extrabold text-emerald-400 text-sm">{metrics.totalCalls}</span>
                  </div>

                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">Buyers</span>
                    <span className="font-extrabold text-purple-300 text-sm">{metrics.matchedBuyersCount}</span>
                  </div>
                </div>

                {/* Strategy Notes */}
                {territory.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 line-clamp-2">
                    "{territory.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Card Footer Action */}
              <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onSelectTerritoryFilter(isFilterActive ? null : territory.id)}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    isFilterActive
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isFilterActive ? 'Active CRM View Filter' : 'Set Active CRM View Filter'}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredTerritories.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Territories Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No wholesaling territories match your current filter search. Try clearing filters or create a new territory.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/20"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT TERRITORY MODAL */}
      {(isAddModalOpen || editingTerritory) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {editingTerritory ? 'Edit Territory Details' : 'Add New Target Territory'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure target ZIP codes, discount rules, and fee expectations.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTerritory(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs flex-1">
                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Territory Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sangamon County / Springfield Metro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    State Abbreviation *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="IL"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs sm:text-sm uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Territory Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as TerritoryStatus,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="PRIMARY">PRIMARY CORE MARKET</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPANDING">EXPANDING</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Counties & Key Cities (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Springfield, Chatham, Rochester, Sherman"
                  value={formData.countiesOrCities}
                  onChange={(e) =>
                    setFormData({ ...formData, countiesOrCities: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target ZIP Codes (Comma separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 62701, 62702, 62703, 62704"
                  value={formData.zipCodes}
                  onChange={(e) => setFormData({ ...formData, zipCodes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target MAO ARV Rule %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      max={90}
                      value={formData.targetDiscountRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetDiscountRate: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg pl-3 pr-8 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Avg Wholesale Fee Goal ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      step={1000}
                      value={formData.avgWholesaleFee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          avgWholesaleFee: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg pl-7 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Market Strategy & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes on agent relationships, buyer appetite, local comps, title company preferences..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              </div>

              <div className="flex items-center justify-end space-x-3 p-4 bg-slate-950/90 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTerritory(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-amber-950/40 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingTerritory
                    ? 'Update Territory'
                    : 'Save New Territory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingTerritoryId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Delete Territory?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove this territory? Leads assigned to this territory will remain in your CRM without a specified territory link.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeletingTerritoryId(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-md shadow-rose-950/50"
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
