import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/lib/models/User';
import { encrypt, decrypt } from '@/lib/crypto';
import OpenAI from 'openai';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { openaiApiKey, selectedModel } = await req.json();

    if (!openaiApiKey) {
      return NextResponse.json({ error: 'API key gerekli' }, { status: 400 });
    }

    // Validate API key with OpenAI
    try {
      const openai = new OpenAI({ apiKey: openaiApiKey });
      await openai.models.list(); // Test API key
    } catch (error) {
      return NextResponse.json({ error: 'Geçersiz OpenAI API key' }, { status: 400 });
    }

    // Encrypt and save API key
    const encryptedKey = encrypt(openaiApiKey);

    const user = await User.updateById(
      (session.user as any).userId,
      {
        openai_api_key: encryptedKey,
        selected_model: selectedModel || 'gpt-4o-mini',
      }
    );

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Ayarlar başarıyla kaydedildi',
      selectedModel: user.selected_model,
    });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Ayarlar güncellenirken hata oluştu' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById((session.user as any).userId);

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      hasApiKey: !!user.openai_api_key,
      selectedModel: user.selected_model || 'gpt-4o-mini',
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Ayarlar alınırken hata oluştu' }, { status: 500 });
  }
}

