import { LoyaltyAuthProvider } from '@/context/LoyaltyAuthContext'

export const metadata = {
  title: 'DevotioRewards - Plataforma de Lealtad Digital',
  description: 'Sistema completo de tarjetas de lealtad digital con Apple Wallet y Google Wallet',
}

export default function LoyaltyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LoyaltyAuthProvider>
      {children}
    </LoyaltyAuthProvider>
  )
}
