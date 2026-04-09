import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import CardService from '../services/card.service'
import WalletService from '../services/wallet.service'

const prisma = new PrismaClient()

export class WalletController {
  /**
   * Get Apple Wallet pass for a card
   * Generates .pkpass file data
   */
  static async getAppleWalletPass(req: Request, res: Response): Promise<void> {
    try {
      const { cardId } = req.params
      const { token } = req.query

      // Get card with relationships
      const card = await prisma.loyaltyCard.findUnique({
        where: { id: cardId },
        include: {
          program: true,
          customer: true
        }
      })

      if (!card) {
        res.status(404).json({ error: 'Card not found' })
        return
      }

      // Generate pass data
      const passData = WalletService.generateAppleWalletPass(card, card.program, card.customer)

      // In production, would generate actual .pkpass file
      // For now, return the data structure
      res.status(200).json({
        success: true,
        passType: 'Apple Wallet',
        passData,
        instructions:
          'In production, this would return a .pkpass file to add to Apple Wallet'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate Apple Wallet pass'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get Google Wallet JWT for a card
   */
  static async getGoogleWalletJWT(req: Request, res: Response): Promise<void> {
    try {
      const { cardId } = req.params
      const { token } = req.query

      // Get card with relationships
      const card = await prisma.loyaltyCard.findUnique({
        where: { id: cardId },
        include: {
          program: true,
          customer: true
        }
      })

      if (!card) {
        res.status(404).json({ error: 'Card not found' })
        return
      }

      // Generate JWT
      const jwtData = WalletService.generateGoogleWalletJWT(card, card.program, card.customer)

      // In production, would sign this JWT with Google Cloud credentials
      const mockJWT = Buffer.from(JSON.stringify(jwtData)).toString('base64')

      res.status(200).json({
        success: true,
        passType: 'Google Wallet',
        jwt: mockJWT,
        instructions: 'In production, this would be a signed JWT for Google Pay'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate Google Wallet JWT'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get wallet pass data (generic format)
   */
  static async getWalletPassData(req: Request, res: Response): Promise<void> {
    try {
      const { cardId } = req.params

      const card = await prisma.loyaltyCard.findUnique({
        where: { id: cardId },
        include: {
          program: true,
          customer: true
        }
      })

      if (!card) {
        res.status(404).json({ error: 'Card not found' })
        return
      }

      const passData = WalletService.getWalletPassData(card, card.program, card.customer)

      res.status(200).json({
        success: true,
        passData
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate pass data'
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
      const { walletType } = req.body

      if (!['APPLE', 'GOOGLE'].includes(walletType)) {
        res.status(400).json({ error: 'Invalid wallet type. Must be APPLE or GOOGLE' })
        return
      }

      // Update card with wallet info
      const result = await CardService.addToWallet(req.business.id, cardId, walletType)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add card to wallet'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Update card in wallet
   */
  static async updateInWallet(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { cardId } = req.params
      const { points, status } = req.body

      // Update card
      const result = await WalletService.updateCardInWallet(cardId, {
        points,
        status,
        updatedAt: new Date()
      })

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update card in wallet'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Remove card from wallet
   */
  static async removeFromWallet(req: Request, res: Response): Promise<void> {
    try {
      if (!req.business) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { cardId } = req.params

      const result = await WalletService.removeCardFromWallet(cardId)

      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove card from wallet'
      res.status(400).json({ error: message })
    }
  }

  /**
   * Get wallet provider status
   */
  static async getWalletStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = WalletService.getWalletProviderStatus()

      res.status(200).json({
        success: true,
        walletProviders: status,
        message: 'Configure Apple and Google Wallet credentials for production use'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get wallet status'
      res.status(500).json({ error: message })
    }
  }
}

export default WalletController
