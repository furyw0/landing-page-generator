import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    const userId = (session.user as any).userId;

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Mevcut şifre hatalı' }, { status: 401 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updateById(userId, { password: hashedPassword });

    return NextResponse.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Şifre değiştirilemedi' }, { status: 500 });
  }
}

