import { Response, NextFunction } from 'express'
import { AnalyticsService } from '../services/analytics.service'
import { AuthRequest } from '../types'

type Period = 'day' | 'week' | 'month' | 'year' | 'all'

function getPeriod(query: unknown): Period {
  const p = (query as Record<string, string>)?.period
  if (['day', 'week', 'month', 'year', 'all'].includes(p)) return p as Period
  return 'month'
}

export const AnalyticsController = {
  async summary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getSummary(req.user!.id, getPeriod(req.query))
      res.json({ success: true, data })
    } catch (err) { next(err) }
  },

  async byAsset(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getByAsset(req.user!.id, getPeriod(req.query))
      res.json({ success: true, data })
    } catch (err) { next(err) }
  },

  async byStrategy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getByStrategy(req.user!.id, getPeriod(req.query))
      res.json({ success: true, data })
    } catch (err) { next(err) }
  },

  async equityCurve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getEquityCurve(req.user!.id)
      res.json({ success: true, data })
    } catch (err) { next(err) }
  },

  async drawdown(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getDrawdownAnalysis(req.user!.id)
      res.json({ success: true, data })
    } catch (err) { next(err) }
  },
}
