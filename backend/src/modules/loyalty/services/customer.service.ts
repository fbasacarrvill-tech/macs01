import { PrismaClient } from '@prisma/client'
import { CreateCustomerRequest, UpdateCustomerRequest } from '../types'

const prisma = new PrismaClient()

export class CustomerService {
  /**
   * Create a new customer
   */
  async createCustomer(businessId: string, data: CreateCustomerRequest) {
    // Check if customer already exists for this business
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        email: data.email,
        programs: {
          some: {
            program: {
              businessId
            }
          }
        }
      }
    })

    if (existingCustomer) {
      throw new Error('Customer with this email already exists in this business')
    }

    const customer = await prisma.customer.create({
      data: {
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country || 'US',
        state: data.state,
        city: data.city,
        zipCode: data.zipCode,
        language: data.language || 'en',
        timeZone: data.timeZone || 'UTC',
        notificationsOptIn: true
      }
    })

    return this.formatCustomerResponse(customer)
  }

  /**
   * Get customer by ID
   */
  async getCustomer(businessId: string, customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
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
        },
        cards: {
          where: {
            program: {
              businessId
            }
          }
        },
        pushTokens: true
      }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    return {
      ...this.formatCustomerResponse(customer),
      programs: customer.programs.map(cp => cp.program),
      cardCount: customer.cards.length,
      pushTokenCount: customer.pushTokens.length
    }
  }

  /**
   * List customers for business
   */
  async listCustomers(
    businessId: string,
    filters?: {
      programId?: string
      search?: string
      page?: number
      limit?: number
    }
  ) {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}

    if (filters?.programId) {
      where.programs = {
        some: {
          programId: filters.programId,
          program: {
            businessId
          }
        }
      }
    } else {
      where.programs = {
        some: {
          program: {
            businessId
          }
        }
      }
    }

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cards: {
            select: { id: true, status: true }
          },
          programs: {
            select: {
              programId: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ])

    return {
      data: customers.map(customer => ({
        ...this.formatCustomerResponse(customer),
        cardCount: customer.cards.length,
        enrolledPrograms: customer.programs.length
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
   * Update customer
   */
  async updateCustomer(businessId: string, customerId: string, data: UpdateCustomerRequest) {
    // Verify customer exists and belongs to business
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        programs: {
          where: {
            program: {
              businessId
            }
          }
        }
      }
    })

    if (!customer || customer.programs.length === 0) {
      throw new Error('Customer not found in this business')
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(data.phone && { phone: data.phone }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.country && { country: data.country }),
        ...(data.state && { state: data.state }),
        ...(data.city && { city: data.city }),
        ...(data.zipCode && { zipCode: data.zipCode }),
        ...(data.language && { language: data.language }),
        ...(data.timeZone && { timeZone: data.timeZone }),
        ...(data.notificationsOptIn !== undefined && { notificationsOptIn: data.notificationsOptIn })
      }
    })

    return this.formatCustomerResponse(updated)
  }

  /**
   * Enroll customer in a loyalty program
   */
  async enrollInProgram(businessId: string, customerId: string, programId: string) {
    // Verify program exists and belongs to business
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Check if already enrolled
    const existing = await prisma.customerProgram.findUnique({
      where: {
        customerId_programId: {
          customerId,
          programId
        }
      }
    })

    if (existing) {
      throw new Error('Customer already enrolled in this program')
    }

    // Create enrollment
    const enrollment = await prisma.customerProgram.create({
      data: {
        customerId,
        programId
      }
    })

    return { success: true, enrollmentId: enrollment.id }
  }

  /**
   * Bulk import customers
   */
  async bulkImportCustomers(businessId: string, customers: CreateCustomerRequest[]) {
    const results = []
    const errors = []

    for (let i = 0; i < customers.length; i++) {
      try {
        const customer = await this.createCustomer(businessId, customers[i])
        results.push({ index: i, customer, success: true })
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return {
      imported: results.length,
      failed: errors.length,
      results,
      errors
    }
  }

  /**
   * Get customer cards for program
   */
  async getCustomerProgramCards(businessId: string, customerId: string, programId: string) {
    // Verify program belongs to business
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    const cards = await prisma.loyaltyCard.findMany({
      where: {
        customerId,
        programId
      },
      orderBy: { createdAt: 'desc' }
    })

    return cards
  }

  /**
   * Unenroll customer from program
   */
  async unenrollFromProgram(businessId: string, customerId: string, programId: string) {
    // Verify program belongs to business
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId }
    })

    if (!program || program.businessId !== businessId) {
      throw new Error('Program not found')
    }

    await prisma.customerProgram.delete({
      where: {
        customerId_programId: {
          customerId,
          programId
        }
      }
    })

    return { success: true }
  }

  /**
   * Update push notification preferences
   */
  async updateNotificationPreferences(
    businessId: string,
    customerId: string,
    preferences: {
      optIn: boolean
      platform?: 'ios' | 'android' | 'web'
      token?: string
    }
  ) {
    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Update opt-in status
    await prisma.customer.update({
      where: { id: customerId },
      data: { notificationsOptIn: preferences.optIn }
    })

    // If token provided, update push tokens
    if (preferences.token && preferences.platform) {
      await prisma.pushToken.upsert({
        where: {
          token_customerId: {
            token: preferences.token,
            customerId
          }
        },
        create: {
          customerId,
          token: preferences.token,
          platform: preferences.platform
        },
        update: {
          platform: preferences.platform
        }
      })
    }

    return { success: true }
  }

  /**
   * Helper: Format customer response
   */
  private formatCustomerResponse(customer: any) {
    return {
      id: customer.id,
      email: customer.email,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      country: customer.country,
      state: customer.state,
      city: customer.city,
      zipCode: customer.zipCode,
      language: customer.language,
      timeZone: customer.timeZone,
      notificationsOptIn: customer.notificationsOptIn,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }
  }
}

export default new CustomerService()
