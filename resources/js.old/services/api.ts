import { Lead, CallLog, Buyer, AISummary, Territory, TitleCompany, Contact, Property } from '../types';

export async function fetchProperties(): Promise<Property[]> {
  const res = await fetch('/api/properties');
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
}

export async function createProperty(data: Partial<Property>): Promise<Property> {
  const res = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create property');
  return res.json();
}

export async function updateProperty(id: string, data: Partial<Property>): Promise<Property> {
  const res = await fetch(`/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update property');
  return res.json();
}

export async function deleteProperty(id: string): Promise<void> {
  const res = await fetch(`/api/properties/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete property');
}

export async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch('/api/contacts');
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
}

export async function createContact(contactData: Partial<Contact>): Promise<Contact> {
  const res = await fetch('/api/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });
  if (!res.ok) throw new Error('Failed to create contact');
  return res.json();
}

export async function updateContact(id: string, contactData: Partial<Contact>): Promise<Contact> {
  const res = await fetch(`/api/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });
  if (!res.ok) throw new Error('Failed to update contact');
  return res.json();
}

export async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`/api/contacts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete contact');
}

export async function fetchLeads(): Promise<Lead[]> {
  const res = await fetch('/api/leads');
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function createLead(leadData: Partial<Lead>): Promise<Lead> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  if (!res.ok) throw new Error('Failed to create lead');
  return res.json();
}

export async function updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  if (!res.ok) throw new Error('Failed to update lead');
  return res.json();
}

export async function deleteLead(id: string): Promise<void> {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete lead');
}

export async function fetchCallLogs(): Promise<CallLog[]> {
  const res = await fetch('/api/calls');
  if (!res.ok) throw new Error('Failed to fetch call logs');
  return res.json();
}

export async function createCallLog(callData: Partial<CallLog>): Promise<CallLog> {
  const res = await fetch('/api/calls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(callData),
  });
  if (!res.ok) throw new Error('Failed to log call');
  return res.json();
}

export async function updateCallLog(id: string, callData: Partial<CallLog>): Promise<CallLog> {
  const res = await fetch(`/api/calls/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(callData),
  });
  if (!res.ok) throw new Error('Failed to update call log');
  return res.json();
}

export async function deleteCallLog(id: string): Promise<void> {
  const res = await fetch(`/api/calls/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete call log');
}

export async function fetchBuyers(): Promise<Buyer[]> {
  const res = await fetch('/api/buyers');
  if (!res.ok) throw new Error('Failed to fetch buyers');
  return res.json();
}

export async function createBuyer(buyerData: Partial<Buyer>): Promise<Buyer> {
  const res = await fetch('/api/buyers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buyerData),
  });
  if (!res.ok) throw new Error('Failed to create buyer');
  return res.json();
}

export async function updateBuyer(id: string, buyerData: Partial<Buyer>): Promise<Buyer> {
  const res = await fetch(`/api/buyers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buyerData),
  });
  if (!res.ok) throw new Error('Failed to update buyer');
  return res.json();
}

export async function deleteBuyer(id: string): Promise<void> {
  const res = await fetch(`/api/buyers/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete buyer');
}

export async function fetchTerritories(): Promise<Territory[]> {
  const res = await fetch('/api/territories');
  if (!res.ok) throw new Error('Failed to fetch territories');
  return res.json();
}

export async function createTerritory(territoryData: Partial<Territory>): Promise<Territory> {
  const res = await fetch('/api/territories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(territoryData),
  });
  if (!res.ok) throw new Error('Failed to create territory');
  return res.json();
}

export async function updateTerritory(id: string, territoryData: Partial<Territory>): Promise<Territory> {
  const res = await fetch(`/api/territories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(territoryData),
  });
  if (!res.ok) throw new Error('Failed to update territory');
  return res.json();
}

export async function deleteTerritory(id: string): Promise<void> {
  const res = await fetch(`/api/territories/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete territory');
}

export async function fetchTitleCompanies(): Promise<TitleCompany[]> {
  const res = await fetch('/api/title-companies');
  if (!res.ok) throw new Error('Failed to fetch title companies');
  return res.json();
}

export async function createTitleCompany(data: Partial<TitleCompany>): Promise<TitleCompany> {
  const res = await fetch('/api/title-companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create title company');
  return res.json();
}

export async function updateTitleCompany(id: string, data: Partial<TitleCompany>): Promise<TitleCompany> {
  const res = await fetch(`/api/title-companies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update title company');
  return res.json();
}

export async function deleteTitleCompany(id: string): Promise<void> {
  const res = await fetch(`/api/title-companies/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete title company');
}

// Gemini AI API Calls
export async function analyzeCallWithAI(payload: {
  transcript?: string;
  notes?: string;
  contactName?: string;
  contactRole?: string;
  propertyAddress?: string;
}): Promise<AISummary> {
  const res = await fetch('/api/gemini/analyze-call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze call');
  }
  return res.json();
}

export async function analyzeValuationWithAI(payload: {
  propertyAddress: string;
  listPrice: number;
  estimatedArv: number;
  repairEstimate: number;
  sqft: number;
  beds: number;
  baths: number;
  notes?: string;
}): Promise<{
  maoBreakdown: string;
  agentPitchScript: string;
  creativeFinanceBackup: string;
  riskAssessment: string[];
}> {
  const res = await fetch('/api/gemini/analyze-valuation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze property valuation');
  }
  return res.json();
}

export async function generateFollowUpMessage(payload: {
  lead: Lead;
  format: 'SMS' | 'EMAIL' | 'LOI' | 'SCRIPT';
  tone?: string;
}): Promise<string> {
  const res = await fetch('/api/gemini/generate-followup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate follow-up message');
  }
  const data = await res.json();
  return data.message;
}
