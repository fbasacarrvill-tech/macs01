'use client'

import { useState } from 'react'
import { useLoyaltyAuthContext } from '@/context/LoyaltyAuthContext'
import { withLoyaltyAuth } from '@/middleware/protectedRoute'
import ProgramsList from '@/components/loyalty/ProgramsList'
import CreateProgramForm from '@/components/loyalty/CreateProgramForm'
import Link from 'next/link'

function DashboardContent() {
  const { user, logout } = useLoyaltyAuthContext()
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'create'>('overview')

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DevotioRewards</h1>
              <p className="text-gray-600 mt-1">Dashboard de {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              🚪 Salir
            </button>
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
              📊 Resumen
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-4 py-4 font-medium border-b-2 transition ${
                activeTab === 'programs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🎫 Mis Programas
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-4 font-medium border-b-2 transition ${
                activeTab === 'create'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ✨ Crear Programa
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm uppercase mb-1">Programas Activos</p>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm uppercase mb-1">Clientes Inscritos</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm uppercase mb-1">Tarjetas Activas</p>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm uppercase mb-1">Transacciones Totales</p>
                <p className="text-3xl font-bold text-orange-600">0</p>
              </div>
            </div>

            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">¡Bienvenido a DevotioRewards!</h2>
              <p className="mb-4 opacity-90">Crea tus primeros programas de lealtad digital y comienza a recompensar a tus clientes.</p>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                🚀 Crear Primer Programa
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 8 Tipos de Tarjetas</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Sellos - Compra X, obtén 1 gratis</li>
                  <li>✅ Cashback - Porcentaje del monto</li>
                  <li>✅ Afiliación - Promociones exclusivas</li>
                  <li>✅ Descuento - Múltiples niveles</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📱 Wallet Digital</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Apple Wallet integrado</li>
                  <li>✅ Google Wallet integrado</li>
                  <li>✅ Códigos QR y códigos de barras</li>
                  <li>✅ Sin app requerida</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Analytics Completos</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Métricas en tiempo real</li>
                  <li>✅ Segmentación de clientes</li>
                  <li>✅ Cálculo de ROI</li>
                  <li>✅ Historial de transacciones</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🔔 Notificaciones</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Push notifications</li>
                  <li>✅ Geolocalización</li>
                  <li>✅ Campañas segmentadas</li>
                  <li>✅ Sin límite de mensajes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <ProgramsList />
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Programa</h2>
            <CreateProgramForm />
          </div>
        )}
      </main>
    </div>
  )
}

export default withLoyaltyAuth(DashboardContent, 'business')
