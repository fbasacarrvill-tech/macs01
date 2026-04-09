import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AnalyticsService {
  /**
   * Get program overview analytics
   */
  async getProgramOverview(businessId: string, programId: string) {
    // Verify program belongs to business
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    // Get cards and customers
    const [cards, customers, transactions, analytics] = await Promise.all([
      prisma.loyaltyCard.findMany({ where: { programId } }),
      prisma.customerProgram.findMany({ where: { programId } }),
      prisma.transaction.findMany({ where: { programId } }),
      prisma.programAnalytics.findUnique({ where: { programId } })
    ])

    const activeCards = cards.filter(c => c.status === 'ACTIVE').length
    const totalPoints = cards.reduce((sum, c) => sum + c.points, 0)
    const totalPointsRedeemed = cards.reduce((sum, c) => sum + c.totalPointsRedeemed, 0)
    const totalRevenue = transactions
      .filter(t => t.amount)
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    return {
      programId,
      programName: program.name,
      programType: program.type,
      totalCustomers: customers.length,
      activeCards,
      inactiveCards: cards.length - activeCards,
      totalCards: cards.length,
      totalPoints,
      totalPointsRedeemed,
      totalTransactions: transactions.length,
      totalRevenue,
      avgPointsPerCustomer: customers.length > 0 ? totalPoints / customers.length : 0,
      redemptionRate: totalPoints > 0 ? (totalPointsRedeemed / totalPoints * 100).toFixed(2) + '%' : '0%',
      engagementRate: cards.length > 0 ? (activeCards / cards.length * 100).toFixed(2) + '%' : '0%'
    }
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(businessId: string, customerId: string, programId?: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        cards: {
          where: programId ? { programId } : {}
        },
        programs: {
          where: {
            program: {
              businessId
            }
          },
          include: {
            program: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    })

    if (!customer || customer.programs.length === 0) {
      throw new Error('Customer not found in this business')
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        customerId,
        ...(programId && { programId })
      }
    })

    const totalSpent = transactions
      .filter(t => t.amount && ['PURCHASE', 'BONUS'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const totalPointsEarned = transactions
      .filter(t => ['PURCHASE', 'BONUS'].includes(t.type))
      .reduce((sum, t) => sum + t.points, 0)

    const totalPointsRedeemed = transactions
      .filter(t => t.type === 'REDEMPTION')
      .reduce((sum, t) => sum + t.points, 0)

    return {
      customerId,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      enrolledPrograms: customer.programs.map(p => ({
        programId: p.program.id,
        programName: p.program.name,
        programType: p.program.type
      })),
      totalCards: customer.cards.length,
      activeCards: customer.cards.filter(c => c.status === 'ACTIVE').length,
      totalSpent,
      totalPointsEarned,
      totalPointsRedeemed,
      currentPoints: customer.cards.reduce((sum, c) => sum + c.points, 0),
      transactionCount: transactions.length,
      lastActivityAt: transactions.length > 0 ? transactions[transactions.length - 1].createdAt : null,
      joinedAt: customer.createdAt
    }
  }

  /**
   * Get time-based analytics
   */
  async getTimeBasedAnalytics(businessId: string, programId: string, periodDays: number = 30) {
    // Verify program belongs to business
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    const transactions = await prisma.transaction.findMany({
      where: {
        programId,
        createdAt: {
          gte: startDate
        }
      }
    })

    // Group by date
    const byDate: Record<string, any[]> = {}
    transactions.forEach(t => {
      const dateKey = t.createdAt.toISOString().split('T')[0]
      if (!byDate[dateKey]) byDate[dateKey] = []
      byDate[dateKey].push(t)
    })

    const dailyMetrics = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({
        date,
        transactionCount: items.length,
        totalPoints: items.reduce((sum, t) => sum + t.points, 0),
        totalRevenue: items
          .filter(t => t.amount)
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        byType: this.groupBy(items, 'type').reduce((acc, [type, typeItems]) => {
          acc[type] = typeItems.length
          return acc
        }, {} as Record<string, number>)
      }))

    // Overall stats
    const totalTransactions = transactions.length
    const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0)
    const totalRevenue = transactions
      .filter(t => t.amount)
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    return {
      programId,
      period: `Last ${periodDays} days`,
      startDate,
      endDate: new Date(),
      totalTransactions,
      totalPoints,
      totalRevenue,
      avgTransactionsPerDay: (totalTransactions / periodDays).toFixed(2),
      avgPointsPerDay: (totalPoints / periodDays).toFixed(2),
      avgRevenuePerDay: (totalRevenue / periodDays).toFixed(2),
      dailyMetrics
    }
  }

  /**
   * Get customer segmentation
   */
  async getCustomerSegmentation(businessId: string, programId: string) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const customers = await prisma.customerProgram.findMany({
      where: { programId },
      include: {
        customer: {
          include: {
            cards: {
              where: { programId }
            }
          }
        }
      }
    })

    // Segment by engagement
    const segments = {
      highEngagement: customers.filter(cp => cp.customer.cards.some(c => c.points > 100)).length,
      mediumEngagement: customers.filter(
        cp => cp.customer.cards.some(c => c.points > 0 && c.points <= 100)
      ).length,
      lowEngagement: customers.filter(cp => cp.customer.cards.every(c => c.points === 0)).length,
      inactive: customers.filter(cp => cp.customer.cards.length === 0).length
    }

    // Segment by card status
    const byStatus = {
      active: customers.filter(cp => cp.customer.cards.some(c => c.status === 'ACTIVE')).length,
      paused: customers.filter(cp => cp.customer.cards.some(c => c.status === 'PAUSED')).length,
      expired: customers.filter(cp => cp.customer.cards.some(c => c.status === 'EXPIRED')).length,
      redeemed: customers.filter(cp => cp.customer.cards.some(c => c.status === 'REDEEMED')).length
    }

    return {
      programId,
      totalCustomers: customers.length,
      engagement: segments,
      cardStatus: byStatus,
      segments: [
        {
          name: 'High Engagement',
          count: segments.highEngagement,
          percentage: (segments.highEngagement / customers.length * 100).toFixed(2) + '%'
        },
        {
          name: 'Medium Engagement',
          count: segments.mediumEngagement,
          percentage: (segments.mediumEngagement / customers.length * 100).toFixed(2) + '%'
        },
        {
          name: 'Low Engagement',
          count: segments.lowEngagement,
          percentage: (segments.lowEngagement / customers.length * 100).toFixed(2) + '%'
        },
        {
          name: 'Inactive',
          count: segments.inactive,
          percentage: (segments.inactive / customers.length * 100).toFixed(2) + '%'
        }
      ]
    }
  }

  /**
   * Get ROI metrics
   */
  async getROI(businessId: string, programId: string) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const transactions = await prisma.transaction.findMany({
      where: { programId }
    })

    const totalRevenue = transactions
      .filter(t => t.amount && ['PURCHASE', 'BONUS'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    // Estimate cost of rewards given (simplified)
    const rewardCost = transactions
      .filter(t => t.type === 'REDEMPTION')
      .reduce((sum, t) => sum + (t.points * 0.01), 0) // $0.01 per point

    const roi = totalRevenue > 0 ? (((totalRevenue - rewardCost) / rewardCost) * 100).toFixed(2) : 0

    return {
      programId,
      programName: program.name,
      programType: program.type,
      totalRevenue: totalRevenue.toFixed(2),
      estimatedRewardCost: rewardCost.toFixed(2),
      netProfit: (totalRevenue - rewardCost).toFixed(2),
      roi: roi + '%',
      transactionCount: transactions.length,
      avgTransactionValue: transactions.length > 0 ? (totalRevenue / transactions.length).toFixed(2) : 0
    }
  }

  /**
   * Helper: Group array by property
   */
  private groupBy(array: any[], property: string): [string, any[]][] {
    const grouped = array.reduce(
      (acc, obj) => {
        const key = obj[property]
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(obj)
        return acc
      },
      {} as Record<string, any[]>
    )
    return Object.entries(grouped)
  }
}

export default new AnalyticsService()
