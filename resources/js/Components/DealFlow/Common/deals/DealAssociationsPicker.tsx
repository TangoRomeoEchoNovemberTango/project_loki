import React, { useState, useMemo } from 'react';
import { Users, Building2, PhoneCall, Plus, X, Search, Link2 } from 'lucide-react';
import type { Contact, Property, CallLog } from '@/types/dealflow';

export type AssociationTab = 'contacts' | 'properties' | 'callLogs';

interface DealAssociationsPickerProps {
  // Current selections (IDs)
  selectedContactIds: string[];
  selectedPropertyIds: string[];
  selectedCallLogIds: string[];
  
  // Handlers for changes
  onChangeContacts: (ids: string[]) => void;
  onChangeProperties: (ids: string[]) => void;
  onChangeCallLogs: (ids: string[]) => void;
  
  // Database arrays to search through
  contacts: Contact[];
  properties: Property[];
  callLogs: CallLog[];
}

export const DealAssociationsPicker: React.FC<DealAssociationsPickerProps> = ({
  selectedContactIds,
  selectedPropertyIds,
  selectedCallLogIds,
  onChangeContacts,
  onChangeProperties,
  onChangeCallLogs,
  contacts,
  properties,
  callLogs,
}) => {
  const [activeTab, setActiveTab] = useState<AssociationTab>('contacts');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to toggle IDs in an array
  const toggleId = (id: string, currentIds: string[], onChange: (ids: string[]) => void) => {
    if (currentIds.includes(id)) {
      onChange(currentIds.filter((i) => i !== id));
    } else {
      onChange([...currentIds, id]);
    }
  };

  // Filter logic based on active tab and search query
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (activeTab === 'contacts') {
      return contacts.filter((c) => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) || 
        c.phone.includes(query)
      );
    }
    if (activeTab === 'properties') {
      return properties.filter((p) => 
        `${p.streetAddress} ${p.city}`.toLowerCase().includes(query)
      );
    }
    if (activeTab === 'callLogs') {
      return callLogs.filter((c) => 
        c.notes?.toLowerCase().includes(query) || 
        c.contactName?.toLowerCase().includes(query)
      );
    }
    return [];
  }, [activeTab, searchQuery, contacts, properties, callLogs]);

  // Get currently linked items for the active tab
  const linkedItems = useMemo(() => {
    if (activeTab === 'contacts') return contacts.filter((c) => selectedContactIds.includes(c.id));
    if (activeTab === 'properties') return properties.filter((p) => selectedPropertyIds.includes(p.id));
    if (activeTab === 'callLogs') return callLogs.filter((c) => selectedCallLogIds.includes(c.id));
    return [];
  }, [activeTab, selectedContactIds, selectedPropertyIds, selectedCallLogIds, contacts, properties, callLogs]);

  const tabs = [
    { id: 'contacts' as const, label: 'Contacts', icon: Users, count: selectedContactIds.length },
    { id: 'properties' as const, label: 'Properties', icon: Building2, count: selectedPropertyIds.length },
    { id: 'callLogs' as const, label: 'Call Logs', icon: PhoneCall, count: selectedCallLogIds.length },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header & Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <Link2 className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Deal Associations</h3>
        </div>
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors border-b-2
                ${activeTab === tab.id 
                  ? 'text-amber-400 border-amber-400 bg-slate-900' 
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/50'}
              `}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search existing ${activeTab}...`}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Linked Items (Currently Attached) */}
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Currently Linked ({linkedItems.length})
          </p>
          {linkedItems.length === 0 ? (
            <div className="text-xs text-slate-600 italic py-2">No {activeTab} linked yet.</div>
          ) : (
            <div className="space-y-1.5">
              {linkedItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg group">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-300 font-medium truncate">
                      {item.firstName ? `${item.firstName} ${item.lastName}` : item.streetAddress || item.notes || 'Untitled'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleId(item.id, activeTab === 'contacts' ? selectedContactIds : activeTab === 'properties' ? selectedPropertyIds : selectedCallLogIds, activeTab === 'contacts' ? onChangeContacts : activeTab === 'properties' ? onChangeProperties : onChangeCallLogs)}
                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Unlink"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800" />

        {/* Search Results (Available to Link) */}
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Available to Link
          </p>
          {filteredItems.length === 0 ? (
            <div className="text-xs text-slate-600 italic py-2">
              {searchQuery ? 'No matches found.' : `Type to search ${activeTab}.`}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {filteredItems.map((item: any) => {
                const isSelected = 
                  (activeTab === 'contacts' && selectedContactIds.includes(item.id)) ||
                  (activeTab === 'properties' && selectedPropertyIds.includes(item.id)) ||
                  (activeTab === 'callLogs' && selectedCallLogIds.includes(item.id));
                
                return (
                  <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                    isSelected ? 'bg-slate-800/50 border-slate-700 opacity-50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-slate-300 truncate">
                        {item.firstName ? `${item.firstName} ${item.lastName}` : item.streetAddress || item.notes || 'Untitled'}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isSelected}
                      onClick={() => toggleId(item.id, activeTab === 'contacts' ? selectedContactIds : activeTab === 'properties' ? selectedPropertyIds : selectedCallLogIds, activeTab === 'contacts' ? onChangeContacts : activeTab === 'properties' ? onChangeProperties : onChangeCallLogs)}
                      className={`
                        flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-colors
                        ${isSelected 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                          : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'}
                      `}
                    >
                      {isSelected ? 'Linked' : <><Plus className="w-3 h-3" /> Add</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};