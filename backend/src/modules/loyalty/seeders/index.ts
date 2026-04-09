import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed function to populate initial data
 * Run with: npx ts-node -P tsconfig.json backend/src/modules/loyalty/seeders/index.ts
 */
async function main() {
  try {
    console.log('🌱 Starting loyalty module seeding...')

    // Check if data already exists
    const existingProgram = await prisma.loyaltyProgram.findFirst()
    if (existingProgram) {
      console.log('⚠️  Data already seeded, skipping...')
      return
    }

    // Create sample business
    console.log('📦 Creating sample business...')
    const business = await prisma.business.create({
      data: {
        name: 'Demo Coffee Shop',
        email: 'demo@coffeeshop.com',
        phone: '+1-555-0123',
        website: 'https://coffeeshop.example.com',
        logoUrl: 'https://via.placeholder.com/200',
        primaryColor: '#8B4513',
        secondaryColor: '#D2B48C',
        status: 'ACTIVE',
        isEmailVerified: true
      }
    })
    console.log(`✅ Business created: ${business.name} (${business.id})`)

    // Create sample loyalty programs
    console.log('📋 Creating sample loyalty programs...')

    const stampsProgram = await prisma.loyaltyProgram.create({
      data: {
        businessId: business.id,
        name: 'Buy 10, Get 1 Free',
        description: 'Collect stamps with every purchase. Buy 10 coffee, get 1 free!',
        type: 'STAMPS',
        currencyCode: 'USD',
        pointsName: 'Stamps',
        pointsPerDollar: 1.0,
        minPointsRedeemable: 10,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#8B4513',
        accentColor: '#D2B48C',
        isActive: true
      }
    })
    console.log(`✅ STAMPS program created: ${stampsProgram.name}`)

    const cashbackProgram = await prisma.loyaltyProgram.create({
      data: {
        businessId: business.id,
        name: 'Cash Back Rewards',
        description: 'Earn 5% cashback on every purchase',
        type: 'CASHBACK',
        currencyCode: 'USD',
        pointsName: 'Points',
        pointsPerDollar: 1.0,
        minPointsRedeemable: 100,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#2E7D32',
        accentColor: '#66BB6A',
        isActive: true
      }
    })
    console.log(`✅ CASHBACK program created: ${cashbackProgram.name}`)

    const membershipProgram = await prisma.loyaltyProgram.create({
      data: {
        businessId: business.id,
        name: 'VIP Membership',
        description: 'Join our VIP club for exclusive benefits',
        type: 'MEMBERSHIP',
        currencyCode: 'USD',
        pointsName: 'Status Points',
        pointsPerDollar: 1.0,
        minPointsRedeemable: 50,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#FFD700',
        accentColor: '#FFC700',
        isActive: true
      }
    })
    console.log(`✅ MEMBERSHIP program created: ${membershipProgram.name}`)

    // Create tiers for MEMBERSHIP program
    console.log('🏆 Creating membership tiers...')

    await prisma.loyaltyTier.create({
      data: {
        programId: membershipProgram.id,
        name: 'Silver',
        requiredPoints: 0,
        discount: 5,
        color: '#C0C0C0'
      }
    })

    await prisma.loyaltyTier.create({
      data: {
        programId: membershipProgram.id,
        name: 'Gold',
        requiredPoints: 100,
        discount: 10,
        color: '#FFD700'
      }
    })

    await prisma.loyaltyTier.create({
      data: {
        programId: membershipProgram.id,
        name: 'Platinum',
        requiredPoints: 250,
        discount: 15,
        color: '#E5E4E2'
      }
    })

    console.log(`✅ Membership tiers created`)

    // Create sample customers
    console.log('👥 Creating sample customers...')

    const customer1 = await prisma.customer.create({
      data: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0100',
        country: 'US',
        state: 'CA',
        city: 'San Francisco',
        zipCode: '94102',
        language: 'en',
        timeZone: 'America/Los_Angeles',
        notificationsOptIn: true,
        isActive: true
      }
    })
    console.log(`✅ Customer created: ${customer1.email}`)

    const customer2 = await prisma.customer.create({
      data: {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1-555-0101',
        country: 'US',
        state: 'NY',
        city: 'New York',
        zipCode: '10001',
        language: 'en',
        timeZone: 'America/New_York',
        notificationsOptIn: true,
        isActive: true
      }
    })
    console.log(`✅ Customer created: ${customer2.email}`)

    // Enroll customers in programs
    console.log('📝 Enrolling customers in programs...')

    await prisma.customerProgram.create({
      data: {
        customerId: customer1.id,
        programId: stampsProgram.id
      }
    })

    await prisma.customerProgram.create({
      data: {
        customerId: customer1.id,
        programId: membershipProgram.id
      }
    })

    await prisma.customerProgram.create({
      data: {
        customerId: customer2.id,
        programId: cashbackProgram.id
      }
    })

    console.log(`✅ Customers enrolled in programs`)

    // Create sample loyalty cards
    console.log('🎫 Creating sample loyalty cards...')

    const card1 = await prisma.loyaltyCard.create({
      data: {
        programId: stampsProgram.id,
        customerId: customer1.id,
        cardNumber: 'CARD-' + Math.random().toString(36).substring(2, 15).toUpperCase(),
        barcode: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        qrCode: 'qr-' + Math.random().toString(36).substring(2, 15),
        status: 'ACTIVE',
        points: 5,
        totalPointsEarned: 5,
        totalPointsRedeemed: 0,
        issuedAt: new Date()
      }
    })
    console.log(`✅ Card created for STAMPS program`)

    const card2 = await prisma.loyaltyCard.create({
      data: {
        programId: membershipProgram.id,
        customerId: customer1.id,
        cardNumber: 'CARD-' + Math.random().toString(36).substring(2, 15).toUpperCase(),
        barcode: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        qrCode: 'qr-' + Math.random().toString(36).substring(2, 15),
        status: 'ACTIVE',
        points: 120,
        totalPointsEarned: 120,
        totalPointsRedeemed: 0,
        issuedAt: new Date()
      }
    })
    console.log(`✅ Card created for MEMBERSHIP program`)

    // Create sample transactions
    console.log('💳 Creating sample transactions...')

    await prisma.transaction.create({
      data: {
        cardId: card1.id,
        customerId: customer1.id,
        programId: stampsProgram.id,
        type: 'PURCHASE',
        points: 5,
        amount: 25.00,
        description: 'Coffee purchases',
        pointsBalance: 5
      }
    })

    await prisma.transaction.create({
      data: {
        cardId: card2.id,
        customerId: customer1.id,
        programId: membershipProgram.id,
        type: 'BONUS',
        points: 120,
        description: 'Sign-up bonus',
        pointsBalance: 120
      }
    })

    console.log(`✅ Transactions created`)

    // Create program analytics
    console.log('📊 Creating program analytics...')

    await prisma.programAnalytics.createMany({
      data: [
        {
          programId: stampsProgram.id,
          totalCustomers: 1,
          activeCards: 1,
          totalPoints: 5,
          totalPointsRedeemed: 0,
          totalScans: 0,
          totalTransactions: 1,
          avgPointsPerCustomer: 5
        },
        {
          programId: cashbackProgram.id,
          totalCustomers: 1,
          activeCards: 0,
          totalPoints: 0,
          totalPointsRedeemed: 0,
          totalScans: 0,
          totalTransactions: 0,
          avgPointsPerCustomer: 0
        },
        {
          programId: membershipProgram.id,
          totalCustomers: 1,
          activeCards: 1,
          totalPoints: 120,
          totalPointsRedeemed: 0,
          totalScans: 0,
          totalTransactions: 1,
          avgPointsPerCustomer: 120
        }
      ],
      skipDuplicates: true
    })

    console.log(`✅ Program analytics created`)

    console.log('\n✨ Seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`  - 1 Business created`)
    console.log(`  - 3 Programs created (STAMPS, CASHBACK, MEMBERSHIP)`)
    console.log(`  - 3 Membership tiers created`)
    console.log(`  - 2 Customers created`)
    console.log(`  - 2 Loyalty cards created`)
    console.log(`  - 2 Transactions created`)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
