/**
 * Loyalty Module API Service
 * Handles all communication with the backend loyalty API
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const LOYALTY_BASE = `${API_BASE}/loyalty`

/**
 * Get authorization token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('loyalty_access_token')
}

/**
 * Make API request with authorization
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` })
  }

  const response = await fetch(`${LOYALTY_BASE}${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API request failed')
  }

  return response.json()
}

// ============ AUTH ============

export const authAPI = {
  register: (data: {
    name: string
    email: string
    password: string
    phone?: string
    website?: string
  }) =>
    makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (email: string, password: string) =>
    makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  refreshToken: (refreshToken: string) =>
    makeRequest('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    }),

  getProfile: () =>
    makeRequest('/auth/me'),

  updateProfile: (data: {
    name?: string
    phone?: string
    website?: string
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
  }) =>
    makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  createApiKey: (name: string) =>
    makeRequest('/auth/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name })
    }),

  listApiKeys: () =>
    makeRequest('/auth/api-keys'),

  deleteApiKey: (keyId: string) =>
    makeRequest(`/auth/api-keys/${keyId}`, { method: 'DELETE' })
}

// ============ PROGRAMS ============

export const programAPI = {
  create: (data: {
    name: string
    description?: string
    type: string
    currencyCode?: string
    pointsName?: string
    pointsPerDollar?: number
    minPointsRedeemable?: number
    expirationDays?: number
    logoUrl?: string
    backgroundColor?: string
    foregroundColor?: string
    accentColor?: string
  }) =>
    makeRequest('/programs', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  list: (filters?: { type?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.type) params.append('type', filters.type)
      if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive))
      if (filters.page) params.append('page', String(filters.page))
      if (filters.limit) params.append('limit', String(filters.limit))
    }
    return makeRequest(`/programs?${params.toString()}`)
  },

  get: (programId: string) =>
    makeRequest(`/programs/${programId}`),

  update: (programId: string, data: any) =>
    makeRequest(`/programs/${programId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (programId: string) =>
    makeRequest(`/programs/${programId}`, { method: 'DELETE' }),

  publish: (programId: string) =>
    makeRequest(`/programs/${programId}/publish`, { method: 'POST' }),

  createTier: (programId: string, data: any) =>
    makeRequest(`/programs/${programId}/tiers`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getTiers: (programId: string) =>
    makeRequest(`/programs/${programId}/tiers`),

  getAnalytics: (programId: string) =>
    makeRequest(`/programs/${programId}/analytics`)
}

// ============ CUSTOMERS ============

export const customerAPI = {
  create: (data: any) =>
    makeRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  list: (filters?: { programId?: string; search?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.programId) params.append('programId', filters.programId)
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', String(filters.page))
      if (filters.limit) params.append('limit', String(filters.limit))
    }
    return makeRequest(`/customers?${params.toString()}`)
  },

  get: (customerId: string) =>
    makeRequest(`/customers/${customerId}`),

  update: (customerId: string, data: any) =>
    makeRequest(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  enrollInProgram: (customerId: string, programId: string) =>
    makeRequest(`/customers/${customerId}/programs/${programId}/enroll`, {
      method: 'POST'
    }),

  unenrollFromProgram: (customerId: string, programId: string) =>
    makeRequest(`/customers/${customerId}/programs/${programId}`, {
      method: 'DELETE'
    }),

  getCards: (customerId: string, programId: string) =>
    makeRequest(`/customers/${customerId}/programs/${programId}/cards`),

  bulkImport: (customers: any[]) =>
    makeRequest('/customers/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ customers })
    })
}

// ============ CARDS ============

export const cardAPI = {
  create: (data: any) =>
    makeRequest('/cards', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  get: (cardId: string) =>
    makeRequest(`/cards/${cardId}`),

  getByCode: (code: string) =>
    makeRequest(`/cards/code/${code}`),

  listByProgram: (programId: string, filters?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.page) params.append('page', String(filters.page))
      if (filters.limit) params.append('limit', String(filters.limit))
    }
    return makeRequest(`/programs/${programId}/cards?${params.toString()}`)
  },

  addStamp: (cardId: string) =>
    makeRequest(`/cards/${cardId}/stamp`, { method: 'POST' }),

  addPoints: (cardId: string, points: number, description?: string) =>
    makeRequest(`/cards/${cardId}/points`, {
      method: 'POST',
      body: JSON.stringify({ points, description })
    }),

  redeem: (cardId: string, points: number, description?: string) =>
    makeRequest(`/cards/${cardId}/redeem`, {
      method: 'POST',
      body: JSON.stringify({ points, description })
    }),

  updateStatus: (cardId: string, status: string) =>
    makeRequest(`/cards/${cardId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  addToWallet: (cardId: string, walletType: 'APPLE' | 'GOOGLE') =>
    makeRequest(`/cards/${cardId}/add-to-wallet`, {
      method: 'POST',
      body: JSON.stringify({ walletType })
    })
}

// ============ TRANSACTIONS ============

export const transactionAPI = {
  get: (transactionId: string) =>
    makeRequest(`/transactions/${transactionId}`),

  listByCard: (cardId: string, filters?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.page) params.append('page', String(filters.page))
      if (filters.limit) params.append('limit', String(filters.limit))
    }
    return makeRequest(`/cards/${cardId}/transactions?${params.toString()}`)
  },

  listByCustomer: (customerId: string, filters?: { programId?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.programId) params.append('programId', filters.programId)
      if (filters.page) params.append('page', String(filters.page))
      if (filters.limit) params.append('limit', String(filters.limit))
    }
    return makeRequest(`/customers/${customerId}/transactions?${params.toString()}`)
  },

  listByProgram: (programId: string, filters?: { type?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.type) params.append('type', filters.type)
      if (filters.page) params.append('page', String(filters.page))
      if (filters.limit) params.append('limit', String(filters.limit))
    }
    return makeRequest(`/programs/${programId}/transactions?${params.toString()}`)
  },

  scan: (code: string, location?: string, latitude?: number, longitude?: number) =>
    makeRequest('/scan', {
      method: 'POST',
      body: JSON.stringify({ code, location, latitude, longitude })
    }),

  processPurchase: (code: string, amount: number, description?: string) =>
    makeRequest('/purchase', {
      method: 'POST',
      body: JSON.stringify({ code, amount, description })
    })
}

// ============ ANALYTICS ============

export const analyticsAPI = {
  getProgramOverview: (programId: string) =>
    makeRequest(`/analytics/programs/${programId}/overview`),

  getTimeBasedMetrics: (programId: string, days?: number) => {
    const params = new URLSearchParams()
    if (days) params.append('days', String(days))
    return makeRequest(`/analytics/programs/${programId}/time-based?${params.toString()}`)
  },

  getCustomerSegmentation: (programId: string) =>
    makeRequest(`/analytics/programs/${programId}/segmentation`),

  getROI: (programId: string) =>
    makeRequest(`/analytics/programs/${programId}/roi`),

  getCustomerAnalytics: (customerId: string, programId?: string) => {
    const params = new URLSearchParams()
    if (programId) params.append('programId', programId)
    return makeRequest(`/analytics/customers/${customerId}?${params.toString()}`)
  }
}

// ============ WALLET ============

export const walletAPI = {
  getApplePass: (cardId: string) =>
    fetch(`${LOYALTY_BASE}/wallet/apple/${cardId}`).then(r => r.json()),

  getGoogleWalletJWT: (cardId: string) =>
    fetch(`${LOYALTY_BASE}/wallet/google/${cardId}`).then(r => r.json()),

  getPassData: (cardId: string) =>
    fetch(`${LOYALTY_BASE}/wallet/pass/${cardId}`).then(r => r.json()),

  getStatus: () =>
    fetch(`${LOYALTY_BASE}/wallet/status`).then(r => r.json())
}

// ============ NOTIFICATIONS ============

export const notificationAPI = {
  createCampaign: (data: any) =>
    makeRequest('/notifications/campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  sendCampaign: (campaignId: string) =>
    makeRequest(`/notifications/campaigns/${campaignId}/send`, {
      method: 'POST'
    }),

  getCampaignStats: (campaignId: string) =>
    makeRequest(`/notifications/campaigns/${campaignId}/stats`),

  sendLocationNotification: (data: any) =>
    makeRequest('/notifications/location', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  sendToCustomer: (customerId: string, data: any) =>
    makeRequest(`/customers/${customerId}/notifications`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  registerPushToken: (customerId: string, token: string, platform: string) =>
    makeRequest(`/customers/${customerId}/push-tokens`, {
      method: 'POST',
      body: JSON.stringify({ token, platform })
    }),

  testSend: (customerId: string) =>
    makeRequest(`/customers/${customerId}/notifications/test`, {
      method: 'POST'
    })
}
