// ═══════════════════════════════════════════════════════════════════════════
// PIPELINE & DEAL TYPES — control which workflow a deal follows
// ═══════════════════════════════════════════════════════════════════════════
export type PipelineType = 'OFF_MARKET_GOV' | 'ON_MARKET_MLS'; // off-market gov lists vs MLS/agent deals

export type GovListType =
  | 'PROBATE'          // heirs selling an inherited property
  | 'TAX_DELINQUENT'   // owners behind on property taxes
  | 'CODE_VIOLATION'   // properties cited by the city
  | 'PRE_FORECLOSURE'  // owners in early foreclosure
  | 'EVICTION'         // landlord-tenant distress lists
  | 'VACANT'           // vacant / abandoned properties
  | 'RELOCATING'       // owners moving out of state
  | 'STANDARD';        // catch-all / no specific list

export type LeadStage =
  | 'GOV_LIST_PULLED'      // col 1 — raw list pulled, not contacted
  | 'SKIP_TRACED'          // col 2 — phone/email verified
  | 'MCTP_QUALIFIED'       // col 3 — Motivation/Condition/Timeline/Price verified
  | 'OFFER_SENT_PDF'       // col 4 — purchase agreement delivered
  | 'TITLE_EMD_SUBMITTED'  // col 5 — under contract, EMD deposited
  | 'DISPO_BUYER_ASSIGNED' // col 6 — cash buyer assigned for disposition
  | 'CLOSED'               // col 7 — closed, wholesale fee collected
  | 'NEW'                  // on-market col 1 — fresh MLS lead
  | 'CONTACTED'            // on-market col 2 — agent reached
  | 'VALUING'              // on-market col 3 — running MAO/ARV
  | 'OFFER_SENT'           // on-market col 4 — LOI sent
  | 'NEGOTIATING'          // on-market col 5 — back-and-forth on price
  | 'UNDER_CONTRACT_ACQ'   // on-market col 6 — acquisition side under contract
  | 'DISPOSITION';         // on-market col 7 — being sold to end buyer

// ═══════════════════════════════════════════════════════════════════════════
// ROLE-SPECIFIC UNIONS — small enums reused across contact role groups
// ═══════════════════════════════════════════════════════════════════════════
export type ContactMethod = 'CALL' | 'SMS' | 'MAIL'; // how the person prefers contact

export type ContactDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'; // days of week for availability

export type DecisionMakerStatus =
  | 'SINGLE_OWNER'     // one person can sign
  | 'MARRIED_COUPLE'   // both spouses must sign
  | 'MULTIPLE_HEIRS'   // several heirs must agree
  | 'POA'              // power-of-attorney signs
  | 'CORPORATE_ENTITY'; // an LLC/corp signs

export type SellingTimeline = '0-14' | '14-30' | '30-60' | '60+'; // days until they want to close

export type FundingSource =
  | 'CASH'           // buyer pays cash
  | 'HARD_MONEY'     // short-term lender
  | 'PRIVATE_MONEY'  // individual lender
  | 'LINE_OF_CREDIT' // HELOC / LOC
  | 'CONVENTIONAL'   // bank mortgage
  | 'SDIRA';         // self-directed IRA

export type SpeedToClose = '3-7' | '7-14' | '14-30'; // how fast a buyer can close (days)

export type ClosingTerms =
  | 'ASSIGNMENT'         // assign the contract to end buyer
  | 'DOUBLE_CLOSE'       // back-to-back closings
  | 'NOVATION'           // novation agreement
  | 'SELLER_FINANCING'   // terms / owner finance
  | 'PASS_THROUGH';      // pass-through closing

export type BuyBoxCondition =
  | 'TURNKEY'        // move-in ready
  | 'LIGHT_COSMETIC' // paint/flooring only
  | 'HEAVY_REHAB'    // full gut
  | 'TEAR_DOWN';     // scrape / rebuild

export type JvRole = 'ACQUISITIONS' | 'DISPOSITIONS' | 'JOINT_MARKETING'; // what a JV partner does

export type PartnerStatus = 'ACTIVE' | 'VETTED' | 'ON_HOLD' | 'BLACKLISTED'; // wholesaler partner standing

export type PricingGrade = 'INVESTOR' | 'RETAIL'; // contractor prices at investor vs retail rates

