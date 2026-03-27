'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { tradesApi, assetsApi, strategiesApi } from '@/services/api'
import { Asset, Strategy, TradeDirection } from '@/types'

export default function NewTradePage() {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    assetId: '',
    strategyId: '',
    direction: 'LONG' as TradeDirection,
    entryDate: new Date().toISOString().split('T')[0],
    entryTime: '',
    entryPrice: '',
    entryQuantity: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    tags: '',
  })

  useEffect(() => {
    Promise.all([assetsApi.list(), strategiesApi.list()]).then(([a, s]) => {
      setAssets(a.data.data)
      setStrategies(s.data.data)
    })
  }, [])

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Cálculos en tiempo real
  const entry = parseFloat(form.entryPrice) || 0
  const qty = parseFloat(form.entryQuantity) || 0
  const sl = parseFloat(form.stopLoss) || 0
  const tp = parseFloat(form.takeProfit) || 0
  const isLong = form.direction === 'LONG'

  const risk = sl > 0 ? (isLong ? (entry - sl) * qty : (sl - entry) * qty) : 0
  const reward = tp > 0 ? (isLong ? (tp - entry) * qty : (entry - tp) * qty) : 0
  const rr = risk > 0 ? reward / risk : 0

  const rrColor = rr >= 2 ? 'text-emerald-400' : rr >= 1 ? 'text-yellow-400' : 'text-red-400'
  const rrLabel = rr >= 2 ? 'Excelente' : rr >= 1 ? 'Aceptable' : rr > 0 ? 'Bajo' : ''

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.assetId || !form.entryPrice || !form.entryQuantity) {
      setError('Activo, precio de entrada y cantidad son obligatorios')
      return
    }
    setSaving(true)
    try {
      await tradesApi.create({
        assetId: form.assetId,
        strategyId: form.strategyId || undefined,
        direction: form.direction,
        entryDate: form.entryDate,
        entryTime: form.entryTime || undefined,
        entryPrice: parseFloat(form.entryPrice),
        entryQuantity: parseFloat(form.entryQuantity),
        stopLoss: sl || undefined,
        takeProfit: tp || undefined,
        notes: form.notes || undefined,
        tags: form.tags || undefined,
      })
      router.push('/trades')
    } catch {
      setError('Error al guardar el trade. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/trades" className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">Nuevo Trade</h1>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Entry Info */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Información de Entrada</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Activo *</label>
              <select className="input" value={form.assetId} onChange={(e) => set('assetId', e.target.value)} required>
                <option value="">Seleccionar activo...</option>
                {(['STOCK', 'FOREX', 'CRYPTO', 'COMMODITY'] as const).map((type) => {
                  const filtered = assets.filter(a => a.assetType === type)
                  if (filtered.length === 0) return null
                  return (
                    <optgroup key={type} label={type}>
                      {filtered.map(a => <option key={a.id} value={a.id}>{a.symbol} — {a.name}</option>)}
                    </optgroup>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="label">Estrategia</label>
              <select className="input" value={form.strategyId} onChange={(e) => set('strategyId', e.target.value)}>
                <option value="">Sin estrategia</option>
                {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Dirección *</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-600">
                {(['LONG', 'SHORT'] as const).map((d) => (
                  <button key={d} type="button"
                    onClick={() => set('direction', d)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors
                      ${form.direction === d
                        ? d === 'LONG' ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Fecha *</label>
              <input type="date" className="input" value={form.entryDate}
                onChange={(e) => set('entryDate', e.target.value)} required />
            </div>

            <div>
              <label className="label">Hora</label>
              <input type="time" className="input" value={form.entryTime}
                onChange={(e) => set('entryTime', e.target.value)} />
            </div>

            <div>
              <label className="label">Precio de entrada *</label>
              <input type="number" step="any" className="input" placeholder="0.00"
                value={form.entryPrice} onChange={(e) => set('entryPrice', e.target.value)} required />
            </div>

            <div>
              <label className="label">Cantidad *</label>
              <input type="number" step="any" className="input" placeholder="0"
                value={form.entryQuantity} onChange={(e) => set('entryQuantity', e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Gestión de Riesgo</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Stop Loss</label>
              <input type="number" step="any" className="input" placeholder="Precio stop loss"
                value={form.stopLoss} onChange={(e) => set('stopLoss', e.target.value)} />
            </div>
            <div>
              <label className="label">Take Profit</label>
              <input type="number" step="any" className="input" placeholder="Precio take profit"
                value={form.takeProfit} onChange={(e) => set('takeProfit', e.target.value)} />
            </div>
          </div>

          {(risk > 0 || reward > 0) && (
            <div className="bg-gray-900 rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-0.5">Riesgo</p>
                <p className="text-red-400 font-semibold">${risk.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Reward</p>
                <p className="text-emerald-400 font-semibold">${reward.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Ratio R/R</p>
                <p className={`font-semibold ${rrColor}`}>
                  {rr > 0 ? `${rr.toFixed(1)}:1` : '—'}{' '}
                  {rrLabel && <span className="text-xs font-normal">{rrLabel}</span>}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Notas</h2>
          <textarea className="input resize-none" rows={3} placeholder="Razón de entrada, observaciones..."
            value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          <div className="mt-3">
            <label className="label">Tags</label>
            <input className="input" placeholder="breakout, support, trend (separados por coma)"
              value={form.tags} onChange={(e) => set('tags', e.target.value)} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/trades" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </span>
            ) : 'Guardar Trade'}
          </button>
        </div>
      </form>
    </div>
  )
}
