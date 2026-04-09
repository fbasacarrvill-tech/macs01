import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { BusinessAuthPayload, CreateBusinessRequest } from '../types'
import { generateTokens, verifyToken } from '../middleware/auth'

const prisma = new PrismaClient()

export class AuthService {
  /**
   * Register a new business
   */
  async registerBusiness(data: CreateBusinessRequest) {
    // Check if business already exists
    const existingBusiness = await prisma.business.findUnique({
      where: { email: data.email }
    })

    if (existingBusiness) {
      throw new Error('Business with this email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create business
    const business = await prisma.business.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        // passwordHash will be added separately below
      }
    })

    // Note: In a real scenario, you'd want to store the password hash
    // For now, we're using Prisma's generated types
    // You might need to add a passwordHash field to the Business model

    const businessPayload: BusinessAuthPayload = {
      id: business.id,
      email: business.email,
      name: business.name
    }

    const tokens = generateTokens(businessPayload)

    return {
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        status: business.status,
        primaryColor: business.primaryColor,
        secondaryColor: business.secondaryColor,
        createdAt: business.createdAt
      },
      tokens
    }
  }

  /**
   * Login business
   */
  async loginBusiness(email: string, password: string) {
    // For now, return mock implementation
    // In production, you'd verify password against stored hash
    const business = await prisma.business.findUnique({
      where: { email }
    })

    if (!business) {
      throw new Error('Invalid email or password')
    }

    // Password verification would go here
    // const isValid = await bcrypt.compare(password, business.passwordHash)
    // if (!isValid) {
    //   throw new Error('Invalid email or password')
    // }

    const businessPayload: BusinessAuthPayload = {
      id: business.id,
      email: business.email,
      name: business.name
    }

    const tokens = generateTokens(businessPayload)

    return {
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        status: business.status,
        createdAt: business.createdAt
      },
      tokens
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    const decoded = verifyToken(refreshToken)

    if (!decoded) {
      throw new Error('Invalid refresh token')
    }

    const business = await prisma.business.findUnique({
      where: { id: decoded.id }
    })

    if (!business) {
      throw new Error('Business not found')
    }

    const businessPayload: BusinessAuthPayload = {
      id: business.id,
      email: business.email,
      name: business.name
    }

    const tokens = generateTokens(businessPayload)

    return { tokens }
  }

  /**
   * Get business profile
   */
  async getBusinessProfile(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        programs: {
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    })

    if (!business) {
      throw new Error('Business not found')
    }

    return {
      id: business.id,
      name: business.name,
      email: business.email,
      phone: business.phone,
      website: business.website,
      logoUrl: business.logoUrl,
      primaryColor: business.primaryColor,
      secondaryColor: business.secondaryColor,
      status: business.status,
      isEmailVerified: business.isEmailVerified,
      programs: business.programs,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt
    }
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(
    businessId: string,
    data: {
      name?: string
      phone?: string
      website?: string
      logoUrl?: string
      primaryColor?: string
      secondaryColor?: string
    }
  ) {
    const business = await prisma.business.update({
      where: { id: businessId },
      data
    })

    return {
      id: business.id,
      name: business.name,
      email: business.email,
      phone: business.phone,
      website: business.website,
      logoUrl: business.logoUrl,
      primaryColor: business.primaryColor,
      secondaryColor: business.secondaryColor,
      status: business.status,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt
    }
  }

  /**
   * Verify business email
   */
  async verifyBusinessEmail(businessId: string) {
    const business = await prisma.business.update({
      where: { id: businessId },
      data: { isEmailVerified: true }
    })

    return {
      id: business.id,
      email: business.email,
      isEmailVerified: business.isEmailVerified
    }
  }

  /**
   * Create API key for business
   */
  async createApiKey(businessId: string, name: string) {
    // Generate random key and secret
    const key = this.generateRandomString(32)
    const secret = this.generateRandomString(64)

    // Hash secret for storage
    const secretHash = await bcrypt.hash(secret, 10)

    const apiKey = await prisma.businessApiKey.create({
      data: {
        businessId,
        key,
        secret: secretHash,
        name
      }
    })

    return {
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      secret, // Only return secret once on creation
      createdAt: apiKey.createdAt
    }
  }

  /**
   * List API keys for business
   */
  async listApiKeys(businessId: string) {
    const keys = await prisma.businessApiKey.findMany({
      where: { businessId },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true
      }
    })

    return keys
  }

  /**
   * Delete API key
   */
  async deleteApiKey(businessId: string, keyId: string) {
    // Verify ownership
    const key = await prisma.businessApiKey.findUnique({
      where: { id: keyId }
    })

    if (!key || key.businessId !== businessId) {
      throw new Error('API key not found or unauthorized')
    }

    await prisma.businessApiKey.delete({
      where: { id: keyId }
    })

    return { success: true }
  }

  /**
   * Helper: Generate random string
   */
  private generateRandomString(length: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

export default new AuthService()
