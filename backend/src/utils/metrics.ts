import { Trade } from '@prisma/client'
import { TradeMetrics, PeriodMetrics } from '../types'

/**
 * Calcula métricas individuales de un trade
 */
export function calcTradeMetrics(trade: Trade): TradeMetrics {
  const entryPrice = Number(trade.entryPrice)
  const entryQuantity = Number(trade.entryQuantity)
  const exitPrice = trade.exitPrice ? Number(trade.exitPrice) : null
  const stopLoss = trade.stopLoss ? Number(trade.stopLoss) : null
  const takeProfit = trade.takeProfit ? Number(trade.takeProfit) : null

  // P&L
  let profitLoss = 0
  let profitLossPercentage = 0
  let roi = 0

  if (exitPrice !== null) {
    profitLoss =
      trade.direction === 'LONG'
        ? (exitPrice - entryPrice) * entryQuantity
        : (entryPrice - exitPrice) * entryQuantity

    profitLossPercentage =
      trade.direction === 'LONG'
        ? ((exitPrice - entryPrice) / entryPrice) * 100
        : ((entryPrice - exitPrice) / entryPrice) * 100

    roi = profitLossPercentage
  }

  // Risk
  let risk = 0
  if (stopLoss !== null) {
    risk =
      trade.direction === 'LONG'
        ? (entryPrice - stopLoss) * entryQuantity
        : (stopLoss - entryPrice) * entryQuantity
  }

  // Reward
  let reward = 0
  if (takeProfit !== null) {
    reward =
      trade.direction === 'LONG'
        ? (takeProfit - entryPrice) * entryQuantity
        : (entryPrice - takeProfit) * entryQuantity
  }

  const riskRewardRatio = risk > 0 ? reward / risk : 0

  return {
    profitLoss: round(profitLoss),
    profitLossPercentage: round(profitLossPercentage, 4),
    roi: round(roi, 4),
    risk: round(risk),
    reward: round(reward),
    riskRewardRatio: round(riskRewardRatio, 2),
  }
}

/**
 * Calcula métricas agregadas de un período
 */
export function calcPeriodMetrics(trades: Trade[]): PeriodMetrics {
  const closed = trades.filter((t) => t.status === 'CLOSED')

  if (closed.length === 0) {
    return defaultPeriodMetrics()
  }

  const metrics = closed.map(calcTradeMetrics)

  const winners = metrics.filter((m) => m.profitLoss > 0)
  const losers = metrics.filter((m) => m.profitLoss < 0)

  const totalProfitLoss = round(metrics.reduce((s, m) => s + m.profitLoss, 0))
  const winningTrades = winners.length
  const losingTrades = losers.length
  const totalTrades = closed.length
  const winRate = round((winningTrades / totalTrades) * 100, 2)

  const avgWin =
    winningTrades > 0
      ? round(winners.reduce((s, m) => s + m.profitLoss, 0) / winningTrades)
      : 0

  const avgLoss =
    losingTrades > 0
      ? round(losers.reduce((s, m) => s + m.profitLoss, 0) / losingTrades)
      : 0

  const grossWin = winners.reduce((s, m) => s + m.profitLoss, 0)
  const grossLoss = Math.abs(losers.reduce((s, m) => s + m.profitLoss, 0))
  const profitFactor = grossLoss > 0 ? round(grossWin / grossLoss, 2) : 0

  const expectancy = round(
    (winRate / 100) * avgWin - ((1 - winRate / 100) * Math.abs(avgLoss)),
  )

  // Rachas consecutivas
  let curWins = 0
  let curLosses = 0
  let maxWins = 0
  let maxLosses = 0

  closed
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .forEach((trade) => {
      const { profitLoss } = calcTradeMetrics(trade)
      if (profitLoss > 0) {
        curWins++
        maxWins = Math.max(maxWins, curWins)
        curLosses = 0
      } else if (profitLoss < 0) {
        curLosses++
        maxLosses = Math.max(maxLosses, curLosses)
        curWins = 0
      }
    })

  return {
    totalProfitLoss,
    winRate,
    winningTrades,
    losingTrades,
    totalTrades,
    averageWin: avgWin,
    averageLoss: avgLoss,
    profitFactor,
    expectancy,
    consecutiveWins: maxWins,
    consecutiveLosses: maxLosses,
  }
}

