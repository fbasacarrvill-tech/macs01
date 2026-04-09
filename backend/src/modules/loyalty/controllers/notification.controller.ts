import { Request, Response } from 'express'
import Joi from 'joi'
import NotificationService from '../services/notification.service'

// Validation schemas
const createCampaignSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  message: Joi.string().required().min(3).max(1000),
  imageUrl: Joi.string().optional().uri(),
  targetSegments: Joi.array().items(Joi.string()).optional(),
  targetGeolocation: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    radius: Joi.number().required().positive()
  }).optional(),
  scheduledFor: Joi.date().optional(),
  deepLink: Joi.string().optional().uri()
})

const sendLocationNotificationSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  message: Joi.string().required().min(3).max(1000),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  radius: Joi.number().required().positive(),
  deepLink: Joi.string().optional().uri()
})

const registerPushTokenSchema = Joi.object({
  token: Joi.string().required(),
  platform: Joi.string().valid('ios', 'android', 'web').required()
})

export class NotificationController {
  /**
   * Create a notification campaign
   */
  static async createCampaign(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = createCampaignSchema.validate(req.body)

      if (error) {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        })
        return
      }

      const result = await NotificationService.createCampaign(req.business.id, value)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create campaign'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Send campaign
   */
  static async sendCampaign(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { campaignId } = req.params

      const result = await NotificationService.sendCampaign(req.business.id, campaignId)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send campaign'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Send location-based notification
   */
  static async sendLocationNotification(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = sendLocationNotificationSchema.validate(req.body)

      if (error) {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        })
        return
      }

      const result = await NotificationService.sendLocationBasedNotification(req.business.id, value)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send location notification'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Send notification to customer
   */
  static async sendToCustomer(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId } = req.params
      const { title, message, imageUrl, deepLink } = req.body

      if (!title || !message) {
        res.status(400).json({
          error: 'Validation error',
          details: [
            { field: 'title', message: 'title is required' },
            { field: 'message', message: 'message is required' }
          ]
        })
        return
      }

      const result = await NotificationService.sendToCustomer(req.business.id, customerId, {
        title,
        message,
        imageUrl,
        deepLink
      })

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send notification'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Register push token
   */
  static async registerPushToken(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params
      const { error, value } = registerPushTokenSchema.validate(req.body)

      if (error) {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        })
        return
      }

      const result = await NotificationService.registerPushToken(customerId, value.token, value.platform)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to register push token'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { campaignId } = req.params

      const stats = await NotificationService.getCampaignStats(req.business.id, campaignId)

      res.status(200).json(stats)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch campaign stats'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Get notification preferences
   */
  static async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId } = req.params

      const preferences = await NotificationService.getNotificationPreferences(req.business.id, customerId)

      res.status(200).json(preferences)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch preferences'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Test send notification (development only)
   */
  static async testSend(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId } = req.params

      const result = await NotificationService.testSendNotification(req.business.id, customerId)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send test notification'
      res.status(400).json({ error: message })
    }
  }
}

export default NotificationController
