'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [error, setError] = useState('')
  const { register, isLoading } = useAuth()
  const router = useRouter()

  function onChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    try {
      await register(form)
      router.push('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      setError(msg ?? 'Error al crear cuenta. Intenta de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">TradingSystem</h1>
          <p className="text-gray-400 mt-1">Comienza a analizar tu trading hoy</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Crear cuenta</h2>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre</label>
                <input className="input" placeholder="John" value={form.firstName}
                  onChange={(e) => onChange('firstName', e.target.value)} />
              </div>
              <div>
                <label className="label">Apellido</label>
                <input className="input" placeholder="Trader" value={form.lastName}
                  onChange={(e) => onChange('lastName', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="trader@ejemplo.com"
                value={form.email} onChange={(e) => onChange('email', e.target.value)} required />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input type="password" className="input" placeholder="Mínimo 8 caracteres"
                value={form.password} onChange={(e) => onChange('password', e.target.value)} required />
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando cuenta...
                </span>
              ) : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
