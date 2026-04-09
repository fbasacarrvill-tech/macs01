'use client'

import { useState, useEffect } from 'react'
import { programAPI } from '@/services/loyalty.service'

interface Program {
  id: string
  name: string
  type: string
  isActive: boolean
  cardCount: number
  createdAt: string
  analytics: {
    totalCustomers: number
    activeCards: number
  }
}

interface ProgramsListProps {
  onSelectProgram?: (program: Program) => void
  onCreateNew?: () => void
}

const PROGRAM_ICONS: Record<string, string> = {
  STAMPS: '🎫',
  CASHBACK: '💰',
  AFFINITY: '❤️',
  DISCOUNT: '🏷️',
  COUPON: '🎁',
  GIFT: '🎀',
  MEMBERSHIP: '⭐',
  MULTIPASS: '🎟️'
}

export default function ProgramsList({ onSelectProgram, onCreateNew }: ProgramsListProps) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    setLoading(true)
    try {
      const response = await programAPI.list({
        isActive: filter === 'all' ? undefined : filter === 'active'
      })
      setPrograms(response.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load programs')
      setPrograms([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilter: 'all' | 'active' | 'inactive') => {
    setFilter(newFilter)
    // Don't reload here, let useEffect handle it
  }

  useEffect(() => {
    loadPrograms()
  }, [filter])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando programas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Programas de Lealtad</h2>
        <button
          onClick={onCreateNew}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition font-medium"
        >
          ➕ Nuevo Programa
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              filter === f
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {f === 'all' && 'Todos'}
            {f === 'active' && 'Activos'}
            {f === 'inactive' && 'Inactivos'}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No tienes programas de lealtad aún</p>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Crear tu primer programa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map(program => (
            <div
              key={program.id}
              onClick={() => onSelectProgram?.(program)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition cursor-pointer"
            >
              {/* Icon & Type */}
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{PROGRAM_ICONS[program.type] || '🎫'}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  program.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {program.isActive ? '✓ Activo' : '○ Inactivo'}
                </span>
              </div>

              {/* Name & Type */}
              <h3 className="text-lg font-bold mb-1">{program.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{program.type}</p>

              {/* Stats */}
              <div className="bg-gray-50 rounded p-3 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Clientes:</span>
                  <span className="font-semibold">{program.analytics?.totalCustomers || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tarjetas Activas:</span>
                  <span className="font-semibold">{program.analytics?.activeCards || 0}</span>
                </div>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-500">
                Creado: {new Date(program.createdAt).toLocaleDateString('es-ES')}
              </p>

              {/* Button */}
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm">
                Ver Detalles →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
