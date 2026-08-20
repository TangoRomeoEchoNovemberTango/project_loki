export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'VALUING'
  | 'OFFER_SENT'
  | 'NEGOTIATING'
  | 'UNDER_CONTRACT_ACQ'
  | 'DISPOSITION'
  | 'UNDER_CONTRACT_DISPO'
  | 'CLOSED'
  | 'DEAD'
  // Off-Market Government List Stages (Rick & Zach Ginn Model)
  | 'GOV_LIST_PULLED'
  | 'SKIP_TRACED'
  | 'MCTP_QUALIFIED'
  | 'OFFER_SENT_PDF'
  | 'TITLE_EMD_SUBMITTED'
  | 'DISPO_BUYER_ASSIGNED';

export type PipelineType = 'ON_MARKET' | 'OFF_MARKET_GOV' | 'LAND_WHOLESALING';

export type GovListType =
  | 'TAX_DELINQUENT'
  | 'PROBATE'
  | 'CODE_VIOLATION'
  | 'WATER_SHUTOFF'
  | 'VACANT_FIRE'
  | 'PRE_FORECLOSURE'
  | 'EVICTION'
  | 'TIRED_LANDLORD'
  | 'VACANT_LAND'
  | 'TAX_DELINQUENT_LAND'
  | 'PROBATE_LAND'
  | 'OTHER';

export interface MCTPQualification {
  motivation: string; // Motivation (Why selling?)
  condition: string; // Condition (Repairs needed)
  timeline: string; // Timeline (How fast?)
  askingPrice?: number; // Price (Asking)
  sellerNetTarget?: number; // Price (Net target)
  qualifiedDate?: string;
  isQualified: boolean;
}

export interface TitleCompanyDetail {
  companyName: string;
  officerName?: string;
  officerPhone?: string;
  officerEmail?: string;
  emdAmount: number;
  emdStatus: 'PENDING' | 'DEPOSITED' | 'REFUNDED';
  titleSearchStatus: 'NOT_STARTED' | 'ORDERED' | 'CLEAR_TITLE' | 'LIEN_ISSUES';
  targetClosingDate?: string;
  notes?: string;
}

export type ContactRole =
  | 'LISTING_AGENT'
  | 'CO_AGENT'
  | 'BUYER_AGENT'
  | 'DIRECT_SELLER'
  | 'CASH_BUYER'
  | 'BUILDER'
  | 'CONSTRUCTION_COMPANY'
  | 'LAND_DEVELOPER'
  | 'TITLE_COMPANY'
  | 'COUNTY_MUNICIPALITY'
  | 'ATTORNEY'
  | 'WHOLESALER'
  | 'CONTRACTOR';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  role: ContactRole | string;
  phone: string;
  email?: string;
  company?: string;
  // Structured Address fields
  streetAddress?: string; // Street number & street name
  unit?: string; // Apt / Ste #
  city?: string;
  state?: string;
  zip?: string;
  // Associations & Notes
  associatedPropertyAddress?: string;
  leadId?: string;
  buyerId?: string;
  titleCompanyId?: string;
  notes?: string;
  source?: 'CUSTOM' | 'LEAD' | 'BUYER' | 'TITLE_COMPANY' | 'CALL_LOG' | 'MUNICIPALITY';
  createdDate?: string;
}

export interface PropertyAttachment {
  id: string;
  name: string;
  url: string;
  fileType: 'IMAGE' | 'PDF' | 'DOC' | 'CONTRACT' | 'OTHER';
  uploadedAt: string;
}

export type PropertyType = 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'COMMERCIAL' | 'LAND' | 'MOBILE_HOME';
export type OccupancyStatus = 'VACANT' | 'TENANT_OCCUPIED' | 'OWNER_OCCUPIED';

export type LandCategory = 'INFILL_LOT' | 'RURAL_ACREAGE' | 'SUBDIVISION' | 'COMMERCIAL_LAND';
export type PerkTestStatus = 'PASSED' | 'FAILED' | 'NOT_TESTED' | 'NOT_REQUIRED';
export type TopographyType = 'FLAT' | 'SLOPED' | 'WOODED' | 'CLEARED' | 'WETLAND';

export interface UtilitiesAccess {
  water: boolean;
  sewerOrSeptic: 'SEWER' | 'SEPTIC_NEEDED' | 'SEPTIC_INSTALLED' | 'UNKNOWN';
  electric: boolean;
  roadAccess: 'PAVED' | 'DIRT' | 'EASEMENT' | 'NO_ACCESS';
}

export interface Property {
  id: string;
  // Structured Address fields
  streetAddress: string; // e.g. "742 Evergreen Terrace"
  unit?: string; // e.g. "Apt 4B" or "Suite 100"
  city: string;
  state: string;
  zip: string;

  // Specs & Attributes
  propertyType?: PropertyType;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  occupancyStatus?: OccupancyStatus;

  // Land Wholesaling Attributes (Zack & Rick Ginn Model)
  isLandDeal?: boolean;
  acreage?: number; // e.g. 0.25, 2.5, 10
  lotDimensions?: string; // e.g. "80x120 ft"
  apn?: string; // Assessor Parcel Number
  zoning?: string; // e.g. "R-1 Residential", "Infill", "AG Agriculture"
  utilitiesAccess?: UtilitiesAccess;
  perkTestStatus?: PerkTestStatus;
  topography?: TopographyType;
  landCategory?: LandCategory;
  builderArvEstimate?: number; // Estimated New Construction ARV for Infill Builders

