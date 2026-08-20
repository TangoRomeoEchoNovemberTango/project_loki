import React from 'react';
import type { Contact, ContactRole } from '@/types/dealflow';
import { SellerFields } from './SellerFields';
import { AgentFields } from './AgentFields';
import { BuyerFields } from './BuyerFields';
import { TitleFields } from './TitleFields';
import { AttorneyFields } from './AttorneyFields';
import { WholesalerFields } from './WholesalerFields';
import { ContractorFields } from './ContractorFields';
import { MunicipalityFields } from './MunicipalityFields';

interface Props {
  role: ContactRole | string;
  contact: Partial<Contact>;
  onChange: (updates: Partial<Contact>) => void;
}

export const ContactCrmFields: React.FC<Props> = ({ role, contact, onChange }) => {
  switch (role) {
    case 'DIRECT_SELLER':
      return <SellerFields contact={contact} onChange={onChange} />;
    case 'LISTING_AGENT':
    case 'BUYER_AGENT':
    case 'CO_AGENT':
      return <AgentFields contact={contact} onChange={onChange} />;
    case 'CASH_BUYER':
      return <BuyerFields contact={contact} onChange={onChange} />;
    case 'TITLE_COMPANY':
      return <TitleFields contact={contact} onChange={onChange} />;
    case 'ATTORNEY':
      return <AttorneyFields contact={contact} onChange={onChange} />;
    case 'WHOLESALER':
      return <WholesalerFields contact={contact} onChange={onChange} />;
    case 'CONTRACTOR':
      return <ContractorFields contact={contact} onChange={onChange} />;
    case 'MUNICIPALITY':
      return <MunicipalityFields contact={contact} onChange={onChange} />;
    default:
      return null; // OTHER: shared identity fields only
  }
};
