'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoyaltyAuthContext } from '@/context/LoyaltyAuthContext'
import Link from 'next/link'

export default function LoyaltyLoginPage() {
  const router = useRouter()
  const { login, loading, error: authError } = useLoyaltyAuthContext()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.password) {
      setError('Email y contraseña son requeridos')
      return
    }

    const success = await login(formData.email, formData.password)
    if (success) {
      router.push('/loyalty/dashboard')
    } else {
      setError(authError || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DevotioRewards</h1>
          <p className="text-gray-600">Plataforma de Lealtad Digital</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">
            Login
          </button>
          <Link
            href="/loyalty/register"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            Registrarse
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="tu@negocio.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
          >
            {loading ? '⏳ Ingresando...' : '🔓 Iniciar Sesión'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>¿No tienes cuenta?{' '}
            <Link href="/loyalty/register" className="text-blue-600 hover:underline font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 font-semibold mb-2">Demo Credentials:</p>
          <p className="text-xs text-blue-800 mb-1">Email: demo@coffeeshop.com</p>
          <p className="text-xs text-blue-800">Usa cualquier contraseña para demo</p>
        </div>
      </div>
    </div>
  )
}
