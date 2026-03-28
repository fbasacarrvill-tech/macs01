'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function verifyCheckout() {
      const sessionId = searchParams.get('session_id')
      if (!sessionId) {
        setStatus('error')
        setMessage('No session ID provided')
        return
      }

      try {
        const res = await api.get(`/subscriptions/checkout/${sessionId}`)
        const session = res.data.data

        if (session.payment_status === 'paid') {
          setStatus('success')
          setMessage('¡Tu suscripción ha sido activada exitosamente!')
          setTimeout(() => router.push('/settings'), 3000)
        } else {
          setStatus('error')
          setMessage('Payment was not completed')
        }
      } catch (err) {
        console.error(err)
        setStatus('error')
        setMessage('Failed to verify subscription')
      }
    }

    verifyCheckout()
  }, [searchParams, router])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="card text-center py-12">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-400">Verificando tu pago...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">¡Éxito!</h1>
            <p className="text-gray-400">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirigiendo a configuración en 3 segundos...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Error</h1>
            <p className="text-gray-400">{message}</p>
            <Link href="/settings" className="btn-primary text-sm mt-4">
              Volver a Configuración
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
