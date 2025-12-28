/**
 * Vercel Postgres Migration Script
 * Database tablolarını oluşturur ve trigger'ları ayarlar
 * 
 * Kullanım:
 * npm run migrate
 * veya
 * tsx scripts/migrate.ts
 */

import { createTables, createUpdateTrigger, testConnection } from '../src/lib/db';

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  try {
    // 1. Bağlantı testi
    console.log('1️⃣ Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    console.log('');

    // 2. Tabloları oluştur
    console.log('2️⃣ Creating tables...');
    await createTables();
    console.log('');

    // 3. Trigger'ları oluştur
    console.log('3️⃣ Creating update triggers...');
    await createUpdateTrigger();
    console.log('');

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Created tables:');
    console.log('   - users');
    console.log('   - contents\n');
    console.log('🔧 Created triggers:');
    console.log('   - update_users_updated_at');
    console.log('   - update_contents_updated_at\n');
    console.log('🎉 Your database is ready to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Script çalıştır
runMigration();

