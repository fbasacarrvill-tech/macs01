// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  preferredCurrency: string
  timezone: string
  theme: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// ─── Trades ──────────────────────────────────────────────────────────────────

export type TradeDirection = 'LONG' | 'SHORT'
export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED'

export interface Asset {
  id: string
  symbol: string
  name: string
  assetType: string
  exchange?: string
}

export interface Strategy {
  id: string
  name: string
  description?: string
  color: string
  riskPerTrade?: number
  targetRiskRewardRatio?: number
}

export interface Trade {
  id: string
  asset: Asset
  strategy?: Strategy | null
  entryDate: string
  entryTime?: string
  entryPrice: number
  entryQuantity: number
  exitDate?: string | null
  exitTime?: string | null
  exitPrice?: number | null
  exitQuantity?: number | null
  direction: TradeDirection
  status: TradeStatus
  profitLoss?: number | null
  profitLossPercentage?: number | null
  roi?: number | null
  stopLoss?: number | null
  takeProfit?: number | null
  riskAmount?: number | null
  rewardAmount?: number | null
  riskRewardRatio?: number | null
  notes?: string | null
  tags?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTradeData {
  assetId: string
  strategyId?: string
  entryDate: string
  entryTime?: string
  entryPrice: number
  entryQuantity: number
  direction: TradeDirection
  stopLoss?: number
  takeProfit?: number
  notes?: string
  tags?: string
}

export interface UpdateTradeData {
  exitDate?: string
  exitTime?: string
  exitPrice?: number
  exitQuantity?: number
  status?: TradeStatus
  stopLoss?: number
  takeProfit?: number
  notes?: string
  tags?: string
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export type Period = 'day' | 'week' | 'month' | 'year' | 'all'

export interface PerformanceMetrics {
  profitLoss: number
  winRate: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  expectancy: number
  consecutiveWins: number
  consecutiveLosses: number
}

export interface RiskMetrics {
  currentDrawdown: number
  maxDrawdown: number
  sharpeRatio: number
  sortinoRatio: number
}

export interface CapitalMetrics {
  initial: number
  current: number
  roi: number
}

export interface AnalyticsSummary {
  period: Period
  trades: {
    total: number
    winning: number
    losing: number
    open: number
  }
  performance: PerformanceMetrics
  risk: RiskMetrics
  capital: CapitalMetrics
}

export interface AssetPerformance {
  symbol: string
  assetName: string
  assetType: string
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalProfitLoss: number
  averageWin: number
  averageLoss: number
  profitFactor: number
}

export interface EquityPoint {
  date: string
  capital: number
  drawdown: number
  profitLoss?: number | null
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
  message?: string
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