  // Financials & Valuation
  askingPrice?: number;
  estimatedArv?: number;
  estimatedRepairs?: number;

  // Media & Attachments
  images: string[];
  attachments: PropertyAttachment[];

  // Component Associations / Links
  leadId?: string; // Linked Pipeline Deal
  sellerContactId?: string; // Linked Direct Seller
  agentContactId?: string; // Linked Listing / Buyer Agent
  buyerId?: string; // Linked Cash Buyer / Builder
  titleCompanyId?: string; // Linked Title Company
  municipalityContactId?: string; // Linked County / City Municipality Contact

  notes?: string;
  createdDate?: string;
}

export type CallDirection = 'INBOUND' | 'OUTBOUND';

export type CallOutcome =
  | 'CONNECTED_INTERESTED'
  | 'CONNECTED_NOT_INTERESTED'
  | 'OFFER_REJECTED'
  | 'OFFER_ACCEPTED'
  | 'LEFT_VOICEMAIL'
  | 'SCHEDULED_CALLBACK'
  | 'WRONG_NUMBER'
  | 'NO_ANSWER';

export interface AISummary {
  motivationScore: number; // 1 - 10
  askingPriceMentioned?: number;
  sellerNetMentioned?: number;
  propertyConditionNotes: string[];
  agentObjections: string[];
  actionItems: string[];
  sentiment: 'VERY_POSITIVE' | 'NEUTRAL' | 'HESITANT' | 'HOSTILE';
  recommendedOfferStrategy: string;
}

export interface CallLog {
  id: string;
  leadId?: string;
  leadAddress?: string;
  contactName: string;
  contactPhone: string;
  contactRole: ContactRole;
  timestamp: string; // ISO String
  durationSeconds: number;
  direction: CallDirection;
  outcome: CallOutcome;
  notes: string;
  transcript?: string;
  aiSummary?: AISummary;
  nextFollowUpDate?: string;
}

export interface ItemizedRepairs {
  roof: number;
  hvac: number;
  kitchen: number;
  bathrooms: number;
  flooring: number;
  paint: number;
  plumbingElectric: number;
  exteriorLandscaping: number;
}

export interface CreativeFinanceOption {
  purchasePrice: number;
  downPaymentPercent: number;
  monthlyPayment: number;
  interestRate: number;
  balloonYears: number;
}

export interface PropertyValuation {
  listPrice: number;
  estimatedArv: number;
  sqft: number;
  repairLevel: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'CUSTOM';
  repairEstimate: number;
  itemizedRepairs?: ItemizedRepairs;
  discountRatePercent: number; // e.g. 70 or 75
  desiredWholesaleFee: number; // e.g. 15000
  calculatedMao: number; // (ARV * Discount) - Repairs - Wholesale Fee
  askingMaoGap: number; // listPrice - MAO
  creativeFinanceOption?: CreativeFinanceOption;
}

export interface DripSequence {
  active: boolean;
  currentStepIndex: number;
  sequenceName: string;
  nextTriggerDate: string;
}

export interface Lead {
  id: string;
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  imageUrl: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  stage: LeadStage;
  contactName: string;
  contactRole: ContactRole;
  contactPhone: string;
  contactEmail: string;
  valuation: PropertyValuation;
  dripSequence: DripSequence;
  createdDate: string;
  lastContactDate: string;
  nextFollowUpDate: string;
  tags: string[];
  notes: string;
  territoryId?: string;
  // Off-market & Land wholesaling specific fields
  dealType?: PipelineType;
  govListType?: GovListType;
  skipTraced?: boolean;
  skipTracePhoneList?: string[];
  mctp?: MCTPQualification;
  titleDetail?: TitleCompanyDetail;
  pdfAgreementUrl?: string;
  contractSignedDate?: string;
  assignmentFeeAgreed?: number;
  // Land Wholesaling Details
  isLandDeal?: boolean;
  acreage?: number;
  apn?: string;
  zoning?: string;
  landCategory?: LandCategory;
  builderArvEstimate?: number;
}

export interface TitleCompany {
  id: string;
  name: string;
  officerName: string;
  phone: string;
  email: string;
  address?: string;
  city: string;
  state: string;
  zip: string;
  investorFriendly: boolean;
  assignmentFeeFriendly: boolean;
  doubleClosingSupported: boolean;
  preferredEMDAmount: number;
  activeDealsCount?: number;
  rating?: number;
  notes?: string;
}

export type BuyerCategory =
  | 'BUILDER'
  | 'CONSTRUCTION_COMPANY'
  | 'LAND_DEVELOPER'
  | 'INFILL_BUILDER'
  | 'CASH_FLIPPER'
  | 'BUY_AND_HOLD'
  | 'RURAL_LAND_BUYER';

export interface Buyer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  targetZipCodes: string[];
  buyBoxType: string;
  maxBudget: number;
  dealsClosedCount: number;
  verifiedFunds: boolean;
  buyerCategory?: BuyerCategory;
  isLandBuyer?: boolean;
}

export type TerritoryStatus = 'PRIMARY' | 'ACTIVE' | 'EXPANDING' | 'INACTIVE';

export interface Territory {
  id: string;
  name: string;
  state: string;
  countiesOrCities: string[];
  zipCodes: string[];
  targetDiscountRate: number; // e.g. 70 (%)
  avgWholesaleFee: number; // e.g. 15000 ($)
  status: TerritoryStatus;
  notes?: string;
}

export interface FilterOptions {
  searchQuery: string;
  stageFilter: LeadStage | 'ALL';
  roleFilter: ContactRole | 'ALL';
  dateRange: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
}
