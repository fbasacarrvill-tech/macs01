import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

/**
 * Card Generation Service
 * Handles generation of card codes, QR codes, and barcodes
 * In production, would integrate with QR code generation libraries (qrcode, jsbarcode)
 */
export class CardGenerationService {
  /**
   * Generate a complete card number in standardized format
   * Format: CARD-XXXXX-XXXXX-XXXXX-XXXXX (20 chars total)
   */
  static generateCardNumber(programId: string, customerId: string): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    const hash = createHash('md5')
      .update(programId + customerId + timestamp)
      .digest('hex')
      .substring(0, 5)
      .toUpperCase()

    return `CARD-${hash}-${random}-${timestamp}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
  }

  /**
   * Generate UPC-A compatible barcode (12 digits)
   * Format: PPPCCCNNNNNN
   * PPP = Program type code
   * CCC = Customer identifier (from hash)
   * NNNNNN = Sequential number
   */
  static generateBarcode(programType: string, customerId: string, sequence: number): string {
    // Map program types to 3-digit codes
    const programCodes: Record<string, string> = {
      STAMPS: '101',
      CASHBACK: '102',
      AFFINITY: '103',
      DISCOUNT: '104',
      COUPON: '105',
      GIFT: '106',
      MEMBERSHIP: '107',
      MULTIPASS: '108'
    }

    const programCode = programCodes[programType] || '100'
    const customerHash = createHash('md5').update(customerId).digest('hex').substring(0, 3).toUpperCase()
    const sequenceStr = sequence.toString().padStart(6, '0')

    const barcode = programCode + customerHash + sequenceStr

    // Calculate and add check digit (Luhn algorithm for UPC-A)
    const checkDigit = this.calculateLuhnCheckDigit(barcode)

    return barcode + checkDigit
  }

  /**
   * Generate QR code data (simplified)
   * In production, would use qrcode library to generate actual QR image
   * Returns the data that would be encoded in the QR code
   */
  static generateQRCodeData(cardId: string, cardNumber: string, programId: string): {
    data: string
    format: string
    size: number
  } {
    // Standard QR code data format for loyalty cards
    const qrData = JSON.stringify({
      type: 'loyalty_card',
      cardId,
      cardNumber,
      programId,
      timestamp: Date.now(),
      version: '1.0'
    })

    return {
      data: Buffer.from(qrData).toString('base64'),
      format: 'DATA_MATRIX', // or 'QR_CODE'
      size: 200 // pixels
    }
  }

  /**
   * Generate a secure card access token (JWT-like)
   * Used for API card lookups without exposing full card number
   */
  static generateCardAccessToken(cardId: string, customerId: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(
      JSON.stringify({
        cardId,
        customerId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 * 365 // 1 year
      })
    ).toString('base64url')

    // Simplified signature (in production, use real JWT library)
    const signature = createHash('sha256')
      .update(header + '.' + payload + 'secret-key')
      .digest('base64url')

    return `${header}.${payload}.${signature}`
  }

  /**
   * Generate a pass URL for Apple Wallet / Google Wallet
   * In production, would generate actual .pkpass or .json files
   */
  static generatePassUrl(cardId: string, businessId: string): {
    appleWalletUrl: string
    googleWalletUrl: string
  } {
    const token = this.generateCardAccessToken(cardId, businessId)

    return {
      appleWalletUrl: `/api/loyalty/wallet/apple/${cardId}?token=${token}`,
      googleWalletUrl: `/api/loyalty/wallet/google/${cardId}?token=${token}`
    }
  }

  /**
   * Generate card design metadata
   * Contains colors, layout information for wallet display
   */
  static generateCardDesign(programId: string, businessName: string): {
    logoUrl: string
    backgroundColor: string
    foregroundColor: string
    accentColor: string
    layout: string
    fields: {
      programName: string
      customerName: string
      pointsLabel: string
      expirationDate: string
    }
  } {
    return {
      logoUrl: `/api/loyalty/programs/${programId}/logo`,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000',
      accentColor: '#3B82F6',
      layout: 'STANDARD',
      fields: {
        programName: businessName,
        customerName: 'Cardholder',
        pointsLabel: 'Points',
        expirationDate: 'Expires'
      }
    }
  }

  /**
   * Validate a card number format
   */
  static validateCardNumber(cardNumber: string): boolean {
    // CARD-XXXXX-XXXXX-XXXXX-XXXXX format
    const pattern = /^CARD-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/
    return pattern.test(cardNumber)
  }

  /**
   * Validate a barcode format
   */
  static validateBarcode(barcode: string): boolean {
    // 12 digits + 1 check digit = 13 characters
    if (!/^\d{13}$/.test(barcode)) return false

    // Verify Luhn check digit
    const barcodeWithoutCheck = barcode.substring(0, 12)
    const expectedCheckDigit = this.calculateLuhnCheckDigit(barcodeWithoutCheck)

    return barcode.endsWith(expectedCheckDigit)
  }

  /**
   * Helper: Calculate Luhn check digit
   * Used for barcode validation
   */
  private static calculateLuhnCheckDigit(input: string): string {
    let sum = 0
    let isEven = false

    for (let i = input.length - 1; i >= 0; i--) {
      let digit = parseInt(input.charAt(i), 10)

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit.toString()
  }

  /**
   * Generate expiration date
   */
  static generateExpirationDate(expirationDays?: number | null): Date | null {
    if (!expirationDays || expirationDays <= 0) {
      return null
    }

    const date = new Date()
    date.setDate(date.getDate() + expirationDays)
    return date
  }

  /**
   * Check if card is expired
   */
  static isCardExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return false
    return new Date() > new Date(expiresAt)
  }

  /**
   * Get remaining days until expiration
   */
  static getDaysUntilExpiration(expiresAt: Date | null): number | null {
    if (!expiresAt) return null

    const today = new Date()
    const expiration = new Date(expiresAt)
    const diff = expiration.getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 3600 * 24))

    return days > 0 ? days : 0
  }

  /**
   * Generate secure card PIN (4-6 digits)
   * For enhanced security in high-value transactions
   */
  static generateCardPIN(length: number = 4): string {
    const pin = Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0')
    return pin
  }
}

export default CardGenerationService
