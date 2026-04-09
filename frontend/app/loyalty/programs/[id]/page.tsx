'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLoyaltyAuthContext } from '@/context/LoyaltyAuthContext'
import { withLoyaltyAuth } from '@/middleware/protectedRoute'
import { loyaltyService } from '@/services/loyalty.service'
import ProgramDetail from '@/components/loyalty/ProgramDetail'
import CustomerManagement from '@/components/loyalty/CustomerManagement'
import AnalyticsDashboard from '@/components/loyalty/AnalyticsDashboard'
import CardScanner from '@/components/loyalty/CardScanner'
import Link from 'next/link'

function ProgramDetailPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'scanner' | 'analytics'>('overview')
  const [program, setProgram] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          <Link href="/loyalty/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Link href="/loyalty/dashboard" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
                ← Volver
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
              <p className="text-gray-600 mt-1">{program.description}</p>
            </div>
            <div
              className="w-16 h-16 rounded-lg"
              style={{
                backgroundColor: program.primaryColor || '#3B82F6',
              }}
            />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-4 font-medium border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Resumen
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-4 font-medium border-b-2 transition ${
                activeTab === 'scanner'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🔍 Escanear
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-4 font-medium border-b-2 transition ${
                activeTab === 'customers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Clientes
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-4 font-medium border-b-2 transition ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Analytics
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'overview' && (
          <ProgramDetail program={program} />
        )}

        {activeTab === 'scanner' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Escanear Tarjeta</h2>
            <CardScanner programId={programId} />
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Clientes</h2>
            <CustomerManagement programId={programId} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
            <AnalyticsDashboard programId={programId} />
          </div>
        )}
      </main>
    </div>
  )
}

export default withLoyaltyAuth(ProgramDetailPage, 'business')
