import { PrismaClient } from '@prisma/client'
import { CreateTransactionRequest, TransactionType } from '../types'

const prisma = new PrismaClient()

export class TransactionService {
  /**
   * Create a transaction
   */
  async createTransaction(businessId: string, data: CreateTransactionRequest) {
    // Verify card belongs to a program in this business
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: data.cardId },
      include: { program: true }
    })

    if (!card || card.program.businessId !== businessId) {
      throw new Error('Card not found')
    }

    // Verify customer
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    const transaction = await prisma.transaction.create({
      data: {
        cardId: data.cardId,
        customerId: data.customerId,
        programId: data.programId,
        type: data.type,
        points: data.points,
        amount: data.amount,
        description: data.description,
        referenceId: data.referenceId,
        metadata: data.metadata,
        pointsBalance: card.points // Current balance at time of transaction
      }
    })

    return this.formatTransactionResponse(transaction)
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(businessId: string, transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        program: true,
        card: true,
        customer: true
      }
    })

    if (!transaction || transaction.program.businessId !== businessId) {
      throw new Error('Transaction not found')
    }

    return {
      ...this.formatTransactionResponse(transaction),
      card: {
        id: transaction.card.id,
        cardNumber: transaction.card.cardNumber
      },
      customer: {
        id: transaction.customer.id,
        email: transaction.customer.email,
        firstName: transaction.customer.firstName,
        lastName: transaction.customer.lastName
      },
      program: {
        id: transaction.program.id,
        name: transaction.program.name,
        type: transaction.program.type
      }
    }
  }

  /**
   * List transactions for a card
   */
  async listTransactionsByCard(
    businessId: string,
    cardId: string,
    filters?: { page?: number; limit?: number }
  ) {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    // Verify card belongs to this business
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: cardId },
      include: { program: true }
    })

    if (!card || card.program.businessId !== businessId) {
      throw new Error('Card not found')
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { cardId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({ where: { cardId } })
    ])

    return {
      data: transactions.map(t => this.formatTransactionResponse(t)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * List transactions for a customer
   */
  async listTransactionsByCustomer(
    businessId: string,
    customerId: string,
    filters?: { programId?: string; page?: number; limit?: number }
  ) {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {
      customerId,
      program: {
        businessId
      }
    }

    if (filters?.programId) {
      where.programId = filters.programId
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({ where })
    ])

    return {
      data: transactions.map(t => this.formatTransactionResponse(t)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * List transactions for a program
   */
  async listTransactionsByProgram(
    businessId: string,
    programId: string,
    filters?: { type?: TransactionType; page?: number; limit?: number }
  ) {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    // Verify program belongs to business
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const where: any = { programId }

    if (filters?.type) {
      where.type = filters.type
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          card: {
            select: {
              id: true,
              cardNumber: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ])

    return {
      data: transactions.map(t => ({
        ...this.formatTransactionResponse(t),
        customer: t.customer,
        card: t.card
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Get transaction analytics for a program
   */
  async getProgramTransactionAnalytics(businessId: string, programId: string) {
    // Verify program belongs to business
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const transactions = await prisma.transaction.findMany({
      where: { programId }
    })

    // Calculate analytics
    const totalTransactions = transactions.length
    const totalPointsEarned = transactions
      .filter(t => ['BONUS', 'PURCHASE'].includes(t.type))
      .reduce((sum, t) => sum + t.points, 0)
    const totalPointsRedeemed = transactions
      .filter(t => t.type === 'REDEMPTION')
      .reduce((sum, t) => sum + t.points, 0)
    const totalRevenue = transactions
      .filter(t => t.amount)
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    // Group by transaction type
    const byType = this.groupBy(transactions, 'type')
    const typeBreakdown = Object.entries(byType).map(([type, items]) => ({
      type,
      count: items.length,
      totalPoints: (items as any[]).reduce((sum, t) => sum + t.points, 0),
      totalAmount: (items as any[]).filter(t => t.amount).reduce((sum, t) => sum + (t.amount || 0), 0)
    }))

    // Transactions by date (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentTransactions = transactions.filter(t => new Date(t.createdAt) >= thirtyDaysAgo)

    return {
      totalTransactions,
      totalPointsEarned,
      totalPointsRedeemed,
      totalRevenue,
      typeBreakdown,
      recentTransactionCount: recentTransactions.length,
      averagePointsPerTransaction: totalTransactions > 0 ? totalPointsEarned / totalTransactions : 0
    }
  }

  /**
   * Helper: Group array by property
   */
  private groupBy(array: any[], property: string) {
    return array.reduce(
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
  }

  /**
   * Helper: Format transaction response
   */
  private formatTransactionResponse(transaction: any) {
    return {
      id: transaction.id,
      cardId: transaction.cardId,
      customerId: transaction.customerId,
      programId: transaction.programId,
      type: transaction.type,
      amount: transaction.amount,
      points: transaction.points,
      pointsBalance: transaction.pointsBalance,
      description: transaction.description,
      referenceId: transaction.referenceId,
      createdAt: transaction.createdAt
    }
  }
}

export default new TransactionService()
