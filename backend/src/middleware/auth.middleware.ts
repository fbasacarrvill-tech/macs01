import { Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AuthRequest } from '../types'

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' },
    })
    return
  }

  const token = header.slice(7)
  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.userId, email: payload.email }
    next()
  } catch {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token expired or invalid' },
    })
  }
}
