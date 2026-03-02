import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Check if admin user exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@etg.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@etg.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'Admin',
      isActive: true,
    },
  });

  console.log('Admin user created:', admin.email);

  // Create default settings
  const settings = [
    { key: 'company_name', value: 'ETG Vehicle Management', description: 'Company name' },
    { key: 'company_address', value: '', description: 'Company address' },
    { key: 'company_phone', value: '', description: 'Company phone' },
    { key: 'company_email', value: '', description: 'Company email' },
    { key: 'fuel_price_per_liter', value: '1.50', description: 'Default fuel price per liter' },
    { key: 'currency', value: 'USD', description: 'Default currency' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('Default settings created');
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
