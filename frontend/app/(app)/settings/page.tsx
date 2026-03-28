'use client'

import { useState, FormEvent, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { api } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface Subscription {
  tier: 'free' | 'pro' | 'elite'
  status: 'active' | 'inactive' | 'cancelled'
  currentPeriodEnd?: string
}

export default function SettingsPage() {
  const { user, loadUser } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    preferredCurrency: 'USD',
    timezone: 'UTC',
  })
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    if (user) setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      preferredCurrency: user.preferredCurrency ?? 'USD',
      timezone: user.timezone ?? 'UTC',
    })
  }, [user])

  useEffect(() => {
    async function loadSubscription() {
      try {
        const res = await api.get('/subscriptions')
        setSubscription(res.data.data)
      } catch (err) {
        console.error(err)
        setSubscription({ tier: 'free', status: 'active' })
      } finally {
        setLoading(false)
      }
    }
    loadSubscription()
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/users/me', form)
      await loadUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  async function handleCheckout(tier: 'pro' | 'elite') {
    setCheckoutLoading(true)
    try {
      const priceId = tier === 'pro'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE_MONTHLY

      if (!priceId) {
        addToast('Stripe not configured', 'error')
        return
      }

      const res = await api.post('/subscriptions/checkout', { tier, priceId })
      window.location.href = res.data.data.url
    } catch (err) {
      addToast('Failed to start checkout', 'error')
      console.error(err)
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function handleManageSubscription() {
    try {
      const res = await api.post('/subscriptions/portal')
      window.location.href = res.data.data.url
    } catch (err) {
      addToast('Failed to open subscription portal', 'error')
      console.error(err)
    }
  }

  async function handleCancel() {
    if (!confirm('¿Está seguro de que desea cancelar su suscripción?')) return

    try {
      await api.post('/subscriptions/cancel')
      addToast('Suscripción cancelada', 'success')
      const res = await api.get('/subscriptions')
      setSubscription(res.data.data)
    } catch (err) {
      addToast('Failed to cancel subscription', 'error')
      console.error(err)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Ajustes</h1>

      {/* Profile */}
      <div className="card mb-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Perfil</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input className="input" value={form.firstName}
                onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Apellido</label>
              <input className="input" value={form.lastName}
                onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={user?.email ?? ''} disabled
              title="El email no se puede cambiar" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Moneda base</label>
              <select className="input" value={form.preferredCurrency}
                onChange={(e) => setForm(f => ({ ...f, preferredCurrency: e.target.value }))}>
                <option value="USD">USD — Dólar Americano</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — Libra Esterlina</option>
              </select>
            </div>
            <div>
              <label className="label">Zona Horaria</label>
              <select className="input" value={form.timezone}
                onChange={(e) => setForm(f => ({ ...f, timezone: e.target.value }))}>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (ET)</option>
                <option value="America/Chicago">America/Chicago (CT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Madrid">Europe/Madrid</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary text-sm" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && <span className="text-sm text-emerald-400">✓ Cambios guardados</span>}
          </div>
        </form>
      </div>

      {/* Subscription */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Suscripción</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : subscription && (
          <>
            {/* Current Plan */}
            <div className={`flex items-center justify-between p-4 rounded-lg mb-4 ${
              subscription.tier === 'pro' ? 'bg-blue-950/50 border border-blue-700' :
              subscription.tier === 'elite' ? 'bg-purple-950/50 border border-purple-700' :
              'bg-gray-900 border border-gray-700'
            }`}>
              <div>
                <p className="font-medium text-white capitalize">{subscription.tier === 'free' ? 'Plan Gratuito' : `Plan ${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}`}</p>
                <p className="text-sm text-gray-400">
                  {subscription.status === 'active' ? '✓ Activo' : '✗ Inactivo'}
                  {subscription.currentPeriodEnd && (
                    <> · Renuevas el {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES')}</>
                  )}
                </p>
              </div>
              {subscription.tier !== 'free' && (
                <div className="flex gap-2">
                  <button onClick={handleManageSubscription} className="btn-secondary text-sm">
                    Gestionar
                  </button>
                  <button onClick={handleCancel} className="btn-secondary text-sm text-red-400 hover:text-red-300">
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* Tier Options */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'free', name: 'Gratuito', price: '$0', features: ['5 trades/mes', 'Dashboard básico', 'Sin reportes'] },
                { id: 'pro', name: 'Pro', price: '$9.99', period: '/mes', features: ['Trades ilimitados', 'Reportes completos', 'Exportar PDF/CSV'], highlight: subscription.tier === 'pro' },
                { id: 'elite', name: 'Elite', price: '$29.99', period: '/mes', features: ['Todo en Pro', 'API access', 'Soporte prioritario'], highlight: subscription.tier === 'elite' },
              ].map(({ id, name, price, period, features, highlight }) => (
                <div key={id} className={`p-4 rounded-lg border transition-all ${
                  highlight
                    ? id === 'elite' ? 'border-purple-600 bg-purple-950/30' : 'border-blue-600 bg-blue-950/30'
                    : 'border-gray-700 bg-gray-900'
                }`}>
                  <p className="font-semibold text-white">{name}</p>
                  <p className={`text-sm font-medium mt-1 ${
                    id === 'elite' ? 'text-purple-400' :
                    id === 'pro' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {price}{period}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {features.map(f => (
                      <li key={f} className="text-xs text-gray-400 flex items-center gap-2">
                        <span className={highlight ? 'text-emerald-500' : 'text-gray-600'}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {id !== 'free' && (
                    <button
                      onClick={() => handleCheckout(id as 'pro' | 'elite')}
                      disabled={checkoutLoading || subscription.tier === id}
                      className={`mt-4 w-full text-sm py-2 rounded-lg font-medium transition-colors ${
                        subscription.tier === id
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : highlight
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {checkoutLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoadingSpinner size="sm" />
                        </span>
                      ) : subscription.tier === id ? (
                        'Plan actual'
                      ) : subscription.tier === 'free' ? (
                        'Actualizar'
                      ) : (
                        'Cambiar'
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded text-xs text-gray-300">
              💳 Los pagos se procesan de manera segura a través de Stripe. Puedes cancelar o cambiar tu plan en cualquier momento.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
