/**
 * Utility functions for Loyalty module
 */

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  })
  return formatter.format(amount)
}

// Format percentage
export function formatPercentage(value: number | string): string {
  if (typeof value === 'string') return value
  return (value * 100).toFixed(2) + '%'
}

// Get program icon
export function getProgramIcon(type: string): string {
  const icons: Record<string, string> = {
    STAMPS: '🎫',
    CASHBACK: '💰',
    AFFINITY: '❤️',
    DISCOUNT: '🏷️',
    COUPON: '🎁',
    GIFT: '🎀',
    MEMBERSHIP: '⭐',
    MULTIPASS: '🎟️'
  }
  return icons[type] || '🎫'
}

// Get program label
export function getProgramLabel(type: string): string {
  const labels: Record<string, string> = {
    STAMPS: 'Sellos',
    CASHBACK: 'Cashback',
    AFFINITY: 'Afiliación',
    DISCOUNT: 'Descuento',
    COUPON: 'Cupón',
    GIFT: 'Regalo',
    MEMBERSHIP: 'Membresía',
    MULTIPASS: 'Multipase'
  }
  return labels[type] || type
}

// Format date
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-700'
    case 'PAUSED':
      return 'bg-yellow-100 text-yellow-700'
    case 'EXPIRED':
      return 'bg-gray-100 text-gray-700'
    case 'REDEEMED':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// Get transaction type icon
export function getTransactionIcon(type: string): string {
  const icons: Record<string, string> = {
    PURCHASE: '🛍️',
    BONUS: '🎁',
    REDEMPTION: '🎟️',
    ADJUSTMENT: '⚙️',
    EXPIRATION: '⏰'
  }
  return icons[type] || '📝'
}

// Calculate days until expiration
export function getDaysUntilExpiration(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const today = new Date()
  const expiration = new Date(expiresAt)
  const diff = expiration.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 3600 * 24))
}

// Check if card is expired
export function isCardExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date() > new Date(expiresAt)
}

// Generate mock QR code (simplified)
export function generateQRCodeImage(text: string, size: number = 200): string {
  // In production, would use qrcode library
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
}

// Truncate string
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}

// Format card number (mask)
export function maskCardNumber(cardNumber: string): string {
  const parts = cardNumber.split('-')
  if (parts.length !== 5) return cardNumber
  return `${parts[0]}-${parts[1]}-****-****-${parts[4]}`
}

// Validate email
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Validate currency amount
export function isValidAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return !isNaN(num) && num > 0
}

// Get greeting based on time
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

// Get card type badge
export function getCardTypeBadge(type: string): { icon: string; label: string; color: string } {
  const badges: Record<string, { icon: string; label: string; color: string }> = {
    STAMPS: { icon: '🎫', label: 'Sellos', color: 'bg-blue-100' },
    CASHBACK: { icon: '💰', label: 'Cashback', color: 'bg-green-100' },
    AFFINITY: { icon: '❤️', label: 'Afiliación', color: 'bg-red-100' },
    DISCOUNT: { icon: '🏷️', label: 'Descuento', color: 'bg-yellow-100' },
    COUPON: { icon: '🎁', label: 'Cupón', color: 'bg-pink-100' },
    GIFT: { icon: '🎀', label: 'Regalo', color: 'bg-purple-100' },
    MEMBERSHIP: { icon: '⭐', label: 'Membresía', color: 'bg-indigo-100' },
    MULTIPASS: { icon: '🎟️', label: 'Multipase', color: 'bg-cyan-100' }
  }
  return badges[type] || { icon: '🎫', label: type, color: 'bg-gray-100' }
}

// Parse CSV-like text into array of objects
export function parseCSVCustomers(text: string): Array<{
  email: string
  firstName: string
  lastName: string
  phone: string
}> {
  const lines = text.trim().split('\n')
  return lines.map(line => {
    const [email, firstName, lastName, phone] = line.split(',').map(s => s.trim())
    return { email, firstName, lastName, phone }
  })
}

// Sort options helper
export function sortOptions() {
  return [
    { value: 'created-desc', label: 'Más recientes primero' },
    { value: 'created-asc', label: 'Más antiguos primero' },
    { value: 'points-desc', label: 'Más puntos primero' },
    { value: 'points-asc', label: 'Menos puntos primero' },
    { value: 'name-asc', label: 'Nombre A-Z' },
    { value: 'name-desc', label: 'Nombre Z-A' }
  ]
}

// Filter options helper
export function filterOptions() {
  return [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'expired', label: 'Expirados' }
  ]
}

// API error handler
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  return 'Algo salió mal. Intenta de nuevo.'
}
