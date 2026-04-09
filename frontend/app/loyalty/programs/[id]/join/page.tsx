'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loyaltyService } from '@/services/loyalty.service'
import { getCardTypeBadge } from '@/utils/loyalty.utils'
import Link from 'next/link'

interface Program {
  id: string
  name: string
  description: string
  type: string
  pointsName: string
  primaryColor: string
  secondaryColor: string
  _count?: {
    customers: number
    cards: number
  }
}

export default function JoinProgramPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string

  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: ''
  })

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true)
        const data = await loyaltyService.programAPI.getProgram(programId)
        setProgram(data)
      } catch (err: any) {
        setError(err.message || 'Error al cargar el programa')
      } finally {
        setLoading(false)
      }
    }

    if (programId) {
      fetchProgram()
    }
  }, [programId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoinError(null)

    if (!formData.firstName.trim()) {
      setJoinError('El nombre es requerido')
      return
    }

    if (!formData.email.trim()) {
      setJoinError('El email es requerido')
      return
    }

    try {
      setJoining(true)
      await loyaltyService.customerAPI.enrollInProgram(programId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        city: formData.city || undefined
      })

      router.push('/loyalty/my-cards')
    } catch (err: any) {
      setJoinError(err.message || 'Error al unirse al programa')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando programa...</p>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Programa no encontrado'}</p>
          <Link href="/loyalty/programs" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
            Volver a Programas
          </Link>
        </div>
      </div>
    )
  }

  const badge = getCardTypeBadge(program.type)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back Link */}
        <Link href="/loyalty/programs" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Volver a Programas
        </Link>

        {/* Program Info Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div
            className="h-40"
            style={{
              backgroundColor: program.primaryColor || '#3B82F6',
            }}
          />

          {/* Content */}
          <div className="p-8">
            {/* Title and Badge */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.name}</h1>
                <p className="text-gray-600">{program.description}</p>
              </div>
              <span className={`text-2xl ${badge.color} px-4 py-2 rounded-lg`}>
                {badge.icon}
              </span>
            </div>

            {/* Program Details */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200 mb-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm uppercase mb-1">Tipo</p>
                <p className="text-lg font-semibold text-gray-900">{badge.label}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm uppercase mb-1">Sistema de Recompensa</p>
                <p className="text-lg font-semibold text-gray-900">{program.pointsName}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm uppercase mb-1">Miembros</p>
                <p className="text-lg font-semibold text-gray-900">{program._count?.customers || 0}</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Beneficios</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✅ Tarjeta digital en Apple Wallet y Google Wallet</li>
                <li>✅ Acceso inmediato sin descarga de app</li>
                <li>✅ Recibe notificaciones de ofertas especiales</li>
                <li>✅ Historial completo de transacciones</li>
                <li>✅ Protección de datos garantizada</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Join Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Datos de Inscripción</h2>

          {joinError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {joinError}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Juan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="García"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+34 600 000 000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad (opcional)
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Madrid"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={joining}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
              >
                {joining ? '⏳ Uniéndose...' : '🎉 Unirme al Programa'}
              </button>
            </div>

            {/* Privacy */}
            <p className="text-xs text-gray-600 text-center">
              Al unirte, aceptas nuestros términos y política de privacidad.
              Tus datos estarán seguros y no compartidos.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
