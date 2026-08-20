import React, { useState, useEffect } from 'react';
import {
    MapPin,
    X,
    UserCheck,
    UserPlus,
    Building2,
    Landmark,
    Users,
} from 'lucide-react';

import { Header } from './Header';
import { Navigation } from './Navigation';
import { KanbanBoard } from './Pipeline/KanbanBoard';
import { CallLogList } from './CallLog/CallLogList';
import { CallLogModal } from './CallLog/CallLogModal';
import { ValuationTool } from './Valuation/ValuationTool';
import { FollowUpQueue } from './FollowUp/FollowUpQueue';
import { BuyersDirectory } from './Buyers/BuyersDirectory';
import { AnalyticsDashboard } from './Analytics/AnalyticsDashboard';
import { LeadDetailDrawer } from './LeadDetail/LeadDetailDrawer';
import { AddLeadModal } from './Lead/AddLeadModal';
import { TerritoriesDirectory } from './Territory/TerritoriesDirectory';
import { ContactsDirectory } from './Contacts/ContactsDirectory';
import { TitleCompaniesDirectory } from './TitleCompany/TitleCompaniesDirectory';
import { PropertiesDirectory } from './Properties/PropertiesDirectory';
import { SellersDirectory } from './Sellers/SellersDirectory';
import { RealtorsDirectory } from './Realtors/RealtorsDirectory';

import type {
    Lead,
    CallLog,
    Buyer,
    LeadStage,
    Territory,
    TitleCompany,
    Contact,
    Property,
} from '@/types/dealflow';

import {
    fetchLeads,
    fetchCallLogs,
    fetchBuyers,
    fetchTerritories,
    fetchTitleCompanies,
    fetchContacts,
    fetchProperties,
    createLead,
    updateLead,
    deleteLead,
    createCallLog,
    updateCallLog,
    deleteCallLog,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    createTerritory,
    updateTerritory,
    deleteTerritory,
    createTitleCompany,
    updateTitleCompany,
    deleteTitleCompany,
    createContact,
    updateContact,
    deleteContact,
    createProperty,
    updateProperty,
    deleteProperty,
} from '@/services/dealflow';

