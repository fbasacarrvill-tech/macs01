interface Column<T> {
  key: keyof T
  label: string
  format?: (value: any, item: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  actions?: { label: string; icon?: string; onClick: (item: T) => void }[]
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  emptyMessage = 'No hay datos',
  onRowClick,
  actions,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-700/30 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`pb-3 pr-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="pb-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`hover:bg-gray-800/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''} group`}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`py-3 pr-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.format ? col.format(item[col.key], item) : String(item[col.key])}
                </td>
              ))}
              {actions && (
                <td className="py-3">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); action.onClick(item) }}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title={action.label}
                      >
                        {action.icon ? action.icon : action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
