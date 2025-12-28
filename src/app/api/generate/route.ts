import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Content from '@/lib/models/Content';
import { inngest } from '@/lib/inngest/client';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyword, mainUrl, hreflangUrl, templateId } = await req.json();

    // Validation
    if (!keyword || !mainUrl || !hreflangUrl || !templateId) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    await connectDB();

    // Create content record
    const content = await Content.create({
      userId: (session.user as any).userId,
      keyword,
      mainUrl,
      hreflangUrl,
      templateId,
      status: 'generating',
    });

    // Trigger Inngest job
    await inngest.send({
      name: 'content.generate',
      data: {
        contentId: content._id.toString(),
        keyword,
        mainUrl,
        hreflangUrl,
        templateId,
        userId: (session.user as any).userId,
      },
    });

    return NextResponse.json({
      contentId: content._id,
      status: 'generating',
      message: 'İçerik üretimi başlatıldı',
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'İçerik üretimi başlatılamadı' }, { status: 500 });
  }
}

