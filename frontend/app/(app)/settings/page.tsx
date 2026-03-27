'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/services/api'

export default function SettingsPage() {
  const { user, loadUser } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    preferredCurrency: 'USD',
    timezone: 'UTC',
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      preferredCurrency: user.preferredCurrency ?? 'USD',
      timezone: user.timezone ?? 'UTC',
    })
  }, [user])

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
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
          <div>
            <p className="font-medium text-white">Plan Free</p>
            <p className="text-sm text-gray-400">5 trades/mes · Dashboard básico</p>
          </div>
          <button className="btn-primary text-sm">
            Upgrade a Pro
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Free', price: '$0', features: ['5 trades/mes', 'Dashboard básico'] },
            { name: 'Pro', price: '$9.99/mes', features: ['Trades ilimitados', 'Reportes', 'Exportar PDF/CSV'], highlight: true },
            { name: 'Elite', price: '$29.99/mes', features: ['Todo en Pro', 'API access', 'Soporte VIP'] },
          ].map(({ name, price, features, highlight }) => (
            <div key={name} className={`p-4 rounded-lg border ${highlight ? 'border-blue-600 bg-blue-950/30' : 'border-gray-700 bg-gray-900'}`}>
              <p className="font-semibold text-white">{name}</p>
              <p className="text-blue-400 font-medium mt-1">{price}</p>
              <ul className="mt-2 space-y-1">
                {features.map(f => (
                  <li key={f} className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="text-emerald-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
