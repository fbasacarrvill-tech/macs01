import { Request, Response } from 'express'
import Joi from 'joi'
import TransactionService from '../services/transaction.service'
import CardService from '../services/card.service'
import { CreateTransactionRequest } from '../types'

// Validation schemas
const createTransactionSchema = Joi.object({
  cardId: Joi.string().required(),
  customerId: Joi.string().required(),
  programId: Joi.string().required(),
  type: Joi.string().valid('PURCHASE', 'BONUS', 'REDEMPTION', 'ADJUSTMENT', 'EXPIRATION').required(),
  points: Joi.number().required(),
  amount: Joi.number().optional(),
  description: Joi.string().optional(),
  referenceId: Joi.string().optional(),
  metadata: Joi.object().optional()
})

const scanCardSchema = Joi.object({
  code: Joi.string().required(),
  location: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional()
})

const processPurchaseSchema = Joi.object({
  code: Joi.string().required(),
  amount: Joi.number().required().positive(),
  description: Joi.string().optional()
})

export class TransactionController {
  /**
   * Create a transaction
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = createTransactionSchema.validate(req.body)

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

      const result = await TransactionService.createTransaction(req.business.id, value as CreateTransactionRequest)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create transaction'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get transaction details
   */
  static async get(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { transactionId } = req.params

      const transaction = await TransactionService.getTransaction(req.business.id, transactionId)

      res.status(200).json(transaction)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch transaction'
      res.status(404).json({ error: message })
    }
  }

  /**
   * List transactions for a card
   */
  static async listByCard(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { cardId } = req.params
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10

      const result = await TransactionService.listTransactionsByCard(req.business.id, cardId, { page, limit })

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list transactions'
      res.status(404).json({ error: message })
    }
  }

  /**
   * List transactions for a customer
   */
  static async listByCustomer(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId } = req.params
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
      const programId = req.query.programId as string | undefined

      const result = await TransactionService.listTransactionsByCustomer(req.business.id, customerId, {
        programId,
        page,
        limit
      })

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list transactions'
      res.status(404).json({ error: message })
    }
  }

  /**
   * List transactions for a program
   */
  static async listByProgram(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
      const type = req.query.type as string | undefined

      const result = await TransactionService.listTransactionsByProgram(req.business.id, programId, {
        type: type as any,
        page,
        limit
      })

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list transactions'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Get transaction analytics for program
   */
  static async getProgramAnalytics(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params

      const analytics = await TransactionService.getProgramTransactionAnalytics(req.business.id, programId)

      res.status(200).json(analytics)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch analytics'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Scan card (get card by code)
   */
  static async scanCard(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = scanCardSchema.validate(req.body)

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

      const card = await CardService.getCardByCode(req.business.id, value.code)

      // Log scan
      if (value.latitude && value.longitude) {
        await this.logCardScan({
          cardId: card.id,
          location: value.location,
          latitude: value.latitude,
          longitude: value.longitude
        })
      }

      res.status(200).json({
        success: true,
        card,
        scannedAt: new Date()
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Scan failed'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Process purchase and add points
   */
  static async processPurchase(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = processPurchaseSchema.validate(req.body)

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

      // Get card by code
      const card = await CardService.getCardByCode(req.business.id, value.code)

      // Calculate points based on amount (1 point per dollar by default)
      const pointsToAdd = Math.floor(value.amount)

      // Update card with points
      const updatedCard = await CardService.addPoints(req.business.id, card.id, pointsToAdd, value.description)

      // Create transaction
      const transaction = await TransactionService.createTransaction(req.business.id, {
        cardId: card.id,
        customerId: card.customerId,
        programId: card.programId,
        type: 'PURCHASE',
        points: pointsToAdd,
        amount: value.amount,
        description: value.description || 'Purchase transaction'
      })

      res.status(200).json({
        success: true,
        card: updatedCard,
        transaction,
        pointsAdded: pointsToAdd
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase processing failed'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Helper: Log card scan
   */
  private static async logCardScan(data: {
    cardId: string
    location?: string
    latitude: number
    longitude: number
  }) {
    // In production, save to CardScan model
    console.log('Card scan logged:', data)
  }
}

export default TransactionController
