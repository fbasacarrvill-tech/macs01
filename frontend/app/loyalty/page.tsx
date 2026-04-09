'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLoyaltyAuthContext } from '@/context/LoyaltyAuthContext'
import Link from 'next/link'

export default function LoyaltyPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useLoyaltyAuthContext()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/loyalty/dashboard')
    }
  }, [isAuthenticated, loading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">DevotioRewards</h1>
          <p className="text-xl text-blue-100">Plataforma de Tarjetas de Lealtad Digital</p>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Business Owner Card */}
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden hover:shadow-3xl transition">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
              <div className="text-4xl mb-2">🏪</div>
              <h2 className="text-2xl font-bold text-white">Para Negocios</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6">
                Crea programas de lealtad digital para tu negocio. Recompensa a tus clientes y aumenta las ventas.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                <li>✅ Crear programas en minutos</li>
                <li>✅ Integración con Apple/Google Wallet</li>
                <li>✅ Analytics y ROI en tiempo real</li>
                <li>✅ Notificaciones y geolocalización</li>
              </ul>
              <div className="space-y-2">
                <Link
                  href="/loyalty/login"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/loyalty/register"
                  className="block w-full bg-gray-200 text-gray-900 text-center py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden hover:shadow-3xl transition">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
              <div className="text-4xl mb-2">👥</div>
              <h2 className="text-2xl font-bold text-white">Para Clientes</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6">
                Únete a programas de lealtad y comienza a ganar recompensas en tus tiendas favoritas.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                <li>✅ Tarjetas digitales en tu wallet</li>
                <li>✅ Sin apps para descargar</li>
                <li>✅ Recibe ofertas personalizadas</li>
                <li>✅ Acumula y canjea recompensas</li>
              </ul>
              <div className="space-y-2">
                <Link
                  href="/loyalty/programs"
                  className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Explorar Programas
                </Link>
                <p className="text-xs text-gray-600 text-center">
                  No necesitas cuenta para explorar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gray-900 p-8 text-center">
            <h3 className="text-2xl font-bold text-white">¿Por qué elegir DevotioRewards?</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-3">🚀</div>
                <h4 className="font-bold text-gray-900 mb-2">Rápido</h4>
                <p className="text-sm text-gray-600">
                  Crea tarjetas de lealtad en menos de 15 minutos
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📱</div>
                <h4 className="font-bold text-gray-900 mb-2">100% Digital</h4>
                <p className="text-sm text-gray-600">
                  Integración nativa con Apple Wallet y Google Wallet
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-bold text-gray-900 mb-2">Inteligente</h4>
                <p className="text-sm text-gray-600">
                  Analytics avanzados y segmentación de clientes
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">💰</div>
                <h4 className="font-bold text-gray-900 mb-2">Rentable</h4>
                <p className="text-sm text-gray-600">
                  Aumenta ventas un 30% y retención de clientes
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🔒</div>
                <h4 className="font-bold text-gray-900 mb-2">Seguro</h4>
                <p className="text-sm text-gray-600">
                  Certificado y protección de datos GDPR
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="font-bold text-gray-900 mb-2">Flexible</h4>
                <p className="text-sm text-gray-600">
                  8 tipos de programas para cada negocio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-blue-100">
          <p>© 2024 DevotioRewards. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
