import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class NotificationService {
  /**
   * Create a push notification campaign
   */
  async createCampaign(businessId: string, data: {
    title: string
    message: string
    imageUrl?: string
    targetSegments?: string[]
    targetGeolocation?: {
      latitude: number
      longitude: number
      radius: number // in meters
    }
    scheduledFor?: Date
    deepLink?: string
  }) {
    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      throw new Error('Business not found')
    }

    // For now, just create a Campaign record without sending
    // In production, this would integrate with Firebase Cloud Messaging
    const campaign = await prisma.campaign.create({
      data: {
        businessId,
        title: data.title,
        message: data.message,
        imageUrl: data.imageUrl,
        status: 'DRAFT',
        scheduledFor: data.scheduledFor,
        deepLink: data.deepLink
      }
    })

    return {
      id: campaign.id,
      status: 'DRAFT',
      message: `Campaign "${campaign.title}" created. Ready to be scheduled.`,
      createdAt: campaign.createdAt
    }
  }

  /**
   * Send campaign to all customers
   */
  async sendCampaign(businessId: string, campaignId: string) {
    // Verify campaign belongs to business
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign || campaign.businessId !== businessId) {
      throw new Error('Campaign not found')
    }

    // Get all customers of business (through programs)
    const customers = await prisma.customer.findMany({
      where: {
        programs: {
          some: {
            program: {
              businessId
            }
          }
        }
      },
      include: {
        pushTokens: true
      }
    })

    // In production, would send via Firebase Cloud Messaging
    // For now, just log and update status
    let sentCount = 0
    for (const customer of customers) {
      if (customer.notificationsOptIn && customer.pushTokens.length > 0) {
        sentCount++
        // In production:
        // await this.sendToFCM(customer.pushTokens, campaign)
      }
    }

    // Update campaign status
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'ACTIVE',
        sentCount,
        startedAt: new Date()
      }
    })

    return {
      success: true,
      campaignId: updated.id,
      sentCount,
      totalCustomers: customers.length,
      message: `Campaign sent to ${sentCount}/${customers.length} customers`
    }
  }

  /**
   * Send location-based notification
   */
  async sendLocationBasedNotification(businessId: string, data: {
    title: string
    message: string
    latitude: number
    longitude: number
    radius: number // in meters
    deepLink?: string
  }) {
    // Get customers near location
    const customers = await prisma.customer.findMany({
      where: {
        programs: {
          some: {
            program: {
              businessId
            }
          }
        }
      },
      include: {
        pushTokens: true,
        programs: true
      }
    })

    // In production, would calculate distance and filter
    // For now, just mock the response
    const customersInRadius = customers.filter(c => c.notificationsOptIn && c.pushTokens.length > 0)

    return {
      success: true,
      message: 'Location-based notification sent',
      customersNotified: customersInRadius.length,
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius
      }
    }
  }

  /**
   * Send notification to specific customer
   */
  async sendToCustomer(businessId: string, customerId: string, notification: {
    title: string
    message: string
    imageUrl?: string
    deepLink?: string
  }) {
    // Verify customer is enrolled in business programs
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        pushTokens: true,
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
      throw new Error('Customer not found or not enrolled in any programs')
    }

    if (!customer.notificationsOptIn) {
      return {
        success: false,
        message: 'Customer has notifications disabled'
      }
    }

    if (customer.pushTokens.length === 0) {
      return {
        success: false,
        message: 'Customer has no registered push tokens'
      }
    }

    // In production, would send via Firebase Cloud Messaging
    // For now, just log
    console.log(`Would send notification to ${customer.email}: ${notification.title}`)

    return {
      success: true,
      customerId: customer.id,
      message: 'Notification sent',
      tokensUsed: customer.pushTokens.length
    }
  }

  /**
   * Register push token for customer
   */
  async registerPushToken(customerId: string, token: string, platform: 'ios' | 'android' | 'web') {
    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Create or update push token
    const pushToken = await prisma.pushToken.upsert({
      where: {
        token_customerId: {
          token,
          customerId
        }
      },
      create: {
        customerId,
        token,
        platform
      },
      update: {
        platform
      }
    })

    return {
      success: true,
      platform: pushToken.platform,
      message: 'Push token registered successfully'
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(businessId: string, campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign || campaign.businessId !== businessId) {
      throw new Error('Campaign not found')
    }

    return {
      campaignId: campaign.id,
      title: campaign.title,
      status: campaign.status,
      sentCount: campaign.sentCount,
      openCount: campaign.openCount || 0,
      clickCount: campaign.clickCount || 0,
      conversionCount: campaign.conversionCount || 0,
      openRate: campaign.sentCount ? ((campaign.openCount || 0) / campaign.sentCount * 100).toFixed(2) + '%' : '0%',
      clickRate: campaign.sentCount ? ((campaign.clickCount || 0) / campaign.sentCount * 100).toFixed(2) + '%' : '0%',
      createdAt: campaign.createdAt,
      sentAt: campaign.startedAt,
      completedAt: campaign.endedAt
    }
  }

  /**
   * Get customer notification preferences
   */
  async getNotificationPreferences(businessId: string, customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        pushTokens: true,
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
      throw new Error('Customer not found')
    }

    return {
      customerId: customer.id,
      email: customer.email,
      notificationsOptIn: customer.notificationsOptIn,
      pushTokens: customer.pushTokens.map(t => ({
        platform: t.platform,
        registeredAt: t.createdAt
      })),
      registeredDevices: customer.pushTokens.length
    }
  }

  /**
   * Test send notification (for development)
   */
  async testSendNotification(businessId: string, customerId: string) {
    return this.sendToCustomer(businessId, customerId, {
      title: '🧪 Test Notification',
      message: 'This is a test notification from your loyalty program.',
      deepLink: 'app://loyalty/programs'
    })
  }
}

export default new NotificationService()
