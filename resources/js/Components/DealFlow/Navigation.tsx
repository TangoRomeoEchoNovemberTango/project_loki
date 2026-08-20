import React, { useState, useRef, useEffect } from 'react';
import {
  Kanban,
  PhoneCall,
  Calculator,
  CalendarClock,
  Users,
  BarChart2,
  MapPin,
  UserCheck,
  Landmark,
  Building,
  Building2,
  UserPlus,
  ChevronDown,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unresolvedCallsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  unresolvedCallsCount = 0,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Close any open dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pipelineSubItems = [
    {
      id: 'pipeline',
      label: 'Deals & Pipeline',
      subtitle: 'Kanban Board & Lead Pipeline',
      icon: Kanban,
      badge: 'Kanban',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'properties',
      label: 'Property Assets',
      subtitle: 'Property Database & Vault',
      icon: Building,
      badge: 'Assets',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'analytics',
      label: 'Analytics & Performance',
      subtitle: 'KPIs, Conversion & Call Rates',
      icon: BarChart2,
      badge: 'Metrics',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  const contactSubItems = [
    {
      id: 'contacts',
      label: 'All Contacts',
      subtitle: 'General Directory & Roles',
      icon: UserCheck,
      badge: 'Main',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'sellers',
      label: 'Sellers',
      subtitle: 'Off-Market & Distressed Lists',
      icon: UserPlus,
      badge: 'Off-Market',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'realtors',
      label: 'Realtors',
      subtitle: 'Listing Agents & MLS',
      icon: Building2,
      badge: 'Agents',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    {
      id: 'title-companies',
      label: 'Title Companies',
      subtitle: 'Escrow Officers & Closers',
      icon: Landmark,
      badge: 'Escrow',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'buyers',
      label: 'Dispo & Buyers',
      subtitle: 'VIP Cash Buyers & Investors',
      icon: Users,
      badge: 'Buyers',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  const toolsSubItems = [
    {
      id: 'territories',
      label: 'My Territories',
      subtitle: 'Geographic Markets & Coverage',
      icon: MapPin,
      badge: 'Map',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    {
      id: 'valuation',
      label: 'Valuation & MAO',
      subtitle: '70% Rule & Profit Calculator',
      icon: Calculator,
      badge: 'MAO',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  const isPipelineGroupActive = ['pipeline', 'properties', 'analytics'].includes(activeTab);
  const activePipelineSubItem = pipelineSubItems.find((item) => item.id === activeTab);

  const isContactGroupActive = ['contacts', 'sellers', 'realtors', 'title-companies', 'buyers'].includes(activeTab);
  const activeContactSubItem = contactSubItems.find((item) => item.id === activeTab);

  const isToolsGroupActive = ['territories', 'valuation'].includes(activeTab);
  const activeToolsSubItem = toolsSubItems.find((item) => item.id === activeTab);

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-[61px] z-40 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8" ref={navContainerRef}>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 py-2 overflow-visible">
          
          {/* 1. DEALS & PIPELINE DROPDOWN GROUP */}
          <div className="relative inline-block">
            <button
              id="nav-tab-pipeline-group"
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'pipeline' ? null : 'pipeline')}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                isPipelineGroupActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/40 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800/80'
              }`}
            >
              <Kanban className={`w-4 h-4 ${isPipelineGroupActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Deals & Pipeline</span>

              {isPipelineGroupActive && activePipelineSubItem && (
                <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase font-mono border border-amber-500/30">
                  {activePipelineSubItem.id === 'properties' ? 'Properties' : activePipelineSubItem.id === 'analytics' ? 'Analytics' : 'Pipeline'}
                </span>
              )}

              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'pipeline' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'pipeline' && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-fadeIn divide-y divide-slate-800/60 ring-1 ring-black/5">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center justify-between">
                  <span>📊 Deal Management</span>
                  <span className="text-[9px] text-slate-400 font-normal">Sub-Menu</span>
                </div>

                <div className="pt-1.5 space-y-1">
                  {pipelineSubItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeTab === sub.id;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(sub.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
                          isSubActive
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-1.5 rounded-lg ${isSubActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            <SubIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold block">{sub.label}</span>
                            <span className="text-[10px] text-slate-400 block">{sub.subtitle}</span>
                          </div>
                        </div>

                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold ${sub.badgeColor}`}>
                          {sub.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. CALL LOG HUB */}
          <button
            id="nav-tab-calls"
            type="button"
            onClick={() => setActiveTab('calls')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
              activeTab === 'calls'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20'
                : 'bg-slate-950/40 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800/80'
            }`}
          >
            <PhoneCall className={`w-4 h-4 ${activeTab === 'calls' ? 'text-slate-950' : 'text-slate-400'}`} />
            <span>Call Log Hub</span>
            {activeTab !== 'calls' && (
              <span className="text-[10px] px-1.5 py-0.2 font-semibold rounded border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                Core
              </span>
            )}
          </button>

          {/* 4. CONTACTS DROPDOWN GROUP */}
          <div className="relative inline-block">
            <button
              id="nav-tab-contacts-group"
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'contacts' ? null : 'contacts')}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                isContactGroupActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/40 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800/80'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${isContactGroupActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Contacts</span>

              {isContactGroupActive && activeContactSubItem && (
                <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase font-mono border border-amber-500/30">
                  {activeContactSubItem.label}
                </span>
              )}

              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'contacts' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'contacts' && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-fadeIn divide-y divide-slate-800/60 ring-1 ring-black/5">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center justify-between">
                  <span>📁 Contact Directories</span>
                  <span className="text-[9px] text-slate-400 font-normal">Sub-Modules</span>
                </div>

                <div className="pt-1.5 space-y-1">
                  {contactSubItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeTab === sub.id;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(sub.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
                          isSubActive
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-1.5 rounded-lg ${isSubActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            <SubIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold block">{sub.label}</span>
                            <span className="text-[10px] text-slate-400 block">{sub.subtitle}</span>
                          </div>
                        </div>

                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold ${sub.badgeColor}`}>
                          {sub.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. FOLLOW-UPS */}
          <button
            id="nav-tab-followups"
            type="button"
            onClick={() => setActiveTab('followups')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
              activeTab === 'followups'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20'
                : 'bg-slate-950/40 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800/80'
            }`}
          >
            <CalendarClock className={`w-4 h-4 ${activeTab === 'followups' ? 'text-slate-950' : 'text-slate-400'}`} />
            <span>Follow-ups</span>
          </button>

          {/* 6. TOOLS & SETTINGS DROPDOWN GROUP */}
          <div className="relative inline-block">
            <button
              id="nav-tab-tools-group"
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'tools' ? null : 'tools')}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                isToolsGroupActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/40 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800/80'
              }`}
            >
              <Wrench className={`w-4 h-4 ${isToolsGroupActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Tools & Settings</span>

              {isToolsGroupActive && activeToolsSubItem && (
                <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase font-mono border border-amber-500/30">
                  {activeToolsSubItem.label}
                </span>
              )}

              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'tools' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'tools' && (
              <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-fadeIn divide-y divide-slate-800/60 ring-1 ring-black/5">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center justify-between">
                  <span>🛠️ Wholesale Utilities</span>
                  <span className="text-[9px] text-slate-400 font-normal">Tools</span>
                </div>

                <div className="pt-1.5 space-y-1">
                  {toolsSubItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeTab === sub.id;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(sub.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
                          isSubActive
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-1.5 rounded-lg ${isSubActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            <SubIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold block">{sub.label}</span>
                            <span className="text-[10px] text-slate-400 block">{sub.subtitle}</span>
                          </div>
                        </div>

                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold ${sub.badgeColor}`}>
                          {sub.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};


