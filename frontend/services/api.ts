import axios, { AxiosInstance } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

function createClient(): AxiosInstance {
  const client = axios.create({ baseURL: BASE_URL })

  client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (r) => r,
    async (error) => {
      const original = error.config
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
          localStorage.setItem('accessToken', data.data.accessToken)
          original.headers.Authorization = `Bearer ${data.data.accessToken}`
          return client(original)
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/auth/login'
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const api = createClient()

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
}

// ─── Trades ──────────────────────────────────────────────────────────────────

export const tradesApi = {
  list: (params?: Record<string, unknown>) => api.get('/trades', { params }),
  get: (id: string) => api.get(`/trades/${id}`),
  create: (data: unknown) => api.post('/trades', data),
  update: (id: string, data: unknown) => api.put(`/trades/${id}`, data),
  delete: (id: string) => api.delete(`/trades/${id}`),
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export const analyticsApi = {
  summary: (period = 'month') => api.get('/analytics/summary', { params: { period } }),
  byAsset: (period = 'month') => api.get('/analytics/by-asset', { params: { period } }),
  byStrategy: (period = 'month') => api.get('/analytics/by-strategy', { params: { period } }),
  equityCurve: () => api.get('/analytics/equity-curve'),
  drawdown: () => api.get('/analytics/drawdown'),
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export const assetsApi = {
  list: (params?: { search?: string; type?: string }) =>
    api.get('/assets', { params }),
}

// ─── Strategies ──────────────────────────────────────────────────────────────

export const strategiesApi = {
  list: () => api.get('/strategies'),
  create: (data: unknown) => api.post('/strategies', data),
  update: (id: string, data: unknown) => api.put(`/strategies/${id}`, data),
  delete: (id: string) => api.delete(`/strategies/${id}`),
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reportsApi = {
  summary: (startDate?: string, endDate?: string) =>
    api.get('/reports/summary', { params: { startDate, endDate } }),
  exportCSV: (startDate?: string, endDate?: string) =>
    api.get('/reports/export/csv', {
      params: { startDate, endDate },
      responseType: 'blob' as const,
    }),
  exportPDF: (startDate?: string, endDate?: string) =>
    api.get('/reports/export/pdf', { params: { startDate, endDate } }),
}
