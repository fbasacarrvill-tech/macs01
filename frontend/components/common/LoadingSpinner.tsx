interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  label?: string
}

const SIZE_MAP = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
}

export default function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  label,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${SIZE_MAP[size]} border-gray-600 border-t-blue-500 rounded-full animate-spin`} />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}
