const { Client } = require('pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = 'postgresql://neondb_owner:npg_JkiAXB53ZgVG@ep-ancient-forest-ai8b913y-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function checkPrisma() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database via Prisma\n');

    // Get all models from schema
    const prisma = new PrismaClient({
      datasourceUrl: connectionString,
    });

    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;

    console.log('📊 Tables in database:');
    tables.forEach((table: any) => {
      console.log(`   - ${table.table_name}`);
    });

    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPrisma();
