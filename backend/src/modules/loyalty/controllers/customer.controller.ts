import { Request, Response } from 'express'
import Joi from 'joi'
import CustomerService from '../services/customer.service'
import { CreateCustomerRequest, UpdateCustomerRequest } from '../types'

// Validation schemas
const createCustomerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().optional().max(20),
  firstName: Joi.string().optional().max(100),
  lastName: Joi.string().optional().max(100),
  country: Joi.string().optional().max(2),
  state: Joi.string().optional().max(100),
  city: Joi.string().optional().max(100),
  zipCode: Joi.string().optional().max(20),
  language: Joi.string().optional().length(2),
  timeZone: Joi.string().optional()
})

const updateCustomerSchema = Joi.object({
  phone: Joi.string().optional().max(20),
  firstName: Joi.string().optional().max(100),
  lastName: Joi.string().optional().max(100),
  country: Joi.string().optional().max(2),
  state: Joi.string().optional().max(100),
  city: Joi.string().optional().max(100),
  zipCode: Joi.string().optional().max(20),
  language: Joi.string().optional().length(2),
  timeZone: Joi.string().optional(),
  notificationsOptIn: Joi.boolean().optional()
})

const bulkImportSchema = Joi.object({
  customers: Joi.array()
    .items(createCustomerSchema)
    .required()
    .min(1)
    .max(1000)
})

const notificationPreferencesSchema = Joi.object({
  optIn: Joi.boolean().required(),
  platform: Joi.string().valid('ios', 'android', 'web').optional(),
  token: Joi.string().optional()
})

export class CustomerController {
  /**
   * Create a new customer
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = createCustomerSchema.validate(req.body)

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

      const result = await CustomerService.createCustomer(req.business.id, value as CreateCustomerRequest)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create customer'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get customer details
   */
  static async get(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId } = req.params

      const customer = await CustomerService.getCustomer(req.business.id, customerId)

      res.status(200).json(customer)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch customer'
      res.status(404).json({ error: message })
    }
  }

  /**
   * List customers
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
      const programId = req.query.programId as string
      const search = req.query.search as string

      const result = await CustomerService.listCustomers(req.business.id, {
        programId,
        search,
        page,
        limit
      })

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list customers'
      res.status(500).json({ error: message })
    }
  }

  /**
   * Update customer
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId } = req.params
      const { error, value } = updateCustomerSchema.validate(req.body)

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

      const result = await CustomerService.updateCustomer(
        req.business.id,
        customerId,
        value as UpdateCustomerRequest
      )

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update customer'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Enroll customer in program
   */
  static async enrollInProgram(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId, programId } = req.params

      const result = await CustomerService.enrollInProgram(req.business.id, customerId, programId)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enroll customer'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Unenroll customer from program
   */
  static async unenrollFromProgram(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId, programId } = req.params

      const result = await CustomerService.unenrollFromProgram(req.business.id, customerId, programId)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unenroll customer'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Bulk import customers
   */
  static async bulkImport(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { error, value } = bulkImportSchema.validate(req.body)

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

      const result = await CustomerService.bulkImportCustomers(req.business.id, value.customers)

      res.status(201).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bulk import failed'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get customer's cards for a program
   */
  static async getCustomerCards(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId, programId } = req.params

      const cards = await CustomerService.getCustomerProgramCards(req.business.id, customerId, programId)

      res.status(200).json({ cards })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch customer cards'
      res.status(404).json({ error: message })
    }
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { customerId } = req.params
      const { error, value } = notificationPreferencesSchema.validate(req.body)

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

      const result = await CustomerService.updateNotificationPreferences(req.business.id, customerId, value)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update preferences'
      res.status(400).json({ error: message })
    }
  }
}

export default CustomerController
