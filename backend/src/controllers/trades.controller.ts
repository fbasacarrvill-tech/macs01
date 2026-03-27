import { Response, NextFunction } from 'express'
import { TradeService } from '../services/trade.service'
import { AuthRequest, TradeFilters } from '../types'

export const TradesController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters: TradeFilters = {
        status: req.query.status as string,
        assetId: req.query.assetId as string,
        strategyId: req.query.strategyId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        direction: req.query.direction as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      }
      const result = await TradeService.list(req.user!.id, filters)
      res.json({ success: true, data: result })
    } catch (err) { next(err) }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trade = await TradeService.getById(req.params.id, req.user!.id)
      res.json({ success: true, data: trade })
    } catch (err) {
      if (err instanceof Error && err.message === 'Trade not found') {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } })
        return
      }
      next(err)
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trade = await TradeService.create(req.user!.id, req.body)
      res.status(201).json({ success: true, data: trade })
    } catch (err) { next(err) }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trade = await TradeService.update(req.params.id, req.user!.id, req.body)
      res.json({ success: true, data: trade })
    } catch (err) {
      if (err instanceof Error && err.message === 'Trade not found') {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } })
        return
      }
      next(err)
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await TradeService.delete(req.params.id, req.user!.id)
      res.json({ success: true, message: 'Trade deleted' })
    } catch (err) {
      if (err instanceof Error && err.message === 'Trade not found') {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } })
        return
      }
      next(err)
    }
  },
}
