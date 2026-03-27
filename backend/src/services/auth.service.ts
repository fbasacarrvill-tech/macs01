import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { RegisterBody, LoginBody } from '../types'

export const AuthService = {
  async register(body: RegisterBody) {
    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) throw new Error('Email already in use')

    const passwordHash = await bcrypt.hash(body.password, 12)
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        portfolio: {
          create: {
            initialCapital: 10000,
            currentCapital: 10000,
            availableCapital: 10000,
          },
        },
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    })

    const tokens = generateTokens(user.id, user.email)
    return { user, tokens }
  },

  async login(body: LoginBody) {
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user || !user.isActive) throw new Error('Invalid credentials')

    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) throw new Error('Invalid credentials')

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    const tokens = generateTokens(user.id, user.email)
    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      tokens,
    }
  },

  async refreshToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || !user.isActive) throw new Error('User not found')

    const accessToken = signAccessToken({ userId: user.id, email: user.email })
    return { accessToken }
  },
}

function generateTokens(userId: string, email: string) {
  return {
    accessToken: signAccessToken({ userId, email }),
    refreshToken: signRefreshToken({ userId, email }),
  }
}
