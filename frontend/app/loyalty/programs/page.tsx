'use client'

import { useState, useEffect } from 'react'
import { loyaltyService } from '@/services/loyalty.service'
import Link from 'next/link'
import { getProgramIcon, getCardTypeBadge } from '@/utils/loyalty.utils'

interface Program {
  id: string
  name: string
  description: string
  type: string
  primaryColor: string
  secondaryColor: string
  pointsName: string
  _count?: {
    customers: number
    cards: number
  }
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true)
        const data = await loyaltyService.programAPI.listPrograms()
        setPrograms(data.programs || [])
      } catch (err: any) {
        setError(err.message || 'Error al cargar los programas')
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || program.type === selectedType

    return matchesSearch && matchesType
  })

  const programTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'STAMPS', label: 'Sellos' },
    { value: 'CASHBACK', label: 'Cashback' },
    { value: 'AFFINITY', label: 'Afiliación' },
    { value: 'DISCOUNT', label: 'Descuento' },
    { value: 'COUPON', label: 'Cupón' },
    { value: 'GIFT', label: 'Regalo' },
    { value: 'MEMBERSHIP', label: 'Membresía' },
    { value: 'MULTIPASS', label: 'Multipase' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Programas de Lealtad</h1>
              <p className="text-gray-600 mt-1">Explora y únete a nuestros programas de recompensas</p>
            </div>
            <Link href="/loyalty/my-cards" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              🎫 Mis Tarjetas
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Buscar programas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />

            {/* Type Filter */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Tipo de Programa:</p>
              <div className="flex flex-wrap gap-2">
                {programTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedType === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando programas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-600">No se encontraron programas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map(program => {
              const badge = getCardTypeBadge(program.type)
              return (
                <div
                  key={program.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  {/* Color Header */}
                  <div
                    className="h-32"
                    style={{
                      backgroundColor: program.primaryColor || '#3B82F6',
                    }}
                  />

                  {/* Content */}
                  <div className="p-6">
                    {/* Icon and Type */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{badge.icon}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.color} text-gray-700`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Name and Description */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{program.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">Clientes</p>
                        <p className="font-bold text-gray-900">{program._count?.customers || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">Tarjetas</p>
                        <p className="font-bold text-gray-900">{program._count?.cards || 0}</p>
                      </div>
                    </div>

                    {/* Points Name */}
                    <p className="text-xs text-gray-600 mb-4">
                      Sistema de recompensa: <span className="font-semibold">{program.pointsName}</span>
                    </p>

                    {/* Join Button */}
                    <Link
                      href={`/loyalty/programs/${program.id}/join`}
                      className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Unirse
                    </Link>
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
