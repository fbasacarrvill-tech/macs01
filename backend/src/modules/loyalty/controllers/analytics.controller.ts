import { Request, Response } from 'express'
import AnalyticsService from '../services/analytics.service'

export class AnalyticsController {
  /**
   * Get program overview analytics
   */
  static async getProgramOverview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params

      const overview = await AnalyticsService.getProgramOverview(req.business.id, programId)

      res.status(200).json(overview)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch program overview'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Get customer analytics
   */
  static async getCustomerAnalytics(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId } = req.params
      const programId = req.query.programId as string | undefined

      const analytics = await AnalyticsService.getCustomerAnalytics(req.business.id, customerId, programId)

      res.status(200).json(analytics)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch customer analytics'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Get time-based analytics
   */
  static async getTimeBasedAnalytics(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params
      const days = req.query.days ? parseInt(req.query.days as string) : 30

      const analytics = await AnalyticsService.getTimeBasedAnalytics(req.business.id, programId, days)

      res.status(200).json(analytics)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch time-based analytics'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Get customer segmentation
   */
  static async getCustomerSegmentation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params

      const segmentation = await AnalyticsService.getCustomerSegmentation(req.business.id, programId)

      res.status(200).json(segmentation)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch customer segmentation'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Get ROI metrics
   */
  static async getROI(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params

      const roi = await AnalyticsService.getROI(req.business.id, programId)

      res.status(200).json(roi)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch ROI metrics'
      res.status(404).json({ error: message })
    }
  }
}

export default AnalyticsController
