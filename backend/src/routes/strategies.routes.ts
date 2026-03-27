import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../types'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const strategies = await prisma.strategy.findMany({
      where: { userId: req.user!.id, isActive: true },
      orderBy: { name: 'asc' },
    })
    res.json({ success: true, data: strategies })
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const strategy = await prisma.strategy.create({
      data: { ...req.body, userId: req.user!.id },
    })
    res.status(201).json({ success: true, data: strategy })
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const strategy = await prisma.strategy.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: req.body,
    })
    res.json({ success: true, data: strategy })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.strategy.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isActive: false },
    })
    res.json({ success: true, message: 'Strategy deleted' })
  } catch (err) { next(err) }
})

export default router
