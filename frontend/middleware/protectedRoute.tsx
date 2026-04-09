'use client'

import { ReactNode } from 'react'
import { useLoyaltyAuthContext } from '@/context/LoyaltyAuthContext'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'business' | 'customer'
}

/**
 * Wrapper component to protect routes from unauthenticated access
 */
export function ProtectedRoute({ children, requiredRole = 'business' }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useLoyaltyAuthContext()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Acceso Requerido</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder a esta página</p>
          <Link href="/loyalty/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
            Ir a Login
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * HOC to wrap a page component with authentication protection
 */
export function withLoyaltyAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'business' | 'customer'
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
