import { Router } from 'express'
import { TradesController } from '../controllers/trades.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', TradesController.list)
router.get('/:id', TradesController.getById)
router.post('/', TradesController.create)
router.put('/:id', TradesController.update)
router.delete('/:id', TradesController.delete)

export default router
