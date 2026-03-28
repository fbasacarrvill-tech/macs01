import { Router } from 'express'
import { ReportService } from '../services/report.service'
import { authMiddleware } from '../middleware/auth.middleware'
import { AuthRequest } from '../types'

const router = Router()
router.use(authMiddleware)

router.get('/summary', async (req: AuthRequest, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()

    const data = await ReportService.generateReport(req.user!.id, startDate, endDate)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

router.get('/export/csv', async (req: AuthRequest, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()

    const csv = await ReportService.exportTradesCSV(req.user!.id, startDate, endDate)

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="trades-export.csv"')
    res.send(csv)
  } catch (err) { next(err) }
})

router.get('/export/pdf', async (req: AuthRequest, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()

    const data = await ReportService.getReportJSON(req.user!.id, startDate, endDate)

    // En producción, usar una librería como pdfkit o html-pdf
    // Por ahora, devolvemos JSON que el frontend puede usar para generar PDF con jsPDF
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

export default router
