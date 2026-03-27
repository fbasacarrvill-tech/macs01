'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { tradesApi } from '@/services/api'
import { Trade, TradeStatus } from '@/types'

export default function TradeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [closeForm, setCloseForm] = useState({
    exitDate: new Date().toISOString().split('T')[0],
    exitTime: '',
    exitPrice: '',
  })

  useEffect(() => {
    tradesApi.get(id)
      .then((r) => setTrade(r.data.data))
      .finally(() => setLoading(false))
  }, [id])

  async function handleClose(e: FormEvent) {
    e.preventDefault()
    if (!closeForm.exitPrice) return
    setClosing(true)
    try {
      const r = await tradesApi.update(id, {
        exitDate: closeForm.exitDate,
        exitTime: closeForm.exitTime || undefined,
        exitPrice: parseFloat(closeForm.exitPrice),
        exitQuantity: Number(trade?.entryQuantity),
        status: 'CLOSED' as TradeStatus,
      })
      setTrade(r.data.data)
      setShowCloseForm(false)
    } finally {
      setClosing(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este trade?')) return
    await tradesApi.delete(id)
    router.push('/trades')
  }

  if (loading) return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-32" />)}
    </div>
  )

  if (!trade) return (
    <div className="p-6 text-center text-gray-400">
      <p>Trade no encontrado</p>
      <Link href="/trades" className="text-blue-400 mt-2 inline-block">← Volver</Link>
    </div>
  )

  const pl = trade.profitLoss != null ? Number(trade.profitLoss) : null
  const roi = trade.roi != null ? Number(trade.roi) : null
  const rr = trade.riskRewardRatio != null ? Number(trade.riskRewardRatio) : null
  const isOpen = trade.status === 'OPEN'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/trades" className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {trade.asset.symbol}
              <span className={trade.direction === 'LONG' ? 'badge-long' : 'badge-short'}>
                {trade.direction}
              </span>
              <span className={isOpen ? 'badge-open' : 'badge-closed'}>
                {isOpen ? 'Abierto' : 'Cerrado'}
              </span>
            </h1>
            <p className="text-sm text-gray-400">{trade.asset.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isOpen && (
            <button onClick={() => setShowCloseForm(!showCloseForm)} className="btn-primary text-sm">
              Cerrar Trade
            </button>
          )}
          <button onClick={handleDelete} className="btn-danger text-sm">Eliminar</button>
        </div>
      </div>

      {/* Close Form (inline) */}
      {showCloseForm && (
        <div className="card mb-5 border-blue-600">
          <h2 className="text-sm font-semibold text-blue-400 mb-4">Cerrar Trade</h2>
          <form onSubmit={handleClose} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="label">Fecha salida</label>
              <input type="date" className="input w-auto" value={closeForm.exitDate}
                onChange={(e) => setCloseForm(f => ({ ...f, exitDate: e.target.value }))} />
            </div>
            <div>
              <label className="label">Hora</label>
              <input type="time" className="input w-auto" value={closeForm.exitTime}
                onChange={(e) => setCloseForm(f => ({ ...f, exitTime: e.target.value }))} />
            </div>
            <div>
              <label className="label">Precio de salida *</label>
              <input type="number" step="any" className="input w-36" placeholder="0.00" required
                value={closeForm.exitPrice}
                onChange={(e) => setCloseForm(f => ({ ...f, exitPrice: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm" disabled={closing}>
                {closing ? 'Cerrando...' : 'Confirmar'}
              </button>
              <button type="button" className="btn-secondary text-sm"
                onClick={() => setShowCloseForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* P&L Highlight */}
      {pl != null && (
        <div className={`card mb-5 border ${pl >= 0 ? 'border-emerald-700 bg-emerald-950/20' : 'border-red-700 bg-red-950/20'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Resultado</p>
              <p className={`text-3xl font-bold mt-1 ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {pl >= 0 ? '+' : ''}${pl.toFixed(2)}
              </p>
            </div>
            {roi != null && (
              <div className="text-right">
                <p className="text-sm text-gray-400">ROI</p>
                <p className={`text-2xl font-bold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trade Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Entrada</h2>
          <div className="space-y-2.5 text-sm">
            <Row label="Fecha" value={new Date(trade.entryDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} />
            {trade.entryTime && <Row label="Hora" value={trade.entryTime} />}
            <Row label="Precio" value={`$${Number(trade.entryPrice).toLocaleString()}`} />
            <Row label="Cantidad" value={Number(trade.entryQuantity).toLocaleString()} />
            {trade.strategy && <Row label="Estrategia" value={trade.strategy.name} />}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            {isOpen ? 'Salida Planeada' : 'Salida'}
          </h2>
          <div className="space-y-2.5 text-sm">
            {trade.exitDate
              ? <Row label="Fecha" value={new Date(trade.exitDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} />
              : <Row label="Fecha" value="—" />}
            {trade.exitTime && <Row label="Hora" value={trade.exitTime} />}
            <Row label="Precio" value={trade.exitPrice ? `$${Number(trade.exitPrice).toLocaleString()}` : '—'} />
            <Row label="Cantidad" value={trade.exitQuantity ? Number(trade.exitQuantity).toLocaleString() : '—'} />
          </div>
        </div>
      </div>

      {/* Risk */}
      <div className="card mb-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Gestión de Riesgo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Stop Loss</p>
            <p className="text-white font-medium">{trade.stopLoss ? `$${Number(trade.stopLoss).toLocaleString()}` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Take Profit</p>
            <p className="text-white font-medium">{trade.takeProfit ? `$${Number(trade.takeProfit).toLocaleString()}` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Riesgo</p>
            <p className="text-red-400 font-medium">{trade.riskAmount ? `$${Number(trade.riskAmount).toFixed(2)}` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Ratio R/R</p>
            <p className={`font-medium ${rr == null ? 'text-gray-400' : rr >= 2 ? 'text-emerald-400' : rr >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
              {rr != null ? `${rr.toFixed(1)}:1` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(trade.notes || trade.tags) && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Notas</h2>
          {trade.notes && <p className="text-gray-300 text-sm leading-relaxed mb-3">{trade.notes}</p>}
          {trade.tags && (
            <div className="flex flex-wrap gap-1.5">
              {trade.tags.split(',').map((tag) => (
                <span key={tag.trim()} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 font-medium">{value}</span>
    </div>
  )
}
