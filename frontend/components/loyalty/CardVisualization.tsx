'use client'

import { useState } from 'react'
import { walletAPI } from '@/services/loyalty.service'

interface Card {
  id: string
  cardNumber: string
  barcode: string
  qrCode: string
  points: number
  totalPointsEarned: number
  totalPointsRedeemed: number
  status: string
  expiresAt?: string
  program?: {
    name: string
    pointsName: string
    type: string
  }
  customer?: {
    firstName?: string
    lastName?: string
  }
}

interface CardVisualizationProps {
  card: Card
  onAddToWallet?: (result: any) => void
}

export default function CardVisualization({ card, onAddToWallet }: CardVisualizationProps) {
  const [flipped, setFlipped] = useState(false)
  const [addingToWallet, setAddingToWallet] = useState(false)
  const [walletMessage, setWalletMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAddToAppleWallet = async () => {
    setAddingToWallet(true)
    try {
      const result = await walletAPI.getApplePass(card.id)
      setWalletMessage({
        type: 'success',
        text: 'Apple Wallet pass generado'
      })
      onAddToWallet?.(result)
    } catch (error) {
      setWalletMessage({
        type: 'error',
        text: 'Error al generar Apple Wallet'
      })
    } finally {
      setAddingToWallet(false)
    }
  }

  const handleAddToGoogleWallet = async () => {
    setAddingToWallet(true)
    try {
      const result = await walletAPI.getGoogleWalletJWT(card.id)
      setWalletMessage({
        type: 'success',
        text: 'Google Wallet JWT generado'
      })
      onAddToWallet?.(result)
    } catch (error) {
      setWalletMessage({
        type: 'error',
        text: 'Error al generar Google Wallet'
      })
    } finally {
      setAddingToWallet(false)
    }
  }

  const isExpired = card.expiresAt && new Date(card.expiresAt) < new Date()
  const daysUntilExpiry = card.expiresAt
    ? Math.ceil((new Date(card.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Visualization */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="perspective mb-6 cursor-pointer"
        style={{
          perspective: '1000px'
        }}
      >
        <div
          className="relative w-full h-64 rounded-lg shadow-lg transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front */}
          <div
            className="absolute w-full h-full rounded-lg p-6 flex flex-col justify-between"
            style={{
              backgroundColor: card.program?.['backgroundColor'] || '#FFFFFF',
              color: card.program?.['foregroundColor'] || '#000000',
              backfaceVisibility: 'hidden'
            }}
          >
            <div>
              <h3 className="text-lg font-bold">{card.program?.name}</h3>
              <p className="text-sm opacity-80">{card.program?.type}</p>
            </div>

            <div>
              <p className="text-xs opacity-70 mb-1">NÚMERO DE TARJETA</p>
              <p className="font-mono text-lg tracking-wider">{card.cardNumber}</p>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-70">TITULAR</p>
                <p className="font-semibold">
                  {card.customer?.firstName} {card.customer?.lastName}
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold">{card.points}</p>
                <p className="text-xs opacity-70">{card.program?.pointsName}</p>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute w-full h-full rounded-lg p-6 flex flex-col justify-center"
            style={{
              backgroundColor: card.program?.['backgroundColor'] || '#FFFFFF',
              color: card.program?.['foregroundColor'] || '#000000',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold opacity-70 mb-2">CÓDIGO DE BARRAS</p>
                <p className="font-mono text-sm bg-white bg-opacity-20 p-2 rounded text-center">
                  {card.barcode}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold opacity-70 mb-2">CÓDIGO QR</p>
                <div className="bg-white bg-opacity-20 p-3 rounded">
                  <div className="text-xs text-center opacity-70">QR Code</div>
                  <p className="font-mono text-xs text-center mt-1 break-all">{card.qrCode}</p>
                </div>
              </div>

              <p className="text-xs text-center opacity-50 mt-4">
                Click para ver el frente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status & Stats */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-600 uppercase mb-1">Estatus</p>
            <p className={`font-semibold ${
              card.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
            }`}>
              {card.status}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-600 uppercase mb-1">Expiración</p>
            {card.expiresAt ? (
              <div>
                <p className={`font-semibold ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                  {daysUntilExpiry !== null && daysUntilExpiry > 0 ? `${daysUntilExpiry}d` : 'Expirada'}
                </p>
              </div>
            ) : (
              <p className="font-semibold text-blue-600">Sin expiración</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded text-center">
            <p className="text-xs text-blue-600 uppercase mb-1">Ganados</p>
            <p className="text-lg font-bold text-blue-600">{card.totalPointsEarned}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded text-center">
            <p className="text-xs text-purple-600 uppercase mb-1">Canjeados</p>
            <p className="text-lg font-bold text-purple-600">{card.totalPointsRedeemed}</p>
          </div>

          <div className="bg-green-50 p-4 rounded text-center">
            <p className="text-xs text-green-600 uppercase mb-1">Disponibles</p>
            <p className="text-lg font-bold text-green-600">{card.points}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {walletMessage && (
        <div
          className={`mb-6 px-4 py-3 rounded-md ${
            walletMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {walletMessage.text}
        </div>
      )}

      {/* Wallet Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleAddToAppleWallet}
          disabled={addingToWallet}
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-900 disabled:opacity-50 font-medium transition flex items-center justify-center gap-2"
        >
          🍎 Agregar a Apple Wallet
        </button>

        <button
          onClick={handleAddToGoogleWallet}
          disabled={addingToWallet}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition flex items-center justify-center gap-2"
        >
          🔵 Agregar a Google Wallet
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Click en la tarjeta para ver detalles de seguridad
      </p>
    </div>
  )
}
