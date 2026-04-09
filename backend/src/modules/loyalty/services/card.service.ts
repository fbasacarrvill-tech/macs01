import { PrismaClient } from '@prisma/client'
import { CreateCardRequest } from '../types'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export class CardService {
  /**
   * Create a new loyalty card for a customer
   */
  async createCard(businessId: string, data: CreateCardRequest) {
    // Verify program belongs to business and customer is enrolled
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: data.programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const enrollment = await prisma.customerProgram.findUnique({
      where: {
        customerId_programId: {
          customerId: data.customerId,
          programId: data.programId
        }
      }
    })

    if (!enrollment) {
      throw new Error('Customer is not enrolled in this program')
    }

    // Check if card already exists
    const existing = await prisma.loyaltyCard.findFirst({
      where: {
        customerId: data.customerId,
        programId: data.programId,
        status: 'ACTIVE'
      }
    })

    if (existing) {
      throw new Error('Customer already has an active card for this program')
    }

    // Generate card number and codes
    const cardNumber = data.cardNumber || this.generateCardNumber()
    const barcode = this.generateBarcode()
    const qrCode = this.generateQRCode()

    const card = await prisma.loyaltyCard.create({
      data: {
        programId: data.programId,
        customerId: data.customerId,
        cardNumber,
        barcode,
        qrCode,
        status: 'ACTIVE',
        points: 0,
        totalPointsEarned: 0,
        totalPointsRedeemed: 0,
        issuedAt: new Date(),
        expiresAt: data.expiresAt || this.calculateExpiration(program.expirationDays)
      }
    })

    return this.formatCardResponse(card)
  }

  /**
   * Get card by ID
   */
  async getCard(businessId: string, cardId: string) {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: cardId },
      include: {
        program: true,
        customer: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!card || card.program.businessId !== businessId) {
      throw new Error('Card not found')
    }

    return {
      ...this.formatCardResponse(card),
      program: {
        id: card.program.id,
        name: card.program.name,
        type: card.program.type
      },
      customer: {
        id: card.customer.id,
        email: card.customer.email,
        firstName: card.customer.firstName,
        lastName: card.customer.lastName
      },
      recentTransactions: card.transactions
    }
  }

  /**
   * Get card by card number or barcode for scanning
   */
  async getCardByCode(businessId: string, code: string) {
    const card = await prisma.loyaltyCard.findFirst({
      where: {
        OR: [
          { cardNumber: code },
          { barcode: code },
          { qrCode: code }
        ],
        program: {
          businessId
        }
      },
      include: {
        program: true,
        customer: true
      }
    })

    if (!card) {
      throw new Error('Card not found')
    }

    return {
      ...this.formatCardResponse(card),
      program: {
        id: card.program.id,
        name: card.program.name,
        type: card.program.type
      },
      customer: {
        id: card.customer.id,
        email: card.customer.email,
        firstName: card.customer.firstName,
        lastName: card.customer.lastName
      }
    }
  }

  /**
   * List cards for a program
   */
  async listCardsByProgram(businessId: string, programId: string, filters?: { page?: number; limit?: number }) {
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

    const [cards, total] = await Promise.all([
      prisma.loyaltyCard.findMany({
        where: { programId },
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
          }
        }
      }),
      prisma.loyaltyCard.count({ where: { programId } })
    ])

    return {
      data: cards.map(card => ({
        ...this.formatCardResponse(card),
        customer: card.customer
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
   * Add stamp to card (for STAMPS program type)
   */
  async addStamp(businessId: string, cardId: string) {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: cardId },
      include: { program: true }
    })

    if (!card || card.program.businessId !== businessId) {
      throw new Error('Card not found')
    }

    if (card.program.type !== 'STAMPS') {
      throw new Error('Program does not support stamps')
    }

    // Increment points
    const updated = await prisma.loyaltyCard.update({
      where: { id: cardId },
      data: {
        points: card.points + 1,
        totalPointsEarned: card.totalPointsEarned + 1
      }
    })

    // Create transaction
    await this.createTransaction({
      cardId,
      customerId: card.customerId,
      programId: card.programId,
      type: 'BONUS',
      points: 1,
      description: 'Stamp added'
    })

    return this.formatCardResponse(updated)
  }

  /**
   * Add points to card
   */
  async addPoints(businessId: string, cardId: string, points: number, description?: string) {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: cardId },
      include: { program: true }
    })

    if (!card || card.program.businessId !== businessId) {
      throw new Error('Card not found')
    }

    const updated = await prisma.loyaltyCard.update({
      where: { id: cardId },
      data: {
        points: card.points + points,
        totalPointsEarned: card.totalPointsEarned + points
      }
    })

    // Create transaction
    await this.createTransaction({
      cardId,
      customerId: card.customerId,
      programId: card.programId,
      type: 'BONUS',
      points,
      description: description || 'Points added'
    })

    return this.formatCardResponse(updated)
  }

  /**
   * Redeem points from card
   */
  async redeemReward(businessId: string, cardId: string, pointsToRedeem: number, description?: string) {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: cardId },
      include: { program: true }
    })

    if (!card || card.program.businessId !== businessId) {
      throw new Error('Card not found')
    }

    if (card.points < pointsToRedeem) {
      throw new Error('Insufficient points for redemption')
    }

    const updated = await prisma.loyaltyCard.update({
      where: { id: cardId },
      data: {
        points: card.points - pointsToRedeem,
        totalPointsRedeemed: card.totalPointsRedeemed + pointsToRedeem
      }
    })

    // Create transaction
    await this.createTransaction({
      cardId,
      customerId: card.customerId,
      programId: card.programId,
      type: 'REDEMPTION',
      points: pointsToRedeem,
      description: description || 'Reward redeemed'
    })

    return this.formatCardResponse(updated)
  }

  /**
   * Update card status
   */
  async updateCardStatus(
    businessId: string,
    cardId: string,
    status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'REDEEMED'
  ) {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: cardId },
      include: { program: true }
    })

    if (!card || card.program.businessId !== businessId) {
      throw new Error('Card not found')
    }

    const updated = await prisma.loyaltyCard.update({
      where: { id: cardId },
      data: {
        status,
        ...(status === 'REDEEMED' && { redeemedAt: new Date() })
      }
    })

    return this.formatCardResponse(updated)
  }

  /**
   * Add card to wallet
   */
  async addToWallet(businessId: string, cardId: string, walletType: 'APPLE' | 'GOOGLE') {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: cardId },
      include: { program: true }
    })

    if (!card || card.program.businessId !== businessId) {
      throw new Error('Card not found')
    }

    // Generate JWT token for wallet
    const jwtToken = this.generateWalletToken(card)

    const updated = await prisma.loyaltyCard.update({
      where: { id: cardId },
      data: {
        walletType,
        jwtToken,
        addedToWalletAt: new Date()
      }
    })

    return {
      success: true,
      passUrl: `https://api.example.com/wallet/pass/${cardId}`,
      jwtToken
    }
  }

  /**
   * Helper: Create transaction record
   */
  private async createTransaction(data: {
    cardId: string
    customerId: string
    programId: string
    type: string
    points: number
    description?: string
  }) {
    await prisma.transaction.create({
      data: {
        cardId: data.cardId,
        customerId: data.customerId,
        programId: data.programId,
        type: data.type as any,
        points: data.points,
        description: data.description,
        pointsBalance: 0 // Will be calculated by query
      }
    })
  }

  /**
   * Helper: Generate card number
   */
  private generateCardNumber(): string {
    return 'CARD-' + Math.random().toString(36).substring(2, 15).toUpperCase()
  }

  /**
   * Helper: Generate barcode
   */
  private generateBarcode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * Helper: Generate QR code (simplified)
   */
  private generateQRCode(): string {
    return uuidv4()
  }

  /**
   * Helper: Generate wallet token
   */
  private generateWalletToken(card: any): string {
    // In production, this would use JWT signing
    return Buffer.from(JSON.stringify({ cardId: card.id, timestamp: Date.now() })).toString('base64')
  }

  /**
   * Helper: Calculate expiration date
   */
  private calculateExpiration(expirationDays?: number | null): Date | null {
    if (!expirationDays) return null
    const date = new Date()
    date.setDate(date.getDate() + expirationDays)
    return date
  }

  /**
   * Helper: Format card response
   */
  private formatCardResponse(card: any) {
    return {
      id: card.id,
      programId: card.programId,
      customerId: card.customerId,
      cardNumber: card.cardNumber,
      barcode: card.barcode,
      qrCode: card.qrCode,
      status: card.status,
      points: card.points,
      totalPointsEarned: card.totalPointsEarned,
      totalPointsRedeemed: card.totalPointsRedeemed,
      walletType: card.walletType,
      addedToWalletAt: card.addedToWalletAt,
      issuedAt: card.issuedAt,
      expiresAt: card.expiresAt,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt
    }
  }
}

export default new CardService()
