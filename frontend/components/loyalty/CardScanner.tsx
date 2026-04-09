'use client'

import { useState } from 'react'
import { transactionAPI, cardAPI } from '@/services/loyalty.service'

interface CardScannerProps {
  programId: string
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
}

export default function CardScanner({ programId, onSuccess, onError }: CardScannerProps) {
  const [mode, setMode] = useState<'scan' | 'manual' | 'process'>('scan')
  const [cardCode, setCardCode] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [scannedCard, setScannedCard] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardCode.trim()) {
      setMessage({ type: 'error', text: 'Ingresa un código de tarjeta' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const result = await transactionAPI.scan(cardCode.trim())
      setScannedCard(result.card)
      setCardCode('')
      setMode('process')
      setMessage({ type: 'success', text: 'Tarjeta escaneada exitosamente' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al escanear'
      setMessage({ type: 'error', text: msg })
      onError?.(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStamp = async () => {
    if (!scannedCard) return

    setLoading(true)
    try {
      const updated = await cardAPI.addStamp(scannedCard.id)
      setMessage({ type: 'success', text: `✓ Sello agregado! (${updated.points} sellos)` })
      onSuccess?.(updated)
      setTimeout(() => {
        setScannedCard(null)
        setMode('scan')
        setMessage(null)
      }, 2000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardCode.trim() || !amount.trim()) {
      setMessage({ type: 'error', text: 'Ingresa código y monto' })
      return
    }

    setLoading(true)
    try {
      const result = await transactionAPI.processPurchase(
        cardCode.trim(),
        parseFloat(amount),
        description || undefined
      )
      setMessage({
        type: 'success',
        text: `✓ Compra procesada! +${result.pointsAdded} puntos`
      })
      onSuccess?.(result)
      setCardCode('')
      setAmount('')
      setDescription('')
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async () => {
    if (!scannedCard) return

    setLoading(true)
    try {
      const pointsToRedeem = scannedCard.points >= 10 ? 10 : scannedCard.points
      const updated = await cardAPI.redeem(scannedCard.id, pointsToRedeem, 'Canje de recompensa')
      setMessage({
        type: 'success',
        text: `✓ Canje procesado! Puntos restantes: ${updated.points}`
      })
      onSuccess?.(updated)
      setTimeout(() => {
        setScannedCard(null)
        setMode('scan')
        setMessage(null)
      }, 2000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Escanear Tarjeta</h2>

      {/* Mode Selection */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setMode('scan')
            setScannedCard(null)
            setMessage(null)
          }}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            mode === 'scan'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📱 Escanear
        </button>
        <button
          onClick={() => {
            setMode('process')
            setScannedCard(null)
            setMessage(null)
          }}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            mode === 'process'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          💳 Procesar Compra
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Scan Mode */}
      {mode === 'scan' && !scannedCard && (
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Tarjeta (Barcode/QR)
            </label>
            <input
              type="text"
              value={cardCode}
              onChange={e => setCardCode(e.target.value)}
              placeholder="Escanea o ingresa el código..."
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition"
          >
            {loading ? '⏳ Escaneando...' : '🔍 Escanear Tarjeta'}
          </button>
        </form>
      )}

      {/* Scanned Card Details */}
      {scannedCard && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-3">{scannedCard.cardNumber}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-semibold">{scannedCard.customer?.firstName} {scannedCard.customer?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Puntos Actuales</p>
                <p className="text-2xl font-bold text-blue-600">{scannedCard.points}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estatus</p>
                <p className="font-semibold">{scannedCard.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Programa</p>
                <p className="font-semibold">{scannedCard.program?.name}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddStamp}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium transition"
            >
              ➕ Agregar Sello
            </button>
            {scannedCard.points >= 10 && (
              <button
                onClick={handleRedeem}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium transition"
              >
                🎁 Canjear
              </button>
            )}
            <button
              onClick={() => {
                setScannedCard(null)
                setCardCode('')
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-400 font-medium transition"
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Process Purchase Mode */}
      {mode === 'process' && (
        <form onSubmit={handleProcessPurchase} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Tarjeta
            </label>
            <input
              type="text"
              value={cardCode}
              onChange={e => setCardCode(e.target.value)}
              placeholder="Tarjeta..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto de Compra ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="ej: Compra café..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !cardCode || !amount}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition"
          >
            {loading ? '⏳ Procesando...' : '💰 Procesar Compra'}
          </button>
        </form>
      )}
    </div>
  )
}
