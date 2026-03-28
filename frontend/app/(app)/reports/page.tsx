'use client'

import { useState } from 'react'
import Link from 'next/link'
import { reportsApi } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface Report {
  period: { startDate: string; endDate: string; days: number }
  summary: {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    totalProfitLoss: number
    roi: number
    monthlyROI: number
  }
  performance: {
    averageWin: number
    averageLoss: number
    profitFactor: number
    expectancy: number
    maxConsecutiveWins: number
    maxConsecutiveLosses: number
  }
}

export default function ReportsPage() {
  const { addToast } = useToast()
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function loadReport() {
    setLoading(true)
    try {
      const r = await reportsApi.summary(startDate, endDate)
      setReport(r.data.data)
      addToast('Reporte cargado exitosamente', 'success')
    } catch {
      addToast('Error al cargar el reporte', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function exportCSV() {
    setExporting(true)
    try {
      const r = await reportsApi.exportCSV(startDate, endDate)
      const url = window.URL.createObjectURL(r.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trades-${startDate}-${endDate}.csv`
      a.click()
      addToast('CSV descargado', 'success')
    } catch {
      addToast('Error al descargar CSV', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Reportes</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="label">Desde</label>
            <input type="date" className="input" value={startDate}
              onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="label">Hasta</label>
            <input type="date" className="input" value={endDate}
              onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button onClick={loadReport} className="btn-primary whitespace-nowrap" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Generar'}
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="card">
              <p className="text-xs text-gray-400 uppercase mb-2">Total Trades</p>
              <p className="text-2xl font-bold text-white">{report.summary.totalTrades}</p>
              <p className="text-xs text-gray-500 mt-1">
                {report.summary.winningTrades}W / {report.summary.losingTrades}L
              </p>
            </div>

            <div className="card">
              <p className="text-xs text-gray-400 uppercase mb-2">Win Rate</p>
              <p className="text-2xl font-bold text-emerald-400">{report.summary.winRate.toFixed(1)}%</p>
            </div>

            <div className="card">
              <p className="text-xs text-gray-400 uppercase mb-2">Total P&L</p>
              <p className={`text-2xl font-bold ${report.summary.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {report.summary.totalProfitLoss >= 0 ? '+' : ''}${report.summary.totalProfitLoss.toFixed(2)}
              </p>
            </div>

            <div className="card">
              <p className="text-xs text-gray-400 uppercase mb-2">ROI</p>
              <p className={`text-2xl font-bold ${report.summary.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {report.summary.roi >= 0 ? '+' : ''}{report.summary.roi.toFixed(2)}%
              </p>
            </div>

            <div className="card">
              <p className="text-xs text-gray-400 uppercase mb-2">Monthly ROI</p>
              <p className={`text-2xl font-bold ${report.summary.monthlyROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {report.summary.monthlyROI >= 0 ? '+' : ''}{report.summary.monthlyROI.toFixed(2)}%
              </p>
            </div>

            <div className="card">
              <p className="text-xs text-gray-400 uppercase mb-2">Profit Factor</p>
              <p className={`text-2xl font-bold ${report.performance.profitFactor >= 1.5 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {report.performance.profitFactor.toFixed(2)}x
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Métricas Principales</h2>
              <div className="space-y-3 text-sm">
                <Row label="Promedio Ganadores" value={`$${report.performance.averageWin.toFixed(2)}`} />
                <Row label="Promedio Perdedores" value={`$${report.performance.averageLoss.toFixed(2)}`} />
                <Row label="Expectancy" value={`$${report.performance.expectancy.toFixed(2)}`} />
                <Row label="Max Wins Consecutivos" value={`${report.performance.maxConsecutiveWins}`} />
                <Row label="Max Losses Consecutivos" value={`${report.performance.maxConsecutiveLosses}`} />
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-white mb-4">Período</h2>
              <div className="space-y-3 text-sm">
                <Row label="Desde" value={report.period.startDate} />
                <Row label="Hasta" value={report.period.endDate} />
                <Row label="Días" value={`${report.period.days} días`} />
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700">
                <button onClick={exportCSV} className="btn-secondary w-full text-sm" disabled={exporting}>
                  {exporting ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Descargando...
                    </span>
                  ) : (
                    '📥 Descargar CSV'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="card text-sm text-gray-400 bg-blue-900/20 border border-blue-700">
            <p>
              💡 Estos reportes incluyen un análisis completo de tu performance en el período seleccionado.
              Puedes descargar los datos en CSV para análisis adicional.
            </p>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="card text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Selecciona un período y genera el reporte</p>
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
