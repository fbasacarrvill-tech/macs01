import { Request } from 'express'

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

export interface JwtPayload {
  userId: string
  email: string
}

export interface RegisterBody {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface LoginBody {
  email: string
  password: string
}

// ─── Trades ──────────────────────────────────────────────────────────────────

export type TradeDirection = 'LONG' | 'SHORT'
export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED'
export type AssetType = 'STOCK' | 'FOREX' | 'CRYPTO' | 'COMMODITY' | 'FUTURES' | 'OPTION'

export interface CreateTradeBody {
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

export interface UpdateTradeBody {
  assetId?: string
  strategyId?: string
  entryDate?: string
  entryTime?: string
  entryPrice?: number
  entryQuantity?: number
  exitDate?: string
  exitTime?: string
  exitPrice?: number
  exitQuantity?: number
  direction?: TradeDirection
  status?: TradeStatus
  stopLoss?: number
  takeProfit?: number
  notes?: string
  tags?: string
}

export interface TradeFilters {
  status?: string
  assetId?: string
  strategyId?: string
  startDate?: string
  endDate?: string
  direction?: string
  page?: number
  limit?: number
  sort?: string
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

export interface TradeMetrics {
  profitLoss: number
  profitLossPercentage: number
  roi: number
  risk: number
  reward: number
  riskRewardRatio: number
}

export interface PeriodMetrics {
  totalProfitLoss: number
  winRate: number
  winningTrades: number
  losingTrades: number
  totalTrades: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  expectancy: number
  consecutiveWins: number
  consecutiveLosses: number
}

export interface PortfolioMetrics extends PeriodMetrics {
  roi: number
  currentDrawdown: number
  maxDrawdown: number
  sharpeRatio: number
  sortinoRatio: number
  recoveryFactor: number
  initialCapital: number
  currentCapital: number
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// ─── Strategies ──────────────────────────────────────────────────────────────

export interface CreateStrategyBody {
  name: string
  description?: string
  riskPerTrade?: number
  targetRiskRewardRatio?: number
  color?: string
}
