import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Assets ──────────────────────────────────────────────────────────────────
  const assets = [
    // Stocks
    { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'STOCK', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', assetType: 'STOCK', exchange: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', assetType: 'STOCK', exchange: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla Inc.', assetType: 'STOCK', exchange: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', assetType: 'STOCK', exchange: 'NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', assetType: 'STOCK', exchange: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms Inc.', assetType: 'STOCK', exchange: 'NASDAQ' },
    { symbol: 'SPY', name: 'S&P 500 ETF', assetType: 'STOCK', exchange: 'NYSE' },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', assetType: 'STOCK', exchange: 'NASDAQ' },
    // Forex
    { symbol: 'EURUSD', name: 'Euro / US Dollar', assetType: 'FOREX', exchange: 'FX' },
    { symbol: 'GBPUSD', name: 'British Pound / US Dollar', assetType: 'FOREX', exchange: 'FX' },
    { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', assetType: 'FOREX', exchange: 'FX' },
    { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', assetType: 'FOREX', exchange: 'FX' },
    { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', assetType: 'FOREX', exchange: 'FX' },
    // Crypto
    { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', assetType: 'CRYPTO', exchange: 'CRYPTO' },
    { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', assetType: 'CRYPTO', exchange: 'CRYPTO' },
    { symbol: 'SOLUSD', name: 'Solana / US Dollar', assetType: 'CRYPTO', exchange: 'CRYPTO' },
    // Commodities
    { symbol: 'XAUUSD', name: 'Gold / US Dollar', assetType: 'COMMODITY', exchange: 'COMEX' },
    { symbol: 'XAGUSD', name: 'Silver / US Dollar', assetType: 'COMMODITY', exchange: 'COMEX' },
    { symbol: 'WTI', name: 'West Texas Intermediate Crude Oil', assetType: 'COMMODITY', exchange: 'NYMEX' },
  ]

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { symbol: asset.symbol },
      update: {},
      create: asset,
    })
  }

  console.log(`✅ ${assets.length} assets seeded`)

  // ── Subscription Tiers ──────────────────────────────────────────────────────
  const tiers = [
    {
      name: 'free',
      price: 0,
      billingPeriod: 'monthly',
      tradesPerMonth: 5,
      features: JSON.stringify([
        'basic_dashboard',
        'trade_log',
        'basic_metrics',
      ]),
    },
    {
      name: 'pro',
      price: 9.99,
      billingPeriod: 'monthly',
      tradesPerMonth: null,
      features: JSON.stringify([
        'basic_dashboard',
        'trade_log',
        'advanced_metrics',
        'charts',
        'reports',
        'csv_export',
        'pdf_export',
        'alerts',
        'unlimited_strategies',
      ]),
    },
    {
      name: 'elite',
      price: 29.99,
      billingPeriod: 'monthly',
      tradesPerMonth: null,
      features: JSON.stringify([
        'basic_dashboard',
        'trade_log',
        'advanced_metrics',
        'charts',
        'reports',
        'csv_export',
        'pdf_export',
        'alerts',
        'unlimited_strategies',
        'api_access',
        'custom_alerts',
        'priority_support',
        'white_label',
      ]),
    },
  ]

  for (const tier of tiers) {
    await prisma.subscriptionTier.upsert({
      where: { name: tier.name },
      update: {},
      create: tier,
    })
  }

  console.log(`✅ ${tiers.length} subscription tiers seeded`)
  console.log('🌱 Seeding complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
