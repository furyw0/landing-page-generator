import { sql } from '@vercel/postgres';

/**
 * Vercel Postgres Database Connection
 * Otomatik olarak POSTGRES_URL environment variable'ını kullanır
 */

// Veritabanı tablolarını oluşturmak için migration fonksiyonu
export async function createTables() {
  try {
    // Users tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        openai_api_key TEXT,
        selected_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Email için index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    // Contents tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS contents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        keyword VARCHAR(500) NOT NULL,
        derived_keywords TEXT[], -- PostgreSQL array
        main_url TEXT NOT NULL,
        hreflang_url TEXT NOT NULL,
        template_id VARCHAR(50) NOT NULL,
        generated_content JSONB, -- JSON binary format
        blob_url TEXT,
        blob_filename VARCHAR(500),
        status VARCHAR(50) DEFAULT 'generating',
        error TEXT,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Contents için indexler
    await sql`
      CREATE INDEX IF NOT EXISTS idx_contents_user_id ON contents(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);
    `;

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Updated_at trigger fonksiyonu (PostgreSQL)
export async function createUpdateTrigger() {
  try {
    // Trigger fonksiyonu oluştur
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // Users tablosu için trigger
    await sql`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    `;

    await sql`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `;

    // Contents tablosu için trigger
    await sql`
      DROP TRIGGER IF EXISTS update_contents_updated_at ON contents;
    `;

    await sql`
      CREATE TRIGGER update_contents_updated_at
      BEFORE UPDATE ON contents
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `;

    console.log('✅ Update triggers created successfully');
  } catch (error) {
    console.error('❌ Error creating triggers:', error);
    throw error;
  }
}

// Test connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export { sql };