export default function DealFlowApp() {
    const [activeTab, setActiveTab] = useState<string>('pipeline');

    const [leads, setLeads] = useState<Lead[]>([]);
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [buyers, setBuyers] = useState<Buyer[]>([]);
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [titleCompanies, setTitleCompanies] = useState<TitleCompany[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);

    const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isCallDialerOpen, setIsCallDialerOpen] = useState<boolean>(false);
    const [dialerLead, setDialerLead] = useState<Lead | undefined>(undefined);
    const [dialerPhone, setDialerPhone] = useState<string | undefined>(undefined);
    const [dialerContactName, setDialerContactName] = useState<string | undefined>(undefined);

    const [isAddLeadOpen, setIsAddLeadOpen] = useState<boolean>(false);
    const [selectedDetailLead, setSelectedDetailLead] = useState<Lead | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

    const loadData = async () => {
        setIsLoading(true);

        try {
            const [
                lData,
                cData,
                bData,
                tData,
                tcData,
                contactsData,
                propsData,
            ] = await Promise.all([
                fetchLeads(),
                fetchCallLogs(),
                fetchBuyers(),
                fetchTerritories(),
                fetchTitleCompanies(),
                fetchContacts(),
                fetchProperties(),
            ]);

            setLeads(lData);
            setCallLogs(cData);
            setBuyers(bData);
            setTerritories(tData);
            setTitleCompanies(tcData);
            setContacts(contactsData);
            setProperties(propsData);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const handleOpenDialer = (
        lead?: Lead,
        contactPhone?: string,
        contactName?: string,
    ) => {
        setDialerLead(lead);
        setDialerPhone(contactPhone);
        setDialerContactName(contactName);
        setIsCallDialerOpen(true);
    };

    const handleSaveCall = async (callData: any) => {
        const newCall = await createCallLog(callData);

        setCallLogs((prev) => [newCall, ...prev]);

        const refreshedLeads = await fetchLeads();
        setLeads(refreshedLeads);

        if (selectedDetailLead) {
            const updated = refreshedLeads.find((l) => l.id === selectedDetailLead.id);

            if (updated) {
                setSelectedDetailLead(updated);
            }
        }
    };

    const handleSaveLead = async (leadData: Partial<Lead>): Promise<void> => {
    const created = await createLead(leadData);

    setLeads((prev) => [created, ...prev]);
};

    const handleUpdateLead = async (updatedLead: Lead) => {
        const saved = await updateLead(updatedLead.id, updatedLead);

        setLeads((prev) => prev.map((l) => (l.id === saved.id ? saved : l)));

        if (selectedDetailLead?.id === saved.id) {
            setSelectedDetailLead(saved);
        }
    };

    const handleStageChange = async (leadId: string, newStage: LeadStage) => {
        const target = leads.find((l) => l.id === leadId);

        if (!target) return;

        const updated = {
            ...target,
            stage: newStage,
        };

        await handleUpdateLead(updated);
    };

    const handleDeleteLead = async (leadId: string) => {
        await deleteLead(leadId);

        setLeads((prev) => prev.filter((l) => l.id !== leadId));

        if (selectedDetailLead?.id === leadId) {
            setSelectedDetailLead(null);
            setIsDetailOpen(false);
        }
    };

    const handleAddBuyer = async (buyerData: Partial<Buyer>) => {
        const created = await createBuyer(buyerData);

        setBuyers((prev) => [created, ...prev]);
    };

    const handleUpdateBuyer = async (id: string, buyerData: Partial<Buyer>) => {
        const updated = await updateBuyer(id, buyerData);

        setBuyers((prev) => prev.map((b) => (b.id === id ? updated : b)));
    };

    const handleDeleteBuyer = async (id: string) => {
        await deleteBuyer(id);

        setBuyers((prev) => prev.filter((b) => b.id !== id));
    };

    const handleUpdateCallLog = async (updatedCallLog: CallLog) => {
    const saved = await updateCallLog(updatedCallLog.id, updatedCallLog);

    setCallLogs((prev) =>
        prev.map((c) => (c.id === saved.id ? saved : c)),
    );
};

    const handleDeleteCallLog = async (id: string) => {
        await deleteCallLog(id);

        setCallLogs((prev) => prev.filter((c) => c.id !== id));
    };

    const handleAddTerritory = async (territoryData: Partial<Territory>) => {
        const created = await createTerritory(territoryData);

        setTerritories((prev) => [created, ...prev]);
    };

    const handleUpdateTerritory = async (
        id: string,
        territoryData: Partial<Territory>,
    ) => {
        const updated = await updateTerritory(id, territoryData);

        setTerritories((prev) => prev.map((t) => (t.id === id ? updated : t)));
    };

    const handleDeleteTerritory = async (id: string) => {
        await deleteTerritory(id);

        setTerritories((prev) => prev.filter((t) => t.id !== id));
    };

    const handleAddTitleCompany = async (data: Partial<TitleCompany>) => {
        const created = await createTitleCompany(data);

        setTitleCompanies((prev) => [created, ...prev]);
    };

    const handleUpdateTitleCompany = async (
        id: string,
        data: Partial<TitleCompany>,
    ) => {
        const updated = await updateTitleCompany(id, data);

        setTitleCompanies((prev) => prev.map((tc) => (tc.id === id ? updated : tc)));
    };

    const handleDeleteTitleCompany = async (id: string) => {
        await deleteTitleCompany(id);

        setTitleCompanies((prev) => prev.filter((tc) => tc.id !== id));
    };

    const handleCreateContact = async (data: Partial<Contact>) => {
        const created = await createContact(data);

        setContacts((prev) => [created, ...prev]);
    };

    const handleUpdateContact = async (data: Partial<Contact>) => {
        const id = data.id;

        if (!id) return;

        const updated = await updateContact(id, data);

        setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    };

    const handleDeleteContact = async (id: string) => {
        await deleteContact(id);

        setContacts((prev) => prev.filter((c) => c.id !== id));
    };

    const handleCreateProperty = async (data: Partial<Property>) => {
        const created = await createProperty(data);

        setProperties((prev) => [created, ...prev]);
    };

    const handleUpdateProperty = async (data: Partial<Property>) => {
        const id = data.id;

        if (!id) return;

        const updated = await updateProperty(id, data);

        setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
    };

    const handleDeleteProperty = async (id: string) => {
        await deleteProperty(id);

        setProperties((prev) => prev.filter((p) => p.id !== id));
    };

    const handleOpenLeadDetail = (leadOrId: Lead | string) => {
        if (typeof leadOrId === 'string') {
            const found = leads.find((l) => l.id === leadOrId);

            if (found) {
                setSelectedDetailLead(found);
                setIsDetailOpen(true);
            }

            return;
        }

        setSelectedDetailLead(leadOrId);
        setIsDetailOpen(true);
    };

    const activeTerritory = territories.find((t) => t.id === selectedTerritoryId);

    const displayLeads = selectedTerritoryId
        ? leads.filter(
              (l) =>
                  l.territoryId === selectedTerritoryId ||
                  Boolean(activeTerritory && activeTerritory.zipCodes.includes(l.zip)),
          )
        : leads;

    const displayLeadIds = new Set(displayLeads.map((l) => l.id));

    const displayCalls = selectedTerritoryId
        ? callLogs.filter(
              (c) =>
                  Boolean(c.leadId && displayLeadIds.has(c.leadId)) ||
                  displayLeads.some((l) => l.propertyAddress === c.leadAddress) ||
                  Boolean(
                      activeTerritory &&
                          activeTerritory.zipCodes.some(
                              (z) => c.leadAddress?.includes(z) ?? false,
                          ),
                  ),
          )
        : callLogs;

    const displayBuyers =
        selectedTerritoryId && activeTerritory
            ? buyers.filter((b) =>
                  b.targetZipCodes.some((z: any) => activeTerritory.zipCodes.includes(z)),
              )
            : buyers;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
            <Header
                leads={leads}
                callLogs={callLogs}
                territories={territories}
                selectedTerritoryId={selectedTerritoryId}
                onSelectTerritoryFilter={setSelectedTerritoryId}
                onOpenCallDialer={handleOpenDialer}
                onOpenAddLeadModal={() => setIsAddLeadOpen(true)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-3">
                        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-400">
                            Loading Wholesaling Deals & Call Hub...
                        </span>
                    </div>
                ) : (
                    <>
                        {activeTerritory && (
                            <div className="mb-5 p-3.5 bg-slate-900/90 border border-amber-500/40 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center space-x-2.5">
                                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                                                Active Territory View:
                                            </span>
                                            <span className="text-xs font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                                                {activeTerritory.name} ({activeTerritory.state})
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Niched down view:{' '}
                                            <strong className="text-slate-200">
                                                {displayLeads.length}
                                            </strong>{' '}
                                            active deals •{' '}
                                            <strong className="text-slate-200">
                                                {displayCalls.length}
                                            </strong>{' '}
                                            calls logged •{' '}
                                            <strong className="text-slate-200">
                                                {displayBuyers.length}
                                            </strong>{' '}
                                            matched cash buyers
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedTerritoryId(null)}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                                >
                                    <X className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Clear Filter (Global View)</span>
                                </button>
                            </div>
                        )}

                        {['contacts', 'sellers', 'realtors', 'title-companies', 'buyers'].includes(
                            activeTab,
                        ) && (
                            <div className="mb-4 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-md">
                                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
                                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5 shrink-0">
                                        <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Contacts
                                        Sub-Menu:
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('contacts')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                            activeTab === 'contacts'
                                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                        }`}
                                    >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>All Contacts</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('sellers')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                            activeTab === 'sellers'
                                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                        }`}
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        <span>Sellers (Off-Market)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('realtors')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                            activeTab === 'realtors'
                                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                        }`}
                                    >
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>Realtors & Agents</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('title-companies')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                            activeTab === 'title-companies'
                                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                        }`}
                                    >
                                        <Landmark className="w-3.5 h-3.5" />
                                        <span>Title & Escrow</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('buyers')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                            activeTab === 'buyers'
                                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                        }`}
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                        <span>Dispo & Cash Buyers</span>
                                    </button>
                                </div>

                                <div className="hidden md:flex items-center text-[10px] text-slate-400 px-2 font-mono">
                                    <span>Organized Contact Directories</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pipeline' && (
                            <KanbanBoard
                                leads={displayLeads}
                                onOpenDetail={handleOpenLeadDetail}
                                onOpenDialer={handleOpenDialer}
                                onOpenAddLeadModal={() => setIsAddLeadOpen(true)}
                                onStageChange={handleStageChange}
                                onUpdateLead={handleSaveLead}
                                onDeleteLead={handleDeleteLead}
                            />
                        )}

                        {activeTab === 'properties' && (
                            <PropertiesDirectory
                                properties={properties}
                                leads={displayLeads}
                                contacts={contacts}
                                buyers={displayBuyers}
                                titleCompanies={titleCompanies}
                                territories={territories}
                                selectedTerritoryId={selectedTerritoryId}
                                onOpenCallDialer={handleOpenDialer}
                                onOpenLeadDetail={handleOpenLeadDetail}
                                onCreateProperty={handleCreateProperty}
                                onUpdateProperty={handleUpdateProperty}
                                onDeleteProperty={handleDeleteProperty}
                                onSaveLead={handleSaveLead}
                                onCreateContact={handleCreateContact}
                            />
                        )}

                        {activeTab === 'calls' && (
                            <CallLogList
                                callLogs={displayCalls}
                                leads={displayLeads}
                                onOpenCallDialer={handleOpenDialer}
                                onOpenLeadDetail={handleOpenLeadDetail}
                                onUpdateCallLog={handleUpdateCallLog}
                                onDeleteCallLog={handleDeleteCallLog}
                            />
                        )}

                        {activeTab === 'territories' && (
                            <TerritoriesDirectory
                                territories={territories}
                                leads={leads}
                                callLogs={callLogs}
                                buyers={buyers}
                                selectedTerritoryId={selectedTerritoryId}
                                onSelectTerritoryFilter={setSelectedTerritoryId}
                                onAddTerritory={handleAddTerritory}
                                onUpdateTerritory={handleUpdateTerritory}
                                onDeleteTerritory={handleDeleteTerritory}
                            />
                        )}

                        {activeTab === 'sellers' && (
                            <SellersDirectory
                                contacts={contacts}
                                leads={displayLeads}
                                buyers={displayBuyers}
                                callLogs={displayCalls}
                                titleCompanies={titleCompanies}
                                territories={territories}
                                onOpenCallDialer={handleOpenDialer}
                                onOpenLeadDetail={handleOpenLeadDetail}
                                onCreateContact={handleCreateContact}
                                onUpdateContact={handleUpdateContact}
                                onDeleteContact={handleDeleteContact}
                            />
                        )}

                        {activeTab === 'realtors' && (
                            <RealtorsDirectory
                                contacts={contacts}
                                leads={displayLeads}
                                buyers={displayBuyers}
                                callLogs={displayCalls}
                                titleCompanies={titleCompanies}
                                territories={territories}
                                onOpenCallDialer={handleOpenDialer}
                                onOpenLeadDetail={handleOpenLeadDetail}
                                onCreateContact={handleCreateContact}
                                onUpdateContact={handleUpdateContact}
                                onDeleteContact={handleDeleteContact}
                                onCreateProperty={handleCreateProperty}
                                onSaveLead={handleSaveLead}
                            />
                        )}

                        {activeTab === 'contacts' && (
                            <ContactsDirectory
                                contacts={contacts}
                                leads={displayLeads}
                                buyers={displayBuyers}
                                callLogs={displayCalls}
                                titleCompanies={titleCompanies}
                                territories={territories}
                                onOpenCallDialer={handleOpenDialer}
                                onOpenLeadDetail={handleOpenLeadDetail}
                                onCreateContact={handleCreateContact}
                                onUpdateContact={handleUpdateContact}
                                onDeleteContact={handleDeleteContact}
                                onCreateProperty={handleCreateProperty}
                                onSaveLead={handleSaveLead}
                            />
                        )}

                        {activeTab === 'title-companies' && (
                            <TitleCompaniesDirectory
                                titleCompanies={titleCompanies}
                                leads={leads}
                                onAddTitleCompany={handleAddTitleCompany}
                                onUpdateTitleCompany={handleUpdateTitleCompany}
                                onDeleteTitleCompany={handleDeleteTitleCompany}
                                onOpenLeadDetail={(leadId: string) => handleOpenLeadDetail(leadId)}
                            />
                        )}

                        {activeTab === 'valuation' && <ValuationTool />}

                        {activeTab === 'followups' && (
                            <FollowUpQueue
                                leads={displayLeads}
                                onOpenDialer={handleOpenDialer}
                                onOpenDetail={handleOpenLeadDetail}
                            />
                        )}

                        {activeTab === 'buyers' && (
                            <BuyersDirectory
                                buyers={displayBuyers}
                                onAddBuyer={handleAddBuyer}
                                onUpdateBuyer={handleUpdateBuyer}
                                onDeleteBuyer={handleDeleteBuyer}
                            />
                        )}

                        {activeTab === 'analytics' && (
                            <AnalyticsDashboard leads={displayLeads} callLogs={displayCalls} />
                        )}
                    </>
                )}
            </main>

            <CallLogModal
                isOpen={isCallDialerOpen}
                onClose={() => setIsCallDialerOpen(false)}
                leads={leads}
                callLogs={callLogs}
                properties={properties}
                selectedLead={dialerLead}
                initialPhone={dialerPhone}
                initialContactName={dialerContactName}
                contacts={contacts}
                buyers={displayBuyers}
                titleCompanies={titleCompanies}
                territories={territories}
                selectedTerritoryId={selectedTerritoryId}
                onSaveCall={handleSaveCall}
                onCreateContact={handleCreateContact}
                onAddBuyer={handleAddBuyer}
                onAddTitleCompany={handleAddTitleCompany}
                onCreateProperty={handleCreateProperty}
                onSaveLead={handleSaveLead}
            />

            <AddLeadModal
                isOpen={isAddLeadOpen}
                onClose={() => setIsAddLeadOpen(false)}
                onSaveLead={handleSaveLead}
                territories={territories}
                contacts={contacts}
                properties={properties}
                leads={leads}
            />

            <LeadDetailDrawer
                lead={selectedDetailLead}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                callLogs={callLogs}
                buyers={buyers}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                onOpenDialer={handleOpenDialer}
            />
        </div>
    );
}
