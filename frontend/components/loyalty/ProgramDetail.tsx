'use client'

import { useState, useEffect } from 'react'
import { programAPI, analyticsAPI, customerAPI } from '@/services/loyalty.service'

interface ProgramDetailProps {
  programId: string
  onBack?: () => void
}

export default function ProgramDetail({ programId, onBack }: ProgramDetailProps) {
  const [program, setProgram] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'analytics' | 'tiers'>('overview')

  useEffect(() => {
    loadProgramData()
  }, [programId])

  const loadProgramData = async () => {
    setLoading(true)
    try {
      const [programData, analyticsData, customersData] = await Promise.all([
        programAPI.get(programId),
        analyticsAPI.getProgramOverview(programId).catch(() => null),
        customerAPI.list({ programId })
      ])

      setProgram(programData)
      setAnalytics(analyticsData)
      setCustomers(customersData?.data || [])
    } catch (error) {
      console.error('Error loading program:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">No se pudo cargar el programa</p>
        <button onClick={onBack} className="text-blue-600 hover:underline">
          ← Volver
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow flex justify-between items-start">
        <div>
          <button onClick={onBack} className="text-blue-600 hover:underline mb-2 text-sm">
            ← Volver a mis programas
          </button>
          <h1 className="text-3xl font-bold mb-2">{program.name}</h1>
          <p className="text-gray-600">{program.description}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <span className={`px-3 py-1 rounded-full ${
              program.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {program.isActive ? '✓ Activo' : '○ Inactivo'}
            </span>
            <span className="text-gray-600">Tipo: <strong>{program.type}</strong></span>
            <span className="text-gray-600">Moneda: <strong>{program.currencyCode}</strong></span>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded text-right">
          <p className="text-sm text-gray-600 mb-1">Total de Clientes</p>
          <p className="text-3xl font-bold text-blue-600">
            {analytics?.totalCustomers || 0}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 flex">
          {(['overview', 'customers', 'analytics', 'tiers'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' && '📊 Resumen'}
              {tab === 'customers' && '👥 Clientes'}
              {tab === 'analytics' && '📈 Análisis'}
              {tab === 'tiers' && '🏆 Niveles'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-1">Nombre de Puntos</p>
                  <p className="text-2xl font-bold text-blue-600">{program.pointsName}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-1">Puntos por Dólar</p>
                  <p className="text-2xl font-bold text-green-600">{program.pointsPerDollar}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-1">Mín. Puntos Canjeables</p>
                  <p className="text-2xl font-bold text-purple-600">{program.minPointsRedeemable}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-1">Expiración (días)</p>
                  <p className="text-2xl font-bold text-orange-600">{program.expirationDays || '∞'}</p>
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="font-bold mb-3">Colores</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div
                      className="w-full h-20 rounded border"
                      style={{ backgroundColor: program.backgroundColor }}
                    ></div>
                    <p className="text-sm font-medium">Fondo</p>
                    <p className="text-xs text-gray-600">{program.backgroundColor}</p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="w-full h-20 rounded border"
                      style={{ backgroundColor: program.foregroundColor }}
                    ></div>
                    <p className="text-sm font-medium">Texto</p>
                    <p className="text-xs text-gray-600">{program.foregroundColor}</p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="w-full h-20 rounded border"
                      style={{ backgroundColor: program.accentColor }}
                    ></div>
                    <p className="text-sm font-medium">Acento</p>
                    <p className="text-xs text-gray-600">{program.accentColor}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div>
              {customers.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No hay clientes en este programa</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Nombre</th>
                        <th className="text-left py-3 px-4">Teléfono</th>
                        <th className="text-left py-3 px-4">Unido</th>
                        <th className="text-right py-3 px-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(customer => (
                        <tr key={customer.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{customer.email}</td>
                          <td className="py-3 px-4">{customer.firstName} {customer.lastName}</td>
                          <td className="py-3 px-4">{customer.phone || '-'}</td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            {new Date(customer.createdAt).toLocaleDateString('es-ES')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button className="text-blue-600 hover:underline text-xs">
                              Ver →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600 uppercase mb-1">Tarjetas Activas</p>
                  <p className="text-2xl font-bold">{analytics.activeCards}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600 uppercase mb-1">Total Puntos</p>
                  <p className="text-2xl font-bold">{analytics.totalPoints}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600 uppercase mb-1">Canjeados</p>
                  <p className="text-2xl font-bold">{analytics.totalPointsRedeemed}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600 uppercase mb-1">Revenue</p>
                  <p className="text-2xl font-bold">${analytics.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-900 mb-1">Engagement Rate</p>
                    <p className="text-xl font-bold text-blue-600">{analytics.engagementRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-900 mb-1">Redemption Rate</p>
                    <p className="text-xl font-bold text-blue-600">{analytics.redemptionRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-900 mb-1">Promedio por Cliente</p>
                    <p className="text-xl font-bold text-blue-600">{analytics.avgPointsPerCustomer?.toFixed(1) || '0'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tiers Tab */}
          {activeTab === 'tiers' && (
            <div className="space-y-4">
              {program.tiers && program.tiers.length > 0 ? (
                program.tiers.map((tier: any) => (
                  <div key={tier.id} className="border border-gray-200 p-4 rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: tier.color }}
                          ></div>
                          <h4 className="font-bold text-lg">{tier.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">Requiere {tier.requiredPoints} puntos</p>
                      </div>
                      {tier.discount > 0 && (
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium">
                          {tier.discount}% descuento
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No hay niveles definidos</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
