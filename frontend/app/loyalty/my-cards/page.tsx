'use client'

import { useState, useEffect } from 'react'
import { loyaltyService } from '@/services/loyalty.service'
import CardVisualization from '@/components/loyalty/CardVisualization'
import Link from 'next/link'
import { maskCardNumber, getCardTypeBadge, isCardExpired, getDaysUntilExpiration } from '@/utils/loyalty.utils'

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
    id: string
    name: string
    pointsName: string
    type: string
    primaryColor: string
  }
  customer?: {
    firstName?: string
    lastName?: string
  }
}

export default function MyCardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all')

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        const data = await loyaltyService.cardAPI.listMyCards()
        setCards(data.cards || [])
      } catch (err: any) {
        setError(err.message || 'Error al cargar las tarjetas')
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  const filteredCards = cards.filter(card => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'active') return !isCardExpired(card.expiresAt)
    if (filterStatus === 'expired') return isCardExpired(card.expiresAt)
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Tarjetas</h1>
              <p className="text-gray-600 mt-1">Gestiona tus tarjetas de lealtad digital</p>
            </div>
            <Link href="/loyalty/programs" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              ➕ Buscar Programas
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filterStatus === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Activas
            </button>
            <button
              onClick={() => setFilterStatus('expired')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filterStatus === 'expired'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Expiradas
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando tarjetas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-4">No tienes tarjetas aún</p>
            <Link href="/loyalty/programs" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Explorar Programas
            </Link>
          </div>
        ) : selectedCard ? (
          <div>
            <button
              onClick={() => setSelectedCard(null)}
              className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Volver a la lista
            </button>
            <CardVisualization card={selectedCard} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map(card => {
              const badge = getCardTypeBadge(card.program?.type || '')
              const daysLeft = getDaysUntilExpiration(card.expiresAt)
              const expired = isCardExpired(card.expiresAt)

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
                >
                  {/* Program Color Header */}
                  <div
                    className="h-24"
                    style={{
                      backgroundColor: card.program?.primaryColor || '#3B82F6',
                    }}
                  />

                  {/* Content */}
                  <div className="p-6">
                    {/* Program Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{card.program?.name}</h3>

                    {/* Card Number */}
                    <p className="text-xs text-gray-600 mb-4 font-mono">
                      {maskCardNumber(card.cardNumber)}
                    </p>

                    {/* Badge and Status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${badge.color}`}>
                        {badge.icon} {badge.label}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        expired
                          ? 'bg-red-100 text-red-700'
                          : card.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {expired ? 'Expirada' : card.status}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 uppercase mb-1">Disponibles</p>
                        <p className="text-2xl font-bold text-blue-600">{card.points}</p>
                        <p className="text-xs text-gray-600">{card.program?.pointsName}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 uppercase mb-1">Ganados</p>
                        <p className="text-2xl font-bold text-green-600">{card.totalPointsEarned}</p>
                      </div>
                    </div>

                    {/* Expiration */}
                    {card.expiresAt && (
                      <div className="text-center text-xs">
                        <p className="text-gray-600">
                          {expired
                            ? 'Expirada'
                            : daysLeft !== null
                            ? `Expira en ${daysLeft} días`
                            : 'Sin expiración'}
                        </p>
                      </div>
                    )}

                    {/* View Button */}
                    <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
