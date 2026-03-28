interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  actions?: { label: string; onClick: () => void; variant?: 'primary' | 'danger' | 'secondary' }[]
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4 animate-fade-in">
      <div className={`bg-gray-800 border border-gray-700 rounded-xl ${SIZE_MAP[size]} w-full`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {actions && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className={action.variant === 'danger' ? 'btn-danger' : action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
