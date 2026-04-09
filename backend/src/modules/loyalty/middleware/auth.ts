import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { BusinessAuthPayload } from '../types'

declare global {
  namespace Express {
    interface Request {
      business?: BusinessAuthPayload
      token?: string
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const loyaltyAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' })
      return
    }

    const token = authHeader.substring(7)

    const decoded = jwt.verify(token, JWT_SECRET) as BusinessAuthPayload

    req.business = decoded
    req.token = token

    next()
  } catch (error) {
    res.status(401).json({
      error: 'Invalid or expired token',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const optionalLoyaltyAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, JWT_SECRET) as BusinessAuthPayload
      req.business = decoded
      req.token = token
    }

    next()
  } catch (error) {
    // If token is invalid, just continue without authentication
    next()
  }
}

export const generateTokens = (business: BusinessAuthPayload) => {
  const payload: BusinessAuthPayload = {
    id: business.id,
    email: business.email,
    name: business.name
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '15m'
  })

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d'
  })

  return { accessToken, refreshToken }
}

export const verifyToken = (token: string): BusinessAuthPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as BusinessAuthPayload
  } catch (error) {
    return null
  }
}
