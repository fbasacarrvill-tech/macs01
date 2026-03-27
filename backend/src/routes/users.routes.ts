import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../types'

const router = Router()
router.use(authMiddleware)

router.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, firstName: true, lastName: true, preferredCurrency: true, timezone: true, theme: true },
    })
    if (!user) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }); return }
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
})

router.put('/me', async (req: AuthRequest, res, next) => {
  try {
    const allowed = ['firstName', 'lastName', 'preferredCurrency', 'timezone', 'theme']
    const data = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    )
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, preferredCurrency: true, timezone: true, theme: true },
    })
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
})

export default router
