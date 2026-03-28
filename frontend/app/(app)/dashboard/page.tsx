'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import MetricCard from '@/components/dashboard/MetricCard'
import { analyticsApi, tradesApi } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { AnalyticsSummary, EquityPoint, Trade, Period } from '@/types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Hoy' },
  { value: 'week', label: '7 días' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
  { value: 'all', label: 'Todo' },
]

export default function DashboardPage() {
  const { addToast } = useToast()
  const [period, setPeriod] = useState<Period>('month')
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [equity, setEquity] = useState<EquityPoint[]>([])
  const [recentTrades, setRecentTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [summaryRes, equityRes, tradesRes] = await Promise.all([
          analyticsApi.summary(period),
          analyticsApi.equityCurve(),
          tradesApi.list({ limit: 5, sort: '-entryDate' }),
        ])
        setSummary(summaryRes.data.data)
        setEquity(equityRes.data.data)
        setRecentTrades(tradesRes.data.data.items)
      } catch (err) {
        console.error(err)
        addToast('Error al cargar el dashboard', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period, addToast])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">Resumen de tu performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-800 rounded-lg p-0.5">
            {PERIODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors
                  ${period === value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <Link href="/trades/new" className="btn-primary text-sm">
            + Nuevo Trade
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-3 bg-gray-700 rounded w-20 mb-3" />
              <div className="h-7 bg-gray-700 rounded w-28" />
            </div>
          ))}
        </div>
      ) : summary && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total P&L"
              value={summary.performance.profitLoss}
              format="currency"
              colorBySign
              subtitle={`${summary.trades.total} trades`}
            />
            <MetricCard
              title="Win Rate"
              value={summary.performance.winRate}
              format="percent"
              colorBySign
              subtitle={`${summary.trades.winning}W / ${summary.trades.losing}L`}
            />
            <MetricCard
              title="ROI"
              value={summary.capital.roi}
              format="percent"
              colorBySign
              subtitle={`Capital: $${summary.capital.current.toLocaleString()}`}
            />
            <MetricCard
              title="Profit Factor"
              value={summary.performance.profitFactor}
              format="ratio"
              subtitle={summary.performance.profitFactor >= 1.5 ? 'Excelente' : summary.performance.profitFactor >= 1 ? 'Positivo' : 'Negativo'}
            />
            <MetricCard
              title="Drawdown Actual"
              value={summary.risk.currentDrawdown}
              format="percent"
              colorBySign
              subtitle={`Máx: ${summary.risk.maxDrawdown.toFixed(1)}%`}
            />
            <MetricCard
              title="Avg Win / Avg Loss"
              value={`$${summary.performance.averageWin.toFixed(0)} / $${Math.abs(summary.performance.averageLoss).toFixed(0)}`}
              subtitle="Promedio por trade"
            />
            <MetricCard
              title="Expectancy"
              value={summary.performance.expectancy}
              format="currency"
              colorBySign
              subtitle="Por trade"
            />
            <MetricCard
              title="Sharpe Ratio"
              value={summary.risk.sharpeRatio}
              format="ratio"
              subtitle={summary.risk.sharpeRatio >= 1 ? 'Bueno' : 'Bajo'}
            />
          </div>

          {/* Equity Curve */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Curva de Capital</h2>
              <Link href="/analytics" className="text-sm text-blue-400 hover:text-blue-300">
                Ver análisis completo →
              </Link>
            </div>
            {equity.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={equity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    tickFormatter={(d) => new Date(d).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9CA3AF', fontSize: 12 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Capital']}
                    labelFormatter={(d) => new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  />
                  <ReferenceLine y={summary.capital.initial} stroke="#4B5563" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="capital"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </>
      )}

      {/* Recent Trades */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Trades Recientes</h2>
          <Link href="/trades" className="text-sm text-blue-400 hover:text-blue-300">
            Ver todos →
          </Link>
        </div>
        {recentTrades.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">No hay trades registrados aún</p>
            <Link href="/trades/new" className="btn-primary text-sm mt-4 inline-block">
              + Registrar primer trade
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
                  <th className="text-left pb-3 pr-4">Fecha</th>
                  <th className="text-left pb-3 pr-4">Activo</th>
                  <th className="text-left pb-3 pr-4">Tipo</th>
                  <th className="text-right pb-3 pr-4">Entrada</th>
                  <th className="text-right pb-3 pr-4">Salida</th>
                  <th className="text-right pb-3 pr-4">P&L</th>
                  <th className="text-right pb-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentTrades.map((t) => (
                  <Link key={t.id} href={`/trades/${t.id}`} legacyBehavior>
                    <tr className="hover:bg-gray-800/50 cursor-pointer transition-colors">
                      <td className="py-3 pr-4 text-gray-300">
                        {new Date(t.entryDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 pr-4 font-medium text-white">{t.asset.symbol}</td>
                      <td className="py-3 pr-4">
                        <span className={t.direction === 'LONG' ? 'badge-long' : 'badge-short'}>
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-gray-300">
                        ${Number(t.entryPrice).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right text-gray-300">
                        {t.exitPrice ? `$${Number(t.exitPrice).toLocaleString()}` : '—'}
                      </td>
                      <td className={`py-3 pr-4 text-right font-medium
                        ${t.profitLoss == null ? 'text-gray-400'
                          : Number(t.profitLoss) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.profitLoss != null
                          ? `${Number(t.profitLoss) >= 0 ? '+' : ''}$${Number(t.profitLoss).toFixed(2)}`
                          : '—'}
                      </td>
                      <td className="py-3 text-right">
                        <span className={t.status === 'OPEN' ? 'badge-open' : 'badge-closed'}>
                          {t.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
                        </span>
                      </td>
                    </tr>
                  </Link>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-52 flex flex-col items-center justify-center text-gray-500">
      <svg className="w-12 h-12 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
      <p className="text-sm">Sin datos para mostrar</p>
    </div>
  )
}
