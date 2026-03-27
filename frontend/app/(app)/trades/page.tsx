'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { tradesApi, assetsApi } from '@/services/api'
import { Trade, Asset } from '@/types'

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    assetId: '',
    direction: '',
    startDate: '',
    endDate: '',
  })

  const limit = 20
  const pages = Math.ceil(total / limit)

  useEffect(() => {
    assetsApi.list().then((r) => setAssets(r.data.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    tradesApi.list({ ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), page, limit })
      .then((r) => {
        setTrades(r.data.data.items)
        setTotal(r.data.data.pagination.total)
      })
      .finally(() => setLoading(false))
  }, [filters, page])

  function setFilter(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }

  async function deleteTrade(id: string) {
    if (!confirm('¿Eliminar este trade?')) return
    await tradesApi.delete(id)
    setTrades((ts) => ts.filter((t) => t.id !== id))
    setTotal((n) => n - 1)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Trades</h1>
          <p className="text-sm text-gray-400">{total} operaciones registradas</p>
        </div>
        <Link href="/trades/new" className="btn-primary text-sm">+ Nuevo Trade</Link>
      </div>

      {/* Filters */}
      <div className="card mb-5">
        <div className="flex flex-wrap gap-3">
          <select className="input w-auto text-sm" value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="OPEN">Abiertos</option>
            <option value="CLOSED">Cerrados</option>
          </select>

          <select className="input w-auto text-sm" value={filters.assetId}
            onChange={(e) => setFilter('assetId', e.target.value)}>
            <option value="">Todos los activos</option>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.symbol}</option>)}
          </select>

          <select className="input w-auto text-sm" value={filters.direction}
            onChange={(e) => setFilter('direction', e.target.value)}>
            <option value="">Long & Short</option>
            <option value="LONG">Solo Long</option>
            <option value="SHORT">Solo Short</option>
          </select>

          <input type="date" className="input w-auto text-sm" value={filters.startDate}
            onChange={(e) => setFilter('startDate', e.target.value)} />
          <input type="date" className="input w-auto text-sm" value={filters.endDate}
            onChange={(e) => setFilter('endDate', e.target.value)} />

          {Object.values(filters).some(Boolean) && (
            <button className="btn-secondary text-sm"
              onClick={() => setFilters({ status: '', assetId: '', direction: '', startDate: '', endDate: '' })}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700/50 rounded animate-pulse" />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">No hay trades con estos filtros</p>
            <Link href="/trades/new" className="btn-primary text-sm">
              + Registrar trade
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
                    <th className="text-left pb-3 pr-4">Fecha</th>
                    <th className="text-left pb-3 pr-4">Activo</th>
                    <th className="text-left pb-3 pr-4">Dirección</th>
                    <th className="text-right pb-3 pr-4">Entrada</th>
                    <th className="text-right pb-3 pr-4">Salida</th>
                    <th className="text-right pb-3 pr-4">Qty</th>
                    <th className="text-right pb-3 pr-4">P&L</th>
                    <th className="text-right pb-3 pr-4">ROI</th>
                    <th className="text-right pb-3 pr-4">R/R</th>
                    <th className="text-right pb-3">Estado</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {trades.map((t) => {
                    const pl = t.profitLoss != null ? Number(t.profitLoss) : null
                    const roi = t.roi != null ? Number(t.roi) : null
                    const rr = t.riskRewardRatio != null ? Number(t.riskRewardRatio) : null
                    return (
                      <tr key={t.id} className="hover:bg-gray-800/50 transition-colors group">
                        <td className="py-3 pr-4 text-gray-300">
                          {new Date(t.entryDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-white">{t.asset.symbol}</td>
                        <td className="py-3 pr-4">
                          <span className={t.direction === 'LONG' ? 'badge-long' : 'badge-short'}>
                            {t.direction}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right text-gray-300">${Number(t.entryPrice).toLocaleString()}</td>
                        <td className="py-3 pr-4 text-right text-gray-300">
                          {t.exitPrice ? `$${Number(t.exitPrice).toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-right text-gray-400">
                          {Number(t.entryQuantity).toLocaleString()}
                        </td>
                        <td className={`py-3 pr-4 text-right font-medium ${pl == null ? 'text-gray-400' : pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pl != null ? `${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}` : '—'}
                        </td>
                        <td className={`py-3 pr-4 text-right ${roi == null ? 'text-gray-400' : roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {roi != null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%` : '—'}
                        </td>
                        <td className={`py-3 pr-4 text-right ${rr == null ? 'text-gray-400' : rr >= 2 ? 'text-emerald-400' : rr >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {rr != null ? `${rr.toFixed(1)}:1` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className={t.status === 'OPEN' ? 'badge-open' : 'badge-closed'}>
                            {t.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/trades/${t.id}`}
                              className="p-1 text-gray-400 hover:text-white" title="Ver detalle">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.071-5.929A10 10 0 0121.071 18.07" />
                              </svg>
                            </Link>
                            <button onClick={() => deleteTrade(t.id)}
                              className="p-1 text-gray-400 hover:text-red-400" title="Eliminar">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Página {page} de {pages} ({total} trades)
                </p>
                <div className="flex gap-2">
                  <button className="btn-secondary text-sm py-1" disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}>Anterior</button>
                  <button className="btn-secondary text-sm py-1" disabled={page === pages}
                    onClick={() => setPage(p => p + 1)}>Siguiente</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
