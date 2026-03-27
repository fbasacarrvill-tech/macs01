'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ReferenceLine } from 'recharts'
import { analyticsApi } from '@/services/api'
import { AnalyticsSummary, AssetPerformance, EquityPoint, Period } from '@/types'
import MetricCard from '@/components/dashboard/MetricCard'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
  { value: 'all', label: 'Todo' },
]

const TABS = ['Resumen', 'Por Activo', 'Por Estrategia', 'Drawdown']

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [tab, setTab] = useState(0)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [byAsset, setByAsset] = useState<AssetPerformance[]>([])
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      analyticsApi.summary(period),
      analyticsApi.byAsset(period),
      analyticsApi.equityCurve(),
    ]).then(([s, a, e]) => {
      setSummary(s.data.data)
      setByAsset(a.data.data)
      setEquityCurve(e.data.data)
    }).finally(() => setLoading(false))
  }, [period])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <div className="flex bg-gray-800 rounded-lg p-0.5">
          {PERIODS.map(({ value, label }) => (
            <button key={value} onClick={() => setPeriod(value)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors
                ${period === value ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 p-1 rounded-lg mb-6 w-fit">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors
              ${tab === i ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* TAB 0: Resumen */}
          {tab === 0 && summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total P&L" value={summary.performance.profitLoss} format="currency" colorBySign />
                <MetricCard title="Win Rate" value={summary.performance.winRate} format="percent" colorBySign />
                <MetricCard title="Profit Factor" value={summary.performance.profitFactor} format="ratio" />
                <MetricCard title="Expectancy" value={summary.performance.expectancy} format="currency" colorBySign subtitle="Por trade" />
                <MetricCard title="Avg Win" value={summary.performance.averageWin} format="currency" colorBySign />
                <MetricCard title="Avg Loss" value={Math.abs(summary.performance.averageLoss)} format="currency" subtitle="Pérdida promedio" />
                <MetricCard title="Sharpe Ratio" value={summary.risk.sharpeRatio} format="ratio" />
                <MetricCard title="Sortino Ratio" value={summary.risk.sortinoRatio} format="ratio" />
              </div>

              {/* Win Rate Pie */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card">
                  <h2 className="font-semibold text-white mb-4">Distribución de Trades</h2>
                  <div className="flex items-center gap-6">
                    <PieChart width={160} height={160}>
                      <Pie data={[
                        { name: 'Ganadores', value: summary.trades.winning },
                        { name: 'Perdedores', value: summary.trades.losing },
                        { name: 'Abiertos', value: summary.trades.open },
                      ]} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                        <Cell fill="#3B82F6" />
                      </Pie>
                    </PieChart>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: 'Ganadores', value: summary.trades.winning, color: 'bg-emerald-500' },
                        { label: 'Perdedores', value: summary.trades.losing, color: 'bg-red-500' },
                        { label: 'Abiertos', value: summary.trades.open, color: 'bg-blue-500' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                          <span className="text-gray-400">{label}:</span>
                          <span className="text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2 className="font-semibold text-white mb-4">Rachas</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Max wins consecutivos</span>
                        <span className="text-emerald-400 font-semibold">{summary.performance.consecutiveWins}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, summary.performance.consecutiveWins * 10)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Max losses consecutivos</span>
                        <span className="text-red-400 font-semibold">{summary.performance.consecutiveLosses}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full"
                          style={{ width: `${Math.min(100, summary.performance.consecutiveLosses * 10)}%` }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Trades totales</span>
                        <span className="text-white font-semibold">{summary.trades.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Por Activo */}
          {tab === 1 && (
            <div className="space-y-5">
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
                      <th className="text-left pb-3 pr-6">Activo</th>
                      <th className="text-right pb-3 pr-6">Trades</th>
                      <th className="text-right pb-3 pr-6">Win Rate</th>
                      <th className="text-right pb-3 pr-6">P&L Total</th>
                      <th className="text-right pb-3 pr-6">Avg Win</th>
                      <th className="text-right pb-3">Profit Factor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {byAsset.sort((a, b) => b.totalProfitLoss - a.totalProfitLoss).map((a) => (
                      <tr key={a.symbol} className="hover:bg-gray-800/40">
                        <td className="py-3 pr-6">
                          <p className="font-semibold text-white">{a.symbol}</p>
                          <p className="text-xs text-gray-500">{a.assetType}</p>
                        </td>
                        <td className="py-3 pr-6 text-right">
                          <span className="text-gray-300">{a.totalTrades}</span>
                          <span className="text-xs text-gray-500 ml-1">({a.winningTrades}W/{a.losingTrades}L)</span>
                        </td>
                        <td className={`py-3 pr-6 text-right font-medium ${a.winRate >= 60 ? 'text-emerald-400' : a.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {a.winRate.toFixed(1)}%
                        </td>
                        <td className={`py-3 pr-6 text-right font-medium ${a.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {a.totalProfitLoss >= 0 ? '+' : ''}${a.totalProfitLoss.toFixed(2)}
                        </td>
                        <td className="py-3 pr-6 text-right text-gray-300">${a.averageWin.toFixed(2)}</td>
                        <td className={`py-3 text-right font-medium ${a.profitFactor >= 2 ? 'text-emerald-400' : a.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {a.profitFactor.toFixed(2)}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <h2 className="font-semibold text-white mb-4">P&L por Activo</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={byAsset.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="symbol" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(v: number) => [`$${v.toFixed(2)}`, 'P&L']}
                    />
                    <Bar dataKey="totalProfitLoss" radius={4}>
                      {byAsset.slice(0, 10).map((entry, i) => (
                        <Cell key={i} fill={entry.totalProfitLoss >= 0 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: Por Estrategia */}
          {tab === 2 && (
            <div className="card text-center py-10 text-gray-400">
              <p className="text-sm">Analytics por estrategia disponible en V1.0</p>
            </div>
          )}

          {/* TAB 3: Drawdown */}
          {tab === 3 && equityCurve.length > 0 && (
            <div className="space-y-5">
              {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard title="Drawdown Actual" value={summary.risk.currentDrawdown} format="percent" colorBySign />
                  <MetricCard title="Max Drawdown" value={summary.risk.maxDrawdown} format="percent" colorBySign />
                  <MetricCard title="Sharpe Ratio" value={summary.risk.sharpeRatio} format="ratio" />
                </div>
              )}
              <div className="card">
                <h2 className="font-semibold text-white mb-4">Drawdown Histórico</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(d) => new Date(d).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${v.toFixed(0)}%`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(v: number) => [`${v.toFixed(2)}%`, 'Drawdown']} />
                    <ReferenceLine y={0} stroke="#4B5563" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="drawdown" stroke="#EF4444" strokeWidth={2} dot={false}
                      activeDot={{ r: 4, fill: '#EF4444' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
