import { Request, Response } from 'express'
import Joi from 'joi'
import CardService from '../services/card.service'
import { CreateCardRequest } from '../types'

// Validation schemas
const createCardSchema = Joi.object({
  programId: Joi.string().required(),
  customerId: Joi.string().required(),
  cardNumber: Joi.string().optional(),
  expiresAt: Joi.date().optional()
})

const addPointsSchema = Joi.object({
  points: Joi.number().required().positive(),
  description: Joi.string().optional()
})

const redeemRewardSchema = Joi.object({
  points: Joi.number().required().positive(),
  description: Joi.string().optional()
})

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('ACTIVE', 'PAUSED', 'EXPIRED', 'REDEEMED')
    .required()
})

const addToWalletSchema = Joi.object({
  walletType: Joi.string().valid('APPLE', 'GOOGLE').required()
})

export class CardController {
  /**
   * Create a new loyalty card
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = createCardSchema.validate(req.body)

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

      const result = await CardService.createCard(req.business.id, value as CreateCardRequest)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create card'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get card details
   */
  static async get(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { cardId } = req.params

      const card = await CardService.getCard(req.business.id, cardId)

      res.status(200).json(card)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch card'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Get card by code (for scanning)
   */
  static async getByCode(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { code } = req.params

      const card = await CardService.getCardByCode(req.business.id, code)

      res.status(200).json(card)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Card not found'
      res.status(404).json({ error: message })
    }
  }

  /**
   * List cards for a program
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

      const result = await CardService.listCardsByProgram(req.business.id, programId, { page, limit })

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list cards'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Add stamp to card
   */
  static async addStamp(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { cardId } = req.params

      const result = await CardService.addStamp(req.business.id, cardId)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add stamp'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Add points to card
   */
  static async addPoints(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { cardId } = req.params
      const { error, value } = addPointsSchema.validate(req.body)

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

      const result = await CardService.addPoints(req.business.id, cardId, value.points, value.description)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add points'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Redeem reward
   */
  static async redeemReward(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { cardId } = req.params
      const { error, value } = redeemRewardSchema.validate(req.body)

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

      const result = await CardService.redeemReward(req.business.id, cardId, value.points, value.description)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to redeem reward'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Update card status
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { cardId } = req.params
      const { error, value } = updateStatusSchema.validate(req.body)

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

      const result = await CardService.updateCardStatus(req.business.id, cardId, value.status)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update card status'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Add card to wallet
   */
  static async addToWallet(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { cardId } = req.params
      const { error, value } = addToWalletSchema.validate(req.body)

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

      const result = await CardService.addToWallet(req.business.id, cardId, value.walletType)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add card to wallet'
      res.status(400).json({ error: message })
    }
  }
}

export default CardController
