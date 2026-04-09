'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useLoyaltyAuth, AuthState } from '@/hooks/useLoyaltyAuth'

interface LoyaltyAuthContextType extends AuthState {
  register: (data: any) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: any) => Promise<boolean>
  isAuthenticated: boolean
}

const LoyaltyAuthContext = createContext<LoyaltyAuthContextType | undefined>(undefined)

export function LoyaltyAuthProvider({ children }: { children: ReactNode }) {
  const auth = useLoyaltyAuth()

  return (
    <LoyaltyAuthContext.Provider value={auth}>
      {children}
    </LoyaltyAuthContext.Provider>
  )
}

export function useLoyaltyAuthContext() {
  const context = useContext(LoyaltyAuthContext)
  if (!context) {
    throw new Error('useLoyaltyAuthContext must be used within LoyaltyAuthProvider')
  }
  return context
}
