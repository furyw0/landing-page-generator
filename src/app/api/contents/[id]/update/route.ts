import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Content from '@/lib/models/Content';
import { blobService } from '@/lib/services/blob.service';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { htmlContent } = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'HTML content gerekli' }, { status: 400 });
    }

    const { id } = await params;
    const userId = (session.user as any).userId;

    const content = await Content.findByIdAndUserId(id, userId);

    if (!content) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    if (!content.html_url) {
      return NextResponse.json({ error: 'HTML URL bulunamadı' }, { status: 400 });
    }

    // Update blob
    const fileName = `landing-page-${id}.html`;
    const newBlobUrl = await blobService.update(content.html_url, htmlContent, fileName);

    // Update database
    await Content.updateById(id, {
      html_url: newBlobUrl,
    });

    return NextResponse.json({
      message: 'İçerik güncellendi',
      blobUrl: newBlobUrl,
    });
  } catch (error: any) {
    console.error('Update content error:', error);
    return NextResponse.json({ error: 'İçerik güncellenirken hata oluştu' }, { status: 500 });
  }
}
