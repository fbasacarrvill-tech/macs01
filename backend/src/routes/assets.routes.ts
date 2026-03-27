import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../types'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const search = req.query.search as string | undefined
    const type = req.query.type as string | undefined

    const assets = await prisma.asset.findMany({
      where: {
        isActive: true,
        ...(type ? { assetType: { in: type.split(',') } } : {}),
        ...(search
          ? { OR: [{ symbol: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }] }
          : {}),
      },
      orderBy: { symbol: 'asc' },
    })

    res.json({ success: true, data: assets })
  } catch (err) { next(err) }
})

export default router
