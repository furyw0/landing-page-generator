import { createTables, createUpdateTrigger } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { encrypt } from '@/lib/crypto';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.MIGRATION_SECRET || 'change-me-in-production';
    
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting database migration...');
    
    // 1. Create tables
    await createTables();
    console.log('✅ Tables created');
    
    // 2. Create triggers
    await createUpdateTrigger();
    console.log('✅ Triggers created');
    
    // 3. Create admin user
    const adminEmail = 'admin@landinggen.com';
    
    // Check if admin already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${adminEmail}
    `;
    
    if (existing.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      await sql`
        INSERT INTO users (name, email, password, role, selected_model)
        VALUES ('Admin User', ${adminEmail}, ${hashedPassword}, 'admin', 'gpt-4o-mini')
      `;
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Database migration completed successfully',
      tables: ['users', 'contents'],
      triggers: ['update_users_updated_at', 'update_contents_updated_at'],
      adminCredentials: {
        email: 'admin@landinggen.com',
        password: 'Admin123!',
        note: 'Please change password after first login!'
      }
    });
  } catch (error: any) {
    console.error('❌ Migration error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