export type DepartmentType =
  | 'COUNTY_CLERK'      // county clerk records
  | 'TAX_COLLECTOR'     // tax collector records
  | 'CODE_ENFORCEMENT'  // code enforcement records
  | 'PROBATE_COURT'     // probate court records
  | 'SHERIFF';          // sheriff / eviction records

export type DataAccessMethod = 'ONLINE_PORTAL' | 'FOIA' | 'IN_PERSON'; // how you pull the list

export type ListCadence = 'DAILY' | 'WEEKLY' | 'MONTHLY'; // how often the list refreshes

export type AgentSpecialty =
  | 'LISTING'              // lists properties
  | 'BUYERS'               // represents buyers
  | 'REO_BANK_OWNED'       // bank-owned specialist
  | 'WHOLESALER_CO_BROKER'; // co-brokers with wholesalers

export type BuyerCategory =
  | 'CASH_FLIPPER'  // flips houses
  | 'BUY_AND_HOLD'  // landlord
  | 'WHOLESALER'    // buys assignments
  | 'DEVELOPER'     // builds
  | 'LAND_INVESTOR'; // land only

export type PropertyType =
  | 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'CONDO' | 'TOWNHOUSE'   // residential
  | 'DUPLEX' | 'TRIPLEX' | 'FOURPLEX' | 'APARTMENT'           // small/large multi
  | 'COMMERCIAL' | 'MIXED_USE'                                // commercial
  | 'VACANT_LAND' | 'MOBILE_HOME';                            // land / mobile

export type OccupancyStatus = 'VACANT' | 'OWNER_OCCUPIED' | 'TENANT_OCCUPIED'; // who lives there

export type CallDirection = 'INBOUND' | 'OUTBOUND'; // who called whom

export type CallOutcome =
  | 'CONNECTED_INTERESTED'     // reached them, they're interested
  | 'CONNECTED_NOT_INTERESTED' // reached them, not interested
  | 'OFFER_ACCEPTED'           // verbal yes
  | 'OFFER_REJECTED'           // verbal no
  | 'SCHEDULED_CALLBACK'       // set a follow-up
  | 'LEFT_VOICEMAIL'           // voicemail dropped
  | 'NO_ANSWER'                // rang out
  | 'WRONG_NUMBER';            // bad number

// ═══════════════════════════════════════════════════════════════════════════
// SMALL SUPPORT INTERFACES
// ═══════════════════════════════════════════════════════════════════════════
export interface ContactAvailability {
  id: string;            // unique id for this availability window
  days: ContactDay[];    // which days this window applies to
  startTime: string;     // window start, 24h "HH:MM"
  endTime: string;       // window end, 24h "HH:MM"
}

export interface CoDecisionMaker {
  firstName: string;     // co-signer first name
  lastName: string;      // co-signer last name
  role: string;          // free text: 'Spouse', 'Heir', 'POA Holder'…
  phone?: string;        // their phone if known
  email?: string;        // their email if known
}

export interface AISummary {
  motivationScore: number;              // 0-100 AI-rated motivation
  askingPriceMentioned?: number;        // price the seller stated on the call
  recommendedOfferStrategy?: string;    // AI-suggested approach
  keyInsights?: string[];               // bullet insights from the transcript
}

export interface PropertyAttachment {
  id: string;          // unique attachment id
  name: string;        // file display name
  url: string;         // storage URL
  fileType: string;    // e.g. 'PDF'
  uploadedAt: string;  // ISO date uploaded
}

