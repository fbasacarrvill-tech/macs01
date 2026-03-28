import { prisma } from '../lib/prisma'
import { calcPeriodMetrics } from '../utils/metrics'

/**
 * Servicio para generación de reportes PDF, CSV y emails
 */
export const ReportService = {
  /**
   * Genera datos de reporte completo
   */
  async generateReport(userId: string, startDate: Date, endDate: Date) {
    const [trades, portfolio, snapshots] = await Promise.all([
      prisma.trade.findMany({
        where: {
          userId,
          status: 'CLOSED',
          entryDate: { gte: startDate, lte: endDate },
        },
        include: { asset: true, strategy: true },
        orderBy: { entryDate: 'asc' },
      }),
      prisma.portfolio.findUnique({ where: { userId } }),
      prisma.dailySnapshot.findMany({
        where: {
          userId,
          snapshotDate: { gte: startDate, lte: endDate },
        },
        orderBy: { snapshotDate: 'asc' },
      }),
    ])

    const metrics = calcPeriodMetrics(trades)
    const initialCapital = portfolio?.initialCapital ?? 10000
    const startCapital = snapshots[0]?.capital ?? initialCapital
    const endCapital = snapshots[snapshots.length - 1]?.capital ?? initialCapital

    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const months = Math.max(1, days / 30)

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days,
      },
      summary: {
        totalTrades: metrics.totalTrades,
        winningTrades: metrics.winningTrades,
        losingTrades: metrics.losingTrades,
        winRate: metrics.winRate,
        totalProfitLoss: metrics.totalProfitLoss,
        roi: (metrics.totalProfitLoss / startCapital) * 100,
        monthlyROI: ((endCapital - startCapital) / startCapital / months) * 100,
      },
      performance: {
        averageWin: metrics.averageWin,
        averageLoss: metrics.averageLoss,
        profitFactor: metrics.profitFactor,
        expectancy: metrics.expectancy,
        maxConsecutiveWins: metrics.consecutiveWins,
        maxConsecutiveLosses: metrics.consecutiveLosses,
      },
      trades: trades.map((t) => ({
        date: t.entryDate.toISOString().split('T')[0],
        asset: t.asset.symbol,
        strategy: t.strategy?.name ?? 'N/A',
        direction: t.direction,
        entryPrice: Number(t.entryPrice),
        exitPrice: Number(t.exitPrice),
        quantity: Number(t.entryQuantity),
        profitLoss: Number(t.profitLoss),
        roi: Number(t.roi),
        riskRewardRatio: Number(t.riskRewardRatio),
      })),
      equity: snapshots.map((s) => ({
        date: s.snapshotDate.toISOString().split('T')[0],
        capital: Number(s.capital),
        drawdown: s.drawdown ? Number(s.drawdown) : null,
      })),
    }
  },

  /**
   * Genera CSV para los trades
   */
  async exportTradesCSV(userId: string, startDate: Date, endDate: Date): Promise<string> {
    const data = await this.generateReport(userId, startDate, endDate)

    const header = ['Fecha', 'Activo', 'Estrategia', 'Dirección', 'Entrada', 'Salida', 'Cantidad', 'P&L', 'ROI %', 'R/R']
    const rows = data.trades.map((t) => [
      t.date,
      t.asset,
      t.strategy,
      t.direction,
      t.entryPrice.toFixed(2),
      t.exitPrice.toFixed(2),
      t.quantity.toFixed(2),
      t.profitLoss.toFixed(2),
      (t.roi ?? 0).toFixed(2),
      (t.riskRewardRatio ?? 0).toFixed(2),
    ])

    const csv = [
      header.join(','),
      ...rows.map((r) => r.join(',')),
      '',
      'RESUMEN',
      `Total Trades,${data.summary.totalTrades}`,
      `Win Rate,${data.summary.winRate.toFixed(2)}%`,
      `Total P&L,$${data.summary.totalProfitLoss.toFixed(2)}`,
      `ROI,${data.summary.roi.toFixed(2)}%`,
      `Profit Factor,${data.performance.profitFactor.toFixed(2)}x`,
    ].join('\n')

    return csv
  },

  /**
   * Genera JSON para PDF/email
   */
  getReportJSON(userId: string, startDate: Date, endDate: Date) {
    return this.generateReport(userId, startDate, endDate)
  },
}
