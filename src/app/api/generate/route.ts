import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Content from '@/lib/models/Content';
import { inngest } from '@/lib/inngest/client';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteName, mainUrl, hreflangUrl, templateId } = await req.json();

    // Validation
    if (!siteName || !mainUrl || !hreflangUrl || !templateId) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    const userId = (session.user as any).userId;

    // Create content record first
    const content = await Content.create({
      user_id: userId,
      prompt: siteName, // siteName -> prompt mapping
      template_name: templateId, // templateId -> template_name mapping
      main_url: mainUrl,
      hreflang_url: hreflangUrl,
    });

    // Trigger Inngest job with content ID
    const event = await inngest.send({
      name: 'content.generate',
      data: {
        contentId: content.id,
        siteName,
        mainUrl,
        hreflangUrl,
        templateId,
        userId,
      },
    });

    // Update with inngest event ID
    await Content.updateById(content.id, {
      inngest_event_id: event.ids[0],
    });

    return NextResponse.json({
      contentId: content.id,
      status: 'generating',
      message: 'İçerik üretimi başlatıldı',
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'İçerik üretimi başlatılamadı' }, { status: 500 });
  }
}
