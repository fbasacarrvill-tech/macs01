import { useState, useCallback, useEffect } from 'react'
import { authAPI } from '@/services/loyalty.service'

export interface Business {
  id: string
  name: string
  email: string
  phone?: string
  website?: string
  status: string
  primaryColor?: string
  secondaryColor?: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  business: Business | null
  tokens: AuthTokens | null
  loading: boolean
  error: string | null
}

/**
 * Hook for loyalty business authentication
 */
export function useLoyaltyAuth() {
  const [state, setState] = useState<AuthState>({
    business: null,
    tokens: null,
    loading: true,
    error: null
  })

  // Initialize from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('loyalty_tokens')
        const storedBusiness = localStorage.getItem('loyalty_business')

        if (storedTokens && storedBusiness) {
          const tokens = JSON.parse(storedTokens)
          const business = JSON.parse(storedBusiness)
          setState({ business, tokens, loading: false, error: null })

          // Try to refresh token silently
          try {
            const newTokens = await authAPI.refreshToken(tokens.refreshToken)
            localStorage.setItem('loyalty_tokens', JSON.stringify(newTokens.tokens))
            setState(prev => ({
              ...prev,
              tokens: newTokens.tokens,
              loading: false
            }))
          } catch {
            // Silently fail refresh, user can login again
            localStorage.removeItem('loyalty_tokens')
            localStorage.removeItem('loyalty_business')
            setState(prev => ({
              ...prev,
              tokens: null,
              business: null,
              loading: false
            }))
          }
        } else {
          setState(prev => ({
            ...prev,
            loading: false
          }))
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize authentication',
          loading: false
        }))
      }
    }

    initializeAuth()
  }, [])

  const register = useCallback(
    async (data: {
      name: string
      email: string
      password: string
      phone?: string
      website?: string
    }) => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const response = await authAPI.register(data)
        const { business, tokens } = response

        localStorage.setItem('loyalty_tokens', JSON.stringify(tokens))
        localStorage.setItem('loyalty_business', JSON.stringify(business))
        localStorage.setItem('loyalty_access_token', tokens.accessToken)

        setState({
          business,
          tokens,
          loading: false,
          error: null
        })

        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed'
        setState(prev => ({
          ...prev,
          loading: false,
          error: message
        }))
        return false
      }
    },
    []
  )

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await authAPI.login(email, password)
      const { business, tokens } = response

      localStorage.setItem('loyalty_tokens', JSON.stringify(tokens))
      localStorage.setItem('loyalty_business', JSON.stringify(business))
      localStorage.setItem('loyalty_access_token', tokens.accessToken)

      setState({
        business,
        tokens,
        loading: false,
        error: null
      })

      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('loyalty_tokens')
    localStorage.removeItem('loyalty_business')
    localStorage.removeItem('loyalty_access_token')
    setState({
      business: null,
      tokens: null,
      loading: false,
      error: null
    })
  }, [])

  const updateProfile = useCallback(async (data: Partial<Business>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await authAPI.updateProfile(data as any)
      const updatedBusiness = response as Business

      localStorage.setItem('loyalty_business', JSON.stringify(updatedBusiness))

      setState(prev => ({
        ...prev,
        business: updatedBusiness,
        loading: false,
        error: null
      }))

      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed'
      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))
      return false
    }
  }, [])

  const isAuthenticated = state.tokens !== null

  return {
    ...state,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile
  }
}
