import { Request, Response } from 'express'
import Joi from 'joi'
import AuthService from '../services/auth.service'
import { CreateBusinessRequest } from '../types'

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8).max(100),
  phone: Joi.string().optional().max(20),
  website: Joi.string().optional().uri()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
})

const updateProfileSchema = Joi.object({
  name: Joi.string().optional().min(3).max(100),
  phone: Joi.string().optional().max(20),
  website: Joi.string().optional().uri(),
  logoUrl: Joi.string().optional().uri(),
  primaryColor: Joi.string().optional().hex(),
  secondaryColor: Joi.string().optional().hex()
})

const createApiKeySchema = Joi.object({
  name: Joi.string().required().min(3).max(100)
})

export class AuthController {
  /**
   * Register a new business
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = registerSchema.validate(req.body)

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

      const result = await AuthService.registerBusiness(value as CreateBusinessRequest)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Login business
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body)

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

      const result = await AuthService.loginBusiness(value.email, value.password)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      res.status(401).json({ error: message })
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = refreshTokenSchema.validate(req.body)

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

      const result = await AuthService.refreshToken(value.refreshToken)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed'
      res.status(401).json({ error: message })
    }
  }

  /**
   * Get current business profile
   */
  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const profile = await AuthService.getBusinessProfile(req.business.id)

      res.status(200).json(profile)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile'
      res.status(500).json({ error: message })
    }
  }

  /**
   * Update business profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = updateProfileSchema.validate(req.body)

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

      const result = await AuthService.updateBusinessProfile(req.business.id, value)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile'
      res.status(500).json({ error: message })
    }
  }

  /**
   * Create API key
   */
  static async createApiKey(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = createApiKeySchema.validate(req.body)

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

      const result = await AuthService.createApiKey(req.business.id, value.name)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create API key'
      res.status(500).json({ error: message })
    }
  }

  /**
   * List API keys
   */
  static async listApiKeys(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const keys = await AuthService.listApiKeys(req.business.id)

      res.status(200).json({ keys })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list API keys'
      res.status(500).json({ error: message })
    }
  }

  /**
   * Delete API key
   */
  static async deleteApiKey(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { keyId } = req.params

      const result = await AuthService.deleteApiKey(req.business.id, keyId)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete API key'
      res.status(500).json({ error: message })
    }
  }
}

export default AuthController
