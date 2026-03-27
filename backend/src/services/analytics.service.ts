import { prisma } from '../lib/prisma'
import {
  calcPeriodMetrics,
  calcDrawdown,
  calcSharpeRatio,
  calcSortinoRatio,
} from '../utils/metrics'

type Period = 'day' | 'week' | 'month' | 'year' | 'all'

export const AnalyticsService = {
  async getSummary(userId: string, period: Period) {
    const where = buildDateFilter(userId, period)

    const [trades, portfolio, snapshots] = await Promise.all([
      prisma.trade.findMany({ where }),
      prisma.portfolio.findUnique({ where: { userId } }),
      prisma.dailySnapshot.findMany({
        where: { userId },
        orderBy: { snapshotDate: 'asc' },
        take: 365,
      }),
    ])

    const metrics = calcPeriodMetrics(trades)

    const capitals = snapshots.map((s) => Number(s.capital))
    const drawdown = calcDrawdown(capitals)

    // Retornos diarios para Sharpe/Sortino
    const dailyReturns = capitals
      .slice(1)
      .map((c, i) => (capitals[i] > 0 ? (c - capitals[i]) / capitals[i] : 0))

    const sharpeRatio = calcSharpeRatio(dailyReturns)
    const sortinoRatio = calcSortinoRatio(dailyReturns)

    const initialCapital = portfolio ? Number(portfolio.initialCapital) : 10000
    const currentCapital = portfolio ? Number(portfolio.currentCapital) : initialCapital

    return {
      period,
      trades: {
        total: metrics.totalTrades,
        winning: metrics.winningTrades,
        losing: metrics.losingTrades,
        open: trades.filter((t) => t.status === 'OPEN').length,
      },
      performance: {
        profitLoss: metrics.totalProfitLoss,
        winRate: metrics.winRate,
        averageWin: metrics.averageWin,
        averageLoss: metrics.averageLoss,
        profitFactor: metrics.profitFactor,
        expectancy: metrics.expectancy,
        consecutiveWins: metrics.consecutiveWins,
        consecutiveLosses: metrics.consecutiveLosses,
      },
      risk: {
        currentDrawdown: drawdown.current,
        maxDrawdown: drawdown.maximum,
        sharpeRatio,
        sortinoRatio,
      },
      capital: {
        initial: initialCapital,
        current: currentCapital,
        roi: initialCapital > 0 ? ((currentCapital - initialCapital) / initialCapital) * 100 : 0,
      },
    }
  },

  async getByAsset(userId: string, period: Period) {
    const where = buildDateFilter(userId, period)
    const trades = await prisma.trade.findMany({
      where,
      include: { asset: true },
    })

    const grouped: Record<string, typeof trades> = {}
    for (const t of trades) {
      const key = t.asset.symbol
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(t)
    }

    return Object.entries(grouped).map(([symbol, assetTrades]) => {
      const m = calcPeriodMetrics(assetTrades)
      return {
        symbol,
        assetName: assetTrades[0].asset.name,
        assetType: assetTrades[0].asset.assetType,
        ...m,
      }
    })
  },

  async getByStrategy(userId: string, period: Period) {
    const where = buildDateFilter(userId, period)
    const trades = await prisma.trade.findMany({
      where,
      include: { strategy: true },
    })

    const grouped: Record<string, typeof trades> = {}
    for (const t of trades) {
      const key = t.strategyId ?? 'no-strategy'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(t)
    }

    return Object.entries(grouped).map(([, stratTrades]) => {
      const m = calcPeriodMetrics(stratTrades)
      const strategy = stratTrades[0].strategy
      return {
        strategyId: strategy?.id ?? null,
        strategyName: strategy?.name ?? 'No Strategy',
        ...m,
      }
    })
  },

  async getEquityCurve(userId: string) {
    const snapshots = await prisma.dailySnapshot.findMany({
      where: { userId },
      orderBy: { snapshotDate: 'asc' },
    })

    const capitals = snapshots.map((s) => Number(s.capital))
    let runningPeak = capitals[0] ?? 0

    return snapshots.map((s, i) => {
      const capital = Number(s.capital)
      if (capital > runningPeak) runningPeak = capital
      const drawdown = runningPeak > 0 ? ((capital - runningPeak) / runningPeak) * 100 : 0
      return {
        date: s.snapshotDate,
        capital,
        drawdown: Math.round(drawdown * 100) / 100,
        profitLoss: s.profitLoss ? Number(s.profitLoss) : null,
      }
    })
  },

  async getDrawdownAnalysis(userId: string) {
    const snapshots = await prisma.dailySnapshot.findMany({
      where: { userId },
      orderBy: { snapshotDate: 'asc' },
    })

    const capitals = snapshots.map((s) => Number(s.capital))
    const dd = calcDrawdown(capitals)

    let peak = 0
    let peakDate: Date | null = null
    let worstStart: Date | null = null
    let worstEnd: Date | null = null
    let worstDD = 0
    let runningPeak = 0
    let ddStart: Date | null = null

    const daily = snapshots.map((s) => {
      const capital = Number(s.capital)
      if (capital > runningPeak) {
        runningPeak = capital
        peak = capital
        peakDate = s.snapshotDate
        ddStart = s.snapshotDate
      }
      const drawdown = runningPeak > 0 ? ((capital - runningPeak) / runningPeak) * 100 : 0
      if (drawdown < worstDD) {
        worstDD = drawdown
        worstStart = ddStart
        worstEnd = s.snapshotDate
      }
      return {
        date: s.snapshotDate,
        capital,
        peak: runningPeak,
        drawdown: Math.round(drawdown * 100) / 100,
      }
    })

    return {
      current: dd.current,
      maximum: dd.maximum,
      peakDate,
      peakCapital: peak,
      worstPeriod: worstStart && worstEnd
        ? { startDate: worstStart, endDate: worstEnd, drawdown: Math.round(worstDD * 100) / 100 }
        : null,
      daily,
    }
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildDateFilter(userId: string, period: Period) {
  const now = new Date()
  let startDate: Date | undefined

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'all':
    default:
      startDate = undefined
  }

  return {
    userId,
    ...(startDate ? { entryDate: { gte: startDate } } : {}),
  }
}
