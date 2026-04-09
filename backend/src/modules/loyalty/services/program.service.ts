import { PrismaClient } from '@prisma/client'
import {
  CreateProgramRequest,
  UpdateProgramRequest,
  CreateTierRequest,
  CreateRuleRequest,
  ProgramType
} from '../types'

const prisma = new PrismaClient()

export class ProgramService {
  /**
   * Create a new loyalty program
   */
  async createProgram(businessId: string, data: CreateProgramRequest) {
    // Validate program type
    const validTypes: ProgramType[] = [
      'STAMPS',
      'CASHBACK',
      'AFFINITY',
      'DISCOUNT',
      'COUPON',
      'GIFT',
      'MEMBERSHIP',
      'MULTIPASS'
    ]

    if (!validTypes.includes(data.type)) {
      throw new Error(`Invalid program type. Must be one of: ${validTypes.join(', ')}`)
    }

    // Generate default colors if not provided
    const backgroundColor = data.backgroundColor || '#FFFFFF'
    const foregroundColor = data.foregroundColor || '#000000'
    const accentColor = data.accentColor || '#3B82F6'

    const program = await prisma.loyaltyProgram.create({
      data: {
        businessId,
        name: data.name,
        description: data.description,
        type: data.type,
        currencyCode: data.currencyCode || 'USD',
        pointsName: data.pointsName || 'Points',
        pointsPerDollar: data.pointsPerDollar || 1.0,
        logoUrl: data.logoUrl,
        backgroundColor,
        foregroundColor,
        accentColor,
        minPointsRedeemable: data.minPointsRedeemable || 100,
        expirationDays: data.expirationDays,
        isActive: true
      }
    })

    // Create analytics record
    await prisma.programAnalytics.create({
      data: {
        programId: program.id
      }
    })

    return this.formatProgramResponse(program)
  }

  /**
   * Get program by ID
   */
  async getProgram(businessId: string, programId: string) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId },
      include: {
        tiers: true,
        rules: true,
        analytics: true,
        cards: {
          select: { id: true, status: true }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    return {
      ...this.formatProgramResponse(program),
      tiers: program.tiers,
      rules: program.rules,
      analytics: program.analytics,
      stats: {
        totalCards: program.cards.length,
        activeCards: program.cards.filter(c => c.status === 'ACTIVE').length
      },
      recentTransactions: program.transactions
    }
  }

  /**
   * List programs for business
   */
  async listPrograms(
    businessId: string,
    filters?: {
      type?: ProgramType
      isActive?: boolean
      page?: number
      limit?: number
    }
  ) {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    const where: any = { businessId }

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    const [programs, total] = await Promise.all([
      prisma.loyaltyProgram.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cards: {
            select: { id: true }
          },
          analytics: true
        }
      }),
      prisma.loyaltyProgram.count({ where })
    ])

    return {
      data: programs.map(program => ({
        ...this.formatProgramResponse(program),
        cardCount: program.cards.length,
        analytics: program.analytics
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
   * Update program
   */
  async updateProgram(businessId: string, programId: string, data: UpdateProgramRequest) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const updated = await prisma.loyaltyProgram.update({
      where: { id: programId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.currencyCode && { currencyCode: data.currencyCode }),
        ...(data.pointsName && { pointsName: data.pointsName }),
        ...(data.pointsPerDollar && { pointsPerDollar: data.pointsPerDollar }),
        ...(data.minPointsRedeemable && { minPointsRedeemable: data.minPointsRedeemable }),
        ...(data.expirationDays !== undefined && { expirationDays: data.expirationDays }),
        ...(data.logoUrl && { logoUrl: data.logoUrl }),
        ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
        ...(data.foregroundColor && { foregroundColor: data.foregroundColor }),
        ...(data.accentColor && { accentColor: data.accentColor })
      }
    })

    return this.formatProgramResponse(updated)
  }

  /**
   * Delete/archive program
   */
  async deleteProgram(businessId: string, programId: string) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    // Archive instead of delete for data integrity
    await prisma.loyaltyProgram.update({
      where: { id: programId },
      data: { isActive: false }
    })

    return { success: true }
  }

  /**
   * Publish program (make it available to customers)
   */
  async publishProgram(businessId: string, programId: string) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const updated = await prisma.loyaltyProgram.update({
      where: { id: programId },
      data: { publishedAt: new Date() }
    })

    return this.formatProgramResponse(updated)
  }

  /**
   * Create tier for program
   */
  async createTier(businessId: string, programId: string, data: CreateTierRequest) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const tier = await prisma.loyaltyTier.create({
      data: {
        programId,
        name: data.name,
        requiredPoints: data.requiredPoints,
        discount: data.discount || 0,
        color: data.color || '#C0C0C0'
      }
    })

    return tier
  }

  /**
   * Get tiers for program
   */
  async getTiers(businessId: string, programId: string) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const tiers = await prisma.loyaltyTier.findMany({
      where: { programId },
      orderBy: { requiredPoints: 'asc' }
    })

    return tiers
  }

  /**
   * Create rule for program
   */
  async createRule(businessId: string, programId: string, data: CreateRuleRequest) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const rule = await prisma.programRule.create({
      data: {
        programId,
        type: data.type,
        condition: JSON.stringify(data.condition),
        reward: JSON.stringify(data.reward)
      }
    })

    return {
      ...rule,
      condition: JSON.parse(rule.condition),
      reward: JSON.parse(rule.reward)
    }
  }

  /**
   * Get rules for program
   */
  async getRules(businessId: string, programId: string) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const rules = await prisma.programRule.findMany({
      where: { programId }
    })

    return rules.map(rule => ({
      ...rule,
      condition: JSON.parse(rule.condition),
      reward: JSON.parse(rule.reward)
    }))
  }

  /**
   * Get program analytics
   */
  async getProgramAnalytics(businessId: string, programId: string) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const analytics = await prisma.programAnalytics.findUnique({
      where: { programId }
    })

    return analytics
  }

  /**
   * Helper: Format program response
   */
  private formatProgramResponse(program: any) {
    return {
      id: program.id,
      businessId: program.businessId,
      name: program.name,
      description: program.description,
      type: program.type,
      currencyCode: program.currencyCode,
      pointsName: program.pointsName,
      pointsPerDollar: program.pointsPerDollar,
      backgroundColor: program.backgroundColor,
      foregroundColor: program.foregroundColor,
      accentColor: program.accentColor,
      minPointsRedeemable: program.minPointsRedeemable,
      expirationDays: program.expirationDays,
      isActive: program.isActive,
      publishedAt: program.publishedAt,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt
    }
  }
}

export default new ProgramService()
