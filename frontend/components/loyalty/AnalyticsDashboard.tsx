'use client'

import { useState, useEffect } from 'react'
import { analyticsAPI } from '@/services/loyalty.service'

interface AnalyticsDashboardProps {
  programId: string
}

export default function AnalyticsDashboard({ programId }: AnalyticsDashboardProps) {
  const [overview, setOverview] = useState<any>(null)
  const [segmentation, setSegmentation] = useState<any>(null)
  const [roi, setRoi] = useState<any>(null)
  const [timeMetrics, setTimeMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'segmentation' | 'roi' | 'trends'>('overview')
  const [timePeriod, setTimePeriod] = useState(30)

  useEffect(() => {
    loadAnalytics()
  }, [programId, timePeriod])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [overviewData, segmentationData, roiData, timeData] = await Promise.all([
        analyticsAPI.getProgramOverview(programId).catch(() => null),
        analyticsAPI.getCustomerSegmentation(programId).catch(() => null),
        analyticsAPI.getROI(programId).catch(() => null),
        analyticsAPI.getTimeBasedMetrics(programId, timePeriod).catch(() => null)
      ])

      setOverview(overviewData)
      setSegmentation(segmentationData)
      setRoi(roiData)
      setTimeMetrics(timeData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Analytics & ROI</h2>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {(['overview', 'segmentation', 'roi', 'trends'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' && '📊 Resumen'}
              {tab === 'segmentation' && '👥 Segmentación'}
              {tab === 'roi' && '💰 ROI'}
              {tab === 'trends' && '📈 Tendencias'}
            </button>
          ))}
        </div>

        {/* Time Period Selection */}
        {activeTab === 'trends' && (
          <div className="mt-4 flex gap-2">
            {[7, 30, 90, 365].map(days => (
              <button
                key={days}
                onClick={() => setTimePeriod(days)}
                className={`px-3 py-1 rounded text-sm transition ${
                  timePeriod === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 uppercase mb-2">Total Clientes</p>
            <p className="text-3xl font-bold text-blue-600">{overview.totalCustomers}</p>
            <p className="text-xs text-gray-500 mt-2">Clientes únicos</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 uppercase mb-2">Tarjetas Activas</p>
            <p className="text-3xl font-bold text-green-600">{overview.activeCards}</p>
            <p className="text-xs text-gray-500 mt-2">
              {overview.totalCards > 0
                ? ((overview.activeCards / overview.totalCards) * 100).toFixed(1)
                : 0}
              % tasa
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 uppercase mb-2">Total Puntos</p>
            <p className="text-3xl font-bold text-purple-600">{overview.totalPoints}</p>
            <p className="text-xs text-gray-500 mt-2">En circulación</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 uppercase mb-2">Total Transacciones</p>
            <p className="text-3xl font-bold text-orange-600">{overview.totalTransactions}</p>
            <p className="text-xs text-gray-500 mt-2">Grabadas</p>
          </div>

          {/* Metrics Row */}
          <div className="md:col-span-2 bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <p className="text-sm text-blue-900 uppercase mb-2">Engagement</p>
            <p className="text-2xl font-bold text-blue-600">{overview.engagementRate}</p>
            <p className="text-xs text-blue-700 mt-2">Tarjetas activas / Total</p>
          </div>

          <div className="md:col-span-2 bg-green-50 border border-green-200 p-6 rounded-lg">
            <p className="text-sm text-green-900 uppercase mb-2">Redemption Rate</p>
            <p className="text-2xl font-bold text-green-600">{overview.redemptionRate}</p>
            <p className="text-xs text-green-700 mt-2">Canjeados / Generados</p>
          </div>
        </div>
      )}

      {/* Segmentation Tab */}
      {activeTab === 'segmentation' && segmentation && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {segmentation.segments?.map((segment: any) => (
              <div key={segment.name} className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">{segment.name}</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">{segment.count}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: segment.percentage }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{segment.percentage} del total</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROI Tab */}
      {activeTab === 'roi' && roi && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600 uppercase mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">${roi.totalRevenue}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600 uppercase mb-2">Estimated Reward Cost</p>
              <p className="text-3xl font-bold text-orange-600">${roi.estimatedRewardCost}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600 uppercase mb-2">Net Profit</p>
              <p className="text-3xl font-bold text-blue-600">${roi.netProfit}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-2 border-green-300">
              <p className="text-sm text-gray-600 uppercase mb-2">ROI</p>
              <p className="text-3xl font-bold text-green-600">{roi.roi}</p>
              <p className="text-xs text-gray-500 mt-2">Return on investment</p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
            <p className="text-sm text-purple-900 uppercase mb-2">Average Transaction Value</p>
            <p className="text-2xl font-bold text-purple-600">${roi.avgTransactionValue}</p>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && timeMetrics && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600 uppercase mb-2">Período</p>
              <p className="text-xl font-bold">{timeMetrics.period}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600 uppercase mb-2">Promedio Diario</p>
              <p className="text-xl font-bold text-blue-600">{timeMetrics.avgTransactionsPerDay} txn</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600 uppercase mb-2">Revenue Diario</p>
              <p className="text-xl font-bold text-green-600">${timeMetrics.avgRevenuePerDay}</p>
            </div>
          </div>

          {/* Daily Metrics */}
          {timeMetrics.dailyMetrics && timeMetrics.dailyMetrics.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold mb-4">Métricas Diarias</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Fecha</th>
                      <th className="text-right py-2 px-2">Transacciones</th>
                      <th className="text-right py-2 px-2">Puntos</th>
                      <th className="text-right py-2 px-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeMetrics.dailyMetrics.slice(0, 7).map((day: any) => (
                      <tr key={day.date} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{day.date}</td>
                        <td className="text-right py-2 px-2">{day.transactionCount}</td>
                        <td className="text-right py-2 px-2">{day.totalPoints}</td>
                        <td className="text-right py-2 px-2">${day.totalRevenue?.toFixed(2) || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
