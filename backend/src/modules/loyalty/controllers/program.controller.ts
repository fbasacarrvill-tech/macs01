import { Request, Response } from 'express'
import Joi from 'joi'
import ProgramService from '../services/program.service'
import { CreateProgramRequest, UpdateProgramRequest, CreateTierRequest, CreateRuleRequest } from '../types'

// Validation schemas
const createProgramSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().optional().max(500),
  type: Joi.string()
    .valid('STAMPS', 'CASHBACK', 'AFFINITY', 'DISCOUNT', 'COUPON', 'GIFT', 'MEMBERSHIP', 'MULTIPASS')
    .required(),
  currencyCode: Joi.string().optional().length(3),
  pointsName: Joi.string().optional().max(50),
  pointsPerDollar: Joi.number().optional().positive(),
  minPointsRedeemable: Joi.number().optional().positive(),
  expirationDays: Joi.number().optional().positive(),
  logoUrl: Joi.string().optional().uri(),
  backgroundColor: Joi.string().optional().hex(),
  foregroundColor: Joi.string().optional().hex(),
  accentColor: Joi.string().optional().hex()
})

const updateProgramSchema = Joi.object({
  name: Joi.string().optional().min(3).max(100),
  description: Joi.string().optional().max(500),
  currencyCode: Joi.string().optional().length(3),
  pointsName: Joi.string().optional().max(50),
  pointsPerDollar: Joi.number().optional().positive(),
  minPointsRedeemable: Joi.number().optional().positive(),
  expirationDays: Joi.number().optional().positive(),
  logoUrl: Joi.string().optional().uri(),
  backgroundColor: Joi.string().optional().hex(),
  foregroundColor: Joi.string().optional().hex(),
  accentColor: Joi.string().optional().hex()
})

const createTierSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  requiredPoints: Joi.number().required().positive(),
  discount: Joi.number().optional().min(0).max(100),
  color: Joi.string().optional().hex()
})

const createRuleSchema = Joi.object({
  type: Joi.string().valid('POINTS_RULE', 'BONUS_RULE', 'PENALTY_RULE').required(),
  condition: Joi.object().required(),
  reward: Joi.object().required()
})

export class ProgramController {
  /**
   * Create a new loyalty program
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = createProgramSchema.validate(req.body)

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

      const result = await ProgramService.createProgram(req.business.id, value as CreateProgramRequest)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create program'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get program details
   */
  static async get(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params

      const program = await ProgramService.getProgram(req.business.id, programId)

      res.status(200).json(program)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch program'
      res.status(404).json({ error: message })
    }
  }

  /**
   * List programs for business
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
      const type = req.query.type as string
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined

      const result = await ProgramService.listPrograms(req.business.id, {
        type: type as any,
        isActive,
        page,
        limit
      })

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list programs'
      res.status(500).json({ error: message })
    }
  }

  /**
   * Update program
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params
      const { error, value } = updateProgramSchema.validate(req.body)

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

      const result = await ProgramService.updateProgram(req.business.id, programId, value as UpdateProgramRequest)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update program'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Delete/archive program
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params

      const result = await ProgramService.deleteProgram(req.business.id, programId)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete program'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Publish program
   */
  static async publish(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params

      const result = await ProgramService.publishProgram(req.business.id, programId)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish program'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Create tier for program
   */
  static async createTier(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params
      const { error, value } = createTierSchema.validate(req.body)

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

      const result = await ProgramService.createTier(req.business.id, programId, value as CreateTierRequest)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create tier'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get tiers for program
   */
  static async getTiers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params

      const tiers = await ProgramService.getTiers(req.business.id, programId)

      res.status(200).json({ tiers })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tiers'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Create rule for program
   */
  static async createRule(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params
      const { error, value } = createRuleSchema.validate(req.body)

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

      const result = await ProgramService.createRule(req.business.id, programId, value as CreateRuleRequest)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create rule'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get rules for program
   */
  static async getRules(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params

      const rules = await ProgramService.getRules(req.business.id, programId)

      res.status(200).json({ rules })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch rules'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Get program analytics
   */
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { programId } = req.params

      const analytics = await ProgramService.getProgramAnalytics(req.business.id, programId)

      res.status(200).json(analytics)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch analytics'
      res.status(404).json({ error: message })
    }
  }
}

export default ProgramController
