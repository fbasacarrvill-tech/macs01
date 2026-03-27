import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'

export const AuthController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body)
      res.status(201).json({ success: true, data: result })
    } catch (err) {
      if (err instanceof Error && err.message === 'Email already in use') {
        res.status(409).json({ success: false, error: { code: 'CONFLICT', message: err.message } })
        return
      }
      next(err)
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body)
      res.json({ success: true, data: result })
    } catch (err) {
      if (err instanceof Error && err.message === 'Invalid credentials') {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: err.message } })
        return
      }
      next(err)
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'refreshToken required' } })
        return
      }
      const result = await AuthService.refreshToken(refreshToken)
      res.json({ success: true, data: result })
    } catch {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } })
    }
  },

  async me(req: Request & { user?: { id: string; email: string } }, res: Response, next: NextFunction) {
    try {
      const { prisma } = await import('../lib/prisma')
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, email: true, firstName: true, lastName: true, preferredCurrency: true, timezone: true, theme: true, createdAt: true },
      })
      if (!user) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }); return }
      res.json({ success: true, data: user })
    } catch (err) { next(err) }
  },
}
