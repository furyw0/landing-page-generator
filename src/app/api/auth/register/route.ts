import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı' }, { status: 400 });
    }

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu email zaten kullanılıyor' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({
      message: 'Kayıt başarılı',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Kayıt sırasında hata oluştu' }, { status: 500 });
  }
}

