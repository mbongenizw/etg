#!/usr/bin/env bun

const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_JkiAXB53ZgVG@ep-ancient-forest-ai8b913y-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function connect() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to Neon database!\n');

    // Get all tables
    const result = await client.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND column_default IS NOT NULL) as has_defaults
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📊 Database Tables:');
    console.log('='.repeat(80));
    
    if (result.rows.length === 0) {
      console.log('⚠️  No tables found. You may need to run prisma db push or prisma migrate deploy');
    } else {
      console.table(result.rows);
    }
    
    console.log('\n');

    // Show recent table info
    result.rows.forEach((row: any) => {
      console.log(`\n📋 Table: ${row.table_name}`);
      console.log('   Columns:', row.column_count);
      console.log('   Has defaults:', row.has_defaults);
    });

  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify the DATABASE_URL is correct');
    console.error('2. Check if your Neon database is active');
    console.error('3. Ensure SSL mode is enabled (sslmode=require)');
  } finally {
    await client.end();
  }
}

connect();
