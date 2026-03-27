import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { calcTradeMetrics } from '../utils/metrics'
import {
  CreateTradeBody,
  UpdateTradeBody,
  TradeFilters,
  PaginatedResponse,
} from '../types'

export const TradeService = {
  async list(userId: string, filters: TradeFilters): Promise<PaginatedResponse<unknown>> {
    const page = Math.max(1, filters.page ?? 1)
    const limit = Math.min(100, filters.limit ?? 20)
    const skip = (page - 1) * limit

    const where: Prisma.TradeWhereInput = { userId }

    if (filters.status) where.status = { in: filters.status.split(',') }
    if (filters.assetId) where.assetId = filters.assetId
    if (filters.strategyId) where.strategyId = filters.strategyId
    if (filters.direction) where.direction = filters.direction
    if (filters.startDate || filters.endDate) {
      where.entryDate = {}
      if (filters.startDate) where.entryDate.gte = new Date(filters.startDate)
      if (filters.endDate) where.entryDate.lte = new Date(filters.endDate)
    }

    const [total, trades] = await Promise.all([
      prisma.trade.count({ where }),
      prisma.trade.findMany({
        where,
        include: { asset: true, strategy: true },
        orderBy: { entryDate: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return {
      items: trades,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  },

  async getById(id: string, userId: string) {
    const trade = await prisma.trade.findFirst({
      where: { id, userId },
      include: { asset: true, strategy: true },
    })
    if (!trade) throw new Error('Trade not found')
    return trade
  },

  async create(userId: string, body: CreateTradeBody) {
    const metrics = calcPartialMetrics(body)

    const trade = await prisma.trade.create({
      data: {
        userId,
        assetId: body.assetId,
        strategyId: body.strategyId,
        entryDate: new Date(body.entryDate),
        entryTime: body.entryTime,
        entryPrice: body.entryPrice,
        entryQuantity: body.entryQuantity,
        direction: body.direction,
        stopLoss: body.stopLoss,
        takeProfit: body.takeProfit,
        riskAmount: metrics.risk,
        rewardAmount: metrics.reward,
        riskRewardRatio: metrics.riskRewardRatio,
        notes: body.notes,
        tags: body.tags,
        status: 'OPEN',
      },
      include: { asset: true, strategy: true },
    })

    return trade
  },

  async update(id: string, userId: string, body: UpdateTradeBody) {
    await TradeService.getById(id, userId)

    // Calcular métricas si se está cerrando el trade
    const updateData: Prisma.TradeUpdateInput = { ...body }

    if (body.exitPrice && body.entryPrice) {
      const mockTrade = {
        entryPrice: new Prisma.Decimal(body.entryPrice),
        entryQuantity: new Prisma.Decimal(body.entryQuantity ?? 0),
        exitPrice: new Prisma.Decimal(body.exitPrice),
        direction: body.direction ?? 'LONG',
        stopLoss: body.stopLoss ? new Prisma.Decimal(body.stopLoss) : null,
        takeProfit: body.takeProfit ? new Prisma.Decimal(body.takeProfit) : null,
      } as Parameters<typeof calcTradeMetrics>[0]

      const m = calcTradeMetrics(mockTrade)
      updateData.profitLoss = m.profitLoss
      updateData.profitLossPercentage = m.profitLossPercentage
      updateData.roi = m.roi
      updateData.riskRewardRatio = m.riskRewardRatio
    }

    if (body.status === 'CLOSED' && !updateData.closedAt) {
      updateData.closedAt = new Date()
    }

    const trade = await prisma.trade.update({
      where: { id },
      data: updateData,
      include: { asset: true, strategy: true },
    })

    // Actualizar portfolio en background (no bloqueante)
    updatePortfolioStats(userId).catch(console.error)

    return trade
  },

  async delete(id: string, userId: string) {
    await TradeService.getById(id, userId)
    await prisma.trade.delete({ where: { id } })
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcPartialMetrics(body: CreateTradeBody) {
  let risk = 0
  let reward = 0
  let riskRewardRatio = 0

  if (body.stopLoss) {
    risk =
      body.direction === 'LONG'
        ? (body.entryPrice - body.stopLoss) * body.entryQuantity
        : (body.stopLoss - body.entryPrice) * body.entryQuantity
  }

  if (body.takeProfit) {
    reward =
      body.direction === 'LONG'
        ? (body.takeProfit - body.entryPrice) * body.entryQuantity
        : (body.entryPrice - body.takeProfit) * body.entryQuantity
  }

  if (risk > 0) riskRewardRatio = reward / risk

  return { risk, reward, riskRewardRatio }
}

async function updatePortfolioStats(userId: string) {
  const trades = await prisma.trade.findMany({
    where: { userId, status: 'CLOSED' },
  })

  if (trades.length === 0) return

  const winning = trades.filter((t) => Number(t.profitLoss) > 0).length
  const losing = trades.filter((t) => Number(t.profitLoss) < 0).length
  const total = trades.length
  const winRate = (winning / total) * 100
  const totalPL = trades.reduce((s, t) => s + Number(t.profitLoss ?? 0), 0)

  const portfolio = await prisma.portfolio.findUnique({ where: { userId } })
  if (!portfolio) return

  const currentCapital = Number(portfolio.initialCapital) + totalPL

  await prisma.portfolio.update({
    where: { userId },
    data: {
      currentCapital,
      totalProfitLoss: totalPL,
      totalROI: (totalPL / Number(portfolio.initialCapital)) * 100,
      totalTrades: total,
      winTrades: winning,
      lossTrades: losing,
      winRate,
    },
  })
}