export interface Territory {
  id: string;                 // unique territory id
  name: string;               // display name, e.g. 'Springfield Central'
  state: string;              // state code, e.g. 'IL'
  countiesOrCities: string[]; // counties/cities in this territory
  zipCodes: string[];         // zips in this territory (used for filtering)
  targetDiscountRate: number; // target % of ARV, e.g. 70
  avgWholesaleFee: number;    // typical assignment fee in this market
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'; // territory lifecycle
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT ROLE — the 11 hats a person can wear
// ═══════════════════════════════════════════════════════════════════════════
export type ContactRole =
  | 'DIRECT_SELLER'  // off-market homeowner
  | 'LISTING_AGENT'  // agent with a listing
  | 'BUYER_AGENT'    // agent representing a buyer
  | 'CO_AGENT'       // co-broker
  | 'CASH_BUYER'     // dispo cash buyer
  | 'TITLE_COMPANY'  // title / escrow office
  | 'ATTORNEY'       // real-estate attorney
  | 'WHOLESALER'     // JV / co-wholesale partner
  | 'CONTRACTOR'     // rehab pricing source
  | 'MUNICIPALITY'   // gov department / list source
  | 'OTHER';         // custom role (see otherRoleLabel)

// ═══════════════════════════════════════════════════════════════════════════
// VACANT LAND DETAILS — shape of the land checkbox block (stored as JSON)
// ═══════════════════════════════════════════════════════════════════════════
export interface VacantLandDetails {
  parcelId?: string;          // parcel / APN number
  legalDescription?: string;  // lot/block/subdivision text
  zoning?: string;            // zoning / land use code
  topography?: string;        // flat/wooded/sloped…
  floodZone?: string;         // FEMA flood zone
  accessType?: string;        // deeded/easement/landlocked…
  roadFrontage?: string;      // paved/gravel/dirt/none
  waterAccess?: string;       // city/well/cistern/none
  sewerAccess?: string;       // city/septic/none
  powerAccess?: string;       // at lot/pole/solar/none
  percTest?: string;          // perc passed/failed/not done
  annualTaxes?: number | '';  // yearly taxes ($)
  backTaxes?: number | '';    // delinquent taxes ($)
  liensOwed?: number | '';    // liens on the land ($)
  hasHoaPoa?: boolean;        // HOA/POA restrictions present?
  hoaDues?: number | '';      // annual HOA/POA dues ($)
  mineralRightsConvey?: boolean; // do mineral rights transfer?
  surveyAvailable?: boolean;  // is a survey on hand?
}

// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURE ENTRY — one secondary structure on a multi-structure lot (JSON)
// ═══════════════════════════════════════════════════════════════════════════
export interface StructureEntry {
  id: string;                 // unique structure id
  label: string;              // e.g. 'Secondary 1: Additional Structure on Lot'
  street: string;             // structure street address
  unit: string;               // unit/suite if any
  city: string;               // city
  state: string;              // state
  zip: string;                // zip
  propertyType: PropertyType; // what kind of structure
  beds: number | '';          // bedroom count ('' = blank)
  baths: number | '';         // bath count ('' = blank)
  sqft: number | '';          // square footage ('' = blank)
  occupancy: OccupancyStatus; // who occupies it
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. PROPERTY — the physical asset; owns financials, MCTP & detail blocks
// ═══════════════════════════════════════════════════════════════════════════
export interface Property {
  id: string;                    // unique property id (PK)
  // ── Address & Location ──
  streetAddress?: string;        // street address
  unit?: string;                 // unit/suite
  city?: string;                 // city
  state?: string;                // state
  zip?: string;                  // zip (used for territory matching)
  territoryId?: string;          // FK → territories
  // ── Physical Specs ──
  propertyType?: PropertyType;   // kind of property
  beds?: number;                 // bedrooms
  baths?: number;                // baths
  sqft?: number;                 // square feet
  occupancyStatus?: OccupancyStatus; // who occupies
  isLandDeal?: boolean;          // vacant-land checkbox
  acreage?: number;              // acres if land
  hasMultipleStructures?: boolean; // multi-structure checkbox
  // ── Conditional Detail Blocks (the two checkboxes' data) ──
  landDetails?: VacantLandDetails; // filled when isLandDeal === true
  structures?: StructureEntry[];   // filled when hasMultipleStructures === true
  // ── Base Financials ──
  askingPrice?: number;          // list/asking price ($)
  estimatedArv?: number;         // after-repair value ($)
  estimatedRepairs?: number;     // repair budget ($)
  // ── Financials & Valuation (moved here from Lead) ──
  valuation?: {
    listPrice?: number;          // list price snapshot
    estimatedArv?: number;       // ARV snapshot
    repairEstimate?: number;     // repair estimate snapshot
    calculatedMao?: number;      // max allowable offer
    askingMaoGap?: number;       // asking − MAO spread
  };
  // ── MCTP Pillars (seller stance on THIS property) ──
  mctp?: {
    motivation?: string;         // why they're selling
    condition?: string;          // property condition notes
    timeline?: string;           // how fast they need to close
    askingPrice?: number;        // their asking price
    sellerNetTarget?: number;    // net they want to walk away with
    qualifiedDate?: string;      // when MCTP was verified
    isQualified?: boolean;       // MCTP qualified flag
  };
  // ── Media & Notes ──
  notes?: string;                // free-form property notes
  images?: string[];             // photo URLs
  attachments?: PropertyAttachment[]; // uploaded docs
  // ── Relational Links ──
  leadId?: string;               // the lead this property was created under
  // (dealIds removed — derive attached deals via Lead.propertyId queries)
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. LEAD / DEAL — pipeline record ONLY; links to property & contact by id
// ═══════════════════════════════════════════════════════════════════════════
export interface Lead {
  id: string;                    // unique lead id (PK)
  // ── Deal Identity ──
  dealNumber?: string;           // e.g. 'DEAL-2026-0042'
  dealName?: string;             // friendly deal name
  createdAt?: string;            // when the deal was created
  // ── Pipeline ─
  dealType?: PipelineType;       // off-market vs on-market
  govListType?: GovListType;     // which gov list (off-market only)
  stage?: LeadStage;             // current kanban stage
  // ── Relational Links (normalized) ──
  propertyId?: string | null;    // FK → properties
  contactId?: string | null;     // FK → contacts (primary stakeholder)
  // ── Notes & Follow-up ──
  notes?: string;                // deal notes
  nextFollowUpDate?: string;     // next follow-up timestamp
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. CONTACT — single unified people table with multi-role tagging
// ═══════════════════════════════════════════════════════════════════════════
export interface Contact {
  id: string;                    // unique contact id (PK)
  // ── Role Tagging (multi-select) ──
  roles: ContactRole[];          // every hat this person wears
  primaryRole?: ContactRole;     // the "main hat" for badges/morphing
  otherRoleLabel?: string;       // custom text when roles includes 'OTHER'
  /** @deprecated legacy single-role — migrate UI, then delete */
  role?: ContactRole | string;   // old single-role bridge
  // ── Deal / Property associations ──
  leadId?: string;               // provenance lead this contact came from
  associatedPropertyAddress?: string; // snapshot text for quick lists
  // (dealIds removed — derive via Lead.contactId queries)
  // ── Shared identity ──
  firstName: string;             // first name (required)
  lastName: string;              // last name (required)
  phone: string;                 // mobile phone (required)
  officePhone?: string;          // secondary/office line
  email?: string;                // email address
  preferredContactMethod?: ContactMethod; // CALL/SMS/MAIL
  availability?: ContactAvailability[];   // best-times windows
  availabilityNotes?: string;    // e.g. 'leave voicemail OK'
  company?: string;              // brokerage/LLC/firm/dept
  licenseNumber?: string;        // pro license #
  licenseExpiration?: string;    // date-only → DATE column
  // ── Mailing / Personal Address ──
  streetAddress?: string;        // mailing street
  unit?: string;                 // mailing unit
  city?: string;                 // mailing city
  state?: string;                // mailing state
  zip?: string;                  // mailing zip
  // ── Agency / Office Address ──
  agencySameAsMailing?: boolean; // slider: mirror mailing → office
  agencyStreetAddress?: string;  // office street
  agencyUnit?: string;           // office suite
  agencyCity?: string;           // office city
  agencyState?: string;          // office state
  agencyZip?: string;            // office zip
  agencyWebsite?: string;        // office/profile URL
  // ── Associations & Notes ──
  notes?: string;                // free-form notes
  source?: 'CUSTOM' | 'LEAD' | 'CALL_LOG' | 'MUNICIPALITY' | 'ADD_LEAD_MODAL' | 'ADD_LEAD'; // where created
  createdDate?: string;          // when created
  preferredTerritoryIds?: string[]; // territories this person works
  specialties?: string[];        // free-text specialties
  dnc?: boolean;                 // do-not-call flag
  dncDate?: string;              // when DNC was set
  // ── AGENT group ──
  investorFriendly?: boolean;    // works with wholesalers
  commissionExpectation?: string; // commission structure text
  mlsAssociation?: string;       // MLS board
  agentSpecialty?: AgentSpecialty; // listing/buyers/REO/co-broker
  targetMarkets?: string;        // markets/counties/zips served
  openToDualRepresentation?: boolean; // double-end ok
  pocketListingsAccess?: boolean; // off-market inventory
  acceptsAssignments?: boolean;  // ok with assignments
  mlsListingId?: string;         // linked MLS #
  // ── SELLER group ──
  decisionMakerStatus?: DecisionMakerStatus; // who can sign
  coDecisionMakers?: CoDecisionMaker[]; // other signers
  entityName?: string;           // selling entity (LLC etc.)
  rapportNotes?: string;         // personal rapport notes
  sensitivities?: string;        // things to avoid
  motivationReason?: string;     // why selling
  estimatedMortgageBalance?: number; // payoff estimate ($)
  backTaxesOwed?: number;        // delinquent taxes ($)
  otherLiens?: number;           // other liens ($)
  askingPriceGoal?: number;      // price they want ($)
  sellingTimeline?: SellingTimeline; // days to close
  occupancyStatus?: OccupancyStatus; // who lives there
  leaseEndDate?: string;         // date-only → DATE column
  currentRent?: number;          // current rent ($)
  propertyAccessInfo?: string;   // gate codes/lockbox etc.
  // ── BUYER group ──
  buyerCategory?: BuyerCategory; // flipper/landlord/etc.
  buyBoxPropertyTypes?: string;  // property types they buy
  buyBoxCondition?: BuyBoxCondition; // condition they accept
  targetRoi?: string;            // target return
  minPurchasePrice?: number;     // floor price ($)
  maxBudget?: number;            // ceiling price ($)
  fundingSourceType?: FundingSource; // how they fund
  pofVerified?: boolean;         // proof-of-funds verified
  pofExpirationDate?: string;    // date-only → DATE column
  pofDocumentUrl?: string;       // POF doc link
  emdCapacity?: number;          // EMD they can drop ($)
  emdSpeedToDeposit?: string;    // how fast they deposit EMD
  speedToClose?: SpeedToClose;   // days to close
  inspectionRequirement?: 'SIGHT_UNSEEN' | 'WALKTHROUGH'; // buy sight-unseen?
  dealsClosedCount?: number;     // track record
  preferredClosingTerms?: ClosingTerms; // assignment/double/etc.
  isLandBuyer?: boolean;         // buys land
  // ── TITLE group ──
  officerFirstName?: string;     // escrow officer first
  officerLastName?: string;      // escrow officer last
  officerExtension?: string;     // direct extension
  assistantName?: string;        // assistant name
  assistantPhone?: string;       // assistant phone
  assistantEmail?: string;       // assistant email
  countiesServed?: string;       // counties they close in
  assignmentFeeFriendly?: boolean; // ok with assignment fees
  doubleClosingSupported?: boolean; // does double closings
  creativeFinanceFriendly?: boolean; // subject-to/novation ok
  preferredEMDAmount?: number;   // EMD they like ($)
  emdDepositMethods?: string;    // wire/check/etc.
  rating?: number;               // internal 1-5 rating
  // ── ATTORNEY group ──
  practiceAreas?: string;        // practice areas
  jurisdiction?: string;         // licensed jurisdiction
  closingStateRole?: 'CLOSING_ATTORNEY' | 'ADVISORY_ONLY'; // closes or advises
  paralegalName?: string;        // paralegal name
  paralegalPhone?: string;       // paralegal phone
  paralegalEmail?: string;       // paralegal email
  novationDrafting?: boolean;    // drafts novations
  evictionLitigation?: boolean;  // handles evictions
  feeStructure?: string;         // fee model text
  feeAmount?: number;            // fee amount ($)
  // ── WHOLESALER / JV group ──
  jvRole?: JvRole;               // what they do in a JV
  buyerNetworkSize?: number;     // size of their buyer list
  standardJvSplit?: string;      // usual JV split
  jvAgreementSigned?: boolean;   // JV agreement signed
  partnerStatus?: PartnerStatus; // active/vetted/etc.
  // ── CONTRACTOR group ──
  trades?: string;               // trades they cover
  serviceArea?: string;          // area they serve
  licensedInsured?: boolean;     // licensed + insured
  pullsPermits?: boolean;        // pulls permits
  pricingGrade?: PricingGrade;   // investor vs retail pricing
  estimateTurnaround?: '24-48' | '3-5'; // estimate speed (days)
  paymentTerms?: string;         // payment terms text
  // ── MUNICIPALITY group ──
  departmentType?: DepartmentType; // which department
  recordsHandled?: string;       // records they hold
  dataAccessMethod?: DataAccessMethod; // how you pull data
  listUpdateCadence?: ListCadence; // refresh frequency
  costPerRecord?: number;        // cost per record ($)
  keyContactName?: string;       // key person name
  keyContactExtension?: string;  // their extension
  keyContactEmail?: string;      // their email
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. CALL LOG — normalized communication history
// ═══════════════════════════════════════════════════════════════════════════
export interface CallLog {
  id: string;                    // unique call id (PK)
  // ── Relational Links ──
  leadId?: string;               // FK → leads
  contactId?: string;            // FK → contacts
  dealIds?: string[];            // a call can reference several deals
  // ── Call Details ──
  timestamp: string;             // when the call happened
  durationSeconds?: number;      // call length
  direction?: CallDirection;     // inbound/outbound
  outcome?: CallOutcome;         // result of the call
  notes?: string;                // agent notes
  transcript?: string;           // raw transcript
  aiSummary?: AISummary;         // AI-generated summary
  nextFollowUpDate?: string;     // scheduled callback
  createdDate?: string;          // record created date
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. LEGACY GHOST-TABLE INTERFACES — delete after directory migration!
// ═══════════════════════════════════════════════════════════════════════════
/** @deprecated Buyers now live in `contacts` via roles. Keep until BuyersDirectory is migrated. */
export interface Buyer {
  id: string;                    // legacy buyer id
  name: string;                  // display name
  firstName?: string;            // first name
  lastName?: string;             // last name
  company?: string;              // company
  phone: string;                 // phone
  email?: string;                // email
  buyerCategory?: BuyerCategory; // category
  buyBoxType?: string;           // legacy buy-box text
  buyBoxPropertyTypes?: string;  // property types
  buyBoxCondition?: BuyBoxCondition; // condition
  targetZipCodes?: string[];     // target zips
  targetMarkets?: string;        // target markets
  minBudget?: number;            // min ($)
  maxBudget?: number;            // max ($)
  fundingSourceType?: FundingSource; // funding
  pofVerified?: boolean;         // POF verified
  pofExpirationDate?: string;    // POF expiry
  pofDocumentUrl?: string;       // POF doc
  emdCapacity?: number;          // EMD ($)
  emdSpeedToDeposit?: string;    // EMD speed
  speedToClose?: SpeedToClose;   // close speed
  inspectionRequirement?: 'SIGHT_UNSEEN' | 'WALKTHROUGH'; // inspection
  dealsClosedCount?: number;     // track record
  preferredClosingTerms?: ClosingTerms; // terms
  isLandBuyer?: boolean;         // land buyer
  verifiedFunds?: boolean;       // legacy funds flag
  notes?: string;                // notes
  createdDate?: string;          // created
}

/** @deprecated Title companies now live in `contacts` via roles. Keep until TitleCompaniesDirectory is migrated. */
export interface TitleCompany {
  id: string;                    // legacy title id
  name: string;                  // firm name
  officerName?: string;          // officer full name
  officerFirstName?: string;     // officer first
  officerLastName?: string;      // officer last
  officerExtension?: string;     // extension
  assistantName?: string;        // assistant
  assistantPhone?: string;       // assistant phone
  assistantEmail?: string;       // assistant email
  phone: string;                 // main phone
  email?: string;                // main email
  address?: string;              // street
  city?: string;                 // city
  state?: string;                // state
  zip?: string;                  // zip
  countiesServed?: string;       // counties
  investorFriendly?: boolean;    // investor friendly
  assignmentFeeFriendly?: boolean; // assignment friendly
  doubleClosingSupported?: boolean; // double close
  creativeFinanceFriendly?: boolean; // creative finance
  preferredEMDAmount?: number;   // preferred EMD ($)
  emdDepositMethods?: string;    // deposit methods
  rating?: number;               // internal rating
  notes?: string;                // notes
  createdDate?: string;          // created
}