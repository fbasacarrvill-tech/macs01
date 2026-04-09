import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Wallet Service
 * Handles Apple Wallet (.pkpass) and Google Wallet (JWT) integration
 *
 * Note: In production, this would require:
 * - Apple Developer account with PassKit capabilities
 * - Google Pay API credentials
 * - Certificate signing for .pkpass files
 */
export class WalletService {
  /**
   * Generate Apple Wallet pass (.pkpass format)
   * Returns data structure for .pkpass generation
   */
  static generateAppleWalletPass(card: any, program: any, customer: any): {
    formatVersion: number
    passTypeIdentifier: string
    serialNumber: string
    teamIdentifier: string
    organizationName: string
    logoText: string
    description: string
    labelColor: string
    foregroundColor: string
    backgroundColor: string
    storeCard: {
      primaryFields: Array<{
        key: string
        label: string
        value: string
      }>
      secondaryFields: Array<{
        key: string
        label: string
        value: string
      }>
      auxiliaryFields: Array<{
        key: string
        label: string
        value: string
      }>
      backFields: Array<{
        key: string
        label: string
        value: string
      }>
    }
    barcode: {
      format: string
      message: string
      messageEncoding: string
      altText: string
    }
    locations?: Array<{
      latitude: number
      longitude: number
      relevantText: string
    }>
    beacons?: Array<{
      major: number
      minor: number
      proximityUUID: string
      relevantText: string
    }>
    expirationDate?: string
    voided?: boolean
  } {
    const expirationDate = card.expiresAt
      ? new Date(card.expiresAt).toISOString().split('T')[0]
      : undefined

    return {
      formatVersion: 1,
      passTypeIdentifier: `pass.com.devotio.${program.type.toLowerCase()}`,
      serialNumber: card.id,
      teamIdentifier: 'TEAM123456', // Would come from Apple Developer account
      organizationName: program.businessName || 'Loyalty Program',
      logoText: program.pointsName || 'Points',
      description: program.name,
      labelColor: 'rgb(255, 255, 255)',
      foregroundColor: `rgb(${this.hexToRgb(program.foregroundColor)})`,
      backgroundColor: `rgb(${this.hexToRgb(program.backgroundColor)})`,
      storeCard: {
        primaryFields: [
          {
            key: 'points',
            label: program.pointsName || 'Points',
            value: card.points.toString()
          }
        ],
        secondaryFields: [
          {
            key: 'cardNumber',
            label: 'Card Number',
            value: card.cardNumber
          },
          {
            key: 'customerName',
            label: 'Member',
            value: `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
          }
        ],
        auxiliaryFields: [
          {
            key: 'programName',
            label: 'Program',
            value: program.name
          },
          {
            key: 'tier',
            label: 'Tier',
            value: 'Member'
          }
        ],
        backFields: [
          {
            key: 'terms',
            label: 'Terms & Conditions',
            value: 'Valid for loyalty rewards at participating locations'
          },
          {
            key: 'rewardInfo',
            label: 'How to Redeem',
            value: `Redeem ${card.points} points or more for rewards`
          }
        ]
      },
      barcode: {
        format: 'PKBarcodeFormatCode128',
        message: card.barcode,
        messageEncoding: 'iso-8859-1',
        altText: card.cardNumber
      },
      expirationDate,
      voided: card.status !== 'ACTIVE'
    }
  }

  /**
   * Generate Google Wallet JWT
   * Returns JWT data for Google Wallet integration
   */
  static generateGoogleWalletJWT(card: any, program: any, customer: any): {
    iss: string
    aud: string
    typ: string
    iat: number
    exp: number
    origins: string[]
    payload: {
      genericObjects: Array<{
        id: string
        classId: string
        genericClass: {
          id: string
          issuerName: string
          renderSpecs: Array<{
            viewName: string
            templates: Array<{
              fields: Array<{
                source: { text: string }
                fieldPath: string
              }>
            }>
          }>
        }
        genericObject: {
          id: string
          classId: string
          cardTitle: {
            defaultValue: { language: string; value: string }
          }
          subheader: {
            defaultValue: { language: string; value: string }
          }
          hexBackgroundColor: string
          logo: {
            contentDescription: { defaultValue: { language: string; value: string } }
            image: { sourceUri: { uri: string } }
          }
          cardDetails: Array<{
            cardFieldName: string
            details: string
          }>
        }
      }>
    }
  } {
    const expirationTime = card.expiresAt
      ? Math.floor(new Date(card.expiresAt).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 365 * 24 * 3600

    return {
      iss: 'google-wallet-issuer@example.com', // Would be Google Cloud service account
      aud: 'google',
      typ: 'savetogooglepay',
      iat: Math.floor(Date.now() / 1000),
      exp: expirationTime,
      origins: ['https://example.com'], // Your domain
      payload: {
        genericObjects: [
          {
            id: card.id,
            classId: `${program.businessId}.${program.type}`,
            genericClass: {
              id: `${program.businessId}.${program.type}`,
              issuerName: program.businessName || 'Loyalty Program',
              renderSpecs: [
                {
                  viewName: 'G_DEFAULT',
                  templates: [
                    {
                      fields: [
                        {
                          source: { text: program.name },
                          fieldPath: 'class.header.defaultValue.content'
                        },
                        {
                          source: { text: program.pointsName || 'Points' },
                          fieldPath: 'object.cardDetails[0].cardFieldName'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            genericObject: {
              id: card.id,
              classId: `${program.businessId}.${program.type}`,
              cardTitle: {
                defaultValue: {
                  language: 'en',
                  value: program.name
                }
              },
              subheader: {
                defaultValue: {
                  language: 'en',
                  value: `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                }
              },
              hexBackgroundColor: program.backgroundColor,
              logo: {
                contentDescription: {
                  defaultValue: {
                    language: 'en',
                    value: program.businessName || 'Logo'
                  }
                },
                image: {
                  sourceUri: {
                    uri: program.logoUrl || 'https://via.placeholder.com/200'
                  }
                }
              },
              cardDetails: [
                {
                  cardFieldName: program.pointsName || 'Points',
                  details: card.points.toString()
                },
                {
                  cardFieldName: 'Card Number',
                  details: card.cardNumber
                }
              ]
            }
          }
        ]
      }
    }
  }

  /**
   * Get wallet pass data structure (generic)
   */
  static getWalletPassData(card: any, program: any, customer: any): {
    cardId: string
    cardNumber: string
    barcode: string
    qrCode: string
    points: number
    programName: string
    customerName: string
    expiresAt: Date | null
    backgroundColor: string
    foregroundColor: string
    accentColor: string
  } {
    return {
      cardId: card.id,
      cardNumber: card.cardNumber,
      barcode: card.barcode,
      qrCode: card.qrCode,
      points: card.points,
      programName: program.name,
      customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      expiresAt: card.expiresAt,
      backgroundColor: program.backgroundColor,
      foregroundColor: program.foregroundColor,
      accentColor: program.accentColor
    }
  }

  /**
   * Update card in wallet
   * Called when card state changes (points added, etc.)
   */
  static async updateCardInWallet(cardId: string, updates: {
    points?: number
    status?: string
    updatedAt?: Date
  }): Promise<{
    success: boolean
    message: string
    cardId: string
  }> {
    // In production, would call wallet provider APIs
    // For now, just return success
    return {
      success: true,
      message: 'Card updated in wallet providers',
      cardId
    }
  }

  /**
   * Remove card from wallet
   * Called when card is deleted or deactivated
   */
  static async removeCardFromWallet(cardId: string): Promise<{
    success: boolean
    message: string
    cardId: string
  }> {
    // In production, would call wallet provider APIs
    return {
      success: true,
      message: 'Card removed from wallet providers',
      cardId
    }
  }

  /**
   * Get wallet provider status
   */
  static getWalletProviderStatus(): {
    appleWallet: {
      enabled: boolean
      status: string
      requirements: string[]
    }
    googleWallet: {
      enabled: boolean
      status: string
      requirements: string[]
    }
  } {
    return {
      appleWallet: {
        enabled: false,
        status: 'Not configured',
        requirements: [
          'Apple Developer account',
          'PassKit capabilities enabled',
          'Certificate signing setup',
          'WWDC Team ID'
        ]
      },
      googleWallet: {
        enabled: false,
        status: 'Not configured',
        requirements: [
          'Google Cloud project',
          'Google Pay API enabled',
          'Service account credentials',
          'Domain verification'
        ]
      }
    }
  }

  /**
   * Helper: Convert hex color to RGB
   */
  private static hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return '0, 0, 0'

    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)

    return `${r}, ${g}, ${b}`
  }
}

export default WalletService
