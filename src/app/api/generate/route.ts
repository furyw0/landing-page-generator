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

    const { prompt, templateName } = await req.json();

    // Validation
    if (!prompt || !templateName) {
      return NextResponse.json({ error: 'Prompt ve template zorunludur' }, { status: 400 });
    }

    const userId = (session.user as any).userId;

    // Create content record first
    const content = await Content.create({
      user_id: userId,
      prompt,
      template_name: templateName,
    });

    // Trigger Inngest job with content ID
    const event = await inngest.send({
      name: 'content/generate',
      data: {
        contentId: content.id,
        prompt,
        templateName,
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
