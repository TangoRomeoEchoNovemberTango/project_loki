// ── NEW ROLE-SPECIFIC UNIONS ──
export type ContactMethod = 'CALL' | 'SMS' | 'MAIL';
export type DecisionMakerStatus = 'SINGLE_OWNER' | 'MARRIED_COUPLE' | 'MULTIPLE_HEIRS' | 'POA' | 'CORPORATE_ENTITY';
export type SellingTimeline = '0-14' | '14-30' | '30-60' | '60+';
export type FundingSource = 'CASH' | 'HARD_MONEY' | 'PRIVATE_MONEY' | 'LINE_OF_CREDIT' | 'CONVENTIONAL' | 'SDIRA';
export type SpeedToClose = '3-7' | '7-14' | '14-30';
export type ClosingTerms = 'ASSIGNMENT' | 'DOUBLE_CLOSE' | 'NOVATION' | 'SELLER_FINANCING' | 'PASS_THROUGH';
export type BuyBoxCondition = 'TURNKEY' | 'LIGHT_COSMETIC' | 'HEAVY_REHAB' | 'TEAR_DOWN';
export type JvRole = 'ACQUISITIONS' | 'DISPOSITIONS' | 'JOINT_MARKETING';
export type PartnerStatus = 'ACTIVE' | 'VETTED' | 'ON_HOLD' | 'BLACKLISTED';
export type PricingGrade = 'INVESTOR' | 'RETAIL';
export type DepartmentType = 'COUNTY_CLERK' | 'TAX_COLLECTOR' | 'CODE_ENFORCEMENT' | 'PROBATE_COURT' | 'SHERIFF';
export type DataAccessMethod = 'ONLINE_PORTAL' | 'FOIA' | 'IN_PERSON';
export type ListCadence = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type AgentSpecialty = 'LISTING' | 'BUYERS' | 'REO_BANK_OWNED' | 'WHOLESALER_CO_BROKER';

// ── UPDATED CONTACT ROLE (11 roles total) ──
export type ContactRole =
  | 'DIRECT_SELLER'
  | 'LISTING_AGENT'
  | 'BUYER_AGENT'
  | 'CO_AGENT'
  | 'CASH_BUYER'
  | 'TITLE_COMPANY'
  | 'ATTORNEY'
  | 'WHOLESALER'
  | 'CONTRACTOR'
  | 'MUNICIPALITY'
  | 'OTHER';

// ── UNIFIED CONTACT INTERFACE (single table, all roles) ──
export interface Contact {

  dnc?: boolean;
  dncDate?: string;
  id: string;
  role: ContactRole | string;
  // ── Shared identity (all roles) ──
  firstName: string;
  lastName: string;
  phone: string;
  officePhone?: string;
  email?: string;
  preferredContactMethod?: ContactMethod;
  company?: string; // Brokerage / LLC / Firm / Dept / Entity
  licenseNumber?: string;
  licenseExpiration?: string;
  // Mailing / Personal Address
  streetAddress?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
  // Agency / Office Address (agents, title, attorneys, municipalities)
  agencyStreetAddress?: string;
  agencyUnit?: string;
  agencyCity?: string;
  agencyState?: string;
  agencyZip?: string;
  agencyWebsite?: string;
  // Associations & Notes
  notes?: string;
  source?: 'CUSTOM' | 'LEAD' | 'BUYER' | 'TITLE_COMPANY' | 'CALL_LOG' | 'MUNICIPALITY' | 'ADD_LEAD_MODAL';
  associatedPropertyAddress?: string;
  leadId?: string;
  buyerId?: string;
  titleCompanyId?: string;
  createdDate?: string;
  preferredTerritoryIds?: string[];
  specialties?: string[];

  // ── AGENT group (LISTING_AGENT, BUYER_AGENT, CO_AGENT) ──
  investorFriendly?: boolean;
  commissionExpectation?: string;
  mlsAssociation?: string;
  agentSpecialty?: AgentSpecialty;
  targetMarkets?: string;
  openToDualRepresentation?: boolean;
  pocketListingsAccess?: boolean;
  acceptsAssignments?: boolean;
  mlsListingId?: string;

  // ── SELLER group (DIRECT_SELLER) ──
  decisionMakerStatus?: DecisionMakerStatus;
  motivationReason?: string; // FIX: was hijacking commissionExpectation
  estimatedMortgageBalance?: number;
  backTaxesOwed?: number;
  otherLiens?: number;
  askingPriceGoal?: number; // FIX: was hijacking quickAskingPrice
  sellingTimeline?: SellingTimeline;
  occupancyStatus?: OccupancyStatus;
  leaseEndDate?: string;
  currentRent?: number;
  propertyAccessInfo?: string;

  // ── BUYER group (CASH_BUYER) ──
  buyerCategory?: BuyerCategory;
  buyBoxPropertyTypes?: string;
  buyBoxCondition?: BuyBoxCondition;
  targetRoi?: string;
  minPurchasePrice?: number;
  maxBudget?: number;
  fundingSourceType?: FundingSource;
  pofVerified?: boolean;
  pofExpirationDate?: string;
  pofDocumentUrl?: string;
  emdCapacity?: number;
  emdSpeedToDeposit?: string;
  speedToClose?: SpeedToClose;
  inspectionRequirement?: 'SIGHT_UNSEEN' | 'WALKTHROUGH';
  dealsClosedCount?: number;
  preferredClosingTerms?: ClosingTerms;
  isLandBuyer?: boolean;

  // ── TITLE group (TITLE_COMPANY) ──
  officerFirstName?: string;
  officerLastName?: string;
  officerExtension?: string;
  assistantName?: string;
  assistantPhone?: string;
  assistantEmail?: string;
  countiesServed?: string;
  assignmentFeeFriendly?: boolean;
  doubleClosingSupported?: boolean;
  creativeFinanceFriendly?: boolean;
  preferredEMDAmount?: number;
  emdDepositMethods?: string;
  rating?: number;

  // ── ATTORNEY group (ATTORNEY) ──
  practiceAreas?: string;
  jurisdiction?: string;
  closingStateRole?: 'CLOSING_ATTORNEY' | 'ADVISORY_ONLY';
  paralegalName?: string;
  paralegalPhone?: string;
  paralegalEmail?: string;
  novationDrafting?: boolean;
  evictionLitigation?: boolean;
  feeStructure?: string;
  feeAmount?: number;

  // ── WHOLESALER / JV group (WHOLESALER) ──
  jvRole?: JvRole;
  buyerNetworkSize?: number;
  standardJvSplit?: string;
  jvAgreementSigned?: boolean;
  partnerStatus?: PartnerStatus;

  // ── CONTRACTOR group (CONTRACTOR) ──
  trades?: string;
  serviceArea?: string;
  licensedInsured?: boolean;
  pullsPermits?: boolean;
  pricingGrade?: PricingGrade;
  estimateTurnaround?: '24-48' | '3-5';
  paymentTerms?: string;

  // ── MUNICIPALITY group (MUNICIPALITY) ──
  departmentType?: DepartmentType;
  recordsHandled?: string;
  dataAccessMethod?: DataAccessMethod;
  listUpdateCadence?: ListCadence;
  costPerRecord?: number;
  keyContactName?: string;
  keyContactExtension?: string;
  keyContactEmail?: string;
}
