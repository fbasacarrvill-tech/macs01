interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number        // positivo = sube, negativo = baja
  trendLabel?: string
  format?: 'currency' | 'percent' | 'number' | 'ratio'
  colorBySign?: boolean // verde si positivo, rojo si negativo
  highlight?: boolean
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  format = 'number',
  colorBySign = false,
  highlight = false,
}: MetricCardProps) {
  const formatted = formatValue(value, format)
  const isPositive = typeof value === 'number' ? value >= 0 : true
  const valueColor = colorBySign
    ? isPositive ? 'text-emerald-400' : 'text-red-400'
    : 'text-white'

  return (
    <div className={`card ${highlight ? 'border-blue-600' : ''}`}>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">{title}</p>

      <p className={`text-2xl font-bold ${valueColor} leading-none`}>
        {formatted}
      </p>

      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}

      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium
          ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d={trend >= 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
          </svg>
          <span>{Math.abs(trend).toFixed(1)}%</span>
          {trendLabel && <span className="text-gray-500">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}

function formatValue(value: string | number, format: string): string {
  if (typeof value === 'string') return value
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD',
        minimumFractionDigits: 0, maximumFractionDigits: 2,
      }).format(value)
    case 'percent':
      return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
    case 'ratio':
      return `${value.toFixed(2)}x`
    default:
      return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
}
