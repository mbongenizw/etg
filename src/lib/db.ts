import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Initialize admin user if no users exist
let initializationPromise: Promise<void> | null = null

export async function ensureAdminUser() {
  if (!initializationPromise) {
    initializationPromise = initializeAdminUser()
  }
  await initializationPromise
}

async function initializeAdminUser() {
  try {
    const userCount = await db.user.count()
    
    if (userCount === 0) {
      console.log('No users found. Creating default admin user...')
      
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await db.user.create({
        data: {
          username: 'admin',
          email: 'admin@etg.com',
          password: hashedPassword,
          fullName: 'System Administrator',
          role: 'Admin',
          isActive: true,
        },
      })
      
      console.log('Default admin user created: admin@etg.com')
      
      // Create default settings
      const settings = [
        { key: 'company_name', value: 'ETG Vehicle Management', description: 'Company name' },
        { key: 'company_address', value: '', description: 'Company address' },
        { key: 'company_phone', value: '', description: 'Company phone' },
        { key: 'company_email', value: '', description: 'Company email' },
        { key: 'fuel_price_per_liter', value: '1.50', description: 'Default fuel price per liter' },
        { key: 'currency', value: 'USD', description: 'Default currency' },
      ]

      for (const setting of settings) {
        await db.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: setting,
        })
      }
      
      console.log('Default settings created')
    }
  } catch (error) {
    console.error('Error initializing admin user:', error)
  }
}

// Auto-initialize on startup
ensureAdminUser()
