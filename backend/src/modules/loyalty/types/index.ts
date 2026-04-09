// ========== BUSINESS TYPES ==========
export interface CreateBusinessRequest {
  name: string
  email: string
  password: string
  phone?: string
  website?: string
}

export interface BusinessRegisterResponse {
  business: {
    id: string
    name: string
    email: string
    primaryColor: string
    secondaryColor: string
    status: string
    createdAt: Date
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export interface BusinessAuthPayload {
  id: string
  email: string
  name: string
}

// ========== LOYALTY PROGRAM TYPES ==========
export type ProgramType =
  | 'STAMPS'
  | 'CASHBACK'
  | 'AFFINITY'
  | 'DISCOUNT'
  | 'COUPON'
  | 'GIFT'
  | 'MEMBERSHIP'
  | 'MULTIPASS'

export interface CreateProgramRequest {
  name: string
  description?: string
  type: ProgramType
  currencyCode?: string
  pointsName?: string
  pointsPerDollar?: number
  minPointsRedeemable?: number
  expirationDays?: number
  logoUrl?: string
  backgroundColor?: string
  foregroundColor?: string
  accentColor?: string
}

export interface UpdateProgramRequest {
  name?: string
  description?: string
  currencyCode?: string
  pointsName?: string
  pointsPerDollar?: number
  minPointsRedeemable?: number
  expirationDays?: number
  logoUrl?: string
  backgroundColor?: string
  foregroundColor?: string
  accentColor?: string
}

export interface ProgramResponse {
  id: string
  businessId: string
  name: string
  description?: string
  type: ProgramType
  currencyCode: string
  pointsName: string
  pointsPerDollar: number
  backgroundColor: string
  foregroundColor: string
  accentColor: string
  minPointsRedeemable: number
  expirationDays?: number
  isActive: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ========== LOYALTY TIER TYPES ==========
export interface CreateTierRequest {
  name: string
  requiredPoints: number
  discount?: number
  color?: string
}

export interface TierResponse {
  id: string
  programId: string
  name: string
  requiredPoints: number
  discount: number
  color: string
  createdAt: Date
}

// ========== CUSTOMER TYPES ==========
export interface CreateCustomerRequest {
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  country?: string
  state?: string
  city?: string
  zipCode?: string
  language?: string
  timeZone?: string
}

export interface UpdateCustomerRequest {
  phone?: string
  firstName?: string
  lastName?: string
  country?: string
  state?: string
  city?: string
  zipCode?: string
  language?: string
  timeZone?: string
  notificationsOptIn?: boolean
}

export interface CustomerResponse {
  id: string
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  country: string
  state?: string
  city?: string
  zipCode?: string
  language: string
  timeZone: string
  notificationsOptIn: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ========== LOYALTY CARD TYPES ==========
export type CardStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'REDEEMED'
export type WalletType = 'APPLE' | 'GOOGLE' | 'DIGITAL'

export interface CreateCardRequest {
  programId: string
  customerId: string
  cardNumber?: string
  expiresAt?: Date
}

export interface CardResponse {
  id: string
  programId: string
  customerId: string
  cardNumber: string
  barcode?: string
  qrCode?: string
  status: CardStatus
  points: number
  totalPointsEarned: number
  totalPointsRedeemed: number
  passUrl?: string
  jwtToken?: string
  walletType?: WalletType
  addedToWalletAt?: Date
  issuedAt: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AddToWalletRequest {
  walletType: 'APPLE' | 'GOOGLE'
}

export interface AddToWalletResponse {
  success: boolean
  passUrl?: string
  jwtToken?: string
}

// ========== TRANSACTION TYPES ==========
export type TransactionType =
  | 'PURCHASE'
  | 'BONUS'
  | 'REDEMPTION'
  | 'ADJUSTMENT'
  | 'EXPIRATION'

export interface CreateTransactionRequest {
  cardId: string
  customerId: string
  programId: string
  type: TransactionType
  points: number
  amount?: number
  description?: string
  referenceId?: string
  metadata?: Record<string, any>
}

export interface TransactionResponse {
  id: string
  cardId: string
  customerId: string
  programId: string
  type: TransactionType
  amount?: number
  points: number
  pointsBalance: number
  description?: string
  referenceId?: string
  createdAt: Date
}

// ========== QR SCAN TYPES ==========
export interface ScanRequest {
  cardNumber?: string
  qrCode?: string
  location?: string
  latitude?: number
  longitude?: number
}

export interface ScanResponse {
  success: boolean
  card?: {
    id: string
    points: number
    status: CardStatus
  }
  customer?: {
    id: string
    firstName?: string
    lastName?: string
  }
  program?: {
    id: string
    name: string
  }
  message?: string
  error?: string
}

// ========== CAMPAIGN & NOTIFICATION TYPES ==========
export interface CreateCampaignRequest {
  programId: string
  title: string
  message: string
  imageUrl?: string
  targetSegments?: string[]
  targetGeolocation?: string
  scheduledFor?: Date
  deepLink?: string
}

export interface CampaignResponse {
  id: string
  programId: string
  title: string
  message: string
  imageUrl?: string
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED'
  scheduledFor?: Date
  startedAt?: Date
  endedAt?: Date
  sentCount: number
  openCount: number
  clickCount: number
  createdAt: Date
  updatedAt: Date
}

export interface PushTokenRequest {
  token: string
  platform: 'ios' | 'android' | 'web'
}

// ========== ANALYTICS TYPES ==========
export interface AnalyticsOverview {
  totalCustomers: number
  activeCards: number
  totalPoints: number
  totalPointsRedeemed: number
  totalScans: number
  totalTransactions: number
  avgPointsPerCustomer: number
  totalRevenue: number
  engagement: {
    activeRatePercent: number
    redemptionRate: number
    returnCustomerRate: number
  }
}

export interface CustomerAnalytics {
  id: string
  email: string
  firstName?: string
  lastName?: string
  points: number
  tier?: string
  spent: number
  visits: number
  lastVisit?: Date
  joinedAt: Date
}

export interface TransactionAnalytics {
  id: string
  type: TransactionType
  amount?: number
  points: number
  customerId: string
  cardId: string
  createdAt: Date
}

// ========== ERROR RESPONSE ==========
export interface ErrorResponse {
  error: string
  code?: string
  details?: Record<string, any>
}

// ========== PAGINATION ==========
export interface PaginationParams {
  page?: number
  limit?: number
  skip?: number
  take?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// ========== API KEY TYPES ==========
export interface CreateApiKeyRequest {
  name: string
}

export interface ApiKeyResponse {
  id: string
  name: string
  key: string
  secret?: string // Only returned on creation
  isActive: boolean
  lastUsedAt?: Date
  createdAt: Date
}

// ========== PROGRAM RULE TYPES ==========
export interface CreateRuleRequest {
  type: 'POINTS_RULE' | 'BONUS_RULE' | 'PENALTY_RULE'
  condition: Record<string, any>
  reward: Record<string, any>
}

export interface RuleResponse {
  id: string
  programId: string
  type: string
  condition: Record<string, any>
  reward: Record<string, any>
  isActive: boolean
}

// ========== CUSTOMER SEGMENT TYPES ==========
export interface CreateSegmentRequest {
  name: string
  criteria: Record<string, any>
}

export interface SegmentResponse {
  id: string
  name: string
  criteria: Record<string, any>
}