/**
 * Calcula drawdown a partir de snapshots diarios ordenados
 */
export function calcDrawdown(capitals: number[]): {
  current: number
  maximum: number
} {
  if (capitals.length === 0) return { current: 0, maximum: 0 }

  let peak = capitals[0]
  let maxDrawdown = 0
  let currentDrawdown = 0

  for (const capital of capitals) {
    if (capital > peak) peak = capital
    const dd = peak > 0 ? ((capital - peak) / peak) * 100 : 0
    if (dd < maxDrawdown) maxDrawdown = dd
    currentDrawdown = dd
  }

  return {
    current: round(currentDrawdown, 2),
    maximum: round(maxDrawdown, 2),
  }
}

/**
 * Calcula Sharpe Ratio anualizado
 */
export function calcSharpeRatio(
  returns: number[],
  riskFreeRate = 0.02,
): number {
  if (returns.length < 2) return 0

  const avg = returns.reduce((s, r) => s + r, 0) / returns.length
  const variance =
    returns.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / (returns.length - 1)
  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) return 0

  const annualizedReturn = avg * 252 // Días de trading
  const annualizedStdDev = stdDev * Math.sqrt(252)

  return round((annualizedReturn - riskFreeRate) / annualizedStdDev, 2)
}

/**
 * Calcula Sortino Ratio (solo downside deviation)
 */
export function calcSortinoRatio(
  returns: number[],
  riskFreeRate = 0.02,
): number {
  if (returns.length < 2) return 0

  const avg = returns.reduce((s, r) => s + r, 0) / returns.length
  const negativeReturns = returns.filter((r) => r < 0)

  if (negativeReturns.length === 0) return 0

  const downsideVariance =
    negativeReturns.reduce((s, r) => s + Math.pow(r, 2), 0) / returns.length
  const downsideStdDev = Math.sqrt(downsideVariance)

  if (downsideStdDev === 0) return 0

  const annualizedReturn = avg * 252
  const annualizedDownside = downsideStdDev * Math.sqrt(252)

  return round((annualizedReturn - riskFreeRate) / annualizedDownside, 2)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function round(n: number, decimals = 2): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Calcula CAGR (Compound Annual Growth Rate)
 */
export function calcCAGR(
  startCapital: number,
  endCapital: number,
  years: number,
): number {
  if (startCapital <= 0 || years <= 0) return 0
  const cagr = Math.pow(endCapital / startCapital, 1 / years) - 1
  return round(cagr * 100, 2)
}

/**
 * Calcula Recovery Factor (cuánto tardas en recuperarte de drawdown)
 */
export function calcRecoveryFactor(
  totalProfitLoss: number,
  maxDrawdownAmount: number,
): number {
  if (maxDrawdownAmount === 0) return 0
  return round(totalProfitLoss / Math.abs(maxDrawdownAmount), 2)
}

/**
 * Calcula Profit Target (meta de ganancia mensual)
 */
export function calcProfitTarget(
  currentCapital: number,
  targetROI: number = 5, // 5% default monthly
): number {
  return round((currentCapital * targetROI) / 100)
}

/**
 * Calcula Win/Loss Ratio (ganancias promedio vs pérdidas)
 */
export function calcWinLossRatio(averageWin: number, averageLoss: number): number {
  if (averageLoss === 0) return 0
  return round(Math.abs(averageWin / averageLoss), 2)
}

function defaultPeriodMetrics(): PeriodMetrics {
  return {
    totalProfitLoss: 0,
    winRate: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalTrades: 0,
    averageWin: 0,
    averageLoss: 0,
    profitFactor: 0,
    expectancy: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  }
}
